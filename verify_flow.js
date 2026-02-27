// TSH ERP - Week 1 Flow Verification Script
// This script simulates the Tutor -> HOD -> Marketing/CRM flow

const API_URL = 'http://localhost:3001/api';

async function verify() {
    console.log('🚀 Starting Week 1 Flow Verification...');

    try {
        // 1. Register Users (Admin, Tutor, HOD, Marketing, CRM)
        const roles = ['tutor', 'hod', 'marketing', 'crm'];
        const users = {};

        for (const role of roles) {
            console.log(`Creating ${role}...`);
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: `${role}@tsh.com`,
                    name: `Test ${role.toUpperCase()}`,
                    role: role,
                    password: 'password123'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(`Failed to create ${role}: ${data.error}`);
            users[role] = data.user;
        }

        // 2. Login as Tutor
        console.log('Logging in as Tutor...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'tutor@tsh.com', password: 'password123' })
        });
        const { token: tutorToken } = await loginRes.json();

        // 3. Submit Campaign
        console.log('Submitting Campaign...');
        const campRes = await fetch(`${API_URL}/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tutorToken}`
            },
            body: JSON.stringify({
                subject: 'Biology',
                topic: 'Cell Division',
                trick_pattern: 'Mitosis vs Meiosis stages',
                outcomes: 'Students can identify each phase',
                target_date: '2026-03-01'
            })
        });
        const { campaign } = await campRes.json();
        console.log(`Campaign Created: ${campaign.id} (Status: ${campaign.status})`);

        // 4. Login as HOD
        console.log('Logging in as HOD...');
        const hodLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'hod@tsh.com', password: 'password123' })
        });
        const { token: hodToken } = await hodLogin.json();

        // 5. Approve Campaign
        console.log('Approving Campaign...');
        const approveRes = await fetch(`${API_URL}/campaigns/${campaign.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hodToken}`
            },
            body: JSON.stringify({ status: 'approved' })
        });
        const { campaign: approvedCamp } = await approveRes.json();
        console.log(`Campaign Approved (Status: ${approvedCamp.status})`);

        // 6. Verify Notifications (Marketing/CRM)
        const checkRoles = ['marketing', 'crm'];
        for (const role of checkRoles) {
            console.log(`Verifying Notifications for ${role}...`);
            const notifRes = await fetch(`${API_URL}/notifications?role=${role}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${hodToken}` // HOD can check by role in this trust-based system
                }
            });
            const { notifications } = await notifRes.json();
            const found = notifications.find(n => n.campaign_id === campaign.id);
            if (found) {
                console.log(`✅ ${role} received notification: "${found.message}"`);
            } else {
                throw new Error(`❌ ${role} DID NOT receive notification for campaign ${campaign.topic}`);
            }
        }

        console.log('\n✨ WEEK 1 VERTICAL SLICE VERIFIED SUCCESSFULLY! ✨');

    } catch (e) {
        console.error('❌ Verification Failed:', e.message);
    }
}

verify();
