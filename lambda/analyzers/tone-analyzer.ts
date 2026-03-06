import { QualityScore, Issue } from '../storage/types';
import { SentimentResult, SyntaxToken } from '../comprehend/comprehend-service';

export interface ToneAnalysisInput {
  content: string;
  sentiment: SentimentResult;
  syntaxTokens: SyntaxToken[];
  targetPlatform: 'blog' | 'linkedin' | 'twitter' | 'medium';
}

/**
 * Analyzes content tone and emotional characteristics
 */
export function analyzeTone(input: ToneAnalysisInput): QualityScore {
  const { content, sentiment, syntaxTokens, targetPlatform } = input;
  
  const issues: Issue[] = [];
  const strengths: string[] = [];
  
  // Analyze sentiment appropriateness
  const sentimentScore = analyzeSentimentAlignment(sentiment, targetPlatform, issues, strengths);
  
  // Analyze formality level
  const formalityScore = analyzeFormalityLevel(content, syntaxTokens, targetPlatform, issues, strengths);
  
  // Analyze tone consistency
  const consistencyScore = analyzeToneConsistency(content, sentiment, issues, strengths);
  
  // Analyze voice authenticity
  const authenticityScore = analyzeVoiceAuthenticity(content, syntaxTokens, issues, strengths);
  
  // Calculate overall tone score (weighted average)
  const overallScore = Math.round(
    sentimentScore * 0.3 +
    formalityScore * 0.3 +
    consistencyScore * 0.2 +
    authenticityScore * 0.2
  );
  
  // Calculate confidence based on sentiment scores and content length
  const confidence = calculateConfidence(sentiment, content);
  
  return {
    score: Math.max(0, Math.min(100, overallScore)),
    confidence,
    issues,
    strengths,
  };
}

/**
 * Analyzes sentiment alignment with platform expectations
 */
function analyzeSentimentAlignment(
  sentiment: SentimentResult,
  platform: string,
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  const { sentiment: sentimentType, sentimentScore } = sentiment;
  const dominantScore = Math.max(
    sentimentScore.positive,
    sentimentScore.negative,
    sentimentScore.neutral,
    sentimentScore.mixed
  );
  
  // Platform-specific sentiment expectations
  const platformExpectations: Record<string, { preferred: string[]; avoid: string[] }> = {
    linkedin: {
      preferred: ['POSITIVE', 'NEUTRAL'],
      avoid: ['NEGATIVE'],
    },
    blog: {
      preferred: ['POSITIVE', 'NEUTRAL', 'MIXED'],
      avoid: [],
    },
    twitter: {
      preferred: ['POSITIVE', 'MIXED'],
      avoid: [],
    },
    medium: {
      preferred: ['POSITIVE', 'NEUTRAL', 'MIXED'],
      avoid: [],
    },
  };
  
  const expectations = platformExpectations[platform] || platformExpectations.blog;
  
  // Check if sentiment aligns with platform
  if (expectations.avoid.includes(sentimentType)) {
    issues.push({
      type: 'important',
      category: 'tone',
      description: `${sentimentType.toLowerCase()} tone may not align well with ${platform}`,
      suggestion: `Consider adjusting tone to be more ${expectations.preferred.join(' or ').toLowerCase()} for ${platform}`,
      reasoning: `${platform} audiences typically respond better to ${expectations.preferred.join(' or ').toLowerCase()} content`,
    });
    score -= 30;
  } else if (expectations.preferred.includes(sentimentType)) {
    strengths.push(`${sentimentType.toLowerCase()} tone aligns well with ${platform} expectations`);
  }
  
  // Check sentiment strength
  if (dominantScore < 0.6) {
    issues.push({
      type: 'minor',
      category: 'tone',
      description: 'Tone is somewhat ambiguous',
      suggestion: 'Consider strengthening your emotional stance for clearer messaging',
      reasoning: 'A clearer tone helps readers connect with your message',
    });
    score -= 10;
  } else if (dominantScore >= 0.8) {
    strengths.push('Strong, clear emotional tone throughout');
  }
  
  // Check for extreme negativity
  if (sentimentScore.negative > 0.7) {
    issues.push({
      type: 'important',
      category: 'tone',
      description: 'Content has strongly negative tone',
      suggestion: 'Balance negative points with constructive or positive elements',
      reasoning: 'Overly negative content can disengage readers',
    });
    score -= 25;
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes formality level and appropriateness
 */
function analyzeFormalityLevel(
  content: string,
  syntaxTokens: SyntaxToken[],
  platform: string,
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  // Detect formality indicators
  const informalIndicators = [
    'gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'nope',
    'cool', 'awesome', 'super', 'totally', 'literally', 'basically',
  ];
  
  const formalIndicators = [
    'furthermore', 'moreover', 'consequently', 'nevertheless', 'henceforth',
    'wherein', 'thereof', 'hereby', 'notwithstanding', 'pursuant',
  ];
  
  const contentLower = content.toLowerCase();
  
  const informalCount = informalIndicators.filter(word => 
    contentLower.includes(` ${word} `) || contentLower.includes(` ${word},`)
  ).length;
  
  const formalCount = formalIndicators.filter(word => 
    contentLower.includes(` ${word} `) || contentLower.includes(` ${word},`)
  ).length;
  
  // Check for contractions (informal)
  const contractionCount = (content.match(/\w+'\w+/g) || []).length;
  const wordCount = content.split(/\s+/).length;
  const contractionRatio = contractionCount / wordCount;
  
  // Platform-specific formality expectations
  const platformFormality: Record<string, 'formal' | 'balanced' | 'informal'> = {
    linkedin: 'formal',
    blog: 'balanced',
    twitter: 'informal',
    medium: 'balanced',
  };
  
  const expectedFormality = platformFormality[platform] || 'balanced';
  
  // Assess formality level
  let actualFormality: 'formal' | 'balanced' | 'informal';
  
  if (formalCount > informalCount + 2 && contractionRatio < 0.02) {
    actualFormality = 'formal';
  } else if (informalCount > formalCount + 2 || contractionRatio > 0.1) {
    actualFormality = 'informal';
  } else {
    actualFormality = 'balanced';
  }
  
  // Check alignment with platform expectations
  if (expectedFormality === 'formal' && actualFormality === 'informal') {
    issues.push({
      type: 'important',
      category: 'tone',
      description: `Tone is too informal for ${platform}`,
      suggestion: 'Use more professional language and avoid casual expressions',
      reasoning: `${platform} audiences expect a more professional tone`,
    });
    score -= 30;
  } else if (expectedFormality === 'informal' && actualFormality === 'formal') {
    issues.push({
      type: 'minor',
      category: 'tone',
      description: `Tone may be too formal for ${platform}`,
      suggestion: 'Consider using a more conversational, approachable style',
      reasoning: `${platform} audiences typically prefer a more casual tone`,
    });
    score -= 15;
  } else if (actualFormality === expectedFormality) {
    strengths.push(`Formality level is well-suited for ${platform}`);
  }
  
  // Check for overly formal language
  if (formalCount > 5 && platform !== 'linkedin') {
    issues.push({
      type: 'minor',
      category: 'tone',
      description: 'Language may be overly formal',
      suggestion: 'Simplify formal expressions to improve accessibility',
      reasoning: 'Overly formal language can create distance with readers',
    });
    score -= 10;
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes tone consistency throughout content
 */
function analyzeToneConsistency(
  content: string,
  sentiment: SentimentResult,
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  // Split content into sections
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length < 2) {
    return score; // Can't assess consistency with single paragraph
  }
  
  // Check for tonal shifts (simplified heuristic)
  const emotionalWords = {
    positive: ['great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love', 'best', 'perfect'],
    negative: ['bad', 'terrible', 'awful', 'worst', 'hate', 'poor', 'disappointing', 'failed'],
    neutral: ['okay', 'fine', 'acceptable', 'adequate', 'reasonable', 'standard'],
  };
  
  const paragraphTones = paragraphs.map(para => {
    const paraLower = para.toLowerCase();
    const positiveCount = emotionalWords.positive.filter(w => paraLower.includes(w)).length;
    const negativeCount = emotionalWords.negative.filter(w => paraLower.includes(w)).length;
    const neutralCount = emotionalWords.neutral.filter(w => paraLower.includes(w)).length;
    
    if (positiveCount > negativeCount && positiveCount > neutralCount) return 'positive';
    if (negativeCount > positiveCount && negativeCount > neutralCount) return 'negative';
    return 'neutral';
  });
  
  // Check for inconsistent tones
  const uniqueTones = new Set(paragraphTones);
  
  if (uniqueTones.size > 2) {
    issues.push({
      type: 'minor',
      category: 'tone',
      description: 'Tone shifts noticeably between sections',
      suggestion: 'Maintain a more consistent emotional tone throughout',
      reasoning: 'Consistent tone helps readers stay engaged and builds trust',
    });
    score -= 15;
  } else if (uniqueTones.size === 1) {
    strengths.push('Tone remains consistent throughout the content');
  }
  
  // Check for mixed sentiment with low confidence
  if (sentiment.sentiment === 'MIXED' && sentiment.sentimentScore.mixed > 0.5) {
    issues.push({
      type: 'minor',
      category: 'tone',
      description: 'Content has mixed emotional signals',
      suggestion: 'Clarify your stance to create a more cohesive message',
      reasoning: 'Mixed signals can confuse readers about your perspective',
    });
    score -= 10;
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes voice authenticity and engagement
 */
function analyzeVoiceAuthenticity(
  content: string,
  syntaxTokens: SyntaxToken[],
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  const contentLower = content.toLowerCase();
  
  // Check for personal pronouns (indicates authentic voice)
  const personalPronouns = ['i', 'we', 'my', 'our', 'me', 'us'];
  const pronounCount = personalPronouns.filter(pronoun => 
    contentLower.includes(` ${pronoun} `) || contentLower.startsWith(`${pronoun} `)
  ).length;
  
  const wordCount = content.split(/\s+/).length;
  const pronounRatio = pronounCount / wordCount;
  
  if (pronounRatio > 0.05) {
    strengths.push('Personal voice creates authentic connection with readers');
  } else if (pronounRatio < 0.01 && wordCount > 100) {
    issues.push({
      type: 'minor',
      category: 'tone',
      description: 'Voice feels impersonal',
      suggestion: 'Consider using first-person perspective to create connection',
      reasoning: 'Personal voice helps readers relate to your message',
    });
    score -= 10;
  }
  
  // Check for passive voice (reduces authenticity)
  const passiveIndicators = ['was', 'were', 'been', 'being', 'is', 'are'];
  const pastParticiples = syntaxTokens.filter(token => 
    token.partOfSpeech === 'VERB' && token.text.endsWith('ed')
  );
  
  const potentialPassive = passiveIndicators.filter(indicator => 
    contentLower.includes(` ${indicator} `)
  ).length;
  
  if (potentialPassive > wordCount * 0.05) {
    issues.push({
      type: 'minor',
      category: 'tone',
      description: 'Frequent use of passive voice detected',
      suggestion: 'Use active voice to create more direct, engaging writing',
      reasoning: 'Active voice is more dynamic and easier to understand',
    });
    score -= 15;
  }
  
  // Check for clichés (reduces authenticity)
  const cliches = [
    'at the end of the day', 'think outside the box', 'low-hanging fruit',
    'paradigm shift', 'game changer', 'move the needle', 'circle back',
    'touch base', 'synergy', 'leverage', 'deep dive',
  ];
  
  const clicheCount = cliches.filter(cliche => contentLower.includes(cliche)).length;
  
  if (clicheCount > 2) {
    issues.push({
      type: 'minor',
      category: 'tone',
      description: 'Multiple clichés detected',
      suggestion: 'Replace clichés with original, specific language',
      reasoning: 'Clichés reduce authenticity and can make content feel generic',
    });
    score -= 10;
  }
  
  // Check for questions (engages readers)
  const questionCount = (content.match(/\?/g) || []).length;
  
  if (questionCount >= 2) {
    strengths.push('Questions engage readers and encourage reflection');
  }
  
  return Math.max(0, score);
}

/**
 * Calculates confidence score based on sentiment strength and content length
 */
function calculateConfidence(sentiment: SentimentResult, content: string): number {
  let confidence = 0.5; // Base confidence
  
  // Higher sentiment confidence = higher analysis confidence
  const maxSentimentScore = Math.max(
    sentiment.sentimentScore.positive,
    sentiment.sentimentScore.negative,
    sentiment.sentimentScore.neutral,
    sentiment.sentimentScore.mixed
  );
  
  confidence += maxSentimentScore * 0.3;
  
  // More content = better tone analysis
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 300) {
    confidence += 0.15;
  } else if (wordCount >= 150) {
    confidence += 0.1;
  } else if (wordCount >= 50) {
    confidence += 0.05;
  }
  
  return Math.min(1.0, confidence);
}

