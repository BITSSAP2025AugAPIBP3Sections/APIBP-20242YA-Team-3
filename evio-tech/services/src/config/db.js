const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/evio_services_dev';

module.exports = async function connectDb() {
  mongoose.set('strictQuery', false);
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  logger.info('Connected to MongoDB', { uri: MONGO_URI });
};
