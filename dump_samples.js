require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const a = await pool.query("SELECT * FROM assessments LIMIT 2");
        const s = await pool.query("SELECT * FROM support_sessions LIMIT 2");

        fs.writeFileSync('table_samples.json', JSON.stringify({
            assessments: a.rows,
            support_sessions: s.rows
        }, null, 2));
        console.log("Samples written to table_samples.json");
    } finally {
        pool.end();
    }
}
run();
