import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import {
  storeAnalysisResult,
  getAnalysisById,
  getUserHistory,
  isValidUUID,
} from '../lambda/storage/storage-service';
import { AnalysisResult } from '../lambda/storage/types';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Storage Service', () => {
  beforeEach(() => {
    ddbMock.reset();
    jest.clearAllMocks();
  });

  describe('storeAnalysisResult', () => {
    it('should store analysis result and return with generated ID', async () => {
      ddbMock.on(PutCommand).resolves({});

      const input: Omit<AnalysisResult, 'analysisId' | 'timestamp'> = {
        userId: 'user123',
        content: 'Test content',
        targetPlatform: 'blog',
        contentIntent: 'inform',
        overallScore: 85,
        dimensionScores: {
          structure: { score: 80, confidence: 0.9, issues: [], strengths: [] },
          tone: { score: 85, confidence: 0.85, issues: [], strengths: [] },
          accessibility: { score: 90, confidence: 0.95, issues: [], strengths: [] },
          platformAlignment: { score: 85, confidence: 0.88, issues: [], strengths: [] },
        },
        suggestions: [],
        metadata: {
          processingTime: 1500,
          contentLength: 100,
          platformOptimized: true,
        },
      };

      const result = await storeAnalysisResult(input);

      expect(result.analysisId).toBeDefined();
      expect(isValidUUID(result.analysisId)).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(result.userId).toBe('user123');
      expect(result.overallScore).toBe(85);
    });

    it('should use "anonymous" for missing userId', async () => {
      ddbMock.on(PutCommand).resolves({});

      const input: Omit<AnalysisResult, 'analysisId' | 'timestamp'> = {
        content: 'Test content',
        targetPlatform: 'linkedin',
        contentIntent: 'educate',
        overallScore: 75,
        dimensionScores: {
          structure: { score: 70, confidence: 0.8, issues: [], strengths: [] },
          tone: { score: 75, confidence: 0.82, issues: [], strengths: [] },
          accessibility: { score: 80, confidence: 0.9, issues: [], strengths: [] },
          platformAlignment: { score: 75, confidence: 0.85, issues: [], strengths: [] },
        },
        suggestions: [],
        metadata: {
          processingTime: 1200,
          contentLength: 80,
          platformOptimized: false,
        },
      };

      const result = await storeAnalysisResult(input);

      expect(result.userId).toBeUndefined();
      
      const putCall = ddbMock.commandCalls(PutCommand)[0];
      expect(putCall.args[0].input.Item?.userId).toBe('anonymous');
    });

    it('should throw error on DynamoDB failure', async () => {
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));

      const input: Omit<AnalysisResult, 'analysisId' | 'timestamp'> = {
        content: 'Test',
        targetPlatform: 'blog',
        contentIntent: 'inform',
        overallScore: 80,
        dimensionScores: {
          structure: { score: 80, confidence: 0.9, issues: [], strengths: [] },
          tone: { score: 80, confidence: 0.9, issues: [], strengths: [] },
          accessibility: { score: 80, confidence: 0.9, issues: [], strengths: [] },
          platformAlignment: { score: 80, confidence: 0.9, issues: [], strengths: [] },
        },
        suggestions: [],
        metadata: { processingTime: 1000, contentLength: 50, platformOptimized: true },
      };

      await expect(storeAnalysisResult(input)).rejects.toThrow('Failed to store analysis result');
    });
  });

  describe('getAnalysisById', () => {
    it('should retrieve analysis by ID', async () => {
      const mockRecord = {
        userId: 'user123',
        analysisId: '123e4567-e89b-12d3-a456-426614174000',
        timestamp: '2024-01-01T00:00:00.000Z',
        content: 'Test content',
        targetPlatform: 'blog',
        contentIntent: 'inform',
        overallScore: 85,
        dimensionScores: {
          structure: { score: 80, confidence: 0.9, issues: [], strengths: [] },
          tone: { score: 85, confidence: 0.85, issues: [], strengths: [] },
          accessibility: { score: 90, confidence: 0.95, issues: [], strengths: [] },
          platformAlignment: { score: 85, confidence: 0.88, issues: [], strengths: [] },
        },
        suggestions: [],
        metadata: { processingTime: 1500, contentLength: 100, platformOptimized: true },
        ttl: 1234567890,
      };

      ddbMock.on(QueryCommand).resolves({
        Items: [mockRecord],
      });

      const result = await getAnalysisById('123e4567-e89b-12d3-a456-426614174000');

      expect(result).not.toBeNull();
      expect(result?.analysisId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result?.userId).toBe('user123');
      expect(result?.overallScore).toBe(85);
    });

    it('should return null for non-existent analysis', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [],
      });

      const result = await getAnalysisById('non-existent-id');

      expect(result).toBeNull();
    });

    it('should throw error on DynamoDB failure', async () => {
      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'));

      await expect(getAnalysisById('some-id')).rejects.toThrow('Failed to retrieve analysis');
    });
  });

  describe('getUserHistory', () => {
    it('should retrieve user history', async () => {
      const mockRecords = [
        {
          userId: 'user123',
          analysisId: '123e4567-e89b-12d3-a456-426614174001',
          timestamp: '2024-01-02T00:00:00.000Z',
          content: 'Content 1',
          targetPlatform: 'blog',
          contentIntent: 'inform',
          overallScore: 85,
          dimensionScores: {
            structure: { score: 80, confidence: 0.9, issues: [], strengths: [] },
            tone: { score: 85, confidence: 0.85, issues: [], strengths: [] },
            accessibility: { score: 90, confidence: 0.95, issues: [], strengths: [] },
            platformAlignment: { score: 85, confidence: 0.88, issues: [], strengths: [] },
          },
          suggestions: [],
          metadata: { processingTime: 1500, contentLength: 100, platformOptimized: true },
          ttl: 1234567890,
        },
        {
          userId: 'user123',
          analysisId: '123e4567-e89b-12d3-a456-426614174002',
          timestamp: '2024-01-01T00:00:00.000Z',
          content: 'Content 2',
          targetPlatform: 'linkedin',
          contentIntent: 'educate',
          overallScore: 75,
          dimensionScores: {
            structure: { score: 70, confidence: 0.8, issues: [], strengths: [] },
            tone: { score: 75, confidence: 0.82, issues: [], strengths: [] },
            accessibility: { score: 80, confidence: 0.9, issues: [], strengths: [] },
            platformAlignment: { score: 75, confidence: 0.85, issues: [], strengths: [] },
          },
          suggestions: [],
          metadata: { processingTime: 1200, contentLength: 80, platformOptimized: false },
          ttl: 1234567890,
        },
      ];

      ddbMock.on(QueryCommand).resolves({
        Items: mockRecords,
      });

      const result = await getUserHistory({ userId: 'user123', limit: 10 });

      expect(result.analyses).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(result.analyses[0].analysisId).toBe('123e4567-e89b-12d3-a456-426614174001');
    });

    it('should apply date filters', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [],
      });

      await getUserHistory({
        userId: 'user123',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      });

      const queryCall = ddbMock.commandCalls(QueryCommand)[0];
      expect(queryCall.args[0].input.FilterExpression).toContain('BETWEEN');
    });

    it('should handle pagination', async () => {
      const lastKey = { userId: 'user123', analysisId: 'some-id' };

      ddbMock.on(QueryCommand).resolves({
        Items: [],
        LastEvaluatedKey: lastKey,
      });

      const result = await getUserHistory({ userId: 'user123' });

      expect(result.hasMore).toBe(true);
      expect(result.lastEvaluatedKey).toEqual(lastKey);
    });

    it('should throw error on DynamoDB failure', async () => {
      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'));

      await expect(getUserHistory({ userId: 'user123' })).rejects.toThrow(
        'Failed to retrieve user history'
      );
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('12345678-1234-1234-1234-1234567890ab')).toBe(true); // Valid format
    });
  });
});
