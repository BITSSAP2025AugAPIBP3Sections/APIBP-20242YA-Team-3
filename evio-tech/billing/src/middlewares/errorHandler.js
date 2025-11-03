function errorHandler(err, req, res, next) {
  req.logger.error({ err: err.message, requestId: req.requestId });
  res.status(500).json({ error: err.message });
}
module.exports = { errorHandler };

