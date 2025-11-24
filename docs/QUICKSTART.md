# Quick Start Guide - Authentication Module

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn package manager

## Installation

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Configure MongoDB** in `config/database.js` (already configured)

3. **Start the server**:
   ```bash
   npm start
   ```

## Accessing the Application

Once the server is running, you can access:

### Frontend Pages
- **Home** (redirects to login): http://localhost:3000/
- **Login Page**: http://localhost:3000/auth/login.html
- **Signup Page**: http://localhost:3000/auth/signup.html
- **Dashboard** (requires login): http://localhost:3000/auth/dashboard.html

### API Endpoints
- **Login API**: `POST http://localhost:3000/api/v1/login`
- **Signup API**: `POST http://localhost:3000/api/v1/tenants`
- **Get All Tenants**: `GET http://localhost:3000/api/v1/tenants`

### Developer Tools
- **API Documentation**: http://localhost:3000/api-docs
- **GraphQL Playground**: http://localhost:3000/graphql

## Testing the Authentication Flow

### 1. Create a New Account
1. Navigate to http://localhost:3000/auth/signup.html
2. Fill in all required fields:
   - First Name & Last Name
   - Company Name
   - Email Address
   - Phone Number
   - Billing Address
   - Account Type (select from dropdown)
   - Password (with strength indicator)
   - Confirm Password
3. Accept Terms of Service
4. Click "Create Account"
5. You'll be redirected to the login page

### 2. Login
1. Navigate to http://localhost:3000/auth/login.html (or http://localhost:3000/)
2. Enter your email and password
3. Click "Sign In"
4. On success, you'll be redirected to the dashboard

### 3. Browse Services (Dashboard)
1. After login, you'll see the dashboard with all available services
2. Use the search bar to find specific services
3. Filter services by category using the filter tabs
4. Click on any service card to view details
5. Select a service to proceed with booking
6. Use the logout button to end your session

## API Usage Examples

### Signup (Create Tenant)
```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "companyName": "Example Corp",
    "email": "john@example.com",
    "phone": "+1234567890",
    "billingAddress": "123 Main St, City, Country",
    "status": "active",
    "password": "securePassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

## Standard Practices Implemented

### 1. **Static File Serving**
- HTML files are served from the `auth-module` directory
- Express static middleware: `app.use('/auth', express.static(path.join(__dirname, 'auth-module')))`
- Clean URLs: `/auth/login.html` instead of file paths

### 2. **Separation of Concerns**
- **Frontend**: HTML/CSS/JS files in `auth-module/`
- **Backend API**: Routes in `auth-module/auth-module.js`
- **Business Logic**: Database operations and validation
- **Configuration**: Separate config files for database, logging

### 3. **Route Structure**
- **Static Routes**: `/auth/*` for HTML pages
- **API Routes**: `/api/v1/*` for REST endpoints
- **Documentation**: `/api-docs` for Swagger UI
- **GraphQL**: `/graphql` for GraphQL queries

### 4. **Error Handling**
- Proper HTTP status codes
- User-friendly error messages
- Server-side validation
- Client-side form validation

### 5. **Security Considerations**
- Password fields (not visible)
- Form validation (client and server)
- CORS headers (if needed)
- Input sanitization
- ⚠️ **TODO**: Implement password hashing, JWT tokens, HTTPS

### 6. **User Experience**
- Loading indicators
- Success/error messages
- Smooth animations
- Responsive design
- Clear navigation

### 7. **Code Organization**
```
project-root/
├── index.js                    # Main Express server
├── auth-module/
│   ├── auth-module.js         # Authentication API routes
│   ├── login.html             # Login UI
│   ├── signup.html            # Signup UI
│   └── README.md              # Module documentation
├── config/
│   ├── database.js            # Database configuration
│   └── logger.js              # Logging configuration
├── models/
│   └── Tenant.js              # Tenant data model
└── package.json               # Dependencies
```

## Environment Variables (Optional)
You can set these environment variables:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string

## Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify MongoDB is running
- Check for missing dependencies: `npm install`

### Cannot access pages
- Ensure server is running: `npm start`
- Check the console for the server URL
- Try `http://localhost:3000` instead of `http://127.0.0.1:3000`

### Login fails
- Verify the account was created successfully
- Check MongoDB for the user data
- Check browser console for JavaScript errors
- Verify API endpoint in the fetch request

### Signup fails
- Check all required fields are filled
- Verify passwords match
- Check server logs for errors
- Verify MongoDB connection

## Next Steps

1. **Implement Security**:
   - Add password hashing (bcrypt)
   - Implement JWT tokens
   - Add session management
   - Enable HTTPS

2. **Add Features**:
   - Email verification
   - Password reset
   - Remember me functionality
   - Social login (Google, GitHub)
   - Two-factor authentication

3. **Improve UX**:
   - Add loading skeletons
   - Implement progressive enhancement
   - Add accessibility features
   - Support multiple languages

4. **Testing**:
   - Unit tests for API endpoints
   - Integration tests
   - E2E tests with Selenium/Cypress
   - Load testing

## Support

For issues or questions:
1. Check the console logs (browser and server)
2. Review the API documentation at http://localhost:3000/api-docs
3. Check MongoDB data directly
4. Review the code in `auth-module/` directory
