/**
 * Tone Analyzer
 * Analyzes content tone and sentiment appropriateness
 */

function analyzeTone(input) {
  const { content, sentiment, contentIntent } = input;
  
  const issues = [];
  const strengths = [];
  let score = 100;
  
  // Analyze sentiment alignment with intent
  if (sentiment) {
    const sentimentType = sentiment.Sentiment;
    
    // Check if sentiment matches intent
    if (contentIntent === 'persuade' && sentimentType === 'NEGATIVE') {
      issues.push({
        type: 'important',
        category: 'tone',
        description: 'Negative tone may not be effective for persuasive content',
        suggestion: 'Consider using more positive or neutral language',
        reasoning: 'Persuasive content typically benefits from positive framing'
      });
      score -= 20;
    } else if (contentIntent === 'inform' && sentimentType === 'MIXED') {
      issues.push({
        type: 'minor',
        category: 'tone',
        description: 'Mixed sentiment may confuse informational content',
        suggestion: 'Maintain a consistent neutral tone',
        reasoning: 'Informational content should be objective'
      });
      score -= 10;
    } else {
      strengths.push('Tone aligns well with content intent');
    }
  }
  
  // Check for excessive exclamation marks
  const exclamationCount = (content.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    issues.push({
      type: 'minor',
      category: 'tone',
      description: 'Excessive use of exclamation marks',
      suggestion: 'Reduce exclamation marks for a more professional tone',
      reasoning: 'Too many exclamation marks can appear unprofessional'
    });
    score -= 5;
  }
  
  // Check for all caps (shouting)
  const allCapsWords = content.match(/\b[A-Z]{3,}\b/g) || [];
  if (allCapsWords.length > 2) {
    issues.push({
      type: 'important',
      category: 'tone',
      description: 'Multiple words in all caps detected',
      suggestion: 'Use normal capitalization for better readability',
      reasoning: 'All caps can be perceived as shouting'
    });
    score -= 15;
  }
  
  return {
    score: Math.max(0, score),
    confidence: 0.75,
    issues,
    strengths
  };
}

module.exports = {
  analyzeTone
};
