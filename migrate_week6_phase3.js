require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    console.log('Starting Phase 3 Migration: Update status constraints');
    try {
        await pool.query('BEGIN');

        console.log('Dropping existing CHECK constraint...');
        await pool.query(`ALTER TABLE hub_assets DROP CONSTRAINT IF EXISTS hub_assets_status_check`);

        console.log('Adding updated CHECK constraint...');
        await pool.query(`
            ALTER TABLE hub_assets 
            ADD CONSTRAINT hub_assets_status_check 
            CHECK (status IN ('pending_hod', 'approved', 'rejected', 'published', 'needs_revision'))
        `);

        console.log('✓ status constraint updated successfully');

        await pool.query('COMMIT');
        console.log('Phase 3 Migration completed successfully');

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();
