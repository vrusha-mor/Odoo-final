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
    
    console.log("--- TABLE SCHEMAS ---");

    const tableCols = await client.query(`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name IN ('tables', 'orders')
        ORDER BY table_name, ordinal_position;
    `);
    
    // Group by table
    const byTable = {};
    tableCols.rows.forEach(r => {
        if (!byTable[r.table_name]) byTable[r.table_name] = [];
        byTable[r.table_name].push(r.column_name);
    });

    console.log(JSON.stringify(byTable, null, 2));

    client.release();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
