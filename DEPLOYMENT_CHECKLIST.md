# Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment Checks

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS CDK installed (`cdk --version`)
- [ ] AWS credentials configured (`aws sts get-caller-identity`)
- [ ] AWS Account ID noted: ________________

## One-Time AWS Account Setup

- [ ] API Gateway CloudWatch Logs role created
  ```powershell
  aws iam create-role --role-name APIGatewayCloudWatchLogsRole --assume-role-policy-document file://trust-policy.json
  ```

- [ ] CloudWatch Logs policy attached
  ```powershell
  aws iam attach-role-policy --role-name APIGatewayCloudWatchLogsRole --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
  ```

- [ ] API Gateway account settings configured
  ```powershell
  aws apigateway update-account --patch-operations op=replace,path=/cloudwatchRoleArn,value=arn:aws:iam::YOUR_ACCOUNT_ID:role/APIGatewayCloudWatchLogsRole
  ```

- [ ] CDK bootstrapped (if first time)
  ```powershell
  cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
  ```

## Clean Up Existing Resources (If Needed)

- [ ] Deleted existing DynamoDB table (if exists)
  ```powershell
  aws dynamodb delete-table --table-name ContentAnalysisResults
  ```

- [ ] Deleted existing Cognito User Pool (if exists)
  ```powershell
  aws cognito-idp delete-user-pool --user-pool-id us-east-1_xxxxx
  ```

- [ ] Waited 30 seconds for deletion to complete

## Backend Deployment

- [ ] Dependencies installed
  ```powershell
  npm install
  ```

- [ ] TypeScript compiled successfully
  ```powershell
  npm run build
  ```

- [ ] All tests passing (47/47)
  ```powershell
  npm test
  ```

- [ ] CDK stack deployed
  ```powershell
  cdk deploy --require-approval never
  ```

- [ ] Deployment outputs saved:
  - [ ] ApiEndpoint: _______________________________________________
  - [ ] UserPoolId: _______________________________________________
  - [ ] UserPoolClientId: _________________________________________
  - [ ] Region: us-east-1

## Bedrock Configuration

- [ ] Logged into AWS Console
- [ ] Navigated to Amazon Bedrock service
- [ ] Clicked "Model access" in sidebar
- [ ] Clicked "Manage model access"
- [ ] Enabled "Amazon Nova Sonic" (us.amazon.nova-sonic-v1:0)
- [ ] Clicked "Request model access"
- [ ] Access approved (usually instant)

## Frontend Configuration

- [ ] Navigated to frontend directory
  ```powershell
  cd .kiro/specs/content-quality-reviewer/frontend
  ```

- [ ] Created `.env` file with deployment outputs:
  ```env
  VITE_AWS_REGION=us-east-1
  VITE_USER_POOL_ID=us-east-1_xxxxx
  VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxx
  VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
  ```

- [ ] Frontend dependencies installed
  ```powershell
  npm install
  ```

- [ ] Development server started
  ```powershell
  npm run dev
  ```

- [ ] Frontend accessible at `http://localhost:5173/`

## Application Testing

- [ ] Opened browser to `http://localhost:5173/`
- [ ] Clicked "Sign Up"
- [ ] Created account with email and password
- [ ] Received verification email
- [ ] Entered verification code
- [ ] Logged in successfully
- [ ] Tested content analysis:
  - [ ] Pasted sample text
  - [ ] Selected platform (e.g., "Blog")
  - [ ] Selected intent (e.g., "Inform")
  - [ ] Clicked "Analyze Content"
  - [ ] Received analysis results (10-30 seconds)
  - [ ] Viewed scores and suggestions
- [ ] Checked history page
- [ ] Logged out and logged back in

## Verification

- [ ] Backend API responding (check CloudWatch Logs)
- [ ] DynamoDB tables created and accessible
- [ ] Cognito User Pool working
- [ ] Bedrock API calls successful
- [ ] Frontend connecting to backend
- [ ] Authentication working
- [ ] Content analysis working
- [ ] History retrieval working

## Post-Deployment

- [ ] Documented API endpoint for team
- [ ] Saved Cognito User Pool details
- [ ] Noted AWS resource names
- [ ] Reviewed CloudWatch Logs for errors
- [ ] Checked AWS billing dashboard
- [ ] Set up CloudWatch alarms (optional)
- [ ] Created backup of `.env` file (securely)

## Troubleshooting (If Issues Occur)

- [ ] Checked CloudWatch Logs for Lambda errors
- [ ] Verified `.env` file values are correct
- [ ] Confirmed Bedrock model access is enabled
- [ ] Tested API endpoint with curl
- [ ] Checked browser console for errors
- [ ] Verified AWS credentials are valid
- [ ] Reviewed deployment outputs match `.env`

## Clean Up (When Done Testing)

- [ ] Destroyed CDK stack
  ```powershell
  cdk destroy
  ```

- [ ] Deleted retained DynamoDB table
  ```powershell
  aws dynamodb delete-table --table-name ContentAnalysisResults
  ```

- [ ] Deleted Cognito User Pool
  ```powershell
  aws cognito-idp delete-user-pool --user-pool-id us-east-1_xxxxx
  ```

- [ ] Verified no unexpected AWS charges

---

## Deployment Status

**Date Started**: _______________

**Date Completed**: _______________

**Deployed By**: _______________

**Status**: 
- [ ] ✅ Successfully Deployed
- [ ] ⚠️ Partially Deployed (issues noted below)
- [ ] ❌ Deployment Failed (see troubleshooting)

**Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

## Quick Reference

**AWS Account ID**: _______________

**API Endpoint**: _______________________________________________

**User Pool ID**: _______________________________________________

**User Pool Client ID**: _________________________________________

**Frontend URL**: http://localhost:5173/

**CloudWatch Log Groups**:
- `/aws/lambda/ContentReviewerStack-OrchestratorFunction`
- `/aws/lambda/ContentReviewerStack-GetAnalysisFunction`
- `/aws/lambda/ContentReviewerStack-HistoryFunction`

---

**Estimated Time**: 30-45 minutes for first deployment
