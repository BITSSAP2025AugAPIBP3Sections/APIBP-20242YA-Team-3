const invoiceRepo = require('../repositories/invoice.repo');
module.exports = {
  createInvoice: (data) => invoiceRepo.create(data),
  getInvoices: () => invoiceRepo.findAll(),
  getInvoiceById: (id) => invoiceRepo.findById(id),
  updateInvoice: (id, data) => invoiceRepo.update(id, data),
  deleteInvoice: (id) => invoiceRepo.delete(id)
};

