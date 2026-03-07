# Frontend Setup Guide

This guide explains how to set up and configure the frontend to work with the new Vercel backend.

## Changes Made

The frontend has been updated to replace AWS Amplify authentication with JWT-based authentication:

### Files Modified

1. **Authentication Service** (`src/services/authService.ts`) - NEW
   - Handles JWT-based signup, login, and logout
   - Stores tokens in localStorage
   - Provides authentication helpers

2. **API Service** (`src/services/apiService.ts`) - UPDATED
   - Removed AWS Amplify dependencies
   - Uses JWT tokens from authService
   - Updated API endpoints to match Vercel backend

3. **Login Component** (`src/components/Login.tsx`) - UPDATED
   - Simplified to use JWT auth
   - Removed AWS Cognito-specific features (password reset, confirmation)

4. **SignUp Component** (`src/components/SignUp.tsx`) - UPDATED
   - Simplified to use JWT auth
   - Removed email confirmation flow
   - Auto-login after signup

5. **App Component** (`src/App.tsx`) - UPDATED
   - Uses authService instead of AWS Amplify
   - Simplified auth checking

6. **Main Entry** (`src/main.tsx`) - UPDATED
   - Removed Amplify configuration

7. **Environment Config** (`.env`) - UPDATED
   - Removed AWS-specific variables
   - Added `VITE_API_ENDPOINT` for Vercel backend

## Setup Instructions

### 1. Install Dependencies

The frontend already has all necessary dependencies. No additional packages needed.

### 2. Configure Environment Variables

Update `.kiro/specs/content-quality-reviewer/frontend/.env`:

```bash
# For local development (using Vercel CLI)
VITE_API_ENDPOINT=http://localhost:3000

# For production (after deploying to Vercel)
VITE_API_ENDPOINT=https://your-project.vercel.app
```

### 3. Run Frontend Locally

```bash
cd .kiro/specs/content-quality-reviewer/frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Test with Local Backend

To test the frontend with the backend locally, you need to run the Vercel backend:

```bash
# In the root directory (not frontend)
vercel dev
```

This starts the Vercel backend on `http://localhost:3000`

Now you can:
1. Open frontend at `http://localhost:5173`
2. Sign up for a new account
3. Log in
4. Analyze content

### 5. Deploy Frontend

The frontend can be deployed separately or as part of the Vercel project.

#### Option A: Deploy with Backend (Recommended)

If your Vercel project includes both frontend and backend:

1. Ensure `vercel.json` includes frontend routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. Deploy:
```bash
vercel --prod
```

#### Option B: Deploy Frontend Separately

Deploy frontend to a separate Vercel project or other hosting:

1. Build the frontend:
```bash
cd .kiro/specs/content-quality-reviewer/frontend
npm run build
```

2. Deploy the `dist` folder to your hosting provider

3. Update `VITE_API_ENDPOINT` to point to your backend URL

## API Endpoints

The frontend now uses these endpoints:

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to existing account

### Content Analysis
- `POST /api/analyze` - Analyze content
- `GET /api/analysis/:id` - Get specific analysis
- `GET /api/history?limit=10` - Get analysis history

## Authentication Flow

### Sign Up
1. User enters email and password
2. Frontend calls `POST /api/auth/signup`
3. Backend creates user and returns JWT token
4. Frontend stores token in localStorage
5. User is automatically logged in

### Login
1. User enters email and password
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage
5. User is logged in

### Authenticated Requests
1. Frontend retrieves token from localStorage
2. Adds `Authorization: Bearer <token>` header to requests
3. Backend validates token and processes request

### Logout
1. Frontend removes token from localStorage
2. User is logged out

## Troubleshooting

### Issue: "No authentication token available"

**Solution:** User needs to log in again. Token may have expired or been cleared.

### Issue: CORS errors

**Solution:** 
1. Ensure backend `vercel.json` has CORS headers configured
2. Check that `VITE_API_ENDPOINT` is correct
3. Verify backend is running

### Issue: "Failed to fetch"

**Solution:**
1. Check that backend is running
2. Verify `VITE_API_ENDPOINT` in `.env`
3. Check browser console for detailed error

### Issue: 401 Unauthorized errors

**Solution:**
1. Token may have expired - log out and log in again
2. Check that token is being sent in Authorization header
3. Verify JWT_SECRET is set correctly in backend

## Development Workflow

### Local Development

1. Start backend:
```bash
vercel dev
```

2. Start frontend (in another terminal):
```bash
cd .kiro/specs/content-quality-reviewer/frontend
npm run dev
```

3. Open `http://localhost:5173`

### Testing

1. Sign up with a test account
2. Log in
3. Try analyzing content
4. Check history
5. Log out and log back in

## Production Deployment

### Backend First

1. Deploy backend to Vercel:
```bash
vercel --prod
```

2. Note the production URL (e.g., `https://your-project.vercel.app`)

3. Set up environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - Connect Vercel KV database

### Frontend Second

1. Update frontend `.env`:
```bash
VITE_API_ENDPOINT=https://your-project.vercel.app
```

2. Build frontend:
```bash
cd .kiro/specs/content-quality-reviewer/frontend
npm run build
```

3. Deploy frontend (if separate) or redeploy full project

### Verify Deployment

1. Open production URL
2. Sign up for an account
3. Test content analysis
4. Check that history works
5. Verify logout/login flow

## Security Notes

1. **JWT Tokens**: Stored in localStorage (consider httpOnly cookies for production)
2. **HTTPS**: Always use HTTPS in production
3. **Token Expiration**: Tokens expire after 7 days
4. **Password Requirements**: Minimum 6 characters (consider strengthening)

## Next Steps

After setup:
1. Test all features thoroughly
2. Monitor error logs in Vercel dashboard
3. Set up error tracking (e.g., Sentry)
4. Configure custom domain (optional)
5. Set up CI/CD pipeline (optional)

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Vercel function logs
3. Verify environment variables
4. Test API endpoints directly with curl/Postman
