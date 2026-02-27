async function test() {
    console.log('🚀 Starting Phase 1 Backend Verification...');
    const API_URL = 'http://localhost:3001/api';

    // 1. Register a new tutor
    console.log('\n--- 1. Testing Registration ---');
    const testTutor = {
        name: 'Test Tutor ' + Date.now(),
        email: 'tutor.' + Date.now() + '@example.com',
        password: 'Password123!',
        subjects: ['Math (HS)', 'Physics (Uni)']
    };

    try {
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testTutor)
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.error || 'Registration failed');
        console.log('✅ Registration successful:', regData.message);
    } catch (err) {
        console.error('❌ Registration failed:', err.message);
        process.exit(1);
    }

    // 2. Try to login (should fail because pending)
    console.log('\n--- 2. Testing Login (Pending) ---');
    try {
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testTutor.email, password: testTutor.password })
        });
        const loginData = await loginRes.json();
        if (loginRes.status === 403) {
            console.log('✅ Login correctly blocked for pending user:', loginData.error);
        } else if (loginRes.ok) {
            console.error('❌ Error: Login should have failed for pending user');
            process.exit(1);
        } else {
            console.error('❌ Unexpected login error:', loginData.error || loginRes.statusText);
            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Connection error:', err.message);
        process.exit(1);
    }

    // 3. Login as Admin (HOD promoted)
    console.log('\n--- 3. Testing Admin Access ---');
    let adminToken = '';
    try {
        const adminRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'hod@tsh.com', password: 'password123' })
        });
        const adminData = await adminRes.json();
        if (!adminRes.ok) throw new Error(adminData.error || 'Admin login failed');
        adminToken = adminData.token;
        console.log('✅ Admin login successful');
    } catch (err) {
        console.error('❌ Admin login failed:', err.message);
        process.exit(1);
    }

    // 4. Get pending users
    console.log('\n--- 4. List Pending Users ---');
    let pendingUserId = '';
    try {
        const usersRes = await fetch(`${API_URL}/users?status=pending`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const usersData = await usersRes.json();
        const pendingUser = usersData.find(u => u.email === testTutor.email);
        if (pendingUser) {
            pendingUserId = pendingUser.id;
            console.log('✅ Pending user found in list:', pendingUser.name);
        } else {
            console.error('❌ Pending user not found in admin list');
            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Failed to fetch users:', err.message);
        process.exit(1);
    }

    // 5. Approve User
    console.log('\n--- 5. Testing Approval ---');
    try {
        const approveRes = await fetch(`${API_URL}/users/${pendingUserId}/approve`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const approveData = await approveRes.json();
        if (!approveRes.ok) throw new Error(approveData.error || 'Approval failed');
        console.log('✅ User approved:', approveData.message);
    } catch (err) {
        console.error('❌ Approval failed:', err.message);
        process.exit(1);
    }

    // 6. Login as Approved User
    console.log('\n--- 6. Testing Login (Approved) ---');
    try {
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testTutor.email, password: testTutor.password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || 'Login failed');
        console.log('✅ Login successful for approved user:', loginData.user.name);
    } catch (err) {
        console.error('❌ Login failed for approved user:', err.message);
        process.exit(1);
    }

    console.log('\n🎉 ALL BACKEND TESTS PASSED!');
}

test();
