// TSH ERP - Week 3 Flow Verification
// Tests: Create assessment → schedule support session → complete session with gaps → verify notifications

const API_URL = 'http://localhost:3001/api';

async function req(endpoint, options = {}, token) {
    const headers = { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

async function verify() {
    console.log('🚀 Week 3: Calendar Mapping + Support Sessions Verification...\n');

    const { token: tutorToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.tutor@tsh.com', password: 'password123' }) });
    const { token: hodToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.hod@tsh.com', password: 'password123' }) });

    // 1. Create Assessment
    console.log('Creating assessment...');
    const { assessment } = await req('/assessments', {
        method: 'POST', body: JSON.stringify({
            subject: 'Math',
            institution: 'Transcended Study Hub',
            type: 'exam',
            date: '2026-03-15',
            pressure_level: 'high',
            campaign_window: 'Term 1 Week 8'
        })
    }, tutorToken);
    console.log(`✅ Assessment Created: ${assessment.id} (${assessment.pressure_level} pressure)`);

    // 2. GET Assessments
    console.log('Fetching assessment map...');
    const { assessments } = await req('/assessments', {}, tutorToken);
    if (!assessments.find(a => a.id === assessment.id)) throw new Error('Assessment not in list');
    console.log(`✅ Assessment map updated (${assessments.length} items)`);

    // 3. Schedule Support Session
    console.log('\nScheduling support session...');
    const { session } = await req('/support_sessions', {
        method: 'POST', body: JSON.stringify({
            student_name: 'John Doe',
            subject: 'Math',
            assessment_date: '2026-03-15',
            session_date: '2026-03-01',
            confusion_topics: 'Algebraic manipulation and quadratic equations'
        })
    }, tutorToken);
    console.log(`✅ Session Scheduled: ${session.id} (Status: ${session.status})`);

    // 4. Complete Session with Gaps
    console.log('\nCompleting session with gap log...');
    const { session: completed } = await req(`/support_sessions/${session.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'completed', detected_gaps: 'Weakness in factoring large coefficients' })
    }, tutorToken);
    console.log(`✅ Session Completed (Status: ${completed.status})`);

    // 5. Verify Notifications
    console.log('\nVerifying gap notifications...');
    const { notifications: hodNotifs } = await req('/notifications?role=hod', {}, hodToken);
    const hodGapNotif = hodNotifs.find(n => n.support_session_id === session.id);
    if (!hodGapNotif) throw new Error('❌ HOD gap notification NOT found!');
    console.log(`✅ HOD notified: "${hodGapNotif.message}"`);

    const { notifications: tutorNotifs } = await req('/notifications?role=tutor', {}, tutorToken);
    const tutorGapNotif = tutorNotifs.find(n => n.support_session_id === session.id);
    if (!tutorGapNotif) throw new Error('❌ Tutor gap notification NOT found!');
    console.log(`✅ Tutor notified: "${tutorGapNotif.message}"`);

    console.log('\n✨ WEEK 3 CALENDAR & SUPPORT VERIFIED SUCCESSFULLY! ✨\n');
}

verify().catch(e => console.error('❌ Verification Failed:', e.message));
