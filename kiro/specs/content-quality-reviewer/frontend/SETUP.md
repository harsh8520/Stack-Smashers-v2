# Frontend Setup Guide

Quick guide to set up and run the Content Quality Reviewer frontend.

---

## Prerequisites

- Node.js 18+
- Backend deployed to Vercel (see main [DEPLOYMENT_GUIDE.md](../../../DEPLOYMENT_GUIDE.md))
- Backend URL from Vercel deployment

---

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and set your backend URL:
```env
VITE_API_ENDPOINT=https://your-backend-url.vercel.app
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend will be available at: [http://localhost:5173](http://localhost:5173)

---

## Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

---

## Deploy to Vercel

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy
vercel

# Add environment variable
vercel env add VITE_API_ENDPOINT
# Value: Your backend URL
# Environment: Production, Preview, Development

# Deploy to production
vercel --prod
```

### Option 2: Via Vercel Dashboard

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Set Framework Preset: **Vite**
4. Set Root Directory: `kiro/specs/content-quality-reviewer/frontend`
5. Add Environment Variable:
   - Name: `VITE_API_ENDPOINT`
   - Value: Your backend URL
6. Click "Deploy"

---

## Environment Variables

### Required

- `VITE_API_ENDPOINT` - Your backend API URL (e.g., `https://your-backend.vercel.app`)

### Optional

None currently. All configuration is done via the backend.

---

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components (shadcn/ui)
│   │   ├── Dashboard.tsx # Main dashboard
│   │   ├── Login.tsx     # Login page
│   │   ├── SignUp.tsx    # Signup page
│   │   └── ...
│   ├── services/         # API service layer
│   │   ├── apiService.ts # Content analysis API
│   │   └── authService.ts # Authentication API
│   ├── styles/           # Global styles
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

---

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Lint code
npm run lint
```

---

## Features

### Authentication
- User signup with email/password
- User login with JWT tokens
- Automatic token refresh
- Protected routes

### Content Analysis
- Multi-platform support (Blog, LinkedIn, Twitter, Medium)
- Content intent selection (Informative, Promotional, Educational, etc.)
- Real-time analysis with OpenAI
- Detailed scoring across multiple dimensions
- Actionable suggestions

### Dashboard
- Analysis history
- Score visualization with charts
- Detailed dimension breakdowns
- Suggestion lists
- Export capabilities

### UI Components
- Built with shadcn/ui
- Tailwind CSS styling
- Responsive design
- Dark mode support
- Accessible components

---

## Troubleshooting

### "Network Error" or "Failed to fetch"

**Problem:** Frontend can't connect to backend

**Solutions:**
1. Check `VITE_API_ENDPOINT` in `.env` is correct
2. Verify backend is deployed and accessible
3. Check browser console for CORS errors
4. Ensure backend URL doesn't have trailing slash

### "Unauthorized" errors

**Problem:** Authentication token issues

**Solutions:**
1. Log out and log in again
2. Clear browser localStorage
3. Check JWT_SECRET is set in backend environment variables
4. Verify token hasn't expired (default: 24 hours)

### Build errors

**Problem:** TypeScript or build errors

**Solutions:**
1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check TypeScript errors: `npm run type-check`

### Styling issues

**Problem:** Tailwind CSS not working

**Solutions:**
1. Ensure Tailwind CSS is properly configured in `tailwind.config.js`
2. Check `postcss.config.js` exists
3. Restart dev server: `npm run dev`

---

## API Integration

The frontend communicates with the backend via REST API:

### Authentication Endpoints

```typescript
// Signup
POST /api/auth/signup
Body: { email: string, password: string }
Response: { token: string, user: { id: string, email: string } }

// Login
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: { id: string, email: string } }
```

### Analysis Endpoints

```typescript
// Analyze content
POST /api/analyze
Headers: { Authorization: "Bearer <token>" }
Body: {
  content: string,
  targetPlatform: string,
  contentIntent: string
}
Response: {
  analysisId: string,
  overallScore: number,
  dimensionScores: object,
  suggestions: string[],
  ...
}

// Get analysis by ID
GET /api/analysis/:id
Headers: { Authorization: "Bearer <token>" }
Response: { analysisId, userId, timestamp, ... }

// Get user history
GET /api/history?limit=10
Headers: { Authorization: "Bearer <token>" }
Response: {
  analyses: array,
  total: number,
  hasMore: boolean
}
```

---

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** React Hooks
- **HTTP Client:** Fetch API
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router (if applicable)

---

## Development Tips

### Hot Module Replacement (HMR)

Vite provides fast HMR. Changes to components will reflect immediately without full page reload.

### TypeScript

The project uses TypeScript for type safety. Run type checking:
```bash
npm run type-check
```

### Component Development

UI components are based on shadcn/ui. To add new components:
```bash
npx shadcn-ui@latest add <component-name>
```

### API Service Layer

All API calls go through service files in `src/services/`:
- `authService.ts` - Authentication
- `apiService.ts` - Content analysis

This provides a clean separation between UI and API logic.

---

## Performance Optimization

### Production Build

The production build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

### Lazy Loading

Consider lazy loading routes and heavy components:
```typescript
const Dashboard = lazy(() => import('./components/Dashboard'));
```

### Caching

API responses can be cached in localStorage or React Query for better performance.

---

## Security Considerations

### Token Storage

JWT tokens are stored in localStorage. For production:
- Consider using httpOnly cookies
- Implement token refresh mechanism
- Add CSRF protection

### API Calls

All API calls include:
- Authorization headers
- HTTPS only
- Error handling
- Request validation

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Need Help?

📖 **Main Deployment Guide:** [../../../DEPLOYMENT_GUIDE.md](../../../DEPLOYMENT_GUIDE.md)  
🐛 **Backend Issues:** Check Vercel function logs  
💬 **Frontend Issues:** Check browser console

---

**Happy coding!** 🚀
