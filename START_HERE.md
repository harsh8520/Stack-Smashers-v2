# 🚀 Content Quality Reviewer - Quick Start

Welcome! This guide will get you up and running in ~20 minutes.

---

## What This Application Does

AI-powered content analysis system that helps creators improve their content quality across multiple dimensions:
- ✍️ Structure & Organization
- 🎯 Tone & Voice  
- ♿ Accessibility & Readability
- 📱 Platform-Specific Optimization

**Supported Platforms:** Blog posts, LinkedIn, Twitter/X, Medium

---

## Quick Overview

### Architecture
- **Backend:** Node.js serverless functions on Vercel
- **Database:** MongoDB Atlas (free tier)
- **AI:** OpenAI GPT-4 Turbo
- **Frontend:** React + Vite + Tailwind CSS

### Deployment Steps
1. **MongoDB Atlas Setup** (~5 min) - Create free cluster and get connection string
2. **Backend Deployment** (~10 min) - Deploy to Vercel with environment variables
3. **Frontend Setup** (~5 min) - Configure and run locally or deploy

**Total Time: ~20 minutes**

---

## Prerequisites

✅ Node.js 18+ installed  
✅ Vercel account (free)  
✅ MongoDB Atlas account (free)  
✅ OpenAI API key  
✅ Terminal/Command Line access

---

## Get Started

👉 **Follow the complete guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

The deployment guide includes:
- ✅ Step-by-step MongoDB Atlas setup
- ✅ Vercel backend deployment
- ✅ Frontend configuration
- ✅ Testing & verification
- ✅ Troubleshooting solutions
- ✅ Monitoring tips

---

## Quick Commands

### Backend Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Frontend Local Development
```bash
# Navigate to frontend
cd kiro/specs/content-quality-reviewer/frontend

# Install dependencies
npm install

# Run locally
npm run dev
```

---

## Environment Variables Needed

### Backend (Vercel)
- `MONGODB_URI` - MongoDB Atlas connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `JWT_SECRET` - Random secure string
- `MAX_CONTENT_LENGTH` - 2000
- `RATE_LIMIT_WINDOW` - 60
- `RATE_LIMIT_MAX` - 10

### Frontend (.env)
- `VITE_API_ENDPOINT` - Your Vercel backend URL

---

## Testing Your Deployment

### 1. Test Signup
```bash
curl -X POST https://your-backend.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### 2. Test Analysis
Use the frontend at `http://localhost:5173` or your deployed URL.

---

## Need Help?

📖 **Full Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)  
🐛 **Troubleshooting:** See the Troubleshooting section in DEPLOYMENT_GUIDE.md  
📊 **Monitoring:** Check Vercel Dashboard and MongoDB Atlas metrics

---

## What's New in v2.0

✨ **Migrated from Vercel KV to MongoDB Atlas**
- More reliable storage
- Better scalability
- Free tier with 512 MB storage
- Automatic 30-day data cleanup with TTL indexes

---

**Ready to deploy?** → [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
