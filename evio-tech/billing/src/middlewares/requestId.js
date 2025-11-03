function requestIdMiddleware(req, res, next) {
  req.requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
  res.setHeader('x-request-id', req.requestId);
  next();
}
module.exports = { requestIdMiddleware };

