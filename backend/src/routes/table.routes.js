const express = require('express');
const router = express.Router();
const { getTables, getTable } = require('../controllers/table.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/', authMiddleware, getTables);
router.get('/:id', authMiddleware, getTable);

module.exports = router;
