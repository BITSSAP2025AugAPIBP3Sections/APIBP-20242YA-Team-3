const { validationResult } = require('express-validator');

class ValidatorMiddleware {
  validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    next();
  }

  sanitizeFile(req, res, next) {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE);

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type'
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: 'File too large'
      });
    }

    next();
  }

  validateKYCDocuments(req, res, next) {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No documents uploaded'
      });
    }

    const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
    const maxSize = parseInt(process.env.MAX_FILE_SIZE);
    const errors = [];

    req.files.forEach(file => {
      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid file type for ${file.originalname}`);
      }
      if (file.size > maxSize) {
        errors.push(`File too large: ${file.originalname}`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        errors
      });
    }

    next();
  }
}

module.exports = new ValidatorMiddleware();