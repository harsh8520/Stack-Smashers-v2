# Content Quality Reviewer - Complete Implementation Guide

## 🏗️ Architecture Overview

This project uses the following AWS services:
- **Lambda**: Serverless compute for backend logic
- **API Gateway (REST)**: RESTful API endpoints
- **Cognito**: User authentication and authorization
- **Bedrock (Nova Sonic)**: AI-powered content analysis
- **DynamoDB**: NoSQL database for storing analysis results
- **Amplify**: Frontend hosting and deployment
- **React**: Frontend framework

## 📋 Prerequisites

Before starting, ensure you have:
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Node.js 20.x installed
- npm or yarn package manager
- Git installed
- AWS CDK CLI installed: `npm install -g aws-cdk`

## 🚀 Step-by-Step Implementation

---

## Phase 1: AWS Account Setup

### Step 1.1: Configure AWS CLI
```bash
# Configure AWS credentials
aws configure

# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

### Step 1.2: Enable Amazon Bedrock Model Access
1. Go to AWS Console → Amazon Bedrock
2. Navigate to "Model access" in the left sidebar
3. Click "Manage model access"
4. Enable access to:
   - **Amazon Nova Sonic** (us.amazon.nova-sonic-v1:0) - Fast, cost-effective
   - **Amazon Nova Lite** (us.amazon.nova-lite-v1:0) - Backup option
5. Click "Save changes"
6. Wait for access to be granted (usually instant)

---

## Phase 2: Backend Infrastructure Setup

### Step 2.1: Bootstrap CDK (First Time Only)
```bash
# Bootstrap CDK in your AWS account
cdk bootstrap aws://ACCOUNT-ID/REGION

# Example:
cdk bootstrap aws://123456789012/us-east-1
```

### Step 2.2: Install Backend Dependencies
```bash
# Install project dependencies
npm install

# Install Lambda layer dependencies
cd lambda
npm install
cd ..
```

### Step 2.3: Update Bedrock Model to Nova Sonic
The code is already configured to use Nova models. Verify in:
- `lambda/bedrock/bedrock-client.ts` - MODEL_ID should be configurable
- `lib/content-reviewer-stack.ts` - Environment variable set

### Step 2.4: Deploy Backend Infrastructure
```bash
# Synthesize CloudFormation template (optional - to preview)
cdk synth

# Deploy the stack
cdk deploy

# Confirm deployment when prompted
# This will create:
# - DynamoDB tables
# - Lambda functions
# - API Gateway
# - Cognito User Pool
# - IAM roles and policies
```

### Step 2.5: Save Output Values
After deployment, save these outputs (displayed in terminal):
```
Outputs:
ContentReviewerStack.ApiEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
ContentReviewerStack.UserPoolId = us-east-1_xxxxxxxxx
ContentReviewerStack.UserPoolClientId = xxxxxxxxxxxxxxxxxxxxxxxxxx
ContentReviewerStack.TableName = ContentAnalysisResults
```

---

## Phase 3: Cognito User Pool Setup

### Step 3.1: Create Cognito User Pool (via CDK)
The CDK stack will create this automatically. If you need to do it manually:

1. Go to AWS Console → Cognito
2. Click "Create user pool"
3. Configure:
   - Sign-in options: Email
   - Password policy: Default
   - MFA: Optional
   - User account recovery: Email only
4. Configure app client:
   - App type: Public client
   - Authentication flows: ALLOW_USER_PASSWORD_AUTH, ALLOW_REFRESH_TOKEN_AUTH
5. Create pool

### Step 3.2: Create Test User
```bash
# Create a test user via AWS CLI
aws cognito-idp admin-create-user \
  --user-pool-id us-east-1_xxxxxxxxx \
  --username testuser@example.com \
  --user-attributes Name=email,Value=testuser@example.com \
  --temporary-password TempPassword123! \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_xxxxxxxxx \
  --username testuser@example.com \
  --password MySecurePassword123! \
  --permanent
```

---

## Phase 4: Frontend Setup

### Step 4.1: Navigate to Frontend Directory
```bash
cd .kiro/specs/content-quality-reviewer/frontend
```

### Step 4.2: Install Frontend Dependencies
```bash
npm install

# Install additional required packages
npm install aws-amplify @aws-amplify/ui-react
```

### Step 4.3: Configure Amplify
Create `src/aws-exports.js`:
```javascript
const awsconfig = {
  aws_project_region: 'us-east-1',
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_xxxxxxxxx', // From CDK output
  aws_user_pools_web_client_id: 'xxxxxxxxxxxxxxxxxxxxxxxxxx', // From CDK output
  aws_cloud_logic_custom: [
    {
      name: 'ContentReviewerAPI',
      endpoint: 'https://xxxxx.execute-api.us-east-1.amazonaws.com/prod', // From CDK output
      region: 'us-east-1'
    }
  ]
};

export default awsconfig;
```

### Step 4.4: Update Frontend Code to Use Cognito
Update `src/main.tsx` or `src/App.tsx`:
```typescript
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>Welcome {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
          {/* Your app content */}
        </div>
      )}
    </Authenticator>
  );
}
```

### Step 4.5: Create API Service
Create `src/services/api.ts`:
```typescript
import { API } from 'aws-amplify';

export interface AnalyzeRequest {
  content: string;
  targetPlatform: 'blog' | 'linkedin' | 'twitter' | 'medium';
  contentIntent: 'inform' | 'educate' | 'persuade';
}

export async function analyzeContent(request: AnalyzeRequest) {
  try {
    const response = await API.post('ContentReviewerAPI', '/analyze', {
      body: request
    });
    return response;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

export async function getAnalysisById(analysisId: string) {
  try {
    const response = await API.get('ContentReviewerAPI', `/analysis/${analysisId}`, {});
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function getUserHistory(userId: string) {
  try {
    const response = await API.get('ContentReviewerAPI', '/history', {
      queryStringParameters: { userId }
    });
    return response;
  } catch (error) {
    console.error('History error:', error);
    throw error;
  }
}
```

### Step 4.6: Test Frontend Locally
```bash
npm run dev

# Open browser to http://localhost:5173
# You should see Cognito login screen
```

---

## Phase 5: Amplify Deployment

### Step 5.1: Initialize Amplify Hosting
```bash
# Install Amplify CLI (if not already installed)
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in your project
cd .kiro/specs/content-quality-reviewer/frontend
amplify init

# Follow prompts:
# - Enter a name for the project: content-reviewer-frontend
# - Enter a name for the environment: prod
# - Choose your default editor: Visual Studio Code
# - Choose the type of app: javascript
# - Framework: react
# - Source Directory Path: src
# - Distribution Directory Path: dist
# - Build Command: npm run build
# - Start Command: npm run dev
```

### Step 5.2: Add Hosting
```bash
# Add hosting with Amplify Console
amplify add hosting

# Choose:
# - Hosting with Amplify Console (Managed hosting with custom domains, Continuous deployment)
# - Manual deployment

# Publish the app
amplify publish
```

### Step 5.3: Configure Continuous Deployment (Optional)
1. Go to AWS Console → Amplify
2. Select your app
3. Click "Connect repository"
4. Choose your Git provider (GitHub, GitLab, etc.)
5. Select repository and branch
6. Configure build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd .kiro/specs/content-quality-reviewer/frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .kiro/specs/content-quality-reviewer/frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## Phase 6: Integration & Testing

### Step 6.1: Update CDK Stack with Cognito Integration
The stack needs to be updated to use Cognito authorizer instead of API keys.

Update `lib/content-reviewer-stack.ts`:
```typescript
// Add Cognito User Pool
const userPool = new cognito.UserPool(this, 'ContentReviewerUserPool', {
  userPoolName: 'content-reviewer-users',
  selfSignUpEnabled: true,
  signInAliases: {
    email: true,
  },
  autoVerify: {
    email: true,
  },
  passwordPolicy: {
    minLength: 8,
    requireLowercase: true,
    requireUppercase: true,
    requireDigits: true,
    requireSymbols: false,
  },
  accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
  removalPolicy: cdk.RemovalPolicy.RETAIN,
});

// Add User Pool Client
const userPoolClient = userPool.addClient('ContentReviewerClient', {
  authFlows: {
    userPassword: true,
    userSrp: true,
  },
  oAuth: {
    flows: {
      authorizationCodeGrant: true,
    },
    scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
  },
});

// Create Cognito Authorizer for API Gateway
const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
  cognitoUserPools: [userPool],
  authorizerName: 'ContentReviewerCognitoAuthorizer',
  identitySource: 'method.request.header.Authorization',
});

// Update API methods to use Cognito authorizer
analyzeResource.addMethod('POST', new apigateway.LambdaIntegration(orchestratorFunction), {
  authorizer: authorizer,
  authorizationType: apigateway.AuthorizationType.COGNITO,
});
```

### Step 6.2: Redeploy Backend
```bash
# Redeploy with Cognito integration
cdk deploy
```

### Step 6.3: Test End-to-End Flow

#### Test 1: User Authentication
1. Open your Amplify-hosted frontend URL
2. Sign up with a new account
3. Verify email
4. Sign in

#### Test 2: Content Analysis
1. After signing in, navigate to analysis page
2. Enter sample content:
```
Artificial intelligence is transforming how we work and live. 
Machine learning algorithms can now process vast amounts of data 
to identify patterns and make predictions. This technology has 
applications in healthcare, finance, and many other industries.
```
3. Select platform: "blog"
4. Select intent: "inform"
5. Click "Analyze"
6. Verify you receive analysis results with scores

#### Test 3: History Retrieval
1. Navigate to history page
2. Verify previous analyses are displayed
3. Click on an analysis to view details

---

## Phase 7: Monitoring & Optimization

### Step 7.1: Enable CloudWatch Monitoring
```bash
# View Lambda logs
aws logs tail /aws/lambda/ContentReviewerStack-OrchestratorFunction --follow

# View API Gateway logs
aws logs tail /aws/apigateway/ContentReviewerApi --follow
```

### Step 7.2: Set Up CloudWatch Alarms
```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name content-reviewer-lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

### Step 7.3: Monitor Bedrock Usage
1. Go to AWS Console → Bedrock
2. Navigate to "Usage" tab
3. Monitor:
   - Number of requests
   - Token usage
   - Costs

---

## Phase 8: Production Optimization

### Step 8.1: Enable Caching
Update API Gateway to cache responses:
```typescript
// In CDK stack
api.deploymentStage.addMethodOptions('/*/*', {
  cachingEnabled: true,
  cacheTtl: cdk.Duration.minutes(5),
});
```

### Step 8.2: Configure Auto-Scaling
DynamoDB is already set to on-demand mode, which auto-scales.

### Step 8.3: Set Up Custom Domain (Optional)
```bash
# Request SSL certificate
aws acm request-certificate \
  --domain-name api.yourdomain.com \
  --validation-method DNS

# Add custom domain to API Gateway
# (Do this via CDK or Console)
```

---

## 🔧 Configuration Files

### Environment Variables (.env)
Create `.env` file in frontend:
```env
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

### CDK Context (cdk.context.json)
```json
{
  "aws:region": "us-east-1",
  "environment": "production",
  "bedrockModel": "us.amazon.nova-sonic-v1:0"
}
```

---

## 📊 Cost Estimation

### Monthly Costs (1000 analyses/month):
- **Lambda**: ~$5 (compute time)
- **API Gateway**: ~$3.50 (API calls)
- **DynamoDB**: ~$2 (on-demand reads/writes)
- **Bedrock (Nova Sonic)**: ~$3-5 (faster, cheaper than Lite)
- **Cognito**: Free tier (up to 50,000 MAUs)
- **Amplify Hosting**: ~$0.15/GB + $0.01/build minute
- **CloudWatch**: ~$5 (logs and metrics)

**Total Estimated Cost**: ~$18-20/month

---

## 🐛 Troubleshooting

### Issue: Bedrock Access Denied
**Solution**: Ensure model access is enabled in Bedrock console

### Issue: Cognito Authentication Fails
**Solution**: 
- Verify User Pool ID and Client ID in aws-exports.js
- Check CORS settings in API Gateway
- Ensure Authorization header is being sent

### Issue: Lambda Timeout
**Solution**: 
- Increase Lambda timeout in CDK (currently 30s)
- Optimize Bedrock prompt length
- Consider using Nova Sonic for faster responses

### Issue: CORS Errors
**Solution**: 
- Verify CORS is enabled in API Gateway
- Check allowed origins include your Amplify domain
- Ensure preflight OPTIONS requests are handled

---

## 📚 Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [React Documentation](https://react.dev/)

---

## 🎯 Next Steps

1. ✅ Complete backend implementation
2. ✅ Set up Cognito authentication
3. ✅ Deploy infrastructure with CDK
4. ✅ Configure frontend with Amplify
5. ✅ Deploy frontend to Amplify Hosting
6. ✅ Test end-to-end flow
7. ⏭️ Add monitoring and alerts
8. ⏭️ Optimize for production
9. ⏭️ Set up CI/CD pipeline

---

## 📞 Support

For issues or questions:
1. Check CloudWatch logs
2. Review CDK deployment outputs
3. Verify AWS service quotas
4. Check IAM permissions

---

**Last Updated**: 2024-03-06
**Version**: 1.0.0
