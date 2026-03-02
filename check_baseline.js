const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const res = await pool.query("SELECT id, name, email, role FROM users WHERE role = 'tutor' LIMIT 5");
        console.log('---BASELINES---');
        res.rows.forEach(u => {
            console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role}`);
        });
        console.log('---END---');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
