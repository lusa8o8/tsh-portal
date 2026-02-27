require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = res.rows.map(r => r.table_name);
        fs.writeFileSync('tables.json', JSON.stringify(tables, null, 2));
        console.log("Done");
    } finally {
        pool.end();
    }
}

run().catch(console.error);
