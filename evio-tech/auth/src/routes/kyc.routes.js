const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const validatorMiddleware = require('../middlewares/validator.middleware');
const kycController = require('../controllers/kyc.controller');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc-documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5242880 // 5MB default
  }
});

// Validation middleware
const validateInitiation = [
  body('verificationType').isIn(['identity', 'address', 'business', 'professional']),
];

const validateVerification = [
  body('approvalData').isObject().notEmpty()
];

// Routes
router.post('/initiate',
  authMiddleware.verifyToken,
  validateInitiation,
  validatorMiddleware.validate,
  kycController.initiateVerification
);

router.post('/upload/:verificationId',
  authMiddleware.verifyToken,
  upload.array('documents'),
  validatorMiddleware.validateKYCDocuments,
  kycController.uploadDocuments
);

router.post('/verify/:verificationId',
  authMiddleware.verifyToken,
  authMiddleware.hasRole('admin'),
  validateVerification,
  validatorMiddleware.validate,
  kycController.verifyDocuments
);

router.get('/status',
  authMiddleware.verifyToken,
  kycController.getStatus
);

router.get('/pending',
  authMiddleware.verifyToken,
  authMiddleware.hasRole('admin'),
  kycController.listPendingVerifications
);

module.exports = router;