require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
    console.log('Verifying Phase 1: Database Schema');
    try {
        // Check 1: Column exists
        const columnCheck = await pool.query(`
            SELECT column_default as dflt_value, data_type as type 
            FROM information_schema.columns 
            WHERE table_name='hub_assets' AND column_name='asset_category'
        `);

        if (columnCheck.rows.length === 0) {
            console.error('✗ asset_category column does not exist');
            process.exit(1);
        }

        const col = columnCheck.rows[0];
        console.log('✓ asset_category column exists');
        console.log('  Type:', col.type);
        console.log('  Default:', col.dflt_value);

        // Check 2: Existing assets have default value
        const existingAssets = await pool.query(`
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN asset_category='hub_asset' THEN 1 END) as hub_assets,
                   COUNT(CASE WHEN asset_category='free_asset' THEN 1 END) as free_assets
            FROM hub_assets
        `);

        const stats = existingAssets.rows[0];
        console.log('✓ Asset counts:');
        console.log('  Total:', stats.total);
        console.log('  Hub assets:', stats.hub_assets);
        console.log('  Free assets:', stats.free_assets);

        if (stats.total !== stats.hub_assets) {
            console.error('✗ Not all existing assets defaulted to hub_asset');
            process.exit(1);
        }
        console.log('✓ All existing assets correctly defaulted to hub_asset');

        // Check 3: Constraint validation
        try {
            await pool.query(`
                INSERT INTO hub_assets (tutor_id, subject, topic, asset_type, drive_link, asset_category)
                VALUES ((SELECT id FROM users WHERE role='tutor' LIMIT 1), 'Math', 'Topic', 'slides', 'http://test.com', 'invalid_category')
            `);
            console.error('✗ Constraint check failed - invalid category was accepted');
            process.exit(1);
        } catch (error) {
            console.log('✓ Constraint check passed - invalid categories are rejected');
        }

        // Check 4: published_at column still exists
        const publishedAtCheck = await pool.query(`
            SELECT COUNT(*) as count FROM information_schema.columns WHERE table_name='hub_assets' AND column_name='published_at'
        `);

        if (parseInt(publishedAtCheck.rows[0].count) === 0) {
            console.error('✗ published_at column missing');
            process.exit(1);
        }
        console.log('✓ published_at column exists (reused for both asset types)');

        console.log('\\n✓ Phase 1 verification complete - All checks passed');

    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

verify();
