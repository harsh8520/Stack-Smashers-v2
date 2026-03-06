# Frontend Setup Guide

This guide will help you set up and run the Content Quality Reviewer frontend application with AWS backend integration.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- AWS backend deployed (CDK stack)
- CDK stack output values

## Step 1: Install Dependencies

```bash
cd .kiro/specs/content-quality-reviewer/frontend
npm install
```

## Step 2: Configure AWS Settings

Create a `.env` file in the frontend directory with your AWS configuration:

```bash
cp .env.example .env
```

Edit `.env` and add your values from the CDK stack outputs:

```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### Getting CDK Output Values

After deploying the backend with `cdk deploy`, you'll see outputs like:

```
Outputs:
ContentReviewerStack.ApiEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
ContentReviewerStack.UserPoolId = us-east-1_xxxxxxxxx
ContentReviewerStack.UserPoolClientId = xxxxxxxxxxxxxxxxxxxxxxxxxx
ContentReviewerStack.Region = us-east-1
```

Use these values in your `.env` file.

## Step 3: Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`

## Step 4: Create a Test User

Before you can log in, create a test user in Cognito:

### Option A: Using AWS CLI

```bash
# Create user
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username testuser@example.com \
  --user-attributes Name=email,Value=testuser@example.com \
  --temporary-password TempPassword123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id YOUR_USER_POOL_ID \
  --username testuser@example.com \
  --password MySecurePassword123! \
  --permanent
```

### Option B: Using AWS Console

1. Go to AWS Console → Cognito
2. Select your User Pool
3. Click "Create user"
4. Enter email and temporary password
5. User will need to change password on first login

### Option C: Sign Up Through the App

1. Open the app at `http://localhost:5173`
2. Click "Sign up"
3. Fill in the form
4. Check your email for confirmation code
5. Enter the code to verify your account

## Step 5: Test the Application

1. Navigate to `http://localhost:5173`
2. Click "Get Started" or "Login"
3. Sign in with your credentials
4. You should be redirected to the Dashboard
5. Paste some content and click "Analyze Content"
6. Wait for the AI analysis to complete
7. View your results on the Results Dashboard
8. Check your history in the History page

## Features

### Authentication
- Sign up with email verification
- Sign in with email and password
- Secure session management with Cognito
- Automatic token refresh

### Content Analysis
- Paste or type content (up to 2000 words)
- Select target platform (Blog, LinkedIn, Twitter, Medium)
- Choose content intent (Inform, Educate, Persuade)
- Real-time AI analysis using Amazon Bedrock (Nova Sonic)
- Comprehensive scoring across multiple dimensions

### Results Dashboard
- Overall quality score (0-100)
- Dimension scores:
  - Structure
  - Tone
  - Accessibility
  - Platform Alignment
- Strengths and improvements
- Actionable recommendations
- Explainable AI reasoning

### History
- View all past analyses
- Track score improvements over time
- Analytics and trends
- Export reports (coming soon)

## Troubleshooting

### Issue: "Failed to analyze content"

**Possible causes:**
- Backend API not deployed
- Incorrect API endpoint in `.env`
- Cognito authentication failed
- Network connectivity issues

**Solutions:**
1. Verify backend is deployed: `aws cloudformation describe-stacks --stack-name ContentReviewerStack`
2. Check `.env` file has correct values
3. Ensure you're logged in
4. Check browser console for detailed errors

### Issue: "User is not authenticated"

**Solutions:**
1. Sign out and sign in again
2. Clear browser cache and cookies
3. Verify Cognito User Pool ID and Client ID in `.env`
4. Check that user exists in Cognito User Pool

### Issue: "Confirmation code invalid"

**Solutions:**
1. Request a new confirmation code
2. Check email spam folder
3. Verify email address is correct
4. Try creating user manually via AWS Console

### Issue: CORS errors

**Solutions:**
1. Verify API Gateway has CORS enabled
2. Check that frontend origin is allowed
3. Ensure Authorization header is included in CORS config
4. Redeploy backend if CORS settings were changed

### Issue: "Network Error" or timeout

**Solutions:**
1. Check internet connection
2. Verify API endpoint is accessible
3. Check AWS service quotas
4. Increase Lambda timeout if needed
5. Check CloudWatch logs for backend errors

## Development

### Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   ├── ProcessingState.tsx
│   │   ├── ResultsDashboard.tsx
│   │   └── History.tsx
│   ├── services/          # API service layer
│   │   └── apiService.ts
│   ├── aws-exports.ts     # AWS Amplify configuration
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment file
└── package.json
```

### API Service

The `apiService.ts` file provides functions to interact with the backend:

- `analyzeContent(request)` - Analyze content
- `getAnalysisById(id)` - Get specific analysis
- `getUserHistory(limit)` - Get user's analysis history
- `getCurrentUser()` - Get current authenticated user
- `signOut()` - Sign out user

### Adding New Features

1. Create new component in `src/components/`
2. Add route in `App.tsx`
3. Update navigation in sidebar
4. Add API calls in `apiService.ts` if needed

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Deployment

### Option A: AWS Amplify Hosting

1. Install Amplify CLI: `npm install -g @aws-amplify/cli`
2. Initialize Amplify: `amplify init`
3. Add hosting: `amplify add hosting`
4. Publish: `amplify publish`

### Option B: S3 + CloudFront

1. Build the app: `npm run build`
2. Create S3 bucket
3. Upload `dist/` contents to S3
4. Create CloudFront distribution
5. Point to S3 bucket

### Option C: Vercel/Netlify

1. Connect your Git repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_AWS_REGION` | AWS region | `us-east-1` |
| `VITE_USER_POOL_ID` | Cognito User Pool ID | `us-east-1_abc123` |
| `VITE_USER_POOL_CLIENT_ID` | Cognito Client ID | `1234567890abcdef` |
| `VITE_API_ENDPOINT` | API Gateway endpoint | `https://api.example.com/prod` |

## Security Notes

- Never commit `.env` file to version control
- Use environment-specific configurations
- Rotate credentials regularly
- Enable MFA for production users
- Use HTTPS in production
- Implement rate limiting
- Monitor CloudWatch logs for suspicious activity

## Support

For issues or questions:
1. Check CloudWatch logs for backend errors
2. Review browser console for frontend errors
3. Verify AWS service quotas
4. Check IAM permissions

## Next Steps

- Enable social login (Google, GitHub)
- Add export to PDF functionality
- Implement real-time collaboration
- Add content templates
- Create mobile app
- Add analytics dashboard
- Implement A/B testing
