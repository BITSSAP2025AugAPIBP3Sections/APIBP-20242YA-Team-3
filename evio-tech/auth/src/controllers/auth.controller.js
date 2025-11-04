const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');
const logger = require('../utils/logger');
const User = require('../models/user.model');
const Company = require('../models/company.model');

class AuthController {
  async registerUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: 'Email already registered'
        });
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        phone
      });

      await user.save();

      // Generate verification token
      const verificationToken = await authService.generateVerificationToken(user._id, 'user');

      // TODO: Send verification email

      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification.',
        userId: user._id
      });
    } catch (error) {
      logger.error('Error in user registration:', error);
      res.status(500).json({
        error: 'Registration failed'
      });
    }
  }

  async registerCompany(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        email,
        password,
        businessType,
        registrationNumber,
        address,
        contactPerson
      } = req.body;

      // Check if company already exists
      const existingCompany = await Company.findOne({ 
        $or: [{ email }, { registrationNumber }]
      });
      
      if (existingCompany) {
        return res.status(400).json({
          error: 'Company already registered with this email or registration number'
        });
      }

      // Create new company
      const company = new Company({
        name,
        email,
        password,
        businessType,
        registrationNumber,
        address,
        contactPerson
      });

      await company.save();

      // Generate verification token
      const verificationToken = await authService.generateVerificationToken(company._id, 'company');

      // TODO: Send verification email

      res.status(201).json({
        message: 'Company registered successfully. Please check your email for verification.',
        companyId: company._id
      });
    } catch (error) {
      logger.error('Error in company registration:', {
        error: error.message,
        stack: error.stack,
        body: req.body
      });
      res.status(500).json({
        error: `Registration failed: ${error.message}`
      });
    }
  }

  async loginUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const auth = await authService.authenticateUser(email, password);

      res.json(auth);
    } catch (error) {
      logger.error('Error in user login:', error);
      res.status(401).json({
        error: error.message || 'Authentication failed'
      });
    }
  }

  async loginCompany(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const auth = await authService.authenticateCompany(email, password);

      res.json(auth);
    } catch (error) {
      logger.error('Error in company login:', error);
      res.status(401).json({
        error: error.message || 'Authentication failed'
      });
    }
  }

  async requestPasswordReset(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, type } = req.body;
      const resetToken = await authService.generatePasswordResetToken(email, type);

      // TODO: Send password reset email

      res.json({
        message: 'Password reset email sent'
      });
    } catch (error) {
      logger.error('Error in password reset request:', error);
      res.status(400).json({
        error: error.message || 'Password reset request failed'
      });
    }
  }

  async resetPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { token, newPassword, type } = req.body;
      await authService.resetPassword(token, newPassword, type);

      res.json({
        message: 'Password reset successful'
      });
    } catch (error) {
      logger.error('Error in password reset:', error);
      res.status(400).json({
        error: error.message || 'Password reset failed'
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { token, type } = req.query;
      await authService.verifyEmail(token, type);

      res.json({
        message: 'Email verified successfully'
      });
    } catch (error) {
      logger.error('Error in email verification:', error);
      res.status(400).json({
        error: error.message || 'Email verification failed'
      });
    }
  }
}

module.exports = new AuthController();