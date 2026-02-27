require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

async function runSql(filename) {
    const filePath = path.join(__dirname, filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`Executing ${filename}...`);
    try {
        const res = await pool.query(sql);
        if (Array.isArray(res)) {
            res.forEach((r, i) => {
                if (r.rows && r.rows.length > 0) {
                    console.table(r.rows);
                }
            });
        } else if (res.rows && res.rows.length > 0) {
            console.table(res.rows);
        }
        console.log(`✅ ${filename} executed successfully.`);
    } catch (err) {
        console.error(`❌ Error executing ${filename}:`, err.message);
        process.exit(1);
    }
}

const target = process.argv[2];
if (!target) {
    console.error('Usage: node run_sql.js <filename.sql>');
    process.exit(1);
}

runSql(target).then(() => pool.end());
