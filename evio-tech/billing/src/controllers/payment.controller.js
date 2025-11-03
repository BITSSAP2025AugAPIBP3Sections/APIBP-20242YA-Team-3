const paymentService = require('../services/payment.service');
module.exports = {
  create: async (req, res, next) => {
    try {
      const payment = await paymentService.createPayment(req.body);
      res.status(201).json(payment);
    } catch (err) { next(err); }
  },
  list: async (req, res, next) => {
    try {
      const payments = await paymentService.getPayments();
      res.json(payments);
    } catch (err) { next(err); }
  },
  get: async (req, res, next) => {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      if (!payment) return res.status(404).json({ error: 'Not found' });
      res.json(payment);
    } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try {
      const payment = await paymentService.updatePayment(req.params.id, req.body);
      res.json(payment);
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      await paymentService.deletePayment(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
};

