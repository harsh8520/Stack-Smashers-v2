# 🚀 Start Here - Content Quality Reviewer Deployment

Welcome! This guide will help you deploy the Content Quality Reviewer application to AWS.

## 📋 What You'll Deploy

A serverless AI-powered content analysis system with:
- **Backend**: AWS Lambda + API Gateway + DynamoDB + Bedrock
- **Frontend**: React app (runs locally)
- **Authentication**: Amazon Cognito
- **AI Analysis**: Amazon Bedrock Nova Sonic + AWS Comprehend

## ⏱️ Time Required

- **First-time deployment**: 30-45 minutes
- **Subsequent deployments**: 10-15 minutes

## 📚 Documentation Files

Choose the guide that fits your needs:

### 1. **QUICK_DEPLOY.md** ⚡
**Best for**: Experienced developers who want quick commands
- Command reference
- No explanations
- Copy-paste ready

### 2. **DEPLOYMENT_GUIDE.md** 📖
**Best for**: First-time deployers who want detailed instructions
- Step-by-step guide
- Explanations for each step
- Troubleshooting section
- Architecture diagrams

### 3. **DEPLOYMENT_CHECKLIST.md** ✅
**Best for**: Tracking your progress
- Interactive checklist
- Track what's done
- Note important values
- Verification steps

### 4. **SETUP_GUIDE.md** 🔧
**Best for**: Complete setup from scratch
- Prerequisites installation
- AWS account setup
- Local environment configuration
- Testing instructions

## 🎯 Quick Start (3 Steps)

### Step 1: Verify Prerequisites
```powershell
node --version    # Need v18+
aws --version     # Need aws-cli/2.x
cdk --version     # Need 2.x
aws sts get-caller-identity  # Verify AWS access
```

### Step 2: One-Time AWS Setup
```powershell
# Set up API Gateway logging (required once per account)
aws iam create-role --role-name APIGatewayCloudWatchLogsRole --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy --role-name APIGatewayCloudWatchLogsRole --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"

# Get your account ID
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)

# Configure API Gateway
aws apigateway update-account --patch-operations op=replace,path=/cloudwatchRoleArn,value=arn:aws:iam::${ACCOUNT_ID}:role/APIGatewayCloudWatchLogsRole
```

### Step 3: Deploy
```powershell
# Build and deploy backend
npm install
npm run build
npm test
cdk deploy --require-approval never

# Save the outputs (ApiEndpoint, UserPoolId, UserPoolClientId)

# Enable Bedrock in AWS Console:
# AWS Console → Bedrock → Model access → Enable "Amazon Nova Sonic"

# Configure and run frontend
cd .kiro/specs/content-quality-reviewer/frontend
# Create .env file with your deployment outputs
npm install
npm run dev

# Open http://localhost:5173/
```

## 🆘 Need Help?

### Common Issues

| Problem | Solution |
|---------|----------|
| "CloudWatch Logs role ARN must be set" | Complete Step 2 above |
| "Resource already exists" | See DEPLOYMENT_GUIDE.md → Troubleshooting |
| "Access Denied" | Check AWS credentials: `aws configure` |
| Bedrock errors | Enable model access in AWS Console |
| Frontend won't connect | Verify `.env` file values |

### Where to Get Help

1. **DEPLOYMENT_GUIDE.md** - Full troubleshooting section
2. **CloudWatch Logs** - Check Lambda function logs
3. **Browser Console** - Check for frontend errors
4. **AWS Console** - Verify resources are created

## 📁 Project Structure

```
E:\AWS\
├── lambda/                          # Backend Lambda functions
│   ├── orchestrator/               # Main analysis orchestrator
│   ├── api/                        # API endpoint handlers
│   ├── analyzers/                  # Content analyzers
│   ├── bedrock/                    # Bedrock integration
│   └── storage/                    # DynamoDB operations
├── lib/                            # CDK infrastructure code
├── test/                           # Unit tests
├── .kiro/specs/content-quality-reviewer/
│   └── frontend/                   # React frontend app
├── DEPLOYMENT_GUIDE.md             # Detailed deployment guide
├── QUICK_DEPLOY.md                 # Quick command reference
├── DEPLOYMENT_CHECKLIST.md         # Progress tracker
├── START_HERE.md                   # This file
└── trust-policy.json               # IAM trust policy
```

## 💰 Cost Estimate

With AWS Free Tier:
- **DynamoDB**: Free (25 GB, 25 WCU, 25 RCU)
- **Lambda**: Free (1M requests/month)
- **API Gateway**: Free (1M requests/month)
- **Cognito**: Free (50,000 MAUs)
- **Bedrock Nova Sonic**: ~$0.0004 per 1K tokens
- **Comprehend**: $0.0001 per unit (50K free)

**Estimated cost for testing**: $0-5/month

## 🎓 What You'll Learn

By deploying this project, you'll gain hands-on experience with:
- ✅ AWS CDK for infrastructure as code
- ✅ Serverless architecture with Lambda
- ✅ API Gateway with Cognito authentication
- ✅ DynamoDB NoSQL database
- ✅ Amazon Bedrock AI integration
- ✅ React frontend with AWS Amplify
- ✅ CloudWatch logging and monitoring

## 🔄 Deployment Workflow

```
┌─────────────────┐
│ 1. Prerequisites│
│    Verify       │
└────────┬────────┘
         │
┌────────▼────────┐
│ 2. One-Time     │
│    AWS Setup    │
└────────┬────────┘
         │
┌────────▼────────┐
│ 3. Build &      │
│    Test         │
└────────┬────────┘
         │
┌────────▼────────┐
│ 4. Deploy       │
│    Backend      │
└────────┬────────┘
         │
┌────────▼────────┐
│ 5. Enable       │
│    Bedrock      │
└────────┬────────┘
         │
┌────────▼────────┐
│ 6. Configure    │
│    Frontend     │
└────────┬────────┘
         │
┌────────▼────────┐
│ 7. Test         │
│    Application  │
└─────────────────┘
```

## ✅ Success Criteria

You'll know deployment is successful when:
- ✅ `cdk deploy` completes without errors
- ✅ You receive deployment outputs (API endpoint, User Pool ID, etc.)
- ✅ Frontend loads at `http://localhost:5173/`
- ✅ You can sign up and log in
- ✅ Content analysis returns results
- ✅ History page shows past analyses

## 🧹 Clean Up

When you're done testing:
```powershell
# Destroy all AWS resources
cdk destroy

# Delete retained resources
aws dynamodb delete-table --table-name ContentAnalysisResults
aws cognito-idp delete-user-pool --user-pool-id us-east-1_xxxxx
```

## 📞 Support

If you get stuck:
1. Check **DEPLOYMENT_GUIDE.md** troubleshooting section
2. Review CloudWatch Logs for errors
3. Verify all prerequisites are met
4. Check AWS Console for resource status

---

## 🎯 Ready to Deploy?

Choose your path:

**Option A: Quick Deploy** (experienced users)
→ Open **QUICK_DEPLOY.md**

**Option B: Guided Deploy** (first-time users)
→ Open **DEPLOYMENT_GUIDE.md**

**Option C: Track Progress** (organized approach)
→ Open **DEPLOYMENT_CHECKLIST.md**

---

**Good luck with your deployment! 🚀**

*Estimated deployment time: 30-45 minutes*
