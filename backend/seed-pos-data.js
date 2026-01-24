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
    console.log("Connected to database...");

    // 1. Seed Categories
    const categories = ['Drinks', 'Desserts', 'Quick Bites', 'Snacks', 'Shakes', 'Main Course', 'Starters', 'Mocktails'];
    const catMap = {};

    for (const catName of categories) {
      const res = await client.query(
        "INSERT INTO categories (name, is_active) VALUES ($1, true) ON CONFLICT DO NOTHING RETURNING id",
        [catName]
      );
      
      if (res.rows.length > 0) {
        catMap[catName] = res.rows[0].id;
      } else {
        const fetchRes = await client.query("SELECT id FROM categories WHERE name = $1", [catName]);
        if (fetchRes.rows.length > 0) catMap[catName] = fetchRes.rows[0].id;
      }
    }
    console.log("Categories seeded:", Object.keys(catMap));

    // 2. Seed Products
    const products = [
      // Drinks
      { name: 'Cappuccino', price: 150, cat: 'Drinks' },
      { name: 'Iced Latte', price: 180, cat: 'Drinks' },
      { name: 'Orange Juice', price: 120, cat: 'Drinks' },
      { name: 'Cold Coffee', price: 160, cat: 'Drinks' },
      { name: 'Masala Chai', price: 50, cat: 'Drinks' },

      // Desserts
      { name: 'Chocolate Cake', price: 250, cat: 'Desserts' },
      { name: 'Tiramisu', price: 300, cat: 'Desserts' },
      { name: 'Cheesecake', price: 280, cat: 'Desserts' },
      { name: 'Brownie with Ice Cream', price: 220, cat: 'Desserts' },
      { name: 'Fruit Salad', price: 150, cat: 'Desserts' },

      // Quick Bites
      { name: 'French Fries', price: 100, cat: 'Quick Bites' },
      { name: 'Garlic Bread', price: 120, cat: 'Quick Bites' },
      { name: 'Chicken Nuggets', price: 180, cat: 'Quick Bites' },
      { name: 'Maggie Masala', price: 80, cat: 'Quick Bites' },
      { name: 'Cheese Maggie', price: 100, cat: 'Quick Bites' },
      { name: 'Peri Peri Fries', price: 120, cat: 'Quick Bites' },

      // Shakes
      { name: 'Oreo Shake', price: 200, cat: 'Shakes' },
      { name: 'Strawberry Shake', price: 190, cat: 'Shakes' },
      { name: 'Chocolate Shake', price: 180, cat: 'Shakes' },
      { name: 'KitKat Shake', price: 210, cat: 'Shakes' },
      { name: 'Mango Shake', price: 190, cat: 'Shakes' },

      // Snacks
      { name: 'Veg Burger', price: 150, cat: 'Snacks' }, 
      { name: 'Club Sandwich', price: 220, cat: 'Snacks' },
      { name: 'Chicken Burger', price: 180, cat: 'Snacks' },
      { name: 'Paneer Wrap', price: 160, cat: 'Snacks' },
      { name: 'Nachos with Salsa', price: 180, cat: 'Snacks' },
      { name: 'Corn Pizza', price: 250, cat: 'Snacks' },
      { name: 'Margherita Pizza', price: 220, cat: 'Snacks' },

      // Main Course
      { name: 'Paneer Butter Masala', price: 320, cat: 'Main Course' },
      { name: 'Dal Makhani', price: 280, cat: 'Main Course' },
      { name: 'Butter Naan', price: 40, cat: 'Main Course' },
      { name: 'Jeera Rice', price: 150, cat: 'Main Course' },
      { name: 'Chicken Curry', price: 350, cat: 'Main Course' },

      // Mocktails
      { name: 'Blue Lagoon', price: 150, cat: 'Mocktails' },
      { name: 'Mojito', price: 160, cat: 'Mocktails' },
      { name: 'Fruit Punch', price: 180, cat: 'Mocktails' }
    ];

    for (const p of products) {
      const catId = catMap[p.cat];
      if (catId) {
        // Upsert logic basically: Check active existence or duplicate name
        // For simplicity in this seed, we just insert. If you run multiple times, you might get duplicates unless unique constraint.
        // Let's check first.
        const exist = await client.query("SELECT id FROM products WHERE name = $1", [p.name]);
        if (exist.rows.length === 0) {
          await client.query(
            "INSERT INTO products (name, category_id, price, is_active) VALUES ($1, $2, $3, true)",
            [p.name, catId, p.price]
          );
        }
      }
    }

    console.log("Expanded products seeded successfully.");
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
}
run();
