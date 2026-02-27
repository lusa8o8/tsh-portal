const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fix() {
    console.log('🔄 Fixing campaigns_status_check constraint...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Drop existing constraint
        await client.query('ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check');

        // 2. Add new constraint including 'completed' and 'delivered'
        await client.query(`
            ALTER TABLE campaigns 
            ADD CONSTRAINT campaigns_status_check 
            CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'delivered', 'completed'))
        `);

        await client.query('COMMIT');
        console.log('✅ Constraint fixed!');
        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Fix failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
    }
}

fix();
