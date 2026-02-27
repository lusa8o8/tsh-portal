require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function diagnose() {
    // 1. Check recent hub_assets status
    const assets = await pool.query('SELECT id, topic, status, asset_category, created_at FROM hub_assets ORDER BY created_at DESC LIMIT 10');
    console.log('=== Recent Hub Assets ===');
    assets.rows.forEach(a => console.log(`  id=${a.id} status=${a.status} cat=${a.asset_category} topic=${a.topic}`));

    // 2. Check if any assets are stuck in pending_hod
    const stuck = await pool.query("SELECT count(*) FROM hub_assets WHERE status = 'pending_hod'");
    console.log(`\n=== Assets stuck in pending_hod: ${stuck.rows[0].count} ===`);

    // 3. Check CM-visible assets
    const cmVisible = await pool.query("SELECT count(*) FROM hub_assets WHERE status IN ('approved', 'pending_cm', 'published')");
    console.log(`=== CM-visible assets (approved/pending_cm/published): ${cmVisible.rows[0].count} ===`);

    // 4. Check CRM SOP links
    const crmSops = await pool.query("SELECT id, link_text, target_role, active FROM sop_links WHERE target_role = 'crm' AND active = true");
    console.log(`\n=== CRM SOP Links (active): ${crmSops.rows.length} ===`);
    crmSops.rows.forEach(s => console.log(`  id=${s.id} text=${s.link_text}`));

    // 5. Check notifications for CM
    const cmNotifs = await pool.query("SELECT id, message, created_at FROM notifications WHERE recipient_role = 'content_manager' ORDER BY created_at DESC LIMIT 5");
    console.log(`\n=== Recent CM Notifications: ${cmNotifs.rows.length} ===`);
    cmNotifs.rows.forEach(n => console.log(`  id=${n.id} msg=${n.message.substring(0, 60)}...`));

    pool.end();
}
diagnose().catch(e => { console.error(e); pool.end(); });
