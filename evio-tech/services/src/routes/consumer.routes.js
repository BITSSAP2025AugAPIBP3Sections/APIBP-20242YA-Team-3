const express = require('express');
const router = express.Router();
const { listServices, getService } = require('../controllers/consumer.controller');

router.get('/services', listServices);
router.get('/services/:serviceId', getService);

module.exports = router;
