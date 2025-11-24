# Service Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

> A modern, scalable platform for multi-tenant service management with integrated billing, notifications, and real-time GraphQL support.

**🌐 Live Demo:** [http://52.66.102.217:3000/api-docs](http://52.66.102.217:3000/api-docs/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [API Reference](#-api-reference)
- [Architecture](#-architecture)
- [Security](#-security)
- [Authentication Module](#-authentication-module)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🏢 **Multi-tenant Architecture** - Secure tenant isolation with role-based access control
- 🛍️ **Service Catalog** - Browse and manage services with categories
- 💳 **Billing & Payments** - Automated billing with usage tracking
- 🔔 **Real-time Notifications** - Event-driven notification system
- 🔐 **Authentication** - JWT-based secure authentication with bcrypt password hashing
- 📊 **GraphQL & REST APIs** - Flexible API options for all use cases
- 📚 **Swagger Documentation** - Interactive API explorer
- 🐳 **Docker & Kubernetes** - Production-ready deployments
- 📝 **Structured Logging** - Comprehensive logging with Log4js
- 🎨 **Modern UI** - Beautiful login, signup, and dashboard pages

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 14+** and npm
- **MongoDB Atlas** account or local MongoDB instance
- **Docker** (optional, for containerized deployment)

### Method 1: Docker Compose (🔥 Recommended)

**Perfect for:** First-time setup, development, testing  
**Time to run:** 2 minutes

```bash
# 1. Clone the repository
git clone https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3.git
cd APIBP-20242YA-Team-3

# 2. Create .env file (see Configuration section below)

# 3. Start everything (MongoDB + API)
docker-compose up -d

# 4. Wait 30 seconds, then test
curl http://localhost:3000/api/v1/services

# 5. View API documentation
open http://localhost:3000/api-docs
```

**✅ What you get automatically:**
- MongoDB Atlas connection
- Your API server (all endpoints working)
- Real-time event notifications
- No manual setup required

### Method 2: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3.git
cd APIBP-20242YA-Team-3

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create .env file (see Configuration section)

# 4. Start the API server
npm start

# 5. Test
curl http://localhost:3000/api/v1/services
```

### Method 3: Kubernetes with Minikube

**Perfect for:** Learning Kubernetes, production simulation  
**Time to run:** 5 minutes

```bash
# 1. Start Minikube
minikube start

# 2. Build and deploy to Kubernetes
eval $(minikube docker-env)
docker build -t service-api:latest .
kubectl apply -f deployment/kubernetes/k8s-configmap.yaml
kubectl apply -f deployment/kubernetes/k8s-deployment.yaml

# 3. Get the service URL
minikube service service-api --url
```

### ⚙️ Configuration

Create a `.env` file in the project root:

```env
# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-recommended
JWT_EXPIRES_IN=24h

# Admin Setup Key (REQUIRED for first admin creation)
ADMIN_SETUP_KEY=your-secure-setup-key-change-after-first-admin

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string

# Server Port
PORT=3000
```

> ⚠️ **Important:** Change `JWT_SECRET` and `ADMIN_SETUP_KEY` to secure values before deployment.

### 🎯 Create First Admin User

```bash
curl -X POST http://localhost:3000/api/v1/tenants/admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "phone": "+1234567890",
    "password": "SecurePass123",
    "setupKey": "your-secure-setup-key-change-after-first-admin"
  }'
```

Then login at: `http://localhost:3000/pages/auth/login.html`

### 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Login Page:** http://localhost:3000/pages/auth/login.html
- **Dashboard:** http://localhost:3000/pages/dashboard/index.html
- **API Docs:** http://localhost:3000/api-docs
- **GraphQL:** http://localhost:3000/graphql

---

## 📚 Documentation

### Complete Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](docs/INSTALLATION.md) | Detailed setup instructions for Docker, Kubernetes, local, and AWS deployment |
| [Quick Start Guide](docs/QUICKSTART.md) | Get started in 5 minutes |
| [Architecture Overview](docs/ARCHITECTURE.md) | System design, component diagrams, and data flow |
| [API Reference](docs/API.md) | Complete REST and GraphQL API endpoints documentation |
| [Security Policy](docs/SECURITY.md) | Security features, best practices, and vulnerability reporting |
| [Admin Access Guide](docs/ADMIN_ACCESS_GUIDE.md) | Admin dashboard setup and usage |
| [Contributing Guidelines](docs/CONTRIBUTING.md) | How to contribute to this project |
| [Code of Conduct](docs/CODE_OF_CONDUCT.md) | Community standards and expectations |

### Module Documentation

| Module | Description |
|--------|-------------|
| [Authentication Module](auth-module/README.md) | Login, signup, and dashboard pages documentation |

---

## 📡 API Reference

### Core Endpoints

| Service | Endpoint | Description |
|---------|----------|-------------|
| **Authentication** | `POST /api/v1/login` | User login |
| | `POST /api/v1/tenants` | Create tenant |
| | `POST /api/v1/tenants/admin` | Create admin user |
| **Services** | `GET /api/v1/services` | List all services (33+ services) |
| | `GET /api/v1/services/:id` | Get service details |
| | `GET /api/v1/categories` | List service categories |
| **Billing** | `POST /api/v1/bills` | Create bill |
| | `GET /api/v1/tenants/:id/bills` | Get tenant bills |
| **Payments** | `POST /api/v1/payment` | Process payment |
| **Notifications** | `GET /api/v1/notifications` | List notifications |
| | `POST /api/v1/notifications` | Create notification |

### Quick API Test Suite

```bash
# 1. List all services (should return 33+ services)
curl http://localhost:3000/api/v1/services

# 2. Get specific service details
curl http://localhost:3000/api/v1/services/1011

# 3. List all tenants
curl http://localhost:3000/api/v1/tenants

# 4. Create a new bill (triggers notification)
curl -X POST -H "Content-Type: application/json" \
  -d '{"serviceId": 1011, "tenantId": 1, "hours": 3}' \
  http://localhost:3000/api/v1/bills

# 5. Check real-time notifications
curl http://localhost:3000/api/v1/notifications

# 6. View interactive API documentation
open http://localhost:3000/api-docs
```

**📖 [Complete API Documentation →](docs/API.md)** | **[Swagger UI →](http://localhost:3000/api-docs)**

---

## 🏗️ Architecture

### System Overview

The platform follows a modular architecture with clear separation of concerns:

```
API Requests
    ↓
Express Middleware (JSON parsing, logging, security)
    ↓
Route Handlers
    ├── Authentication & Authorization
    ├── Service Management
    ├── Billing & Invoicing
    ├── Payment Processing
    └── Notification System
    ↓
Business Logic Layer
    ↓
Data Persistence (MongoDB Atlas)
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Express.js |
| **GraphQL** | Apollo Server Express |
| **Authentication** | JWT + bcrypt |
| **Security** | Helmet, CORS, Rate Limiting |
| **Logging** | Log4js |
| **API Documentation** | Swagger/OpenAPI 3.0 |
| **Data Storage** | MongoDB Atlas |
| **Runtime** | Node.js 14+ |

### Diagrams

The project includes comprehensive architecture diagrams:

- **System Context Diagram** - High-level interactions
- **Container Diagram** - Logical components
- **Component Diagrams** - Detailed component structure
- **Deployment Diagram** - Physical deployment
- **Entity Relationship Diagram** - Data models
- **Flow Diagrams** - User authentication, service ordering, payment processing

**📐 [View Complete Architecture Documentation →](docs/ARCHITECTURE.md)**

---

## 🔐 Security

### ✅ Implemented Security Controls

#### Authentication & Authorization
- ✅ **Password Hashing** - bcrypt with 10 salt rounds, minimum 8 characters
- ✅ **JWT Authentication** - Token-based auth with 24h expiry, Bearer format
- ✅ **Cookie-based Session** - Dual storage (localStorage + cookies) for admin protection
- ✅ **Role-Based Access Control** - User and Admin roles with granular permissions
- ✅ **Admin Creation Endpoint** - Secure admin account creation with setup key
- ✅ **Protected Routes** - JWT middleware on all sensitive endpoints

#### Network Security
- ✅ **Security Headers** - Helmet.js (CSP, XSS protection, clickjacking prevention, HSTS)
- ✅ **CORS Protection** - Configurable origin restrictions with credentials support
- ✅ **Rate Limiting** - API (100/15min) and Auth (5/15min) brute-force protection
- ✅ **Input Validation** - Server-side validation on all endpoints
- ✅ **NoSQL Injection Prevention** - Mongoose query sanitization

#### Monitoring & Logging
- ✅ **Structured Logging** - Log4js with access, error, and debug logs
- ✅ **Request Tracking** - IP, method, URL, status code logging
- ✅ **Error Handling** - Secure error responses without sensitive data exposure

### Security Best Practices

For production deployment:
1. Change default `JWT_SECRET` and `ADMIN_SETUP_KEY`
2. Enable HTTPS/TLS
3. Configure MongoDB Atlas IP whitelist
4. Review and adjust rate limits
5. Enable security monitoring
6. Regular security audits

**🛡️ [Complete Security Documentation →](docs/SECURITY.md)** | **[Admin Access Guide →](docs/ADMIN_ACCESS_GUIDE.md)**

---

## 🎨 Authentication Module

The platform includes a modern authentication system with beautiful UI:

### Features
- 🎨 **Beautiful Login Page** - Gradient background with animated particles
- 🚀 **Signup Page** - Multi-field registration with password strength indicator
- 🏠 **Dashboard** - User-friendly service catalog interface
- 🔍 **Search & Filter** - Real-time search and category filtering
- 💳 **Service Selection** - Detailed service information and selection
- 📱 **Responsive Design** - Works perfectly on all devices

### Access URLs
- **Root URL:** http://localhost:3000 (smart redirect based on login state)
- **Login Page:** http://localhost:3000/pages/auth/login.html
- **Signup Page:** http://localhost:3000/pages/auth/signup.html
- **Dashboard:** http://localhost:3000/pages/dashboard/index.html

**🔑 [View Authentication Module Documentation →](auth-module/README.md)**

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**[→ Read Full Contribution Guidelines](docs/CONTRIBUTING.md)** | **[→ Code of Conduct](docs/CODE_OF_CONDUCT.md)**

---

## 🐛 Troubleshooting

### Common Issues

#### npm dependency conflicts (ERESOLVE error)
```bash
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

#### Port 3000 already in use
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

#### Cannot connect to MongoDB
- Check MongoDB Atlas connection string
- Verify IP whitelist settings
- Check network/firewall settings

#### Docker not running
```bash
# Start Docker Desktop or Colima
colima start  # if using Colima
```

**[→ More Troubleshooting Tips](docs/INSTALLATION.md#troubleshooting)**

---

## 📦 Project Structure

```
APIBP-20242YA-Team-3/
├── auth-module/          # Authentication module with UI
├── deployment/           # Deployment configurations
│   ├── docker/          # Docker and Docker Compose files
│   ├── kubernetes/      # Kubernetes manifests
│   └── aws/             # AWS EC2 auto-scaling configs
├── docs/                # Complete documentation
├── public/              # Frontend static files
│   ├── pages/          # HTML pages (login, signup, dashboard)
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── images/         # Static images
├── scripts/            # Utility scripts
├── src/                # Backend source code
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # MongoDB models
│   └── utils/          # Utility functions
├── tests/              # Test files
├── logs/               # Application logs
├── index.js            # Application entry point
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- GraphQL: [Apollo Server](https://www.apollographql.com/)
- Documentation: [Swagger/OpenAPI](https://swagger.io/)
- UI Design: Modern gradient design with particle animations

---

## 📞 Support & Resources

- **Live Demo:** [http://52.66.102.217:3000/api-docs](http://52.66.102.217:3000/api-docs/)
- **GitHub Issues:** [Report bugs or request features](https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3/issues)
- **Documentation:** [Complete docs in /docs folder](docs/)

---

<div align="center">

**Status:** Production Ready ✅  
**Version:** 1.0.0  
**Last Updated:** November 24, 2025

Made with ❤️ by BITS-MTECH Team 3

</div>
