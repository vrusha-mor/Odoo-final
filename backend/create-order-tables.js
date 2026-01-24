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
    const client = await pool.connect();
    
    console.log("Dropping old order tables...");
    await client.query("DROP TABLE IF EXISTS order_items CASCADE");
    await client.query("DROP TABLE IF EXISTS orders CASCADE");

    console.log("Creating orders table...");
    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER, -- Nullable for anonymous POS
        total_amount NUMERIC(10,2) NOT NULL,
        tax_amount NUMERIC(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending', 
        payment_method VARCHAR(20), 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating order_items table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Order tables created successfully.");
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Error creating order tables:", err);
    process.exit(1);
  }
}
run();
