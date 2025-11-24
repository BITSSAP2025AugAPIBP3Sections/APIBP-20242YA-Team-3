const jwt = require('jsonwebtoken');

// Use environment variable or default secret (change in production!)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate JWT token for authenticated user
 * @param {Object} payload - Data to encode in token (tenant id, email, etc.)
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

/**
 * Middleware to authenticate JWT token from request header
 * Expects: Authorization: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = decoded;
    next();
};

/**
 * Middleware to optionally authenticate token (doesn't fail if no token)
 * Useful for routes that work with or without authentication
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
        }
    }

    next();
};

/**
 * Middleware to check if user has admin role
 * Must be used after authenticateToken
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
};

/**
 * Middleware to check if user owns the resource or is admin
 * Must be used after authenticateToken
 * Expects tenant ID in req.params.id or req.params.tenantId
 */
const requireOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceTenantId = parseInt(req.params.id || req.params.tenantId);
    const userTenantId = req.user.tenantId;

    if (req.user.role === 'admin' || userTenantId === resourceTenantId) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: You can only access your own resources' });
    }
};

module.exports = {
    generateToken,
    verifyToken,
    authenticateToken,
    optionalAuth,
    requireAdmin,
    requireOwnerOrAdmin,
    JWT_SECRET,
    JWT_EXPIRES_IN
};
