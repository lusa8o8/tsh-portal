require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/tsh_erp',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verify() {
    const client = await pool.connect();
    let passed = 0;
    try {
        console.log('--- Week 7.5 Verification ---');

        // Test 1: Check table exists
        const tableRes = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sop_links'
      );
    `);
        const exists = tableRes.rows[0].exists;
        console.log(`Test 1: sop_links table exists: ${exists ? '✅' : '❌'}`);
        if (exists) passed++;

        // Test 2: Check seeded links count
        const countRes = await client.query('SELECT count(*) FROM sop_links;');
        const count = parseInt(countRes.rows[0].count, 10);
        console.log(`Test 2: Seed data exists: ${count >= 5 ? '✅' : '❌'} (${count} links found)`);
        if (count >= 5) passed++;

        // Test 3: Check UUID for updated_by column (schema fix)
        const colRes = await client.query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'sop_links' AND column_name = 'updated_by'
    `);
        const isUuid = colRes.rows[0].data_type === 'uuid';
        console.log(`Test 3: updated_by column is UUID: ${isUuid ? '✅' : '❌'}`);
        if (isUuid) passed++;

        // Test 4: Verify Tutor Links Count
        const tutorRes = await client.query(`SELECT count(*) FROM sop_links WHERE target_role = 'tutor'`);
        const tutorCount = parseInt(tutorRes.rows[0].count, 10);
        console.log(`Test 4: Tutor links populated: ${tutorCount >= 4 ? '✅' : '❌'} (${tutorCount} found)`);
        if (tutorCount >= 4) passed++;

        // Test 5: Verify HOD Links Count
        const hodRes = await client.query(`SELECT count(*) FROM sop_links WHERE target_role = 'hod'`);
        const hodCount = parseInt(hodRes.rows[0].count, 10);
        console.log(`Test 5: HOD links populated: ${hodCount >= 1 ? '✅' : '❌'} (${hodCount} found)`);
        if (hodCount >= 1) passed++;

        console.log('-----------------------------');
        console.log(`Result: ${passed}/5 Tests Passing ${passed === 5 ? '✅' : '❌'}`);
    } catch (e) {
        console.error('Verification failed', e);
    } finally {
        client.release();
        pool.end();
    }
}

verify();
