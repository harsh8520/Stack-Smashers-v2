#!/bin/bash

# Script to set up API Gateway CloudWatch Logs role
# This is a one-time setup required per AWS account/region

echo "Setting up API Gateway CloudWatch Logs role..."

# Create IAM role for API Gateway to write to CloudWatch Logs
ROLE_NAME="APIGatewayCloudWatchLogsRole"

# Check if role already exists
aws iam get-role --role-name $ROLE_NAME 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Creating IAM role: $ROLE_NAME"
    
    # Create the role
    aws iam create-role \
        --role-name $ROLE_NAME \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {
                    "Service": "apigateway.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }]
        }'
    
    # Attach the managed policy for CloudWatch Logs
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
    
    echo "Waiting for role to be available..."
    sleep 10
fi

# Get the role ARN
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)

echo "Role ARN: $ROLE_ARN"

# Set the CloudWatch Logs role ARN in API Gateway account settings
echo "Configuring API Gateway account settings..."
aws apigateway update-account \
    --patch-operations op=replace,path=/cloudwatchRoleArn,value=$ROLE_ARN

echo "✅ API Gateway CloudWatch Logs role configured successfully!"
echo "You can now deploy your CDK stack."
