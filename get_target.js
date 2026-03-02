const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        const res = await pool.query("SELECT id, name, email, role FROM users WHERE role = 'tutor' LIMIT 1");
        if (res.rows.length > 0) {
            console.log('TARGET_USER_START');
            console.log(JSON.stringify(res.rows[0], null, 2));
            console.log('TARGET_USER_END');
        } else {
            console.log('NO_TUTOR_FOUND');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
