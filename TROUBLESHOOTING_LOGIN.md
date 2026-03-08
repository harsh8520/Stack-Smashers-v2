# Login/Signup Troubleshooting Guide

## Quick Diagnosis

The login/signup is not working. Here are the most common causes and solutions:

---

## Issue 1: MongoDB URI Not Configured (Most Likely)

### Problem
The `MONGODB_URI` environment variable is not set or is using the placeholder value.

### Check
Look at your `.env.development.local` file. If you see:
```env
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority"
```

This is a **placeholder** and won't work!

### Solution

#### For Local Development:

1. **Set up MongoDB Atlas** (if you haven't):
   - Go to [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
   - Create a free cluster (M0)
   - Create a database user
   - Get your connection string

2. **Update `.env.development.local`**:
   ```env
   MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority"
   ```
   
   Replace:
   - `YOUR_USERNAME` - Your MongoDB database username
   - `YOUR_PASSWORD` - Your MongoDB database password
   - `YOUR_CLUSTER` - Your MongoDB cluster address

3. **Restart your backend**:
   ```bash
   # Stop the current process (Ctrl+C)
   # Start again
   vercel dev
   ```

#### For Vercel Deployment:

1. **Go to Vercel Dashboard**:
   - [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project

2. **Add Environment Variable**:
   - Settings → Environment Variables
   - Add `MONGODB_URI` with your actual connection string
   - Select all environments (Production, Preview, Development)

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

---

## Issue 2: MongoDB Atlas Network Access

### Problem
MongoDB Atlas is blocking connections from Vercel or your local machine.

### Solution

1. **Go to MongoDB Atlas**:
   - [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
   - Select your project and cluster

2. **Configure Network Access**:
   - Left sidebar → Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Comment: "Vercel Serverless Functions"
   - Click "Confirm"

**Note:** This is required for Vercel serverless functions.

---

## Issue 3: MongoDB Database User Not Created

### Problem
Database user doesn't exist or has wrong permissions.

### Solution

1. **Go to MongoDB Atlas**:
   - Left sidebar → Database Access

2. **Create Database User** (if not exists):
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: `contentapp` (or your choice)
   - Password: Click "Autogenerate Secure Password" and **SAVE IT**
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

3. **Update your connection string** with the correct username and password

---

## Issue 4: Frontend Not Connecting to Backend

### Problem
Frontend is trying to connect to wrong backend URL.

### Check
Look at `kiro/specs/content-quality-reviewer/frontend/.env`:
```env
VITE_API_ENDPOINT=https://content-lens-ai.vercel.app
```

### Solution

1. **Verify backend URL is correct**:
   - Should match your Vercel deployment URL
   - No trailing slash

2. **Update if needed**:
   ```env
   VITE_API_ENDPOINT=https://your-actual-backend.vercel.app
   ```

3. **Restart frontend**:
   ```bash
   # Stop the current process (Ctrl+C)
   npm run dev
   ```

---

## Issue 5: CORS Errors

### Problem
Browser console shows CORS errors.

### Check Browser Console
Press F12 → Console tab. Look for errors like:
```
Access to fetch at 'https://...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

### Solution

The auth endpoints already have CORS headers. If you still see CORS errors:

1. **Check `vercel.json`** has CORS configuration:
   ```json
   {
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           { "key": "Access-Control-Allow-Origin", "value": "*" },
           { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
           { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
         ]
       }
     ]
   }
   ```

2. **Redeploy backend**:
   ```bash
   vercel --prod
   ```

---

## Issue 6: JWT_SECRET Not Set

### Problem
JWT token generation fails.

### Check Error
Look for error in Vercel logs or browser console:
```
JWT_SECRET is not configured
```

### Solution

#### For Local Development:
Already set in `.env.development.local`:
```env
JWT_SECRET="2096b33ced1a433685db802725afe0d703d2016eaa55620a9ebc51956c11dd3e9b9bfeab94e090575956012120ceae4b89650bc0afe62608002486d3bc05af99"
```

#### For Vercel:
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add `JWT_SECRET` with a secure random string
3. Generate one with: `openssl rand -base64 32`
4. Redeploy

---

## Debugging Steps

### Step 1: Check Backend Logs

#### Local Development:
Look at terminal where `vercel dev` is running. You should see:
```
Signup error: Error: MONGODB_URI environment variable is not set
```
or
```
Failed to connect to MongoDB: ...
```

#### Vercel Deployment:
```bash
vercel logs
```

Or in Vercel Dashboard:
1. Go to your project
2. Deployments tab
3. Click on latest deployment
4. Functions tab
5. Click on `/api/auth/signup` or `/api/auth/login`
6. View logs

### Step 2: Test Backend Directly

Test signup endpoint with curl:

```bash
curl -X POST https://your-backend.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Expected Success Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com"
  }
}
```

**Common Error Responses:**

**MongoDB not configured:**
```json
{
  "error": "Signup failed"
}
```
Check backend logs for: "MONGODB_URI environment variable is not set"

**MongoDB connection failed:**
```json
{
  "error": "Signup failed"
}
```
Check backend logs for: "Failed to connect to MongoDB"

**User already exists:**
```json
{
  "error": "User already exists"
}
```
Try a different email address.

### Step 3: Check Browser Console

1. Open browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Try to sign up
5. Look for errors

**Common errors:**

**Network Error:**
```
POST https://your-backend.vercel.app/api/auth/signup net::ERR_CONNECTION_REFUSED
```
→ Backend is not running or URL is wrong

**500 Internal Server Error:**
```
POST https://your-backend.vercel.app/api/auth/signup 500 (Internal Server Error)
```
→ Check backend logs for MongoDB connection issues

**CORS Error:**
```
Access to fetch at '...' has been blocked by CORS policy
```
→ Check CORS configuration in vercel.json

### Step 4: Check Network Tab

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to sign up
4. Click on the `/api/auth/signup` request
5. Check:
   - Request URL (should match your backend)
   - Request Headers (Content-Type: application/json)
   - Request Payload (email and password)
   - Response (error message)

---

## Quick Fix Checklist

Run through this checklist:

- [ ] MongoDB Atlas cluster is created and running
- [ ] MongoDB database user is created with read/write permissions
- [ ] MongoDB Network Access allows 0.0.0.0/0
- [ ] `MONGODB_URI` is set with actual connection string (not placeholder)
- [ ] `JWT_SECRET` is set
- [ ] Backend is deployed/running
- [ ] Frontend `VITE_API_ENDPOINT` points to correct backend URL
- [ ] Backend logs show no errors
- [ ] Browser console shows no errors

---

## Still Not Working?

### Get More Information

1. **Backend logs** (most important):
   ```bash
   vercel logs
   ```

2. **Test backend directly** with curl (see Step 2 above)

3. **Check MongoDB Atlas**:
   - Is cluster running?
   - Can you connect with MongoDB Compass?

4. **Check environment variables**:
   ```bash
   # Local
   cat .env.development.local
   
   # Vercel
   vercel env ls
   ```

### Common Solutions

**"MONGODB_URI environment variable is not set"**
→ Set MONGODB_URI in environment variables

**"Failed to connect to MongoDB"**
→ Check MongoDB Atlas Network Access and connection string

**"Authentication failed"**
→ Check MongoDB database user credentials

**"User already exists"**
→ Try a different email or check MongoDB Atlas → Database → Browse Collections

**Frontend shows "Network Error"**
→ Check VITE_API_ENDPOINT in frontend/.env

---

## Need More Help?

1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete setup instructions
2. Review MongoDB Atlas setup in Part 1 of deployment guide
3. Check Vercel function logs for specific error messages
4. Verify all environment variables are set correctly

---

## Example: Complete Working Setup

### MongoDB Atlas
- Cluster: M0 Free tier
- Database: `content_quality_reviewer`
- User: `contentapp` with password
- Network Access: 0.0.0.0/0 allowed

### Backend (.env.development.local or Vercel Environment Variables)
```env
MONGODB_URI=mongodb+srv://contentapp:MySecurePass123@cluster0.abc123.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=2096b33ced1a433685db802725afe0d703d2016eaa55620a9ebc51956c11dd3e
MAX_CONTENT_LENGTH=2000
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=10
```

### Frontend (.env)
```env
VITE_API_ENDPOINT=https://content-lens-ai.vercel.app
```

### Test
```bash
# Backend
curl -X POST https://content-lens-ai.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Should return:
# {"token":"eyJ...","user":{"id":"...","email":"test@example.com"}}
```

---

**Last Updated:** March 2026
