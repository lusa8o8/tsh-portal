require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getTables() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log("Tables:", res.rows.map(r => r.table_name));

        // Also check columns for specific tables if found
        const tablesToCheck = res.rows.map(r => r.table_name);
        for (const t of tablesToCheck) {
            const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [t]);
            console.log(`\nTable ${t} columns:`, cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

getTables();
