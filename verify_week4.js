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
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(data.error || 'Request failed');
        err.status = res.ok ? 200 : res.status;
        throw err;
    }
    return data;
}

async function verify() {
    console.log('🚀 Week 4: Outcome & Inventory Verification...\n');

    try {
        // 1. Setup: Register Tutor
        const tutorEmail = `tutor4_${Date.now()}@tsh.com`;
        const tutorPass = 'password123';
        await req('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: tutorEmail, name: 'Tutor 4', role: 'tutor', password: tutorPass })
        });
        const { token: tutorToken } = await req('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: tutorEmail, password: tutorPass })
        });
        console.log('✅ Tutor registered and logged in');

        // 2. Create Campaign
        const { campaign } = await req('/campaigns', {
            method: 'POST',
            body: JSON.stringify({ subject: 'Math', topic: 'Calculus Outcomes', trick_pattern: 'Chain rule', outcomes: 'Mastery', target_date: '2026-03-01' })
        }, tutorToken);
        console.log(`✅ Campaign Created: ${campaign.id}`);

        // 3. Register HOD & Login
        const hodEmail = `hod4_${Date.now()}@tsh.com`;
        await req('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: hodEmail, name: 'HOD 4', role: 'hod', password: tutorPass })
        });
        const { token: hodToken } = await req('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: hodEmail, password: tutorPass })
        });
        await req(`/campaigns/${campaign.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }, hodToken);
        console.log('✅ HOD registered and approved campaign');

        // 4. Log Outcome (Tutor)
        console.log('Logging outcome...');
        const outcomeData = {
            outcome_log: '85% students improved in chain rule application.',
            outcome_status: 'improved',
            actual_completion_date: '2026-03-05'
        };
        const { campaign: completedCamp } = await req(`/campaigns/${campaign.id}/outcome`, {
            method: 'PATCH',
            body: JSON.stringify(outcomeData)
        }, tutorToken);

        if (completedCamp.status === 'completed' && completedCamp.outcome_status === 'improved') {
            console.log('✅ Outcome Logged successfully');
        } else {
            throw new Error('Outcome logging failed to update status/fields');
        }

        // 5. Verify Hub Inventory
        // First, create and publish assets (Minimum 3 required)
        const { assets: createdAssets } = await req('/assets', {
            method: 'POST',
            body: JSON.stringify([
                { subject: 'Math', topic: 'Calculus Slides', asset_type: 'slides', drive_link: 'http://drive.com/slides' },
                { subject: 'Math', topic: 'Calculus Worksheet', asset_type: 'worksheet', drive_link: 'http://drive.com/worksheet' },
                { subject: 'Math', topic: 'Calculus Recording', asset_type: 'recording', drive_link: 'http://drive.com/recording' }
            ])
        }, tutorToken);

        const assetId = createdAssets[0].id;
        console.log(`✅ Assets created (Batch of 3)`);

        // HOD approves the first asset
        await req(`/assets/${assetId}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }, hodToken);
        console.log('✅ Asset Approved by HOD');

        // Content Manager registers and logins
        const cmEmail = `cm4_${Date.now()}@tsh.com`;
        await req('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: cmEmail, name: 'CM 4', role: 'content_manager', password: tutorPass })
        });
        const { token: cmToken } = await req('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: cmEmail, password: tutorPass })
        });

        // Content Manager publishes it
        await req(`/assets/${assetId}/publish`, { method: 'PATCH' }, cmToken);
        console.log('✅ Asset Published');

        // Check Inventory
        const { inventory } = await req('/hub/inventory', {}, tutorToken);
        const published = inventory.find(a => a.id === assetId);
        if (published) {
            console.log(`✅ Asset found in Hub Inventory: ${published.topic} (${published.subject})`);
        } else {
            throw new Error('Published asset not found in inventory');
        }

        console.log('\n✨ WEEK 4 VERIFIED SUCCESSFULLY! ✨');
        process.exit(0);
    } catch (e) {
        console.error('\n❌ VERIFICATION FAILED:', e.message);
        if (e.status) console.error('Status:', e.status);
        process.exit(1);
    }
}

verify();
