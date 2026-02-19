# Missing Backend User Management Endpoints

## Current Status ✅
- **Organization Management**: Fully working with super admin endpoints
- **Authentication**: Working perfectly
- **User Redirect Routes**: ✅ Implemented (d567e6c)

## Current Issue ❌

The Users page is returning **500 Internal Server Error** instead of 404, which means:
- ✅ Redirect routes are working (`/api/users` → `/api/super-admin/users`)
- ❌ Server error in the super admin user endpoints

### Required Super Admin User Endpoints:

```javascript
// 1. Get all users across all organizations (super admin only)
GET /api/super-admin/users
// Query params: page, limit, search, role, organizationId

// 2. Create user in specific organization (super admin only)  
POST /api/super-admin/users
// Body: { firstName, lastName, email, role, organizationId, phone?, password? }

// 3. Update user (super admin only)
PUT /api/super-admin/users/:userId
// Body: { firstName, lastName, email, role, phone, isActive }

// 4. Delete user (super admin only)
DELETE /api/super-admin/users/:userId

// 5. Get users by organization (for dropdown population)
GET /api/super-admin/organizations/:orgId/users
```

### Current Frontend API Calls:
```javascript
// These are currently failing with 404:
GET /api/users                    → Should be /api/super-admin/users
POST /api/users                   → Should be /api/super-admin/users  
PUT /api/users/:userId            → Should be /api/super-admin/users/:userId
DELETE /api/users/:userId         → Should be /api/super-admin/users/:userId
```

## Expected Response Formats:

### GET /api/super-admin/users
```json
{
  "success": true,
  "data": [
    {
      "_id": "60f4d2e1234567890abcdef1",
      "firstName": "John",
      "lastName": "Doe", 
      "email": "john@example.com",
      "role": "manager",
      "organizationId": "60f4d2e1234567890abcdef2",
      "organizationName": "Example Corp",
      "phone": "1234567890",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  },
  "message": "Found 25 users"
}
```

### POST /api/super-admin/users
```json
// Request Body:
{
  "firstName": "Jane",
  "lastName": "Smith", 
  "email": "jane@company.com",
  "role": "agent",
  "organizationId": "60f4d2e1234567890abcdef2",
  "phone": "9876543210",
  "password": "TempPassword123!" // Optional, generate if not provided
}

// Response:
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f4d2e1234567890abcdef3",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@company.com", 
      "role": "agent",
      "organizationId": "60f4d2e1234567890abcdef2",
      "phone": "9876543210",
      "isActive": true,
      "createdAt": "2024-01-20T00:00:00.000Z"
    },
    "temporaryPassword": "TempPassword123!" // If password was generated
  },
  "message": "User created successfully"
}
```

## Required User Roles:
```javascript
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',    // Full system access
  ORG_ADMIN: 'org_admin',        // Organization admin
  MANAGER: 'manager',            // Department manager  
  AGENT: 'agent',                // Call center agent
  VIEWER: 'viewer'               // Read-only access
};
```

## Authentication Middleware:
All super admin user endpoints should use the same authentication middleware as the organization endpoints (which are working perfectly).

## Database Schema:
Ensure User model has these fields:
```javascript
const userSchema = {
  firstName: String,
  lastName: String, 
  email: String,
  password: String,
  role: { type: String, enum: ['super_admin', 'org_admin', 'manager', 'agent', 'viewer'] },
  organizationId: { type: ObjectId, ref: 'Organization' },
  phone: String,
  isActive: { type: Boolean, default: true },
  signupSource: { type: String, enum: ['web', 'android', 'ios', 'api'], default: 'api' },
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
};
```

## Quick Implementation:
You can copy the organization super admin endpoints and modify them for users. The authentication, middleware, and response patterns are already working perfectly.

## Priority:
- **High**: GET and POST endpoints (for viewing and creating users)
- **Medium**: PUT and DELETE endpoints (for editing and removing users)

## 🐛 Current Debugging (500 Error)

Since the endpoints now return 500 instead of 404, the issue is likely:

1. **Database Query Error**: User model not properly referenced
2. **Schema Mismatch**: Missing required fields in database
3. **Authentication Error**: Super admin middleware not properly applied to user routes
4. **Validation Error**: Request body validation failing

### Debug Steps:

1. **Check Vercel Logs** for the actual error:
   ```bash
   # Look for the specific error in the super admin user endpoints
   ```

2. **Common 500 Error Causes**:
   ```javascript
   // Missing User model import
   const User = require('../models/User'); // Make sure this exists
   
   // Database connection issue
   await mongoose.connection.db; // Check if connected
   
   // Schema validation error
   const user = new User(userData); // Check if all required fields are provided
   ```

3. **Test with Minimal Data**:
   ```json
   {
     "firstName": "Test",
     "lastName": "User",
     "email": "test@example.com",
     "role": "agent",
     "organizationId": "your-org-id-here"
   }
   ```

### Quick Fix Template:
Copy the working organization endpoints and replace "Organization" with "User" - the authentication and structure are identical.

Once the 500 error is fixed, the Users page will work exactly like the Organizations page currently does!