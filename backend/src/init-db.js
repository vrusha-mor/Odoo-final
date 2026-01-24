const { Pool } = require('pg');
require('dotenv').config();

async function initDB() {
  const dbName = process.env.DB_NAME || 'pos_system';
  
  const adminPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log(`Checking if database '${dbName}' exists...`);
    const res = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (res.rows.length === 0) {
       console.log(`Creating database '${dbName}'...`);
       await adminPool.query(`CREATE DATABASE ${dbName}`);
       console.log(`Database '${dbName}' created.`);
    }
    await adminPool.end();

    const pool = new Pool({
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: dbName,
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    });

    const createTableQuery = `
        DROP TABLE IF EXISTS Odoo Cafe_users;
        DROP TABLE IF EXISTS users CASCADE;
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role_id INTEGER DEFAULT 1,
            otp VARCHAR(6),
            otp_expires_at TIMESTAMP,
            is_verified BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const client = await pool.connect();
    console.log(`Connected to '${dbName}' successfully!`);
    
    await client.query(createTableQuery);
    console.log("Table 'users' is ready with the custom schema.");
    
    client.release();
    await pool.end();
    console.log("Database Setup Complete! 🚀");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database initialization failed!");
    console.error(err.message);
    process.exit(1);
  }
}

initDB();
