// Week 3b Migration: Mandatory Post-Session Logs
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('🔄 Applying Week 3b Migration: Adding post_session_log...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            ALTER TABLE support_sessions 
            ADD COLUMN IF NOT EXISTS post_session_log TEXT;
        `);
        await client.query('COMMIT');
        console.log('✅ Week 3b Migration complete!');
        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrate();
