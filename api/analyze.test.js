// Mock all dependencies BEFORE importing the module under test
jest.mock('../lib/auth', () => ({
  authenticateRequest: jest.fn()
}));

jest.mock('../lib/rate-limit', () => ({
  checkRateLimit: jest.fn()
}));

jest.mock('../lib/storage', () => ({
  storeAnalysisResult: jest.fn()
}));

jest.mock('../backend/lib/groq-client', () => ({
  analyzeContentWithAI: jest.fn()
}));

jest.mock('../lib/nlp-utils', () => ({
  analyzeSentiment: jest.fn(),
  extractKeyPhrases: jest.fn(),
  analyzeSyntax: jest.fn()
}));

jest.mock('../lib/analyzers/structure-analyzer', () => ({
  analyzeStructure: jest.fn()
}));

jest.mock('../lib/analyzers/tone-analyzer', () => ({
  analyzeTone: jest.fn()
}));

jest.mock('../lib/analyzers/accessibility-checker', () => ({
  checkAccessibility: jest.fn()
}));

jest.mock('../lib/analyzers/platform-adapter', () => ({
  analyzePlatformAlignment: jest.fn()
}));

jest.mock('../lib/analyzers/score-merger', () => ({
  mergeDimensionScores: jest.fn(),
  calculateOverallScore: jest.fn()
}));

jest.mock('../lib/readability', () => ({
  calculateReadabilityMetrics: jest.fn()
}));

jest.mock('../lib/keyword-analyzer', () => ({
  analyzeKeywords: jest.fn()
}));

const { authenticateRequest } = require('../backend/lib/auth');
const { checkRateLimit } = require('../backend/lib/rate-limit');
const { storeAnalysisResult } = require('../backend/lib/storage');
const { analyzeContentWithAI } = require('../backend/lib/groq-client');
const { analyzeSentiment, extractKeyPhrases, analyzeSyntax } = require('../backend/lib/nlp-utils');
const { analyzeStructure } = require('../backend/lib/analyzers/structure-analyzer');
const { analyzeTone } = require('../backend/lib/analyzers/tone-analyzer');
const { checkAccessibility } = require('../backend/lib/analyzers/accessibility-checker');
const { analyzePlatformAlignment } = require('../backend/lib/analyzers/platform-adapter');
const { mergeDimensionScores, calculateOverallScore } = require('../backend/lib/analyzers/score-merger');
const { calculateReadabilityMetrics } = require('../backend/lib/readability');
const { analyzeKeywords } = require('../backend/lib/keyword-analyzer');
const handler = require('./analyze');

describe('POST /api/analyze', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token'
      },
      body: {
        content: 'This is test content for analysis with enough words to pass validation.',
        targetPlatform: 'blog',
        contentIntent: 'inform'
      },
      url: '/api/analyze'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };
  });

  it('should return 401 if user is not authenticated', async () => {
    authenticateRequest.mockResolvedValue(null);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('should return 429 if rate limit is exceeded', async () => {
    authenticateRequest.mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
    checkRateLimit.mockResolvedValue(false);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Rate limit exceeded. Please try again later.' });
  });

  it('should return 400 if required fields are missing', async () => {
    authenticateRequest.mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
    checkRateLimit.mockResolvedValue(true);
    
    req.body = { content: 'Test' }; // Missing targetPlatform and contentIntent

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Missing required fields: content, targetPlatform, and contentIntent are required' 
    });
  });

  it('should return 400 if targetPlatform is invalid', async () => {
    authenticateRequest.mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
    checkRateLimit.mockResolvedValue(true);
    
    req.body.targetPlatform = 'invalid-platform';
    req.body.content = 'This is a longer test content with more than ten words for validation.';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Invalid targetPlatform. Must be one of: blog, linkedin, twitter, medium' 
    });
  });

  it('should return 400 if contentIntent is invalid', async () => {
    authenticateRequest.mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
    checkRateLimit.mockResolvedValue(true);
    
    req.body.contentIntent = 'invalid-intent';
    req.body.content = 'This is a longer test content with more than ten words for validation.';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Invalid contentIntent. Must be one of: inform, educate, persuade' 
    });
  });

  it('should return 400 if content is too short (less than 10 words)', async () => {
    authenticateRequest.mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
    checkRateLimit.mockResolvedValue(true);
    
    req.body.content = 'Too short';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Content is too short for meaningful analysis. Please provide at least 10 words.' 
    });
  });

  it('should return 400 if content is empty', async () => {
    authenticateRequest.mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
    checkRateLimit.mockResolvedValue(true);
    
    req.body.content = '   ';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Content cannot be empty' 
    });
  });

  it('should successfully analyze content and return result', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSentiment = { Sentiment: 'POSITIVE', SentimentScore: { Positive: 0.8 } };
    const mockKeyPhrases = [{ Text: 'test', Score: 0.9 }];
    const mockSyntaxTokens = [{ TokenId: 1, Text: 'This' }];
    
    const mockLocalScores = {
      structure: { score: 80, confidence: 0.8, issues: [], strengths: [] },
      tone: { score: 75, confidence: 0.75, issues: [], strengths: [] },
      accessibility: { score: 85, confidence: 0.85, issues: [], strengths: [] },
      platformAlignment: { score: 90, confidence: 0.9, issues: [], strengths: [] }
    };

    const mockAIAnalysis = {
      dimensionScores: {
        structure: { score: 70, confidence: 0.9, issues: [], strengths: [] },
        tone: { score: 80, confidence: 0.85, issues: [], strengths: [] },
        accessibility: { score: 75, confidence: 0.8, issues: [], strengths: [] },
        platformAlignment: { score: 85, confidence: 0.9, issues: [], strengths: [] }
      },
      suggestions: [{ priority: 'high', title: 'Test suggestion' }]
    };

    const mockMergedScores = {
      structure: { score: 77, confidence: 0.83, issues: [], strengths: [] },
      tone: { score: 77, confidence: 0.79, issues: [], strengths: [] },
      accessibility: { score: 82, confidence: 0.83, issues: [], strengths: [] },
      platformAlignment: { score: 89, confidence: 0.9, issues: [], strengths: [] }
    };

    const mockReadability = {
      fleschKincaidScore: 65.5,
      gradeLevel: 8.2,
      readingTimeMinutes: 1,
      interpretation: 'Standard readability (8th-9th grade level). Accessible to middle school readers (grade 8.2).'
    };

    const mockKeywords = {
      primary: [
        { keyword: 'test', frequency: 3, density: 2.5 },
        { keyword: 'content', frequency: 2, density: 1.67 },
        { keyword: 'analysis', frequency: 2, density: 1.67 }
      ],
      totalWords: 12,
      uniqueKeywords: 8,
      density: {
        'test': 2.5,
        'content': 1.67,
        'analysis': 1.67
      },
      warnings: [],
      suggestions: ['Consider adding more diverse keywords to improve SEO coverage.'],
      hasKeywordStuffing: false
    };

    const mockStoredResult = {
      analysisId: 'analysis-123',
      userId: 'user-123',
      timestamp: '2024-01-01T00:00:00.000Z',
      content: req.body.content,
      targetPlatform: req.body.targetPlatform,
      contentIntent: req.body.contentIntent,
      overallScore: 81,
      dimensionScores: mockMergedScores,
      suggestions: mockAIAnalysis.suggestions,
      readability: mockReadability,
      keywords: mockKeywords,
      metadata: {
        processingTime: expect.any(Number),
        contentLength: 12,
        platformOptimized: true
      }
    };

    authenticateRequest.mockResolvedValue(mockUser);
    checkRateLimit.mockResolvedValue(true);
    analyzeSentiment.mockReturnValue(mockSentiment);
    extractKeyPhrases.mockReturnValue(mockKeyPhrases);
    analyzeSyntax.mockReturnValue(mockSyntaxTokens);
    analyzeStructure.mockReturnValue(mockLocalScores.structure);
    analyzeTone.mockReturnValue(mockLocalScores.tone);
    checkAccessibility.mockReturnValue(mockLocalScores.accessibility);
    analyzePlatformAlignment.mockReturnValue(mockLocalScores.platformAlignment);
    analyzeContentWithAI.mockResolvedValue(mockAIAnalysis);
    mergeDimensionScores.mockReturnValue(mockMergedScores);
    calculateOverallScore.mockReturnValue(81);
    calculateReadabilityMetrics.mockReturnValue(mockReadability);
    analyzeKeywords.mockReturnValue(mockKeywords);
    storeAnalysisResult.mockResolvedValue(mockStoredResult);

    await handler(req, res);

    expect(authenticateRequest).toHaveBeenCalledWith(req);
    expect(checkRateLimit).toHaveBeenCalledWith('user-123');
    expect(analyzeSentiment).toHaveBeenCalledWith(req.body.content);
    expect(calculateReadabilityMetrics).toHaveBeenCalledWith(req.body.content);
    expect(analyzeKeywords).toHaveBeenCalledWith(req.body.content, {
      topN: 10,
      densityThreshold: 3
    });
    expect(analyzeContentWithAI).toHaveBeenCalled();
    expect(storeAnalysisResult).toHaveBeenCalledWith(expect.objectContaining({
      readability: mockReadability,
      keywords: mockKeywords
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStoredResult);
  });

  it('should handle readability calculation errors gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSentiment = { Sentiment: 'POSITIVE', SentimentScore: { Positive: 0.8 } };
    const mockKeyPhrases = [{ Text: 'test', Score: 0.9 }];
    const mockSyntaxTokens = [{ TokenId: 1, Text: 'This' }];
    
    const mockLocalScores = {
      structure: { score: 80, confidence: 0.8, issues: [], strengths: [] },
      tone: { score: 75, confidence: 0.75, issues: [], strengths: [] },
      accessibility: { score: 85, confidence: 0.85, issues: [], strengths: [] },
      platformAlignment: { score: 90, confidence: 0.9, issues: [], strengths: [] }
    };

    const mockAIAnalysis = {
      dimensionScores: {
        structure: { score: 70, confidence: 0.9, issues: [], strengths: [] },
        tone: { score: 80, confidence: 0.85, issues: [], strengths: [] },
        accessibility: { score: 75, confidence: 0.8, issues: [], strengths: [] },
        platformAlignment: { score: 85, confidence: 0.9, issues: [], strengths: [] }
      },
      suggestions: [{ priority: 'high', title: 'Test suggestion' }]
    };

    const mockMergedScores = {
      structure: { score: 77, confidence: 0.83, issues: [], strengths: [] },
      tone: { score: 77, confidence: 0.79, issues: [], strengths: [] },
      accessibility: { score: 82, confidence: 0.83, issues: [], strengths: [] },
      platformAlignment: { score: 89, confidence: 0.9, issues: [], strengths: [] }
    };

    const mockStoredResult = {
      analysisId: 'analysis-123',
      userId: 'user-123',
      timestamp: '2024-01-01T00:00:00.000Z',
      content: req.body.content,
      targetPlatform: req.body.targetPlatform,
      contentIntent: req.body.contentIntent,
      overallScore: 81,
      dimensionScores: mockMergedScores,
      suggestions: mockAIAnalysis.suggestions,
      readability: null, // Readability calculation failed
      metadata: {
        processingTime: expect.any(Number),
        contentLength: 12,
        platformOptimized: true
      }
    };

    authenticateRequest.mockResolvedValue(mockUser);
    checkRateLimit.mockResolvedValue(true);
    analyzeSentiment.mockReturnValue(mockSentiment);
    extractKeyPhrases.mockReturnValue(mockKeyPhrases);
    analyzeSyntax.mockReturnValue(mockSyntaxTokens);
    analyzeStructure.mockReturnValue(mockLocalScores.structure);
    analyzeTone.mockReturnValue(mockLocalScores.tone);
    checkAccessibility.mockReturnValue(mockLocalScores.accessibility);
    analyzePlatformAlignment.mockReturnValue(mockLocalScores.platformAlignment);
    analyzeContentWithAI.mockResolvedValue(mockAIAnalysis);
    mergeDimensionScores.mockReturnValue(mockMergedScores);
    calculateOverallScore.mockReturnValue(81);
    calculateReadabilityMetrics.mockImplementation(() => {
      throw new Error('Readability calculation failed');
    });
    storeAnalysisResult.mockResolvedValue(mockStoredResult);

    await handler(req, res);

    expect(calculateReadabilityMetrics).toHaveBeenCalledWith(req.body.content);
    expect(storeAnalysisResult).toHaveBeenCalledWith(expect.objectContaining({
      readability: null
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStoredResult);
  });

  it('should handle keyword analysis errors gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSentiment = { Sentiment: 'POSITIVE', SentimentScore: { Positive: 0.8 } };
    const mockKeyPhrases = [{ Text: 'test', Score: 0.9 }];
    const mockSyntaxTokens = [{ TokenId: 1, Text: 'This' }];
    
    const mockLocalScores = {
      structure: { score: 80, confidence: 0.8, issues: [], strengths: [] },
      tone: { score: 75, confidence: 0.75, issues: [], strengths: [] },
      accessibility: { score: 85, confidence: 0.85, issues: [], strengths: [] },
      platformAlignment: { score: 90, confidence: 0.9, issues: [], strengths: [] }
    };

    const mockAIAnalysis = {
      dimensionScores: {
        structure: { score: 70, confidence: 0.9, issues: [], strengths: [] },
        tone: { score: 80, confidence: 0.85, issues: [], strengths: [] },
        accessibility: { score: 75, confidence: 0.8, issues: [], strengths: [] },
        platformAlignment: { score: 85, confidence: 0.9, issues: [], strengths: [] }
      },
      suggestions: [{ priority: 'high', title: 'Test suggestion' }]
    };

    const mockMergedScores = {
      structure: { score: 77, confidence: 0.83, issues: [], strengths: [] },
      tone: { score: 77, confidence: 0.79, issues: [], strengths: [] },
      accessibility: { score: 82, confidence: 0.83, issues: [], strengths: [] },
      platformAlignment: { score: 89, confidence: 0.9, issues: [], strengths: [] }
    };

    const mockReadability = {
      fleschKincaidScore: 65.5,
      gradeLevel: 8.2,
      readingTimeMinutes: 1,
      interpretation: 'Standard readability (8th-9th grade level). Accessible to middle school readers (grade 8.2).'
    };

    const mockStoredResult = {
      analysisId: 'analysis-123',
      userId: 'user-123',
      timestamp: '2024-01-01T00:00:00.000Z',
      content: req.body.content,
      targetPlatform: req.body.targetPlatform,
      contentIntent: req.body.contentIntent,
      overallScore: 81,
      dimensionScores: mockMergedScores,
      suggestions: mockAIAnalysis.suggestions,
      readability: mockReadability,
      keywords: null, // Keyword analysis failed
      metadata: {
        processingTime: expect.any(Number),
        contentLength: 12,
        platformOptimized: true
      }
    };

    authenticateRequest.mockResolvedValue(mockUser);
    checkRateLimit.mockResolvedValue(true);
    analyzeSentiment.mockReturnValue(mockSentiment);
    extractKeyPhrases.mockReturnValue(mockKeyPhrases);
    analyzeSyntax.mockReturnValue(mockSyntaxTokens);
    analyzeStructure.mockReturnValue(mockLocalScores.structure);
    analyzeTone.mockReturnValue(mockLocalScores.tone);
    checkAccessibility.mockReturnValue(mockLocalScores.accessibility);
    analyzePlatformAlignment.mockReturnValue(mockLocalScores.platformAlignment);
    analyzeContentWithAI.mockResolvedValue(mockAIAnalysis);
    mergeDimensionScores.mockReturnValue(mockMergedScores);
    calculateOverallScore.mockReturnValue(81);
    calculateReadabilityMetrics.mockReturnValue(mockReadability);
    analyzeKeywords.mockImplementation(() => {
      throw new Error('Keyword analysis failed');
    });
    storeAnalysisResult.mockResolvedValue(mockStoredResult);

    await handler(req, res);

    expect(analyzeKeywords).toHaveBeenCalledWith(req.body.content, {
      topN: 10,
      densityThreshold: 3
    });
    expect(storeAnalysisResult).toHaveBeenCalledWith(expect.objectContaining({
      keywords: null
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStoredResult);
  });

  it('should flag keywords with density > 3%', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSentiment = { Sentiment: 'POSITIVE', SentimentScore: { Positive: 0.8 } };
    const mockKeyPhrases = [{ Text: 'test', Score: 0.9 }];
    const mockSyntaxTokens = [{ TokenId: 1, Text: 'This' }];
    
    const mockLocalScores = {
      structure: { score: 80, confidence: 0.8, issues: [], strengths: [] },
      tone: { score: 75, confidence: 0.75, issues: [], strengths: [] },
      accessibility: { score: 85, confidence: 0.85, issues: [], strengths: [] },
      platformAlignment: { score: 90, confidence: 0.9, issues: [], strengths: [] }
    };

    const mockAIAnalysis = {
      dimensionScores: {
        structure: { score: 70, confidence: 0.9, issues: [], strengths: [] },
        tone: { score: 80, confidence: 0.85, issues: [], strengths: [] },
        accessibility: { score: 75, confidence: 0.8, issues: [], strengths: [] },
        platformAlignment: { score: 85, confidence: 0.9, issues: [], strengths: [] }
      },
      suggestions: [{ priority: 'high', title: 'Test suggestion' }]
    };

    const mockMergedScores = {
      structure: { score: 77, confidence: 0.83, issues: [], strengths: [] },
      tone: { score: 77, confidence: 0.79, issues: [], strengths: [] },
      accessibility: { score: 82, confidence: 0.83, issues: [], strengths: [] },
      platformAlignment: { score: 89, confidence: 0.9, issues: [], strengths: [] }
    };

    const mockReadability = {
      fleschKincaidScore: 65.5,
      gradeLevel: 8.2,
      readingTimeMinutes: 1,
      interpretation: 'Standard readability (8th-9th grade level). Accessible to middle school readers (grade 8.2).'
    };

    // Mock keywords with one keyword having density > 3%
    const mockKeywords = {
      primary: [
        { keyword: 'test', frequency: 5, density: 4.2 }, // Over 3% threshold
        { keyword: 'content', frequency: 2, density: 1.67 },
        { keyword: 'analysis', frequency: 2, density: 1.67 }
      ],
      totalWords: 12,
      uniqueKeywords: 8,
      density: {
        'test': 4.2,
        'content': 1.67,
        'analysis': 1.67
      },
      warnings: ['Keyword "test" has 4.20% density (threshold: 3%). This may indicate keyword stuffing.'],
      suggestions: ['Reduce repetition of high-density keywords to avoid keyword stuffing penalties.'],
      hasKeywordStuffing: true
    };

    const mockStoredResult = {
      analysisId: 'analysis-123',
      userId: 'user-123',
      timestamp: '2024-01-01T00:00:00.000Z',
      content: req.body.content,
      targetPlatform: req.body.targetPlatform,
      contentIntent: req.body.contentIntent,
      overallScore: 81,
      dimensionScores: mockMergedScores,
      suggestions: mockAIAnalysis.suggestions,
      readability: mockReadability,
      keywords: mockKeywords,
      metadata: {
        processingTime: expect.any(Number),
        contentLength: 12,
        platformOptimized: true
      }
    };

    authenticateRequest.mockResolvedValue(mockUser);
    checkRateLimit.mockResolvedValue(true);
    analyzeSentiment.mockReturnValue(mockSentiment);
    extractKeyPhrases.mockReturnValue(mockKeyPhrases);
    analyzeSyntax.mockReturnValue(mockSyntaxTokens);
    analyzeStructure.mockReturnValue(mockLocalScores.structure);
    analyzeTone.mockReturnValue(mockLocalScores.tone);
    checkAccessibility.mockReturnValue(mockLocalScores.accessibility);
    analyzePlatformAlignment.mockReturnValue(mockLocalScores.platformAlignment);
    analyzeContentWithAI.mockResolvedValue(mockAIAnalysis);
    mergeDimensionScores.mockReturnValue(mockMergedScores);
    calculateOverallScore.mockReturnValue(81);
    calculateReadabilityMetrics.mockReturnValue(mockReadability);
    analyzeKeywords.mockReturnValue(mockKeywords);
    storeAnalysisResult.mockResolvedValue(mockStoredResult);

    await handler(req, res);

    expect(analyzeKeywords).toHaveBeenCalledWith(req.body.content, {
      topN: 10,
      densityThreshold: 3
    });
    expect(storeAnalysisResult).toHaveBeenCalledWith(expect.objectContaining({
      keywords: expect.objectContaining({
        hasKeywordStuffing: true,
        warnings: expect.arrayContaining([
          expect.stringContaining('keyword stuffing')
        ])
      })
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockStoredResult);
  });

  it('should return 500 on server error', async () => {
    authenticateRequest.mockRejectedValue(new Error('Database error'));

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Analysis failed. Please try again later.',
      retryable: true 
    });
  });

  it('should handle OPTIONS request for CORS', async () => {
    req.method = 'OPTIONS';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  it('should return 405 for non-POST methods', async () => {
    req.method = 'GET';

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });
});
