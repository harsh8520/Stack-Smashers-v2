# Postman API Testing Guide

Complete guide to test all Content Quality Reviewer APIs using Postman.

---

## Setup

### Base URL

**Local Development:**
```
http://localhost:3000
```

**Production (Vercel):**
```
https://content-lens-ai.vercel.app
```

Replace with your actual Vercel deployment URL.

---

## API Endpoints

### 1. Signup (Create New User)

**Endpoint:** `POST /api/auth/signup`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "testpass123"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZjNhNGI1Yy0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDk1NjQwMDAsImV4cCI6MTcwOTY1MDQwMH0.abc123xyz",
  "user": {
    "id": "9f3a4b5c-1234-5678-90ab-cdef12345678",
    "email": "test@example.com"
  }
}
```

**Error Responses:**

400 - Missing fields:
```json
{
  "error": "Email and password required"
}
```

400 - Invalid email:
```json
{
  "error": "Invalid email format"
}
```

400 - Password too short:
```json
{
  "error": "Password must be at least 6 characters"
}
```

409 - User exists:
```json
{
  "error": "User already exists"
}
```

500 - Server error:
```json
{
  "error": "Signup failed"
}
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3000/api/auth/signup` or `https://your-backend.vercel.app/api/auth/signup`
3. Headers → Add: `Content-Type: application/json`
4. Body → Select `raw` → Select `JSON`
5. Paste the JSON body above
6. Click `Send`
7. **Save the token** from response for next requests

---

### 2. Login (Existing User)

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "testpass123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZjNhNGI1Yy0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDk1NjQwMDAsImV4cCI6MTcwOTY1MDQwMH0.abc123xyz",
  "user": {
    "id": "9f3a4b5c-1234-5678-90ab-cdef12345678",
    "email": "test@example.com"
  }
}
```

**Error Responses:**

400 - Missing fields:
```json
{
  "error": "Email and password required"
}
```

401 - Invalid credentials:
```json
{
  "error": "Invalid credentials"
}
```

500 - Server error:
```json
{
  "error": "Login failed"
}
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3000/api/auth/login` or `https://your-backend.vercel.app/api/auth/login`
3. Headers → Add: `Content-Type: application/json`
4. Body → Select `raw` → Select `JSON`
5. Paste the JSON body above
6. Click `Send`
7. **Save the token** from response for next requests

---

### 3. Analyze Content

**Endpoint:** `POST /api/analyze`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (raw JSON):**
```json
{
  "content": "This is a sample blog post about artificial intelligence and machine learning. AI is transforming how we work and live. Machine learning algorithms can process vast amounts of data to find patterns and make predictions. This technology is being used in healthcare, finance, education, and many other fields.",
  "targetPlatform": "blog",
  "contentIntent": "informative"
}
```

**Success Response (200):**
```json
{
  "analysisId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "userId": "9f3a4b5c-1234-5678-90ab-cdef12345678",
  "timestamp": "2024-03-08T10:30:00.000Z",
  "content": "This is a sample blog post...",
  "targetPlatform": "blog",
  "contentIntent": "informative",
  "overallScore": 85,
  "dimensionScores": {
    "clarity": 90,
    "engagement": 85,
    "professionalism": 88,
    "accessibility": 82,
    "structure": 87,
    "tone": 86,
    "platformFit": 84,
    "readability": 89
  },
  "suggestions": [
    "Consider adding more specific examples to illustrate your points",
    "Break up longer paragraphs for better readability",
    "Add subheadings to improve content structure"
  ],
  "metadata": {
    "wordCount": 45,
    "sentenceCount": 4,
    "avgWordsPerSentence": 11.25
  }
}
```

**Error Responses:**

400 - Missing fields:
```json
{
  "error": "Content, targetPlatform, and contentIntent are required"
}
```

400 - Content too long:
```json
{
  "error": "Content exceeds maximum length of 2000 words"
}
```

401 - No token:
```json
{
  "error": "Authorization token required"
}
```

401 - Invalid token:
```json
{
  "error": "Invalid or expired token"
}
```

429 - Rate limit:
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

500 - Server error:
```json
{
  "error": "Analysis failed"
}
```

**Postman Setup:**
1. Method: `POST`
2. URL: `http://localhost:3000/api/analyze` or `https://your-backend.vercel.app/api/analyze`
3. Headers → Add:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_TOKEN_HERE` (replace with token from login/signup)
4. Body → Select `raw` → Select `JSON`
5. Paste the JSON body above
6. Click `Send`
7. **Save the analysisId** from response for next request

---

### 4. Get Analysis by ID

**Endpoint:** `GET /api/analysis/:id`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**URL Parameters:**
- `:id` - Replace with actual analysisId from previous analyze request

**Example URL:**
```
http://localhost:3000/api/analysis/a1b2c3d4-5678-90ab-cdef-1234567890ab
```

**Success Response (200):**
```json
{
  "analysisId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "userId": "9f3a4b5c-1234-5678-90ab-cdef12345678",
  "timestamp": "2024-03-08T10:30:00.000Z",
  "content": "This is a sample blog post...",
  "targetPlatform": "blog",
  "contentIntent": "informative",
  "overallScore": 85,
  "dimensionScores": {
    "clarity": 90,
    "engagement": 85,
    "professionalism": 88,
    "accessibility": 82,
    "structure": 87,
    "tone": 86,
    "platformFit": 84,
    "readability": 89
  },
  "suggestions": [
    "Consider adding more specific examples to illustrate your points",
    "Break up longer paragraphs for better readability",
    "Add subheadings to improve content structure"
  ],
  "metadata": {
    "wordCount": 45,
    "sentenceCount": 4,
    "avgWordsPerSentence": 11.25
  }
}
```

**Error Responses:**

401 - No token:
```json
{
  "error": "Authorization token required"
}
```

401 - Invalid token:
```json
{
  "error": "Invalid or expired token"
}
```

404 - Not found or not owned by user:
```json
{
  "error": "Analysis not found"
}
```

500 - Server error:
```json
{
  "error": "Failed to retrieve analysis"
}
```

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3000/api/analysis/YOUR_ANALYSIS_ID` (replace YOUR_ANALYSIS_ID)
3. Headers → Add: `Authorization: Bearer YOUR_TOKEN_HERE`
4. Click `Send`

---

### 5. Get User History

**Endpoint:** `GET /api/history`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters (optional):**
- `limit` - Number of results to return (default: 10)

**Example URLs:**
```
http://localhost:3000/api/history
http://localhost:3000/api/history?limit=5
http://localhost:3000/api/history?limit=20
```

**Success Response (200):**
```json
{
  "analyses": [
    {
      "analysisId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "userId": "9f3a4b5c-1234-5678-90ab-cdef12345678",
      "timestamp": "2024-03-08T10:30:00.000Z",
      "content": "This is a sample blog post...",
      "targetPlatform": "blog",
      "contentIntent": "informative",
      "overallScore": 85,
      "dimensionScores": {
        "clarity": 90,
        "engagement": 85,
        "professionalism": 88,
        "accessibility": 82,
        "structure": 87,
        "tone": 86,
        "platformFit": 84,
        "readability": 89
      },
      "suggestions": ["..."],
      "metadata": {}
    },
    {
      "analysisId": "b2c3d4e5-6789-01bc-def1-234567890abc",
      "userId": "9f3a4b5c-1234-5678-90ab-cdef12345678",
      "timestamp": "2024-03-08T09:15:00.000Z",
      "content": "Another blog post...",
      "targetPlatform": "linkedin",
      "contentIntent": "promotional",
      "overallScore": 78,
      "dimensionScores": {},
      "suggestions": ["..."],
      "metadata": {}
    }
  ],
  "total": 15,
  "hasMore": true
}
```

**Error Responses:**

401 - No token:
```json
{
  "error": "Authorization token required"
}
```

401 - Invalid token:
```json
{
  "error": "Invalid or expired token"
}
```

500 - Server error:
```json
{
  "error": "Failed to retrieve history"
}
```

**Postman Setup:**
1. Method: `GET`
2. URL: `http://localhost:3000/api/history` or with limit: `http://localhost:3000/api/history?limit=5`
3. Headers → Add: `Authorization: Bearer YOUR_TOKEN_HERE`
4. Click `Send`

---

## Complete Testing Flow

### Step 1: Signup
1. Create request: `POST /api/auth/signup`
2. Add body with email and password
3. Send request
4. Copy the `token` from response

### Step 2: Login (Optional - to test login)
1. Create request: `POST /api/auth/login`
2. Add body with same email and password
3. Send request
4. Copy the `token` from response

### Step 3: Analyze Content
1. Create request: `POST /api/analyze`
2. Add `Authorization: Bearer YOUR_TOKEN` header
3. Add body with content, targetPlatform, contentIntent
4. Send request
5. Copy the `analysisId` from response

### Step 4: Get Analysis by ID
1. Create request: `GET /api/analysis/:id`
2. Replace `:id` with the analysisId from Step 3
3. Add `Authorization: Bearer YOUR_TOKEN` header
4. Send request

### Step 5: Get User History
1. Create request: `GET /api/history`
2. Add `Authorization: Bearer YOUR_TOKEN` header
3. Send request
4. Should see all your analyses

---

## Postman Collection JSON

You can import this collection into Postman:

```json
{
  "info": {
    "name": "Content Quality Reviewer API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"testpass123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/signup",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "signup"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"testpass123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Analysis",
      "item": [
        {
          "name": "Analyze Content",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"content\": \"This is a sample blog post about artificial intelligence and machine learning. AI is transforming how we work and live.\",\n  \"targetPlatform\": \"blog\",\n  \"contentIntent\": \"informative\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/analyze",
              "host": ["{{baseUrl}}"],
              "path": ["api", "analyze"]
            }
          }
        },
        {
          "name": "Get Analysis by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/analysis/:id",
              "host": ["{{baseUrl}}"],
              "path": ["api", "analysis", ":id"],
              "variable": [
                {
                  "key": "id",
                  "value": "YOUR_ANALYSIS_ID"
                }
              ]
            }
          }
        },
        {
          "name": "Get User History",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/history?limit=10",
              "host": ["{{baseUrl}}"],
              "path": ["api", "history"],
              "query": [
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

**To Import:**
1. Open Postman
2. Click "Import" button
3. Select "Raw text"
4. Paste the JSON above
5. Click "Import"

**To Use:**
1. Update `baseUrl` variable with your backend URL
2. After signup/login, copy the token
3. Update `token` variable with your token
4. All requests will use these variables

---

## Platform Options

### targetPlatform
- `blog`
- `linkedin`
- `twitter`
- `medium`

### contentIntent
- `informative`
- `promotional`
- `educational`
- `entertaining`
- `persuasive`

---

## Tips

1. **Save Token**: After signup/login, save the token in Postman environment variable
2. **Use Variables**: Set `{{baseUrl}}` and `{{token}}` as collection variables
3. **Test Locally First**: Test with `http://localhost:3000` before testing production
4. **Check Response**: Always check the response status code and body
5. **Rate Limiting**: Default is 10 requests per 60 seconds per user

---

## Troubleshooting

**401 Unauthorized**
- Check token is correct
- Check Authorization header format: `Bearer YOUR_TOKEN`
- Token might be expired (24 hours)

**500 Internal Server Error**
- Check backend logs
- Verify MongoDB is connected
- Check all environment variables are set

**Network Error**
- Check backend is running
- Verify URL is correct
- Check firewall/antivirus

---

**Last Updated:** March 2026
