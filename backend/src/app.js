const express = require("express");
const cors = require("cors");

const paymentRoutes = require("./routes/payment.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/payment", paymentRoutes);
app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
const tableRoutes = require("./routes/table.routes");
app.use("/tables", tableRoutes);
app.use("/dashboard", require("./routes/dashboard.routes"));
app.use("/voice-booking", require("./routes/voice.routes"));

module.exports = app;
