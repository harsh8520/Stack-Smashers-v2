# Quick Deployment Reference

## 🚀 Quick Start

### 1. Deploy Backend to Vercel

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 2. Set Up Vercel KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Create Database**
3. Select **KV (Redis)**
4. Name it (e.g., `content-quality-kv`)
5. Click **Create**
6. Go to your project → **Storage** → **Connect Store**
7. Select your KV database → **Connect**

### 3. Configure Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**:

```bash
# Required Variables
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=your-secure-random-string-here
MAX_CONTENT_LENGTH=2000
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=10
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Update Frontend Configuration

Edit `.kiro/specs/content-quality-reviewer/frontend/.env`:

```bash
VITE_API_ENDPOINT=https://your-project.vercel.app
```

### 5. Test Your Deployment

```bash
# Test signup
curl -X POST https://your-project.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test login (use the token from signup response)
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test analyze (replace YOUR_TOKEN with token from login)
curl -X POST https://your-project.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content":"This is a test blog post.",
    "targetPlatform":"blog",
    "contentIntent":"inform"
  }'
```

## 📁 Project Structure

```
/
├── api/                          # Vercel serverless functions
│   ├── analyze.js               # Main content analysis endpoint
│   ├── history.js               # User history endpoint
│   ├── analysis/
│   │   └── [id].js             # Get specific analysis
│   └── auth/
│       ├── login.js            # Login endpoint
│       └── signup.js           # Signup endpoint
│
├── lib/                         # Shared libraries
│   ├── auth.js                 # JWT authentication
│   ├── storage.js              # Vercel KV operations
│   ├── rate-limit.js           # Rate limiting
│   ├── openai-client.js        # OpenAI integration
│   ├── nlp-utils.js            # NLP utilities
│   └── analyzers/              # Content analyzers
│       ├── structure-analyzer.js
│       ├── tone-analyzer.js
│       ├── accessibility-checker.js
│       ├── platform-adapter.js
│       └── score-merger.js
│
├── .kiro/specs/content-quality-reviewer/frontend/  # Frontend
│   ├── src/
│   │   ├── services/
│   │   │   ├── authService.ts   # JWT auth service
│   │   │   └── apiService.ts    # API client
│   │   └── components/          # React components
│   └── .env                     # Frontend config
│
├── vercel.json                  # Vercel configuration
├── package.json                 # Dependencies
└── .env.example                 # Environment template
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Content Analysis
- `POST /api/analyze` - Analyze content (requires auth)
- `GET /api/analysis/:id` - Get analysis by ID (requires auth)
- `GET /api/history?limit=10` - Get user history (requires auth)

## 🔒 Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

Token is obtained from `/api/auth/login` or `/api/auth/signup`

## 📊 Rate Limits

- **Default**: 10 requests per 60 seconds per user
- **Configurable**: Set `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` env vars

## 🐛 Troubleshooting

### Backend Issues

**Check Logs:**
```bash
vercel logs
```

**Common Issues:**
1. **"Environment variable not set"** → Add missing env vars in Vercel dashboard
2. **"KV connection error"** → Ensure KV database is connected to project
3. **"OpenAI API error"** → Check API key and credits

### Frontend Issues

**Check Console:**
- Open browser DevTools → Console tab

**Common Issues:**
1. **CORS errors** → Verify `vercel.json` has CORS headers
2. **"No authentication token"** → User needs to log in
3. **"Failed to fetch"** → Check `VITE_API_ENDPOINT` in `.env`

## 📈 Monitoring

### Vercel Dashboard
1. **Deployments** → View deployment history
2. **Functions** → Monitor function execution
3. **Logs** → View real-time logs
4. **Analytics** → Track usage metrics
5. **Storage** → Monitor KV usage

### Key Metrics to Watch
- Function execution time
- Error rates
- KV storage usage
- OpenAI API costs

## 🔄 Rollback

If something goes wrong:

```bash
# Via CLI
vercel rollback

# Via Dashboard
Deployments → Previous deployment → Promote to Production
```

## 📝 Environment Variables Checklist

- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `JWT_SECRET` - Secure random string (64+ chars)
- [ ] `KV_REST_API_URL` - Auto-configured by Vercel KV
- [ ] `KV_REST_API_TOKEN` - Auto-configured by Vercel KV
- [ ] `MAX_CONTENT_LENGTH` - Max words (default: 2000)
- [ ] `RATE_LIMIT_WINDOW` - Seconds (default: 60)
- [ ] `RATE_LIMIT_MAX` - Max requests (default: 10)

## 🎯 Testing Checklist

- [ ] Sign up new user
- [ ] Log in with credentials
- [ ] Analyze content (blog)
- [ ] Analyze content (linkedin)
- [ ] Analyze content (twitter)
- [ ] Analyze content (medium)
- [ ] View analysis history
- [ ] Get specific analysis by ID
- [ ] Test rate limiting (make 11 requests quickly)
- [ ] Log out and log back in
- [ ] Test with invalid credentials
- [ ] Test with missing auth token

## 📚 Documentation

- **Vercel Deployment**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Frontend Setup**: `FRONTEND_SETUP_GUIDE.md`
- **API Documentation**: See design document in `.kiro/specs/vercel-openai-migration/design.md`

## 🆘 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel KV Docs**: https://vercel.com/docs/storage/vercel-kv
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Project Issues**: Check function logs in Vercel dashboard

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ All API endpoints respond correctly
2. ✅ Users can sign up and log in
3. ✅ Content analysis works for all platforms
4. ✅ History retrieval works
5. ✅ Rate limiting is enforced
6. ✅ No errors in Vercel logs
7. ✅ Frontend connects to backend successfully

## 🚦 Next Steps After Deployment

1. **Monitor** - Watch logs and metrics for first 24 hours
2. **Test** - Run through all user flows
3. **Optimize** - Adjust rate limits based on usage
4. **Scale** - Upgrade Vercel plan if needed
5. **Secure** - Consider adding additional security measures
6. **Document** - Update any custom configurations

---

**Need Help?** Check the detailed guides:
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `FRONTEND_SETUP_GUIDE.md` - Frontend configuration details
