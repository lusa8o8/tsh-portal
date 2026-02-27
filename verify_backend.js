// Verification script using native fetch

async function test() {
    console.log('--- Starting Backend Verification ---');

    // 1. Health check
    try {
        const res = await fetch('http://localhost:3001/api/health');
        const data = await res.json();
        console.log('Health check:', data.status === 'ok' ? '✅ PASS' : '❌ FAIL');
    } catch (e) {
        console.error('Health check failed:', e.message);
    }

    // 2. Register test user
    const testUser = {
        email: `test-${Date.now()}@tsh.com`,
        name: 'Test Tutor',
        role: 'tutor',
        password: 'password123'
    };

    try {
        const res = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const data = await res.json();
        if (data.id) console.log('Registration:', '✅ PASS');
        else console.log('Registration:', '❌ FAIL', data);
    } catch (e) {
        console.error('Registration failed:', e.message);
    }

    // 3. Login
    let token;
    try {
        const res = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });
        const data = await res.json();
        if (data.token) {
            token = data.token;
            console.log('Login:', '✅ PASS');
        } else {
            console.log('Login:', '❌ FAIL', data);
        }
    } catch (e) {
        console.error('Login failed:', e.message);
    }

    // 4. Verify static serving
    try {
        const res = await fetch('http://localhost:3001/index.html');
        if (res.status === 200) console.log('Static Serving (index.html):', '✅ PASS');
        else console.log('Static Serving (index.html):', '❌ FAIL', res.status);
    } catch (e) {
        console.error('Static serving check failed:', e.message);
    }

    console.log('--- Verification Complete ---');
}

test();
