// Week 2b Adjustment Verification
// Tests: min 3 enforcement, new asset types, batch flow, HOD/CM unchanged

const API_URL = 'http://localhost:3001/api';

async function req(endpoint, options = {}, token) {
    const headers = { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) };
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

async function verify() {
    console.log('🚀 Week 2b: Adjustment Verification\n');

    const { token: tutorToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.tutor@tsh.com', password: 'password123' }) });
    const { token: hodToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.hod@tsh.com', password: 'password123' }) });
    const { token: cmToken } = await req('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'w2.content_manager@tsh.com', password: 'password123' }) });

    // TEST 1: Reject submission with < 3 assets
    console.log('Testing min-3 enforcement...');
    try {
        await req('/assets', {
            method: 'POST', body: JSON.stringify([
                { subject: 'Math', topic: 'Algebra', asset_type: 'slides', drive_link: 'https://drive.google.com/1' },
                { subject: 'Math', topic: 'Algebra', asset_type: 'worksheet', drive_link: 'https://drive.google.com/2' }
            ])
        }, tutorToken);
        throw new Error('Should have been rejected!');
    } catch (e) {
        if (e.message === 'Minimum 3 assets required per submission') {
            console.log('✅ 2-asset batch correctly rejected');
        } else throw e;
    }

    // TEST 2: Accept batch of 3 with new asset types
    console.log('Submitting batch of 3 with marking_key and practice_bank...');
    const { assets, count } = await req('/assets', {
        method: 'POST', body: JSON.stringify([
            { subject: 'Biology', topic: 'Cell Division Pack', asset_type: 'slides', drive_link: 'https://drive.google.com/s1' },
            { subject: 'Biology', topic: 'Cell Division Pack', asset_type: 'marking_key', drive_link: 'https://drive.google.com/mk1' },
            { subject: 'Biology', topic: 'Cell Division Pack', asset_type: 'practice_bank', drive_link: 'https://drive.google.com/pb1' }
        ])
    }, tutorToken);
    console.log(`✅ Batch of ${count} assets created (marking_key + practice_bank accepted)`);
    assets.forEach(a => console.log(`   - ${a.asset_type}: ${a.status}`));

    // TEST 3: HOD approves the first asset in the batch
    console.log('\nHOD approving one asset...');
    const { asset: approved } = await req(`/assets/${assets[0].id}`, {
        method: 'PATCH', body: JSON.stringify({ status: 'approved', hod_feedback: 'Good slides.' })
    }, hodToken);
    console.log(`✅ Asset approved (Status: ${approved.status})`);

    // TEST 4: CM publishes it
    console.log('Content Manager publishing...');
    const { asset: published } = await req(`/assets/${assets[0].id}/publish`, { method: 'PATCH' }, cmToken);
    console.log(`✅ Published (Status: ${published.status})`);

    // TEST 5: Reject invalid type
    console.log('\nTesting invalid asset_type rejection...');
    try {
        await req('/assets', {
            method: 'POST', body: JSON.stringify([
                { subject: 'X', topic: 'X', asset_type: 'video', drive_link: 'https://x.com' },
                { subject: 'X', topic: 'X', asset_type: 'video', drive_link: 'https://x.com' },
                { subject: 'X', topic: 'X', asset_type: 'video', drive_link: 'https://x.com' }
            ])
        }, tutorToken);
        throw new Error('Should have rejected invalid type!');
    } catch (e) {
        if (e.message.includes('Invalid asset_type')) {
            console.log(`✅ Invalid asset_type correctly rejected: "${e.message}"`);
        } else throw e;
    }

    console.log('\n✨ WEEK 2 ADJUSTMENT VERIFIED SUCCESSFULLY! ✨\n');
}

verify().catch(e => console.error('❌ Verification Failed:', e.message));
