require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function wipeData() {
    console.log("Starting strict operational data wipe...");
    try {
        await pool.query('BEGIN');

        console.log("Wiping notifications...");
        await pool.query('DELETE FROM notifications');

        console.log("Wiping hub_assets...");
        await pool.query('DELETE FROM hub_assets');

        console.log("Wiping campaigns...");
        await pool.query('DELETE FROM campaigns');

        console.log("Clearing gap logs from support_sessions...");
        await pool.query(`
            UPDATE support_sessions 
            SET 
                detected_gaps = NULL, 
                post_session_log = NULL,
                status = 'scheduled',
                completed_at = NULL
            WHERE status = 'completed'
        `);

        await pool.query('COMMIT');
        console.log("✅ Strict data wipe completed successfully.");
    } catch (e) {
        await pool.query('ROLLBACK');
        console.error("❌ Wipe failed, rolling back:", e);
    } finally {
        pool.end();
    }
}

wipeData();
