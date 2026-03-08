/**
 * Accessibility Checker
 * Analyzes content for accessibility and readability
 */

function checkAccessibility(input) {
  const { content } = input;
  
  const issues = [];
  const strengths = [];
  let score = 100;
  
  // Check for complex words (more than 3 syllables)
  const words = content.split(/\s+/);
  const complexWords = words.filter(word => estimateSyllables(word) > 3);
  const complexWordRatio = complexWords.length / words.length;
  
  if (complexWordRatio > 0.15) {
    issues.push({
      type: 'important',
      category: 'accessibility',
      description: 'High percentage of complex words',
      suggestion: 'Use simpler vocabulary where possible',
      reasoning: 'Complex words reduce readability for diverse audiences'
    });
    score -= 20;
  } else if (complexWordRatio < 0.05) {
    strengths.push('Simple, accessible vocabulary');
  }
  
  // Check average word length
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  if (avgWordLength > 6) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Average word length is high',
      suggestion: 'Use shorter words for better readability',
      reasoning: 'Shorter words are easier to read and understand'
    });
    score -= 10;
  }
  
  // Check for jargon indicators (technical terms)
  const jargonPatterns = [
    /\b(utilize|leverage|synergy|paradigm|optimize)\b/gi,
    /\b[A-Z]{2,}\b/g // Acronyms
  ];
  
  let jargonCount = 0;
  jargonPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) jargonCount += matches.length;
  });
  
  if (jargonCount > 5) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Multiple technical terms or jargon detected',
      suggestion: 'Define technical terms or use simpler alternatives',
      reasoning: 'Jargon can exclude readers unfamiliar with the terminology'
    });
    score -= 10;
  }
  
  // Check for passive voice indicators
  const passiveIndicators = content.match(/\b(was|were|been|being)\s+\w+ed\b/gi) || [];
  const passiveRatio = passiveIndicators.length / (words.length / 10);
  
  if (passiveRatio > 0.3) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Frequent use of passive voice',
      suggestion: 'Use active voice for clearer communication',
      reasoning: 'Active voice is more direct and easier to understand'
    });
    score -= 5;
  }
  
  return {
    score: Math.max(0, score),
    confidence: 0.7,
    issues,
    strengths
  };
}

/**
 * Estimate syllable count for a word
 * Simple heuristic based on vowel groups
 */
function estimateSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;
  
  // Adjust for silent e
  if (word.endsWith('e')) count--;
  
  return Math.max(1, count);
}

module.exports = {
  checkAccessibility
};
