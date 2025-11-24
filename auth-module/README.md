# Auth Module - Login, Signup & Dashboard Pages

## Overview
This module provides creative, modern login, signup, and dashboard pages for tenant authentication and service browsing.

## Features

### Login Page (`login.html`)
- 🎨 Beautiful gradient background with animated particles
- 🔐 Secure email/password authentication
- ✨ Smooth animations and transitions
- 📱 Fully responsive design
- 💫 Loading states and error handling
- 🎯 Integration with `/api/v1/login` endpoint
- ↪️ Auto-redirect to dashboard on success

### Signup Page (`signup.html`)
- 🚀 Multi-field registration form
- 💪 Real-time password strength indicator
- ✅ Form validation
- 🎨 Matching design with login page
- 📋 Company information collection
- 🔒 Password confirmation
- ✨ Animated UI elements
- 📱 Mobile-friendly responsive layout

### Dashboard Page (`dashboard.html`) 🆕
- 🏠 User-friendly service catalog interface
- 🔍 Real-time search functionality
- 🏷️ Category filtering system
- 📊 Service cards with pricing display
- 💳 Service selection and details modal
- 👤 User profile display in header
- 🚪 Logout functionality
- 📱 Fully responsive grid layout
- 🎨 Modern card-based design
- ⚡ Fast API integration with service module

## Access URLs

Once the server is running on `http://localhost:3000`:
- **Root URL**: `http://localhost:3000/` (smart redirect based on login state)
- **Login Page**: `http://localhost:3000/auth/login.html`
- **Signup Page**: `http://localhost:3000/auth/signup.html`
- **Dashboard**: `http://localhost:3000/auth/dashboard.html` (requires login)
- **API Documentation**: `http://localhost:3000/api-docs`
- **GraphQL Playground**: `http://localhost:3000/graphql`

## API Integration

### Login
- **Endpoint**: `POST /api/v1/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: Stores tenant data in localStorage and redirects to dashboard

### Signup
- **Endpoint**: `POST /api/v1/tenants`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "companyName": "Example Corp",
    "email": "john@example.com",
    "phone": "+1234567890",
    "billingAddress": "123 Main St",
    "status": "active",
    "password": "securePassword123"
  }
  ```

### Dashboard Services
- **Get All Services**: `GET /api/v1/services`
- **Get Service by ID**: `GET /api/v1/services/:serviceId`
- **Get Categories**: `GET /api/v1/categories`
- **Price Estimate**: `GET /api/v1/services/:serviceId/price-estimate`

## User Flow

```
1. User visits http://localhost:3000
   ↓
2. Check if logged in (localStorage check)
   ↓
   ├─ Not Logged In → Redirect to /auth/login.html
   │   ↓
   │   User enters credentials
   │   ↓
   │   POST /api/v1/login
   │   ↓
   │   Success → Store tenant data → Redirect to dashboard
   │
   └─ Logged In → Redirect to /auth/dashboard.html
       ↓
       Load services from /api/v1/services
       ↓
       Display service catalog
       ↓
       User can:
       • Search services
       • Filter by category
       • View service details
       • Select service
       • Logout
```

## Dashboard Features

### Service Browsing
- **Search**: Real-time search across service names, categories, and sub-services
- **Filter**: Filter services by category (All, Cloud Services, Software Development, etc.)
- **View**: Beautiful card-based layout with service details and pricing

### Service Cards Display:
- Service name
- Sub-category badge
- Price per hour
- Quick action buttons (Details & Select)

### Service Details Modal
When clicking on a service, a modal shows:
- Complete service information
- Category hierarchy
- Detailed pricing
- Service description
- Action buttons (Select Service, Close)

### User Actions
- **Select Service**: Store selected service in localStorage for next steps
- **Logout**: Clear session and return to login
- **View Profile**: Display user name and email in header

### Visual Elements
- Gradient background (Purple to Blue)
- Animated floating particles
- Glass-morphism effect on containers
- Smooth transitions and hover effects
- Icon-enhanced input fields
- Responsive grid layout

### User Experience
- Clear error messages
- Success notifications
- Loading indicators
- Password strength meter
- Form validation
- Accessible design

## Testing

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   
   This will automatically redirect you to the login page.

3. Or directly access:
   - Login: `http://localhost:3000/auth/login.html`
   - Signup: `http://localhost:3000/auth/signup.html`

## Project Structure

```
auth-module/
├── auth-module.js      # Express routes for authentication API
├── login.html          # Login page (static file)
├── signup.html         # Signup page (static file)
└── README.md           # Documentation
```

The auth module is integrated into the main Express application via:
- Static file serving: `/auth/*` routes serve HTML files
- API routes: `/api/v1/*` routes handle authentication logic

## Customization

### Colors
The main gradient colors can be modified in the CSS:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Particles
Adjust particle count and animation in the JavaScript:
```javascript
const particleCount = 20; // Change number of particles
```

### Form Fields
Add or remove fields in the HTML forms as needed for your requirements.

## Security Notes

⚠️ **Important**: This is a frontend implementation. For production use:
- Add email verification
- Implement session management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Social login integration (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Remember me functionality
- [ ] Dark mode toggle
- [ ] Multi-language support
