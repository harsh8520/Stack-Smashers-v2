import { QualityScore, Issue } from '../storage/types';
import { SyntaxToken } from '../comprehend/comprehend-service';

export interface AccessibilityAnalysisInput {
  content: string;
  syntaxTokens: SyntaxToken[];
}

/**
 * Analyzes content for accessibility and inclusiveness
 */
export function analyzeAccessibility(input: AccessibilityAnalysisInput): QualityScore {
  const { content, syntaxTokens } = input;
  
  const issues: Issue[] = [];
  const strengths: string[] = [];
  
  // Calculate readability scores
  const readabilityScore = analyzeReadability(content, syntaxTokens, issues, strengths);
  
  // Detect biased or exclusive language
  const inclusivityScore = analyzeInclusiveLanguage(content, issues, strengths);
  
  // Identify technical jargon
  const jargonScore = analyzeJargon(content, syntaxTokens, issues, strengths);
  
  // Analyze sentence complexity
  const complexityScore = analyzeSentenceComplexity(content, syntaxTokens, issues, strengths);
  
  // Calculate overall accessibility score (weighted average)
  const overallScore = Math.round(
    readabilityScore * 0.35 +
    inclusivityScore * 0.25 +
    jargonScore * 0.20 +
    complexityScore * 0.20
  );
  
  // Calculate confidence
  const confidence = calculateConfidence(content, syntaxTokens);
  
  return {
    score: Math.max(0, Math.min(100, overallScore)),
    confidence,
    issues,
    strengths,
  };
}

/**
 * Analyzes readability using Flesch-Kincaid and Gunning Fog metrics
 */
function analyzeReadability(
  content: string,
  syntaxTokens: SyntaxToken[],
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const syllables = countTotalSyllables(words);
  
  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }
  
  // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
  const fleschScore = 206.835 - 
    1.015 * (words.length / sentences.length) - 
    84.6 * (syllables / words.length);
  
  // Flesch-Kincaid Grade Level: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
  const gradeLevel = 0.39 * (words.length / sentences.length) + 
    11.8 * (syllables / words.length) - 15.59;
  
  // Gunning Fog Index: 0.4 * ((words/sentences) + 100 * (complex words/words))
  const complexWords = words.filter(w => countSyllables(w) > 2);
  const gunningFog = 0.4 * ((words.length / sentences.length) + 
    100 * (complexWords.length / words.length));
  
  // Evaluate Flesch Reading Ease (60-70 is ideal, 90-100 is very easy, 0-30 is very difficult)
  if (fleschScore < 30) {
    issues.push({
      type: 'critical',
      category: 'accessibility',
      description: 'Content is very difficult to read',
      suggestion: 'Simplify language, use shorter sentences, and reduce complex words',
      reasoning: 'Very low readability scores exclude many readers',
    });
    score -= 40;
  } else if (fleschScore < 50) {
    issues.push({
      type: 'important',
      category: 'accessibility',
      description: 'Content is fairly difficult to read',
      suggestion: 'Simplify sentence structure and word choice',
      reasoning: 'Difficult content limits your audience reach',
    });
    score -= 25;
  } else if (fleschScore >= 60 && fleschScore <= 70) {
    strengths.push('Readability is well-balanced for general audiences');
  } else if (fleschScore > 90) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Content may be overly simplistic',
      suggestion: 'Consider adding more depth and nuance',
      reasoning: 'Very simple language may not engage sophisticated readers',
    });
    score -= 10;
  }
  
  // Evaluate grade level (8-10 is ideal for general audiences)
  if (gradeLevel > 14) {
    issues.push({
      type: 'important',
      category: 'accessibility',
      description: `Content requires college-level reading ability (Grade ${Math.round(gradeLevel)})`,
      suggestion: 'Lower reading level to Grade 10-12 for broader accessibility',
      reasoning: 'High reading levels exclude many potential readers',
    });
    score -= 20;
  } else if (gradeLevel >= 8 && gradeLevel <= 10) {
    strengths.push('Reading level is appropriate for general audiences');
  }
  
  // Evaluate Gunning Fog (ideal is 7-8, above 12 is difficult)
  if (gunningFog > 12) {
    issues.push({
      type: 'important',
      category: 'accessibility',
      description: 'Content has high complexity (Gunning Fog Index)',
      suggestion: 'Reduce sentence length and complex word usage',
      reasoning: 'Complex writing reduces comprehension and engagement',
    });
    score -= 15;
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes content for inclusive and unbiased language
 */
function analyzeInclusiveLanguage(
  content: string,
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  const contentLower = content.toLowerCase();
  
  // Biased or exclusive terms to avoid
  const biasedTerms = [
    { term: 'guys', alternative: 'everyone, folks, team', reason: 'Gender-exclusive' },
    { term: 'manpower', alternative: 'workforce, staff, personnel', reason: 'Gender-exclusive' },
    { term: 'mankind', alternative: 'humanity, humankind, people', reason: 'Gender-exclusive' },
    { term: 'chairman', alternative: 'chair, chairperson', reason: 'Gender-exclusive' },
    { term: 'policeman', alternative: 'police officer', reason: 'Gender-exclusive' },
    { term: 'fireman', alternative: 'firefighter', reason: 'Gender-exclusive' },
    { term: 'crazy', alternative: 'unexpected, surprising, intense', reason: 'Ableist language' },
    { term: 'insane', alternative: 'remarkable, incredible, extreme', reason: 'Ableist language' },
    { term: 'lame', alternative: 'disappointing, weak, ineffective', reason: 'Ableist language' },
    { term: 'dumb', alternative: 'ineffective, poor, unwise', reason: 'Ableist language' },
    { term: 'blind to', alternative: 'unaware of, overlooking', reason: 'Ableist language' },
    { term: 'tone deaf', alternative: 'insensitive, unaware', reason: 'Ableist language' },
  ];
  
  const foundBiasedTerms: string[] = [];
  
  for (const { term, alternative, reason } of biasedTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(content)) {
      foundBiasedTerms.push(term);
      issues.push({
        type: 'important',
        category: 'accessibility',
        description: `Potentially exclusive language: "${term}"`,
        suggestion: `Consider using: ${alternative}`,
        reasoning: `${reason} - inclusive language welcomes all readers`,
      });
      score -= 15;
    }
  }
  
  if (foundBiasedTerms.length === 0) {
    strengths.push('Language is inclusive and welcoming to diverse audiences');
  }
  
  // Check for gendered pronouns without context
  const genderedPronouns = ['he', 'she', 'his', 'her', 'him'];
  const pronounCount = genderedPronouns.filter(pronoun => 
    contentLower.includes(` ${pronoun} `) || contentLower.includes(` ${pronoun},`)
  ).length;
  
  const theyCount = (contentLower.match(/\bthey\b/g) || []).length;
  
  if (pronounCount > 5 && theyCount === 0) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Frequent use of gendered pronouns',
      suggestion: 'Consider using gender-neutral pronouns (they/them) when appropriate',
      reasoning: 'Gender-neutral language is more inclusive',
    });
    score -= 10;
  }
  
  // Check for age-related assumptions
  const ageTerms = ['millennial', 'boomer', 'gen z', 'old', 'young'];
  const ageTermCount = ageTerms.filter(term => contentLower.includes(term)).length;
  
  if (ageTermCount > 2) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Multiple age-related generalizations detected',
      suggestion: 'Avoid age-based stereotypes and assumptions',
      reasoning: 'Age generalizations can alienate readers',
    });
    score -= 10;
  }
  
  return Math.max(0, score);
}

/**
 * Identifies and analyzes technical jargon
 */
function analyzeJargon(
  content: string,
  syntaxTokens: SyntaxToken[],
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  const contentLower = content.toLowerCase();
  
  // Common technical jargon by category
  const jargonTerms = [
    // Business jargon
    'synergy', 'leverage', 'paradigm', 'bandwidth', 'ecosystem',
    'scalable', 'disruptive', 'actionable', 'holistic', 'granular',
    'stakeholder', 'deliverable', 'kpi', 'roi', 'b2b', 'b2c',
    
    // Tech jargon
    'algorithm', 'api', 'backend', 'frontend', 'deployment',
    'infrastructure', 'latency', 'throughput', 'optimization',
    
    // Academic jargon
    'methodology', 'paradigmatic', 'hegemonic', 'dichotomy',
    'juxtaposition', 'epistemological', 'ontological',
  ];
  
  const foundJargon: string[] = [];
  
  for (const term of jargonTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(content)) {
      foundJargon.push(term);
    }
  }
  
  const wordCount = content.split(/\s+/).length;
  const jargonRatio = foundJargon.length / wordCount;
  
  if (jargonRatio > 0.05) {
    issues.push({
      type: 'important',
      category: 'accessibility',
      description: 'High concentration of technical jargon',
      suggestion: 'Define technical terms or use simpler alternatives',
      reasoning: 'Jargon creates barriers for readers unfamiliar with specialized terminology',
    });
    score -= 30;
  } else if (jargonRatio > 0.02) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Some technical jargon detected',
      suggestion: 'Consider explaining technical terms for broader accessibility',
      reasoning: 'Unexplained jargon can confuse some readers',
    });
    score -= 15;
  } else if (foundJargon.length === 0) {
    strengths.push('Language is clear and free of unnecessary jargon');
  }
  
  // Check for acronyms without definitions
  const acronyms = content.match(/\b[A-Z]{2,}\b/g) || [];
  const uniqueAcronyms = [...new Set(acronyms)];
  
  if (uniqueAcronyms.length > 3) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Multiple acronyms used',
      suggestion: 'Define acronyms on first use (e.g., "API (Application Programming Interface)")',
      reasoning: 'Undefined acronyms can confuse readers',
    });
    score -= 10;
  }
  
  // Check for overly long words (potential jargon)
  const longWords = syntaxTokens.filter(token => token.text.length > 12);
  const longWordRatio = longWords.length / syntaxTokens.length;
  
  if (longWordRatio > 0.1) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Frequent use of very long words',
      suggestion: 'Use shorter, more common words where possible',
      reasoning: 'Long words can reduce readability and comprehension',
    });
    score -= 10;
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes sentence complexity
 */
function analyzeSentenceComplexity(
  content: string,
  syntaxTokens: SyntaxToken[],
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0) {
    return 0;
  }
  
  const avgWordsPerSentence = words.length / sentences.length;
  
  // Check average sentence length
  if (avgWordsPerSentence > 25) {
    issues.push({
      type: 'important',
      category: 'accessibility',
      description: 'Sentences are too long on average',
      suggestion: 'Break long sentences into shorter, clearer statements',
      reasoning: 'Long sentences are harder to process and understand',
    });
    score -= 25;
  } else if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
    strengths.push('Sentence length is well-balanced for comprehension');
  }
  
  // Check for very long sentences
  const veryLongSentences = sentences.filter(s => s.split(/\s+/).length > 35);
  
  if (veryLongSentences.length > 0) {
    issues.push({
      type: 'important',
      category: 'accessibility',
      description: `${veryLongSentences.length} very long sentence(s) detected`,
      suggestion: 'Break sentences longer than 35 words into multiple sentences',
      reasoning: 'Very long sentences significantly reduce comprehension',
    });
    score -= 20;
  }
  
  // Check for nested clauses (commas as proxy)
  const avgCommasPerSentence = sentences.reduce((sum, s) => 
    sum + (s.match(/,/g) || []).length, 0) / sentences.length;
  
  if (avgCommasPerSentence > 3) {
    issues.push({
      type: 'minor',
      category: 'accessibility',
      description: 'Sentences have complex structure with multiple clauses',
      suggestion: 'Simplify sentence structure by reducing nested clauses',
      reasoning: 'Complex sentence structures reduce clarity',
    });
    score -= 15;
  }
  
  return Math.max(0, score);
}

/**
 * Counts syllables in a word (simplified algorithm)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;
  
  // Adjust for silent e
  if (word.endsWith('e')) {
    count--;
  }
  
  // Adjust for le ending
  if (word.endsWith('le') && word.length > 2) {
    count++;
  }
  
  return Math.max(1, count);
}

/**
 * Counts total syllables in all words
 */
function countTotalSyllables(words: string[]): number {
  return words.reduce((total, word) => total + countSyllables(word), 0);
}

/**
 * Calculates confidence score
 */
function calculateConfidence(content: string, syntaxTokens: SyntaxToken[]): number {
  let confidence = 0.6; // Base confidence (accessibility analysis is fairly deterministic)
  
  const wordCount = content.split(/\s+/).length;
  
  // More content = higher confidence
  if (wordCount >= 300) {
    confidence += 0.25;
  } else if (wordCount >= 150) {
    confidence += 0.15;
  } else if (wordCount >= 50) {
    confidence += 0.1;
  }
  
  // More syntax tokens = better analysis
  if (syntaxTokens.length >= 100) {
    confidence += 0.1;
  } else if (syntaxTokens.length >= 50) {
    confidence += 0.05;
  }
  
  return Math.min(1.0, confidence);
}

