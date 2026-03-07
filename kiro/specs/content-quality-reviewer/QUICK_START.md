# Quick Start Guide

## Get Your Frontend Running in 5 Minutes

### Step 1: Install Dependencies
```bash
cd .kiro/specs/content-quality-reviewer/frontend
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your AWS values from CDK deployment
```

Your `.env` should look like:
```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_abc123xyz
VITE_USER_POOL_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
VITE_API_ENDPOINT=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

### Step 3: Run the App
```bash
npm run dev
```

Open http://localhost:5173

### Step 4: Create a Test User

**Option A: Sign up through the app**
1. Click "Sign up"
2. Fill in your details
3. Check email for confirmation code
4. Enter code and you're in!

**Option B: Create via AWS CLI**
```bash
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com \
  --temporary-password Test123! \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id YOUR_USER_POOL_ID \
  --username test@example.com \
  --password Test123! \
  --permanent
```

### Step 5: Test It Out
1. Log in with your credentials
2. Paste some content in the editor
3. Select platform and intent
4. Click "Analyze Content"
5. View your AI-powered results!

## What's Integrated

✅ Amazon Cognito authentication
✅ Real-time content analysis with Bedrock
✅ Results dashboard with AI insights
✅ Analysis history tracking
✅ Secure API communication

## Need Help?

- **Setup issues?** Check `frontend/SETUP.md`
- **Integration details?** See `FRONTEND_INTEGRATION_SUMMARY.md`
- **Backend not working?** Verify CDK deployment with `cdk deploy`

## Common Issues

**"Failed to analyze"** → Check your `.env` file has correct API endpoint

**"User not authenticated"** → Sign out and sign in again

**CORS errors** → Verify API Gateway CORS settings in CDK stack

## What's Next?

The frontend is ready! To complete the full integration:

1. Backend needs to implement GET /history endpoint
2. Backend needs to implement GET /analysis/{id} endpoint

These are placeholders in the CDK stack and need Lambda functions.
