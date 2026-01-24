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
    
    // 0. Ensure Floors Table Exists and Seeded
    console.log("0. Setting up Floors...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS floors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL
      );
    `);
    
    // Seed Floors
    await client.query(`
      INSERT INTO floors (id, name) VALUES (1, 'Floor 1'), (2, 'Floor 2')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("1. Adding table_id to orders...");
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='table_id') THEN 
          ALTER TABLE orders ADD COLUMN table_id INTEGER REFERENCES tables(id); 
        END IF; 
      END $$;
    `);

    console.log("2. Updating Existing Tables to Floor 1...");
    // Fix null floor_ids
    await client.query("UPDATE tables SET floor_id = 1 WHERE floor_id IS NULL");

    console.log("3. Seeding Floor 2 Tables...");
    const floor2Tables = [
      { num: '21', seats: 4 },
      { num: '22', seats: 2 },
      { num: '23', seats: 6 },
      { num: '24', seats: 4 },
      { num: '25', seats: 2 },
      { num: '26', seats: 8 }
    ];

    for (const t of floor2Tables) {
      const res = await client.query("SELECT id FROM tables WHERE table_number = $1", [t.num]);
      if (res.rows.length === 0) {
        await client.query(
          "INSERT INTO tables (table_number, seats, floor_id) VALUES ($1, $2, 2)",
          [t.num, t.seats]
        );
      } else {
        await client.query("UPDATE tables SET floor_id = 2 WHERE table_number = $1", [t.num]);
      }
    }

    console.log("Migration complete.");
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Error running migration:", err);
    process.exit(1);
  }
}
run();
