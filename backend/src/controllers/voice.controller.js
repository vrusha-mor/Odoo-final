const multer = require('multer');
const db = require('../config/db');

// Configure upload
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

exports.processVoice = [
    upload.single('audio'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No audio file uploaded' });
            }

            // TODO: Integrate with actual Speech-to-Text service
            // Currently using mock parsing for demo purposes
            
            // Mock extracted items - In real app, this comes from STT -> NLU
            const detectedItems = [
                { name: 'Masala Dosa', quantity: 2 },
                { name: 'Filter Coffee', quantity: 1 }
            ];

            let totalAmount = 0;
            const finalItems = [];

            // 1. Resolve Products from DB
            for (const item of detectedItems) {
                // Case insensitive search
                const productRes = await db.query(
                    "SELECT * FROM products WHERE LOWER(name) LIKE LOWER($1)", 
                    [`%${item.name}%`]
                );

                if (productRes.rows.length > 0) {
                    const product = productRes.rows[0];
                    const price = parseFloat(product.price);
                    totalAmount += price * item.quantity;
                    
                    finalItems.push({
                        id: product.id,
                        name: product.name,
                        price: price,
                        quantity: item.quantity
                    });
                } else {
                     // Fallback for demo if product not found (shouldn't happen with correct seed)
                     const mockPrice = 100; 
                     totalAmount += mockPrice * item.quantity;
                     finalItems.push({
                        id: 9999, // Placeholder
                        name: item.name,
                        price: mockPrice,
                        quantity: item.quantity
                     });
                }
            }
            
            const taxAmount = totalAmount * 0.05;
            const finalTotal = totalAmount + taxAmount;

            // 2. Insert into DB (Transaction)
            const client = await db.pool.connect();
            let newOrderId;

            try {
                await client.query('BEGIN');

                // Create Order
                const orderRes = await client.query(
                    `INSERT INTO orders (customer_id, total_amount, tax_amount, status, payment_method, created_at) 
                     VALUES (NULL, $1, $2, 'pending', NULL, NOW()) RETURNING id`,
                    [finalTotal, taxAmount]
                );
                newOrderId = orderRes.rows[0].id;

                // Insert Items
                for (const item of finalItems) {
                     // If it's a real product
                     if (item.id !== 9999) {
                        await client.query(
                            `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
                            [newOrderId, item.id, item.quantity, item.price]
                        );
                     }
                }

                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 1500));

            return res.status(200).json({
                success: true,
                orderId: newOrderId,
                items: finalItems,
                transcription: "2 dosa and 1 coffee (Processed)"
            });

        } catch (error) {
            console.error('Voice processing error:', error);
            res.status(500).json({ success: false, message: 'Internal server error processing voice' });
        }
    }
];
