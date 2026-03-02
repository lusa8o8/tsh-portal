require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function dump() {
    try {
        const assessments = await pool.query("SELECT * FROM assessments");
        const campaigns = await pool.query("SELECT * FROM campaigns");

        console.log(JSON.stringify({
            assessments: assessments.rows,
            campaigns: campaigns.rows
        }, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
dump();
