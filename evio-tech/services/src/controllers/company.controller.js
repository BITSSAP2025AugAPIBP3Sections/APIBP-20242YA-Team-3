const serviceService = require('../services/service.service');

async function createService(req, res) {
  const payload = req.body;
  // assume auth middleware has validated company identity and put companyId in req.companyId
  // but service will have universal definition; company can later add pricing via companyPricing endpoint
  const created = await serviceService.createService(payload);
  res.status(201).json(created);
}

async function updateService(req, res) {
  const { serviceId } = req.params;
  const patch = req.body;
  const updated = await serviceService.modifyService(serviceId, patch);
  res.json(updated);
}

async function deleteService(req, res) {
  const { serviceId } = req.params;
  await serviceService.deleteService(serviceId);
  res.status(204).send();
}

module.exports = { createService, updateService, deleteService };
