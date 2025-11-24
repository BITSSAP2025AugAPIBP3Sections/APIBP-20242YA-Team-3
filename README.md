# Service Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

> A modern, scalable platform for multi-tenant service management with integrated billing, notifications, and real-time GraphQL support.

**🌐 Live Demo:** [http://52.66.102.217:3000/api-docs](http://52.66.102.217:3000/api-docs/)

---

## Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [API Reference](#-api-reference)
- [Security Features](#-security-features)
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

---

## ⚙️ Configuration

### Prerequisites

- Node.js 14+ and npm
- MongoDB Atlas account or local MongoDB instance
- Docker (optional, for containerized deployment)

### Environment Setup

Create `.env` file in project root with the following configuration:

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

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
git clone https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3.git
cd APIBP-20242YA-Team-3
# Create .env file with configuration above
docker-compose up -d
```

### Option 2: Local Development

```bash
git clone https://github.com/BITSSAP2025AugAPIBP3Sections/APIBP-20242YA-Team-3.git
cd APIBP-20242YA-Team-3
# Create .env file with configuration above
npm install
npm start
```

### Access the Application

- **API Docs:** http://localhost:3000/api-docs
- **GraphQL:** http://localhost:3000/graphql
- **Frontend:** http://localhost:3000

### Create First Admin User

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

**[Full installation guide →](docs/INSTALLATION.md)** | **[Admin Access Guide →](ADMIN_ACCESS_GUIDE.md)**

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](docs/INSTALLATION.md) | Setup instructions for all deployment methods |
| [Architecture](docs/ARCHITECTURE.md) | System design and component overview |
| [API Reference](docs/API.md) | Complete API endpoints documentation |
| [Quick Start](docs/QUICKSTART.md) | Get started in 5 minutes |
| [Security](docs/SECURITY.md) | Security policies and reporting |
| [Admin Access Guide](ADMIN_ACCESS_GUIDE.md) | Admin dashboard setup and usage |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute to this project |
| [Code of Conduct](docs/CODE_OF_CONDUCT.md) | Community standards |

---

## 📡 API Reference

### Core Endpoints

| Service | Endpoint | Description |
|---------|----------|-------------|
| **Authentication** | `POST /api/v1/login` | User login |
| | `POST /api/v1/tenants` | Create tenant |
| | `POST /api/v1/tenants/admin` | Create admin user |
| **Services** | `GET /api/v1/services` | List all services |
| | `GET /api/v1/services/:id` | Get service details |
| **Billing** | `POST /api/v1/bills` | Create bill |
| | `GET /api/v1/tenants/:id/bills` | Get tenant bills |
| **Payments** | `POST /api/v1/payment` | Process payment |
| **Notifications** | `GET /api/v1/notifications` | List notifications |
| | `POST /api/v1/notifications` | Create notification |

**[Complete API documentation →](docs/API.md)** | **[Swagger UI →](http://localhost:3000/api-docs)**

---

## 🔐 Security Features

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

**[Complete security documentation →](docs/SECURITY.md)** | **[Admin Access Guide →](ADMIN_ACCESS_GUIDE.md)**

---

## 🏗️ Architecture

![Deployment Diagram](docs/DeploymentDiagram.png)

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

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**[→ Contribution guidelines](docs/CONTRIBUTING.md)**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- GraphQL: [Apollo Server](https://www.apollographql.com/)
- Documentation: [Swagger/OpenAPI](https://swagger.io/)

---

<div align="center">
Made with ❤️ by BITS-MTECH Team 3
</div>
