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
    
    console.log("--- TABLES PER FLOOR ---");
    const tables = await client.query("SELECT floor_id, COUNT(*) FROM tables GROUP BY floor_id");
    console.table(tables.rows);

    console.log("\n--- RECENT ORDERS ---");
    const orders = await client.query("SELECT id, status, table_id, total_amount, created_at FROM orders ORDER BY created_at DESC LIMIT 5");
    console.table(orders.rows);

    console.log("\n--- CHECKING SPECIFIC TABLE (e.g. Table 1) ---");
    const t1 = await client.query(`
        SELECT t.id, t.table_number, 
               EXISTS (SELECT 1 FROM orders o WHERE o.table_id = t.id AND o.status IN ('pending', 'preparing')) as is_occupied
        FROM tables t 
        WHERE table_number = '1'
    `);
    console.table(t1.rows);

    client.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
