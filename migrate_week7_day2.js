require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const res = await client.query(`
            SELECT conname 
            FROM pg_constraint 
            WHERE conrelid = 'assessments'::regclass AND contype = 'c'
        `);
        for (const row of res.rows) {
            // Drop any constraint that looks like it's checking the 'type' column
            if (row.conname.includes('type') || row.conname.includes('assessments_')) {
                await client.query(`ALTER TABLE assessments DROP CONSTRAINT IF EXISTS ${row.conname}`);
                console.log('Dropped constraint', row.conname);
            }
        }
        // Add back the expanded check constraint
        await client.query(`ALTER TABLE assessments ADD CONSTRAINT assessments_type_check CHECK (type IN ('exam', 'mock', 'test', 'quiz', 'topic'))`);
        await client.query('COMMIT');
        console.log('✓ Migration complete: updated assessments.type check constraint to include quiz and topic');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('✗ Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
})();
