const mongoose = require('mongoose');

const kycVerificationSchema = new mongoose.Schema({
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    required: true,
    enum: ['User', 'Company']
  },
  verificationType: {
    type: String,
    required: true,
    enum: ['identity', 'address', 'business', 'professional']
  },
  documents: [{
    type: {
      type: String,
      required: true
    },
    documentUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    rejectionReason: String
  }],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: Date,
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

// Index for faster queries
kycVerificationSchema.index({ entityId: 1, status: 1 });
kycVerificationSchema.index({ entityType: 1, status: 1 });

const KYCVerification = mongoose.model('KYCVerification', kycVerificationSchema);

module.exports = KYCVerification;