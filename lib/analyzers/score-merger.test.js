/**
 * Tests for Score Merger
 */

const { mergeScores, mergeDimensionScores, calculateOverallScore } = require('./score-merger.js');

describe('Score Merger', () => {
  describe('mergeScores', () => {
    test('should merge scores with 70/30 weighting', () => {
      const localScore = {
        score: 80,
        confidence: 0.8,
        issues: [],
        strengths: ['Good structure']
      };
      
      const aiScore = {
        score: 60,
        confidence: 0.9,
        issues: [],
        strengths: ['Clear message']
      };
      
      const result = mergeScores(localScore, aiScore);
      
      // Expected: 80 * 0.7 + 60 * 0.3 = 56 + 18 = 74
      expect(result.score).toBe(74);
      expect(result.confidence).toBeCloseTo(0.83, 2);
      expect(result.strengths).toContain('Good structure');
      expect(result.strengths).toContain('Clear message');
    });
    
    test('should handle edge case with score 0', () => {
      const localScore = {
        score: 0,
        confidence: 0.5,
        issues: [],
        strengths: []
      };
      
      const aiScore = {
        score: 100,
        confidence: 0.5,
        issues: [],
        strengths: []
      };
      
      const result = mergeScores(localScore, aiScore);
      
      // Expected: 0 * 0.7 + 100 * 0.3 = 0 + 30 = 30
      expect(result.score).toBe(30);
    });
    
    test('should handle edge case with score 100', () => {
      const localScore = {
        score: 100,
        confidence: 0.8,
        issues: [],
        strengths: []
      };
      
      const aiScore = {
        score: 0,
        confidence: 0.8,
        issues: [],
        strengths: []
      };
      
      const result = mergeScores(localScore, aiScore);
      
      // Expected: 100 * 0.7 + 0 * 0.3 = 70 + 0 = 70
      expect(result.score).toBe(70);
    });
    
    test('should merge and sort issues by priority', () => {
      const localScore = {
        score: 70,
        confidence: 0.7,
        issues: [
          { type: 'minor', category: 'structure', description: 'Minor issue' }
        ],
        strengths: []
      };
      
      const aiScore = {
        score: 70,
        confidence: 0.7,
        issues: [
          { type: 'critical', category: 'tone', description: 'Critical issue' },
          { type: 'important', category: 'tone', description: 'Important issue' }
        ],
        strengths: []
      };
      
      const result = mergeScores(localScore, aiScore);
      
      expect(result.issues).toHaveLength(3);
      expect(result.issues[0].type).toBe('critical');
      expect(result.issues[1].type).toBe('important');
      expect(result.issues[2].type).toBe('minor');
    });
    
    test('should deduplicate strengths', () => {
      const localScore = {
        score: 80,
        confidence: 0.8,
        issues: [],
        strengths: ['Clear structure', 'Good flow']
      };
      
      const aiScore = {
        score: 80,
        confidence: 0.8,
        issues: [],
        strengths: ['Clear structure', 'Engaging content']
      };
      
      const result = mergeScores(localScore, aiScore);
      
      expect(result.strengths).toHaveLength(3);
      expect(result.strengths).toContain('Clear structure');
      expect(result.strengths).toContain('Good flow');
      expect(result.strengths).toContain('Engaging content');
    });
  });
  
  describe('mergeDimensionScores', () => {
    test('should merge all dimensions', () => {
      const localScores = {
        structure: { score: 80, confidence: 0.8, issues: [], strengths: [] },
        tone: { score: 70, confidence: 0.7, issues: [], strengths: [] },
        accessibility: { score: 90, confidence: 0.9, issues: [], strengths: [] },
        platformAlignment: { score: 85, confidence: 0.85, issues: [], strengths: [] }
      };
      
      const aiScores = {
        structure: { score: 60, confidence: 0.9, issues: [], strengths: [] },
        tone: { score: 80, confidence: 0.8, issues: [], strengths: [] },
        accessibility: { score: 70, confidence: 0.7, issues: [], strengths: [] },
        platformAlignment: { score: 75, confidence: 0.75, issues: [], strengths: [] }
      };
      
      const result = mergeDimensionScores(localScores, aiScores);
      
      // structure: 80 * 0.7 + 60 * 0.3 = 56 + 18 = 74
      expect(result.structure.score).toBe(74);
      
      // tone: 70 * 0.7 + 80 * 0.3 = 49 + 24 = 73
      expect(result.tone.score).toBe(73);
      
      // accessibility: 90 * 0.7 + 70 * 0.3 = 63 + 21 = 84
      expect(result.accessibility.score).toBe(84);
      
      // platformAlignment: 85 * 0.7 + 75 * 0.3 = 59.5 + 22.5 = 82
      expect(result.platformAlignment.score).toBe(82);
    });
    
    test('should handle missing dimensions with defaults', () => {
      const localScores = {
        structure: { score: 80, confidence: 0.8, issues: [], strengths: [] }
      };
      
      const aiScores = {
        tone: { score: 70, confidence: 0.7, issues: [], strengths: [] }
      };
      
      const result = mergeDimensionScores(localScores, aiScores);
      
      expect(result.structure).toBeDefined();
      expect(result.tone).toBeDefined();
      expect(result.accessibility).toBeDefined();
      expect(result.platformAlignment).toBeDefined();
    });
  });
  
  describe('calculateOverallScore', () => {
    test('should calculate average of all dimension scores', () => {
      const dimensionScores = {
        structure: { score: 80 },
        tone: { score: 70 },
        accessibility: { score: 90 },
        platformAlignment: { score: 60 }
      };
      
      const result = calculateOverallScore(dimensionScores);
      
      // Average: (80 + 70 + 90 + 60) / 4 = 75
      expect(result).toBe(75);
    });
    
    test('should handle missing scores with default of 50', () => {
      const dimensionScores = {
        structure: { score: 80 }
      };
      
      const result = calculateOverallScore(dimensionScores);
      
      // Average: (80 + 50 + 50 + 50) / 4 = 57.5 -> 58
      expect(result).toBe(58);
    });
  });
});
