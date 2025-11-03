const serviceService = require('../services/service.service');

async function listServices(req, res) {
  const { category, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (category) filter.categoryId = category;
  if (q) filter.$text = { $search: q }; // requires text index if used
  const items = await serviceService.listServices(filter, Number(page), Number(limit));
  res.json({ total: items.length, items });
}

async function getService(req, res) {
  const { serviceId } = req.params;
  const item = await serviceService.getServiceById(serviceId);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
}

module.exports = { listServices, getService };
