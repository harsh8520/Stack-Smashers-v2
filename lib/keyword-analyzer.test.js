/**
 * Unit Tests for Keyword Analyzer
 * 
 * Tests keyword extraction, frequency counting, density calculation,
 * and SEO analysis functionality.
 */

const {
  extractKeywords,
  analyzeKeywordDensity,
  generateSEOSuggestions,
  analyzeKeywords,
  STOP_WORDS
} = require('./keyword-analyzer');

describe('Keyword Analyzer', () => {
  describe('extractKeywords', () => {
    test('should extract keywords from simple content', () => {
      const content = 'JavaScript is a programming language. JavaScript developers love JavaScript.';
      const result = extractKeywords(content, 5);

      expect(result.keywords).toBeDefined();
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.totalWords).toBeGreaterThan(0);
      
      // JavaScript should be the top keyword
      const topKeyword = result.keywords[0];
      expect(topKeyword.keyword).toBe('javascript');
      expect(topKeyword.frequency).toBe(3);
    });

    test('should filter out stop words', () => {
      const content = 'the and or but in on at to for of with is was are';
      const result = extractKeywords(content, 10);

      // All words are stop words, so no keywords should be extracted
      expect(result.keywords.length).toBe(0);
    });

    test('should calculate density correctly', () => {
      const content = 'test test test other other word'; // 6 words total
      const result = extractKeywords(content, 10);

      const testKeyword = result.keywords.find(kw => kw.keyword === 'test');
      expect(testKeyword).toBeDefined();
      expect(testKeyword.frequency).toBe(3);
      // Density should be (3/6) * 100 = 50%
      expect(testKeyword.density).toBeCloseTo(50, 1);
    });

    test('should sort keywords by frequency', () => {
      const content = 'apple banana apple cherry apple banana apple';
      const result = extractKeywords(content, 10);

      expect(result.keywords[0].keyword).toBe('apple'); // 4 occurrences
      expect(result.keywords[1].keyword).toBe('banana'); // 2 occurrences
      expect(result.keywords[2].keyword).toBe('cherry'); // 1 occurrence
    });

    test('should limit results to topN', () => {
      const content = 'one two three four five six seven eight nine ten eleven twelve';
      const result = extractKeywords(content, 5);

      expect(result.keywords.length).toBe(5);
    });

    test('should handle empty content', () => {
      const result = extractKeywords('', 10);

      expect(result.keywords).toEqual([]);
      expect(result.totalWords).toBe(0);
      expect(result.uniqueKeywords).toBe(0);
    });

    test('should handle null or undefined content', () => {
      const result1 = extractKeywords(null, 10);
      const result2 = extractKeywords(undefined, 10);

      expect(result1.keywords).toEqual([]);
      expect(result2.keywords).toEqual([]);
    });

    test('should filter out short words (less than 3 characters)', () => {
      const content = 'a ab abc abcd abcde';
      const result = extractKeywords(content, 10);

      // Only 'abc', 'abcd', 'abcde' should be included
      expect(result.keywords.length).toBe(3);
      expect(result.keywords.every(kw => kw.keyword.length >= 3)).toBe(true);
    });

    test('should handle punctuation correctly', () => {
      const content = 'Hello, world! This is a test. Testing, testing...';
      const result = extractKeywords(content, 10);

      // Should extract 'hello', 'world', 'test', 'testing'
      const keywords = result.keywords.map(kw => kw.keyword);
      expect(keywords).toContain('hello');
      expect(keywords).toContain('world');
      expect(keywords).toContain('test');
      expect(keywords).toContain('testing');
    });
  });

  describe('analyzeKeywordDensity', () => {
    test('should flag keywords above threshold', () => {
      const keywords = [
        { keyword: 'test', frequency: 10, density: 5.0 },
        { keyword: 'example', frequency: 5, density: 2.5 },
        { keyword: 'word', frequency: 8, density: 4.0 }
      ];

      const result = analyzeKeywordDensity(keywords, 3);

      expect(result.hasIssues).toBe(true);
      expect(result.flaggedKeywords.length).toBe(2); // 'test' and 'word'
      expect(result.warnings.length).toBe(2);
    });

    test('should not flag keywords below threshold', () => {
      const keywords = [
        { keyword: 'test', frequency: 5, density: 2.0 },
        { keyword: 'example', frequency: 3, density: 1.5 }
      ];

      const result = analyzeKeywordDensity(keywords, 3);

      expect(result.hasIssues).toBe(false);
      expect(result.flaggedKeywords.length).toBe(0);
      expect(result.warnings.length).toBe(0);
    });

    test('should use custom threshold', () => {
      const keywords = [
        { keyword: 'test', frequency: 10, density: 2.5 }
      ];

      const result = analyzeKeywordDensity(keywords, 2);

      expect(result.hasIssues).toBe(true);
      expect(result.threshold).toBe(2);
    });
  });

  describe('generateSEOSuggestions', () => {
    test('should suggest adding more keywords when count is low', () => {
      const keywordData = {
        keywords: [
          { keyword: 'test', frequency: 5, density: 2.0 }
        ],
        totalWords: 100,
        uniqueKeywords: 3
      };

      const densityAnalysis = {
        hasIssues: false,
        flaggedKeywords: [],
        warnings: []
      };

      const suggestions = generateSEOSuggestions(keywordData, densityAnalysis);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('more diverse keywords'))).toBe(true);
    });

    test('should suggest reducing keyword stuffing', () => {
      const keywordData = {
        keywords: [
          { keyword: 'test', frequency: 20, density: 5.0 }
        ],
        totalWords: 100,
        uniqueKeywords: 15
      };

      const densityAnalysis = {
        hasIssues: true,
        flaggedKeywords: [{ keyword: 'test', density: 5.0 }],
        warnings: ['Warning about test']
      };

      const suggestions = generateSEOSuggestions(keywordData, densityAnalysis);

      expect(suggestions.some(s => s.includes('keyword stuffing'))).toBe(true);
    });

    test('should suggest using synonyms for dominant keywords', () => {
      const keywordData = {
        keywords: [
          { keyword: 'test', frequency: 15, density: 3.5 },
          { keyword: 'example', frequency: 5, density: 1.0 }
        ],
        totalWords: 100,
        uniqueKeywords: 20
      };

      const densityAnalysis = {
        hasIssues: false,
        flaggedKeywords: [],
        warnings: []
      };

      const suggestions = generateSEOSuggestions(keywordData, densityAnalysis);

      expect(suggestions.some(s => s.includes('synonyms'))).toBe(true);
    });
  });

  describe('analyzeKeywords', () => {
    test('should perform complete keyword analysis', () => {
      const content = 'JavaScript programming is fun. JavaScript developers write JavaScript code every day.';
      const result = analyzeKeywords(content);

      expect(result.primary).toBeDefined();
      expect(result.totalWords).toBeGreaterThan(0);
      expect(result.uniqueKeywords).toBeGreaterThan(0);
      expect(result.density).toBeDefined();
      expect(result.warnings).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(typeof result.hasKeywordStuffing).toBe('boolean');
    });

    test('should detect keyword stuffing', () => {
      // Create content with high keyword density
      const keyword = 'optimization';
      const content = Array(20).fill(keyword).join(' ') + ' ' + Array(80).fill('word').join(' ');
      
      const result = analyzeKeywords(content, { densityThreshold: 3 });

      expect(result.hasKeywordStuffing).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('should respect custom options', () => {
      const content = 'one two three four five six seven eight nine ten';
      const result = analyzeKeywords(content, { topN: 3, densityThreshold: 5 });

      expect(result.primary.length).toBeLessThanOrEqual(3);
    });

    test('should create density map correctly', () => {
      const content = 'apple banana apple cherry';
      const result = analyzeKeywords(content);

      expect(result.density.apple).toBeDefined();
      expect(result.density.banana).toBeDefined();
      expect(result.density.cherry).toBeDefined();
      
      // Apple appears twice out of 4 words = 50%
      expect(result.density.apple).toBeCloseTo(50, 0);
    });
  });

  describe('STOP_WORDS', () => {
    test('should contain common stop words', () => {
      expect(STOP_WORDS.has('the')).toBe(true);
      expect(STOP_WORDS.has('and')).toBe(true);
      expect(STOP_WORDS.has('is')).toBe(true);
      expect(STOP_WORDS.has('a')).toBe(true);
    });

    test('should not contain meaningful keywords', () => {
      expect(STOP_WORDS.has('javascript')).toBe(false);
      expect(STOP_WORDS.has('programming')).toBe(false);
      expect(STOP_WORDS.has('developer')).toBe(false);
    });
  });
});
