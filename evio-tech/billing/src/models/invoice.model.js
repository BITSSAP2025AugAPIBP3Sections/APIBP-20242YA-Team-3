const mongoose = require('mongoose');
const InvoiceSchema = new mongoose.Schema({
  consumerId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  dueDate: { type: Date, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Invoice', InvoiceSchema);

