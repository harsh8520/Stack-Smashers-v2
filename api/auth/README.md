# Authentication Endpoints

This directory contains the authentication endpoints for the Vercel + OpenAI migration.

## Endpoints

### POST /api/auth/signup

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation:**
- Email must be in valid format
- Password must be at least 6 characters
- Email must not already exist

**Success Response (201):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: Invalid input (missing fields, invalid format, password too short)
- `409`: User already exists
- `500`: Server error

### POST /api/auth/login

Authenticates an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  }
}
```

**Error Responses:**
- `400`: Invalid input (missing fields)
- `401`: Invalid credentials (user not found or wrong password)
- `500`: Server error

## Features

Both endpoints include:
- CORS headers for cross-origin requests
- OPTIONS method support for preflight requests
- Input validation
- Secure password hashing (bcrypt)
- JWT token generation
- Error handling with appropriate HTTP status codes

## Dependencies

- `lib/auth.js`: Authentication utilities (JWT, bcrypt)
- `lib/storage.js`: User storage operations (Vercel KV)

## Testing

Unit tests are provided in `auth.test.js`. To run tests:

```bash
npm test -- api/auth/auth.test.js
```

Note: Integration tests require Vercel KV environment variables to be set:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `JWT_SECRET`

## Requirements Satisfied

- **Requirement 4.1**: Password hashing with bcrypt
- **Requirement 4.2**: JWT token generation and validation
- **Requirement 4.3**: Credential validation
- **Requirement 1.5**: CORS headers
