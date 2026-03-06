# Content Quality Reviewer - Complete Setup Guide

This guide will walk you through setting up and deploying the Content Quality Reviewer application on your local machine and AWS.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [Local Environment Setup](#local-environment-setup)
4. [Deploy Backend to AWS](#deploy-backend-to-aws)
5. [Setup Frontend](#setup-frontend)
6. [Run the Application](#run-the-application)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **AWS CLI** (v2) - [Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **AWS CDK** (v2) - Install globally: `npm install -g aws-cdk`
- **Git** - [Download](https://git-scm.com/)

### Verify Installations
```bash
node --version    # Should be v18+
npm --version     # Should be 8+
aws --version     # Should be aws-cli/2.x
cdk --version     # Should be 2.x
```

---

## AWS Account Setup

### Step 1: Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Follow the registration process
4. **Important**: You'll need a credit card, but we'll use free tier services

### Step 2: Create IAM User
1. Log into AWS Console
2. Go to **IAM** service
3. Click **Users** → **Add users**
4. User name: `content-reviewer-admin`
5. Select **Access key - Programmatic access**
6. Click **Next: Permissions**
7. Click **Attach existing policies directly**
8. Select these policies:
   - `AdministratorAccess` (for initial setup)
9. Click through to **Create user**
10. **IMPORTANT**: Download the CSV with Access Key ID and Secret Access Key

### Step 3: Configure AWS CLI
```bash
aws configure
```

Enter the following when prompted:
```
AWS Access Key ID: [Your Access Key from CSV]
AWS Secret Access Key: [Your Secret Key from CSV]
Default region name: us-east-1
Default output format: json
```

### Step 4: Verify AWS Configuration
```bash
aws sts get-caller-identity
```

You should see your account information.

### Step 5: Enable Required AWS Services
Make sure these services are available in your region (us-east-1):
- Amazon Bedrock (with Nova models)
- Amazon Comprehend
- Amazon DynamoDB
- AWS Lambda
- Amazon API Gateway
- Amazon Cognito

### Step 6: Request Bedrock Model Access
1. Go to AWS Console → **Amazon Bedrock**
2. Click **Model access** in the left sidebar
3. Click **Manage model access**
4. Find **Amazon Nova Lite** and **Amazon Nova Sonic**
5. Check the boxes and click **Request model access**
6. Wait for approval (usually instant for Nova models)

---

## Local Environment Setup

### Step 1: Clone/Navigate to Project
```bash
cd E:\AWS  # Your project directory
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

### Step 3: Bootstrap AWS CDK (First Time Only)
```bash
cdk bootstrap aws://ACCOUNT-ID/us-east-1
```

Replace `ACCOUNT-ID` with your AWS account ID (from `aws sts get-caller-identity`).

### Step 4: Verify CDK Setup
```bash
cdk synth
```

This should generate CloudFormation templates without errors.

---

## Deploy Backend to AWS

### Step 1: Build the Project
```bash
npm run build
```

### Step 2: Run Tests (Optional but Recommended)
```bash
npm test
```

All 47 tests should pass.

### Step 3: Deploy to AWS
```bash
cdk deploy
```

This will:
- Create DynamoDB tables
- Deploy Lambda functions
- Set up API Gateway
- Create Cognito User Pool
- Configure IAM roles and permissions

**Important**: 
- Review the changes when prompted
- Type `y` to confirm deployment
- Deployment takes 5-10 minutes

### Step 4: Save the Outputs
After deployment completes, you'll see outputs like:
```
Outputs:
ContentReviewerStack.ApiEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
ContentReviewerStack.UserPoolId = us-east-1_xxxxx
ContentReviewerStack.UserPoolClientId = xxxxxxxxxxxxx
ContentReviewerStack.Region = us-east-1
```

**SAVE THESE VALUES** - you'll need them for the frontend!

---

## Setup Frontend

### Step 1: Navigate to Frontend Directory
```bash
cd .kiro/specs/content-quality-reviewer/frontend
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Create Environment File
Create a file named `.env` in the frontend directory:

```bash
# On Windows
type nul > .env

# Or create manually in your editor
```

### Step 4: Configure Environment Variables
Edit `.env` and add your AWS outputs:

```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxx
VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

Replace the values with your actual outputs from the CDK deployment.

### Step 5: Verify Frontend Configuration
Check that the file `.kiro/specs/content-quality-reviewer/frontend/src/aws-exports.ts` exists.

---

## Run the Application

### Step 1: Start the Frontend Development Server
```bash
# Make sure you're in the frontend directory
cd .kiro/specs/content-quality-reviewer/frontend

# Start the dev server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 2: Open the Application
1. Open your browser
2. Go to `http://localhost:5173/`
3. You should see the ContentLens AI landing page

### Step 3: Create a Test Account
1. Click **Sign Up**
2. Enter:
   - Email: your-email@example.com
   - Password: Test123! (must meet requirements)
3. Check your email for verification code
4. Enter the verification code
5. You'll be redirected to login

### Step 4: Test the Application
1. **Login** with your credentials
2. **Dashboard**: You should see the content analysis form
3. **Analyze Content**:
   - Paste some text (e.g., a blog post)
   - Select platform (e.g., "Blog")
   - Select intent (e.g., "Inform")
   - Click "Analyze Content"
4. **View Results**: Wait for analysis (10-30 seconds)
5. **Check History**: Navigate to History to see past analyses

---

## Testing

### Backend Tests
```bash
# From project root (E:\AWS)
npm test
```

### Frontend Tests (if you add them later)
```bash
# From frontend directory
cd .kiro/specs/content-quality-reviewer/frontend
npm test
```

### Manual API Testing
You can test the API directly using curl or Postman:

```bash
# Get a Cognito token first (use AWS Amplify or Cognito SDK)
# Then test the analyze endpoint:

curl -X POST https://your-api-endpoint/prod/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "This is a test blog post about AI.",
    "targetPlatform": "blog",
    "contentIntent": "inform"
  }'
```

---

## Troubleshooting

### Issue: CDK Deploy Fails with "Access Denied"
**Solution**: 
- Verify AWS credentials: `aws sts get-caller-identity`
- Ensure IAM user has AdministratorAccess
- Re-run `aws configure`

### Issue: Bedrock Model Not Available
**Solution**:
- Go to AWS Console → Bedrock → Model access
- Request access to Amazon Nova models
- Wait for approval (usually instant)

### Issue: Frontend Can't Connect to API
**Solution**:
- Verify `.env` file has correct values
- Check API endpoint is accessible: `curl https://your-api-endpoint/prod/analyze`
- Check browser console for CORS errors
- Verify Cognito authentication is working

### Issue: "Module not found" Errors
**Solution**:
```bash
# Backend
npm install

# Frontend
cd .kiro/specs/content-quality-reviewer/frontend
npm install
```

### Issue: Tests Failing
**Solution**:
- Ensure all dependencies are installed
- Run `npm run build` first
- Check Node.js version (should be v18+)

### Issue: Cognito Email Not Received
**Solution**:
- Check spam folder
- Verify email address is correct
- In AWS Console → Cognito → User Pool → Users, you can manually confirm users

### Issue: High AWS Costs
**Solution**:
- Most services are in free tier
- Monitor usage in AWS Cost Explorer
- To save costs, delete the stack when not in use: `cdk destroy`

---

## Useful Commands

### Backend
```bash
# Build TypeScript
npm run build

# Run tests
npm test

# Deploy to AWS
cdk deploy

# View CloudFormation template
cdk synth

# Destroy all resources
cdk destroy

# View deployment diff
cdk diff
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### AWS CLI
```bash
# View CloudFormation stacks
aws cloudformation list-stacks

# View DynamoDB tables
aws dynamodb list-tables

# View Lambda functions
aws lambda list-functions

# View API Gateway APIs
aws apigateway get-rest-apis

# View Cognito User Pools
aws cognito-idp list-user-pools --max-results 10
```

---

## Next Steps

1. **Customize the UI**: Modify components in `frontend/src/components/`
2. **Add Features**: Extend the backend Lambda functions
3. **Deploy to Production**: 
   - Build frontend: `npm run build`
   - Deploy to S3 + CloudFront
   - Update API Gateway for production
4. **Monitor**: Set up CloudWatch dashboards
5. **Optimize**: Review Bedrock costs and optimize prompts

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review AWS CloudWatch logs for Lambda errors
3. Check browser console for frontend errors
4. Review the README.md for additional documentation

---

## Clean Up (When Done Testing)

To avoid AWS charges, destroy the stack:

```bash
# From project root
cdk destroy
```

This will delete all AWS resources created by the stack.

**Note**: This does NOT delete:
- CloudWatch logs (delete manually if needed)
- S3 buckets created by CDK bootstrap (safe to keep)

---

## Estimated Costs

With normal testing usage (free tier):
- **DynamoDB**: Free (25 GB storage, 25 WCU, 25 RCU)
- **Lambda**: Free (1M requests/month)
- **API Gateway**: Free (1M requests/month)
- **Cognito**: Free (50,000 MAUs)
- **Bedrock**: ~$0.0004 per 1K input tokens (Nova Lite)
- **Comprehend**: $0.0001 per unit (first 50K units free)

**Estimated monthly cost for light testing**: $0-5

---

## Security Best Practices

1. **Never commit `.env` files** to Git
2. **Rotate AWS credentials** regularly
3. **Use least privilege** IAM policies in production
4. **Enable MFA** on AWS root account
5. **Monitor CloudWatch** for unusual activity
6. **Keep dependencies updated**: `npm audit fix`

---

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [React + Vite Documentation](https://vitejs.dev/)

---

**Happy Testing! 🚀**
