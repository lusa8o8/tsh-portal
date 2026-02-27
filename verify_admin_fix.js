
async function verifyAdminFix() {
    const API_URL = 'http://localhost:3001/api';
    
    // Login as Admin
    const loginRes = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'w2.hod@tsh.com', password: 'Password123!' })
    });
    const { token } = await loginRes.json();
    console.log(token ? '✅ Admin logged in' : '❌ Admin login failed');

    // Check Dashboard
    const dashRes = await fetch(`${API_URL}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    console.log('Dashboard Counts:', dashData.counts);
    if (dashData.counts && dashData.counts.pending_campaign_approvals !== undefined) {
        console.log('✅ Dashboard metrics verified for Admin');
    } else {
        console.log('❌ Dashboard metrics failed for Admin');
    }

    // Check Campaign Auto-approval as Admin
    const campaignRes = await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            subject: 'Admin Test',
            topic: 'Role Fix Verification',
            trick_pattern: 'N/A',
            outcomes: 'Verify auto-approval works for Admin',
            target_date: '2026-03-10'
        })
    });
    const campaignData = await campaignRes.json();
    console.log('Campaign Status:', campaignData.campaign?.status);
    if (campaignData.campaign?.status === 'approved') {
        console.log('✅ Admin campaign auto-approval verified');
    } else {
        console.log('❌ Admin campaign auto-approval failed');
    }

    // Check Campaign Oversite
    const listRes = await fetch(`${API_URL}/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listRes.json();
    console.log('Campaigns found:', listData.campaigns?.length);
    if (listData.campaigns && listData.campaigns.length > 0) {
        console.log('✅ Admin campaign oversight verified');
    } else {
        console.log('❌ Admin campaign oversight failed');
    }
}

verifyAdminFix().catch(console.error);
