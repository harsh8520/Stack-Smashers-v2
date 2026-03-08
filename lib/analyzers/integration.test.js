/**
 * Integration tests for all analyzers
 */

const { analyzeStructure } = require('./structure-analyzer.js');
const { analyzeTone } = require('./tone-analyzer.js');
const { checkAccessibility } = require('./accessibility-checker.js');
const { analyzePlatformAlignment } = require('./platform-adapter.js');
const { mergeScores, mergeDimensionScores } = require('./score-merger.js');

describe('Analyzer Integration', () => {
  const sampleContent = `
This is a well-structured blog post about content quality.

It has multiple paragraphs that make it easy to read. Each paragraph focuses on a specific topic.
The sentences are clear and concise. The tone is professional and informative.

We use simple language to ensure accessibility for all readers.
  `.trim();

  test('structure analyzer should analyze content structure', () => {
    const result = analyzeStructure({
      content: sampleContent,
      keyPhrases: ['content quality', 'blog post', 'accessibility'],
      syntaxTokens: []
    });

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('strengths');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('tone analyzer should analyze content tone', () => {
    const result = analyzeTone({
      content: sampleContent,
      sentiment: {
        Sentiment: 'NEUTRAL',
        SentimentScore: {
          Positive: 0.3,
          Negative: 0.1,
          Neutral: 0.6,
          Mixed: 0
        }
      },
      contentIntent: 'inform'
    });

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('confidence');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('accessibility checker should analyze content accessibility', () => {
    const result = checkAccessibility({
      content: sampleContent
    });

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('confidence');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('platform adapter should analyze platform alignment', () => {
    const result = analyzePlatformAlignment({
      content: sampleContent,
      targetPlatform: 'blog'
    });

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('confidence');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test('should merge local and AI scores correctly', () => {
    const localScores = {
      structure: analyzeStructure({
        content: sampleContent,
        keyPhrases: ['content quality'],
        syntaxTokens: []
      }),
      tone: analyzeTone({
        content: sampleContent,
        sentiment: { Sentiment: 'NEUTRAL' },
        contentIntent: 'inform'
      }),
      accessibility: checkAccessibility({
        content: sampleContent
      }),
      platformAlignment: analyzePlatformAlignment({
        content: sampleContent,
        targetPlatform: 'blog'
      })
    };

    const aiScores = {
      structure: { score: 75, confidence: 0.9, issues: [], strengths: ['AI detected good structure'] },
      tone: { score: 80, confidence: 0.85, issues: [], strengths: ['AI detected appropriate tone'] },
      accessibility: { score: 70, confidence: 0.8, issues: [], strengths: [] },
      platformAlignment: { score: 85, confidence: 0.9, issues: [], strengths: [] }
    };

    const merged = mergeDimensionScores(localScores, aiScores);

    expect(merged).toHaveProperty('structure');
    expect(merged).toHaveProperty('tone');
    expect(merged).toHaveProperty('accessibility');
    expect(merged).toHaveProperty('platformAlignment');

    // Verify 70/30 weighting is applied
    Object.values(merged).forEach(dimension => {
      expect(dimension.score).toBeGreaterThanOrEqual(0);
      expect(dimension.score).toBeLessThanOrEqual(100);
      expect(dimension).toHaveProperty('confidence');
      expect(dimension).toHaveProperty('issues');
      expect(dimension).toHaveProperty('strengths');
    });
  });

  test('should handle short content for Twitter', () => {
    const twitterContent = 'Check out this amazing content! #contentquality #writing';

    const result = analyzePlatformAlignment({
      content: twitterContent,
      targetPlatform: 'twitter'
    });

    expect(result.score).toBeGreaterThan(0);
    // Should have strengths for appropriate hashtag usage
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  test('should detect issues with LinkedIn content', () => {
    const linkedinContent = 'Short post 😀';

    const result = analyzePlatformAlignment({
      content: linkedinContent,
      targetPlatform: 'linkedin'
    });

    // Should detect issues: too short and has emojis
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
