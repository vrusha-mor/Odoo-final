const express = require("express");
const router = express.Router();

// import controller (NOT routes)
// import controller (NOT routes)
const {
  sendReceipt,
  getPayments,
  recordPayment,
  getPaymentStatus,
  updatePaymentStatus
} = require("../controllers/payment.controller");
const authMiddleware = require('../../middlewares/auth.middleware');

// routes
router.get("/", authMiddleware, getPayments);
router.post("/", recordPayment); 
router.post("/receipt", sendReceipt);
router.get("/status/:orderId", getPaymentStatus);
router.patch("/status/:orderId", updatePaymentStatus);

module.exports = router;
