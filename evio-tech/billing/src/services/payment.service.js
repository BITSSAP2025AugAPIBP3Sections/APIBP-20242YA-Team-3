const paymentRepo = require('../repositories/payment.repo');
module.exports = {
  createPayment: (data) => paymentRepo.create(data),
  getPayments: () => paymentRepo.findAll(),
  getPaymentById: (id) => paymentRepo.findById(id),
  updatePayment: (id, data) => paymentRepo.update(id, data),
  deletePayment: (id) => paymentRepo.delete(id)
};

