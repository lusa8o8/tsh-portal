// Week 5 Migration: Add read_status to notifications
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('🚀 Running Week 5 Migration...');
    try {
        await pool.query(`
            ALTER TABLE notifications
            ADD COLUMN IF NOT EXISTS read_status TEXT NOT NULL DEFAULT 'unread' CHECK (read_status IN ('unread','read'));
        `);
        console.log('✅ Added read_status to notifications table');
    } catch (e) {
        console.error('❌ Migration failed:', e.message);
    } finally {
        await pool.end();
    }
}

migrate();
