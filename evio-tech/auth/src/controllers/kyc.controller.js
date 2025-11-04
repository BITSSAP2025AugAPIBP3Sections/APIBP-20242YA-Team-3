const kycService = require('../services/kyc.service');
const logger = require('../utils/logger');

class KYCController {
  async initiateVerification(req, res) {
    try {
      const { verificationType } = req.body;
      const entityId = req.user.id;
      const entityType = req.user.type;

      const verification = await kycService.initiateKYCVerification(
        entityId,
        entityType,
        verificationType
      );

      res.status(201).json({
        message: 'KYC verification initiated successfully',
        verification
      });
    } catch (error) {
      logger.error('Error initiating verification:', error);
      res.status(400).json({
        error: error.message || 'Failed to initiate verification'
      });
    }
  }

  async uploadDocuments(req, res) {
    try {
      const { verificationId } = req.params;
      const documents = req.files.map(file => ({
        documentType: file.fieldname,
        url: file.path // Assuming file is saved and path is stored
      }));

      const verification = await kycService.uploadKYCDocuments(verificationId, documents);

      res.json({
        message: 'Documents uploaded successfully',
        verification
      });
    } catch (error) {
      logger.error('Error uploading documents:', error);
      res.status(400).json({
        error: error.message || 'Failed to upload documents'
      });
    }
  }

  async verifyDocuments(req, res) {
    try {
      const { verificationId } = req.params;
      const { approvalData } = req.body;
      const adminId = req.user.id;

      const verification = await kycService.verifyKYCDocuments(
        verificationId,
        adminId,
        approvalData
      );

      res.json({
        message: 'Documents verified successfully',
        verification
      });
    } catch (error) {
      logger.error('Error verifying documents:', error);
      res.status(400).json({
        error: error.message || 'Failed to verify documents'
      });
    }
  }

  async getStatus(req, res) {
    try {
      const entityId = req.user.id;
      const entityType = req.user.type;

      const verifications = await kycService.getKYCStatus(entityId, entityType);

      res.json({
        verifications
      });
    } catch (error) {
      logger.error('Error getting KYC status:', error);
      res.status(400).json({
        error: error.message || 'Failed to get KYC status'
      });
    }
  }

  async listPendingVerifications(req, res) {
    try {
      const { status } = req.query;
      const verifications = await kycService.listPendingVerifications(status);

      res.json({
        verifications
      });
    } catch (error) {
      logger.error('Error listing pending verifications:', error);
      res.status(400).json({
        error: error.message || 'Failed to list pending verifications'
      });
    }
  }
}

module.exports = new KYCController();