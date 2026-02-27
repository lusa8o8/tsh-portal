require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function fix() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Step 1: Expand hub_assets status constraint to include pending_cm
        await client.query("ALTER TABLE hub_assets DROP CONSTRAINT hub_assets_status_check");
        await client.query("ALTER TABLE hub_assets ADD CONSTRAINT hub_assets_status_check CHECK (status IN ('pending_hod', 'pending_cm', 'approved', 'rejected', 'published', 'needs_revision'))");
        console.log('✅ hub_assets status constraint updated (added pending_cm)');

        // Step 2: Migrate all pending_hod to pending_cm
        const migrated = await client.query("UPDATE hub_assets SET status = 'pending_cm' WHERE status = 'pending_hod'");
        console.log(`✅ Migrated ${migrated.rowCount} assets: pending_hod → pending_cm`);

        await client.query('COMMIT');

        // Verify
        const check = await pool.query("SELECT status, count(*) FROM hub_assets GROUP BY status ORDER BY status");
        console.log('\n=== Hub Assets by Status ===');
        check.rows.forEach(r => console.log(`  ${r.status}: ${r.count}`));
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Failed:', err.message);
    } finally {
        client.release();
        pool.end();
    }
}
fix();
