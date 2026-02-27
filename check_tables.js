require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const a = await pool.query("SELECT * FROM assessments LIMIT 1");
        console.log("assessments:", a.rows);
        const s = await pool.query("SELECT * FROM support_sessions LIMIT 1");
        console.log("support_sessions:", s.rows);
    } finally {
        pool.end();
    }
}
check();
