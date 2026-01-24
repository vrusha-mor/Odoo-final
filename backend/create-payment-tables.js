const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
// fallback to root .env if backend/.env missing
if (!process.env.DB_USER) {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : undefined,
  port: process.env.DB_PORT,
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("Creating payment tables...");

    // DROP to ensure clean slate if schema changed
    await client.query("DROP TABLE IF EXISTS payments CASCADE");
    await client.query("DROP TABLE IF EXISTS payment_methods CASCADE");

    // Create payment_methods table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL, -- 'cash', 'card', 'upi', 'other'
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id), -- Nullable if simple POS without strict order linking yet
        amount DECIMAL(10, 2) NOT NULL,
        payment_method_id INTEGER REFERENCES payment_methods(id),
        status VARCHAR(20) DEFAULT 'success', -- success, pending, failed
        transaction_id VARCHAR(100), -- For Card/UPI refs
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed Payment Methods
    const methods = [
      { name: 'Cash', type: 'cash' },
      { name: 'Card', type: 'card' },
      { name: 'UPI', type: 'upi' }
    ];

    for (const m of methods) {
      const res = await client.query("SELECT id FROM payment_methods WHERE name = $1", [m.name]);
      if (res.rows.length === 0) {
        await client.query(
          "INSERT INTO payment_methods (name, type) VALUES ($1, $2)",
          [m.name, m.type]
        );
      }
    }

    console.log("Payment tables created and seeded successfully.");
  } catch (err) {
    console.error("Error creating payment tables:", err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
