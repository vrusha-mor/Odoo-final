const express = require('express');
const router = express.Router();
const { getOrders, getOrderDetails, createOrder, updateStatus } = require('../controllers/order.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/', authMiddleware, getOrders);
router.post('/', authMiddleware, createOrder);
router.get('/:id', authMiddleware, getOrderDetails);
router.patch('/:id/status', authMiddleware, updateStatus);


module.exports = router;
