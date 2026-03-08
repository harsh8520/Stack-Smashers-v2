const { authenticateRequest } = require('../lib/auth');
const { checkRateLimit } = require('../lib/rate-limit');
const { storeAnalysisResult } = require('../lib/storage');
const { analyzeContentWithAI } = require('../lib/groq-client');
const { analyzeSentiment, extractKeyPhrases, analyzeSyntax } = require('../lib/nlp-utils');
const { analyzeStructure } = require('../lib/analyzers/structure-analyzer');
const { analyzeTone } = require('../lib/analyzers/tone-analyzer');
const { checkAccessibility } = require('../lib/analyzers/accessibility-checker');
const { analyzePlatformAlignment } = require('../lib/analyzers/platform-adapter');
const { mergeDimensionScores, calculateOverallScore } = require('../lib/analyzers/score-merger');
const { calculateReadabilityMetrics } = require('../lib/readability');
const { analyzeKeywords } = require('../lib/keyword-analyzer');

/**
 * Content analysis endpoint
 * POST /api/analyze
 * 
 * Request body:
 * - content: string (required)
 * - targetPlatform: string (required) - 'blog' | 'linkedin' | 'twitter' | 'medium'
 * - contentIntent: string (required) - 'inform' | 'educate' | 'persuade'
 * 
 * Response:
 * - 200: Analysis result object
 * - 400: { error: string } - Invalid input
 * - 401: { error: string } - Unauthorized
 * - 429: { error: string } - Rate limit exceeded
 * - 500: { error: string } - Server error
 */
module.exports = async function handler(req, res) {
  const startTime = Date.now();
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate request
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check rate limit
    const rateLimitOk = await checkRateLimit(user.id);
    if (!rateLimitOk) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    // Parse and validate request body
    const { content, targetPlatform, contentIntent } = req.body;
    
    // Validate required fields
    if (!content || !targetPlatform || !contentIntent) {
      return res.status(400).json({ 
        error: 'Missing required fields: content, targetPlatform, and contentIntent are required' 
      });
    }

    // Validate content length
    const maxContentLength = parseInt(process.env.MAX_CONTENT_LENGTH || '2000', 10);
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    
    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }

    // Validate minimum content length (at least 10 words for meaningful analysis)
    if (wordCount < 10) {
      return res.status(400).json({ 
        error: 'Content is too short for meaningful analysis. Please provide at least 10 words.' 
      });
    }
    
    if (wordCount > maxContentLength) {
      return res.status(400).json({ 
        error: `Content exceeds maximum length of ${maxContentLength} words` 
      });
    }

    // Validate targetPlatform
    const validPlatforms = ['blog', 'linkedin', 'twitter', 'medium'];
    if (!validPlatforms.includes(targetPlatform)) {
      return res.status(400).json({ 
        error: `Invalid targetPlatform. Must be one of: ${validPlatforms.join(', ')}` 
      });
    }

    // Validate contentIntent
    const validIntents = ['inform', 'educate', 'persuade'];
    if (!validIntents.includes(contentIntent)) {
      return res.status(400).json({ 
        error: `Invalid contentIntent. Must be one of: ${validIntents.join(', ')}` 
      });
    }

    // Perform NLP analysis
    const sentiment = analyzeSentiment(content);
    const keyPhrases = extractKeyPhrases(content);
    const syntaxTokens = analyzeSyntax(content);

    // Calculate readability metrics
    let readability = null;
    try {
      readability = calculateReadabilityMetrics(content);
    } catch (error) {
      console.error('Readability calculation error:', error.message);
      // Continue without readability metrics - graceful degradation
    }

    // Analyze keywords for SEO
    let keywords = null;
    try {
      keywords = analyzeKeywords(content, {
        topN: 10,
        densityThreshold: 3
      });
    } catch (error) {
      console.error('Keyword analysis error:', error.message);
      // Continue without keyword analysis - graceful degradation
    }

    // Run local analyzers
    const localScores = {
      structure: analyzeStructure({ content, keyPhrases, syntaxTokens }),
      tone: analyzeTone({ content, sentiment, contentIntent }),
      accessibility: checkAccessibility({ content }),
      platformAlignment: analyzePlatformAlignment({ content, targetPlatform })
    };

    // Invoke AI for analysis
    const aiAnalysis = await analyzeContentWithAI({
      content,
      targetPlatform,
      contentIntent,
      wordCount
    });

    // Use AI scores directly (they already have hard caps applied)
    // Don't merge with local scores as that would inflate the hard-capped scores
    const dimensionScores = aiAnalysis.dimensionScores;
    const overallScore = aiAnalysis.overallScore;

    // Combine suggestions from AI
    const suggestions = aiAnalysis.suggestions || [];

    // Store result in Vercel KV
    const result = await storeAnalysisResult({
      userId: user.id,
      content,
      targetPlatform,
      contentIntent,
      overallScore,
      dimensionScores,
      suggestions,
      readability, // Add readability metrics to stored result
      keywords, // Add keyword analysis to stored result
      emotionalTone: aiAnalysis.emotionalTone, // Add emotional tone from AI
      rewrites: aiAnalysis.rewrites, // Add rewrite suggestions from AI
      improvementChecklist: aiAnalysis.improvementChecklist, // Add improvement checklist from AI
      metadata: {
        processingTime: Date.now() - startTime,
        contentLength: wordCount,
        platformOptimized: overallScore >= 70
      }
    });

    // Return analysis result
    return res.status(200).json(result);

  } catch (error) {
    console.error('Analysis error:', {
      message: error.message,
      stack: error.stack,
      method: req.method,
      path: req.url
    });
    
    return res.status(500).json({ 
      error: 'Analysis failed. Please try again later.',
      retryable: true 
    });
  }
};
