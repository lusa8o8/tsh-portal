require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/tsh_erp',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixConstraintAndSeed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Expand the target_role check constraint to include finance and admin_assistant
    await client.query(`
      ALTER TABLE sop_links DROP CONSTRAINT sop_links_target_role_check;
    `);
    await client.query(`
      ALTER TABLE sop_links ADD CONSTRAINT sop_links_target_role_check 
      CHECK (target_role IN ('tutor', 'hod', 'content_manager', 'marketing', 'crm', 'finance', 'admin_assistant'));
    `);
    console.log('✅ Constraint updated');

    // CRM SOPs (5 links)
    await client.query(`
      INSERT INTO sop_links (link_text, sop_url, description, target_role, section, display_order, managed_by)
      VALUES 
        ('Review & Qualify New Leads', '#', 'How to assess and qualify incoming student leads', 'crm', 'overview', 1, 'admin_assistant'),
        ('Follow-Up & Conversion Guide', '#', 'Best practices for converting leads to enrolled students', 'crm', 'overview', 2, 'admin_assistant'),
        ('Confirm Payments & Grant Access', '#', 'Process for verifying payments and activating accounts', 'crm', 'overview', 3, 'admin_assistant'),
        ('CRM Reporting & Pipeline Review', '#', 'How to track and report on conversion metrics', 'crm', 'overview', 4, 'admin_assistant'),
        ('Form Creation & Student Data Logging', '#', 'Creating intake forms and logging student information', 'crm', 'overview', 5, 'admin_assistant')
      ON CONFLICT DO NOTHING
    `);

    // Marketing SOPs (6 links)
    await client.query(`
      INSERT INTO sop_links (link_text, sop_url, description, target_role, section, display_order, managed_by)
      VALUES 
        ('Content Development & Channel Management', '#', 'Managing social media and content channels', 'marketing', 'overview', 1, 'admin_assistant'),
        ('Marketing Research & Analysis', '#', 'Audience research and market analysis', 'marketing', 'overview', 2, 'admin_assistant'),
        ('Brand Messaging & Lead Magnet Design', '#', 'Creating compelling messaging and lead magnets', 'marketing', 'overview', 3, 'admin_assistant'),
        ('Performance Tracking & Analytics', '#', 'Measuring campaign performance and ROI', 'marketing', 'overview', 4, 'admin_assistant'),
        ('Approved Campaign Launch & Session Promotion', '#', 'How to promote approved campaigns and sessions', 'marketing', 'overview', 5, 'admin_assistant'),
        ('Community Management Guide', '#', 'Engaging with students and managing online community', 'marketing', 'overview', 6, 'admin_assistant')
      ON CONFLICT DO NOTHING
    `);

    // Content Manager SOPs (4 links)
    await client.query(`
      INSERT INTO sop_links (link_text, sop_url, description, target_role, section, display_order, managed_by)
      VALUES 
        ('Content Repurposing & Scheduling', '#', 'How to repurpose class recordings for social media', 'content_manager', 'overview', 1, 'admin_assistant'),
        ('Content Calendar Creation & Execution', '#', 'Planning and executing content publishing schedule', 'content_manager', 'overview', 2, 'admin_assistant'),
        ('Content Review & Quality Check (Free & Hub)', '#', 'Quality standards for both free and hub content', 'content_manager', 'overview', 3, 'admin_assistant'),
        ('Asset Backlog Review', '#', 'Managing content pipeline and prioritizing assets', 'content_manager', 'overview', 4, 'admin_assistant')
      ON CONFLICT DO NOTHING
    `);

    // Finance SOPs (4 links)
    await client.query(`
      INSERT INTO sop_links (link_text, sop_url, description, target_role, section, display_order, managed_by)
      VALUES 
        ('Monthly Financial Reconciliation', '#', 'End-of-month accounting and reconciliation process', 'finance', 'overview', 1, 'admin_assistant'),
        ('Revenue Tracking & Reconciliation', '#', 'Tracking revenue from campaigns and subscriptions', 'finance', 'overview', 2, 'admin_assistant'),
        ('Payment Verification', '#', 'Verifying and processing student payments', 'finance', 'overview', 3, 'admin_assistant'),
        ('Financial Reporting', '#', 'Creating financial reports for management review', 'finance', 'overview', 4, 'admin_assistant')
      ON CONFLICT DO NOTHING
    `);

    // HOD Capacity Review SOP
    await client.query(`
      INSERT INTO sop_links (link_text, sop_url, description, target_role, section, display_order, managed_by)
      VALUES ('Capacity Review SOP', '#', 'How to assess tutor capacity and plan campaign windows', 'hod', 'overview', 2, 'hod')
      ON CONFLICT DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('✅ Week 8 SOPs seeded successfully (19 new links)');

    const count = await pool.query(`SELECT count(*) FROM sop_links WHERE target_role IN ('crm','marketing','content_manager','finance')`);
    console.log(`   Total non-academic SOP links: ${count.rows[0].count}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

fixConstraintAndSeed();
