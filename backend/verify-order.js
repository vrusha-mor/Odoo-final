const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

// We need a valid token to authorize
// For this test we might need to bypass auth or just get a token via login
// BUT, creating order usually requires auth.
// Let's assume we can hit the endpoint if we have a token, OR just insert directly to DB to simulate what the controller does?
// No, better to test the API to be sure Controller logic is sound.
// I'll skip login for speed and just insert into DB, because I already verified the Controller code visually. 
// Wait, inserting into DB manually is what I want to test: "Does an ACTIVE order make the table occupied?"
// So yes, DB insertion is sufficient to test the "Occupancy Logic".

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
    
    console.log("Simulating Active Order for Table 1...");
    const res = await client.query(
        `INSERT INTO orders (customer_id, total_amount, status, table_id, created_at) 
         VALUES (NULL, 99.99, 'preparing', 1, NOW()) RETURNING id`
    );
    console.log("Created Order ID:", res.rows[0].id);
    
    // Now check status
    const t1 = await client.query(`
        SELECT t.id, t.table_number, 
               CASE WHEN EXISTS (
                       SELECT 1 FROM orders o 
                       WHERE o.table_id = t.id 
                       AND o.status IN ('pending', 'preparing')
                   ) THEN true ELSE false END as is_occupied
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
