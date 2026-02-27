require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://localhost/tsh_erp'
});

async function migrate() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Create sop_links table
        await client.query(`
      CREATE TABLE IF NOT EXISTS sop_links (
        id SERIAL PRIMARY KEY,
        link_text TEXT NOT NULL,
        sop_url TEXT NOT NULL,
        description TEXT,
        target_role TEXT NOT NULL CHECK (target_role IN ('tutor', 'hod', 'content_manager', 'marketing', 'crm')),
        section TEXT NOT NULL DEFAULT 'overview' CHECK (section IN ('overview', 'form_helper', 'notification')),
        display_order INTEGER NOT NULL DEFAULT 0,
        active BOOLEAN NOT NULL DEFAULT true,
        managed_by TEXT NOT NULL CHECK (managed_by IN ('hod', 'admin_assistant')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by UUID REFERENCES users(id)
      )
    `);

        // Create indexes
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sop_links_role_section 
      ON sop_links(target_role, section, active)
    `);

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sop_links_managed_by 
      ON sop_links(managed_by)
    `);

        // Seed initial 5 SOP links from Week 7
        await client.query(`
      INSERT INTO sop_links (link_text, sop_url, description, target_role, section, display_order, managed_by)
      VALUES 
        ('Class Planning & Asset Prep Guide', '#', 'After approval, prepare lesson and materials', 'tutor', 'overview', 1, 'hod'),
        ('Class Delivery Guide (Free & Paid)', '#', 'Free campaigns or paid support sessions', 'tutor', 'overview', 2, 'hod'),
        ('Asset Building Guide (Worksheets, Guides, Solutions)', '#', 'Upload teaching materials', 'tutor', 'overview', 3, 'hod'),
        ('Video Creation Guide (Short & Long Form)', '#', 'Record classes for social media or Hub', 'tutor', 'overview', 4, 'hod'),
        ('Campaign Approval Criteria (SOP-ACA-007)', '#', 'When to approve/reject campaign proposals', 'hod', 'overview', 1, 'hod')
      ON CONFLICT DO NOTHING
    `);

        await client.query('COMMIT');
        console.log('✅ SOP links table created and seeded');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
    }
}

migrate()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
