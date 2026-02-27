const API_URL = 'http://localhost:3001/api';

async function test() {
    console.log('🚀 Starting Phase 2 Verification...');

    try {
        // 1. Login as Tutor 1
        const t1LoginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'tutor.test1@tsh.com', password: 'Password123!' })
        });
        const t1Data = await t1LoginRes.json();
        if (!t1LoginRes.ok) throw new Error(`T1 Login failed: ${t1Data.error}`);
        const t1Token = t1Data.token;
        const t1Id = t1Data.user.id;
        console.log('✅ Tutor 1 logged in');

        // 2. Tutor 1 submits a campaign
        const t1CampRes = await fetch(`${API_URL}/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${t1Token}`
            },
            body: JSON.stringify({
                subject: 'Math',
                topic: 'Algebra 101',
                trick_pattern: 'Classic substitution',
                outcomes: 'Master quadratic equations',
                target_date: '2026-03-01'
            })
        });
        const t1CampData = await t1CampRes.json();
        const t1Camp = t1CampData.campaign;
        console.log('✅ Tutor 1 submitted campaign (Status:', t1Camp.status, ')');

        // 3. Login as Tutor 2
        const t2LoginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'tutor.test2@tsh.com', password: 'Password123!' })
        });
        const t2Data = await t2LoginRes.json();
        if (!t2LoginRes.ok) throw new Error(`T2 Login failed: ${t2Data.error}`);
        const t2Token = t2Data.token;
        console.log('✅ Tutor 2 logged in');

        // 4. Verify Tutor 2 cannot see Tutor 1's campaign
        const t2CampsRes = await fetch(`${API_URL}/campaigns`, {
            headers: { 'Authorization': `Bearer ${t2Token}` }
        });
        const t2CampsData = await t2CampsRes.json();
        const t1ItemFound = t2CampsData.campaigns.find(c => c.id === t1Camp.id);
        if (!t1ItemFound) {
            console.log('✅ Isolation Verified: Tutor 2 cannot see Tutor 1\'s campaigns');
        } else {
            console.error('❌ Isolation Failed: Tutor 2 saw Tutor 1\'s campaign!');
        }

        // 5. Login as HOD
        const hodLoginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'w2.hod@tsh.com', password: 'Password123!' })
        });
        const hodData = await hodLoginRes.json();
        if (!hodLoginRes.ok) throw new Error(`HOD Login failed: ${hodData.error}`);
        const hodToken = hodData.token;
        console.log('✅ HOD logged in');

        // 6. HOD submits a campaign (Auto-approval check)
        const hodCampRes = await fetch(`${API_URL}/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hodToken}`
            },
            body: JSON.stringify({
                subject: 'Biology',
                topic: 'Genetics',
                trick_pattern: 'Punnett squares',
                outcomes: 'Understand inheritance',
                target_date: '2026-03-05'
            })
        });
        const hodCampData = await hodCampRes.json();
        const hodCamp = hodCampData.campaign;
        console.log('✅ HOD submitted campaign (Status:', hodCamp.status, ')');
        if (hodCamp.status === 'approved') {
            console.log('✅ Auto-approval Verified: HOD campaign is auto-approved');
        } else {
            console.error('❌ Auto-approval Failed: HOD campaign status is', hodCamp.status);
        }

        // 7. HOD sees ALL campaigns
        const allCampsRes = await fetch(`${API_URL}/campaigns`, {
            headers: { 'Authorization': `Bearer ${hodToken}` }
        });
        const allCampsData = await allCampsRes.json();
        const foundT1 = allCampsData.campaigns.find(c => c.id === t1Camp.id);
        const foundHod = allCampsData.campaigns.find(c => c.id === hodCamp.id);
        if (foundT1 && foundHod) {
            console.log('✅ Oversight Verified: HOD can see both tutor and own campaigns');
        } else {
            console.error('❌ Oversight Failed: HOD missing campaigns in list');
        }

        // 8. Analytics Tagging check
        if (allCampsData.campaigns.some(c => c.creator_role)) {
            console.log('✅ Analytics Tagging Verified: creator_role present in response');
        } else {
            console.error('❌ Analytics Tagging Failed: creator_role missing');
        }

        console.log('\n✨ Phase 2 Backend Verification Complete!');
    } catch (error) {
        console.error('❌ Verification Error:', error.message);
    }
}

test();
