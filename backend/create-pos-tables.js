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
    
    console.log("Creating tables table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        floor_id INTEGER DEFAULT 1,
        table_number VARCHAR(20) NOT NULL UNIQUE,
        seats INTEGER DEFAULT 4,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Seeding tables...");
    const tables = [
      { num: '1', seats: 4 },
      { num: '2', seats: 2 },
      { num: '3', seats: 4 },
      { num: '4', seats: 6 },
      { num: '5', seats: 4 },
      { num: '6', seats: 2 },
      { num: '7', seats: 4 }
    ];

    for (const t of tables) {
      // Check if exists first to avoid complex upsert unique constraint issues if index names vary
      const res = await client.query("SELECT id FROM tables WHERE table_number = $1", [t.num]);
      if (res.rows.length === 0) {
        await client.query(
          "INSERT INTO tables (table_number, seats) VALUES ($1, $2)",
          [t.num, t.seats]
        );
      }
    }

    console.log("Tables created and seeded successfully.");
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Error creating tables:", err);
    process.exit(1);
  }
}
run();
