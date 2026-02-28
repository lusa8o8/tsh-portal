require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { id: 1, email: 'hod@example.com', role: 'hod', name: 'Test HOD' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

async function testApis() {
    console.log("=== Campaign Approvals ===");
    const res1 = await fetch('http://localhost:3001/api/campaigns?status=pending_approval', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Status:", res1.status);
    console.log("Data:", await res1.json());

    console.log("\n=== Strategic View: Assessments ===");
    const res2 = await fetch('http://localhost:3001/api/assessments', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Status:", res2.status);
    console.log("Data:", await res2.json());

    console.log("\n=== Strategic View: Approved Campaigns ===");
    const res3 = await fetch('http://localhost:3001/api/campaigns?status=approved', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Status:", res3.status);
    console.log("Data:", await res3.json());
}

testApis();
