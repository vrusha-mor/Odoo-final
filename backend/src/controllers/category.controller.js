const db = require('../config/db');

exports.getCategories = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM categories WHERE is_active = true ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

exports.createCategory = async (req, res) => {
    const { name, is_active } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO categories (name, is_active) VALUES ($1, $2) RETURNING *",
            [name, is_active !== undefined ? is_active : true]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating category' });
    }
};

exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, is_active } = req.body;
    try {
        const result = await db.query(
            "UPDATE categories SET name=$1, is_active=$2 WHERE id=$3 RETURNING *",
            [name, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating category' });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // Soft delete: Mark as inactive
        const result = await db.query("UPDATE categories SET is_active = false WHERE id=$1 RETURNING *", [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting category' });
    }
};
