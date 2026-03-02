require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
    try {
        const a = await pool.query("SELECT date FROM assessments LIMIT 3");
        const c = await pool.query("SELECT target_date FROM campaigns WHERE status = 'approved' LIMIT 3");

        console.log("Assessment Dates:", a.rows.map(r => r.date));
        console.log("Campaign Target Dates:", c.rows.map(r => r.target_date));

        // Check if any campaign has a NULL target_date
        const c_null = await pool.query("SELECT COUNT(*) FROM campaigns WHERE status = 'approved' AND target_date IS NULL");
        console.log("Approved Campaigns with NULL target_date:", c_null.rows[0].count);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
run();
