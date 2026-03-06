#!/bin/bash

# Content Quality Reviewer - Deployment Script
# This script deploys the complete backend infrastructure to AWS

set -e  # Exit on error

echo "🚀 Content Quality Reviewer - Deployment Script"
echo "================================================"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS CLI is not configured"
    echo "Please run: aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)
echo "   Account: $ACCOUNT_ID"
echo "   Region: $REGION"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

echo "✅ Node.js $(node --version) installed"
echo ""

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "⚠️  AWS CDK not found. Installing..."
    npm install -g aws-cdk
fi

echo "✅ AWS CDK $(cdk --version) installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Bootstrap CDK (if needed)
echo "🔧 Checking CDK bootstrap..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION &> /dev/null; then
    echo "   Bootstrapping CDK..."
    cdk bootstrap aws://$ACCOUNT_ID/$REGION
    echo "✅ CDK bootstrapped"
else
    echo "✅ CDK already bootstrapped"
fi
echo ""

# Synthesize CloudFormation template
echo "🔨 Synthesizing CloudFormation template..."
cdk synth
echo "✅ Template synthesized"
echo ""

# Deploy the stack
echo "🚀 Deploying stack to AWS..."
echo "   This may take 5-10 minutes..."
echo ""
cdk deploy --require-approval never

echo ""
echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "📋 Next Steps:"
echo "1. Save the output values (UserPoolId, UserPoolClientId, ApiEndpoint)"
echo "2. Enable Bedrock model access in AWS Console:"
echo "   - Go to Amazon Bedrock → Model access"
echo "   - Enable 'Amazon Nova Sonic' (us.amazon.nova-sonic-v1:0)"
echo "3. Configure frontend with the output values"
echo "4. Deploy frontend to Amplify"
echo ""
echo "📚 See IMPLEMENTATION_GUIDE.md for detailed instructions"
echo ""
