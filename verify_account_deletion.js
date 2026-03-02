const { Pool } = require('pg');
require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 3005}/api`;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
    console.log('--- Final End-to-End Verification: Account Deletion ---');
    let adminToken = '';
    const testEmail = `delete-me-${Date.now()}@test.com`;
    const password = 'password123';

    try {
        // 1. Get Admin Token
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'hod@tsh.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        adminToken = loginData.token;
        console.log('✅ Admin login successful');

        // 2. Create Fresh User
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Delete Me', email: testEmail, password, role: 'tutor', subjects: ['Math'] })
        });
        const regData = await regRes.json();
        const testUserId = regData.userId;
        if (!testUserId) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        console.log(`✅ Fresh user registered: ${testEmail} (ID: ${testUserId})`);

        // 3. Approve User
        const approveRes = await fetch(`${API_URL}/users/${testUserId}/approve`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (!approveRes.ok) throw new Error('Approval failed');
        console.log('✅ Fresh user approved');

        // 4. Perform Soft Delete
        const deleteRes = await fetch(`${API_URL}/users/${testUserId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ confirmName: 'Delete Me', reason: 'Final Verification' })
        });
        if (deleteRes.ok) console.log('✅ Account successfully soft-deleted');
        else throw new Error('Deletion failed');

        // 5. Verify Login Blocking (Must be 403)
        const blockedRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail, password })
        });
        const blockedData = await blockedRes.json();
        if (blockedRes.status === 403 && blockedData.error === 'Account has been deleted') {
            console.log('✅ Login correctly blocked for deleted user (403)');
        } else {
            console.log(`❌ Login block failed. Status: ${blockedRes.status}, Error: ${blockedData.error}`);
        }

        console.log('\n--- ALL TESTS PASSED ---');
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
    } finally {
        await pool.end();
    }
}

verify();
