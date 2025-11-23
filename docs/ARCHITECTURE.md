# Authentication Module Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
└────────────────┬────────────────────────────────┬───────────────┘
                 │                                │
                 │ HTTP Requests                  │ HTTP Responses
                 │                                │
┌────────────────▼────────────────────────────────▼───────────────┐
│                    Express Server (index.js)                    │
│                     Port: 3000 (configurable)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Static File Serving                        │   │
│  │  app.use('/auth', express.static(...))                 │   │
│  │                                                         │   │
│  │  Routes:                                               │   │
│  │  • GET /                → Redirect to /auth/login.html│   │
│  │  • GET /auth/login.html  → Serve login page          │   │
│  │  • GET /auth/signup.html → Serve signup page         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              API Routes (/api)                         │   │
│  │                                                         │   │
│  │  Authentication (auth-module.js):                     │   │
│  │  • POST /api/v1/login        → Authenticate tenant    │   │
│  │  • POST /api/v1/tenants      → Create new tenant      │   │
│  │  • GET  /api/v1/tenants      → List all tenants       │   │
│  │  • GET  /api/v1/tenants/:id  → Get tenant by ID       │   │
│  │  • PUT  /api/v1/tenants/:id  → Update tenant          │   │
│  │  • DELETE /api/v1/tenants/:id → Delete tenant         │   │
│  │                                                         │   │
│  │  Other Modules:                                        │   │
│  │  • /api/v1/services    → Service management           │   │
│  │  • /api/v1/billing     → Billing operations           │   │
│  │  • /api/v1/payments    → Payment processing           │   │
│  │  • /api/v1/notifications → Notification handling      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Additional Endpoints                      │   │
│  │                                                         │   │
│  │  • /api-docs  → Swagger API Documentation             │   │
│  │  • /graphql   → GraphQL Playground                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ Database Queries
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                        MongoDB Database                         │
│                                                                 │
│  Collections:                                                   │
│  • tenants       → User accounts and authentication            │
│  • services      → Service definitions                         │
│  • bills         → Billing information                         │
│  • notifications → Notification records                        │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow Examples

### Example 1: User Visits Login Page

```
User Browser                Express Server              File System
     |                            |                           |
     |  GET /                     |                           |
     |--------------------------->|                           |
     |                            |                           |
     |  302 Redirect              |                           |
     |  Location: /auth/login.html|                           |
     |<---------------------------|                           |
     |                            |                           |
     |  GET /auth/login.html      |                           |
     |--------------------------->|                           |
     |                            |  Read login.html          |
     |                            |-------------------------->|
     |                            |  File content             |
     |                            |<--------------------------|
     |  200 OK                    |                           |
     |  Content: HTML page        |                           |
     |<---------------------------|                           |
     |                            |                           |
```

### Example 2: User Submits Login Form

```
Browser (JS)              Express Server              MongoDB
     |                         |                          |
     |  POST /api/v1/login     |                          |
     |  Body: {email, password}|                          |
     |------------------------>|                          |
     |                         |  Find tenant by          |
     |                         |  email & password        |
     |                         |------------------------->|
     |                         |  Tenant document         |
     |                         |<-------------------------|
     |  200 OK                 |                          |
     |  Body: Tenant data      |                          |
     |<------------------------|                          |
     |                         |                          |
     | Store in localStorage   |                          |
     | Redirect to dashboard   |                          |
     |                         |                          |
```

### Example 3: User Creates Account

```
Browser (JS)              Express Server              MongoDB
     |                         |                          |
     | POST /api/v1/tenants    |                          |
     | Body: {name, email,...} |                          |
     |------------------------>|                          |
     |                         |  Validate data           |
     |                         |  Get next tenant ID      |
     |                         |------------------------->|
     |                         |  Last tenant ID          |
     |                         |<-------------------------|
     |                         |  Create new tenant       |
     |                         |------------------------->|
     |                         |  Success                 |
     |                         |<-------------------------|
     |  201 Created            |                          |
     |  Body: New tenant       |                          |
     |<------------------------|                          |
     |                         |                          |
     | Show success message    |                          |
     | Redirect to login       |                          |
     |                         |                          |
```

## Directory Structure

```
APIBP-20242YA-Team-3/
│
├── index.js                      # Main Express application
│   ├── Middleware setup
│   ├── Static file serving
│   ├── Route mounting
│   └── Server initialization
│
├── auth-module/
│   ├── auth-module.js           # Authentication API routes
│   ├── login.html               # Login page (Frontend)
│   ├── signup.html              # Signup page (Frontend)
│   └── README.md                # Module documentation
│
├── config/
│   ├── database.js              # MongoDB connection
│   └── logger.js                # Logging configuration
│
├── models/
│   └── Tenant.js                # Tenant schema/model
│
├── [other modules...]
│   ├── service-module/
│   ├── billing-module/
│   ├── payments-module/
│   └── notification-module/
│
├── package.json                 # Dependencies
├── README.md                    # Project documentation
└── QUICKSTART.md                # Getting started guide
```

## Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations
- **JavaScript (ES6+)**: Client-side logic
- **Fetch API**: HTTP requests

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB

### Additional Tools
- **Swagger**: API documentation
- **GraphQL**: Alternative API query language
- **Log4js**: Application logging

## Security Layers (Current & Future)

```
┌─────────────────────────────────────────────────┐
│              Browser Security                   │
│  • Form validation                              │
│  • Password strength indicator                  │
│  • Input sanitization                           │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│           Transport Security                    │
│  • HTTPS (Production) ⚠️ TODO                   │
│  • Secure headers ⚠️ TODO                       │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│         Application Security                    │
│  • Input validation (Server-side)               │
│  • Authentication ✓                             │
│  • Password hashing ⚠️ TODO                     │
│  • JWT tokens ⚠️ TODO                           │
│  • Rate limiting ⚠️ TODO                        │
│  • CSRF protection ⚠️ TODO                      │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│           Database Security                     │
│  • Connection string protection                 │
│  • Query sanitization (Mongoose)                │
│  • Data validation                              │
└─────────────────────────────────────────────────┘
```

## URL Routing Map

### Public URLs (No Authentication Required)
```
/                          → Redirect to login
/auth/login.html          → Login page
/auth/signup.html         → Signup page
/api/v1/login            → Login API endpoint
/api/v1/tenants          → Create tenant (signup)
/api-docs                → API documentation
```

### Protected URLs (Authentication Required) ⚠️ TODO
```
/dashboard               → User dashboard
/api/v1/tenants/:id     → Tenant operations (read/update/delete)
/api/v1/services        → Service management
/api/v1/billing         → Billing operations
/api/v1/payments        → Payment processing
```

## Best Practices Implemented

✅ **Separation of Concerns**: Frontend, Backend, Database layers
✅ **RESTful API Design**: Standard HTTP methods and status codes
✅ **Static File Serving**: Efficient content delivery
✅ **Error Handling**: Proper error responses
✅ **Logging**: Request and error logging
✅ **Documentation**: Swagger API docs
✅ **Code Organization**: Modular structure
✅ **Environment Configuration**: Configurable port and settings
✅ **Responsive Design**: Mobile-friendly UI
✅ **User Feedback**: Loading states, success/error messages

⚠️ **TODO (Production Readiness)**:
- Password hashing (bcrypt)
- JWT token authentication
- Session management
- HTTPS enforcement
- Rate limiting
- Input sanitization
- CSRF protection
- Security headers
- Email verification
- Password reset flow
