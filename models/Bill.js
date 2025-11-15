const mongoose = require('mongoose');

// Bill Schema
const billSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    serviceId: {
        type: Number,
        required: true
    },
    tenantId: {
        type: Number,
        required: false, // Allow null values for existing data
        default: null
    },
    billAmount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: String,
        required: true
    },
    hours: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Create indexes for better performance
billSchema.index({ id: 1 });
billSchema.index({ serviceId: 1 });
billSchema.index({ tenantId: 1 });
billSchema.index({ status: 1 });
billSchema.index({ date: 1 });

const Bill = mongoose.model('Bill', billSchema);

module.exports = { Bill };
