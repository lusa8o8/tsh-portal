// TSH ERP - Week 3 Refinement Verification
// Tests: 
// 1. Completion without post_session_log should fail (400)
// 2. Completion with post_session_log should succeed
// 3. Notifications should include the log content

const API_URL = 'http://localhost:3001/api';

async function req(endpoint, options = {}, token) {
    const headers = { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(data.error || 'Request failed');
        err.status = res.status;
        throw err;
    }
    return data;
}

async function verify() {
    console.log('🚀 Week 3 Refinement: Mandatory Logs Verification...\n');

    const { token: tutorToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.tutor@tsh.com', password: 'password123' }) });
    const { token: hodToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.hod@tsh.com', password: 'password123' }) });

    // 1. Schedule Session
    console.log('Scheduling session...');
    const { session } = await req('/support_sessions', {
        method: 'POST', body: JSON.stringify({
            student_name: 'Jane Smith',
            subject: 'Biology',
            session_date: '2026-03-05',
            confusion_topics: 'Cell mitosis stages'
        })
    }, tutorToken);
    console.log(`✅ Session Scheduled: ${session.id}`);

    // 2. Try to complete without log
    console.log('\nTrying to complete WITHOUT post_session_log (should fail with 400)...');
    try {
        const result = await req(`/support_sessions/${session.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'completed' })
        }, tutorToken);
        console.log('❌ UNEXPECTED SUCCESS: Returned 200 with data:', JSON.stringify(result));
        throw new Error('❌ Test FAILED: Completion should have failed without log');
    } catch (e) {
        if (e.status === 400) {
            console.log(`✅ Got expected 400 error: ${e.message}`);
        } else {
            console.error(`❌ Unexpected error: ${e.status} - ${e.message}`);
            throw e;
        }
    }

    // 3. Complete with log
    console.log('\nCompleting WITH mandatory log...');
    const MANDATORY_LOG = 'Worksheet #4 was too abstract; student needs more diagrams for mitosis stages.';
    const { session: completed } = await req(`/support_sessions/${session.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: 'completed',
            post_session_log: MANDATORY_LOG,
            detected_gaps: 'Visual learning deficit'
        })
    }, tutorToken);
    console.log(`✅ Session Completed with log.`);

    // 4. Verify Notifications
    console.log('\nVerifying HOD notification includes log...');
    const { notifications: hodNotifs } = await req('/notifications?role=hod', {}, hodToken);
    const logNotif = hodNotifs.find(n => n.support_session_id === session.id);
    if (!logNotif) throw new Error('❌ HOD notification NOT found!');
    if (!logNotif.message.includes(MANDATORY_LOG)) {
        throw new Error(`❌ Log content missing from notification: ${logNotif.message}`);
    }
    console.log(`✅ HOD notified correctly: "${logNotif.message}"`);

    console.log('\n✨ WEEK 3 REFINEMENT VERIFIED SUCCESSFULLY! ✨\n');
}

verify().catch(e => {
    console.error(`❌ Verification Failed: ${e.message}`);
    process.exit(1);
});
