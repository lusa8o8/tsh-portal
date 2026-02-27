require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    console.log('Starting Week 6 Migration: Content Routing System');
    try {
        await pool.query('BEGIN');

        console.log('Adding asset_category column to hub_assets...');
        await pool.query(`
            ALTER TABLE hub_assets 
            ADD COLUMN asset_category TEXT NOT NULL 
            DEFAULT 'hub_asset' 
            CHECK (asset_category IN ('hub_asset', 'free_asset'))
        `);

        // Verify column was added
        const checkColumn = await pool.query(`
            SELECT COUNT(*) as count 
            FROM information_schema.columns 
            WHERE table_name='hub_assets' AND column_name='asset_category'
        `);

        if (parseInt(checkColumn.rows[0].count) === 0) {
            throw new Error('asset_category column was not added');
        }

        console.log('✓ asset_category column added successfully');

        // Verify existing rows defaulted correctly
        const existingAssets = await pool.query(`
            SELECT COUNT(*) as count 
            FROM hub_assets 
            WHERE asset_category='hub_asset'
        `);

        console.log(`✓ ${existingAssets.rows[0].count} existing assets defaulted to 'hub_asset'`);
        console.log('✓ Reusing existing published_at column for both asset types');

        await pool.query('COMMIT');
        console.log('Week 6 Migration completed successfully');

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();
