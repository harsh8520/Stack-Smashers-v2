export interface PromptInput {
  content: string;
  targetPlatform: string;
  contentIntent: string;
  wordCount: number;
}

/**
 * Constructs structured prompt for Amazon Bedrock (Nova)
 */
export function constructBedrockPrompt(input: PromptInput): string {
  const { content, targetPlatform, contentIntent, wordCount } = input;
  
  return `<system>
You are an expert content quality analyst helping student creators improve their digital content. Your role is to evaluate content across multiple quality dimensions and provide constructive, actionable feedback while preserving the creator's voice and intent.

Evaluation Dimensions:
1. Structural Clarity: Logical organization, flow, coherence
2. Tone Alignment: Consistency with platform norms
3. Audience Suitability: Vocabulary and framing appropriateness
4. Accessibility: Language simplicity, inclusiveness, readability

Provide scores (0-100) for each dimension with specific reasoning.
</system>

<content_to_analyze>
${content}
</content_to_analyze>

<analysis_context>
Target Platform: ${targetPlatform}
Content Intent: ${contentIntent}
Word Count: ${wordCount}
</analysis_context>

<instructions>
Analyze the content and provide:
1. A score (0-100) for each quality dimension
2. Specific issues found in each dimension
3. Strengths of the content
4. Actionable improvement suggestions prioritized by impact
5. Reasoning for each suggestion

Format your response as JSON:
{
  "dimensionScores": {
    "structure": {
      "score": <number>,
      "confidence": <0-1>,
      "issues": [{"type": "critical|important|minor", "description": "...", "location": "...", "suggestion": "...", "reasoning": "..."}],
      "strengths": ["..."]
    },
    "tone": {
      "score": <number>,
      "confidence": <0-1>,
      "issues": [{"type": "critical|important|minor", "description": "...", "location": "...", "suggestion": "...", "reasoning": "..."}],
      "strengths": ["..."]
    },
    "accessibility": {
      "score": <number>,
      "confidence": <0-1>,
      "issues": [{"type": "critical|important|minor", "description": "...", "location": "...", "suggestion": "...", "reasoning": "..."}],
      "strengths": ["..."]
    },
    "platformAlignment": {
      "score": <number>,
      "confidence": <0-1>,
      "issues": [{"type": "critical|important|minor", "description": "...", "location": "...", "suggestion": "...", "reasoning": "..."}],
      "strengths": ["..."]
    }
  },
  "overallScore": <number>,
  "suggestions": [
    {
      "priority": "high|medium|low",
      "category": "...",
      "title": "...",
      "description": "...",
      "reasoning": "...",
      "examples": ["..."]
    }
  ]
}
</instructions>`;
}

/**
 * Counts words in content
 */
export function countWords(content: string): number {
  return content.split(/\s+/).filter(w => w.length > 0).length;
}

