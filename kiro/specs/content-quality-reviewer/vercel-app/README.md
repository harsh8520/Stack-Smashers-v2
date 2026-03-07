# ContentLens AI - Vercel + OpenAI Version

Simple, clean content quality analyzer using Next.js, Vercel, and OpenAI.

## Setup Instructions

### 1. Install Dependencies

```bash
cd .kiro/specs/content-quality-reviewer/vercel-app
npm install
```

### 2. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key

### 3. Configure Environment Variables

Edit `.env.local` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 5. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

#### Option B: Using GitHub

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your repository
5. Add environment variable: `OPENAI_API_KEY`
6. Deploy!

## Features

- ✅ Simple JavaScript (no TypeScript)
- ✅ Clean UI with Tailwind CSS
- ✅ OpenAI GPT-4 for content analysis
- ✅ Real-time analysis
- ✅ Detailed scoring across 4 dimensions
- ✅ Actionable suggestions
- ✅ No database needed (stateless)
- ✅ Easy deployment to Vercel

## API Endpoints

### POST /api/analyze

Analyzes content and returns quality scores.

**Request:**
```json
{
  "content": "Your content here...",
  "targetPlatform": "blog",
  "contentIntent": "inform"
}
```

**Response:**
```json
{
  "analysisId": "analysis_123...",
  "overallScore": 85,
  "dimensionScores": {
    "structure": { "score": 85, "confidence": 0.9, "issues": [], "strengths": [] },
    "tone": { "score": 80, "confidence": 0.85, "issues": [], "strengths": [] },
    "accessibility": { "score": 90, "confidence": 0.95, "issues": [], "strengths": [] },
    "platformAlignment": { "score": 85, "confidence": 0.88, "issues": [], "strengths": [] }
  },
  "suggestions": [
    {
      "priority": "high",
      "category": "structure",
      "title": "Improve paragraph flow",
      "description": "...",
      "reasoning": "..."
    }
  ],
  "metadata": {
    "processingTime": 2500,
    "contentLength": 250,
    "platformOptimized": true
  }
}
```

## Cost Estimation

- OpenAI GPT-4 Turbo: ~$0.01 per analysis
- Vercel: Free tier covers ~100GB bandwidth
- Total: ~$10-30/month for moderate usage

## Troubleshooting

### "OpenAI API quota exceeded"
- Check your OpenAI account has credits
- Verify API key is correct

### "Analysis failed"
- Check console logs for detailed error
- Verify `.env.local` is configured correctly

### Port already in use
- Change port: `npm run dev -- -p 3001`

## Next Steps

Want to add more features?
- Add user authentication (NextAuth.js)
- Add database for history (Vercel Postgres)
- Add more AI models (Claude, Gemini)
- Add export functionality (PDF, CSV)

Enjoy! 🚀
