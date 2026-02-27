// Week 3 Migration: Calendar Mapping + Support Sessions
// Additive-only migration script. Safe to run on existing database.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrate() {
    console.log('🔄 Applying Week 3 Migration: Calendar & Support Sessions...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Create assessments table
        console.log('📝 Creating assessments table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS assessments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                subject TEXT NOT NULL,
                institution TEXT NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('exam', 'mock', 'test')),
                date DATE NOT NULL,
                pressure_level TEXT NOT NULL CHECK (pressure_level IN ('high', 'medium', 'low')),
                campaign_window TEXT,
                created_by UUID REFERENCES users(id),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 2. Create support_sessions table
        console.log('📝 Creating support_sessions table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS support_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                student_name TEXT NOT NULL,
                subject TEXT NOT NULL,
                assessment_date DATE,
                session_date DATE NOT NULL,
                confusion_topics TEXT,
                status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed')),
                detected_gaps TEXT,
                scheduled_by UUID REFERENCES users(id),
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 3. Add source_id (optional) or type info to notifications if needed? 
        // For now, we'll just add support_session_id to notifications for deep linking.
        console.log('📝 Adding support_session_id to notifications...');
        await client.query(`
            ALTER TABLE notifications ADD COLUMN IF NOT EXISTS support_session_id UUID REFERENCES support_sessions(id);
        `);

        await client.query('COMMIT');
        console.log('✅ Week 3 Migration complete!');
        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrate();
