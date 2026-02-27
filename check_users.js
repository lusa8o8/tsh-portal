const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const res = await pool.query("SELECT id, email, role, account_status FROM users WHERE email IN ('tutor.test1@tsh.com', 'tutor.test2@tsh.com', 'w2.hod@tsh.com');");
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
