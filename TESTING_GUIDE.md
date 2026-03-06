# Testing Guide - Content Quality Reviewer

This guide explains how to test and use the components built so far.

## What's Been Built

So far, we've implemented:

1. ✅ **Project Infrastructure** (Task 1)
   - TypeScript/Node.js setup
   - AWS CDK infrastructure
   - Jest testing framework
   - ESLint configuration

2. ✅ **API Gateway & Authentication** (Task 2)
   - API Gateway with CORS
   - API Key authentication
   - Rate limiting (10 req/min)
   - Lambda authorizer

3. ✅ **DynamoDB Storage Layer** (Task 3)
   - Storage service module
   - Analysis result storage
   - History retrieval
   - UUID generation

4. ✅ **Amazon Bedrock Integration** (Task 5)
   - Prompt template module
   - Bedrock client with retry logic
   - Error handling and fallback

5. ✅ **AWS Comprehend Integration** (Task 6)
   - Sentiment analysis
   - Key phrase extraction
   - Syntax analysis

## Prerequisites

Before testing, ensure you have:

1. **Node.js 20.x or later** installed
2. **AWS CLI** configured with credentials
3. **AWS CDK CLI** installed globally:
   ```bash
   npm install -g aws-cdk
   ```
4. **AWS Account** with permissions for:
   - Lambda
   - API Gateway
   - DynamoDB
   - Bedrock (Amazon Nova Lite access)
   - Comprehend
   - Secrets Manager

## Setup Instructions

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies (if testing frontend)
cd .kiro/specs/content-quality-reviewer/frontend
npm install
cd ../../../..
```

### 2. Configure AWS Credentials

```bash
# Configure AWS CLI (if not already done)
aws configure

# Verify credentials
aws sts get-caller-identity
```

### 3. Request Bedrock Model Access

1. Go to AWS Console → Amazon Bedrock
2. Navigate to "Model access"
3. Request access to "Amazon Nova Lite" (or "Amazon Nova Pro" for higher quality)
4. Wait for approval (usually instant)

### 4. Bootstrap CDK (First Time Only)

```bash
# Bootstrap CDK in your AWS account/region
cdk bootstrap
```

## Testing Options

### Option 1: Run Unit Tests (No AWS Required)

Test the code logic without deploying to AWS:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- storage-service.test.ts
```

**What this tests:**
- Storage service functions (with mocked DynamoDB)
- Prompt template construction
- Input validation
- UUID generation
- Error handling logic

### Option 2: Deploy to AWS and Test Live

Deploy the infrastructure and test with real AWS services:

#### Step 1: Synthesize CloudFormation Template

```bash
# Generate CloudFormation template (no deployment)
npm run synth
```

This validates your CDK code without deploying.

#### Step 2: Deploy to AWS

```bash
# Deploy the stack
npm run deploy

# Or use CDK directly
cdk deploy
```

**What gets deployed:**
- DynamoDB tables (ContentAnalysisResults, RateLimits)
- API Gateway REST API
- Lambda functions (Auth, etc.)
- Secrets Manager secret for API keys
- IAM roles and policies

**Expected output:**
```
✅ ContentReviewerStack

Outputs:
ContentReviewerStack.ApiEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
ContentReviewerStack.ApiKeyId = xxxxx
ContentReviewerStack.TableName = ContentAnalysisResults
ContentReviewerStack.ApiKeySecretArn = arn:aws:secretsmanager:...
```

#### Step 3: Configure API Key

After deployment, you need to add valid API keys to Secrets Manager:

```bash
# Get the secret name from outputs
SECRET_NAME="content-reviewer/api-keys"

# Update the secret with API keys
aws secretsmanager put-secret-value \
  --secret-id $SECRET_NAME \
  --secret-string '{"keys":["your-test-api-key-here"]}'
```

#### Step 4: Test the API

**Test Authentication:**

```bash
# Get your API endpoint from CDK outputs
API_ENDPOINT="https://xxxxx.execute-api.us-east-1.amazonaws.com/prod"

# Test with valid API key
curl -X POST $API_ENDPOINT/analyze \
  -H "x-api-key: your-test-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test article about technology.",
    "targetPlatform": "blog",
    "contentIntent": "inform"
  }'

# Test with invalid API key (should return 401)
curl -X POST $API_ENDPOINT/analyze \
  -H "x-api-key: invalid-key" \
  -H "Content-Type: application/json"
```

### Option 3: Test Individual Modules Locally

You can test individual modules without full deployment:

#### Test Storage Service

```bash
# Run storage service tests
npm test -- storage-service.test.ts
```

#### Test Prompt Template

Create a test file `test-prompt.ts`:

```typescript
import { constructBedrockPrompt, validatePromptInput, countWords } from './lambda/bedrock/prompt-template';

const input = {
  content: 'This is a test article about AI and machine learning.',
  targetPlatform: 'blog' as const,
  contentIntent: 'inform' as const,
  wordCount: 10,
};

// Test prompt construction
const prompt = constructBedrockPrompt(input);
console.log('Generated Prompt:', prompt);

// Test validation
const validation = validatePromptInput(input);
console.log('Validation:', validation);

// Test word counting
const words = countWords(input.content);
console.log('Word count:', words);
```

Run it:
```bash
npx ts-node test-prompt.ts
```

#### Test Comprehend Service (Requires AWS)

Create a test file `test-comprehend.ts`:

```typescript
import { analyzeSentiment, extractKeyPhrases } from './lambda/comprehend/comprehend-service';

async function testComprehend() {
  const content = 'This is an amazing article about technology. It provides great insights.';
  
  try {
    const sentiment = await analyzeSentiment(content);
    console.log('Sentiment:', sentiment);
    
    const keyPhrases = await extractKeyPhrases(content);
    console.log('Key Phrases:', keyPhrases);
  } catch (error) {
    console.error('Error:', error);
  }
}

testComprehend();
```

Run it:
```bash
npx ts-node test-comprehend.ts
```

## Testing the Frontend

The frontend is already built and can be tested:

```bash
# Navigate to frontend directory
cd .kiro/specs/content-quality-reviewer/frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

**Current Frontend Status:**
- ✅ UI components built
- ✅ Mock data for testing
- ❌ Not yet connected to backend API (Task 17)

## Common Issues and Solutions

### Issue 1: CDK Bootstrap Error

**Error:** "This stack uses assets, so the toolkit stack must be deployed"

**Solution:**
```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Issue 2: Bedrock Access Denied

**Error:** "AccessDeniedException: Could not access model"

**Solution:**
1. Go to AWS Console → Bedrock → Model access
2. Request access to Amazon Nova Lite (or Nova Pro)
3. Wait for approval

### Issue 3: Lambda Timeout

**Error:** "Task timed out after 30.00 seconds"

**Solution:**
- Bedrock calls can be slow
- Increase Lambda timeout in CDK stack if needed
- Check Bedrock region availability

### Issue 4: DynamoDB Access Denied

**Error:** "User is not authorized to perform: dynamodb:PutItem"

**Solution:**
- Ensure Lambda execution role has DynamoDB permissions
- Check CDK stack IAM policies

### Issue 5: Rate Limiting

**Error:** "Too Many Requests"

**Solution:**
- Wait 1 minute between requests
- Current limit: 10 requests per minute per API key
- Adjust in CDK stack if needed

## Monitoring and Debugging

### View Lambda Logs

```bash
# List log groups
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/ContentReviewer

# Tail logs for a specific function
aws logs tail /aws/lambda/ContentReviewerStack-AuthFunction --follow
```

### Check DynamoDB Tables

```bash
# List tables
aws dynamodb list-tables

# Scan analysis results
aws dynamodb scan --table-name ContentAnalysisResults --max-items 5

# Check rate limit records
aws dynamodb scan --table-name ContentReviewerRateLimits --max-items 5
```

### View API Gateway Logs

1. Go to AWS Console → API Gateway
2. Select your API
3. Go to Stages → prod → Logs/Tracing
4. Enable CloudWatch Logs

## Next Steps

To complete the system, you need to:

1. **Complete Backend** (Tasks 7-16)
   - Implement content analyzers
   - Create orchestrator Lambda
   - Implement API endpoints
   - Add monitoring

2. **Integrate Frontend** (Task 17)
   - Create API client
   - Connect Dashboard to backend
   - Update ResultsDashboard
   - Add error handling

3. **Deploy and Test** (Tasks 18-19)
   - End-to-end testing
   - Documentation
   - Production deployment

## Cost Estimates

Running this system will incur AWS costs:

- **Lambda**: ~$0.20 per 1M requests
- **API Gateway**: ~$3.50 per 1M requests
- **DynamoDB**: ~$1.25 per 1M writes (on-demand)
- **Bedrock**: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
- **Comprehend**: ~$0.0001 per unit (100 chars)

**Estimated cost for 1000 analyses:** ~$5-10

## Support

If you encounter issues:

1. Check CloudWatch Logs for error details
2. Verify AWS credentials and permissions
3. Ensure Bedrock model access is approved
4. Check the TROUBLESHOOTING section in README.md

## Clean Up

To avoid ongoing costs, destroy the stack when done testing:

```bash
# Destroy all resources
cdk destroy

# Confirm deletion
# Note: DynamoDB tables with RETAIN policy won't be deleted
```

To delete retained resources:
```bash
aws dynamodb delete-table --table-name ContentAnalysisResults
```
