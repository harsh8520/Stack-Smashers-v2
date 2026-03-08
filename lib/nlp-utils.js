/**
 * NLP Utilities - Replaces AWS Comprehend
 * 
 * This module provides sentiment analysis, key phrase extraction, and syntax analysis
 * while maintaining AWS Comprehend data structure compatibility.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

const Sentiment = require('sentiment');

/**
 * Analyzes sentiment of the given content
 * 
 * Uses the sentiment library to analyze text and returns results in AWS Comprehend format
 * for compatibility with existing code.
 * 
 * @param {string} content - The text content to analyze
 * @returns {Object} Sentiment analysis in AWS Comprehend format
 * 
 * Requirements: 9.1, 9.4
 */
function analyzeSentiment(content) {
  const sentiment = new Sentiment();
  const result = sentiment.analyze(content);
  
  // Map sentiment score to AWS Comprehend format
  // sentiment library returns scores typically ranging from -10 to +10
  // We normalize this to 0-1 range for AWS Comprehend compatibility
  let sentimentType = 'NEUTRAL';
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0.5;
  
  if (result.score > 2) {
    sentimentType = 'POSITIVE';
    positiveScore = Math.min(1, Math.abs(result.score) / 10);
    negativeScore = 0;
    neutralScore = 1 - positiveScore;
  } else if (result.score < -2) {
    sentimentType = 'NEGATIVE';
    negativeScore = Math.min(1, Math.abs(result.score) / 10);
    positiveScore = 0;
    neutralScore = 1 - negativeScore;
  } else {
    // Neutral sentiment
    neutralScore = 0.8;
    positiveScore = 0.1;
    negativeScore = 0.1;
  }
  
  // Return in AWS Comprehend format
  return {
    Sentiment: sentimentType,
    SentimentScore: {
      Positive: positiveScore,
      Negative: negativeScore,
      Neutral: neutralScore,
      Mixed: 0
    }
  };
}

/**
 * Extracts key phrases from the given content
 * 
 * Performs simple key phrase extraction by filtering out common stop words
 * and returning significant words/phrases.
 * 
 * @param {string} content - The text content to analyze
 * @returns {Array} Array of key phrases in AWS Comprehend format
 * 
 * Requirements: 9.2, 9.4
 */
function extractKeyPhrases(content) {
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
    'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'just', 'as', 'from', 'by'
  ]);
  
  // Split content into words and clean them
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  // Count word frequencies
  const wordFrequency = {};
  words.forEach(word => {
    if (!stopWords.has(word) && word.length > 3) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  });
  
  // Sort by frequency and get top phrases
  const sortedPhrases = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  // Return in AWS Comprehend format
  return sortedPhrases.map(([phrase, frequency]) => ({
    Text: phrase,
    Score: Math.min(0.99, frequency / words.length * 10), // Normalize score
    BeginOffset: content.toLowerCase().indexOf(phrase),
    EndOffset: content.toLowerCase().indexOf(phrase) + phrase.length
  }));
}

/**
 * Analyzes syntax of the given content
 * 
 * Performs basic syntax analysis by tokenizing the content into words.
 * This is a simplified version compared to AWS Comprehend's full POS tagging.
 * 
 * @param {string} content - The text content to analyze
 * @returns {Array} Array of syntax tokens in AWS Comprehend format
 * 
 * Requirements: 9.3, 9.4
 */
function analyzeSyntax(content) {
  // Split content into words (tokens)
  const words = content.split(/\s+/).filter(word => word.length > 0);
  
  // Simple heuristic for part-of-speech tagging
  // This is a simplified approach - AWS Comprehend uses sophisticated NLP models
  let currentOffset = 0;
  const tokens = words.map((word, index) => {
    let posTag = 'NOUN'; // Default to NOUN
    
    // Simple heuristics for common POS patterns
    const lowerWord = word.toLowerCase();
    
    // Common verbs
    if (lowerWord.match(/ing$|ed$|s$/) && lowerWord.length > 4) {
      posTag = 'VERB';
    }
    
    // Common adjectives
    if (lowerWord.match(/ful$|less$|ous$|ive$|able$|ible$/)) {
      posTag = 'ADJ';
    }
    
    // Common adverbs
    if (lowerWord.match(/ly$/)) {
      posTag = 'ADV';
    }
    
    // Determiners
    if (['the', 'a', 'an', 'this', 'that', 'these', 'those'].includes(lowerWord)) {
      posTag = 'DET';
    }
    
    // Pronouns
    if (['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'].includes(lowerWord)) {
      posTag = 'PRON';
    }
    
    // Prepositions
    if (['in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'about', 'of'].includes(lowerWord)) {
      posTag = 'ADP';
    }
    
    // Conjunctions
    if (['and', 'or', 'but', 'nor', 'yet', 'so'].includes(lowerWord)) {
      posTag = 'CONJ';
    }
    
    // Find the word's position in the content
    const beginOffset = content.indexOf(word, currentOffset);
    const endOffset = beginOffset + word.length;
    currentOffset = endOffset;
    
    // Return in AWS Comprehend format
    return {
      TokenId: index + 1,
      Text: word,
      BeginOffset: beginOffset,
      EndOffset: endOffset,
      PartOfSpeech: {
        Tag: posTag,
        Score: 0.8 // Confidence score
      }
    };
  });
  
  return tokens;
}

module.exports = {
  analyzeSentiment,
  extractKeyPhrases,
  analyzeSyntax
};
