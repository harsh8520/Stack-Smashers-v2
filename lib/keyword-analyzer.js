/**
 * Keyword Analysis Module
 * 
 * Provides keyword extraction and analysis functionality for SEO optimization.
 * Extracts keywords, calculates frequency and density, and identifies potential issues.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

/**
 * Common stop words to filter out from keyword analysis
 * These are high-frequency words that don't provide meaningful SEO value
 */
const STOP_WORDS = new Set([
  // Articles
  'a', 'an', 'the',
  // Conjunctions
  'and', 'or', 'but', 'nor', 'yet', 'so', 'for',
  // Prepositions
  'in', 'on', 'at', 'to', 'from', 'by', 'with', 'about', 'as', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'under', 'of',
  // Pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'this', 'that', 'these', 'those',
  // Verbs (common)
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing',
  'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can',
  // Adverbs
  'not', 'no', 'yes', 'very', 'too', 'also', 'just', 'only', 'even',
  // Others
  'what', 'which', 'who', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
  'own', 'same', 'than', 'then', 'there', 'here'
]);

/**
 * Extracts and analyzes keywords from content
 * 
 * This function:
 * 1. Extracts words from content
 * 2. Filters out common stop words
 * 3. Counts frequency for each keyword
 * 4. Calculates density (frequency / total words * 100)
 * 5. Sorts by frequency/relevance
 * 6. Returns top 5-10 keywords
 * 
 * @param {string} content - The text content to analyze
 * @param {number} topN - Number of top keywords to return (default: 10)
 * @returns {Object} Keyword analysis results
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
function extractKeywords(content, topN = 10) {
  if (!content || typeof content !== 'string') {
    return {
      keywords: [],
      totalWords: 0,
      uniqueKeywords: 0
    };
  }

  // Step 1: Extract words from content
  // Convert to lowercase and remove punctuation, then split into words
  const words = content
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ') // Keep hyphens and apostrophes for compound words
    .split(/\s+/)
    .filter(word => word.length > 0);

  const totalWords = words.length;

  // Step 2 & 3: Filter stop words and count frequency
  const keywordFrequency = {};
  
  words.forEach(word => {
    // Filter out stop words and very short words (less than 3 characters)
    if (!STOP_WORDS.has(word) && word.length >= 3) {
      keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
    }
  });

  // Step 4: Calculate density for each keyword
  // Density = (frequency / total words) * 100
  const keywordsWithDensity = Object.entries(keywordFrequency).map(([keyword, frequency]) => ({
    keyword,
    frequency,
    density: (frequency / totalWords) * 100
  }));

  // Step 5: Sort by frequency (descending)
  keywordsWithDensity.sort((a, b) => b.frequency - a.frequency);

  // Step 6: Return top N keywords
  const topKeywords = keywordsWithDensity.slice(0, Math.min(topN, keywordsWithDensity.length));

  return {
    keywords: topKeywords,
    totalWords,
    uniqueKeywords: keywordsWithDensity.length
  };
}

/**
 * Analyzes keyword density and flags potential issues
 * 
 * Checks if any keyword has density > 3% which may indicate keyword stuffing
 * 
 * @param {Array} keywords - Array of keyword objects with density property
 * @param {number} threshold - Density threshold percentage (default: 3)
 * @returns {Object} Analysis results with warnings
 * 
 * Requirements: 5.5
 */
function analyzeKeywordDensity(keywords, threshold = 3) {
  const warnings = [];
  const flaggedKeywords = [];

  keywords.forEach(({ keyword, density }) => {
    if (density > threshold) {
      flaggedKeywords.push({ keyword, density });
      warnings.push(
        `Keyword "${keyword}" has ${density.toFixed(2)}% density (threshold: ${threshold}%). ` +
        `This may indicate keyword stuffing.`
      );
    }
  });

  return {
    hasIssues: flaggedKeywords.length > 0,
    flaggedKeywords,
    warnings,
    threshold
  };
}

/**
 * Generates SEO suggestions based on keyword analysis
 * 
 * @param {Object} keywordData - Results from extractKeywords
 * @param {Object} densityAnalysis - Results from analyzeKeywordDensity
 * @returns {Array} Array of SEO suggestion strings
 * 
 * Requirements: 5.4
 */
function generateSEOSuggestions(keywordData, densityAnalysis) {
  const suggestions = [];

  // Check if there are enough keywords
  if (keywordData.keywords.length < 5) {
    suggestions.push(
      'Consider adding more diverse keywords to improve SEO coverage.'
    );
  }

  // Check for keyword stuffing
  if (densityAnalysis.hasIssues) {
    suggestions.push(
      'Reduce repetition of high-density keywords to avoid keyword stuffing penalties.'
    );
  }

  // Check if top keyword is too dominant
  if (keywordData.keywords.length > 0 && keywordData.keywords[0].density > 2) {
    suggestions.push(
      `The keyword "${keywordData.keywords[0].keyword}" appears very frequently. ` +
      `Consider using synonyms or related terms for better SEO.`
    );
  }

  // Check for very low keyword diversity
  if (keywordData.uniqueKeywords < 10 && keywordData.totalWords > 100) {
    suggestions.push(
      'Low keyword diversity detected. Use more varied vocabulary to improve content richness.'
    );
  }

  return suggestions;
}

/**
 * Performs complete keyword analysis
 * 
 * Combines extraction, density analysis, and suggestion generation
 * 
 * @param {string} content - The text content to analyze
 * @param {Object} options - Configuration options
 * @param {number} options.topN - Number of top keywords to return (default: 10)
 * @param {number} options.densityThreshold - Density threshold for warnings (default: 3)
 * @returns {Object} Complete keyword analysis
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
function analyzeKeywords(content, options = {}) {
  const { topN = 10, densityThreshold = 3 } = options;

  // Extract keywords
  const keywordData = extractKeywords(content, topN);

  // Analyze density
  const densityAnalysis = analyzeKeywordDensity(keywordData.keywords, densityThreshold);

  // Generate suggestions
  const suggestions = generateSEOSuggestions(keywordData, densityAnalysis);

  return {
    primary: keywordData.keywords,
    totalWords: keywordData.totalWords,
    uniqueKeywords: keywordData.uniqueKeywords,
    density: keywordData.keywords.reduce((acc, kw) => {
      acc[kw.keyword] = kw.density;
      return acc;
    }, {}),
    warnings: densityAnalysis.warnings,
    suggestions,
    hasKeywordStuffing: densityAnalysis.hasIssues
  };
}

module.exports = {
  extractKeywords,
  analyzeKeywordDensity,
  generateSEOSuggestions,
  analyzeKeywords,
  STOP_WORDS // Export for testing purposes
};
