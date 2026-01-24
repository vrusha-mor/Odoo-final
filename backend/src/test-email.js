require('dotenv').config();
const nodemailer = require('nodemailer');

async function testConnection() {
    console.log("--- Email Configuration Test ---");
    console.log("User:", process.env.EMAIL_USER);
    console.log("Pass:", process.env.EMAIL_PASS ? "****" + process.env.EMAIL_PASS.slice(-4) : "MISSING");
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    console.log("\nVerifying connection...");
    try {
        await transporter.verify();
        console.log("✅ SUCCESS: Your Gmail configuration is correct!");
    } catch (error) {
        console.error("❌ FAILED: Connection rejected.");
        console.error("\nError Message:", error.message);
        
        if (error.message.includes('534 5.7.9')) {
            console.log("\n💡 SOLUTION:");
            console.log("1. You HAVE 2-Step Verification enabled.");
            console.log("2. Your regular Gmail password will NOT work.");
            console.log("3. You MUST generate an 'App Password' at: https://myaccount.google.com/apppasswords");
            console.log("4. Use the 16-character code in your .env file.");
        }
    }
}

testConnection();
