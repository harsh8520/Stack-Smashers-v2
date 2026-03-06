import { QualityScore, Issue } from '../storage/types';

export interface PlatformAnalysisInput {
  content: string;
  targetPlatform: 'blog' | 'linkedin' | 'twitter' | 'medium';
  contentIntent: 'inform' | 'educate' | 'persuade';
}

interface PlatformRules {
  preferredTone: string;
  minLength?: number;
  maxLength?: number;
  requiredElements: string[];
  avoidElements: string[];
  idealStructure: string;
}

/**
 * Platform-specific evaluation rules
 */
const PLATFORM_RULES: Record<string, PlatformRules> = {
  linkedin: {
    preferredTone: 'professional',
    maxLength: 1300,
    requiredElements: ['call-to-action', 'professional-context', 'value-proposition'],
    avoidElements: ['overly-casual', 'controversial', 'personal-drama'],
    idealStructure: 'Hook → Context → Value → Call-to-Action',
  },
  blog: {
    preferredTone: 'conversational',
    minLength: 300,
    requiredElements: ['introduction', 'conclusion', 'clear-sections'],
    avoidElements: ['excessive-brevity', 'lack-of-depth'],
    idealStructure: 'Introduction → Body (with subheadings) → Conclusion',
  },
  twitter: {
    preferredTone: 'concise',
    maxLength: 280,
    requiredElements: ['hook', 'clarity'],
    avoidElements: ['verbosity', 'complex-sentences'],
    idealStructure: 'Hook → Key Point → Optional CTA',
  },
  medium: {
    preferredTone: 'storytelling',
    minLength: 400,
    requiredElements: ['narrative-arc', 'personal-insight', 'depth'],
    avoidElements: ['superficiality', 'excessive-formality'],
    idealStructure: 'Engaging Opening → Story/Analysis → Reflection/Takeaway',
  },
};

/**
 * Analyzes content alignment with platform-specific criteria
 */
export function analyzePlatformAlignment(input: PlatformAnalysisInput): QualityScore {
  const { content, targetPlatform, contentIntent } = input;
  
  const issues: Issue[] = [];
  const strengths: string[] = [];
  
  const rules = PLATFORM_RULES[targetPlatform];
  
  if (!rules) {
    return {
      score: 50,
      confidence: 0.3,
      issues: [{
        type: 'critical',
        category: 'platform',
        description: 'Unknown platform',
        suggestion: 'Use a supported platform: blog, linkedin, twitter, or medium',
        reasoning: 'Platform-specific optimization requires known platform',
      }],
      strengths: [],
    };
  }
  
  // Analyze length requirements
  const lengthScore = analyzeLengthRequirements(content, rules, targetPlatform, issues, strengths);
  
  // Analyze tone alignment
  const toneScore = analyzeToneAlignment(content, rules, targetPlatform, issues, strengths);
  
  // Analyze required elements
  const elementsScore = analyzeRequiredElements(content, rules, targetPlatform, contentIntent, issues, strengths);
  
  // Analyze structure alignment
  const structureScore = analyzeStructureAlignment(content, rules, targetPlatform, issues, strengths);
  
  // Calculate overall platform alignment score (weighted average)
  const overallScore = Math.round(
    lengthScore * 0.25 +
    toneScore * 0.25 +
    elementsScore * 0.30 +
    structureScore * 0.20
  );
  
  // Calculate confidence
  const confidence = calculateConfidence(content, targetPlatform);
  
  return {
    score: Math.max(0, Math.min(100, overallScore)),
    confidence,
    issues,
    strengths,
  };
}

/**
 * Analyzes content length against platform requirements
 */
function analyzeLengthRequirements(
  content: string,
  rules: PlatformRules,
  platform: string,
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = content.length;
  
  // Check minimum length
  if (rules.minLength) {
    if (wordCount < rules.minLength) {
      issues.push({
        type: 'important',
        category: 'platform',
        description: `Content is too short for ${platform} (${wordCount} words)`,
        suggestion: `Expand content to at least ${rules.minLength} words`,
        reasoning: `${platform} audiences expect more substantial content`,
      });
      score -= 30;
    } else {
      strengths.push(`Content length is appropriate for ${platform}`);
    }
  }
  
  // Check maximum length
  if (rules.maxLength) {
    if (platform === 'twitter' && charCount > rules.maxLength) {
      issues.push({
        type: 'critical',
        category: 'platform',
        description: `Content exceeds Twitter's ${rules.maxLength} character limit (${charCount} chars)`,
        suggestion: 'Reduce content to fit within character limit',
        reasoning: 'Twitter has strict character limits',
      });
      score -= 50;
    } else if (platform === 'linkedin' && wordCount > rules.maxLength) {
      issues.push({
        type: 'important',
        category: 'platform',
        description: `Content is too long for optimal LinkedIn engagement (${wordCount} words)`,
        suggestion: `Keep LinkedIn posts under ${rules.maxLength} words for better engagement`,
        reasoning: 'Shorter LinkedIn posts typically perform better',
      });
      score -= 20;
    }
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes tone alignment with platform expectations
 */
function analyzeToneAlignment(
  content: string,
  rules: PlatformRules,
  platform: string,
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  const contentLower = content.toLowerCase();
  
  // Platform-specific tone indicators
  const toneIndicators: Record<string, { positive: string[]; negative: string[] }> = {
    professional: {
      positive: ['insight', 'experience', 'expertise', 'professional', 'industry', 'strategy'],
      negative: ['lol', 'omg', 'tbh', 'gonna', 'wanna', 'kinda'],
    },
    conversational: {
      positive: ['you', 'your', 'we', 'let\'s', 'here\'s', 'think'],
      negative: ['henceforth', 'wherein', 'notwithstanding', 'pursuant'],
    },
    concise: {
      positive: ['key', 'quick', 'tip', 'now', 'today'],
      negative: ['furthermore', 'additionally', 'consequently', 'nevertheless'],
    },
    storytelling: {
      positive: ['story', 'journey', 'experience', 'learned', 'realized', 'discovered'],
      negative: ['bullet', 'list', 'step 1', 'step 2', 'firstly'],
    },
  };
  
  const expectedTone = rules.preferredTone;
  const indicators = toneIndicators[expectedTone];
  
  if (indicators) {
    const positiveCount = indicators.positive.filter(word => contentLower.includes(word)).length;
    const negativeCount = indicators.negative.filter(word => contentLower.includes(word)).length;
    
    if (negativeCount > positiveCount) {
      issues.push({
        type: 'important',
        category: 'platform',
        description: `Tone doesn't align with ${platform}'s ${expectedTone} style`,
        suggestion: `Adjust tone to be more ${expectedTone}`,
        reasoning: `${platform} audiences respond better to ${expectedTone} content`,
      });
      score -= 25;
    } else if (positiveCount >= 3) {
      strengths.push(`Tone aligns well with ${platform}'s ${expectedTone} style`);
    }
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes presence of required platform elements
 */
function analyzeRequiredElements(
  content: string,
  rules: PlatformRules,
  platform: string,
  intent: string,
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  const contentLower = content.toLowerCase();
  
  const elementChecks: Record<string, (content: string) => boolean> = {
    'call-to-action': (c) => {
      const ctaIndicators = ['comment', 'share', 'connect', 'reach out', 'let me know', 'thoughts?', 'agree?'];
      return ctaIndicators.some(indicator => c.includes(indicator));
    },
    'professional-context': (c) => {
      const contextIndicators = ['experience', 'career', 'industry', 'professional', 'work', 'business'];
      return contextIndicators.some(indicator => c.includes(indicator));
    },
    'value-proposition': (c) => {
      const valueIndicators = ['learn', 'discover', 'understand', 'improve', 'benefit', 'help', 'solve'];
      return valueIndicators.some(indicator => c.includes(indicator));
    },
    'introduction': (c) => {
      const paragraphs = c.split(/\n\s*\n/);
      return paragraphs.length > 0 && paragraphs[0].length > 50;
    },
    'conclusion': (c) => {
      const paragraphs = c.split(/\n\s*\n/);
      const lastPara = paragraphs[paragraphs.length - 1] || '';
      const conclusionWords = ['conclusion', 'summary', 'finally', 'overall', 'in closing'];
      return conclusionWords.some(word => lastPara.includes(word));
    },
    'clear-sections': (c) => {
      const paragraphs = c.split(/\n\s*\n/);
      return paragraphs.length >= 3;
    },
    'hook': (c) => {
      const firstSentence = c.split(/[.!?]/)[0] || '';
      return firstSentence.length > 10 && firstSentence.length < 100;
    },
    'clarity': (c) => {
      const avgWordLength = c.split(/\s+/).reduce((sum, w) => sum + w.length, 0) / c.split(/\s+/).length;
      return avgWordLength < 6;
    },
    'narrative-arc': (c) => {
      const storyIndicators = ['when', 'then', 'after', 'before', 'during', 'story', 'experience'];
      return storyIndicators.filter(indicator => c.includes(indicator)).length >= 2;
    },
    'personal-insight': (c) => {
      const insightIndicators = ['i learned', 'i realized', 'i discovered', 'i found', 'my experience'];
      return insightIndicators.some(indicator => c.includes(indicator));
    },
    'depth': (c) => {
      const wordCount = c.split(/\s+/).length;
      return wordCount >= 400;
    },
  };
  
  let missingElements = 0;
  let presentElements = 0;
  
  for (const element of rules.requiredElements) {
    const checker = elementChecks[element];
    if (checker) {
      if (!checker(contentLower)) {
        missingElements++;
        
        const elementDescriptions: Record<string, string> = {
          'call-to-action': 'call-to-action (e.g., "What are your thoughts?")',
          'professional-context': 'professional context or industry relevance',
          'value-proposition': 'clear value proposition for readers',
          'introduction': 'proper introduction',
          'conclusion': 'clear conclusion',
          'clear-sections': 'well-defined sections',
          'hook': 'engaging opening hook',
          'clarity': 'clear, simple language',
          'narrative-arc': 'narrative structure',
          'personal-insight': 'personal insights or learnings',
          'depth': 'sufficient depth and detail',
        };
        
        issues.push({
          type: 'important',
          category: 'platform',
          description: `Missing ${elementDescriptions[element] || element} for ${platform}`,
          suggestion: `Add ${elementDescriptions[element] || element} to better align with ${platform} expectations`,
          reasoning: `${platform} content typically includes ${elementDescriptions[element] || element}`,
        });
      } else {
        presentElements++;
      }
    }
  }
  
  if (missingElements > 0) {
    score -= missingElements * 20;
  }
  
  if (presentElements === rules.requiredElements.length) {
    strengths.push(`All key ${platform} elements are present`);
  }
  
  return Math.max(0, score);
}

/**
 * Analyzes structure alignment with platform ideals
 */
function analyzeStructureAlignment(
  content: string,
  rules: PlatformRules,
  platform: string,
  issues: Issue[],
  strengths: string[]
): number {
  let score = 100;
  
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Platform-specific structure checks
  if (platform === 'linkedin') {
    // LinkedIn: Hook → Context → Value → CTA
    if (paragraphs.length < 3) {
      issues.push({
        type: 'minor',
        category: 'platform',
        description: 'LinkedIn posts benefit from clear structure',
        suggestion: 'Use 3-4 paragraphs: Hook, Context, Value, Call-to-Action',
        reasoning: 'Structured posts are easier to scan and engage with',
      });
      score -= 15;
    } else {
      strengths.push('Content has good structural organization for LinkedIn');
    }
  } else if (platform === 'blog') {
    // Blog: Introduction → Body → Conclusion
    if (paragraphs.length < 3) {
      issues.push({
        type: 'important',
        category: 'platform',
        description: 'Blog posts need clear introduction, body, and conclusion',
        suggestion: 'Structure content with distinct introduction, body sections, and conclusion',
        reasoning: 'Clear structure improves readability and SEO',
      });
      score -= 25;
    } else {
      strengths.push('Blog structure is well-organized');
    }
    
    // Check for subheadings (simplified check for capitalized lines)
    const hasSubheadings = content.split('\n').some(line => 
      line.trim().length > 0 && 
      line.trim().length < 60 && 
      line.trim()[0] === line.trim()[0].toUpperCase()
    );
    
    if (!hasSubheadings && paragraphs.length > 5) {
      issues.push({
        type: 'minor',
        category: 'platform',
        description: 'Long blog posts benefit from subheadings',
        suggestion: 'Add subheadings to break up content and improve scannability',
        reasoning: 'Subheadings help readers navigate and improve SEO',
      });
      score -= 10;
    }
  } else if (platform === 'twitter') {
    // Twitter: Single focused message
    if (paragraphs.length > 1) {
      issues.push({
        type: 'minor',
        category: 'platform',
        description: 'Twitter content should be concise and focused',
        suggestion: 'Condense to a single, impactful message',
        reasoning: 'Twitter is optimized for brief, focused content',
      });
      score -= 10;
    }
  } else if (platform === 'medium') {
    // Medium: Narrative flow
    if (paragraphs.length < 4) {
      issues.push({
        type: 'important',
        category: 'platform',
        description: 'Medium articles need substantial depth',
        suggestion: 'Expand content with more detailed sections and narrative development',
        reasoning: 'Medium readers expect in-depth, thoughtful content',
      });
      score -= 20;
    } else {
      strengths.push('Content has appropriate depth for Medium');
    }
  }
  
  return Math.max(0, score);
}

/**
 * Calculates confidence score
 */
function calculateConfidence(content: string, platform: string): number {
  let confidence = 0.7; // Base confidence (platform rules are fairly deterministic)
  
  const wordCount = content.split(/\s+/).length;
  
  // More content = better platform analysis
  if (wordCount >= 200) {
    confidence += 0.2;
  } else if (wordCount >= 100) {
    confidence += 0.15;
  } else if (wordCount >= 50) {
    confidence += 0.1;
  }
  
  // Twitter has simpler rules, higher confidence
  if (platform === 'twitter') {
    confidence += 0.05;
  }
  
  return Math.min(1.0, confidence);
}

