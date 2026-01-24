const axios = require('axios');

async function testProductManagement() {
    try {
        const uniqueId = Date.now();
        const email = `prod_test_${uniqueId}@example.com`;
        
        console.log("0. Signup/Login...");
        await axios.post('http://localhost:3001/auth/signup', {
            name: 'Product Tester',
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

        // 1. Create Category
        console.log("1. Creating Category...");
        const catRes = await axios.post('http://localhost:3001/categories', {
            name: `Cat_${uniqueId}`,
            is_active: true
        }, { headers });
        const catId = catRes.data.id;
        console.log("✅ Category Created:", catId);

        // 2. Create Product
        console.log("2. Creating Product...");
        const prodRes = await axios.post('http://localhost:3001/products', {
            name: `Prod_${uniqueId}`,
            category_id: catId,
            price: 100,
            tax_percent: 5,
            is_active: true
        }, { headers });
        const prodId = prodRes.data.id;
        console.log("✅ Product Created:", prodId);

        // 3. Try to Delete Category (Should Fail if FK exists and no cascade)
        console.log("3. Attempting to Delete Category (Expect Error)...");
        try {
            await axios.delete(`http://localhost:3001/categories/${catId}`, { headers });
            console.log("⚠️ Category Deleted (Unexpected if FK exists)");
        } catch (err) {
            console.log("✅ Category Delete Failed Expectedly:", err.response?.data?.message || err.message);
        }

        // 4. Delete Product
        console.log("4. Deleting Product...");
        await axios.delete(`http://localhost:3001/products/${prodId}`, { headers });
        console.log("✅ Product Deleted");

        // 5. Delete Category Step 2
        console.log("5. Deleting Category (Should Succeed now)...");
        await axios.delete(`http://localhost:3001/categories/${catId}`, { headers });
        console.log("✅ Category Deleted");

    } catch (err) {
        console.error("❌ Error:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

testProductManagement();
