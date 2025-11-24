# Security Policy

## Security Overview

We take the security of the Service Management Platform seriously. This document outlines our security practices, known vulnerabilities, and how to report security issues.

## 🚀 Quick Start - Security Setup

### 1. Install Dependencies (Already Done)
```bash
npm install bcrypt jsonwebtoken helmet cors express-rate-limit
```

### 2. Create Environment File
Create `.env` file in project root:
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Start Server
```bash
npm start
# You should see: "Security middleware initialized (Helmet, CORS, Rate Limiting)"
```

### 4. Test Authentication
```bash
# Signup (returns token)
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"1234567890","password":"securepass123"}'

# Login (returns token)
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"securepass123"}'

# Use token in protected routes
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/v1/tenants/1
```


## Table of Contents

- [Quick Start](#quick-start---security-setup)
- [Supported Versions](#supported-versions)
- [Security Features](#security-features)
- [Known Security Limitations](#known-security-limitations)
- [Reporting a Vulnerability](#reporting-a-vulnerability)
- [Security Best Practices](#security-best-practices)
- [Security Roadmap](#security-roadmap)


## Supported Versions

| Version | Supported          | Security Updates |
| ------- | ------------------ | ---------------- |
| 1.0.x   | :white_check_mark: | Active           |
| < 1.0   | :x:                | Not supported    |


## Security Features

### Currently Implemented ✅

#### 1. Password Hashing (bcrypt)
- **Status:** ✅ IMPLEMENTED
- Passwords hashed using bcrypt with 10 salt rounds
- Passwords never stored in plain text
- Secure password comparison on login
- Minimum 8-character password requirement

```javascript
// Password hashing on signup
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// Password verification on login
const isValid = await bcrypt.compare(password, tenant.password);
```

#### 2. JWT Authentication
- **Status:** ✅ IMPLEMENTED
- Token-based authentication using jsonwebtoken
- 24-hour token expiration
- Bearer token format: `Authorization: Bearer <token>`
- Tokens include tenant ID, email, name, and role
- Automatic token validation on protected routes

```javascript
// Token generation
const token = generateToken({
    tenantId: tenant.id,
    email: tenant.email,
    name: tenant.name,
    role: tenant.role
});
```

#### 3. Security Headers (Helmet)
- **Status:** ✅ IMPLEMENTED
- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security (HSTS)
- X-XSS-Protection

#### 4. CORS Protection
- **Status:** ✅ IMPLEMENTED
- Configurable CORS policies
- Origin restrictions via environment variable
- Credentials support enabled
- Method and header restrictions

```javascript
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
```

#### 5. Rate Limiting
- **Status:** ✅ IMPLEMENTED
- API rate limiting: 100 requests per 15 minutes per IP
- Auth rate limiting: 5 login attempts per 15 minutes per IP
- Prevents brute force attacks
- Customizable via express-rate-limit

```javascript
// General API rate limit
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100 // 100 requests per IP

// Auth endpoint rate limit
windowMs: 15 * 60 * 1000, // 15 minutes
max: 5 // 5 attempts per IP
```

#### 6. Role-Based Access Control (RBAC)
- **Status:** ✅ IMPLEMENTED
- User roles: 'user' and 'admin'
- Protected admin-only routes (e.g., GET /v1/tenants)
- Owner-or-admin middleware for resource access
- Authorization middleware chain

```javascript
// Admin-only route
router.get('/v1/tenants', authenticateToken, requireAdmin, handler);

// Owner-or-admin route
router.get('/v1/tenants/:id', authenticateToken, requireOwnerOrAdmin, handler);
```

#### 7. Input Validation
- Server-side validation for all API endpoints
- Email format validation
- Required field validation
- Data type validation
- Password strength requirements

#### 8. Database Security
- MongoDB connection string security
- Mongoose ODM query sanitization
- NoSQL injection prevention
- Connection pooling
- Password fields excluded from query results

#### 9. Error Handling
- Proper error responses without sensitive data exposure
- Structured error logging
- Exception handling middleware
- Graceful error recovery

#### 10. Logging & Monitoring
- Access log tracking (Log4js)
- Error logging with stack traces
- Debug logging for troubleshooting
- Request/response logging
- Security event logging


## Known Security Limitations

### High Priority 🟡 - Recommended Improvements

#### 1. HTTPS/TLS
**Status:** � Not Enforced in Development  
**Issue:** HTTP only (no encryption in transit)  
**Risk Level:** HIGH for Production  
**Current State:** Running on HTTP (port 3000)  
**Recommendation:** Enforce HTTPS in production with valid SSL certificate

```javascript
// Production deployment should use:
// - Reverse proxy (Nginx) with SSL termination
// - Let's Encrypt certificates
// - Force HTTPS redirect
```

#### 2. Environment Variables
**Status:** � Partially Implemented  
**Issue:** Sensitive configuration in code  
**Risk Level:** MEDIUM  
**Recommendation:** Use proper .env file management  
**Issue:** No protection against brute force attacks  
**Risk Level:** MEDIUM  
**Recommendation:** Add rate limiting middleware

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### 5. CSRF Protection
**Status:** 🟡 Not Implemented  
**Issue:** Vulnerable to cross-site request forgery  
**Risk Level:** MEDIUM  
**Recommendation:** Implement CSRF tokens

#### 6. Input Sanitization
**Status:** 🟡 Partial  
**Issue:** XSS vulnerabilities possible  
**Risk Level:** MEDIUM  
**Recommendation:** Add input sanitization library

```javascript
const xss = require('xss-clean');
app.use(xss());
```

### Medium Priority 🟢

#### 7. Session Management
**Status:** 🟢 Basic  
**Issue:** localStorage-based (client-side only)  
**Risk Level:** LOW  
**Recommendation:** Server-side session management

#### 8. Security Headers
**Status:** 🟢 Not Configured  
**Issue:** Missing security headers  
**Risk Level:** LOW  
**Recommendation:** Add helmet middleware

```javascript
const helmet = require('helmet');
app.use(helmet());
```


## Reporting a Vulnerability

### How to Report

We appreciate responsible disclosure of security vulnerabilities. Please follow these steps:

#### 1. DO NOT Open a Public Issue

**Never report security vulnerabilities through public GitHub issues.**

#### 2. Email Security Team

Send details to: **security@example.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

#### 3. Use Our Security Template

```markdown
**Vulnerability Type:** [e.g., SQL Injection, XSS, Authentication Bypass]

**Affected Component:** [e.g., Login API, Payment endpoint]

**Severity:** [Critical / High / Medium / Low]

**Description:**
[Detailed description of the vulnerability]

**Steps to Reproduce:**
1. 
2. 
3. 

**Impact:**
[What can an attacker do with this vulnerability?]

**Suggested Fix:**
[Optional: Your recommendation for fixing the issue]

**Environment:**
- Version: 
- Deployment: [Docker / Kubernetes / Local]
- OS: 
```

#### 4. Response Timeline

| Action | Timeline |
|--------|----------|
| **Initial Response** | Within 48 hours |
| **Severity Assessment** | Within 1 week |
| **Fix Development** | 2-4 weeks (based on severity) |
| **Security Update Release** | As soon as tested |
| **Public Disclosure** | 90 days after fix or by agreement |


## Security Best Practices

### For Developers

#### 1. Using JWT Authentication

**Making Authenticated API Calls:**

```javascript
// Frontend (using auth-helper.js)
const response = await authenticatedFetch('/api/v1/tenants/123');
const data = await response.json();

// Or manually with fetch
const token = localStorage.getItem('authToken');
const response = await fetch('/api/v1/tenants/123', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

**Backend - Protecting Routes:**

```javascript
const { authenticateToken, requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth.middleware');

// Require authentication
router.get('/v1/resource', authenticateToken, handler);

// Require admin role
router.get('/v1/admin', authenticateToken, requireAdmin, handler);

// Require ownership or admin
router.get('/v1/tenants/:id', authenticateToken, requireOwnerOrAdmin, handler);
```

#### 2. Environment Variables
```bash
# Create .env file (never commit this!)
# Add .env to .gitignore

PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/db
JWT_SECRET=your-super-secret-key-min-32-chars-change-this
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=production
```

#### 3. Password Requirements

```javascript
// Enforced requirements:
- Minimum 8 characters
- Automatically hashed with bcrypt (10 rounds)
- Never stored in plain text
- Secure comparison on login

// Example validation
if (password.length < 8) {
    return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
    });
}
```

#### 4. Frontend Authentication Helper

**Include in your HTML pages:**

```html
<script src="/js/auth-helper.js"></script>
<script>
    // Protect the page (redirect if not authenticated)
    initAuthCheck();
    
    // Make authenticated requests
    async function fetchData() {
        try {
            const response = await authenticatedFetch('/api/v1/data');
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    // Logout
    function handleLogout() {
        logout(); // Clears token and redirects to login
    }
</script>
```

#### 5. Testing Authentication

**Test Signup:**
```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "securepass123"
  }'
# Returns: { ...tenant data, token: "JWT_TOKEN" }
```

**Test Login:**
```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepass123"
  }'
# Returns: { ...tenant data, token: "JWT_TOKEN" }
```

**Test Protected Route:**
```bash
curl -X GET http://localhost:3000/api/v1/tenants/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Test Rate Limiting:**
```bash
# Make 6 rapid requests to trigger rate limit
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo ""
done
# 6th request returns: 429 Too Many Requests
```

#### 6. Dependencies
```bash
# Regularly audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force
```

#### 3. Code Review Checklist
- [ ] No hardcoded credentials
- [ ] Input validation on all endpoints
- [ ] Proper error handling
- [ ] No sensitive data in logs
- [ ] SQL/NoSQL injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens where applicable
- [ ] Authentication checks
- [ ] Authorization checks

### For Deployment

#### 1. Production Checklist
- [ ] HTTPS enabled
- [ ] Environment variables properly configured
- [ ] Database connection secured
- [ ] Firewall rules configured
- [ ] Security groups properly set
- [ ] Secrets management (AWS Secrets Manager, etc.)
- [ ] Logging enabled
- [ ] Monitoring configured
- [ ] Backups automated

#### 2. Nginx Security Configuration
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# Hide Nginx version
server_tokens off;
```

#### 3. Docker Security
```dockerfile
# Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Scan for vulnerabilities
docker scan service-api:latest
```


## Security Roadmap

### Phase 1: Critical Security (Q1 2025)
- [ ] Implement password hashing (bcrypt)
- [ ] JWT authentication
- [ ] HTTPS enforcement
- [ ] Rate limiting
- [ ] Input sanitization

### Phase 2: Enhanced Security (Q2 2025)
- [ ] CSRF protection
- [ ] Security headers (helmet)
- [ ] Session management
- [ ] Two-factor authentication (2FA)
- [ ] Email verification

### Phase 3: Advanced Security (Q3 2025)
- [ ] OAuth 2.0 integration
- [ ] API key management
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Intrusion detection

### Phase 4: Compliance (Q4 2025)
- [ ] GDPR compliance
- [ ] SOC 2 Type II
- [ ] PCI DSS (for payments)
- [ ] Security certifications
- [ ] Penetration testing


## Security Testing

### Automated Testing

```bash
# Install security testing tools
npm install --save-dev snyk

# Run security audit
npm run security-audit

# Snyk test
snyk test

# OWASP dependency check
npm install -g owasp-dependency-check
dependency-check --project myapp --scan .
```

### Manual Testing Checklist

- [ ] SQL/NoSQL injection testing
- [ ] XSS vulnerability testing
- [ ] CSRF testing
- [ ] Authentication bypass attempts
- [ ] Authorization testing
- [ ] Session management testing
- [ ] Password policy testing
- [ ] API rate limiting testing


## Incident Response Plan

### In Case of Security Breach

#### 1. Immediate Actions (0-1 hour)
1. Isolate affected systems
2. Preserve evidence (logs, data)
3. Notify security team
4. Begin incident assessment

#### 2. Short-term Actions (1-24 hours)
1. Contain the breach
2. Identify root cause
3. Develop remediation plan
4. Implement immediate fixes
5. Monitor for further activity

#### 3. Long-term Actions (1-7 days)
1. Deploy permanent fixes
2. Update security policies
3. Conduct post-mortem
4. Notify affected users (if required)
5. Public disclosure (if required)

### Contact Information

- **Security Team:** evio-techsecurity@gmail.com
- **Emergency Contact:** +1-XXX-XXX-XXXX
- **GitHub Issues:** (Non-security bugs only)


## Compliance

### Data Protection

- **GDPR:** User data rights and privacy
- **CCPA:** California Consumer Privacy Act
- **Data Retention:** 7 years for billing data

### Industry Standards

- **OWASP Top 10:** Regular assessment
- **CWE/SANS Top 25:** Vulnerability prevention
- **NIST Framework:** Security best practices


## Resources

### Security Tools

- **npm audit** - Dependency vulnerability scanning
- **Snyk** - Continuous security monitoring
- **OWASP ZAP** - Web application security scanner
- **Burp Suite** - Security testing platform

### Security Guides

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)


## Acknowledgments

We thank the security researchers and contributors who help keep this project secure through responsible disclosure.


**[← Back to README](../README.md)** | **[View Architecture →](ARCHITECTURE.md)** | **[Contributing →](CONTRIBUTING.md)**
