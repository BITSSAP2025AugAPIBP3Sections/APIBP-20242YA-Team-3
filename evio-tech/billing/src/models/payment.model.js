const mongoose = require('mongoose');
const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });
module.exports = mongoose.model('Payment', PaymentSchema);

