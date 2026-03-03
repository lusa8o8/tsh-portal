require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function verify() {
    try {
        console.log('--- Verifying class_link column exists ---');
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'class_link'");
        if (res.rows.length > 0) {
            console.log('✅ class_link column exists');
        } else {
            console.error('❌ class_link column MISSING');
            process.exit(1);
        }

        console.log('\n--- Verifying INSERT with class_link ---');
        // We'll just test a raw query to the DB to mimic the server.js logic
        const testCampaign = {
            tutor_id: '809d3b84-469b-4375-927b-23116544e3f4', // Assuming this exists or using a dummy if needed, but let's just use a valid ID from users
            subject: 'Test Subject',
            topic: 'Test Topic',
            class_link: 'https://zoom.pro/test'
        };

        // Find a valid user id first
        const userRes = await pool.query('SELECT id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.error('❌ No users found in DB to test with');
            process.exit(1);
        }
        const userId = userRes.rows[0].id;

        const insertRes = await pool.query(
            `INSERT INTO campaigns (tutor_id, subject, topic, class_link, status) VALUES ($1, $2, $3, $4, 'draft') RETURNING class_link`,
            [userId, testCampaign.subject, testCampaign.topic, testCampaign.class_link]
        );

        if (insertRes.rows[0].class_link === testCampaign.class_link) {
            console.log('✅ Database successfully stored class_link');
        } else {
            console.error('❌ Database failed to store class_link correctly');
        }

    } catch (err) {
        console.error('❌ Verification failed:', err.message);
    } finally {
        await pool.end();
    }
}

verify();
