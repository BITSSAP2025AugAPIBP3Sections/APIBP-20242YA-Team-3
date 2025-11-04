const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// Validation middleware
const validateUserRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('phone').trim().notEmpty()
];

const validateCompanyRegistration = [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('businessType').isIn(['individual', 'corporation', 'partnership', 'llc']),
  body('registrationNumber').trim().notEmpty(),
  body('address').isObject(),
  body('contactPerson').isObject()
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const validatePasswordReset = [
  body('email').isEmail().normalizeEmail(),
  body('type').isIn(['user', 'company'])
];

const validatePasswordUpdate = [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  body('type').isIn(['user', 'company'])
];

// User routes
router.post('/users/register', validateUserRegistration, authController.registerUser);
router.post('/users/login', validateLogin, authController.loginUser);

// Company routes
router.post('/companies/register', validateCompanyRegistration, authController.registerCompany);
router.post('/companies/login', validateLogin, authController.loginCompany);

// Common routes
router.post('/password-reset', validatePasswordReset, authController.requestPasswordReset);
router.post('/password-reset/confirm', validatePasswordUpdate, authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);

module.exports = router;