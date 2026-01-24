require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

// Basic SMTP validation on startup
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("CRITICAL: SMTP Connection Verification Failed on Startup!");
        console.error(error);
    } else {
        console.log("SUCCESS: SMTP server is ready to take our messages");
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});