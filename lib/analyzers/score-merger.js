/**
 * Score Merger
 * Merges local analyzer scores with AI scores using weighted algorithm
 * Formula: mergedScore = localScore * 0.7 + aiScore * 0.3
 */

const LOCAL_WEIGHT = 0.7;
const AI_WEIGHT = 0.3;

/**
 * Merge a local analyzer score with an AI score
 * @param {Object} localScore - Score from local analyzer {score, confidence, issues, strengths}
 * @param {Object} aiScore - Score from AI analyzer {score, confidence, issues, strengths}
 * @returns {Object} Merged score object
 */
function mergeScores(localScore, aiScore) {
  // Calculate weighted score
  const mergedScoreValue = Math.round(
    localScore.score * LOCAL_WEIGHT + aiScore.score * AI_WEIGHT
  );
  
  // Merge issues (combine both, prioritize critical issues)
  const mergedIssues = [
    ...localScore.issues,
    ...aiScore.issues
  ].sort((a, b) => {
    const priority = { critical: 0, important: 1, minor: 2 };
    return priority[a.type] - priority[b.type];
  });
  
  // Merge strengths (combine and deduplicate)
  const mergedStrengths = [
    ...new Set([...localScore.strengths, ...aiScore.strengths])
  ];
  
  // Calculate merged confidence (weighted average)
  const mergedConfidence = 
    localScore.confidence * LOCAL_WEIGHT + aiScore.confidence * AI_WEIGHT;
  
  return {
    score: mergedScoreValue,
    confidence: Math.round(mergedConfidence * 100) / 100,
    issues: mergedIssues,
    strengths: mergedStrengths
  };
}

/**
 * Merge all dimension scores (structure, tone, accessibility, platform)
 * @param {Object} localScores - Scores from local analyzers
 * @param {Object} aiScores - Scores from AI analyzer
 * @returns {Object} Merged dimension scores
 */
function mergeDimensionScores(localScores, aiScores) {
  const dimensions = ['structure', 'tone', 'accessibility', 'platformAlignment'];
  const merged = {};
  
  dimensions.forEach(dimension => {
    const localScore = localScores[dimension] || {
      score: 50,
      confidence: 0.5,
      issues: [],
      strengths: []
    };
    
    const aiScore = aiScores[dimension] || {
      score: 50,
      confidence: 0.5,
      issues: [],
      strengths: []
    };
    
    merged[dimension] = mergeScores(localScore, aiScore);
  });
  
  return merged;
}

/**
 * Calculate overall score from dimension scores
 * @param {Object} dimensionScores - Merged dimension scores
 * @returns {number} Overall score (0-100)
 */
function calculateOverallScore(dimensionScores) {
  const dimensions = ['structure', 'tone', 'accessibility', 'platformAlignment'];
  const scores = dimensions.map(dim => dimensionScores[dim]?.score || 50);
  
  // Simple average of all dimensions
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  return Math.round(average);
}

module.exports = {
  mergeScores,
  mergeDimensionScores,
  calculateOverallScore
};
