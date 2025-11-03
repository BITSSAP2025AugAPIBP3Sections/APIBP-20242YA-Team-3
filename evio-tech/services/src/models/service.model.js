const mongoose = require('mongoose');
require('./category.model');
require('./service.model');

const TierSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Basic, Premium
  description: { type: String },
  durationMinutes: { type: Number, default: 60 }
}, { _id: false });

const CompanyPricingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
  tiers: [{
    tierName: { type: String, required: true },
    priceCents: { type: Number, required: true },
    meta: { type: Object } // dynamic fields, e.g., travelFee, surgeRuleRef etc
  }]
}, { _id: false });

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: { type: String },
  baseTiers: [TierSchema],            // default tiers on universal service
  globalTags: [String],
  globalBasePriceCents: { type: Number, default: 0 }, // fallback base price
  companyPricing: [CompanyPricingSchema], // per-company overrides
  sla: { type: Object }, // e.g., { responseTimeMinutes: 30 }
  createdAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Service', ServiceSchema);
