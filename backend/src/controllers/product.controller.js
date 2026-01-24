const db = require('../config/db');

exports.getProducts = async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
            ORDER BY p.id ASC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

exports.createProduct = async (req, res) => {
    const { name, category_id, price, tax_percent, is_active } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO products (name, category_id, price, tax_percent, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, category_id, price, tax_percent, is_active !== undefined ? is_active : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating product' });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, category_id, price, tax_percent, is_active } = req.body;
    try {
        const result = await db.query(
            "UPDATE products SET name=$1, category_id=$2, price=$3, tax_percent=$4, is_active=$5 WHERE id=$6 RETURNING *",
            [name, category_id, price, tax_percent, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        // Soft separate: Mark as inactive instead of deleting
        const result = await db.query("UPDATE products SET is_active = false WHERE id=$1 RETURNING *", [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting product' });
    }
};
