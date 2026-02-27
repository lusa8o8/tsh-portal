// Week 4 Migration: Outcome Logging
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('🔄 Applying Week 4 Migration: Adding outcome fields to campaigns...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Add outcome fields to campaigns
        await client.query(`
            ALTER TABLE campaigns 
            ADD COLUMN IF NOT EXISTS outcome_log TEXT,
            ADD COLUMN IF NOT EXISTS outcome_status TEXT CHECK (outcome_status IN ('improved', 'no_change', 'worse')),
            ADD COLUMN IF NOT EXISTS actual_completion_date DATE;
        `);

        await client.query('COMMIT');
        console.log('✅ Week 4 Migration complete!');
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
