require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function query() {
    try {
        const res = await pool.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'hub_assets'::regclass");
        console.log(res.rows);
    } catch (e) { console.error(e) }
    finally { pool.end(); }
}

query();
