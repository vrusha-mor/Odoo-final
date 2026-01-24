const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleware

        // 1. Last Login (Last Opened)
        const userRes = await db.query("SELECT last_login FROM users WHERE id = $1", [userId]);
        const lastLogin = userRes.rows[0]?.last_login;

        // 2. Daily Sales (Today)
        // Reset at 12 am automatically by using CURRENT_DATE
        const salesRes = await db.query(`
            SELECT SUM(total_amount) as total 
            FROM orders 
            WHERE status = 'completed' 
            AND created_at >= CURRENT_DATE
        `);
        const totalSales = salesRes.rows[0]?.total || 0;

        res.json({
            lastOpened: lastLogin || new Date(),
            dailySales: parseFloat(totalSales)
        });

    } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        res.status(500).json({ message: "Error fetching stats" });
    }
};
