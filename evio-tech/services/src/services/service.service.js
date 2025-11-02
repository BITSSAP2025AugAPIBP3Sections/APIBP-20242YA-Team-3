const Service = require('../models/service.model');

async function createService(payload) {
  const service = new Service(payload);
  return service.save();
}

async function findServiceById(id) {
  return Service.findById(id).populate('categoryId').lean();
}

async function queryServices(filter = {}, opts = {}) {
  const q = Service.find({ active: true, ...filter }).populate('categoryId').lean();
  if (opts.limit) q.limit(opts.limit);
  if (opts.skip) q.skip(opts.skip);
  return q.exec();
}

async function updateService(id, patch) {
  return Service.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
}

async function disableService(id) {
  return Service.findByIdAndUpdate(id, { $set: { active: false } }, { new: true }).lean();
}

async function listServices(filter = {}, page = 1, limit = 20) {
   const skip = (page - 1) * limit;
   return queryServices(filter, { skip, limit });
}

async function getServiceById(id) {
return findServiceById(id);
}

module.exports = { createService, findServiceById, queryServices, updateService, disableService, listServices,
    getServiceById };
