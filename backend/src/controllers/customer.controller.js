const db = require('../config/db');

exports.getCustomers = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.*, 
                0 as total_sales
            FROM customers c
            ORDER BY c.name ASC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching customers' });
    }
};

exports.getCustomerDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM customers WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching customer details' });
    }
};

exports.createCustomer = async (req, res) => {
    const { name, email, phone, street1, street2, city, state, country, zip_code } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO customers (name, email, phone, street1, street2, city, state, country, zip_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [name, email, phone, street1, street2, city, state, country, zip_code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating customer' });
    }
};

exports.updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, street1, street2, city, state, country, zip_code } = req.body;
    try {
        const result = await db.query(
            "UPDATE customers SET name=$1, email=$2, phone=$3, street1=$4, street2=$5, city=$6, state=$7, country=$8, zip_code=$9 WHERE id=$10 RETURNING *",
            [name, email, phone, street1, street2, city, state, country, zip_code, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating customer' });
    }
};
