const express = require('express');
const router = express.Router();
const { createService, updateService, deleteService } = require('../controllers/company.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/services', auth.requireCompany, createService);
router.put('/services/:serviceId', auth.requireCompany, updateService);
router.delete('/services/:serviceId', auth.requireCompany, deleteService);

module.exports = router;
