const nodemailer = require("nodemailer");
const generateReceipt = require("./receipt.service");

module.exports = async (email, amount, items) => {
  console.log(`Starting mail service for ${email}...`);

  const pdfBuffer = await generateReceipt(amount, items);
  console.log("PDF generated successfully");

  let transporter;
  let usingTestAccount = false;

  // Try primary Gmail first
  try {
    console.log("Attempting to use primary Gmail config...");
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.verify();
    console.log("Primary SMTP Verified!");
  } catch (err) {
    console.warn("Primary Gmail failed. Switching to 'Ethereal' Testing Service...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    usingTestAccount = true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Odoo Cafe" <${process.env.EMAIL_USER || 'pos@Odoo Cafe.com'}>`,
      to: email,
      subject: "Your Payment Receipt - Odoo Cafe",
      text: `Thank you for your payment of ₹${amount}. Please find your receipt attached.`,
      attachments: [{ filename: "receipt.pdf", content: pdfBuffer }]
    });

    console.log("Mail sent successfully:", info.messageId);

    if (usingTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("-----------------------------------------");
      console.log("🔥 TEST EMAIL SENT! 🔥");
      console.log("VIEW YOUR GENUINE RECEIPT HERE:");
      console.log(previewUrl);
      console.log("-----------------------------------------");
      // Return the preview URL so the controller can pass it to frontend if needed
      return { success: true, previewUrl };
    }

    return { success: true };
  } catch (error) {
    console.error("Nodemailer Error Details:", error);
    throw error;
  }
};
