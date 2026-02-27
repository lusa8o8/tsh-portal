require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`ALTER TABLE hub_assets ADD COLUMN IF NOT EXISTS tutor_notes TEXT`);
        await client.query('COMMIT');
        console.log('✓ Migration complete: tutor_notes column added to hub_assets');
        // Verify
        const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'hub_assets' AND column_name = 'tutor_notes'`);
        if (res.rows.length > 0) {
            console.log('✓ Verified: tutor_notes TEXT column exists');
        } else {
            console.log('✗ Column not found after migration');
            process.exitCode = 1;
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('✗ Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
})();
