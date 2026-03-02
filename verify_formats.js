require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verify() {
    try {
        // Mocking the behavior of GET /api/assessments
        const assessmentsResult = await pool.query('SELECT a.* FROM assessments a LIMIT 1');
        const assessmentsResponse = { assessments: assessmentsResult.rows };
        console.log("Assessments Response Sample:", JSON.stringify(assessmentsResponse, null, 2));

        // Mocking the behavior of GET /api/campaigns
        const campaignsResult = await pool.query("SELECT c.* FROM campaigns c WHERE status = 'approved' LIMIT 1");
        const campaignsResponse = { campaigns: campaignsResult.rows };
        console.log("Campaigns Response Sample:", JSON.stringify(campaignsResponse, null, 2));

        console.log("Verification complete.");
    } catch (err) {
        console.error("Verification failed:", err);
    } finally {
        await pool.end();
    }
}
verify();
