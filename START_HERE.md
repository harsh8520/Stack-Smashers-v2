# 🚀 Start Here - Content Quality Reviewer

Welcome! This guide will help you deploy the Content Quality Reviewer application to Vercel.

## 📋 What You'll Deploy

A serverless AI-powered content analysis system with:
- **Backend**: Vercel Serverless Functions + OpenAI API
- **Database**: Vercel KV (Redis)
- **Authentication**: JWT-based auth
- **Frontend**: React app

## ⏱️ Time Required

- **First-time setup**: 15-30 minutes
- **Subsequent deployments**: 2-5 minutes

## 🎯 Choose Your Path

### Path 1: Quick Deploy (Recommended)
**Best for**: Getting started quickly

1. Deploy to Vercel
2. Set up Vercel KV database
3. Configure environment variables
4. Test the deployment

**Time**: ~15 minutes

See: [QUICK_DEPLOYMENT_REFERENCE.md](./QUICK_DEPLOYMENT_REFERENCE.md)

### Path 2: Complete Setup
**Best for**: Understanding the full setup

1. Prerequisites installation
2. Local development setup
3. Vercel deployment
4. Frontend configuration
5. Testing and monitoring

**Time**: ~30 minutes

See: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

## ✅ Prerequisites

Check you have these installed:

```bash
node --version    # Need v18+
vercel --version  # Install with: npm install -g vercel
```

You'll also need:
- Vercel account (free tier works)
- OpenAI API key

## 🚀 Quick Start

### Step 1: Deploy Backend

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Step 2: Set Up Vercel KV

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Create Database** → **KV**
3. Name it `content-quality-kv`
4. Connect it to your project

### Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**:

```bash
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=<generate-random-string>
MAX_CONTENT_LENGTH=2000
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=10
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Test Your Deployment

```bash
# Test signup
curl -X POST https://your-project.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test login
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 📚 Documentation

- **[QUICK_DEPLOYMENT_REFERENCE.md](./QUICK_DEPLOYMENT_REFERENCE.md)** - Quick reference guide
- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Complete deployment walkthrough
- **[FRONTEND_SETUP_GUIDE.md](./FRONTEND_SETUP_GUIDE.md)** - Frontend configuration
- **[MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)** - Migration summary

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Environment variable not set" | Add missing env vars in Vercel dashboard |
| "KV connection error" | Ensure KV database is connected to project |
| "OpenAI API error" | Check API key and credits |
| CORS errors | Verify `vercel.json` has CORS headers |

## 📞 Need Help?

1. **Check Logs**: Vercel Dashboard → Functions → Logs
2. **Review Docs**: See documentation links above
3. **Troubleshooting**: Check [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

## 📁 Project Structure

```
content-quality-reviewer/
├── api/                    # Vercel serverless functions
│   ├── analyze.js         # Main analysis endpoint
│   ├── history.js         # User history
│   ├── analysis/[id].js   # Get specific analysis
│   └── auth/              # Authentication endpoints
├── lib/                   # Shared libraries
│   ├── auth.js           # JWT authentication
│   ├── storage.js        # Vercel KV operations
│   ├── openai-client.js  # OpenAI integration
│   └── analyzers/        # Content analyzers
└── .kiro/specs/content-quality-reviewer/frontend/
    └── src/              # React frontend
```

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ Backend deploys without errors
2. ✅ Vercel KV database is connected
3. ✅ Environment variables are set
4. ✅ API endpoints respond correctly
5. ✅ Users can sign up and log in
6. ✅ Content analysis works

## 🚦 Next Steps

After successful deployment:
1. Update frontend `.env` with your Vercel URL
2. Test all features thoroughly
3. Monitor logs and metrics
4. Set up custom domain (optional)

---

**Ready to deploy?** Start with [QUICK_DEPLOYMENT_REFERENCE.md](./QUICK_DEPLOYMENT_REFERENCE.md)
