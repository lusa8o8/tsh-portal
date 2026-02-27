const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
    try {
        const hash = await bcrypt.hash('Password123!', 10);
        await pool.query(`
      INSERT INTO users (email, password_hash, name, role, account_status, subjects) 
      VALUES 
        ('tutor.test1@tsh.com', $1, 'Tutor 1', 'tutor', 'approved', '["Math"]'), 
        ('tutor.test2@tsh.com', $1, 'Tutor 2', 'tutor', 'approved', '["Physics"]'),
        ('w2.hod@tsh.com', $1, 'HOD User', 'hod', 'approved', '["Biology"]')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, account_status = 'approved';
    `, [hash]);
        console.log('✅ Test users seeded/updated');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
seed();
