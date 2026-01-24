const db = require('../config/db');

exports.getOrders = async (req, res) => {
    try {
        const query = `
            SELECT 
                o.*, 
                c.name as customer_name
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            ORDER BY o.created_at DESC
        `;
        let result;
        try {
            result = await db.query(query);
        } catch (e) {
            result = await db.query("SELECT * FROM orders ORDER BY created_at DESC");
        }
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

exports.getOrderDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const orderResult = await db.query("SELECT * FROM orders WHERE id = $1", [id]);
        if (orderResult.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        
        const itemsResult = await db.query(`
            SELECT oi.*, p.name as product_name
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = $1
        `, [id]);
        
        res.json({
            ...orderResult.rows[0],
            items: itemsResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching order details' });
    }
};

exports.createOrder = async (req, res) => {
    const { customer_id, items, total_amount, tax_amount, status, payment_method, table_id } = req.body;
    
    // items: [{ id, quantity, price }]
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Create Order
        const orderRes = await client.query(
            `INSERT INTO orders (customer_id, total_amount, tax_amount, status, payment_method, table_id, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
            [customer_id || null, total_amount, tax_amount, status || 'pending', payment_method || null, table_id || null]
        );
        const orderId = orderRes.rows[0].id;

        // 2. Insert Items
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
                [orderId, item.id, item.quantity, item.price]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Order creation error:", err);
        res.status(500).json({ message: 'Error creating order' });
    } finally {
        client.release();
    }
};
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const result = await db.query(
            "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order status updated", order: result.rows[0] });
    } catch (err) {
        console.error("Error updating order status:", err);
        res.status(500).json({ message: "Error updating status" });
    }
};
