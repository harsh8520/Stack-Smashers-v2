import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ContentReviewerStack } from '../lib/content-reviewer-stack';

describe('CDK Stack Tests', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new ContentReviewerStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  describe('DynamoDB Tables', () => {
    it('should create analysis results table', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'ContentAnalysisResults',
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    it('should create rate limit table', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'ContentReviewerRateLimits',
        BillingMode: 'PAY_PER_REQUEST',
      });
    });

    it('should have TTL enabled on analysis table', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'ContentAnalysisResults',
        TimeToLiveSpecification: {
          AttributeName: 'ttl',
          Enabled: true,
        },
      });
    });
  });

  describe('Lambda Functions', () => {
    it('should create orchestrator function', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs20.x',
        Timeout: 30,
        MemorySize: 1024,
      });
    });

    it('should set correct environment variables', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: {
            BEDROCK_MODEL_ID: 'us.amazon.nova-sonic-v1:0',
            MAX_CONTENT_LENGTH: '2000',
          },
        },
      });
    });
  });

  describe('API Gateway', () => {
    it('should create REST API', () => {
      template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'Content Quality Reviewer API',
      });
    });

    it('should have CORS configured', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'OPTIONS',
      });
    });

    it('should create /analyze endpoint', () => {
      template.hasResourceProperties('AWS::ApiGateway::Resource', {
        PathPart: 'analyze',
      });
    });
  });

  describe('Cognito', () => {
    it('should create user pool', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UserPoolName: 'content-reviewer-users',
        AutoVerifiedAttributes: ['email'],
      });
    });

    it('should create user pool client', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        ClientName: 'content-reviewer-web-client',
        GenerateSecret: false,
      });
    });

    it('should configure password policy', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: {
            MinimumLength: 8,
            RequireLowercase: true,
            RequireUppercase: true,
            RequireNumbers: true,
            RequireSymbols: false,
          },
        },
      });
    });
  });

  describe('IAM Permissions', () => {
    it('should grant Lambda access to DynamoDB', () => {
      // Check that at least one policy grants DynamoDB permissions
      const policies = template.findResources('AWS::IAM::Policy');
      const hasDynamoDBAccess = Object.values(policies).some((policy: any) => {
        const statements = policy.Properties?.PolicyDocument?.Statement || [];
        return statements.some((stmt: any) => {
          const actions = stmt.Action || [];
          return actions.some((action: string) => action.startsWith('dynamodb:'));
        });
      });
      expect(hasDynamoDBAccess).toBe(true);
    });

    it('should grant Lambda access to Bedrock', () => {
      // Check that at least one policy grants Bedrock permissions
      const policies = template.findResources('AWS::IAM::Policy');
      const hasBedrockAccess = Object.values(policies).some((policy: any) => {
        const statements = policy.Properties?.PolicyDocument?.Statement || [];
        return statements.some((stmt: any) => {
          const actions = stmt.Action || [];
          return actions.some((action: string) => action.startsWith('bedrock:'));
        });
      });
      expect(hasBedrockAccess).toBe(true);
    });

    it('should grant Lambda access to Comprehend', () => {
      // Check that at least one policy grants Comprehend permissions
      const policies = template.findResources('AWS::IAM::Policy');
      const hasComprehendAccess = Object.values(policies).some((policy: any) => {
        const statements = policy.Properties?.PolicyDocument?.Statement || [];
        return statements.some((stmt: any) => {
          const actions = stmt.Action || [];
          return actions.some((action: string) => action.startsWith('comprehend:'));
        });
      });
      expect(hasComprehendAccess).toBe(true);
    });
  });

  describe('Stack Outputs', () => {
    it('should output API endpoint', () => {
      template.hasOutput('ApiEndpoint', {});
    });

    it('should output User Pool ID', () => {
      template.hasOutput('UserPoolId', {});
    });

    it('should output User Pool Client ID', () => {
      template.hasOutput('UserPoolClientId', {});
    });

    it('should output region', () => {
      template.hasOutput('Region', {});
    });
  });
});
