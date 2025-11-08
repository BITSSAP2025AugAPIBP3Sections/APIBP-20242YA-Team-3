# Service Management API 🚀

A comprehensive REST API for managing services, billing, payments, and tenant authentication built with Node.js and Express.

## 📋 Overview

This project implements a modular service management system with the following capabilities:
- **Service Management** - CRUD operations for services and categories
- **Authentication** - Tenant login and management
- **Billing System** - Generate and manage bills
- **Payment Processing** - Handle payment status updates

## 🏗️ Project Architecture

```
APIBP-20242YA-Team-3/
├── 📁 auth-module/          # Authentication & tenant management
├── 📁 service-module/       # Service catalog management
├── 📁 billing-module/       # Billing operations
├── 📁 payments-module/      # Payment processing
├── 📁 config/              # Logging configuration
├── 📁 swagger/             # API documentation setup
├── 📁 api-docs/            # Exported API specifications
├── 📁 scripts/             # Utility scripts
├── 📁 logs/                # Application logs
├── 📄 index.js             # Main server entry point
├── 📄 Services.json        # Service data
├── 📄 tenants.json         # Tenant data
└── 📄 bills.json           # Billing data
```

## 🚦 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Access API Documentation
Visit `http://localhost:3000/api-docs` to explore the interactive Swagger UI documentation.

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server |
| `npm run export-api-spec` | Export API specs to JSON/YAML |
| `npm run docs:export` | Alias for export-api-spec |
| `npm run docs:serve` | Alias for start |

## 📡 API Endpoints

### Base URL: `http://localhost:3000/api`

#### 🔐 Authentication (`/v1/`)
- `POST /v1/login` - Tenant authentication
- `GET /v1/tenants` - List all tenants
- `POST /v1/tenants` - Create new tenant
- `GET /v1/tenants/:id` - Get specific tenant
- `PUT /v1/tenants/:id` - Update tenant
- `DELETE /v1/tenants/:id` - Delete tenant

#### 🛍️ Services (`/v1/`)
- `GET /v1/services` - List all services
- `POST /v1/services` - Create new service
- `GET /v1/services/:id` - Get specific service
- `PUT /v1/services/:id` - Update service
- `DELETE /v1/services/:id` - Delete service

#### 💰 Billing (`/v1/`)
- `GET /v1/bills` - List all bills
- `POST /v1/bills` - Create new bill
- `GET /v1/bills/:id` - Get specific bill
- `PUT /v1/bills/:id` - Update bill

#### 💳 Payments (`/v1/`)
- `POST /v1/payments` - Process payment

## 🧩 Module Details

### Auth Module
Handles tenant authentication and management. Supports login, CRUD operations for tenants.

### Service Module  
Manages the service catalog with categories, sub-services, and pricing information.

### Billing Module
Generates and manages bills based on service usage and tenant information.

### Payments Module
Processes payment status updates and integrates with the billing system.

## 📊 Data Storage

The application uses JSON files for data persistence:
- `tenants.json` - Tenant information
- `Services.json` - Service catalog
- `bills.json` - Billing records

## 🔧 Configuration

### Logging
- **Access logs** - HTTP request logging
- **Error logs** - Application error tracking  
- **Debug logs** - Development debugging
- Configured via `config/logger.js`

### API Documentation
- **Code-first approach** - Documentation generated from JSDoc comments
- **Live documentation** - Available at `/api-docs`
- **Export capability** - Generate standalone YAML/JSON specs

## 📄 API Documentation Files

This directory contains exported OpenAPI specifications:

- `openapi.json` - JSON format for tools like Postman
- `openapi.yaml` - YAML format for external teams
- `export-metadata.json` - Generation information
- `README.md` - This documentation

### For External Teams
Share the `openapi.yaml` file with teams who need API specifications without source code access.

### For Testing Tools
Import `openapi.json` into:
- Postman
- Insomnia  
- Swagger Editor
- API testing frameworks

## 🔄 Development Workflow

### Code-First Approach
1. Write code with JSDoc comments for API documentation
2. Start server to see live docs at `/api-docs`
3. Export specs when needed for external sharing

### Updating Documentation
1. Edit JSDoc comments in route files (`*-module/*.js`)
2. Restart server to see changes in live docs
3. Run `npm run export-api-spec` to update exported files

## ⚠️ Important Notes

- **Do not edit exported files directly** - Update JSDoc comments in source code instead
- **Files are auto-generated** - Export specs are created from code documentation
- **Hybrid approach** - Combines benefits of code-first and API-first methodologies

## 🎯 Getting Help

- Check the interactive docs at `http://localhost:3000/api-docs`
- Review module source code for implementation details
- Use exported specs for external tool integration

---

*This project follows a code-first hybrid approach where documentation lives in code but can be exported for external use.*
