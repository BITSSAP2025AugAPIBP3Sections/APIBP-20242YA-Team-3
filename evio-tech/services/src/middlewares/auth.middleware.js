// Very simple placeholder middleware. In prod replace with real JWT/Cognito check.
function requireCompany(req, res, next) {
    // In real flow check bearer token and verify company role
    // For now accept an X-Company-Id header for local dev/testing
    const companyId = req.headers['x-company-id'];
    if (!companyId) return res.status(401).json({ error: 'company auth required (set X-Company-Id header for dev)' });
    req.companyId = companyId;
    next();
  }
  
  module.exports = { requireCompany };
  