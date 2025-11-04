const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.get('/', paymentController.list);
router.post('/', paymentController.create);
router.get('/:id', paymentController.get);
router.put('/:id', paymentController.update);
router.delete('/:id', paymentController.delete);

module.exports = router;
// MONGO_URI=mongodb;//localhost:27017/billing
//PORT=4000
//LOG_LEVEL=info

