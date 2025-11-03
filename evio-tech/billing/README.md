# Billing Module

## Overview
This is the Billing microservice for Evio-Tech, providing CRUD APIs for invoices and payments. Built with Node.js, Express, MongoDB, and Pino logger. Swagger docs available at `/api-docs/billing`.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.billing` and update MongoDB URI and PORT as needed.
3. Start MongoDB (use Docker or local install).
4. Start the service:
   ```bash
   npm start
   ```

## Environment Variables
- `MONGO_URI` - MongoDB connection string
- `PORT` - Service port (default: 4000)
- `LOG_LEVEL` - Logger level (default: info)

## Run Commands
- `npm start` - Start the billing service

## API Docs
- Swagger UI: [http://localhost:4000/api-docs/billing](http://localhost:4000/api-docs/billing)
- See `swagger/billing.yaml` for full API spec

