const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const logger = require('../utils/logger');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  generateToken(payload) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async authenticateUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    const token = this.generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
      type: 'user'
    });

    user.lastLogin = new Date();
    await user.save();

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status
      }
    };
  }

  async authenticateCompany(email, password) {
    const company = await Company.findOne({ email });
    if (!company) {
      throw new Error('Company not found');
    }

    const isValid = await company.comparePassword(password);
    if (!isValid) {
      throw new Error('Invalid password');
    }

    if (company.status !== 'active') {
      throw new Error('Account is not active');
    }

    const token = this.generateToken({
      id: company._id,
      email: company.email,
      type: 'company',
      plan: company.subscription.plan
    });

    return {
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        status: company.status,
        subscription: company.subscription
      }
    };
  }

  async generatePasswordResetToken(email, type) {
    const Entity = type === 'user' ? User : Company;
    const entity = await Entity.findOne({ email });
    
    if (!entity) {
      throw new Error(`${type} not found`);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    entity.resetPasswordToken = hash;
    entity.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await entity.save();

    return resetToken;
  }

  async resetPassword(token, newPassword, type) {
    const Entity = type === 'user' ? User : Company;
    const hash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const entity = await Entity.findOne({
      resetPasswordToken: hash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!entity) {
      throw new Error('Invalid or expired reset token');
    }

    entity.password = newPassword;
    entity.resetPasswordToken = undefined;
    entity.resetPasswordExpires = undefined;
    await entity.save();

    return true;
  }

  async generateVerificationToken(entityId, type) {
    const Entity = type === 'user' ? User : Company;
    const entity = await Entity.findById(entityId);
    
    if (!entity) {
      throw new Error(`${type} not found`);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    entity.verificationToken = verificationToken;
    await entity.save();

    return verificationToken;
  }

  async verifyEmail(token, type) {
    const Entity = type === 'user' ? User : Company;
    const entity = await Entity.findOne({ verificationToken: token });

    if (!entity) {
      throw new Error('Invalid verification token');
    }

    entity.status = 'active';
    entity.verificationToken = undefined;
    await entity.save();

    return true;
  }
}

module.exports = new AuthService();