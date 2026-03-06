# AI-Powered Content Quality Reviewer

An intelligent content analysis system that helps student creators improve their digital content quality before publishing. Built with AWS serverless architecture, Amazon Bedrock (Nova Sonic), and React.

## 🏗️ Architecture

- **Frontend**: React + Vite + AWS Amplify
- **Backend**: AWS Lambda + API Gateway (REST)
- **Authentication**: Amazon Cognito
- **AI Analysis**: Amazon Bedrock (Nova Sonic)
- **Database**: Amazon DynamoDB
- **NLP**: Amazon Comprehend
- **Deployment**: AWS CDK + Amplify Hosting

## ✨ Features

- **Multi-Dimensional Analysis**
  - Structure & Organization
  - Tone & Voice
  - Accessibility & Readability
  - Platform-Specific Optimization

- **AI-Powered Insights**
  - Amazon Nova Sonic for fast, cost-effective analysis
  - AWS Comprehend for sentiment and NLP
  - Custom analyzers for detailed feedback

- **Platform Support**
  - Blog posts
  - LinkedIn articles
  - Twitter/X posts
  - Medium stories

- **User Features**
  - Secure authentication with Cognito
  - Analysis history tracking
  - Real-time feedback
  - Actionable suggestions

## 🚀 Quick Start

### Prerequisites

- AWS Account with appropriate permissions
- Node.js 20.x or later
- AWS CLI configured
- AWS CDK CLI installed

### 1. Clone and Install

```bash
git clone <repository-url>
cd content-quality-reviewer
npm install
```

### 2. Deploy Backend

```bash
# Make deploy script executable (Linux/Mac)
chmod +x deploy.sh

# Run deployment
./deploy.sh

# Or manually:
npm install
cdk bootstrap
cdk deploy
```

### 3. Enable Bedrock Access

1. Go to AWS Console → Amazon Bedrock
2. Navigate to "Model access"
3. Enable **Amazon Nova Sonic** (us.amazon.nova-sonic-v1:0)
4. Wait for approval (usually instant)

### 4. Configure Frontend

```bash
cd .kiro/specs/content-quality-reviewer/frontend
npm install

# Create aws-exports.js with values from CDK output
# See IMPLEMENTATION_GUIDE.md for details
```

### 5. Deploy Frontend

```bash
# Option 1: Deploy to Amplify
amplify init
amplify add hosting
amplify publish

# Option 2: Run locally
npm run dev
```

## 📖 Documentation

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Complete step-by-step setup guide
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing strategies and examples
- **[NOVA_MIGRATION.md](./NOVA_MIGRATION.md)** - Nova model migration notes
- **[PROJECT_STATUS_ANALYSIS.md](./PROJECT_STATUS_ANALYSIS.md)** - Current project status

## 🏛️ Project Structure

```
content-quality-reviewer/
├── lambda/                      # Lambda function code
│   ├── analyzers/              # Content analyzers
│   │   ├── structure-analyzer.ts
│   │   ├── tone-analyzer.ts
│   │   ├── accessibility-checker.ts
│   │   └── platform-adapter.ts
│   ├── orchestrator/           # Main orchestrator
│   │   └── handler.ts
│   ├── bedrock/                # Bedrock integration
│   │   ├── bedrock-client.ts
│   │   ├── prompt-template.ts
│   │   └── error-handler.ts
│   ├── comprehend/             # Comprehend integration
│   │   └── comprehend-service.ts
│   ├── storage/                # DynamoDB operations
│   │   ├── storage-service.ts
│   │   └── types.ts
│   └── auth/                   # Authentication
│       └── handler.ts
├── lib/                        # CDK infrastructure
│   ├── cdk-app.ts
│   └── content-reviewer-stack.ts
├── test/                       # Unit tests
│   └── storage-service.test.ts
├── .kiro/specs/                # Spec documents
│   └── content-quality-reviewer/
│       ├── requirements.md
│       ├── design.md
│       ├── tasks.md
│       └── frontend/           # React frontend
├── deploy.sh                   # Deployment script
└── IMPLEMENTATION_GUIDE.md     # Complete setup guide
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test storage-service.test.ts
```

## 📊 Cost Estimation

Monthly costs for 1,000 analyses:

- Lambda: ~$5
- API Gateway: ~$3.50
- DynamoDB: ~$2
- Bedrock (Nova Sonic): ~$3-5
- Cognito: Free (up to 50K MAUs)
- Amplify: ~$0.15/GB
- CloudWatch: ~$5

**Total: ~$18-20/month**

## 🔒 Security

- Cognito user authentication
- API Gateway authorization
- DynamoDB encryption at rest
- Secrets Manager for API keys
- IAM least-privilege policies
- CloudWatch audit logging

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Synthesize CloudFormation
cdk synth

# Deploy to AWS
cdk deploy
```

### Environment Variables

Backend (Lambda):
- `BEDROCK_MODEL_ID`: us.amazon.nova-sonic-v1:0
- `DYNAMODB_TABLE_NAME`: ContentAnalysisResults
- `COMPREHEND_REGION`: us-east-1
- `MAX_CONTENT_LENGTH`: 2000
- `ANALYSIS_TIMEOUT_MS`: 25000

Frontend (.env):
- `VITE_AWS_REGION`: us-east-1
- `VITE_USER_POOL_ID`: <from CDK output>
- `VITE_USER_POOL_CLIENT_ID`: <from CDK output>
- `VITE_API_ENDPOINT`: <from CDK output>

## 🐛 Troubleshooting

### Bedrock Access Denied
- Ensure model access is enabled in Bedrock console
- Verify IAM permissions include `bedrock:InvokeModel`

### Cognito Authentication Fails
- Check User Pool ID and Client ID in aws-exports.js
- Verify CORS settings in API Gateway
- Ensure Authorization header format is correct

### Lambda Timeout
- Increase timeout in CDK (currently 30s)
- Consider using Nova Sonic for faster responses
- Optimize content length

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for more troubleshooting tips.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## 📞 Support

For issues or questions:
1. Check CloudWatch logs
2. Review [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
3. Open an issue on GitHub

---

**Built with ❤️ using AWS Serverless, Amazon Bedrock, and React**
