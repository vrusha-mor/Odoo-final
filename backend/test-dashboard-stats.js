const axios = require('axios');

async function testStats() {
    try {
        // 0. Login
        const uniqueId = Date.now();
        const email = `stats_test_${uniqueId}@example.com`;
        
        console.log("0. Signup/Login...");
        // Signup first to ensure user exists
        await axios.post('http://localhost:3001/auth/signup', {
            name: 'Stats User',
            email: email,
            password: 'password123',
            role: '1'
        });

        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: email,
            password: 'password123' 
        });
        const token = loginRes.data.token;
        console.log("✅ Logged in. Token obtained.");

        // 1. Fetch Stats
        console.log("1. Fetching Stats...");
        const statsRes = await axios.get('http://localhost:3001/dashboard/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("✅ Stats:", statsRes.data);
        
        if (statsRes.data.hasOwnProperty('lastOpened') && statsRes.data.hasOwnProperty('dailySales')) {
            console.log("✅ Structure correct.");
        } else {
            console.error("❌ Invalid structure");
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

testStats();
