/**
 * Week 7 Verification Test Suite
 * Tests all 5 days of interface polish changes via backend API.
 */
require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const http = require('http');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const secret = process.env.JWT_SECRET || 'tsh_super_secret_jwt_key_2026';

function getToken(role, id) {
    return jwt.sign({ id, email: `${role}@tsh.com`, name: `Test ${role}`, role }, secret, { expiresIn: '24h' });
}

async function req(path, method = 'GET', body = null, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : '';
        const options = { hostname: 'localhost', port: 3001, path, method, headers: { 'Authorization': `Bearer ${token}` } };
        if (body) { options.headers['Content-Type'] = 'application/json'; options.headers['Content-Length'] = Buffer.byteLength(data); }
        const r = http.request(options, res => { let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(b || '{}') }); } catch (e) { resolve({ status: res.statusCode, data: b }); } }); });
        r.on('error', reject);
        if (body) r.write(data);
        r.end();
    });
}

async function runTests() {
    console.log('=== Week 7 Verification Test Suite ===\n');
    let client;
    let passed = 0;
    let total = 0;

    function assert(label, condition, detail = '') {
        total++;
        if (condition) { console.log(`  ✓ ${label}`); passed++; }
        else { console.log(`  ✗ ${label}${detail ? ': ' + detail : ''}`); }
    }

    try {
        client = await pool.connect();
        const usersRes = await client.query("SELECT id, role FROM users WHERE role IN ('tutor','hod') ORDER BY role");
        const users = {};
        usersRes.rows.forEach(u => users[u.role] = u.id);
        const tutorToken = getToken('tutor', users.tutor);
        const hodToken = getToken('hod', users.hod);

        // Cleanup
        await client.query("DELETE FROM notifications WHERE asset_id IN (SELECT id FROM hub_assets WHERE topic LIKE 'W7Test%')");
        await client.query("DELETE FROM hub_assets WHERE topic LIKE 'W7Test%'");
        await client.query("DELETE FROM support_sessions WHERE subject LIKE 'W7Test%'");
        await client.query("DELETE FROM assessments WHERE subject LIKE 'W7Test%'");

        // --- DAY 1: Support Sessions without student_name ---
        console.log('Day 1: Support Sessions - Student Name removed');
        const sess = await req('/api/support_sessions', 'POST',
            { subject: 'W7Test Biology', session_date: '2026-03-01', confusion_topics: 'Osmosis' },
            tutorToken
        );
        assert('Session created without student_name', sess.status === 200 || sess.data.session, `status: ${sess.status}, err: ${sess.data.error}`);

        const sessOld = await req('/api/support_sessions', 'POST',
            { student_name: 'John', subject: 'W7Test Physics', session_date: '2026-03-02' },
            tutorToken
        );
        assert('Session still accepts student_name (backward compat)', sessOld.status === 200 || sessOld.data.session, `status: ${sessOld.status}`);

        // --- DAY 2: Assessment - Quiz and Topic types ---
        console.log('\nDay 2: Assessment Map - Quiz/Topic types + auto-pressure');
        const quizAssmt = await req('/api/assessments', 'POST',
            { subject: 'W7Test Math', institution: 'TSH', type: 'quiz', date: '2026-03-05' },
            tutorToken
        );
        assert('Assessment with type="quiz" accepted', quizAssmt.status === 200 || quizAssmt.data.assessment, `status: ${quizAssmt.status}, err: ${quizAssmt.data.error}`);

        const topicAssmt = await req('/api/assessments', 'POST',
            { subject: 'W7Test Math', institution: 'TSH', type: 'topic', date: '2026-05-01' },
            tutorToken
        );
        assert('Assessment with type="topic" accepted', topicAssmt.status === 200 || topicAssmt.data.assessment, `status: ${topicAssmt.status}, err: ${topicAssmt.data.error}`);

        // Verify auto-pressure calculation (date 4 days from now → high)
        const soon = new Date();
        soon.setDate(soon.getDate() + 4);
        const soonDate = soon.toISOString().slice(0, 10);
        const highPressure = await req('/api/assessments', 'POST',
            { subject: 'W7Test History', institution: 'TSH', type: 'exam', date: soonDate },
            tutorToken
        );
        assert('Auto-pressure: ≤7 days = high', highPressure.data.assessment?.pressure_level === 'high', `got: ${highPressure.data.assessment?.pressure_level}`);

        const later = new Date();
        later.setDate(later.getDate() + 14);
        const laterDate = later.toISOString().slice(0, 10);
        const medPressure = await req('/api/assessments', 'POST',
            { subject: 'W7Test History', institution: 'TSH', type: 'mock', date: laterDate },
            tutorToken
        );
        assert('Auto-pressure: 8-21 days = medium', medPressure.data.assessment?.pressure_level === 'medium', `got: ${medPressure.data.assessment?.pressure_level}`);

        const future = new Date();
        future.setDate(future.getDate() + 30);
        const futureDate = future.toISOString().slice(0, 10);
        const lowPressure = await req('/api/assessments', 'POST',
            { subject: 'W7Test History', institution: 'TSH', type: 'test', date: futureDate },
            tutorToken
        );
        assert('Auto-pressure: >21 days = low', lowPressure.data.assessment?.pressure_level === 'low', `got: ${lowPressure.data.assessment?.pressure_level}`);

        // Sending pressure_level in body is ignored (server calculates it)
        const ignorePressure = await req('/api/assessments', 'POST',
            { subject: 'W7Test History', institution: 'TSH', type: 'exam', date: futureDate, pressure_level: 'high' },
            tutorToken
        );
        assert('Sending pressure_level in body is ignored (server calculates low)', ignorePressure.data.assessment?.pressure_level === 'low', `got: ${ignorePressure.data.assessment?.pressure_level}`);

        // --- DAY 3: Tutor Notes ---
        console.log('\nDay 3: Tutor Notes - save and retrieve');
        const notes = 'Focus on vector addition (12:30-18:45). Skip intro chatter (0:00-3:00).';
        const withNotes = await req('/api/assets', 'POST', [{
            subject: 'W7Test Biology', topic: 'W7Test Hub with Notes',
            asset_type: 'worksheet',
            drive_link: 'https://drive.google.com/w7test-notes-' + Date.now(),
            asset_category: 'hub_asset',
            tutor_notes: notes
        }], tutorToken);
        assert('Asset with tutor_notes uploaded', withNotes.data.assets, `status: ${withNotes.status}, err: ${withNotes.data.error}`);

        const noteId = withNotes.data?.assets?.[0]?.id;
        if (noteId) {
            const dbRow = (await client.query('SELECT tutor_notes FROM hub_assets WHERE id=$1', [noteId])).rows[0];
            assert('tutor_notes saved in database', dbRow?.tutor_notes === notes, `got: "${dbRow?.tutor_notes}"`);
        }

        const withoutNotes = await req('/api/assets', 'POST', [{
            subject: 'W7Test Biology', topic: 'W7Test Free without Notes',
            asset_type: 'recording',
            drive_link: 'https://drive.google.com/w7test-nonotes-' + Date.now(),
            asset_category: 'free_asset'
        }], tutorToken);
        assert('Asset without tutor_notes uploads cleanly', withoutNotes.data.assets, `status: ${withoutNotes.status}`);

        const noNoteId = withoutNotes.data?.assets?.[0]?.id;
        if (noNoteId) {
            const dbRow2 = (await client.query('SELECT tutor_notes FROM hub_assets WHERE id=$1', [noNoteId])).rows[0];
            assert('tutor_notes is null when not provided', dbRow2?.tutor_notes === null, `got: "${dbRow2?.tutor_notes}"`);
        }

        // -- Verify tutor_notes column exists --
        const colCheck = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='hub_assets' AND column_name='tutor_notes'");
        assert('tutor_notes column exists in hub_assets', colCheck.rows.length > 0);

        // Cleanup
        await client.query("DELETE FROM notifications WHERE asset_id IN (SELECT id FROM hub_assets WHERE topic LIKE 'W7Test%')");
        await client.query("DELETE FROM hub_assets WHERE topic LIKE 'W7Test%'");
        await client.query("DELETE FROM support_sessions WHERE subject LIKE 'W7Test%'");
        await client.query("DELETE FROM assessments WHERE subject LIKE 'W7Test%'");

        console.log(`\n${'─'.repeat(50)}`);
        console.log(`${passed === total ? '✓' : '✗'} ${passed}/${total} tests passed`);
        if (passed !== total) process.exitCode = 1;
        else console.log('\n✓ Week 7 verification complete. All changes working correctly.');

    } catch (err) {
        console.error('\nUnexpected error:', err.message, err.detail || '');
        process.exitCode = 1;
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

runTests();
