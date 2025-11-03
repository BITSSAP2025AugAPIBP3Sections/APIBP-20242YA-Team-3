const invoiceService = require('../services/invoice.service');
module.exports = {
  create: async (req, res, next) => {
    try {
      const invoice = await invoiceService.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (err) { next(err); }
  },
  list: async (req, res, next) => {
    try {
      const invoices = await invoiceService.getInvoices();
      res.json(invoices);
    } catch (err) { next(err); }
  },
  get: async (req, res, next) => {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Not found' });
      res.json(invoice);
    } catch (err) { next(err); }
  },
  update: async (req, res, next) => {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id, req.body);
      res.json(invoice);
    } catch (err) { next(err); }
  },
  delete: async (req, res, next) => {
    try {
      await invoiceService.deleteInvoice(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }
};

