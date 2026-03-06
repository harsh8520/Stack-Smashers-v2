# Quick Deployment Reference

## Prerequisites
```powershell
# Verify installations
node --version        # Should be v18+
npm --version         # Should be 8+
aws --version         # Should be aws-cli/2.x
cdk --version         # Should be 2.x
aws sts get-caller-identity  # Verify AWS credentials
```

## One-Time Setup (First Deployment)

### 1. Set Up API Gateway Logging
```powershell
# Create trust policy file (already exists: trust-policy.json)
aws iam create-role --role-name APIGatewayCloudWatchLogsRole --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy --role-name APIGatewayCloudWatchLogsRole --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"

# Get your account ID
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)

# Configure API Gateway
aws apigateway update-account --patch-operations op=replace,path=/cloudwatchRoleArn,value=arn:aws:iam::${ACCOUNT_ID}:role/APIGatewayCloudWatchLogsRole
```

### 2. Bootstrap CDK (if not done)
```powershell
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
cdk bootstrap aws://${ACCOUNT_ID}/us-east-1
```

## Deploy Backend

```powershell
# Build and test
npm install
npm run build
npm test

# Deploy to AWS
cdk deploy --require-approval never
```

**Save the outputs!** You'll need:
- ApiEndpoint
- UserPoolId
- UserPoolClientId

## Enable Bedrock Access

1. AWS Console → **Amazon Bedrock** → **Model access**
2. Click **Manage model access**
3. Enable **Amazon Nova Sonic** (us.amazon.nova-sonic-v1:0)
4. Click **Request model access**

## Configure Frontend

```powershell
cd .kiro/specs/content-quality-reviewer/frontend

# Create .env file with your values:
# VITE_AWS_REGION=us-east-1
# VITE_USER_POOL_ID=us-east-1_xxxxx
# VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxx
# VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod

npm install
npm run dev
```

Open `http://localhost:5173/`

## Clean Up Existing Resources (If Needed)

```powershell
# Delete DynamoDB table
aws dynamodb delete-table --table-name ContentAnalysisResults

# Delete Cognito User Pool (get ID first)
aws cognito-idp list-user-pools --max-results 10
aws cognito-idp delete-user-pool --user-pool-id us-east-1_xxxxx

# Wait 30 seconds
Start-Sleep -Seconds 30
```

## Destroy Everything

```powershell
# Destroy CDK stack
cdk destroy

# Delete retained resources
aws dynamodb delete-table --table-name ContentAnalysisResults
aws cognito-idp delete-user-pool --user-pool-id us-east-1_xxxxx
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "CloudWatch Logs role ARN must be set" | Run the API Gateway logging setup (Step 1) |
| "Resource already exists" | Delete existing resources (see Clean Up section) |
| "Access Denied" | Verify AWS credentials and IAM permissions |
| Bedrock errors | Enable model access in AWS Console |
| Frontend can't connect | Check `.env` file has correct values |

## Useful Commands

```powershell
# Check deployment status
aws cloudformation describe-stacks --stack-name ContentReviewerStack --query "Stacks[0].StackStatus"

# View stack outputs
aws cloudformation describe-stacks --stack-name ContentReviewerStack --query "Stacks[0].Outputs"

# List Lambda functions
aws lambda list-functions --query "Functions[?contains(FunctionName, 'ContentReviewer')]"

# View CloudWatch logs
aws logs tail /aws/lambda/ContentReviewerStack-OrchestratorFunction --follow

# Test API endpoint
curl https://your-api-endpoint/prod/analyze
```

## File Locations

- **Backend Code**: `lambda/`
- **Infrastructure**: `lib/content-reviewer-stack.ts`
- **Frontend**: `.kiro/specs/content-quality-reviewer/frontend/`
- **Tests**: `test/`
- **Deployment Outputs**: Check terminal after `cdk deploy`

## Support Files

- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `SETUP_GUIDE.md` - Complete setup instructions
- `README.md` - Project overview
- `trust-policy.json` - IAM trust policy for API Gateway
- `setup-apigateway-logging.ps1` - Automated setup script

---

**Quick Start**: Run these commands in order:
1. `npm install && npm run build && npm test`
2. Set up API Gateway logging (one-time)
3. `cdk deploy --require-approval never`
4. Enable Bedrock model access
5. Configure frontend `.env`
6. `cd .kiro/specs/content-quality-reviewer/frontend && npm run dev`
