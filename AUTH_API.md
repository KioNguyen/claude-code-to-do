# Authentication API Documentation

Complete guide to the RESTful authentication API endpoints.

## Table of Contents
- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
  - [Register](#register)
  - [Login](#login)
  - [Get Current User](#get-current-user)
  - [Update Profile](#update-profile)
  - [Change Password](#change-password)
  - [Password Reset Request](#password-reset-request)
  - [Password Reset Confirm](#password-reset-confirm)
  - [Refresh Token](#refresh-token)
  - [Validate Token](#validate-token)
- [Error Responses](#error-responses)
- [Security Features](#security-features)

## Overview

The authentication system uses **JWT (JSON Web Tokens)** for secure, stateless authentication. All protected endpoints require a valid JWT token in the Authorization header.

### Base URL
```
http://localhost:5001/api
```

### Authentication Header Format
```
Authorization: Bearer <your_jwt_token>
```

## Authentication Flow

1. **Register** or **Login** to get access and refresh tokens
2. Include the **access token** in the `Authorization` header for protected endpoints
3. When the access token expires, use the **refresh token** to get a new access token
4. Tokens are valid for:
   - Access Token: 1 hour
   - Refresh Token: 30 days

---

## API Endpoints

### Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "first_name": "John",      // Optional
  "last_name": "Doe"          // Optional
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit

**Username Requirements:**
- 3-80 characters
- Only alphanumeric and underscores

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_verified": false,
    "created_at": "2025-10-22T06:44:12.607518"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Error Responses:**
- `400` - Missing required fields or invalid format
- `409` - Email or username already exists

---

### Login

Authenticate and get JWT tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",    // Can use email OR username
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_verified": false,
    "created_at": "2025-10-22T06:44:12.607518"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Error Responses:**
- `400` - Missing email/username or password
- `401` - Invalid credentials
- `403` - Account is deactivated

---

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_verified": false,
    "created_at": "2025-10-22T06:44:12.607518"
  }
}
```

**Error Responses:**
- `401` - Invalid or missing token
- `404` - User not found

---

### Update Profile

Update the current user's profile information.

**Endpoint:** `PUT /api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "first_name": "Jane",      // Optional
  "last_name": "Smith",      // Optional
  "username": "janesmith"    // Optional
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "janesmith",
    "first_name": "Jane",
    "last_name": "Smith",
    "is_active": true,
    "is_verified": false,
    "created_at": "2025-10-22T06:44:12.607518"
  }
}
```

**Error Responses:**
- `400` - Invalid data or missing required fields
- `401` - Invalid or missing token
- `409` - Username already taken

---

### Change Password

Change the current user's password.

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "current_password": "SecurePass123",
  "new_password": "NewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Missing required fields or weak password
- `401` - Current password is incorrect or invalid token

---

### Password Reset Request

Request a password reset token (sent via email in production).

**Endpoint:** `POST /api/auth/password-reset/request`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Note:** For security, always returns success even if email doesn't exist.

In development, the reset token is printed to the backend console:
```
============================================================
Password Reset Email for: user@example.com
Reset URL: http://localhost:3000/reset-password?token=xxxxx
Token: xxxxx
============================================================
```

---

### Password Reset Confirm

Reset password using the token from reset request.

**Endpoint:** `POST /api/auth/password-reset/confirm`

**Request Body:**
```json
{
  "token": "voldkuo3f5GBI_H6B3OgdAeUk2Q0xv-ZbSeios99SNs",
  "new_password": "NewSecurePass456"
}
```

**Success Response (200):**
```json
{
  "message": "Password has been reset successfully"
}
```

**Error Responses:**
- `400` - Invalid or expired token, or weak password

---

### Refresh Token

Get a new access token using a refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token

---

### Validate Token

Check if the current access token is valid.

**Endpoint:** `GET /api/auth/validate-token`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "valid": true,
  "user_id": 1
}
```

**Error Responses:**
- `401` - Invalid or expired token

---

## Protected Todo Endpoints

All todo endpoints now require authentication:

### Get All Todos
```
GET /api/todos
Authorization: Bearer <access_token>
```

### Get Single Todo
```
GET /api/todos/{id}
Authorization: Bearer <access_token>
```

### Create Todo
```
POST /api/todos
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false
}
```

### Update Todo
```
PUT /api/todos/{id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true
}
```

### Delete Todo
```
DELETE /api/todos/{id}
Authorization: Bearer <access_token>
```

**Note:** Users can only access their own todos.

---

## Error Responses

### Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or failed
- **403 Forbidden** - Access denied
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists (e.g., duplicate email)
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "error": "Detailed error message"
}
```

or (for JWT errors):

```json
{
  "msg": "JWT error message"
}
```

---

## Security Features

### Password Security
- ✅ Passwords hashed using **Werkzeug** (PBKDF2 + SHA256)
- ✅ Strong password requirements enforced
- ✅ Passwords never returned in API responses

### JWT Token Security
- ✅ Tokens signed with secret key
- ✅ Short-lived access tokens (1 hour)
- ✅ Long-lived refresh tokens (30 days)
- ✅ Tokens include user ID in payload

### Password Reset Security
- ✅ Secure random tokens (URL-safe)
- ✅ Tokens expire after 1 hour
- ✅ Tokens cleared after use
- ✅ Generic responses to prevent email enumeration

### Additional Security
- ✅ Email validation
- ✅ Username validation (alphanumeric + underscores only)
- ✅ Account active status checking
- ✅ CORS configured for specific origins
- ✅ User isolation (users only see their own data)

---

## Example Usage (JavaScript/Fetch)

### Register
```javascript
const response = await fetch('http://localhost:5001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'johndoe',
    password: 'SecurePass123',
    first_name: 'John',
    last_name: 'Doe'
  })
});

const data = await response.json();
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);
```

### Login
```javascript
const response = await fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123'
  })
});

const data = await response.json();
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);
```

### Authenticated Request
```javascript
const token = localStorage.getItem('access_token');

const response = await fetch('http://localhost:5001/api/todos', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const todos = await response.json();
```

### Handle Token Expiration
```javascript
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  // If unauthorized, try refreshing token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');

    const refreshResponse = await fetch('http://localhost:5001/api/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${refreshToken}` }
    });

    if (refreshResponse.ok) {
      const { access_token } = await refreshResponse.json();
      localStorage.setItem('access_token', access_token);

      // Retry original request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${access_token}`
        }
      });
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}
```

---

## Testing

A test script is provided at `test_auth.sh`. Run it with:

```bash
chmod +x test_auth.sh
./test_auth.sh
```

This will test:
1. User registration
2. User login
3. Get current user profile
4. Create authenticated todo
5. Get todos (authenticated)
6. Unauthorized access (without token)

---

## Environment Variables

Required environment variables in `.env`:

```bash
# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# Database
DATABASE_URL=postgresql://user:password@db:5432/todo_db

# Flask
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
```

**⚠️ Important:** Change `JWT_SECRET_KEY` and `SECRET_KEY` in production!

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(80),
    last_name VARCHAR(80),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(100) UNIQUE,
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Todos Table (Updated)
```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Next Steps

For frontend integration, you'll need to:

1. Create login/register pages
2. Store JWT tokens securely (localStorage or httpOnly cookies)
3. Add Authorization header to all API requests
4. Handle token expiration and refresh
5. Create password reset pages
6. Add authentication guards to routes

Happy coding! 🚀
