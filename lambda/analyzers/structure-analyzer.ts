import { QualityScore, Issue } from '../storage/types';
import { KeyPhrase, SyntaxToken } from '../comprehend/comprehend-service';

export interface StructureAnalysisInput {
  content: string;
  keyPhrases: KeyPhrase[];
  syntaxTokens: SyntaxToken[];
}

/**
 * Analyzes content structure and organization
 */
export function analyzeStructure(input: StructureAnalysisInput): QualityScore {
  const { content, keyPhrases, syntaxTokens } = input;
  
  const paragraphs = splitIntoParagraphs(content);
  const sentences = splitIntoSentences(content);
  
  const issues: Issue[] = [];
  const strengths: string[] = [];
  
  // Analyze paragraph structure
  const paragraphScore = analyzeParagraphStructure(paragraphs, issues, strengths);
  
  // Analyze logical flow and transitions
  const flowScore = analyzeLogicalFlow(paragraphs, keyPhrases, issues, strengths);
  
  // Check for introduction and conclusion
  const introOutroScore = checkIntroductionConclusion(paragraphs, issues, strengths);
  
  // Analyze sentence structure variety
  const sentenceScore = analyzeSentenceStructure(sentences, syntaxTokens, issues, strengths);
  
  // Calculate overall structure score (weighted average)
  const overallScore = Math.round(
    paragraphScore * 0.3 +
    flowScore * 0.3 +
    introOutroScore * 0.2 +
    sentenceScore * 0.2
  );
  
  // Calculate confidence based on content length and analysis depth
  const confidence = calculateConfidence(content, paragraphs, sentences);
  
  return {
    score: Math.max(0, Math.min(100, overallScore)),
    confidence,
    issues,
    strengths,
  };
}

/**
 * Splits content into paragraphs
 */
function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Splits content into sentences
 */
function splitIntoSentences(content: string): string[] {
  return content
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Analyzes paragraph structure
 */
function analyzeParagraphStructure(
  paragraphs: string[],
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  // Check paragraph count
  if (paragraphs.length === 0) {
    issues.push({
      type: 'critical',
      category: 'structure',
      description: 'Content has no clear paragraph structure',
      suggestion: 'Organize content into distinct paragraphs with clear breaks',
      reasoning: 'Paragraphs help readers process information in manageable chunks',
    });
    return 0;
  }
  
  if (paragraphs.length === 1) {
    issues.push({
      type: 'important',
      category: 'structure',
      description: 'Content is a single paragraph',
      suggestion: 'Break content into multiple paragraphs for better readability',
      reasoning: 'Multiple paragraphs improve scannability and comprehension',
    });
    score -= 30;
  } else if (paragraphs.length >= 3) {
    strengths.push('Content is well-organized into multiple paragraphs');
  }
  
  // Check paragraph length consistency
  const avgParagraphLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
  const veryLongParagraphs = paragraphs.filter(p => p.length > avgParagraphLength * 2);
  const veryShortParagraphs = paragraphs.filter(p => p.length < 50 && p.length > 0);
  
  if (veryLongParagraphs.length > paragraphs.length * 0.3) {
    issues.push({
      type: 'important',
      category: 'structure',
      description: 'Some paragraphs are excessively long',
      suggestion: 'Break long paragraphs into smaller, focused sections',
      reasoning: 'Long paragraphs can overwhelm readers and reduce engagement',
    });
    score -= 15;
  }
  
  if (veryShortParagraphs.length > paragraphs.length * 0.4) {
    issues.push({
      type: 'minor',
      category: 'structure',
      description: 'Multiple very short paragraphs detected',
      suggestion: 'Consider combining related short paragraphs for better flow',
      reasoning: 'Too many short paragraphs can make content feel choppy',
    });
    score -= 10;
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes logical flow and transitions between paragraphs
 */
function analyzeLogicalFlow(
  paragraphs: string[],
  keyPhrases: KeyPhrase[],
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  if (paragraphs.length < 2) {
    return score;
  }
  
  // Check for transition words/phrases
  const transitionWords = [
    'however', 'therefore', 'furthermore', 'moreover', 'additionally',
    'consequently', 'meanwhile', 'nevertheless', 'similarly', 'in contrast',
    'for example', 'in addition', 'as a result', 'on the other hand',
    'first', 'second', 'third', 'finally', 'lastly', 'next',
  ];
  
  let paragraphsWithTransitions = 0;
  
  for (let i = 1; i < paragraphs.length; i++) {
    const paragraphStart = paragraphs[i].toLowerCase().substring(0, 100);
    const hasTransition = transitionWords.some(word => paragraphStart.includes(word));
    
    if (hasTransition) {
      paragraphsWithTransitions++;
    }
  }
  
  const transitionRatio = paragraphsWithTransitions / (paragraphs.length - 1);
  
  if (transitionRatio < 0.2) {
    issues.push({
      type: 'important',
      category: 'structure',
      description: 'Limited use of transition words between paragraphs',
      suggestion: 'Add transition words to improve flow between ideas',
      reasoning: 'Transitions help readers follow the logical progression of your argument',
    });
    score -= 20;
  } else if (transitionRatio >= 0.4) {
    strengths.push('Good use of transitions between paragraphs');
  }
  
  // Check topic consistency using key phrases
  if (keyPhrases.length > 0) {
    const topTopics = keyPhrases
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(kp => kp.text.toLowerCase());
    
    const topicMentions = topTopics.map(topic => {
      return paragraphs.filter(p => p.toLowerCase().includes(topic)).length;
    });
    
    const avgTopicDistribution = topicMentions.reduce((sum, count) => sum + count, 0) / topTopics.length;
    
    if (avgTopicDistribution >= paragraphs.length * 0.5) {
      strengths.push('Main topics are consistently referenced throughout');
    }
  }
  
  return Math.max(0, score);
}

/**
 * Checks for introduction and conclusion
 */
function checkIntroductionConclusion(
  paragraphs: string[],
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  if (paragraphs.length < 2) {
    return score;
  }
  
  const firstParagraph = paragraphs[0].toLowerCase();
  const lastParagraph = paragraphs[paragraphs.length - 1].toLowerCase();
  
  // Check for introduction indicators
  const introIndicators = [
    'introduce', 'overview', 'explore', 'discuss', 'examine',
    'this article', 'this post', 'in this', 'we will', 'let\'s',
  ];
  
  const hasIntro = introIndicators.some(indicator => firstParagraph.includes(indicator));
  
  if (!hasIntro && paragraphs.length >= 3) {
    issues.push({
      type: 'important',
      category: 'structure',
      description: 'Content lacks a clear introduction',
      suggestion: 'Add an introductory paragraph that sets context and expectations',
      reasoning: 'A strong introduction helps readers understand what to expect',
    });
    score -= 25;
  } else if (hasIntro) {
    strengths.push('Clear introduction sets the stage for the content');
  }
  
  // Check for conclusion indicators
  const conclusionIndicators = [
    'conclusion', 'summary', 'in summary', 'to conclude', 'finally',
    'in closing', 'to sum up', 'overall', 'ultimately', 'in the end',
  ];
  
  const hasConclusion = conclusionIndicators.some(indicator => lastParagraph.includes(indicator));
  
  if (!hasConclusion && paragraphs.length >= 3) {
    issues.push({
      type: 'important',
      category: 'structure',
      description: 'Content lacks a clear conclusion',
      suggestion: 'Add a concluding paragraph that summarizes key points',
      reasoning: 'A conclusion reinforces main ideas and provides closure',
    });
    score -= 25;
  } else if (hasConclusion) {
    strengths.push('Strong conclusion wraps up the content effectively');
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes sentence structure variety
 */
function analyzeSentenceStructure(
  sentences: string[],
  syntaxTokens: SyntaxToken[],
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  if (sentences.length === 0) {
    return 0;
  }
  
  // Calculate sentence length statistics
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgSentenceLength = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
  const minLength = Math.min(...sentenceLengths);
  const maxLength = Math.max(...sentenceLengths);
  const lengthVariance = maxLength - minLength;
  
  // Check for sentence length variety
  if (lengthVariance < 5) {
    issues.push({
      type: 'minor',
      category: 'structure',
      description: 'Limited sentence length variety',
      suggestion: 'Vary sentence lengths to create better rhythm and engagement',
      reasoning: 'Mixing short and long sentences improves readability and maintains interest',
    });
    score -= 15;
  } else if (lengthVariance >= 15) {
    strengths.push('Good variety in sentence lengths creates engaging rhythm');
  }
  
  // Check for overly long sentences
  const longSentences = sentenceLengths.filter(len => len > 30);
  if (longSentences.length > sentences.length * 0.3) {
    issues.push({
      type: 'important',
      category: 'structure',
      description: 'Multiple overly long sentences detected',
      suggestion: 'Break complex sentences into shorter, clearer statements',
      reasoning: 'Long sentences can be difficult to follow and reduce comprehension',
    });
    score -= 20;
  }
  
  // Check for overly short sentences
  const shortSentences = sentenceLengths.filter(len => len < 5);
  if (shortSentences.length > sentences.length * 0.4) {
    issues.push({
      type: 'minor',
      category: 'structure',
      description: 'Many very short sentences detected',
      suggestion: 'Consider combining some short sentences for better flow',
      reasoning: 'Too many short sentences can make writing feel choppy',
    });
    score -= 10;
  }
  
  // Ideal average sentence length is 15-20 words
  if (avgSentenceLength >= 15 && avgSentenceLength <= 20) {
    strengths.push('Sentence length is well-balanced for readability');
  } else if (avgSentenceLength > 25) {
    issues.push({
      type: 'important',
      category: 'structure',
      description: 'Average sentence length is too long',
      suggestion: 'Aim for an average of 15-20 words per sentence',
      reasoning: 'Shorter sentences are easier to understand and process',
    });
    score -= 15;
  }
  
  return Math.max(0, score);
}

/**
 * Calculates confidence score based on content characteristics
 */
function calculateConfidence(content: string, paragraphs: string[], sentences: string[]): number {
  let confidence = 0.5; // Base confidence
  
  // More content = higher confidence
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300) {
    confidence += 0.3;
  } else if (wordCount >= 150) {
    confidence += 0.2;
  } else if (wordCount >= 50) {
    confidence += 0.1;
  }
  
  // More paragraphs = better structure analysis
  if (paragraphs.length >= 5) {
    confidence += 0.15;
  } else if (paragraphs.length >= 3) {
    confidence += 0.1;
  }
  
  // More sentences = better sentence analysis
  if (sentences.length >= 10) {
    confidence += 0.05;
  }
  
  return Math.min(1.0, confidence);
}

