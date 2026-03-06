import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { performComprehendAnalysis } from '../comprehend/comprehend-service';
import { invokeBedrockModel, generateFallbackResponse } from '../bedrock/bedrock-client';
import { analyzeStructure } from '../analyzers/structure-analyzer';
import { analyzeTone } from '../analyzers/tone-analyzer';
import { analyzeAccessibility } from '../analyzers/accessibility-checker';
import { analyzePlatformAlignment } from '../analyzers/platform-adapter';
import { storeAnalysisResult } from '../storage/storage-service';
import { DimensionScores, AnalysisResult } from '../storage/types';

const MAX_CONTENT_LENGTH = parseInt(process.env.MAX_CONTENT_LENGTH || '2000', 10);

interface AnalyzeRequest {
  content: string;
  targetPlatform: 'blog' | 'linkedin' | 'twitter' | 'medium';
  contentIntent: 'inform' | 'educate' | 'persuade';
  userId?: string;
}

/**
 * Main orchestrator Lambda handler for content analysis
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  
  console.log('Analysis request received');
  
  try {
    // Parse and validate request body
    const request = parseAndValidateRequest(event);
    
    // Perform analysis
    const result = await analyzeContent(request, startTime);
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return handleError(error as Error);
  }
};

/**
 * Parses and validates the request
 */
function parseAndValidateRequest(event: APIGatewayProxyEvent): AnalyzeRequest {
  if (!event.body) {
    throw new ValidationError('Request body is required');
  }
  
  let request: AnalyzeRequest;
  
  try {
    request = JSON.parse(event.body);
  } catch (error) {
    throw new ValidationError('Invalid JSON in request body');
  }
  
  // Validate content
  if (!request.content || typeof request.content !== 'string') {
    throw new ValidationError('Content is required and must be a string');
  }
  
  if (request.content.trim().length === 0) {
    throw new ValidationError('Content cannot be empty');
  }
  
  const wordCount = request.content.split(/\s+/).filter(w => w.length > 0).length;
  
  if (wordCount > MAX_CONTENT_LENGTH) {
    throw new ValidationError(
      `Content exceeds ${MAX_CONTENT_LENGTH} word limit (current: ${wordCount} words)`
    );
  }
  
  // Validate targetPlatform
  const validPlatforms = ['blog', 'linkedin', 'twitter', 'medium'];
  if (!request.targetPlatform || !validPlatforms.includes(request.targetPlatform)) {
    throw new ValidationError(
      `Invalid platform. Supported: ${validPlatforms.join(', ')}`
    );
  }
  
  // Validate contentIntent
  const validIntents = ['inform', 'educate', 'persuade'];
  if (!request.contentIntent || !validIntents.includes(request.contentIntent)) {
    throw new ValidationError(
      `Invalid intent. Supported: ${validIntents.join(', ')}`
    );
  }
  
  return request;
}

/**
 * Performs complete content analysis
 */
async function analyzeContent(request: AnalyzeRequest, startTime: number): Promise<AnalysisResult> {
  const { content, targetPlatform, contentIntent, userId } = request;
  
  console.log(`Analyzing content: ${content.substring(0, 50)}...`);
  console.log(`Platform: ${targetPlatform}, Intent: ${contentIntent}`);
  
  // Step 1: Perform AWS Comprehend analysis
  console.log('Step 1: Running Comprehend analysis...');
  const comprehendAnalysis = await performComprehendAnalysis(content);
  
  // Step 2: Invoke Amazon Bedrock for AI-powered analysis
  console.log('Step 2: Invoking Bedrock...');
  let bedrockResponse;
  let usedFallback = false;
  
  try {
    bedrockResponse = await invokeBedrockModel({
      content,
      targetPlatform,
      contentIntent,
      wordCount: content.split(/\s+/).length,
    });
  } catch (error) {
    console.error('Bedrock invocation failed, using fallback:', error);
    bedrockResponse = generateFallbackResponse();
    usedFallback = true;
  }
  
  // Step 3: Run local analyzers
  console.log('Step 3: Running local analyzers...');
  
  const structureScore = analyzeStructure({
    content,
    keyPhrases: comprehendAnalysis.keyPhrases,
    syntaxTokens: comprehendAnalysis.syntaxTokens,
  });
  
  const toneScore = analyzeTone({
    content,
    sentiment: comprehendAnalysis.sentiment,
    syntaxTokens: comprehendAnalysis.syntaxTokens,
    targetPlatform,
  });
  
  const accessibilityScore = analyzeAccessibility({
    content,
    syntaxTokens: comprehendAnalysis.syntaxTokens,
  });
  
  const platformScore = analyzePlatformAlignment({
    content,
    targetPlatform,
    contentIntent,
  });
  
  // Step 4: Merge and normalize scores
  console.log('Step 4: Merging results...');
  
  const dimensionScores: DimensionScores = {
    structure: mergeScores(structureScore, bedrockResponse.dimensionScores.structure),
    tone: mergeScores(toneScore, bedrockResponse.dimensionScores.tone),
    accessibility: mergeScores(accessibilityScore, bedrockResponse.dimensionScores.accessibility),
    platformAlignment: mergeScores(platformScore, bedrockResponse.dimensionScores.platformAlignment),
  };
  
  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    dimensionScores.structure.score * 0.25 +
    dimensionScores.tone.score * 0.25 +
    dimensionScores.accessibility.score * 0.25 +
    dimensionScores.platformAlignment.score * 0.25
  );
  
  // Step 5: Store result in DynamoDB
  console.log('Step 5: Storing result...');
  
  const processingTime = Date.now() - startTime;
  
  const analysisResult = await storeAnalysisResult({
    userId,
    content,
    targetPlatform,
    contentIntent,
    overallScore,
    dimensionScores,
    suggestions: bedrockResponse.suggestions,
    metadata: {
      processingTime,
      contentLength: content.split(/\s+/).length,
      platformOptimized: !usedFallback,
    },
  });
  
  console.log(`Analysis complete: ${analysisResult.analysisId} (${processingTime}ms)`);
  
  return analysisResult;
}

/**
 * Merges local analyzer score with Bedrock score
 * Gives more weight to local analyzer (70%) as it's more deterministic
 */
function mergeScores(localScore: any, bedrockScore: any): any {
  const LOCAL_WEIGHT = 0.7;
  const BEDROCK_WEIGHT = 0.3;
  
  const mergedScore = Math.round(
    localScore.score * LOCAL_WEIGHT +
    bedrockScore.score * BEDROCK_WEIGHT
  );
  
  const mergedConfidence = Math.min(
    1.0,
    localScore.confidence * LOCAL_WEIGHT +
    bedrockScore.confidence * BEDROCK_WEIGHT
  );
  
  // Merge issues (combine both, prioritize local)
  const allIssues = [
    ...localScore.issues,
    ...bedrockScore.issues.filter((bi: any) => 
      !localScore.issues.some((li: any) => 
        li.description.toLowerCase().includes(bi.description.toLowerCase().substring(0, 20))
      )
    ),
  ];
  
  // Merge strengths (combine both, remove duplicates)
  const allStrengths = [
    ...localScore.strengths,
    ...bedrockScore.strengths.filter((bs: string) => 
      !localScore.strengths.some((ls: string) => 
        ls.toLowerCase().includes(bs.toLowerCase().substring(0, 15))
      )
    ),
  ];
  
  return {
    score: mergedScore,
    confidence: mergedConfidence,
    issues: allIssues.slice(0, 5), // Limit to top 5 issues per dimension
    strengths: allStrengths.slice(0, 3), // Limit to top 3 strengths per dimension
  };
}

/**
 * Handles errors and returns appropriate API Gateway response
 */
function handleError(error: Error): APIGatewayProxyResult {
  if (error instanceof ValidationError) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: {
          code: 'INVALID_INPUT',
          message: error.message,
          retryable: false,
        },
      }),
    };
  }
  
  // Check for timeout errors
  if (error.message.includes('timeout') || error.message.includes('Timeout')) {
    return {
      statusCode: 504,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: {
          code: 'TIMEOUT',
          message: 'Analysis request timed out. Please try again.',
          retryable: true,
        },
      }),
    };
  }
  
  // Generic server error
  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      error: {
        code: 'SERVICE_ERROR',
        message: 'An error occurred during analysis. Please try again later.',
        retryable: true,
      },
    }),
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

