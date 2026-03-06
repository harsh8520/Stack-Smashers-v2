import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { constructBedrockPrompt, PromptInput, countWords } from './prompt-template';
import { DimensionScores, Suggestion } from '../storage/types';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0';
const TIMEOUT_MS = parseInt(process.env.ANALYSIS_TIMEOUT_MS || '25000', 10);
const MAX_RETRIES = 2;

export interface BedrockResponse {
  dimensionScores: DimensionScores;
  overallScore: number;
  suggestions: Suggestion[];
}

export interface BedrockError {
  error: string;
  message: string;
  retryable: boolean;
}

/**
 * Invokes Bedrock model with retry logic
 */
export async function invokeBedrockModel(input: PromptInput): Promise<BedrockResponse> {
  const prompt = constructBedrockPrompt(input);
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await invokeModelWithTimeout(prompt, TIMEOUT_MS);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Bedrock invocation attempt ${attempt + 1} failed:`, error);
      
      // Don't retry on validation errors
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Retry on timeout or throttling
      if (attempt < MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
      }
    }
  }
  
  throw new Error(`Bedrock invocation failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message}`);
}

/**
 * Invokes model with timeout
 */
async function invokeModelWithTimeout(prompt: string, timeoutMs: number): Promise<BedrockResponse> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Bedrock invocation timeout')), timeoutMs);
  });
  
  const invocationPromise = invokeModel(prompt);
  
  return Promise.race([invocationPromise, timeoutPromise]);
}

/**
 * Invokes Bedrock model (Amazon Nova)
 */
async function invokeModel(prompt: string): Promise<BedrockResponse> {
  const requestBody = {
    messages: [
      {
        role: 'user',
        content: [
          {
            text: prompt,
          },
        ],
      },
    ],
    inferenceConfig: {
      max_new_tokens: 4096,
      temperature: 0.3,
      top_p: 0.9,
    },
  };

  const commandInput: InvokeModelCommandInput = {
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  };

  const command = new InvokeModelCommand(commandInput);
  const response = await client.send(command);

  if (!response.body) {
    throw new Error('Empty response from Bedrock');
  }

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  
  // Extract content from Nova response
  const content = responseBody.output?.message?.content?.[0]?.text;
  
  if (!content) {
    throw new Error('No content in Bedrock response');
  }

  return parseBedrockResponse(content);
}

/**
 * Parses and validates Bedrock JSON response
 */
export function parseBedrockResponse(content: string): BedrockResponse {
  try {
    // Extract JSON from response (Nova might wrap it in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new ValidationError('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.dimensionScores) {
      throw new ValidationError('Missing dimensionScores in response');
    }

    if (!parsed.overallScore && parsed.overallScore !== 0) {
      throw new ValidationError('Missing overallScore in response');
    }

    // Validate dimension scores
    const requiredDimensions = ['structure', 'tone', 'accessibility', 'platformAlignment'];
    for (const dimension of requiredDimensions) {
      if (!parsed.dimensionScores[dimension]) {
        throw new ValidationError(`Missing dimension: ${dimension}`);
      }
      
      const dimScore = parsed.dimensionScores[dimension];
      if (typeof dimScore.score !== 'number' || dimScore.score < 0 || dimScore.score > 100) {
        throw new ValidationError(`Invalid score for ${dimension}: ${dimScore.score}`);
      }
    }

    // Ensure suggestions array exists
    if (!Array.isArray(parsed.suggestions)) {
      parsed.suggestions = [];
    }

    return {
      dimensionScores: parsed.dimensionScores,
      overallScore: parsed.overallScore,
      suggestions: parsed.suggestions,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Failed to parse Bedrock response: ${(error as Error).message}`);
  }
}

/**
 * Generates fallback response when Bedrock fails
 */
export function generateFallbackResponse(): BedrockResponse {
  return {
    dimensionScores: {
      structure: {
        score: 50,
        confidence: 0.3,
        issues: [],
        strengths: [],
      },
      tone: {
        score: 50,
        confidence: 0.3,
        issues: [],
        strengths: [],
      },
      accessibility: {
        score: 50,
        confidence: 0.3,
        issues: [],
        strengths: [],
      },
      platformAlignment: {
        score: 50,
        confidence: 0.3,
        issues: [],
        strengths: [],
      },
    },
    overallScore: 50,
    suggestions: [
      {
        priority: 'high',
        category: 'system',
        title: 'Analysis Unavailable',
        description: 'AI analysis is temporarily unavailable. Please try again later.',
        reasoning: 'The AI service encountered an error during analysis.',
        examples: [],
      },
    ],
  };
}

/**
 * Custom validation error class
 */
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Checks if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'timeout',
    'throttl',
    'rate limit',
    'service unavailable',
    'internal server error',
  ];

  const errorMessage = error.message.toLowerCase();
  return retryableMessages.some(msg => errorMessage.includes(msg));
}
