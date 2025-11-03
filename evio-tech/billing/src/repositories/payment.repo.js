const Payment = require('../models/payment.model');
module.exports = {
  create: (data) => Payment.create(data),
  findAll: () => Payment.find(),
  findById: (id) => Payment.findById(id),
  update: (id, data) => Payment.findByIdAndUpdate(id, data, { new: true }),
  delete: (id) => Payment.findByIdAndDelete(id)
};

