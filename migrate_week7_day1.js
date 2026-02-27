require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`ALTER TABLE support_sessions ALTER COLUMN student_name DROP NOT NULL`);
        await client.query('COMMIT');
        console.log('✓ Migration complete: student_name is now nullable in support_sessions');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('✗ Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
})();
