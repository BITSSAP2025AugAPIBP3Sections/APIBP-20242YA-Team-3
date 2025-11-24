# Service Management Platform - Assignment Guide

## Overview

Service management platform with 8 categories, 35+ subcategories, and 182+ services. Supports REST and GraphQL APIs with auto-generated IDs.

---

## Quick Start

### 1. Setup & Seed Database
```bash
# Install dependencies
npm install

# Seed database with services
node scripts/seed-fresh-services.js

# Start server
npm start
```

### 2. Access Application
- **Dashboard**: http://localhost:3000/pages/dashboard/index.html
- **API Docs**: http://localhost:3000/api-docs
- **GraphQL**: http://localhost:3000/graphql

---

## Service Hierarchy

```
Category (Level 1)
└── SubService (Level 2)
    └── Service (Level 3)
```

**8 Categories Available:**
1. 🏠 Home Services (45 services)
2. 💼 Professional Services (32 services)
3. 👤 Personal Services (25 services)
4. 🚗 Automotive Services (15 services)
5. 🎉 Event Services (20 services)
6. 🏥 Health & Wellness (15 services)
7. 💻 Technology Services (15 services)
8. 🏢 Real Estate Services (15 services)

---

## REST API Endpoints

### Authentication
```bash
# Login
POST /api/v1/login
Content-Type: application/json
{
  "email": "admin@example.com",
  "password": "your-password"
}

# Response: { "token": "jwt-token-here" }
```

### Read Operations (Public)
```bash
# Get all categories
GET /api/v1/categories

# Get all services
GET /api/v1/services

# Filter by category
GET /api/v1/services?category=Home%20Services

# Search by name
GET /api/v1/services?name=cleaning

# Get specific service
GET /api/v1/services/:serviceId

# Get price estimate
GET /api/v1/services/:serviceId/price-estimate
```

### Write Operations (Admin Only)

**Headers Required:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Create Category:**
```bash
POST /api/v1/categories
{
  "name": "Food Services"
}
# Response: { "id": 9, "name": "Food Services", "subServices": [] }
```

**Create SubCategory:**
```bash
POST /api/v1/categories/:categoryId/subcategories
{
  "name": "Personal Chef Services"
}
# Response: { "id": 901, "name": "Personal Chef Services" }
```

**Create Service:**
```bash
POST /api/v1/services
{
  "categoryId": 9,
  "subServiceId": 901,
  "name": "Home Chef - Gourmet Meals",
  "pricePerHour": 75
}
# Response: { "id": 9011, "name": "...", "pricePerHour": 75 }
```

**Update Service:**
```bash
PUT /api/v1/services/:serviceId
{
  "name": "Updated Service Name",
  "pricePerHour": 80
}
```

**Delete Service:**
```bash
DELETE /api/v1/services/:serviceId
```

---

## GraphQL API

### Access Playground
```
http://localhost:3000/graphql
```

### Set Headers in Playground
```json
{
  "Authorization": "Bearer YOUR_TOKEN"
}
```

### Queries

**Get All Services:**
```graphql
query {
  services {
    id
    name
    pricePerHour
    categoryName
    subServiceName
  }
}
```

**Filter by Category:**
```graphql
query {
  services(category: "Home Services") {
    id
    name
    pricePerHour
    subServiceName
  }
}
```

**Get Single Service:**
```graphql
query {
  service(id: 1011) {
    id
    name
    pricePerHour
    categoryName
    subServiceName
  }
}
```

**Get All Categories:**
```graphql
query {
  categories {
    id
    name
    subServices {
      id
      name
    }
  }
}
```

### Mutations (Admin Only)

**Create Category:**
```graphql
mutation {
  createCategory(input: { name: "Food Services" }) {
    id
    name
    subServices {
      id
      name
    }
  }
}
```

**Create SubCategory:**
```graphql
mutation {
  createSubCategory(input: {
    categoryId: 9
    name: "Personal Chef Services"
  }) {
    id
    name
  }
}
```

**Create Service:**
```graphql
mutation {
  createService(input: {
    categoryId: 9
    subServiceId: 901
    name: "Home Chef - Gourmet Meals"
    pricePerHour: 75
  }) {
    id
    name
    pricePerHour
    categoryName
    subServiceName
  }
}
```

---

## Auto-Generated IDs

**System automatically generates IDs:**

- **Category IDs**: Sequential (1, 2, 3, ..., 9)
- **SubCategory IDs**: `categoryId × 100 + sequence` (e.g., 901, 902, 903 for category 9)
- **Service IDs**: `subServiceId × 10 + sequence` (e.g., 9011, 9012, 9013 for subcategory 901)

**You never need to provide IDs manually!**

---

## Complete Example: Create New Category

### Step 1: Login
```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```
Save the token from response.

### Step 2: Create Category
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Food Services"}'
```
Response: `{ "id": 9, ... }`

### Step 3: Create SubCategory
```bash
curl -X POST http://localhost:3000/api/v1/categories/9/subcategories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Personal Chef Services"}'
```
Response: `{ "id": 901, ... }`

### Step 4: Create Service
```bash
curl -X POST http://localhost:3000/api/v1/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "categoryId": 9,
    "subServiceId": 901,
    "name": "Home Chef - Gourmet Meals",
    "pricePerHour": 75
  }'
```
Response: `{ "id": 9011, ... }`

---

## Verification

### Via API
```bash
# Check all categories
curl http://localhost:3000/api/v1/categories

# Check services in new category
curl "http://localhost:3000/api/v1/services?category=Food%20Services"
```

### Via GraphQL
```graphql
query {
  services(category: "Food Services") {
    id
    name
    pricePerHour
  }
}
```

### Via Dashboard
1. Open http://localhost:3000/pages/dashboard/index.html
2. Login if needed
3. See "Food Services" in category filters
4. Click to view services

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| Duplicate category | Name already exists | Use different name |
| Unauthorized | Missing/invalid token | Login again |
| Category not found | Invalid category ID | Check ID exists |
| Validation error | Missing required fields | Check request body |

---

## Testing Checklist

- [ ] Seed database successfully
- [ ] View all categories via API
- [ ] Get all services
- [ ] Filter services by category
- [ ] Create new category (admin)
- [ ] Create new subcategory (admin)
- [ ] Create new service (admin)
- [ ] Test GraphQL queries
- [ ] Test GraphQL mutations
- [ ] View services in dashboard

---

## Key Features

✅ 182+ pre-configured services  
✅ REST & GraphQL APIs  
✅ Auto-generated IDs  
✅ Admin authentication  
✅ Real-time search & filtering  
✅ Price estimation  
✅ Interactive API documentation  

---

## Environment Variables

Required in `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/service_management_platform
PORT=3000
JWT_SECRET=your-secret-key
```

---

## Troubleshooting

**Services not showing:**
```bash
# Reseed database
node scripts/seed-fresh-services.js

# Restart server
npm start
```

**Cannot create services:**
- Verify admin token is valid
- Check category/subcategory IDs exist
- Ensure proper headers in request

**Port conflict:**
```bash
# Change port in .env
PORT=3001

# Or kill process
lsof -ti:3000 | xargs kill -9
```

---

## REST vs GraphQL Comparison

| Feature | REST | GraphQL |
|---------|------|---------|
| Endpoints | Multiple (/api/v1/*) | Single (/graphql) |
| Field Selection | Fixed response | Choose fields |
| Multiple Resources | Multiple requests | Single request |
| Documentation | Swagger | Introspection |
| Type Safety | No | Yes |
| Learning Curve | Easy | Moderate |

**Use REST for:** Simple CRUD, traditional APIs  
**Use GraphQL for:** Complex queries, flexible data fetching

---

## Summary

**Complete workflow:**
1. Seed database: `node scripts/seed-fresh-services.js`
2. Start server: `npm start`
3. Login to get admin token
4. Create categories via REST or GraphQL
5. View in dashboard or query via API

**All IDs are auto-generated - no manual calculation needed!**
