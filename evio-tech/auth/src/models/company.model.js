const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  businessType: {
    type: String,
    required: true,
    enum: ['individual', 'corporation', 'partnership', 'llc']
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  contactPerson: {
    firstName: String,
    lastName: String,
    position: String,
    phone: String,
    email: String
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'in-review', 'approved', 'rejected'],
    default: 'pending'
  },
  kycDocuments: [{
    type: {
      type: String,
      enum: ['registration', 'tax', 'identity', 'address', 'other']
    },
    documentUrl: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verificationToken: String,
  apiKey: String,
  apiKeyExpiry: Date,
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'professional', 'enterprise'],
      default: 'basic'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    }
  },
  settings: {
    notificationEmail: Boolean,
    notificationSMS: Boolean,
    autoAcceptBookings: Boolean,
    defaultCurrency: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
companySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate API Key
companySchema.methods.generateApiKey = function() {
  this.apiKey = crypto.randomBytes(32).toString('hex');
  this.apiKeyExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
};

// Method to compare password
companySchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Company = mongoose.model('Company', companySchema);

module.exports = Company;