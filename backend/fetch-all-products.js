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
    const res = await client.query('SELECT name FROM products ORDER BY name');
    console.log("--- PRODUCT LIST START ---");
    res.rows.forEach(r => console.log(r.name));
    console.log("--- PRODUCT LIST END ---");
    client.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
