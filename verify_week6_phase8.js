/**
 * Phase 8: End-to-End Integration Test
 * Tests complete Free Asset and Hub Asset workflows from upload to publish.
 */
require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const http = require('http');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const secret = process.env.JWT_SECRET || 'tsh_super_secret_jwt_key_2026';

function getToken(role, id) {
    return jwt.sign({ id, email: `${role}@tsh.com`, name: `Test ${role}`, role }, secret, { expiresIn: '24h' });
}

async function request(path, method = 'GET', body = null, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const options = {
            hostname: 'localhost', port: 3001, path, method,
            headers: { 'Authorization': `Bearer ${token}` }
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }
        const req = http.request(options, res => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, data: JSON.parse(body || '{}') }); }
                catch (e) { resolve({ status: res.statusCode, data: body }); }
            });
        });
        req.on('error', reject);
        if (body) req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log('=== Phase 8: End-to-End Integration Test ===\n');
    let client;
    let passed = 0;
    let total = 0;

    function assert(label, condition, detail = '') {
        total++;
        if (condition) {
            console.log(`  ✓ ${label}`);
            passed++;
        } else {
            console.log(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
        }
    }

    try {
        client = await pool.connect();
        const usersRes = await client.query("SELECT id, role FROM users WHERE role IN ('tutor','hod','content_manager') ORDER BY role");
        const users = {};
        usersRes.rows.forEach(u => users[u.role] = u.id);

        const tutorToken = getToken('tutor', users.tutor);
        const hodToken = getToken('hod', users.hod);
        const cmToken = getToken('content_manager', users.content_manager);

        // Cleanup
        await client.query("DELETE FROM notifications WHERE asset_id IN (SELECT id FROM hub_assets WHERE topic LIKE 'E2E%')");
        await client.query("DELETE FROM hub_assets WHERE topic LIKE 'E2E%'");

        // ── FLOW 1: Free Asset ─────────────────────────────────────────────────
        console.log('FLOW 1: Free Asset Upload → CM Publish');

        const freeUpload = await request('/api/assets', 'POST', [{
            subject: 'Biology', topic: 'E2E Free Recording Test',
            asset_type: 'recording',
            drive_link: 'https://drive.google.com/e2e-free-' + Date.now(),
            asset_category: 'free_asset'
        }], tutorToken);

        assert('Free asset upload returns 200', freeUpload.data.assets);
        const freeId = freeUpload.data?.assets?.[0]?.id;

        const freeRow = freeId ? (await client.query('SELECT * FROM hub_assets WHERE id=$1', [freeId])).rows[0] : null;
        assert('Free asset status is "approved" immediately', freeRow?.status === 'approved', `got: ${freeRow?.status}`);
        assert('Free asset category is "free_asset"', freeRow?.asset_category === 'free_asset');

        const freeNotif = (await client.query("SELECT * FROM notifications WHERE asset_id=$1 AND recipient_role='content_manager'", [freeId])).rows[0];
        assert('CM notified on free upload', !!freeNotif);
        assert('CM notification contains [Free Content]', freeNotif?.message?.includes('[Free Content]'), `got: ${freeNotif?.message}`);

        // CM publishes free asset
        if (freeId) {
            const freePublish = await request(`/api/assets/${freeId}/publish`, 'PATCH', null, cmToken);
            assert('CM can publish free asset', freePublish.status === 200 || !!freePublish.data.success, `status: ${freePublish.status}`);
            const freePublishedRow = (await client.query('SELECT * FROM hub_assets WHERE id=$1', [freeId])).rows[0];
            assert('Free asset status is "published"', freePublishedRow?.status === 'published');
            const freePublishNotif = (await client.query("SELECT * FROM notifications WHERE asset_id=$1 AND recipient_role='tutor' ORDER BY id DESC LIMIT 1", [freeId])).rows[0];
            assert('Tutor notified on publish with [Free Content]', freePublishNotif?.message?.includes('[Free Content]'), `got: ${freePublishNotif?.message}`);
        }

        // HOD cannot access free-content endpoint
        const hodFreeAccess = await request('/api/assets/free-content', 'GET', null, hodToken);
        assert('HOD denied access to /free-content endpoint', hodFreeAccess.status === 403, `status: ${hodFreeAccess.status}`);

        // CM can access free-content endpoint
        const cmFreeAccess = await request('/api/assets/free-content', 'GET', null, cmToken);
        assert('CM can access /free-content endpoint', cmFreeAccess.status === 200, `status: ${cmFreeAccess.status}`);

        // ── FLOW 2: Hub Asset ──────────────────────────────────────────────────
        console.log('\nFLOW 2: Hub Asset Upload → HOD Approve → CM Publish');

        const hubUpload = await request('/api/assets', 'POST', [{
            subject: 'Chemistry', topic: 'E2E Hub Worksheet Test',
            asset_type: 'worksheet',
            drive_link: 'https://drive.google.com/e2e-hub-' + Date.now(),
            asset_category: 'hub_asset'
        }], tutorToken);

        assert('Hub asset upload returns 200', hubUpload.data.assets);
        const hubId = hubUpload.data?.assets?.[0]?.id;

        const hubRow = hubId ? (await client.query('SELECT * FROM hub_assets WHERE id=$1', [hubId])).rows[0] : null;
        assert('Hub asset status is "pending_hod"', hubRow?.status === 'pending_hod', `got: ${hubRow?.status}`);
        assert('Hub asset category is "hub_asset"', hubRow?.asset_category === 'hub_asset');

        // HOD approves hub asset
        if (hubId) {
            const hodApprove = await request(`/api/assets/${hubId}`, 'PATCH', { status: 'approved', hod_feedback: 'Good quality' }, hodToken);
            assert('HOD can approve hub asset', hodApprove.status === 200 || !!hodApprove.data.asset, `status: ${hodApprove.status}`);
            const hubApprovedRow = (await client.query('SELECT * FROM hub_assets WHERE id=$1', [hubId])).rows[0];
            assert('Hub asset status is "approved" after HOD action', hubApprovedRow?.status === 'approved');
            const cmHubNotif = (await client.query("SELECT * FROM notifications WHERE asset_id=$1 AND recipient_role='content_manager'", [hubId])).rows[0];
            assert('CM notified when hub asset approved', !!cmHubNotif);
            assert('CM notification contains [Hub Resource]', cmHubNotif?.message?.includes('[Hub Resource]'), `got: ${cmHubNotif?.message}`);

            // CM publishes hub asset
            const hubPublish = await request(`/api/assets/${hubId}/publish`, 'PATCH', null, cmToken);
            assert('CM can publish hub asset to Study Hub', hubPublish.status === 200 || !!hubPublish.data.success, `status: ${hubPublish.status}`);
            const hubPublishedRow = (await client.query('SELECT * FROM hub_assets WHERE id=$1', [hubId])).rows[0];
            assert('Hub asset status is "published"', hubPublishedRow?.status === 'published');
            const hubPublishNotif = (await client.query("SELECT * FROM notifications WHERE asset_id=$1 AND recipient_role='tutor' ORDER BY id DESC LIMIT 1", [hubId])).rows[0];
            assert('Tutor notified on publish with [Hub Resource]', hubPublishNotif?.message?.includes('[Hub Resource]'), `got: ${hubPublishNotif?.message}`);
        }

        // ── BACKWARD COMPATIBILITY ─────────────────────────────────────────────
        console.log('\nBACKWARD COMPAT: Existing data unaffected');
        const allAssets = (await client.query("SELECT COUNT(*) FROM hub_assets WHERE asset_category IS NULL")).rows[0].count;
        assert('No assets missing asset_category', parseInt(allAssets) === 0, `${allAssets} records missing category`);

        // Cleanup after
        await client.query("DELETE FROM notifications WHERE asset_id IN (SELECT id FROM hub_assets WHERE topic LIKE 'E2E%')");
        await client.query("DELETE FROM hub_assets WHERE topic LIKE 'E2E%'");

        console.log(`\n${'─'.repeat(50)}`);
        console.log(`${passed === total ? '✓' : '✗'} ${passed}/${total} tests passed`);
        if (passed !== total) {
            process.exitCode = 1;
        } else {
            console.log('\n✓ Phase 8 Complete: All end-to-end flows verified.');
        }

    } catch (err) {
        console.error('\nUnexpected error:', err.message, err.detail || '');
        process.exitCode = 1;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

runTests();
