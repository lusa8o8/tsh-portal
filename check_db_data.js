require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
        console.log("Tables found:", tables.rows.map(r => r.table_name).join(', '));

        if (tables.rows.some(r => r.table_name === 'assessments')) {
            const assessments = await pool.query("SELECT COUNT(*) FROM assessments;");
            console.log("Assessments count:", assessments.rows[0].count);
        } else {
            console.log("WARNING: assessments table does not exist!");
        }

        const approvedCampaigns = await pool.query("SELECT COUNT(*) FROM campaigns WHERE status = 'approved';");
        console.log("Approved campaigns count:", approvedCampaigns.rows[0].count);

        const allCampaigns = await pool.query("SELECT COUNT(*) FROM campaigns;");
        console.log("Total campaigns count:", allCampaigns.rows[0].count);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
