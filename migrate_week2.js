// TSH ERP - Week 2 Migration: Hub Assets + Content Manager role
// Run this ONCE on top of the existing Week 1 database. Safe — additive only.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('🔄 Running Week 2 Migration...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Add content_manager to the role check constraint
        console.log('📝 Updating role constraint...');
        await client.query(`
            ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
            ALTER TABLE users ADD CONSTRAINT users_role_check
                CHECK (role IN ('hod', 'tutor', 'marketing', 'crm', 'content_manager', 'admin'));
        `);

        // 2. Add asset_id to notifications (Week 1 table, additive)
        console.log('📝 Adding asset_id to notifications...');
        await client.query(`
            ALTER TABLE notifications ADD COLUMN IF NOT EXISTS asset_id UUID;
        `);

        // 3. Create hub_assets table
        console.log('📝 Creating hub_assets table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS hub_assets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                campaign_id UUID REFERENCES campaigns(id),
                tutor_id UUID REFERENCES users(id) NOT NULL,
                subject TEXT NOT NULL,
                topic TEXT NOT NULL,
                asset_type TEXT NOT NULL,
                drive_link TEXT NOT NULL,
                destination_path TEXT,
                status TEXT NOT NULL DEFAULT 'pending_hod'
                    CHECK (status IN ('pending_hod', 'approved', 'rejected', 'published')),
                submitted_at TIMESTAMP DEFAULT NOW(),
                hod_approved_at TIMESTAMP,
                hod_feedback TEXT,
                content_manager_alerted_at TIMESTAMP,
                published_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 4. Add updated_at trigger for hub_assets
        console.log('📝 Adding updated_at trigger...');
        await client.query(`
            DROP TRIGGER IF EXISTS update_hub_assets_updated_at ON hub_assets;
            CREATE TRIGGER update_hub_assets_updated_at BEFORE UPDATE ON hub_assets
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);

        // 5. Add foreign key from notifications to hub_assets (after table exists)
        console.log('📝 Adding asset_id FK constraint...');
        await client.query(`
            ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_asset_id_fkey;
            ALTER TABLE notifications ADD CONSTRAINT notifications_asset_id_fkey
                FOREIGN KEY (asset_id) REFERENCES hub_assets(id);
        `);

        await client.query('COMMIT');
        console.log('✅ Week 2 Migration complete!');
        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrate();
