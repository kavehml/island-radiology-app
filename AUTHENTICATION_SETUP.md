# Authentication System Setup Guide

## Overview

The application now includes a comprehensive role-based authentication system with multiple user levels:

- **Admin**: Full system access
- **Radiologist**: Access to radiologist-specific features
- **Staff**: General staff access
- **Viewer**: Read-only access

## Database Setup

### Step 1: Run the Migration

Execute the migration script to create the users table:

```bash
psql -U postgres -d radiology_app -f database/migrations/add_users_table.sql
```

Or using psql directly:

```bash
psql -U postgres -d radiology_app
\i database/migrations/add_users_table.sql
```

### Step 2: Default Users

The migration creates three default users:

1. **Admin**
   - Email: `admin@islandradiology.com`
   - Password: `admin123`
   - Role: `admin`

2. **Staff**
   - Email: `staff@islandradiology.com`
   - Password: `staff123`
   - Role: `staff`

3. **Radiologist**
   - Email: `radiologist@islandradiology.com`
   - Password: `radiologist123`
   - Role: `radiologist`

⚠️ **IMPORTANT**: Change these default passwords in production!

## Backend Configuration

### Environment Variables

Add to your `backend/.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "admin@islandradiology.com",
    "password": "admin123"
  }
  ```

- `POST /api/auth/register` - Register new user (requires admin role)
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name",
    "role": "staff",
    "radiologistId": null
  }
  ```

- `GET /api/auth/me` - Get current user (requires authentication)
- `POST /api/auth/change-password` - Change password (requires authentication)

### Protected Routes

All existing routes remain accessible, but you can add authentication middleware:

```typescript
import { authenticateToken, requireRole } from '../middleware/auth';

router.get('/sensitive-route', authenticateToken, requireRole('admin'), handler);
```

## Frontend Usage

### Login

Users will be redirected to `/login` if not authenticated. The login page includes demo credentials.

### Role-Based Access

Routes are protected based on roles:

- **Dashboard**: All authenticated users
- **Sites**: Admin, Staff
- **Radiologists**: Admin, Radiologist, Staff
- **Procedures**: All authenticated users
- **Calendar**: All authenticated users
- **Orders**: All authenticated users
- **Optimization**: Admin, Staff

### Using Authentication in Components

```typescript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  if (hasRole('admin')) {
    return <div>Admin content</div>;
  }

  return <div>Regular content</div>;
};
```

## Security Notes

1. **Change Default Passwords**: The default passwords are for development only
2. **JWT Secret**: Use a strong, random secret in production
3. **HTTPS**: Always use HTTPS in production
4. **Password Policy**: Consider implementing password strength requirements
5. **Rate Limiting**: Add rate limiting to login endpoints
6. **Session Management**: Tokens expire after 24 hours

## Testing

Test the authentication:

```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@islandradiology.com","password":"admin123"}'

# Use token for protected route
curl http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

1. Run the database migration
2. Set JWT_SECRET in backend/.env
3. Restart backend server
4. Test login with default credentials
5. Create additional users as needed
