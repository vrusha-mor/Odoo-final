const db = require('./src/config/db');

async function listProducts() {
    try {
        const res = await db.query('SELECT id, name, price FROM products');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

listProducts();
