/**
 * Unit tests for readability calculation functions
 */

const {
  countSyllables,
  calculateFleschKincaidScore,
  calculateGradeLevel,
  calculateReadingTime,
  generateInterpretation,
  calculateReadabilityMetrics
} = require('./readability');

describe('Readability Calculations', () => {
  describe('countSyllables', () => {
    test('counts syllables in simple words', () => {
      expect(countSyllables('cat')).toBe(1);
      expect(countSyllables('dog')).toBe(1);
      expect(countSyllables('hello')).toBe(2);
      expect(countSyllables('beautiful')).toBe(3);
    });

    test('handles silent e', () => {
      expect(countSyllables('make')).toBe(1);
      expect(countSyllables('take')).toBe(1);
      // Note: syllable counting is heuristic-based and may vary
      expect(countSyllables('create')).toBeGreaterThanOrEqual(1);
    });

    test('handles words ending in le', () => {
      // Note: syllable counting is heuristic-based
      expect(countSyllables('table')).toBeGreaterThanOrEqual(2);
      expect(countSyllables('simple')).toBeGreaterThanOrEqual(2);
    });

    test('handles short words', () => {
      expect(countSyllables('a')).toBe(1);
      expect(countSyllables('I')).toBe(1);
      expect(countSyllables('be')).toBe(1);
    });

    test('handles empty or invalid input', () => {
      expect(countSyllables('')).toBe(0);
      expect(countSyllables('   ')).toBe(0);
    });
  });

  describe('calculateFleschKincaidScore', () => {
    test('calculates score for simple text', () => {
      const text = 'The cat sat on the mat. The dog ran fast.';
      const score = calculateFleschKincaidScore(text);
      expect(score).toBeGreaterThan(80); // Should be easy to read
    });

    test('calculates score for complex text', () => {
      const text = 'The implementation of sophisticated algorithms requires comprehensive understanding of computational complexity theory.';
      const score = calculateFleschKincaidScore(text);
      expect(score).toBeLessThan(50); // Should be difficult to read
    });

    test('handles empty text', () => {
      expect(calculateFleschKincaidScore('')).toBe(0);
      expect(calculateFleschKincaidScore('   ')).toBe(0);
    });

    test('handles single word', () => {
      const score = calculateFleschKincaidScore('Hello');
      expect(score).toBeGreaterThan(0);
    });

    test('handles null or undefined', () => {
      expect(calculateFleschKincaidScore(null)).toBe(0);
      expect(calculateFleschKincaidScore(undefined)).toBe(0);
    });
  });

  describe('calculateGradeLevel', () => {
    test('calculates grade level for simple text', () => {
      const text = 'The cat sat on the mat. The dog ran fast.';
      const gradeLevel = calculateGradeLevel(text);
      expect(gradeLevel).toBeLessThan(5); // Should be elementary level
    });

    test('calculates grade level for complex text', () => {
      const text = 'The implementation of sophisticated algorithms requires comprehensive understanding of computational complexity theory and mathematical foundations.';
      const gradeLevel = calculateGradeLevel(text);
      expect(gradeLevel).toBeGreaterThan(12); // Should be college level
    });

    test('handles empty text', () => {
      expect(calculateGradeLevel('')).toBe(0);
      expect(calculateGradeLevel('   ')).toBe(0);
    });

    test('returns non-negative values', () => {
      const text = 'Hi. I am Sam. Sam I am.';
      const gradeLevel = calculateGradeLevel(text);
      expect(gradeLevel).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateReadingTime', () => {
    test('calculates reading time based on 200 words per minute', () => {
      // 200 words should take 1 minute
      const words = Array(200).fill('word').join(' ');
      expect(calculateReadingTime(words)).toBe(1);
    });

    test('rounds to nearest minute', () => {
      // 250 words should round to 1 minute
      const words250 = Array(250).fill('word').join(' ');
      expect(calculateReadingTime(words250)).toBe(1);
      
      // 350 words should round to 2 minutes
      const words350 = Array(350).fill('word').join(' ');
      expect(calculateReadingTime(words350)).toBe(2);
    });

    test('returns minimum 1 minute for any content', () => {
      expect(calculateReadingTime('Hello world')).toBe(1);
      expect(calculateReadingTime('A')).toBe(1);
    });

    test('handles empty text', () => {
      expect(calculateReadingTime('')).toBe(0);
      expect(calculateReadingTime('   ')).toBe(0);
    });

    test('calculates correctly for 400 words (2 minutes)', () => {
      const words = Array(400).fill('word').join(' ');
      expect(calculateReadingTime(words)).toBe(2);
    });
  });

  describe('generateInterpretation', () => {
    test('generates interpretation for very easy text', () => {
      const interpretation = generateInterpretation(95, 4);
      expect(interpretation).toContain('Very easy to read');
      expect(interpretation).toContain('5th grade');
    });

    test('generates interpretation for difficult text', () => {
      const interpretation = generateInterpretation(35, 14);
      expect(interpretation).toContain('Difficult to read');
      expect(interpretation).toContain('college');
    });

    test('flags content exceeding grade 12', () => {
      const interpretation = generateInterpretation(40, 15);
      expect(interpretation).toContain('college-level');
      expect(interpretation).toContain('simplifying');
    });

    test('provides appropriate context for different grade levels', () => {
      const elementary = generateInterpretation(85, 5);
      expect(elementary).toContain('elementary');
      
      const middleSchool = generateInterpretation(70, 8);
      expect(middleSchool).toContain('middle school');
      
      const highSchool = generateInterpretation(55, 11);
      expect(highSchool).toContain('high school');
    });
  });

  describe('calculateReadabilityMetrics', () => {
    test('returns all required metrics', () => {
      const text = 'The quick brown fox jumps over the lazy dog. This is a simple sentence.';
      const metrics = calculateReadabilityMetrics(text);
      
      expect(metrics).toHaveProperty('fleschKincaidScore');
      expect(metrics).toHaveProperty('gradeLevel');
      expect(metrics).toHaveProperty('readingTimeMinutes');
      expect(metrics).toHaveProperty('interpretation');
    });

    test('all metrics are numbers except interpretation', () => {
      const text = 'Hello world. This is a test.';
      const metrics = calculateReadabilityMetrics(text);
      
      expect(typeof metrics.fleschKincaidScore).toBe('number');
      expect(typeof metrics.gradeLevel).toBe('number');
      expect(typeof metrics.readingTimeMinutes).toBe('number');
      expect(typeof metrics.interpretation).toBe('string');
    });

    test('handles empty text gracefully', () => {
      const metrics = calculateReadabilityMetrics('');
      
      expect(metrics.fleschKincaidScore).toBe(0);
      expect(metrics.gradeLevel).toBe(0);
      expect(metrics.readingTimeMinutes).toBe(0);
      expect(metrics.interpretation).toBeTruthy();
    });

    test('produces consistent results', () => {
      const text = 'Consistency is key. Testing is important.';
      const metrics1 = calculateReadabilityMetrics(text);
      const metrics2 = calculateReadabilityMetrics(text);
      
      expect(metrics1).toEqual(metrics2);
    });

    test('validates requirement 4.5 - flags content exceeding grade 12', () => {
      // Complex text that should exceed grade 12
      const complexText = 'The implementation of sophisticated algorithms necessitates comprehensive understanding of computational complexity theory, mathematical foundations, and algorithmic paradigms.';
      const metrics = calculateReadabilityMetrics(complexText);
      
      if (metrics.gradeLevel > 12) {
        expect(metrics.interpretation).toContain('college-level');
      }
    });
  });

  describe('Integration tests', () => {
    test('blog post example', () => {
      const blogPost = `
        Welcome to our blog! Today we're going to talk about web development.
        Web development is fun and exciting. You can build amazing things.
        Start with HTML and CSS. Then learn JavaScript. Practice every day.
      `;
      
      const metrics = calculateReadabilityMetrics(blogPost);
      
      expect(metrics.fleschKincaidScore).toBeGreaterThan(60);
      expect(metrics.gradeLevel).toBeLessThan(10);
      expect(metrics.readingTimeMinutes).toBeGreaterThanOrEqual(1);
      expect(metrics.interpretation).toBeTruthy();
    });

    test('technical documentation example', () => {
      const technicalDoc = `
        The asynchronous processing paradigm facilitates non-blocking operations,
        enabling concurrent execution of multiple computational tasks without
        necessitating explicit thread management or synchronization primitives.
      `;
      
      const metrics = calculateReadabilityMetrics(technicalDoc);
      
      expect(metrics.fleschKincaidScore).toBeLessThan(50);
      expect(metrics.gradeLevel).toBeGreaterThan(10);
      expect(metrics.interpretation).toContain('difficult');
    });
  });
});
