// Week 2 Adjustment Migration: expanded asset_type constraint
// Additive-only. Safe to run on existing database.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('🔄 Applying Week 2 Adjustment: asset_type constraint expansion...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Drop old constraint and replace with expanded one
        await client.query(`
            ALTER TABLE hub_assets DROP CONSTRAINT IF EXISTS hub_assets_asset_type_check;
            ALTER TABLE hub_assets ADD CONSTRAINT hub_assets_asset_type_check
                CHECK (asset_type IN ('slides', 'worksheet', 'recording', 'other', 'marking_key', 'practice_bank'));
        `);

        await client.query('COMMIT');
        console.log('✅ asset_type constraint updated (added marking_key, practice_bank)');
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
