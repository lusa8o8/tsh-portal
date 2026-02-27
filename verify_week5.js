const fetch = require('node-fetch');
const API_URL = 'http://localhost:3001/api';

async function req(endpoint, options = {}, token = null) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        }
    });

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error(`❌ BAD JSON FROM ${endpoint} [${res.status}]:\n${text.substring(0, 300)}`);
        throw new Error(`Non-JSON response from ${endpoint}`);
    }
    if (!res.ok) {
        const err = new Error(data.error || 'Request failed');
        err.status = res.ok ? 200 : res.status;
        throw err;
    }
    return data;
}


async function verify() {
    console.log('🚀 Week 5: Notifications & Dashboards Verification...\n');

    try {
        // 1. Setup: Register roles
        const makeUser = async (role, i) => {
            const email = `${role}5_${Date.now()}_${i}@tsh.com`;
            await req('/auth/register', { method: 'POST', body: JSON.stringify({ email, name: role, role, password: 'pass' }) });
            const { token, user } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: 'pass' }) });
            return { token, user };
        };

        const tutor = await makeUser('tutor', 1);
        const hod = await makeUser('hod', 1);
        const cm = await makeUser('content_manager', 1);
        const mkt = await makeUser('marketing', 1);

        console.log('✅ Users registered');

        // 2. Dashboards Verification (Before Approval)
        let hDashPre = await req('/dashboard', {}, hod.token);
        let mDashPre = await req('/dashboard', {}, mkt.token);

        // Create campaign
        const { campaign } = await req('/campaigns', { method: 'POST', body: JSON.stringify({ subject: 'Physics', topic: 'Kinetics', trick_pattern: 'Vectors', outcomes: 'Pass' }) }, tutor.token);
        console.log('✅ Campaign Created');

        let tDash = await req('/dashboard', {}, tutor.token);
        if (tDash.counts.pending_campaigns !== 1) throw new Error('Dashboard: Tutor pending_campaigns wrong');

        let hDash = await req('/dashboard', {}, hod.token);
        if (hDash.counts.pending_campaign_approvals !== hDashPre.counts.pending_campaign_approvals + 1) throw new Error('Dashboard: HOD pending_campaign_approvals wrong');

        console.log('✅ Pre-Approval Dashboard Metrics Solid');

        // 3. Approve Campaign & Trigger Notifications
        await req(`/campaigns/${campaign.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }, hod.token);

        let mDash = await req('/dashboard', {}, mkt.token);
        if (mDash.counts.approved_campaigns_ready !== mDashPre.counts.approved_campaigns_ready + 1) throw new Error('Dashboard: Marketing approved_campaigns_ready wrong');

        console.log('✅ Post-Approval Dashboard Metrics Solid');

        // 4. Notifications Inbox Verification
        const { notifications: mktNotifs } = await req('/notifications?role=marketing', {}, mkt.token);
        if (mktNotifs.length === 0 || mktNotifs[0].read_status !== 'unread') throw new Error('Notifications: Marketing inbox wrong');

        const notifId = mktNotifs[0].id;
        console.log('✅ Marketing got unread Notification');

        // 5. Mark Read Verification
        await req(`/notifications/${notifId}/read`, { method: 'PATCH' }, mkt.token);
        const { notifications: updatedNotifs } = await req('/notifications?role=marketing', {}, mkt.token);
        if (updatedNotifs.find(n => n.id === notifId).read_status !== 'read') throw new Error('Notifications: Mark read failed');

        console.log('✅ Notification Marked Read');

        console.log('\n✨ WEEK 5 VERIFIED SUCCESSFULLY! ✨');
        process.exit(0);

    } catch (e) {
        console.error('\n❌ VERIFICATION FAILED:', e.message);
        process.exit(1);
    }
}

verify();
