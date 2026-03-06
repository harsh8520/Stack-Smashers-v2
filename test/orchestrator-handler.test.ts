import { handler } from '../lambda/orchestrator/handler';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock all dependencies
jest.mock('../lambda/comprehend/comprehend-service');
jest.mock('../lambda/bedrock/bedrock-client');
jest.mock('../lambda/analyzers/structure-analyzer');
jest.mock('../lambda/analyzers/tone-analyzer');
jest.mock('../lambda/analyzers/accessibility-checker');
jest.mock('../lambda/analyzers/platform-adapter');
jest.mock('../lambda/storage/storage-service');

import { performComprehendAnalysis } from '../lambda/comprehend/comprehend-service';
import { invokeBedrockModel, generateFallbackResponse } from '../lambda/bedrock/bedrock-client';
import { analyzeStructure } from '../lambda/analyzers/structure-analyzer';
import { analyzeTone } from '../lambda/analyzers/tone-analyzer';
import { analyzeAccessibility } from '../lambda/analyzers/accessibility-checker';
import { analyzePlatformAlignment } from '../lambda/analyzers/platform-adapter';
import { storeAnalysisResult } from '../lambda/storage/storage-service';

const mockPerformComprehendAnalysis = performComprehendAnalysis as jest.MockedFunction<typeof performComprehendAnalysis>;
const mockInvokeBedrockModel = invokeBedrockModel as jest.MockedFunction<typeof invokeBedrockModel>;
const mockGenerateFallbackResponse = generateFallbackResponse as jest.MockedFunction<typeof generateFallbackResponse>;
const mockAnalyzeStructure = analyzeStructure as jest.MockedFunction<typeof analyzeStructure>;
const mockAnalyzeTone = analyzeTone as jest.MockedFunction<typeof analyzeTone>;
const mockAnalyzeAccessibility = analyzeAccessibility as jest.MockedFunction<typeof analyzeAccessibility>;
const mockAnalyzePlatformAlignment = analyzePlatformAlignment as jest.MockedFunction<typeof analyzePlatformAlignment>;
const mockStoreAnalysisResult = storeAnalysisResult as jest.MockedFunction<typeof storeAnalysisResult>;

describe('Orchestrator Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockPerformComprehendAnalysis.mockResolvedValue({
      sentiment: { sentiment: 'POSITIVE', sentimentScore: {} },
      keyPhrases: [],
      syntaxTokens: [],
    } as any);

    mockInvokeBedrockModel.mockResolvedValue({
      overallScore: 82,
      dimensionScores: {
        structure: { score: 80, confidence: 0.9, issues: [], strengths: ['Good structure'] },
        tone: { score: 85, confidence: 0.9, issues: [], strengths: ['Consistent tone'] },
        accessibility: { score: 90, confidence: 0.9, issues: [], strengths: ['Clear language'] },
        platformAlignment: { score: 75, confidence: 0.9, issues: [], strengths: ['Platform appropriate'] },
      },
      suggestions: [],
    } as any);

    mockGenerateFallbackResponse.mockReturnValue({
      overallScore: 50,
      dimensionScores: {
        structure: { score: 50, confidence: 0.3, issues: [], strengths: [] },
        tone: { score: 50, confidence: 0.3, issues: [], strengths: [] },
        accessibility: { score: 50, confidence: 0.3, issues: [], strengths: [] },
        platformAlignment: { score: 50, confidence: 0.3, issues: [], strengths: [] },
      },
      suggestions: [
        {
          priority: 'high',
          category: 'system',
          title: 'Analysis Unavailable',
          description: 'AI analysis is temporarily unavailable. Please try again later.',
          reasoning: 'The AI service encountered an error during analysis.',
          examples: [],
        },
      ],
    } as any);

    mockAnalyzeStructure.mockReturnValue({
      score: 80,
      confidence: 0.9,
      issues: [],
      strengths: ['Good structure'],
    });

    mockAnalyzeTone.mockReturnValue({
      score: 85,
      confidence: 0.9,
      issues: [],
      strengths: ['Consistent tone'],
    });

    mockAnalyzeAccessibility.mockReturnValue({
      score: 90,
      confidence: 0.9,
      issues: [],
      strengths: ['Clear language'],
    });

    mockAnalyzePlatformAlignment.mockReturnValue({
      score: 75,
      confidence: 0.9,
      issues: [],
      strengths: ['Platform appropriate'],
    });

    mockStoreAnalysisResult.mockResolvedValue({
      analysisId: 'test-123',
      userId: 'user-123',
      timestamp: new Date().toISOString(),
      content: 'Test content',
      targetPlatform: 'blog',
      contentIntent: 'inform',
      overallScore: 82,
      dimensionScores: {
        structure: { score: 80, confidence: 0.9, issues: [], strengths: [] },
        tone: { score: 85, confidence: 0.9, issues: [], strengths: [] },
        accessibility: { score: 90, confidence: 0.9, issues: [], strengths: [] },
        platformAlignment: { score: 75, confidence: 0.9, issues: [], strengths: [] },
      },
      suggestions: [],
      metadata: {
        processingTime: 1000,
        contentLength: 10,
        platformOptimized: true,
      },
    });
  });

  describe('Valid Requests', () => {
    it('should successfully analyze valid content', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({
          content: 'This is a test blog post about artificial intelligence.',
          targetPlatform: 'blog',
          contentIntent: 'inform',
        }),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toHaveProperty('analysisId');
      expect(JSON.parse(result.body)).toHaveProperty('overallScore');
    });

    it('should handle all valid platforms', async () => {
      const platforms = ['blog', 'linkedin', 'twitter', 'medium'];

      for (const platform of platforms) {
        const event: Partial<APIGatewayProxyEvent> = {
          body: JSON.stringify({
            content: 'Test content for platform analysis.',
            targetPlatform: platform,
            contentIntent: 'inform',
          }),
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(200);
      }
    });

    it('should handle all valid intents', async () => {
      const intents = ['inform', 'educate', 'persuade'];

      for (const intent of intents) {
        const event: Partial<APIGatewayProxyEvent> = {
          body: JSON.stringify({
            content: 'Test content for intent analysis.',
            targetPlatform: 'blog',
            contentIntent: intent,
          }),
        };

        const result = await handler(event as APIGatewayProxyEvent);
        expect(result.statusCode).toBe(200);
      }
    });
  });

  describe('Validation Errors', () => {
    it('should reject missing body', async () => {
      const event: Partial<APIGatewayProxyEvent> = {};

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error.code).toBe('INVALID_INPUT');
    });

    it('should reject invalid JSON', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: 'invalid json{',
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error.code).toBe('INVALID_INPUT');
    });

    it('should reject missing content', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({
          targetPlatform: 'blog',
          contentIntent: 'inform',
        }),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error.message).toContain('Content is required');
    });

    it('should reject empty content', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({
          content: '   ',
          targetPlatform: 'blog',
          contentIntent: 'inform',
        }),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error.message).toContain('cannot be empty');
    });

    it('should reject invalid platform', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({
          content: 'Test content',
          targetPlatform: 'invalid',
          contentIntent: 'inform',
        }),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error.message).toContain('Invalid platform');
    });

    it('should reject invalid intent', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({
          content: 'Test content',
          targetPlatform: 'blog',
          contentIntent: 'invalid',
        }),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error.message).toContain('Invalid intent');
    });

    it('should reject content exceeding word limit', async () => {
      const longContent = 'word '.repeat(2001);
      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({
          content: longContent,
          targetPlatform: 'blog',
          contentIntent: 'inform',
        }),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error.message).toContain('exceeds');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in success response', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({
          content: 'Test content',
          targetPlatform: 'blog',
          contentIntent: 'inform',
        }),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    });

    it('should include CORS headers in error response', async () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({}),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });
  });

  describe('Error Handling', () => {
    it('should handle Bedrock failures gracefully', async () => {
      // Reset the mock to reject for this test
      mockInvokeBedrockModel.mockReset();
      mockInvokeBedrockModel.mockRejectedValue(new Error('Bedrock error'));

      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({
          content: 'Test content',
          targetPlatform: 'blog',
          contentIntent: 'inform',
        }),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      // Should still succeed with fallback (status 200)
      expect(result.statusCode).toBe(200);
      
      // Verify the response has the expected structure
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('analysisId');
      expect(body).toHaveProperty('overallScore');
      // Overall score will be a weighted average of local analyzers (70%) and fallback (30%)
      // Local analyzers return ~75-85, fallback returns 50
      // So overall score should be around 70-80
      expect(body.overallScore).toBeGreaterThan(60);
      expect(body.overallScore).toBeLessThan(90);
    });

    it('should return 500 for unexpected errors', async () => {
      mockStoreAnalysisResult.mockRejectedValue(new Error('Database error'));

      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({
          content: 'Test content',
          targetPlatform: 'blog',
          contentIntent: 'inform',
        }),
      };

      const result = await handler(event as APIGatewayProxyEvent);

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body).error.code).toBe('SERVICE_ERROR');
    });
  });
});
