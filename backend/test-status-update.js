const axios = require('axios');

async function testStatusUpdate() {
    try {
        const uniqueId = Date.now();
        const email = `status_test_${uniqueId}@example.com`;
        
        console.log("0. Signup/Login...");
        await axios.post('http://localhost:3001/auth/signup', {
            name: 'Status Tester',
            email: email,
            password: 'password123',
            role: '1'
        });

        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: email,
            password: 'password123' 
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log("✅ Logged in.");

        console.log("1. Creating Order (Status: pending)...");
        const orderRes = await axios.post('http://localhost:3001/orders', {
            items: [{ id: 1, quantity: 1, price: 100 }],
            total_amount: 100,
            tax_amount: 5,
            status: 'pending',
            payment_method: 'Cash'
        }, { headers });
        const orderId = orderRes.data.orderId;
        console.log("✅ Order Created:", orderId);

        console.log("2. Updating Status to 'preparing'...");
        const updateRes1 = await axios.patch(`http://localhost:3001/orders/${orderId}/status`, {
            status: 'preparing'
        }, { headers });
        console.log(`✅ Status Updated: ${updateRes1.data.order.status}`);

        console.log("3. Updating Status to 'completed'...");
        const updateRes2 = await axios.patch(`http://localhost:3001/orders/${orderId}/status`, {
            status: 'completed'
        }, { headers });
        console.log(`✅ Status Updated: ${updateRes2.data.order.status}`);

        if (updateRes2.data.order.status === 'completed') {
            console.log("✅ TEST PASSED: Status correctly updated to completed.");
        } else {
            console.error("❌ TEST FAILED: Status mismatch.");
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

testStatusUpdate();
