const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voice.controller');

router.post('/', voiceController.processVoice);

module.exports = router;
