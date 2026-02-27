const http = require('http');

async function check() {
    try {
        console.log("Simulating tutor checking duplicate drives...");

        // Simulating the backend POST directly using fetch if we were in browser
        // Since we're in Node, we can send a simple HTTP request
        const postData = JSON.stringify({ driveLinks: ['http://test.com'] });

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/assets/check-duplicate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                // Emulating tutor auth headers
                'Authorization': `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhmNTk4MzExLTlhYTUtNGVkYi1hOTBjLTdkNzA2ZWY1NDU0NyIsImVtYWlsIjoidHV0b3JAdHNoLmNvbSIsIm5hbWUiOiJUeWVyIE1hY2tvbGEiLCJyb2xlIjoidHV0b3IiLCJpYXQiOjE3NDAxNzg2NTgsImV4cCI6MTc0MDI2NTA1OH0.8wQyX2yY45P'}`
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log("Check duplicate response:", res.statusCode, data);
            });
        });

        req.on('error', (e) => console.error(e));
        req.write(postData);
        req.end();
    } catch (err) {
        console.error(err);
    }
}

check();
