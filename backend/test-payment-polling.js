const axios = require('axios');

async function testPaymentPolling() {
    try {
        const uniqueId = Date.now();
        const email = `polling_test_${uniqueId}@example.com`;
        
        console.log("0. Signup/Login...");
        await axios.post('http://localhost:3001/auth/signup', {
            name: 'Polling Tester',
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

        // 1. Create Pending Order
        console.log("1. Creating Pending Order...");
        const orderRes = await axios.post('http://localhost:3001/orders', {
            items: [{ id: 1, quantity: 1, price: 50 }],
            total_amount: 52.5,
            tax_amount: 2.5,
            status: 'pending',
            payment_method: 'UPI'
        }, { headers });
        const orderId = orderRes.data.orderId;
        console.log("✅ Order Created:", orderId);

        // 2. Create Pending Payment
        console.log("2. Creating Pending Payment...");
        const paymentRes = await axios.post('http://localhost:3001/payment', {
            amount: 52.5,
            method: 'UPI',
            transactionId: `TXN_TEST_${uniqueId}`,
            orderId: orderId,
            status: 'pending'
        }, { headers });
        console.log("✅ Payment Created:", paymentRes.data.payment.status);

        // 3. Check Status (Should be pending)
        const statusRes1 = await axios.get(`http://localhost:3001/payment/status/${orderId}`, { headers });
        console.log("3. Initial Status Check:", statusRes1.data.status);
        if (statusRes1.data.status !== 'pending') throw new Error("Status mismatch");

        // 4. Update Status to Success (Simulate Webhook)
        console.log("4. Updating Status to Success...");
        await axios.patch(`http://localhost:3001/payment/status/${orderId}`, {
            status: 'success'
        }, { headers });
        console.log("✅ Update Sent.");

        // 5. Check Status Again (Should be success)
        const statusRes2 = await axios.get(`http://localhost:3001/payment/status/${orderId}`, { headers });
        console.log("5. Final Status Check:", statusRes2.data.status);
        if (statusRes2.data.status === 'success') {
            console.log("✅ POLL TEST PASSED");
        } else {
            console.error("❌ POLL TEST FAILED");
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

testPaymentPolling();
