const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: "postgresql://postgres.zfzdulsewmgiqhhvamce:TSH_erp2026@aws-1-eu-west-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
});

async function applySql() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'fix_hod_asset_rls.sql'), 'utf8');
        console.log('Applying SQL policies...');
        await pool.query(sql);
        console.log('Successfully applied RLS policies.');
        
        const res = await pool.query(`
            SELECT policyname, tablename, cmd 
            FROM pg_policies 
            WHERE tablename = 'hub_assets'
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Error applying SQL:', err);
    } finally {
        await pool.end();
    }
}

applySql();
