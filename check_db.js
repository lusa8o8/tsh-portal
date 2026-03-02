const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        console.log('Connecting to database...');
        const res = await pool.query('SELECT id, name, email, role FROM users LIMIT 5');
        console.log('Users found:');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await pool.end();
    }
}

run();
