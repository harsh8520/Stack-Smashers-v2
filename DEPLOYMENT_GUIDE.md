# Complete Deployment Guide

This is the **ONLY** guide you need to deploy the Content Quality Reviewer application from start to finish.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Prepare Your Project](#step-1-prepare-your-project)
3. [Step 2: Deploy Backend to Vercel](#step-2-deploy-backend-to-vercel)
4. [Step 3: Set Up Vercel KV Database](#step-3-set-up-vercel-kv-database)
5. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
6. [Step 5: Test Backend Deployment](#step-5-test-backend-deployment)
7. [Step 6: Configure Frontend](#step-6-configure-frontend)
8. [Step 7: Run Frontend Locally](#step-7-run-frontend-locally)
9. [Step 8: Test Complete Application](#step-8-test-complete-application)
10. [Troubleshooting](#troubleshooting)
11. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before you start, make sure you have:

### Required Accounts
- ✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier works)
- ✅ **OpenAI Account** - Get API key at [platform.openai.com](https://platform.openai.com)

### Required Software
- ✅ **Node.js 18+** - Check with: `node --version`
- ✅ **npm** - Comes with Node.js
- ✅ **Git** - For version control

### Install Vercel CLI (Optional but Recommended)
```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

---

## Step 1: Prepare Your Project

### 1.1 Navigate to Project Directory

```bash
cd E:\AWS
```

### 1.2 Install Dependencies

```bash
npm install
```

You should see output like:
```
audited 350 packages in 5s
found 0 vulnerabilities
```

### 1.3 Verify Project Structure

Make sure you have these directories:
```
E:\AWS\
├── api/                    # Backend API endpoints
├── lib/                    # Shared libraries
├── .kiro/specs/content-quality-reviewer/frontend/  # Frontend
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

---

## Step 2: Deploy Backend to Vercel

### 2.1 Login to Vercel

```bash
vercel login
```

This will open your browser. Choose your login method (GitHub, GitLab, Bitbucket, or Email).

### 2.2 Deploy to Production

```bash
vercel --prod
```

**What happens:**
1. Vercel CLI will ask questions:
   - **Set up and deploy?** → Press Enter (Yes)
   - **Which scope?** → Select your account
   - **Link to existing project?** → N (No, create new)
   - **Project name?** → Press Enter (use default) or type a name
   - **Directory?** → Press Enter (use current directory)
   - **Override settings?** → N (No)

2. Vercel will:
   - Upload your code
   - Build your project
   - Deploy to production
   - Give you a URL like: `https://your-project.vercel.app`

**Save this URL!** You'll need it later.

### 2.3 Verify Deployment

Open the URL in your browser. You should see a 404 or blank page (this is normal - the API endpoints don't have a homepage).

---

## Step 3: Set Up Vercel KV Database

### 3.1 Go to Vercel Dashboard

1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project

### 3.2 Create KV Database

1. Click **Storage** tab (left sidebar)
2. Click **Create Database**
3. Select **KV** (Redis)
4. Enter database name: `content-quality-kv`
5. Select region: Choose closest to your users (e.g., `us-east-1`)
6. Click **Create**

### 3.3 Connect Database to Project

1. After creation, you'll see your KV database
2. Click **Connect Project**
3. Select your project from the dropdown
4. Click **Connect**

**Important:** This automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your environment variables.

---

## Step 4: Configure Environment Variables

### 4.1 Generate JWT Secret

Open terminal and run:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output (it will look like: `a1b2c3d4e5f6...`)

### 4.2 Get OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Name it: `content-quality-reviewer`
4. Copy the key (starts with `sk-`)

**Important:** Save this key somewhere safe - you can't see it again!

### 4.3 Add Environment Variables to Vercel

1. In Vercel Dashboard → Your Project
2. Click **Settings** tab
3. Click **Environment Variables** (left sidebar)
4. Add each variable:

**Variable 1: OPENAI_API_KEY**
- Key: `OPENAI_API_KEY`
- Value: `sk-your-openai-key-here` (paste your OpenAI key)
- Environments: Check all (Production, Preview, Development)
- Click **Save**

**Variable 2: JWT_SECRET**
- Key: `JWT_SECRET`
- Value: (paste the random string you generated)
- Environments: Check all
- Click **Save**

**Variable 3: MAX_CONTENT_LENGTH**
- Key: `MAX_CONTENT_LENGTH`
- Value: `2000`
- Environments: Check all
- Click **Save**

**Variable 4: RATE_LIMIT_WINDOW**
- Key: `RATE_LIMIT_WINDOW`
- Value: `60`
- Environments: Check all
- Click **Save**

**Variable 5: RATE_LIMIT_MAX**
- Key: `RATE_LIMIT_MAX`
- Value: `10`
- Environments: Check all
- Click **Save**

### 4.4 Redeploy to Apply Variables

After adding all variables, redeploy:

```bash
vercel --prod
```

Or in Vercel Dashboard:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**

---

## Step 5: Test Backend Deployment

### 5.1 Test Signup Endpoint

Replace `your-project.vercel.app` with your actual URL:

```bash
curl -X POST https://your-project.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "some-uuid",
    "email": "test@example.com"
  }
}
```

**Save the token!** You'll need it for the next test.

### 5.2 Test Login Endpoint

```bash
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123\"}"
```

**Expected Response:** Same as signup (token + user)

### 5.3 Test Analyze Endpoint

Replace `YOUR_TOKEN` with the token from signup/login:

```bash
curl -X POST https://your-project.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"content\":\"This is a test blog post about technology and innovation.\",\"targetPlatform\":\"blog\",\"contentIntent\":\"inform\"}"
```

**Expected Response:**
```json
{
  "analysisId": "some-uuid",
  "userId": "user-uuid",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "overallScore": 75,
  "dimensionScores": { ... },
  "suggestions": [ ... ]
}
```

**If all three tests pass, your backend is working! ✅**

---

## Step 6: Configure Frontend

### 6.1 Navigate to Frontend Directory

```bash
cd .kiro/specs/content-quality-reviewer/frontend
```

### 6.2 Update Environment Variables

Edit the `.env` file:

```bash
# Open in your editor (VS Code, Notepad, etc.)
code .env
# or
notepad .env
```

Replace the content with:

```bash
VITE_API_ENDPOINT=https://your-project.vercel.app
```

**Important:** Replace `your-project.vercel.app` with your actual Vercel URL (no trailing slash).

### 6.3 Install Frontend Dependencies

```bash
npm install
```

---

## Step 7: Run Frontend Locally

### 7.1 Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 7.2 Open in Browser

Open your browser and go to: `http://localhost:5173`

You should see the Content Quality Reviewer landing page.

---

## Step 8: Test Complete Application

### 8.1 Test Sign Up

1. Click **Sign Up** button
2. Enter email: `yourname@example.com`
3. Enter password: `password123`
4. Click **Create Account**

**Expected:** You should be redirected to the dashboard.

### 8.2 Test Content Analysis

1. In the dashboard, paste this content:
   ```
   Artificial intelligence is transforming how we work and live. 
   Machine learning algorithms can now process vast amounts of data 
   to provide insights that were previously impossible to obtain.
   ```

2. Select:
   - Platform: **Blog**
   - Intent: **Inform**

3. Click **Analyze Content**

**Expected:** 
- Processing screen appears
- After 5-10 seconds, you see results with:
  - Overall score
  - Dimension scores (Structure, Tone, Accessibility, Platform)
  - Suggestions for improvement

### 8.3 Test History

1. Click **History** in the navigation
2. You should see your previous analysis

### 8.4 Test Logout and Login

1. Click **Logout**
2. Click **Login**
3. Enter your credentials
4. You should be logged back in

**If all tests pass, your application is fully working! 🎉**

---

## Troubleshooting

### Backend Issues

#### Error: "Environment variable not set"

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all 5 variables are set
3. Redeploy: `vercel --prod`

#### Error: "KV connection error"

**Solution:**
1. Go to Vercel Dashboard → Storage
2. Verify KV database is connected to your project
3. If not, click **Connect Project** and select your project

#### Error: "OpenAI API error"

**Solution:**
1. Verify your OpenAI API key is correct
2. Check you have credits: [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
3. Try generating a new API key

#### Error: "Rate limit exceeded"

**Solution:**
- Wait 60 seconds and try again
- Or increase `RATE_LIMIT_MAX` in environment variables

### Frontend Issues

#### Error: "Failed to fetch" or "Network error"

**Solution:**
1. Check `VITE_API_ENDPOINT` in `.env` is correct
2. Verify backend is deployed and working (test with curl)
3. Check browser console for detailed error

#### Error: "No authentication token"

**Solution:**
- Log out and log back in
- Clear browser localStorage: Open DevTools → Application → Local Storage → Clear

#### Error: CORS errors

**Solution:**
1. Verify `vercel.json` exists in root directory
2. Check it has CORS headers configured
3. Redeploy backend

### Deployment Issues

#### Error: "Command not found: vercel"

**Solution:**
```bash
npm install -g vercel
```

#### Error: "No access to project"

**Solution:**
1. Run `vercel login` again
2. Make sure you're logged into the correct account

---

## Monitoring & Maintenance

### View Logs

**Vercel Dashboard:**
1. Go to your project
2. Click **Deployments**
3. Click on a deployment
4. Click **Functions** tab
5. Click on a function to see logs

**Or use CLI:**
```bash
vercel logs
```

### Monitor Usage

**Vercel KV:**
1. Dashboard → Storage → Your KV database
2. View commands/day and storage usage

**OpenAI:**
1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. Monitor API usage and costs

### Update Application

When you make code changes:

```bash
# From root directory
vercel --prod
```

Vercel will automatically:
1. Upload new code
2. Build
3. Deploy
4. Keep old version as backup

### Rollback

If something goes wrong:

**Via Dashboard:**
1. Deployments → Find previous working deployment
2. Click **⋯** → **Promote to Production**

**Via CLI:**
```bash
vercel rollback
```

---

## Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Vercel KV database connected
- [ ] Backend tests passing (signup, login, analyze)
- [ ] Frontend connects to backend
- [ ] Can sign up new users
- [ ] Can analyze content
- [ ] Can view history
- [ ] Logout/login works
- [ ] OpenAI API key has sufficient credits
- [ ] Rate limiting configured appropriately
- [ ] Monitoring set up (check logs regularly)

---

## Cost Estimates

**Vercel (Hobby Plan - Free):**
- 100 GB-hours of function execution
- 100 GB bandwidth
- Unlimited deployments

**Vercel KV (Hobby Plan - Free):**
- 256 MB storage
- 10,000 commands/day

**OpenAI API:**
- GPT-4 Turbo: ~$0.01 per 1K tokens
- Estimated: $30-50/month for 1,000 analyses

**Total: ~$30-50/month** (mostly OpenAI costs)

---

## Support

### Check Logs First
```bash
vercel logs
```

### Common Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View logs
vercel logs

# List deployments
vercel ls

# Rollback
vercel rollback

# Remove deployment
vercel rm <deployment-url>
```

### Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel KV Docs:** [vercel.com/docs/storage/vercel-kv](https://vercel.com/docs/storage/vercel-kv)
- **OpenAI Docs:** [platform.openai.com/docs](https://platform.openai.com/docs)

---

## Success! 🎉

Your Content Quality Reviewer is now deployed and running on Vercel!

**Your URLs:**
- Backend API: `https://your-project.vercel.app`
- Frontend (local): `http://localhost:5173`

**Next Steps:**
1. Share with users
2. Monitor usage and costs
3. Adjust rate limits as needed
4. Consider upgrading Vercel plan if you exceed free tier

---

**Need help?** Check the logs first, then review the troubleshooting section above.
