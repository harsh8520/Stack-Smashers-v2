# AI-Powered Content Quality Reviewer

An intelligent content analysis system that helps creators improve their digital content quality before publishing. Built with Vercel serverless architecture, OpenAI API, and React.

## 🏗️ Architecture

- **Frontend**: React + Vite
- **Backend**: Vercel Serverless Functions
- **Authentication**: JWT-based authentication
- **AI Analysis**: OpenAI GPT-4
- **Database**: Vercel KV (Redis)
- **NLP**: Sentiment library + OpenAI
- **Deployment**: Vercel

## ✨ Features

- **Multi-Dimensional Analysis**
  - Structure & Organization
  - Tone & Voice
  - Accessibility & Readability
  - Platform-Specific Optimization

- **AI-Powered Insights**
  - OpenAI GPT-4 for comprehensive analysis
  - Local NLP for sentiment analysis
  - Custom analyzers for detailed feedback
  - Weighted score merging (70% local, 30% AI)

- **Platform Support**
  - Blog posts
  - LinkedIn articles
  - Twitter/X posts
  - Medium stories

- **User Features**
  - Secure JWT authentication
  - Analysis history tracking
  - Real-time feedback
  - Actionable suggestions
  - Rate limiting protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or later
- Vercel account
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd content-quality-reviewer
npm install
```

### 2. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 3. Set Up Vercel KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Create Database**
3. Select **KV (Redis)**
4. Name it (e.g., `content-quality-kv`)
5. Click **Create**
6. Connect it to your project

### 4. Configure Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**:

```bash
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=your-secure-random-string
MAX_CONTENT_LENGTH=2000
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=10
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Configure Frontend

```bash
cd .kiro/specs/content-quality-reviewer/frontend

# Update .env
VITE_API_ENDPOINT=https://your-project.vercel.app

# Install and run
npm install
npm run dev
```

## 📖 Documentation

- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[FRONTEND_SETUP_GUIDE.md](./FRONTEND_SETUP_GUIDE.md)** - Frontend configuration
- **[QUICK_DEPLOYMENT_REFERENCE.md](./QUICK_DEPLOYMENT_REFERENCE.md)** - Quick reference
- **[MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)** - Migration summary

## 🏛️ Project Structure

```
content-quality-reviewer/
├── api/                        # Vercel serverless functions
│   ├── analyze.js             # Main content analysis endpoint
│   ├── history.js             # User history endpoint
│   ├── analysis/
│   │   └── [id].js           # Get specific analysis
│   └── auth/
│       ├── login.js          # Login endpoint
│       └── signup.js         # Signup endpoint
├── lib/                       # Shared libraries
│   ├── auth.js               # JWT authentication
│   ├── storage.js            # Vercel KV operations
│   ├── rate-limit.js         # Rate limiting
│   ├── openai-client.js      # OpenAI integration
│   ├── nlp-utils.js          # NLP utilities
│   └── analyzers/            # Content analyzers
│       ├── structure-analyzer.js
│       ├── tone-analyzer.js
│       ├── accessibility-checker.js
│       ├── platform-adapter.js
│       └── score-merger.js
├── .kiro/specs/content-quality-reviewer/
│   └── frontend/             # React frontend
│       ├── src/
│       │   ├── services/
│       │   │   ├── authService.ts
│       │   │   └── apiService.ts
│       │   └── components/
│       └── .env
├── vercel.json               # Vercel configuration
└── package.json              # Dependencies
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test api/analyze.test.js

# Run with coverage
npm test -- --coverage
```

## 📊 Cost Estimation

Monthly costs for 1,000 analyses:

- Vercel Functions: ~$0 (Hobby plan includes 100GB-hours)
- Vercel KV: ~$0 (Hobby plan includes 256MB)
- OpenAI API (GPT-4): ~$30-50 (depends on usage)

**Total: ~$30-50/month** (mostly OpenAI costs)

## 🔒 Security

- JWT token authentication
- bcrypt password hashing
- Rate limiting (10 requests/minute)
- CORS configuration
- Vercel KV encryption at rest
- HTTPS by default

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Run backend locally
vercel dev

# Run frontend (in another terminal)
cd .kiro/specs/content-quality-reviewer/frontend
npm run dev
```

### Environment Variables

Backend:
- `OPENAI_API_KEY`: OpenAI API key
- `JWT_SECRET`: Secure random string for JWT signing
- `KV_REST_API_URL`: Auto-configured by Vercel KV
- `KV_REST_API_TOKEN`: Auto-configured by Vercel KV
- `MAX_CONTENT_LENGTH`: Maximum content length in words (default: 2000)
- `RATE_LIMIT_WINDOW`: Rate limit window in seconds (default: 60)
- `RATE_LIMIT_MAX`: Max requests per window (default: 10)

Frontend (.env):
- `VITE_API_ENDPOINT`: Your Vercel deployment URL

## 🐛 Troubleshooting

### OpenAI API Errors
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Review OpenAI usage dashboard

### Authentication Issues
- Ensure `JWT_SECRET` is set
- Check token is included in Authorization header
- Verify token hasn't expired (7 day expiry)

### Rate Limit Errors
- Default: 10 requests per 60 seconds
- Adjust `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` if needed
- Check Vercel KV usage

### CORS Errors
- Verify `vercel.json` has CORS headers configured
- Check frontend `VITE_API_ENDPOINT` is correct
- Clear browser cache

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for more troubleshooting tips.

## 📈 Monitoring

### Vercel Dashboard
- **Functions**: Monitor execution time and errors
- **Logs**: View real-time function logs
- **Analytics**: Track usage metrics
- **Storage**: Monitor KV usage

### Key Metrics
- Function execution time
- Error rates
- KV storage usage
- OpenAI API costs

## 🔄 Deployment

### Automatic Deployment
Push to your main branch and Vercel automatically deploys.

### Manual Deployment
```bash
vercel --prod
```

### Rollback
```bash
vercel rollback
```

Or use Vercel Dashboard → Deployments → Promote previous deployment

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to existing account

### Content Analysis
- `POST /api/analyze` - Analyze content (requires auth)
- `GET /api/analysis/:id` - Get specific analysis (requires auth)
- `GET /api/history?limit=10` - Get analysis history (requires auth)

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📞 Support

For issues or questions:
1. Check Vercel function logs
2. Review [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
3. Open an issue on GitHub

---

**Built with ❤️ using Vercel, OpenAI, and React**
