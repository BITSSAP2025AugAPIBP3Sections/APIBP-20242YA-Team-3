require('dotenv').config({ path: '.env.billing' });

const express = require('express');
const dotenv = require('dotenv');
const pino = require('pino');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const { requestIdMiddleware } = require('./middlewares/requestId');
const { errorHandler } = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');

dotenv.config({ path: path.join(__dirname, '../../.env.billing') });

const app = express();
app.use(express.json());
app.use(requestIdMiddleware);
app.use(logger);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/invoices', invoiceRoutes);
app.use('/payments', paymentRoutes);

const swaggerFile = fs.readFileSync(path.join(__dirname, '../swagger/billing.yaml'), 'utf8');

const swaggerDocument = require('js-yaml').load(swaggerFile);
app.use('/api-docs/billing', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

module.exports = app;

