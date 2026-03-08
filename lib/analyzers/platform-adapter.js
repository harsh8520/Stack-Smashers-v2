/**
 * Platform Adapter
 * Analyzes content alignment with target platform requirements
 */

// Platform-specific guidelines
const PLATFORM_GUIDELINES = {
  blog: {
    minWords: 300,
    maxWords: 2000,
    idealWords: 800,
    allowsLongForm: true,
    preferredTone: 'informative',
    hashtagsExpected: false
  },
  linkedin: {
    minWords: 50,
    maxWords: 1300,
    idealWords: 150,
    allowsLongForm: true,
    preferredTone: 'professional',
    hashtagsExpected: true,
    idealHashtags: 5
  },
  twitter: {
    minWords: 10,
    maxWords: 280,
    idealWords: 100,
    allowsLongForm: false,
    preferredTone: 'conversational',
    hashtagsExpected: true,
    idealHashtags: 2
  },
  medium: {
    minWords: 400,
    maxWords: 3000,
    idealWords: 1200,
    allowsLongForm: true,
    preferredTone: 'narrative',
    hashtagsExpected: false
  }
};

function analyzePlatformAlignment(input) {
  const { content, targetPlatform } = input;
  
  const issues = [];
  const strengths = [];
  let score = 100;
  
  const guidelines = PLATFORM_GUIDELINES[targetPlatform];
  if (!guidelines) {
    return {
      score: 50,
      confidence: 0.3,
      issues: [{
        type: 'critical',
        category: 'platform',
        description: 'Unknown target platform',
        suggestion: 'Specify a valid platform (blog, linkedin, twitter, medium)',
        reasoning: 'Cannot provide platform-specific guidance'
      }],
      strengths: []
    };
  }
  
  // Analyze word count
  const wordCount = content.split(/\s+/).length;
  
  if (wordCount < guidelines.minWords) {
    issues.push({
      type: 'critical',
      category: 'platform',
      description: `Content is too short for ${targetPlatform} (${wordCount} words)`,
      suggestion: `Expand content to at least ${guidelines.minWords} words`,
      reasoning: `${targetPlatform} content should be at least ${guidelines.minWords} words`
    });
    score -= 30;
  } else if (wordCount > guidelines.maxWords) {
    issues.push({
      type: 'important',
      category: 'platform',
      description: `Content exceeds ${targetPlatform} recommended length (${wordCount} words)`,
      suggestion: `Reduce content to under ${guidelines.maxWords} words`,
      reasoning: `${targetPlatform} content should not exceed ${guidelines.maxWords} words`
    });
    score -= 25;
  } else if (Math.abs(wordCount - guidelines.idealWords) < 100) {
    strengths.push(`Ideal length for ${targetPlatform}`);
  }
  
  // Analyze hashtag usage
  const hashtags = content.match(/#\w+/g) || [];
  
  if (guidelines.hashtagsExpected) {
    if (hashtags.length === 0) {
      issues.push({
        type: 'important',
        category: 'platform',
        description: `No hashtags found for ${targetPlatform}`,
        suggestion: `Add ${guidelines.idealHashtags} relevant hashtags`,
        reasoning: `Hashtags improve discoverability on ${targetPlatform}`
      });
      score -= 15;
    } else if (hashtags.length > guidelines.idealHashtags * 2) {
      issues.push({
        type: 'minor',
        category: 'platform',
        description: 'Too many hashtags',
        suggestion: `Reduce to ${guidelines.idealHashtags} most relevant hashtags`,
        reasoning: 'Excessive hashtags can appear spammy'
      });
      score -= 10;
    } else {
      strengths.push('Appropriate hashtag usage');
    }
  } else if (hashtags.length > 0) {
    issues.push({
      type: 'minor',
      category: 'platform',
      description: `Hashtags not typically used on ${targetPlatform}`,
      suggestion: 'Consider removing hashtags',
      reasoning: `${targetPlatform} content typically doesn't use hashtags`
    });
    score -= 5;
  }
  
  // Analyze formatting for platform
  if (targetPlatform === 'twitter') {
    // Check for thread indicators
    const hasThreadIndicators = /\d+\/\d+/.test(content);
    if (wordCount > 200 && !hasThreadIndicators) {
      issues.push({
        type: 'minor',
        category: 'platform',
        description: 'Long content without thread indicators',
        suggestion: 'Consider breaking into a thread with numbering (1/n)',
        reasoning: 'Twitter threads should be clearly marked'
      });
      score -= 5;
    }
  }
  
  if (targetPlatform === 'linkedin') {
    // Check for professional formatting
    const hasEmojis = /[\u{1F600}-\u{1F64F}]/u.test(content);
    if (hasEmojis) {
      issues.push({
        type: 'minor',
        category: 'platform',
        description: 'Emojis detected in professional content',
        suggestion: 'Use emojis sparingly on LinkedIn',
        reasoning: 'LinkedIn favors professional tone'
      });
      score -= 5;
    }
  }
  
  return {
    score: Math.max(0, score),
    confidence: 0.85,
    issues,
    strengths
  };
}

module.exports = {
  analyzePlatformAlignment
};
