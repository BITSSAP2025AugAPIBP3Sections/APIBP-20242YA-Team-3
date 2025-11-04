const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const logger = require('../utils/logger');

class AuthMiddleware {
  verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
  }

  async validateUser(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          error: 'User account is not active'
        });
      }
      req.userDetails = user;
      next();
    } catch (error) {
      logger.error('User validation failed:', error);
      return res.status(500).json({
        error: 'User validation failed'
      });
    }
  }

  async validateCompany(req, res, next) {
    try {
      const company = await Company.findById(req.user.id);
      if (!company || company.status !== 'active') {
        return res.status(401).json({
          error: 'Company account is not active'
        });
      }
      req.companyDetails = company;
      next();
    } catch (error) {
      logger.error('Company validation failed:', error);
      return res.status(500).json({
        error: 'Company validation failed'
      });
    }
  }

  hasRole(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthorized'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  }

  isCompanyOwner(req, res, next) {
    if (req.user.type !== 'company') {
      return res.status(403).json({
        error: 'Only company owners can access this resource'
      });
    }
    next();
  }

  isSubscriptionValid(req, res, next) {
    const company = req.companyDetails;
    
    if (!company.subscription || 
        company.subscription.status !== 'active' || 
        new Date(company.subscription.endDate) < new Date()) {
      return res.status(403).json({
        error: 'Active subscription required'
      });
    }
    next();
  }

  attachUser() {
    return async (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.split(' ')[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (error) {
        logger.error('Optional token verification failed:', error);
      }
      next();
    };
  }
}

module.exports = new AuthMiddleware();