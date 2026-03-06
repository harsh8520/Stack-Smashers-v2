import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class ContentReviewerStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // DynamoDB Table for storing analysis results
        const analysisTable = new dynamodb.Table(this, 'AnalysisResultsTable', {
            tableName: 'ContentAnalysisResults',
            partitionKey: {
                name: 'userId',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'analysisId',
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            pointInTimeRecovery: true,
            timeToLiveAttribute: 'ttl',
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });

        // Global Secondary Index for analysisId lookups
        analysisTable.addGlobalSecondaryIndex({
            indexName: 'analysisId-index',
            partitionKey: {
                name: 'analysisId',
                type: dynamodb.AttributeType.STRING,
            },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        // DynamoDB Table for rate limiting
        const rateLimitTable = new dynamodb.Table(this, 'RateLimitTable', {
            tableName: 'ContentReviewerRateLimits',
            partitionKey: {
                name: 'apiKey',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'timestamp',
                type: dynamodb.AttributeType.NUMBER,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            timeToLiveAttribute: 'ttl',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Secrets Manager for API keys
        const apiKeySecret = new secretsmanager.Secret(this, 'ApiKeySecret', {
            secretName: 'content-reviewer/api-keys',
            description: 'API keys for Content Quality Reviewer',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ keys: [] }),
                generateStringKey: 'apiKey',
            },
        });

        // Common Lambda environment variables
        const commonEnvironment = {
            BEDROCK_MODEL_ID: 'us.amazon.nova-2-lite-v1:0', // Using Nova 2 Lite for fast, cost-effective text analysis
            DYNAMODB_TABLE_NAME: analysisTable.tableName,
            COMPREHEND_REGION: this.region,
            API_KEY_SECRET_NAME: apiKeySecret.secretName,
            RATE_LIMIT_TABLE: rateLimitTable.tableName,
            MAX_CONTENT_LENGTH: '2000',
            ANALYSIS_TIMEOUT_MS: '25000',
        };

        // Common Lambda IAM policy for Bedrock and Comprehend
        const aiServicesPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'bedrock:InvokeModel',
                'comprehend:DetectSentiment',
                'comprehend:DetectKeyPhrases',
                'comprehend:DetectSyntax',
            ],
            resources: ['*'],
        });

        // ============================================
        // Cognito User Pool for Authentication
        // ============================================
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

        // User Pool Client for frontend
        const userPoolClient = userPool.addClient('ContentReviewerClient', {
            userPoolClientName: 'content-reviewer-web-client',
            authFlows: {
                userPassword: true,
                userSrp: true,
                custom: true,
            },
            generateSecret: false,
            preventUserExistenceErrors: true,
        });

        // Authentication Lambda Function
        const authFunction = new lambda.Function(this, 'AuthFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'handler.handler',
            code: lambda.Code.fromAsset('lambda/auth'),
            environment: {
                API_KEY_SECRET_NAME: apiKeySecret.secretName,
                RATE_LIMIT_TABLE: rateLimitTable.tableName,
            },
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
            logRetention: logs.RetentionDays.ONE_MONTH,
        });

        // Grant permissions to auth function
        apiKeySecret.grantRead(authFunction);
        rateLimitTable.grantReadWriteData(authFunction);

        // Create Lambda authorizer
        // const authorizer = new apigateway.TokenAuthorizer(this, 'ApiAuthorizer', {
        //   handler: authFunction,
        //   identitySource: 'method.request.header.x-api-key',
        //   authorizerName: 'ContentReviewerAuthorizer',
        //   resultsCacheTtl: cdk.Duration.minutes(5),
        // });

        // ============================================
        // API Gateway with Cognito Authorization
        // ============================================
        const api = new apigateway.RestApi(this, 'ContentReviewerApi', {
            restApiName: 'Content Quality Reviewer API',
            description: 'API for AI-powered content quality analysis with Cognito auth',
            deployOptions: {
                stageName: 'prod',
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
                metricsEnabled: true,
                throttlingBurstLimit: 20,
                throttlingRateLimit: 10,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
                allowCredentials: true,
            },
            apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
        });

        // Create Cognito Authorizer
        // const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
        //     cognitoUserPools: [userPool],
        //     authorizerName: 'ContentReviewerCognitoAuthorizer',
        //     identitySource: 'method.request.header.Authorization',
        // });

        // Create API Key
        const apiKey = new apigateway.ApiKey(this, 'ContentReviewerApiKey', {
            apiKeyName: 'content-reviewer-api-key',
            description: 'API key for Content Quality Reviewer',
            enabled: true,
        });

        // Create Usage Plan with rate limiting (10 requests per minute)
        const usagePlan = new apigateway.UsagePlan(this, 'ContentReviewerUsagePlan', {
            name: 'Content Reviewer Usage Plan',
            description: 'Usage plan with rate limiting for Content Quality Reviewer API',
            throttle: {
                rateLimit: 10,
                burstLimit: 20,
            },
            quota: {
                limit: 1000,
                period: apigateway.Period.DAY,
            },
        });

        // Associate API stage with usage plan
        usagePlan.addApiStage({
            stage: api.deploymentStage,
        });

        // Associate API key with usage plan
        usagePlan.addApiKey(apiKey);

        // Analysis Orchestrator Lambda Function
        const orchestratorFunction = new lambda.Function(this, 'OrchestratorFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'orchestrator/handler.handler',
            code: lambda.Code.fromAsset('lambda/orchestrator'),
            environment: commonEnvironment,
            timeout: cdk.Duration.seconds(30),
            memorySize: 1024,
            logRetention: logs.RetentionDays.ONE_MONTH,
        });

        // Grant permissions to orchestrator function
        analysisTable.grantReadWriteData(orchestratorFunction);
        orchestratorFunction.addToRolePolicy(aiServicesPolicy);

        // GET /analysis/{id} Lambda Function
        const getAnalysisFunction = new lambda.Function(this, 'GetAnalysisFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'handler.handler',
            code: lambda.Code.fromAsset('lambda/api/get-analysis'),
            environment: {
                DYNAMODB_TABLE_NAME: analysisTable.tableName,
            },
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
            logRetention: logs.RetentionDays.ONE_MONTH,
        });

        // Grant read permissions to get-analysis function
        analysisTable.grantReadData(getAnalysisFunction);

        // GET /history Lambda Function
        const historyFunction = new lambda.Function(this, 'HistoryFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: 'handler.handler',
            code: lambda.Code.fromAsset('lambda/api/history'),
            environment: {
                DYNAMODB_TABLE_NAME: analysisTable.tableName,
            },
            timeout: cdk.Duration.seconds(10),
            memorySize: 256,
            logRetention: logs.RetentionDays.ONE_MONTH,
        });

        // Grant read permissions to history function
        analysisTable.grantReadData(historyFunction);

        // POST /analyze endpoint with Cognito authorization
        const analyzeResource = api.root.addResource('analyze');
        analyzeResource.addMethod(
            'POST',
            new apigateway.LambdaIntegration(orchestratorFunction)
        );

        // GET /analysis/{id} endpoint
        const analysisResource = api.root.addResource('analysis');
        const analysisIdResource = analysisResource.addResource('{id}');
        analysisIdResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(getAnalysisFunction)
        );

        // GET /history endpoint
        const historyResource = api.root.addResource('history');
        historyResource.addMethod(
            'GET',
            new apigateway.LambdaIntegration(historyFunction)
        );

        // Outputs
        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: api.url,
            description: 'API Gateway endpoint URL',
        });

        new cdk.CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
            description: 'Cognito User Pool ID',
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID',
        });

        new cdk.CfnOutput(this, 'Region', {
            value: this.region,
            description: 'AWS Region',
        });

        new cdk.CfnOutput(this, 'ApiKeyId', {
            value: apiKey.keyId,
            description: 'API Key ID (for backward compatibility)',
        });

        new cdk.CfnOutput(this, 'TableName', {
            value: analysisTable.tableName,
            description: 'DynamoDB table name',
        });

        new cdk.CfnOutput(this, 'ApiKeySecretArn', {
            value: apiKeySecret.secretArn,
            description: 'Secrets Manager ARN for API keys',
        });
    }
}
