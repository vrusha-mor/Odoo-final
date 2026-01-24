const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
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
    console.log("Checking for last_login column...");
    
    // Check if column exists
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='last_login'
    `);

    if (res.rows.length === 0) {
        console.log("Adding last_login column to users table...");
        await client.query("ALTER TABLE users ADD COLUMN last_login TIMESTAMP");
        console.log("Column added successfully.");
    } else {
        console.log("Column already exists.");
    }
    
  } catch (err) {
    console.error("Error updating users table:", err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
