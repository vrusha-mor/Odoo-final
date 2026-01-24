const db = require('../config/db');
const sendMail = require("../services/mail.service");

exports.getPayments = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id,
                p.amount,
                p.status,
                p.created_at,
                p.transaction_id,
                pm.name as method_name
            FROM payments p
            LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
            ORDER BY p.created_at DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

exports.recordPayment = async (req, res) => {
    try {
        const { amount, method, transactionId, orderId, status = 'success' } = req.body;
        
        // Find method ID
        const methodRes = await db.query("SELECT id FROM payment_methods WHERE name = $1", [method]);
        const methodId = methodRes.rows[0]?.id;

        if (!methodId) {
            return res.status(400).json({ message: "Invalid payment method" });
        }

        const query = `
            INSERT INTO payments (amount, payment_method_id, transaction_id, order_id, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await db.query(query, [amount, methodId, transactionId || null, orderId || null, status]);
        res.status(201).json({ success: true, payment: result.rows[0] });
    } catch (err) {
        console.error("Error recording payment:", err);
        res.status(500).json({ message: "Error recording payment", error: err.message });
    }
};

exports.getPaymentStatus = async (req, res) => {
    const { orderId } = req.params;
    try {
        const result = await db.query("SELECT status FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1", [orderId]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Payment not found" });
        res.json({ status: result.rows[0].status });
    } catch (err) {
        console.error("Error fetching status:", err);
        res.status(500).json({ message: "Error" });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
    try {
        await db.query("UPDATE payments SET status = $1 WHERE order_id = $2", [status, orderId]);
        
        // If success, update order too
        if (status === 'success') {
             await db.query("UPDATE orders SET status = 'completed' WHERE id = $1", [orderId]);
        }
        
        res.json({ message: "Updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating" });
    }
};

exports.sendReceipt = async (req, res) => {
  try {
    const { email, amount, items } = req.body;
    console.log(`Attempting to send receipt to ${email} for amount ${amount} with ${items?.length || 0} items`);
    const result = await sendMail(email, amount, items);
    console.log(`Receipt successfully handled for ${email}`);
    res.json({ 
        success: true, 
        previewUrl: result.previewUrl || null 
    });
  } catch (error) {
    console.error("Error in sendReceipt controller:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message, 
      error: "SMTP_AUTH_ERROR" 
    });
  }
};
