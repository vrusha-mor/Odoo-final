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
    
    console.log("Checking columns in 'public.tables'...");
    
    // Check what columns DO exist
    const currentCols = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tables';
    `);
    
    console.log("Current columns:", currentCols.rows.map(r => r.column_name).join(', '));

    const hasFloorId = currentCols.rows.some(r => r.column_name === 'floor_id');

    if (!hasFloorId) {
        console.log("Column 'floor_id' NOT found in public.tables. Adding it...");
        await client.query(`
            ALTER TABLE public.tables 
            ADD COLUMN floor_id INTEGER DEFAULT 1;
        `);
        console.log("Column 'floor_id' added successfully.");
        
        // Update any existing records
        await client.query("UPDATE public.tables SET floor_id = 1 WHERE floor_id IS NULL");
        console.log("Existing tables updated to floor 1.");
    } else {
        console.log("Column 'floor_id' already exists in public.tables.");
    }

    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
