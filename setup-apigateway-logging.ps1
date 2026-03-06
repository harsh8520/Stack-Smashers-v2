# PowerShell script to set up API Gateway CloudWatch Logs role
# This is a one-time setup required per AWS account/region

Write-Host "Setting up API Gateway CloudWatch Logs role..." -ForegroundColor Cyan

$ROLE_NAME = "APIGatewayCloudWatchLogsRole"

# Check if role already exists
try {
    $existingRole = aws iam get-role --role-name $ROLE_NAME 2>$null | ConvertFrom-Json
    Write-Host "Role already exists: $ROLE_NAME" -ForegroundColor Yellow
} catch {
    Write-Host "Creating IAM role: $ROLE_NAME" -ForegroundColor Green
    
    # Create the role
    $trustPolicy = @'
{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": {
            "Service": "apigateway.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
    }]
}
'@
    
    aws iam create-role `
        --role-name $ROLE_NAME `
        --assume-role-policy-document $trustPolicy
    
    # Attach the managed policy for CloudWatch Logs
    aws iam attach-role-policy `
        --role-name $ROLE_NAME `
        --policy-arn "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
    
    Write-Host "Waiting for role to be available..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Get the role ARN
$roleInfo = aws iam get-role --role-name $ROLE_NAME | ConvertFrom-Json
$ROLE_ARN = $roleInfo.Role.Arn

Write-Host "Role ARN: $ROLE_ARN" -ForegroundColor Cyan

# Set the CloudWatch Logs role ARN in API Gateway account settings
Write-Host "Configuring API Gateway account settings..." -ForegroundColor Green
aws apigateway update-account `
    --patch-operations op=replace,path=/cloudwatchRoleArn,value=$ROLE_ARN

Write-Host "✅ API Gateway CloudWatch Logs role configured successfully!" -ForegroundColor Green
Write-Host "You can now deploy your CDK stack." -ForegroundColor Cyan
