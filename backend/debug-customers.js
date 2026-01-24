const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function run() {
  try {
    console.log("--- Checking customers table ---");
    const simple = await pool.query("SELECT * FROM customers");
    console.log(`Found ${simple.rows.length} customers.`);
    console.log(simple.rows);

    console.log("\n--- Testing getCustomers query ---");
    const query = `
            SELECT 
                c.*, 
                COALESCE(SUM(o.total_amount), 0) as total_sales
            FROM customers c
            LEFT JOIN orders o ON c.id = o.customer_id
            GROUP BY c.id
            ORDER BY c.name ASC
    `;
    const complex = await pool.query(query);
    console.log(`Query returned ${complex.rows.length} rows.`);
    console.log(complex.rows);
    
    process.exit(0);
  } catch (err) {
    console.error("Error executing query:", err);
    process.exit(1);
  }
}
run();
