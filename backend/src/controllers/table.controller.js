const db = require('../config/db');

exports.getTables = async (req, res) => {
    try {
        // Fetch tables and check for ACTIVE orders (pending/preparing)
        // We use LEFT JOIN to find if there is any active order for the table
        const query = `
            SELECT t.*, 
                   CASE WHEN EXISTS (
                       SELECT 1 FROM orders o 
                       WHERE o.table_id = t.id 
                       AND o.status IN ('pending', 'preparing')
                   ) THEN true ELSE false END as is_occupied
            FROM tables t
            WHERE t.is_active = true
            ORDER BY t.floor_id ASC, t.table_number ASC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching tables' });
    }
};

exports.getTable = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM tables WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Table not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching table' });
    }
};
