/**
 * Structure Analyzer
 * Analyzes content structure including paragraphs, sentences, and key phrases
 */

function analyzeStructure(input) {
  const { content, keyPhrases, syntaxTokens } = input;
  
  const issues = [];
  const strengths = [];
  let score = 100;
  
  // Analyze paragraph structure
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length < 2) {
    issues.push({
      type: 'important',
      category: 'structure',
      description: 'Content lacks clear paragraph structure',
      suggestion: 'Break content into multiple paragraphs',
      reasoning: 'Well-structured paragraphs improve readability'
    });
    score -= 15;
  } else {
    strengths.push('Clear paragraph structure');
  }
  
  // Analyze sentence length
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = content.split(/\s+/).length / sentences.length;
  
  if (avgSentenceLength > 25) {
    issues.push({
      type: 'minor',
      category: 'structure',
      description: 'Sentences are too long on average',
      suggestion: 'Break long sentences into shorter ones',
      reasoning: 'Shorter sentences improve clarity'
    });
    score -= 10;
  }
  
  // Check for key phrases (indicates good structure)
  if (keyPhrases && keyPhrases.length > 3) {
    strengths.push('Rich key phrase usage');
  }
  
  return {
    score: Math.max(0, score),
    confidence: 0.8,
    issues,
    strengths
  };
}

module.exports = {
  analyzeStructure
};
