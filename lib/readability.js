/**
 * Readability Calculation Helper Functions
 * 
 * This module provides functions to calculate readability metrics for text content,
 * including Flesch-Kincaid reading ease, grade level, and reading time estimates.
 */

/**
 * Count syllables in a word using a heuristic approach
 * @param {string} word - The word to count syllables for
 * @returns {number} Estimated syllable count
 */
function countSyllables(word) {
  word = word.toLowerCase().trim();
  
  // Remove non-alphabetic characters
  word = word.replace(/[^a-z]/g, '');
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;
  
  // Count vowel groups
  const vowels = word.match(/[aeiouy]+/g);
  let syllableCount = vowels ? vowels.length : 0;
  
  // Adjust for silent 'e' at the end (but not if it's the only vowel group or part of 'le')
  if (word.endsWith('e') && syllableCount > 1 && !word.endsWith('le')) {
    // Check if the 'e' is part of a vowel group (like 'ee', 'ea', 'ie')
    const lastVowelGroup = vowels[vowels.length - 1];
    if (lastVowelGroup.length === 1) {
      syllableCount--;
    }
  }
  
  // Adjust for common patterns like 'le' at the end
  if (word.endsWith('le') && word.length > 2 && !/[aeiouy]/.test(word[word.length - 3])) {
    syllableCount++;
  }
  
  // Ensure at least 1 syllable
  return Math.max(syllableCount, 1);
}

/**
 * Calculate Flesch-Kincaid Reading Ease score
 * Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
 * 
 * Score interpretation:
 * 90-100: Very easy (5th grade)
 * 80-89: Easy (6th grade)
 * 70-79: Fairly easy (7th grade)
 * 60-69: Standard (8th-9th grade)
 * 50-59: Fairly difficult (10th-12th grade)
 * 30-49: Difficult (college)
 * 0-29: Very difficult (college graduate)
 * 
 * @param {string} text - The text content to analyze
 * @returns {number} Flesch-Kincaid reading ease score (0-100+)
 */
function calculateFleschKincaidScore(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return 0;
  }
  
  // Split into sentences (basic approach using common sentence endings)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalSentences = Math.max(sentences.length, 1);
  
  // Split into words
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const totalWords = words.length;
  
  if (totalWords === 0) {
    return 0;
  }
  
  // Count total syllables
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  // Calculate Flesch-Kincaid Reading Ease
  const score = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
  
  // Round to 1 decimal place
  return Math.round(score * 10) / 10;
}

/**
 * Calculate grade level from Flesch-Kincaid score
 * Uses the Flesch-Kincaid Grade Level formula:
 * 0.39 * (total words / total sentences) + 11.8 * (total syllables / total words) - 15.59
 * 
 * @param {string} text - The text content to analyze
 * @returns {number} Grade level (0-18+)
 */
function calculateGradeLevel(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return 0;
  }
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const totalSentences = Math.max(sentences.length, 1);
  
  // Split into words
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const totalWords = words.length;
  
  if (totalWords === 0) {
    return 0;
  }
  
  // Count total syllables
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  
  // Calculate Flesch-Kincaid Grade Level
  const gradeLevel = 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59;
  
  // Round to 1 decimal place and ensure non-negative
  return Math.max(Math.round(gradeLevel * 10) / 10, 0);
}

/**
 * Calculate reading time in minutes
 * Assumes average reading speed of 200 words per minute
 * 
 * @param {string} text - The text content to analyze
 * @returns {number} Estimated reading time in minutes (rounded to nearest minute)
 */
function calculateReadingTime(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return 0;
  }
  
  // Count words
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = words.length;
  
  // Calculate reading time (200 words per minute)
  const readingTimeMinutes = wordCount / 200;
  
  // Round to nearest minute, minimum 1 minute if there's any content
  return wordCount > 0 ? Math.max(Math.round(readingTimeMinutes), 1) : 0;
}

/**
 * Generate interpretation text based on readability scores
 * 
 * @param {number} fleschKincaidScore - The Flesch-Kincaid reading ease score
 * @param {number} gradeLevel - The grade level
 * @returns {string} Human-readable interpretation
 */
function generateInterpretation(fleschKincaidScore, gradeLevel) {
  let interpretation = '';
  
  // Interpret Flesch-Kincaid score
  if (fleschKincaidScore >= 90) {
    interpretation = 'Very easy to read (5th grade level). ';
  } else if (fleschKincaidScore >= 80) {
    interpretation = 'Easy to read (6th grade level). ';
  } else if (fleschKincaidScore >= 70) {
    interpretation = 'Fairly easy to read (7th grade level). ';
  } else if (fleschKincaidScore >= 60) {
    interpretation = 'Standard readability (8th-9th grade level). ';
  } else if (fleschKincaidScore >= 50) {
    interpretation = 'Fairly difficult to read (10th-12th grade level). ';
  } else if (fleschKincaidScore >= 30) {
    interpretation = 'Difficult to read (college level). ';
  } else {
    interpretation = 'Very difficult to read (college graduate level). ';
  }
  
  // Add grade level context
  if (gradeLevel > 12) {
    interpretation += `Requires college-level education (grade ${gradeLevel.toFixed(1)}). `;
    interpretation += 'Consider simplifying for broader audience.';
  } else if (gradeLevel > 10) {
    interpretation += `Suitable for high school readers (grade ${gradeLevel.toFixed(1)}).`;
  } else if (gradeLevel > 6) {
    interpretation += `Accessible to middle school readers (grade ${gradeLevel.toFixed(1)}).`;
  } else {
    interpretation += `Accessible to elementary school readers (grade ${gradeLevel.toFixed(1)}).`;
  }
  
  return interpretation;
}

/**
 * Calculate all readability metrics for given text
 * 
 * @param {string} text - The text content to analyze
 * @returns {Object} Object containing all readability metrics
 * @returns {number} return.fleschKincaidScore - Reading ease score (0-100+)
 * @returns {number} return.gradeLevel - Grade level required (0-18+)
 * @returns {number} return.readingTimeMinutes - Estimated reading time in minutes
 * @returns {string} return.interpretation - Human-readable interpretation
 */
function calculateReadabilityMetrics(text) {
  const fleschKincaidScore = calculateFleschKincaidScore(text);
  const gradeLevel = calculateGradeLevel(text);
  const readingTimeMinutes = calculateReadingTime(text);
  const interpretation = generateInterpretation(fleschKincaidScore, gradeLevel);
  
  return {
    fleschKincaidScore,
    gradeLevel,
    readingTimeMinutes,
    interpretation
  };
}

module.exports = {
  countSyllables,
  calculateFleschKincaidScore,
  calculateGradeLevel,
  calculateReadingTime,
  generateInterpretation,
  calculateReadabilityMetrics
};
