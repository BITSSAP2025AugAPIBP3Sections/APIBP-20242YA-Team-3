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
    address: {
        type: String,
        required: true,
        trim: true
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
