const mongoose = require('mongoose');

// Service Schema
const serviceSchema = new mongoose.Schema({
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
    pricePerHour: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false });

// SubService Schema
const subServiceSchema = new mongoose.Schema({
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
    services: [serviceSchema]
}, { _id: false });

// Category Schema
const categorySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subServices: [subServiceSchema]
}, {
    timestamps: true
});

// Create indexes for better performance
categorySchema.index({ id: 1 });
categorySchema.index({ 'subServices.id': 1 });
categorySchema.index({ 'subServices.services.id': 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = { Category };
