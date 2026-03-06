# Quick Start Checklist

Use this checklist to quickly set up and run the Content Quality Reviewer application.

## ☐ Prerequisites (15 minutes)

- [ ] Install Node.js v18+ → [Download](https://nodejs.org/)
- [ ] Install AWS CLI v2 → [Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [ ] Install AWS CDK: `npm install -g aws-cdk`
- [ ] Verify installations:
  ```bash
  node --version
  aws --version
  cdk --version
  ```

## ☐ AWS Account Setup (20 minutes)

- [ ] Create AWS account at [aws.amazon.com](https://aws.amazon.com/)
- [ ] Create IAM user with AdministratorAccess
- [ ] Download access keys (CSV file)
- [ ] Configure AWS CLI:
  ```bash
  aws configure
  # Enter: Access Key, Secret Key, us-east-1, json
  ```
- [ ] Verify: `aws sts get-caller-identity`
- [ ] Request Bedrock model access:
  - AWS Console → Bedrock → Model access
  - Enable: Amazon Nova Lite & Nova Sonic

## ☐ Backend Deployment (15 minutes)

- [ ] Navigate to project: `cd E:\AWS`
- [ ] Install dependencies: `npm install`
- [ ] Bootstrap CDK (first time only):
  ```bash
  cdk bootstrap aws://YOUR-ACCOUNT-ID/us-east-1
  ```
- [ ] Build project: `npm run build`
- [ ] Run tests: `npm test` (should pass 47 tests)
- [ ] Deploy to AWS: `cdk deploy`
- [ ] **SAVE THE OUTPUTS** (API endpoint, User Pool ID, Client ID)

## ☐ Frontend Setup (10 minutes)

- [ ] Navigate to frontend:
  ```bash
  cd .kiro/specs/content-quality-reviewer/frontend
  ```
- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file with your AWS outputs:
  ```env
  VITE_AWS_REGION=us-east-1
  VITE_USER_POOL_ID=us-east-1_xxxxx
  VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxx
  VITE_API_ENDPOINT=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
  ```

## ☐ Run Application (5 minutes)

- [ ] Start frontend dev server:
  ```bash
  npm run dev
  ```
- [ ] Open browser: `http://localhost:5173/`
- [ ] Create account (Sign Up)
- [ ] Verify email (check inbox/spam)
- [ ] Login with credentials

## ☐ Test the Application (5 minutes)

- [ ] Paste sample content (e.g., blog post)
- [ ] Select platform: "Blog"
- [ ] Select intent: "Inform"
- [ ] Click "Analyze Content"
- [ ] Wait for results (10-30 seconds)
- [ ] Check History page
- [ ] View detailed scores

## ☐ Troubleshooting (if needed)

### Backend Issues
- [ ] Check AWS credentials: `aws sts get-caller-identity`
- [ ] Verify Bedrock access in AWS Console
- [ ] Check CloudWatch logs for Lambda errors

### Frontend Issues
- [ ] Verify `.env` file has correct values
- [ ] Check browser console for errors
- [ ] Ensure API endpoint is accessible
- [ ] Clear browser cache and reload

### Common Fixes
```bash
# Reinstall dependencies
npm install

# Rebuild backend
npm run build

# Restart frontend
npm run dev
```

## ☐ Clean Up (when done)

- [ ] Stop frontend server (Ctrl+C)
- [ ] Destroy AWS resources (to avoid charges):
  ```bash
  cd E:\AWS
  cdk destroy
  ```

---

## Quick Reference

### Important Files
- Backend: `E:\AWS\`
- Frontend: `E:\AWS\.kiro\specs\content-quality-reviewer\frontend\`
- Environment: `frontend/.env`
- CDK Stack: `lib/content-reviewer-stack.ts`

### Key Commands
```bash
# Backend
npm run build          # Build TypeScript
npm test              # Run tests
cdk deploy            # Deploy to AWS
cdk destroy           # Delete all resources

# Frontend
npm run dev           # Start dev server
npm run build         # Build for production
```

### AWS Console Links
- [Bedrock Model Access](https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups)
- [DynamoDB Tables](https://console.aws.amazon.com/dynamodbv2/home?region=us-east-1#tables)
- [API Gateway](https://console.aws.amazon.com/apigateway/home?region=us-east-1#/apis)
- [Cognito User Pools](https://console.aws.amazon.com/cognito/v2/idp/user-pools?region=us-east-1)

---

## Estimated Time
- **First-time setup**: ~60 minutes
- **Subsequent runs**: ~5 minutes (just start frontend)

## Estimated Costs
- **Free tier usage**: $0-5/month for testing
- **Production usage**: Varies based on traffic

---

**Need Help?** See `SETUP_GUIDE.md` for detailed instructions.
