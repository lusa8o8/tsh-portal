require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const http = require('http');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const secret = process.env.JWT_SECRET || 'tsh_super_secret_jwt_key_2026';

function getToken(role, id) {
    return jwt.sign({ id, email: `${role}@tsh.com`, name: `Test ${role}`, role }, secret, { expiresIn: '24h' });
}

async function req(path, method = 'GET', body = null, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const options = { hostname: 'localhost', port: 3001, path, method, headers: { 'Authorization': `Bearer ${token}` } };
        if (body) { options.headers['Content-Type'] = 'application/json'; options.headers['Content-Length'] = Buffer.byteLength(data); }
        const r = http.request(options, res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(b || '{}') }); } catch (e) { resolve({ status: res.statusCode, data: b }); } }); });
        r.on('error', reject);
        if (body) r.write(data);
        r.end();
    });
}

(async () => {
    let client;
    try {
        client = await pool.connect();
        const usersRes = await client.query("SELECT id, role FROM users WHERE role IN ('tutor','hod','content_manager') ORDER BY role");
        const users = {};
        usersRes.rows.forEach(u => users[u.role] = u.id);

        const tutorToken = getToken('tutor', users.tutor);
        const hodToken = getToken('hod', users.hod);
        const cmToken = getToken('content_manager', users.content_manager);

        await client.query("DELETE FROM notifications WHERE asset_id IN (SELECT id FROM hub_assets WHERE topic LIKE 'E2E%')");
        await client.query("DELETE FROM hub_assets WHERE topic LIKE 'E2E%'");

        // --- FREE ASSET FLOW ---
        console.log('--- FREE ASSET FLOW ---');
        const f = await req('/api/assets', 'POST', [{ subject: 'Biology', topic: 'E2E Debug Free', asset_type: 'recording', drive_link: 'https://d.com/' + Date.now(), asset_category: 'free_asset' }], tutorToken);
        console.log('Upload:', f.status, JSON.stringify(f.data).substring(0, 200));
        const fid = f.data.assets?.[0]?.id;

        if (fid) {
            const fp = await req('/api/assets/' + fid + '/publish', 'PATCH', null, cmToken);
            console.log('Publish:', fp.status, JSON.stringify(fp.data).substring(0, 100));
            const fn = await client.query('SELECT recipient_role, message FROM notifications WHERE asset_id=$1 ORDER BY id', [fid]);
            fn.rows.forEach(r => console.log('  Notification to', r.recipient_role + ':', r.message));
        }

        const hodAccess = await req('/api/assets/free-content', 'GET', null, hodToken);
        console.log('HOD /free-content:', hodAccess.status, hodAccess.data.error || 'OK');

        const cmAccess = await req('/api/assets/free-content', 'GET', null, cmToken);
        console.log('CM /free-content:', cmAccess.status, cmAccess.data.assets ? `${cmAccess.data.assets.length} assets` : cmAccess.data.error);

        // --- HUB ASSET FLOW ---
        console.log('\n--- HUB ASSET FLOW ---');
        const h = await req('/api/assets', 'POST', [{ subject: 'Chem', topic: 'E2E Debug Hub', asset_type: 'worksheet', drive_link: 'https://d.com/hub-' + Date.now(), asset_category: 'hub_asset' }], tutorToken);
        console.log('Upload:', h.status, JSON.stringify(h.data).substring(0, 200));
        const hid = h.data.assets?.[0]?.id;

        if (hid) {
            const ha = await req('/api/assets/' + hid, 'PATCH', { status: 'approved', hod_feedback: 'OK' }, hodToken);
            console.log('HOD approve:', ha.status, JSON.stringify(ha.data).substring(0, 100));

            const hn1 = await client.query('SELECT recipient_role, message FROM notifications WHERE asset_id=$1 ORDER BY id', [hid]);
            hn1.rows.forEach(r => console.log('  Notification to', r.recipient_role + ':', r.message));

            const hp = await req('/api/assets/' + hid + '/publish', 'PATCH', null, cmToken);
            console.log('Hub publish:', hp.status, JSON.stringify(hp.data).substring(0, 100));

            const hn2 = await client.query('SELECT recipient_role, message FROM notifications WHERE asset_id=$1 ORDER BY id', [hid]);
            console.log('All notifications after publish:');
            hn2.rows.forEach(r => console.log('  →', r.recipient_role + ':', r.message));
        }

        // backward compat
        const nocat = await client.query("SELECT COUNT(*) FROM hub_assets WHERE asset_category IS NULL");
        console.log('\nAssets missing category:', nocat.rows[0].count);

        await client.query("DELETE FROM notifications WHERE asset_id IN (SELECT id FROM hub_assets WHERE topic LIKE 'E2E%')");
        await client.query("DELETE FROM hub_assets WHERE topic LIKE 'E2E%'");

    } catch (e) { console.error('Error:', e.message, e.detail || ''); }
    finally { if (client) client.release(); await pool.end(); }
})();
