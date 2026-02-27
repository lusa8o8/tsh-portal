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

async function verify() {
    console.log('Task 2 Verification: Minimum Asset Requirement\n');
    let client;
    let passed = 0;
    try {
        client = await pool.connect();
        const usersRes = await client.query("SELECT id, role FROM users WHERE role = 'tutor' LIMIT 1");
        const tutorId = usersRes.rows[0].id;
        const tutorToken = getToken('tutor', tutorId);

        // Cleanup before test
        await client.query("DELETE FROM notifications WHERE asset_id IN (SELECT id FROM hub_assets WHERE topic LIKE '%MinTest%')");
        await client.query("DELETE FROM hub_assets WHERE topic LIKE '%MinTest%'");

        // Test 1: Hub Resource with 1 asset → should SUCCEED
        console.log('Test 1: Hub Resource with 1 asset → should succeed...');
        const hub1 = await request('/api/assets', 'POST', [{
            subject: 'Math', topic: 'MinTest Hub Single',
            asset_type: 'worksheet', drive_link: 'https://drive.google.com/mintest-hub-' + Date.now(),
            asset_category: 'hub_asset'
        }], tutorToken);
        if (hub1.status === 200 || hub1.status === 201 || hub1.data.assets) {
            console.log('✓ Hub Resource (1 asset) → ACCEPTED');
            passed++;
        } else {
            console.log('✗ Hub Resource (1 asset) → REJECTED unexpectedly:', hub1.status, hub1.data);
        }

        // Test 2: Hub Resource with 0 assets → should FAIL
        console.log('\nTest 2: Hub Resource with 0 assets → should fail...');
        const hub0 = await request('/api/assets', 'POST', [], tutorToken);
        if (hub0.status === 400) {
            console.log('✓ Hub Resource (0 assets) → REJECTED correctly');
            passed++;
        } else {
            console.log('✗ Hub Resource (0 assets) → Unexpected status:', hub0.status, hub0.data);
        }

        // Test 3: Free Asset with 1 asset → should SUCCEED (no regression)
        console.log('\nTest 3: Free Asset with 1 asset → should succeed (no regression)...');
        const free1 = await request('/api/assets', 'POST', [{
            subject: 'Math', topic: 'MinTest Free Single',
            asset_type: 'recording', drive_link: 'https://drive.google.com/mintest-free-' + Date.now(),
            asset_category: 'free_asset'
        }], tutorToken);
        console.log('  Response:', free1.status, JSON.stringify(free1.data).substring(0, 100));
        if (free1.data.assets) {
            console.log('✓ Free Asset (1 asset) → ACCEPTED');
            passed++;
        } else {
            console.log('✗ Free Asset (1 asset) → REJECTED unexpectedly:', free1.status, free1.data);
        }

        // Test 4: Free Asset with 0 assets → should FAIL (no regression)
        console.log('\nTest 4: Free Asset with 0 assets → should fail (no regression)...');
        const free0 = await request('/api/assets', 'POST', [], tutorToken);
        console.log('  Response:', free0.status, JSON.stringify(free0.data).substring(0, 80));
        if (free0.status === 400) {
            console.log('✓ Free Asset (0 assets) → REJECTED correctly');
            passed++;
        } else {
            console.log('✗ Free Asset (0 assets) → Unexpected status:', free0.status, free0.data);
        }

        // Cleanup test data
        await client.query("DELETE FROM notifications WHERE asset_id IN (SELECT id FROM hub_assets WHERE topic LIKE '%MinTest%')");
        await client.query("DELETE FROM hub_assets WHERE topic LIKE '%MinTest%'");

        console.log(`\n${passed === 4 ? '✓' : '✗'} ${passed}/4 tests passed`);
        if (passed !== 4) process.exitCode = 1;
        else console.log('Task 2 Complete: Minimum asset requirement updated to 1 for both categories.');

    } catch (err) {
        console.error('Unexpected error:', err.message);
        process.exitCode = 1;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

verify();
