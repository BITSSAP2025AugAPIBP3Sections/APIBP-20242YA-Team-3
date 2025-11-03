const Invoice = require('../models/invoice.model');
module.exports = {
  create: (data) => Invoice.create(data),
  findAll: () => Invoice.find(),
  findById: (id) => Invoice.findById(id),
  update: (id, data) => Invoice.findByIdAndUpdate(id, data, { new: true }),
  delete: (id) => Invoice.findByIdAndDelete(id)
};

