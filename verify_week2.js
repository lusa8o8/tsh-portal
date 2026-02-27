// TSH ERP - Week 2 Flow Verification
// Tests: Tutor submits asset → HOD approves → Content Manager notified → publishes

const API_URL = 'http://localhost:3001/api';

async function req(endpoint, options = {}, token) {
    const headers = { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

async function verify() {
    console.log('🚀 Week 2: Quality Gate Verification...\n');

    // Register roles
    const roles = ['tutor', 'hod', 'content_manager'];
    for (const role of roles) {
        try {
            await req('/auth/register', { method: 'POST', body: JSON.stringify({ email: `w2.${role}@tsh.com`, name: `W2 ${role}`, role, password: 'password123' }) });
            console.log(`  Created ${role}`);
        } catch (e) {
            if (e.message === 'Email exists') console.log(`  ${role} already exists`);
            else throw e;
        }
    }

    // Login as tutor
    const { token: tutorToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.tutor@tsh.com', password: 'password123' }) });

    // Submit asset
    console.log('\nSubmitting asset...');
    const { asset } = await req('/assets', {
        method: 'POST', body: JSON.stringify({
            subject: 'Chemistry',
            topic: 'Periodic Table Tricks',
            asset_type: 'slides',
            drive_link: 'https://drive.google.com/test-asset',
            destination_path: '/Chemistry/W1'
        })
    }, tutorToken);
    console.log(`✅ Asset Created: ${asset.id} (Status: ${asset.status})`);

    // Login as HOD
    const { token: hodToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.hod@tsh.com', password: 'password123' }) });

    // HOD approves
    console.log('\nHOD approving asset...');
    const { asset: approved } = await req(`/assets/${asset.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved', hod_feedback: 'Good slides, clear layout.' }) }, hodToken);
    console.log(`✅ Asset Approved (Status: ${approved.status})`);

    // Verify Content Manager notification
    console.log('\nVerifying Content Manager notification...');
    const { notifications } = await req('/notifications?role=content_manager', {}, hodToken);
    const found = notifications.find(n => n.asset_id === asset.id);
    if (!found) throw new Error('❌ Content Manager notification NOT found!');
    console.log(`✅ content_manager notified: "${found.message}"`);

    // Login as Content Manager and publish
    const { token: cmToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.content_manager@tsh.com', password: 'password123' }) });
    console.log('\nContent Manager publishing asset...');
    const { asset: published } = await req(`/assets/${asset.id}/publish`, { method: 'PATCH' }, cmToken);
    console.log(`✅ Asset Published (Status: ${published.status}, published_at: ${published.published_at})`);

    // Test rejection flow
    const { asset: newAsset } = await req('/assets', {
        method: 'POST', body: JSON.stringify({
            subject: 'Physics', topic: 'Bad Worksheet', asset_type: 'worksheet', drive_link: 'https://drive.google.com/test2'
        })
    }, tutorToken);
    await req(`/assets/${newAsset.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected', hod_feedback: 'Worksheets needs clearer instructions.' }) }, hodToken);
    const { notifications: tutorNotifs } = await req('/notifications?role=tutor', {}, tutorToken);
    const rejNotif = tutorNotifs.find(n => n.asset_id === newAsset.id);
    if (!rejNotif) throw new Error('❌ Tutor rejection notification NOT found!');
    console.log(`✅ tutor notified of rejection: "${rejNotif.message}"`);

    console.log('\n✨ WEEK 2 QUALITY GATE VERIFIED SUCCESSFULLY! ✨\n');
}

verify().catch(e => console.error('❌ Verification Failed:', e.message));
