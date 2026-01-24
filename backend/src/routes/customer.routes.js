const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerDetails, createCustomer, updateCustomer } = require('../controllers/customer.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/', authMiddleware, getCustomers);
router.get('/:id', authMiddleware, getCustomerDetails);
router.post('/', authMiddleware, createCustomer);
router.put('/:id', authMiddleware, updateCustomer);

module.exports = router;
