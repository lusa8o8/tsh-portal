const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        const sql = fs.readFileSync('migration_account_deletion.sql', 'utf8');
        console.log('Running migration...');
        await pool.query(sql);
        console.log('✅ Migration successful');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

run();
