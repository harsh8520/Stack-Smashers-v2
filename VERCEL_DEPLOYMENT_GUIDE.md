# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```

## Step 1: Install Vercel KV Storage

1. Go to your Vercel dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **KV (Redis)**
5. Choose a name (e.g., `content-quality-kv`)
6. Select a region close to your users
7. Click **Create**

The KV credentials (`KV_REST_API_URL` and `KV_REST_API_TOKEN`) will be automatically added to your project's environment variables.

## Step 2: Set Up Environment Variables

In your Vercel project settings, add these environment variables:

### Required Variables

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# JWT Configuration (generate a secure random string)
JWT_SECRET=your-super-secure-random-string-here

# Application Configuration
MAX_CONTENT_LENGTH=2000
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=10
```

### How to Generate JWT_SECRET

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Or use an online generator: https://www.grc.com/passwords.htm

### Setting Environment Variables in Vercel

**Via Dashboard:**
1. Go to your project in Vercel dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable with its value
4. Select environments: Production, Preview, Development
5. Click **Save**

**Via CLI:**
```bash
vercel env add OPENAI_API_KEY
vercel env add JWT_SECRET
vercel env add MAX_CONTENT_LENGTH
vercel env add RATE_LIMIT_WINDOW
vercel env add RATE_LIMIT_MAX
```

## Step 3: Link Vercel KV to Your Project

1. In Vercel dashboard, go to your project
2. Navigate to **Storage** tab
3. Click **Connect Store**
4. Select your KV database
5. Click **Connect**

This automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your environment variables.

## Step 4: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to Vercel dashboard
3. Click **Add New** → **Project**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty (no build needed for API-only)
   - **Output Directory**: Leave empty
6. Click **Deploy**

### Option B: Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option C: Deploy via Git Integration

```bash
# Push to main branch for production
git push origin main

# Push to other branches for preview deployments
git push origin feature-branch
```

## Step 5: Verify Deployment

After deployment, you'll get a URL like: `https://your-project.vercel.app`

### Test the API Endpoints

1. **Test Signup:**
```bash
curl -X POST https://your-project.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

2. **Test Login:**
```bash
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

3. **Test Analysis (use token from login):**
```bash
curl -X POST https://your-project.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "content": "This is a test blog post about technology.",
    "targetPlatform": "blog",
    "contentIntent": "inform"
  }'
```

## Step 6: Monitor Your Deployment

### View Logs
1. Go to Vercel dashboard → Your Project
2. Click **Deployments**
3. Click on a deployment
4. View **Function Logs** tab

### Monitor Performance
1. Go to **Analytics** tab
2. View function execution times
3. Monitor error rates

### Check KV Usage
1. Go to **Storage** tab
2. Click on your KV database
3. View usage metrics

## Step 7: Update Frontend Configuration

Update your frontend's API endpoint to point to your Vercel deployment:

```javascript
// In your frontend .env file
VITE_API_ENDPOINT=https://your-project.vercel.app
```

## Troubleshooting

### Issue: "Module not found" errors

**Solution:** Ensure all dependencies are in `package.json`:
```bash
npm install --save @vercel/kv openai bcryptjs jsonwebtoken uuid sentiment
```

### Issue: "Environment variable not set" errors

**Solution:** 
1. Check environment variables in Vercel dashboard
2. Redeploy after adding variables
3. Ensure variables are set for the correct environment (Production/Preview)

### Issue: CORS errors

**Solution:** The `vercel.json` already includes CORS headers. If issues persist:
1. Check that `vercel.json` is in the root directory
2. Verify CORS headers in API responses
3. Clear browser cache

### Issue: Rate limit or KV connection errors

**Solution:**
1. Verify KV database is connected to your project
2. Check KV credentials in environment variables
3. Ensure you're not exceeding KV limits (check Storage tab)

### Issue: OpenAI API errors

**Solution:**
1. Verify `OPENAI_API_KEY` is set correctly
2. Check OpenAI API key has sufficient credits
3. Verify API key permissions

## Production Checklist

Before going to production:

- [ ] All environment variables are set
- [ ] Vercel KV is connected and working
- [ ] JWT_SECRET is a strong, random string
- [ ] OpenAI API key is valid and has credits
- [ ] All API endpoints tested and working
- [ ] Frontend is updated with production API URL
- [ ] Error logging is working (check Function Logs)
- [ ] Rate limiting is configured appropriately
- [ ] CORS is configured correctly
- [ ] SSL/HTTPS is enabled (automatic with Vercel)

## Scaling Considerations

### Vercel KV Limits
- **Hobby Plan**: 256 MB storage, 10K commands/day
- **Pro Plan**: 512 MB storage, 100K commands/day
- **Enterprise**: Custom limits

### Function Limits
- **Hobby Plan**: 10s timeout, 1024 MB memory
- **Pro Plan**: 60s timeout, 3008 MB memory
- **Enterprise**: Custom limits

### OpenAI Rate Limits
- Monitor your OpenAI usage dashboard
- Implement caching if needed
- Consider using GPT-3.5-turbo for cost savings

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update frontend API endpoint to use custom domain

## Rollback Plan

If something goes wrong:

1. **Via Dashboard:**
   - Go to **Deployments**
   - Find a previous working deployment
   - Click **⋯** → **Promote to Production**

2. **Via CLI:**
   ```bash
   vercel rollback
   ```

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel KV Docs**: https://vercel.com/docs/storage/vercel-kv
- **OpenAI API Docs**: https://platform.openai.com/docs

## Next Steps

After successful deployment:
1. Update frontend to use new API endpoints
2. Test authentication flow end-to-end
3. Test content analysis flow end-to-end
4. Monitor logs and performance
5. Set up alerts for errors (Vercel Integrations)
