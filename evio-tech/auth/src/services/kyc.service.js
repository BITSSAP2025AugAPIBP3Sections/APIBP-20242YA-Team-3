const KYCVerification = require('../models/kyc-verification.model');
const Company = require('../models/company.model');
const User = require('../models/user.model');
const logger = require('../utils/logger');

class KYCService {
  async initiateKYCVerification(entityId, entityType, verificationType) {
    try {
      const Entity = entityType === 'user' ? User : Company;
      const entity = await Entity.findById(entityId);

      if (!entity) {
        throw new Error(`${entityType} not found`);
      }

      const existingVerification = await KYCVerification.findOne({
        entityId,
        entityType,
        verificationType,
        status: { $in: ['pending', 'in-progress'] }
      });

      if (existingVerification) {
        throw new Error('KYC verification already in progress');
      }

      const verification = new KYCVerification({
        entityId,
        entityType,
        verificationType
      });

      await verification.save();
      return verification;
    } catch (error) {
      logger.error('Error initiating KYC verification:', error);
      throw error;
    }
  }

  async uploadKYCDocuments(verificationId, documents) {
    try {
      const verification = await KYCVerification.findById(verificationId);
      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.status !== 'pending') {
        throw new Error('Verification is not in pending state');
      }

      const formattedDocuments = documents.map(doc => ({
        type: doc.documentType,
        documentUrl: doc.url,
        uploadedAt: new Date()
      }));

      verification.documents.push(...formattedDocuments);
      verification.status = 'in-progress';
      await verification.save();

      return verification;
    } catch (error) {
      logger.error('Error uploading KYC documents:', error);
      throw error;
    }
  }

  async verifyKYCDocuments(verificationId, adminId, approvalData) {
    try {
      const verification = await KYCVerification.findById(verificationId);
      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.status !== 'in-progress') {
        throw new Error('Verification is not in progress');
      }

      // Update document statuses
      verification.documents = verification.documents.map(doc => ({
        ...doc,
        status: approvalData[doc._id] ? 'approved' : 'rejected',
        verifiedBy: adminId,
        verifiedAt: new Date()
      }));

      // Check if all documents are approved
      const allApproved = verification.documents.every(doc => doc.status === 'approved');
      verification.status = allApproved ? 'approved' : 'rejected';

      // Update entity status if all documents are approved
      if (allApproved) {
        const Entity = verification.entityType === 'user' ? User : Company;
        await Entity.findByIdAndUpdate(verification.entityId, {
          kycStatus: 'approved'
        });
      }

      await verification.save();
      return verification;
    } catch (error) {
      logger.error('Error verifying KYC documents:', error);
      throw error;
    }
  }

  async getKYCStatus(entityId, entityType) {
    try {
      const verifications = await KYCVerification.find({
        entityId,
        entityType
      }).sort({ createdAt: -1 });

      return verifications;
    } catch (error) {
      logger.error('Error getting KYC status:', error);
      throw error;
    }
  }

  async listPendingVerifications(status) {
    try {
      const query = status ? { status } : { status: { $in: ['pending', 'in-progress'] } };
      const verifications = await KYCVerification.find(query)
        .populate('entityId')
        .sort({ createdAt: 1 });

      return verifications;
    } catch (error) {
      logger.error('Error listing pending verifications:', error);
      throw error;
    }
  }
}

module.exports = new KYCService();