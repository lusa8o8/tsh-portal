require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function check() {
    try {
        const res = await pool.query("SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'auth' AND routine_name = 'uid'");
        console.table(res.rows);
    } catch (err) {
        console.error('Error checking auth.uid():', err.message);
    } finally {
        pool.end();
    }
}
check();
