# Content Quality Reviewer - Deployment Guide

This guide will help you deploy the Content Quality Reviewer application to AWS step by step.

## Prerequisites Checklist

Before starting, ensure you have:

- ✅ AWS Account with admin access
- ✅ AWS CLI installed and configured (`aws --version`)
- ✅ Node.js 18+ installed (`node --version`)
- ✅ AWS CDK installed (`cdk --version`)
- ✅ AWS credentials configured (`aws sts get-caller-identity`)

## Deployment Steps

### Step 1: Clean Up Existing Resources (If Any)

If you've attempted deployment before, clean up any retained resources:

```powershell
# Delete existing DynamoDB table (if exists)
aws dynamodb delete-table --table-name ContentAnalysisResults

# Delete existing Cognito User Pool (if exists)
# First, get the User Pool ID:
aws cognito-idp list-user-pools --max-results 10

# Then delete it (replace with your User Pool ID):
aws cognito-idp delete-user-pool --user-pool-id us-east-1_XXXXXXXXX

# Wait 30 seconds for deletion to complete
Start-Sleep -Seconds 30
```

### Step 2: Set Up API Gateway CloudWatch Logging (One-Time Setup)

This is required for API Gateway to log to CloudWatch. Run this once per AWS account/region:

```powershell
# Create IAM role for API Gateway logging
aws iam create-role --role-name APIGatewayCloudWatchLogsRole --assume-role-policy-document file://trust-policy.json

# Attach CloudWatch Logs policy
aws iam attach-role-policy --role-name APIGatewayCloudWatchLogsRole --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"

# Configure API Gateway to use this role
aws apigateway update-account --patch-operations op=replace,path=/cloudwatchRoleArn,value=arn:aws:iam::701112999204:role/APIGatewayCloudWatchLogsRole
```

**Note**: Replace `701112999204` with your AWS Account ID (get it from `aws sts get-caller-identity`)

### Step 3: Build the Project

```powershell
# Install dependencies (if not already done)
npm install

# Build TypeScript
npm run build

# Run tests to verify everything works
npm test
```

All 47 tests should pass.

### Step 4: Bootstrap CDK (First Time Only)

If you haven't used CDK in this account/region before:

```powershell
# Get your account ID
aws sts get-caller-identity

# Bootstrap CDK (replace ACCOUNT-ID with your actual account ID)
cdk bootstrap aws://ACCOUNT-ID/us-east-1
```

### Step 5: Deploy the Backend Stack

```powershell
# Deploy to AWS
cdk deploy --require-approval never
```

This will take 5-10 minutes. The deployment will:
- Create DynamoDB tables (ContentAnalysisResults, RateLimitTable)
- Deploy 5 Lambda functions (Orchestrator, GetAnalysis, History, Auth, LogRetention)
- Set up API Gateway with REST endpoints
- Create Cognito User Pool for authentication
- Configure IAM roles and permissions

**Important**: Save the outputs displayed after deployment! You'll need them for the frontend.

Example outputs:
```
ContentReviewerStack.ApiEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
ContentReviewerStack.UserPoolId = us-east-1_xxxxx
ContentReviewerStack.UserPoolClientId = xxxxxxxxxxxxx
ContentReviewerStack.Region = us-east-1
```

### Step 6: Enable Amazon Bedrock Model Access

1. Go to AWS Console → **Amazon Bedrock**
2. Click **Model access** in the left sidebar
3. Click **Manage model access**
4. Find **Amazon Nova Sonic** (us.amazon.nova-sonic-v1:0)
5. Check the box and click **Request model access**
6. Wait for approval (usually instant)

### Step 7: Test the Backend API

Test that the backend is working:

```powershell
# Get your API endpoint from the deployment outputs
$API_ENDPOINT = "https://xxxxx.execute-api.us-east-1.amazonaws.com/prod"

# Test the API (this will fail with 401 Unauthorized, which is expected without auth)
curl $API_ENDPOINT/analyze
```

You should see a 401 error, which means the API is working but requires authentication.

### Step 8: Configure the Frontend

Navigate to the frontend directory:

```powershell
cd .kiro/specs/content-quality-reviewer/frontend
```

Create a `.env` file with your AWS outputs:

```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxx
VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

Replace the values with your actual outputs from Step 5.

### Step 9: Run the Frontend Locally

```powershell
# Install frontend dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will start at `http://localhost:5173/`

### Step 10: Test the Complete Application

1. Open your browser to `http://localhost:5173/`
2. Click **Sign Up** to create an account
3. Enter your email and password
4. Check your email for the verification code
5. Enter the verification code
6. Log in with your credentials
7. Test the content analysis:
   - Paste some text (e.g., a blog post)
   - Select platform (e.g., "Blog")
   - Select intent (e.g., "Inform")
   - Click "Analyze Content"
8. Wait 10-30 seconds for the analysis
9. View the results with scores and suggestions

## Troubleshooting

### Issue: "CloudWatch Logs role ARN must be set"

**Solution**: Complete Step 2 to set up the API Gateway CloudWatch Logs role.

### Issue: "Resource already exists" (DynamoDB table)

**Solution**: Delete the existing table:
```powershell
aws dynamodb delete-table --table-name ContentAnalysisResults
Start-Sleep -Seconds 30
```

### Issue: "Access Denied" errors during deployment

**Solution**: 
- Verify AWS credentials: `aws sts get-caller-identity`
- Ensure your IAM user has AdministratorAccess policy
- Re-run `aws configure` if needed

### Issue: Bedrock "Access Denied" or "Model not found"

**Solution**: 
- Go to AWS Console → Bedrock → Model access
- Request access to Amazon Nova Sonic
- Wait for approval (usually instant)

### Issue: Frontend can't connect to API

**Solution**:
- Verify `.env` file has correct values
- Check API endpoint is accessible
- Verify Cognito User Pool ID and Client ID are correct
- Check browser console for errors

### Issue: Cognito verification email not received

**Solution**:
- Check spam folder
- Verify email address is correct
- In AWS Console → Cognito → User Pool → Users, you can manually confirm users

## Deployment Architecture

After deployment, you'll have:

```
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌─────────────────┐                 │
│  │   Cognito    │◄─────┤   API Gateway   │                 │
│  │  User Pool   │      │   (REST API)    │                 │
│  └──────────────┘      └────────┬────────┘                 │
│                                  │                           │
│                         ┌────────┴────────┐                 │
│                         │                 │                 │
│                    ┌────▼─────┐    ┌─────▼──────┐          │
│                    │ Lambda   │    │  Lambda    │          │
│                    │Functions │    │ Functions  │          │
│                    │(5 total) │    │            │          │
│                    └────┬─────┘    └─────┬──────┘          │
│                         │                │                  │
│              ┌──────────┴────────────────┴─────┐           │
│              │                                  │           │
│         ┌────▼─────┐                     ┌─────▼──────┐    │
│         │ DynamoDB │                     │  Bedrock   │    │
│         │  Tables  │                     │ Nova Sonic │    │
│         └──────────┘                     └────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
                    ┌──────┴──────┐
                    │   Frontend  │
                    │ (localhost)  │
                    └─────────────┘
```

## Cost Estimation

With normal usage (free tier):
- **DynamoDB**: Free (25 GB storage, 25 WCU, 25 RCU)
- **Lambda**: Free (1M requests/month)
- **API Gateway**: Free (1M requests/month)
- **Cognito**: Free (50,000 MAUs)
- **Bedrock Nova Sonic**: ~$0.0004 per 1K input tokens
- **Comprehend**: $0.0001 per unit (first 50K units free)

**Estimated monthly cost for testing**: $0-5

## Clean Up (When Done)

To avoid AWS charges, destroy the stack:

```powershell
# Navigate back to project root
cd E:\AWS

# Destroy the stack
cdk destroy

# Optionally delete retained resources
aws dynamodb delete-table --table-name ContentAnalysisResults
aws cognito-idp delete-user-pool --user-pool-id us-east-1_xxxxx
```

## Next Steps

After successful deployment:

1. **Customize the UI**: Modify components in `frontend/src/components/`
2. **Add Features**: Extend the backend Lambda functions
3. **Deploy Frontend to Production**: 
   - Build: `npm run build`
   - Deploy to S3 + CloudFront or Amplify Hosting
4. **Set Up Monitoring**: Create CloudWatch dashboards
5. **Optimize Costs**: Review Bedrock usage and optimize prompts

## Support

If you encounter issues:
1. Check CloudWatch Logs for Lambda errors
2. Check browser console for frontend errors
3. Review this troubleshooting section
4. Check the main README.md for additional documentation

## Security Best Practices

1. ✅ Never commit `.env` files to Git
2. ✅ Rotate AWS credentials regularly
3. ✅ Use least privilege IAM policies in production
4. ✅ Enable MFA on AWS root account
5. ✅ Monitor CloudWatch for unusual activity
6. ✅ Keep dependencies updated: `npm audit fix`

---

**Deployment Complete! 🎉**

Your Content Quality Reviewer application is now running on AWS with a local frontend.
