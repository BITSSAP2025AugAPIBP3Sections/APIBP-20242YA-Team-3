const mongoose = require('mongoose');

// Notification Schema
const notificationSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['BILL_CREATED', 'PAYMENT_STATUS_UPDATED', 'SERVICE_COMPLETED', 'TENANT_REGISTERED']
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // We'll use our custom createdAt field
});

// Create indexes for better performance
notificationSchema.index({ id: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 }); // For sorting by newest first
notificationSchema.index({ 'data.tenantId': 1 });
notificationSchema.index({ 'data.billId': 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification };
