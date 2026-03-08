# Complete Deployment Guide - MongoDB + Vercel

This is the complete guide to deploy the Content Quality Reviewer application with MongoDB Atlas and Vercel.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: MongoDB Atlas Setup](#part-1-mongodb-atlas-setup)
3. [Part 2: Backend Deployment (Vercel)](#part-2-backend-deployment-vercel)
4. [Part 3: Frontend Setup](#part-3-frontend-setup)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Git** installed
- **Vercel account** (free tier works) - [Sign up](https://vercel.com/signup)
- **MongoDB Atlas account** (free tier works) - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- **OpenAI API key** - [Get one here](https://platform.openai.com/api-keys)
- **Terminal/Command Line** access

**Estimated Total Time: 20-25 minutes**

---

## Part 1: MongoDB Atlas Setup

### Step 1.1: Create MongoDB Atlas Cluster

1. **Log in to MongoDB Atlas**
   - Go to [https://cloud.mongodb.com/](https://cloud.mongodb.com/)
   - Sign in or create a new account

2. **Create a New Project** (if you don't have one)
   - Click "New Project"
   - Name it: `content-quality-reviewer`
   - Click "Create Project"

3. **Create a Cluster**
   - Click "Build a Database"
   - Select **M0 FREE** tier
   - Choose your preferred cloud provider and region (closest to your users)
   - Cluster Name: `content-quality-cluster` (or any name you prefer)
   - Click "Create Cluster"

**Wait 3-5 minutes for cluster creation**

### Step 1.2: Configure Database Access

1. **Create Database User**
   - In the left sidebar, click "Database Access"
   - Click "Add New Database User"
   - Authentication Method: **Password**
   - Username: `contentapp` (or your choice)
   - Password: Click "Autogenerate Secure Password" and **SAVE THIS PASSWORD**
   - Database User Privileges: **Read and write to any database**
   - Click "Add User"

### Step 1.3: Configure Network Access

1. **Allow Access from Anywhere** (for Vercel)
   - In the left sidebar, click "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Comment: `Vercel Serverless Functions`
   - Click "Confirm"

**Note:** This is required for Vercel serverless functions. For production, you can restrict to Vercel's IP ranges.

### Step 1.4: Get Connection String

1. **Get Your Connection String**
   - Go back to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Driver: **Node.js**
   - Version: **6.0 or later**
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
     ```

2. **Modify the Connection String**
   - Replace `<username>` with your database username (e.g., `contentapp`)
   - Replace `<password>` with the password you saved earlier
   - Add the database name after `.net/`: `/content_quality_reviewer`
   
   **Final format:**
   ```
   mongodb+srv://contentapp:YOUR_PASSWORD@cluster.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority
   ```

**SAVE THIS CONNECTION STRING** - You'll need it for Vercel environment variables.

---

## Part 2: Backend Deployment (Vercel)

### Step 2.1: Install Vercel CLI

```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

### Step 2.2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate (email verification).

### Step 2.3: Deploy Backend

1. **Navigate to your project root** (where `package.json` is)

2. **Deploy to Vercel:**
   ```bash
   vercel
   ```

3. **Answer the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `content-quality-reviewer` (or your choice)
   - In which directory is your code located? **./** (press Enter)
   - Want to override settings? **N**

4. **Wait for deployment** (1-2 minutes)

5. **Save the deployment URL** (looks like):
   ```
   https://content-quality-reviewer-abc123.vercel.app
   ```

### Step 2.4: Configure Environment Variables

You need to add environment variables to Vercel:

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project (`content-quality-reviewer`)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | Your MongoDB connection string from Step 1.4 | Production, Preview, Development |
| `OPENAI_API_KEY` | Your OpenAI API key | Production, Preview, Development |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` | Production, Preview, Development |
| `MAX_CONTENT_LENGTH` | `2000` | Production, Preview, Development |
| `RATE_LIMIT_WINDOW` | `60` | Production, Preview, Development |
| `RATE_LIMIT_MAX` | `10` | Production, Preview, Development |
| `OPENAI_MODEL` | `gpt-4-turbo-preview` | Production, Preview, Development |
| `OPENAI_MAX_TOKENS` | `2000` | Production, Preview, Development |
| `OPENAI_TEMPERATURE` | `0.3` | Production, Preview, Development |

**Option B: Via Vercel CLI**

```bash
# Set MongoDB URI
vercel env add MONGODB_URI

# When prompted:
# - Value: Paste your MongoDB connection string
# - Environment: Select all (Production, Preview, Development)

# Repeat for each variable above
vercel env add OPENAI_API_KEY
vercel env add JWT_SECRET
# ... etc
```

### Step 2.5: Redeploy with Environment Variables

After adding environment variables, redeploy:

```bash
vercel --prod
```

**Save the production URL** (looks like):
```
https://content-quality-reviewer.vercel.app
```

---

## Part 3: Frontend Setup

### Step 3.1: Navigate to Frontend Directory

```bash
cd kiro/specs/content-quality-reviewer/frontend
```

### Step 3.2: Install Dependencies

```bash
npm install
```

### Step 3.3: Configure Frontend Environment

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```bash
   # Windows
   notepad .env
   
   # Mac/Linux
   nano .env
   ```

3. **Set the API endpoint:**
   ```env
   VITE_API_ENDPOINT=https://your-backend-url.vercel.app
   ```
   
   Replace `your-backend-url.vercel.app` with your actual Vercel backend URL from Step 2.5.

### Step 3.4: Run Frontend Locally

```bash
npm run dev
```

The frontend will start at: `http://localhost:5173`

**Open in browser:** [http://localhost:5173](http://localhost:5173)

### Step 3.5: Deploy Frontend to Vercel (Optional)

If you want to deploy the frontend to Vercel:

1. **From the frontend directory:**
   ```bash
   vercel
   ```

2. **Answer the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `content-quality-reviewer-frontend`
   - In which directory is your code located? **./** (press Enter)
   - Want to override settings? **N**

3. **Add environment variable:**
   ```bash
   vercel env add VITE_API_ENDPOINT
   # Value: Your backend URL from Step 2.5
   # Environment: Production, Preview, Development
   ```

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

---

## Testing & Verification

### Test 1: Backend Health Check

Test the signup endpoint:

```bash
curl -X POST https://your-backend-url.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com"
  }
}
```

### Test 2: Login

```bash
curl -X POST https://your-backend-url.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com"
  }
}
```

### Test 3: Content Analysis

```bash
curl -X POST https://your-backend-url.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_FROM_LOGIN" \
  -d '{
    "content": "This is a test blog post about AI and technology.",
    "targetPlatform": "blog",
    "contentIntent": "informative"
  }'
```

**Expected Response:**
```json
{
  "analysisId": "uuid-here",
  "overallScore": 85,
  "dimensionScores": {
    "clarity": 90,
    "engagement": 80,
    ...
  },
  "suggestions": ["..."],
  ...
}
```

### Test 4: Frontend Testing

1. **Open frontend** in browser
2. **Sign up** with a new account
3. **Analyze content** - paste some text and click analyze
4. **View results** - should see scores and suggestions
5. **Check history** - should see your analysis in history

---

## Troubleshooting

### MongoDB Connection Issues

**Error: "MONGODB_URI environment variable is not set"**
- Solution: Add MONGODB_URI to Vercel environment variables and redeploy

**Error: "Failed to connect to MongoDB"**
- Check your connection string format
- Verify username and password are correct
- Ensure Network Access allows 0.0.0.0/0
- Check MongoDB Atlas cluster is running

**Error: "Authentication failed"**
- Verify database user credentials
- Check password doesn't contain special characters that need URL encoding
- Try recreating the database user

### Backend Issues

**Error: "OpenAI API key not configured"**
- Add OPENAI_API_KEY to Vercel environment variables
- Redeploy with `vercel --prod`

**Error: "Invalid JWT token"**
- Ensure JWT_SECRET is set in environment variables
- Try logging in again to get a fresh token

**Error: 500 Internal Server Error**
- Check Vercel function logs: `vercel logs`
- Or in Vercel Dashboard → Project → Deployments → Click deployment → Functions tab

### Frontend Issues

**Error: "Network Error" or "Failed to fetch"**
- Check VITE_API_ENDPOINT in `.env` is correct
- Verify backend URL is accessible
- Check browser console for CORS errors

**Error: "Unauthorized"**
- Token expired - log in again
- JWT_SECRET mismatch - check backend environment variables

**Frontend not loading**
- Clear browser cache
- Check browser console for errors
- Verify `npm run dev` is running without errors

### Database Issues

**Collections not created**
- Collections are created automatically on first insert
- Check MongoDB Atlas → Database → Browse Collections

**TTL index not working**
- TTL indexes run every 60 seconds
- Check indexes: MongoDB Atlas → Database → Browse Collections → analyses → Indexes
- Should see `createdAt_ttl` index with `expireAfterSeconds: 2592000`

---

## Monitoring & Maintenance

### MongoDB Atlas Monitoring

1. **Go to MongoDB Atlas Dashboard**
2. **Click on your cluster**
3. **Metrics tab** shows:
   - Operations per second
   - Connections
   - Network traffic
   - Storage usage

### Vercel Monitoring

1. **Go to Vercel Dashboard**
2. **Click on your project**
3. **Analytics tab** shows:
   - Request count
   - Response times
   - Error rates
   - Bandwidth usage

### View Logs

**Vercel Logs (CLI):**
```bash
vercel logs
```

**Vercel Logs (Dashboard):**
1. Go to project → Deployments
2. Click on a deployment
3. Click Functions tab
4. Click on a function to see logs

### Database Maintenance

**Check Database Size:**
- MongoDB Atlas → Database → Cluster → Metrics
- Free tier: 512 MB storage

**Monitor Collections:**
```javascript
// In MongoDB Atlas → Database → Browse Collections
// Check document counts:
// - users: Number of registered users
// - analyses: Number of analyses (auto-deleted after 30 days)
```

### Cost Monitoring

**MongoDB Atlas (Free Tier):**
- 512 MB storage
- Shared RAM
- Shared vCPU
- No credit card required

**Vercel (Hobby Plan - Free):**
- 100 GB bandwidth/month
- 100 GB-hours function execution/month
- Unlimited deployments

**OpenAI API:**
- Pay per token usage
- Monitor at: [https://platform.openai.com/usage](https://platform.openai.com/usage)
- Set usage limits in OpenAI dashboard

---

## Useful Commands

### Vercel Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

### MongoDB Commands

**Connect via MongoDB Shell:**
```bash
mongosh "mongodb+srv://cluster.mongodb.net/content_quality_reviewer" --username contentapp
```

**Check Collections:**
```javascript
show collections
db.users.countDocuments()
db.analyses.countDocuments()
```

**Check Indexes:**
```javascript
db.users.getIndexes()
db.analyses.getIndexes()
```

---

## Environment Variables Reference

### Backend (.env or Vercel Environment Variables)

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/content_quality_reviewer?retryWrites=true&w=majority

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.3

# JWT Configuration
JWT_SECRET=your-secure-random-string-here

# Application Configuration
MAX_CONTENT_LENGTH=2000

# Rate Limiting Configuration
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=10
```

### Frontend (.env)

```env
# API Endpoint
VITE_API_ENDPOINT=https://your-backend-url.vercel.app
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│              (React + Vite + Tailwind CSS)                  │
│                  localhost:5173 or Vercel                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS API Calls
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Backend (Vercel)                          │
│              Serverless Functions (Node.js)                  │
│  /api/auth/signup, /api/auth/login, /api/analyze, etc.     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│  MongoDB      │         │   OpenAI     │
│   Atlas       │         │     API      │
│               │         │              │
│ - users       │         │ GPT-4 Turbo  │
│ - analyses    │         │              │
└───────────────┘         └──────────────┘
```

---

## Next Steps

1. ✅ MongoDB Atlas cluster created and configured
2. ✅ Backend deployed to Vercel with environment variables
3. ✅ Frontend running locally or deployed to Vercel
4. ✅ All endpoints tested and working

**You're all set!** 🎉

### Optional Enhancements

- Set up custom domain in Vercel
- Configure MongoDB Atlas alerts
- Set up monitoring with Vercel Analytics
- Add more content analysis features
- Implement user profile management

---

## Support

**Issues?**
- Check the [Troubleshooting](#troubleshooting) section
- Review Vercel function logs
- Check MongoDB Atlas metrics
- Verify all environment variables are set correctly

**Need Help?**
- Vercel Documentation: [https://vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas Documentation: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- OpenAI API Documentation: [https://platform.openai.com/docs](https://platform.openai.com/docs)

---

**Last Updated:** March 2026
**Version:** 2.0 (MongoDB Migration)
