# Admin Dashboard Access Guide

## Overview
The admin dashboard is now fully protected with JWT-based authentication and role-based access control (RBAC). Both backend middleware and frontend checks ensure only authorized admin users can access admin features.

---

## 🔐 Security Implementation

### 1. **Backend Protection**
- **Cookie-based Authentication**: Admin pages check for JWT token in cookies (automatically sent by browsers)
- **Role Verification**: Middleware verifies user has `admin` role before serving admin pages
- **Automatic Redirects**: Unauthorized users are redirected to login page

### 2. **Frontend Protection**
- **JWT Token Management**: Tokens stored in both localStorage and cookies
- **Role-based Routing**: Admin users redirected to admin dashboard after login
- **API Authentication**: All API calls use Bearer token authentication

### 3. **Protected API Routes**
All sensitive routes now require authentication:

#### **Auth Controller** (Tenant Management)
- ✅ `GET /api/v1/tenants` - Admin only
- ✅ `GET /api/v1/tenants/:id` - Owner or Admin
- ✅ `PUT /api/v1/tenants/:id` - Owner or Admin
- ✅ `DELETE /api/v1/tenants/:id` - Owner or Admin
- ✅ `POST /api/v1/tenants/admin` - Setup key (first) or Admin token (subsequent)

#### **Billing Controller**
- ✅ `POST /api/v1/bills` - Authenticated users
- ✅ `GET /api/v1/bills/:billId` - Authenticated users
- ✅ `GET /api/v1/tenants/:tenantId/bills` - Owner or Admin
- ✅ `PUT /api/v1/bills/:id` - Owner or Admin
- ⚠️ `GET /api/v1/bills` - Public (for browsing)

#### **Payment Controller**
- ✅ `POST /api/v1/payment` - Authenticated users

#### **Service Controller**
- ✅ `POST /api/v1/services` - Admin only
- ✅ `PUT /api/v1/services/:serviceId` - Admin only
- ⚠️ `GET /api/v1/services` - Public (for browsing)
- ⚠️ `GET /api/v1/services/:serviceId` - Public (for browsing)

#### **Notification Controller**
- ✅ `GET /api/v1/notifications` - Authenticated users
- ✅ `GET /api/v1/notifications/type/:type` - Authenticated users
- ✅ `GET /api/v1/notifications/:id` - Authenticated users
- ✅ `POST /api/v1/notifications` - Authenticated users

---

## 📝 How to Create Admin Account

### Option 1: First Admin (Using Setup Key)

```bash
curl -X POST http://localhost:3000/api/v1/tenants/admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Admin",
    "email": "admin@evio-tech.com",
    "phone": "+1234567890",
    "password": "AdminPass123",
    "companyName": "Evio-Tech Services",
    "setupKey": "default-setup-key-change-me"
  }'
```

**Response:**
```json
{
  "id": 12,
  "name": "Super Admin",
  "email": "admin@evio-tech.com",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Option 2: Additional Admins (Requires Existing Admin Token)

```bash
curl -X POST http://localhost:3000/api/v1/tenants/admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Another Admin",
    "email": "admin2@evio-tech.com",
    "phone": "+0987654321",
    "password": "SecurePass456",
    "companyName": "Evio-Tech Services"
  }'
```

---

## 🚀 How to Access Admin Dashboard

### Step 1: Login with Admin Credentials
1. Navigate to: `http://localhost:3000/pages/auth/login.html`
2. Enter admin email and password
3. System automatically:
   - Stores JWT token in localStorage
   - Sets JWT token as cookie (for backend protection)
   - Redirects to admin dashboard if role is `admin`

### Step 2: Admin Dashboard URL
- Direct URL: `http://localhost:3000/pages/admin/dashboard.html`
- **Note**: You'll be redirected to login if not authenticated or not admin

### Step 3: What Happens Behind the Scenes
1. **Browser requests admin page** → Server checks cookie for JWT token
2. **Server validates token** → Verifies signature and checks role
3. **If admin role** → Serves admin dashboard HTML
4. **If not admin** → Returns 403 Forbidden with redirect
5. **If no token** → Returns 401 Unauthorized with redirect

---

## 🛡️ Security Features Summary

### ✅ Implemented
1. **Password Hashing** - bcrypt with 10 salt rounds
2. **JWT Authentication** - 24-hour expiry, secure tokens
3. **Role-Based Access Control** - User/Admin roles
4. **Cookie-based Protection** - Backend validates tokens via cookies
5. **Rate Limiting** - 100 req/15min (API), 5 req/15min (auth)
6. **Security Headers** - Helmet.js (CSP, XSS, clickjacking protection)
7. **CORS Protection** - Configurable origins
8. **Request Validation** - Input validation on all endpoints
9. **Secure Admin Creation** - Setup key for first admin, token for subsequent
10. **Automatic Token Cleanup** - Expired tokens cleared automatically

### 🔒 Admin-Only Features
- View all users (`GET /api/v1/tenants`)
- Create/Update/Delete any user
- Create/Update services
- View all bills across all tenants
- Admin dashboard with system statistics

---

## 🧪 Testing Admin Access

### Test 1: Create Admin Account
```bash
curl -X POST http://localhost:3000/api/v1/tenants/admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "test@admin.com",
    "phone": "+1111111111",
    "password": "TestAdmin123",
    "setupKey": "default-setup-key-change-me"
  }'
```

### Test 2: Login as Admin
```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@admin.com",
    "password": "TestAdmin123"
  }'
```

### Test 3: Access Protected Route
```bash
curl -X GET http://localhost:3000/api/v1/tenants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 4: Try Admin Dashboard
1. Open browser: `http://localhost:3000/pages/admin/dashboard.html`
2. Without login → Should redirect to login page
3. Login as regular user → Should show 403 Forbidden
4. Login as admin → Should show admin dashboard

---

## ⚙️ Environment Configuration

### Required Environment Variables

Create `.env` file in project root:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=24h

# Admin Setup Key (for first admin creation)
ADMIN_SETUP_KEY=your-secure-setup-key-change-me

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# MongoDB Connection
MONGODB_URI=your-mongodb-connection-string

# Server Port
PORT=3000
```

### Security Best Practices
1. **Never commit `.env` to version control**
2. **Use strong JWT_SECRET** (minimum 32 characters)
3. **Change ADMIN_SETUP_KEY** after first admin creation
4. **Use HTTPS in production**
5. **Set specific ALLOWED_ORIGINS** (no wildcards in production)
6. **Rotate JWT secrets periodically**

---

## 🐛 Troubleshooting

### Issue: "401 - Unauthorized" when accessing admin dashboard
**Solution**: Login again. Token might be expired or missing.

### Issue: "403 - Forbidden" after login
**Solution**: Your account doesn't have admin role. Contact an existing admin to upgrade your account.

### Issue: Cannot create first admin with setup key
**Solution**: Verify `ADMIN_SETUP_KEY` in `.env` matches the key in your request.

### Issue: Token expired error
**Solution**: JWT tokens expire after 24 hours. Login again to get a new token.

### Issue: CORS errors in browser
**Solution**: Add your frontend URL to `ALLOWED_ORIGINS` in `.env`

---

## 📚 API Documentation

Access full API documentation:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **GraphQL Playground**: `http://localhost:3000/graphql`

---

## 🎯 Next Steps

1. ✅ Create first admin account using setup key
2. ✅ Login with admin credentials
3. ✅ Access admin dashboard
4. ✅ Create additional admin users (if needed)
5. ⏳ Configure environment variables for production
6. ⏳ Set up HTTPS for production deployment
7. ⏳ Implement additional features (2FA, audit logs, etc.)

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation at `/api-docs`
3. Check server logs for detailed error messages
4. Verify JWT token is valid and not expired

---

**Security Note**: This implementation provides production-ready authentication and authorization. However, for high-security environments, consider adding:
- Two-factor authentication (2FA)
- IP whitelisting for admin access
- Audit logging for all admin actions
- Password complexity requirements
- Account lockout after failed login attempts
