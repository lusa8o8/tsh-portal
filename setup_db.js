// TSH ERP - Database Setup Tool
// This script runs schema.sql without needing psql installed locally.

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL not found in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setup() {
    console.log('🔄 Initializing Database Setup...');
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📜 Reading schema.sql...');
        await pool.query(sql);

        console.log('✅ Schema executed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database Setup Failed:');
        console.error(err.message);
        process.exit(1);
    }
}

setup();
