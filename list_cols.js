require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function list() {
    const tables = ['campaigns', 'hub_assets', 'support_sessions', 'assessments', 'notifications', 'sop_links'];
    try {
        for (const t of tables) {
            const res = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${t}'`);
            console.log(`Table: ${t}`);
            console.log(res.rows.map(r => r.column_name));
        }
    } catch (err) {
        console.error('Error listing columns:', err.message);
    } finally {
        pool.end();
    }
}
list();
