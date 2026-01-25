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
    
    console.log("Checking columns in 'public.orders'...");
    
    // Check what columns DO exist
    const currentCols = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders';
    `);
    
    console.log("Current columns:", currentCols.rows.map(r => r.column_name).join(', '));

    const hasTableId = currentCols.rows.some(r => r.column_name === 'table_id');

    if (!hasTableId) {
        console.log("Column 'table_id' NOT found in public.orders. Adding it...");
        await client.query(`
            ALTER TABLE public.orders 
            ADD COLUMN table_id INTEGER;
        `);
        console.log("Column 'table_id' added successfully.");
        
    } else {
        console.log("Column 'table_id' already exists in public.orders.");
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
