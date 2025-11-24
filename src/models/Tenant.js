const mongoose = require('mongoose');

// Tenant Schema
const tenantSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'trial', 'premium', 'suspended', 'terminated'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Create indexes for better performance
tenantSchema.index({ id: 1 });
tenantSchema.index({ email: 1 });
tenantSchema.index({ phone: 1 });

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = { Tenant };
