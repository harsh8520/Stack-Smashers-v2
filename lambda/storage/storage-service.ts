import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand,
  QueryCommandInput 
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { 
  AnalysisResult, 
  DynamoDBRecord, 
  HistoryQueryParams, 
  HistoryResult 
} from './types';

const dynamoClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'ContentAnalysisResults';
const TTL_DAYS = 90;

/**
 * Stores analysis result in DynamoDB
 */
export async function storeAnalysisResult(
  result: Omit<AnalysisResult, 'analysisId' | 'timestamp'>
): Promise<AnalysisResult> {
  const analysisId = uuidv4();
  const timestamp = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + (TTL_DAYS * 24 * 60 * 60);

  const record: DynamoDBRecord = {
    userId: result.userId || 'anonymous',
    analysisId,
    timestamp,
    content: result.content,
    targetPlatform: result.targetPlatform,
    contentIntent: result.contentIntent,
    overallScore: result.overallScore,
    dimensionScores: result.dimensionScores,
    suggestions: result.suggestions,
    metadata: result.metadata,
    ttl,
  };

  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: record,
    });

    await dynamoClient.send(command);

    console.log(`Analysis stored successfully: ${analysisId}`);

    return {
      ...result,
      analysisId,
      timestamp,
    };
  } catch (error) {
    console.error('Error storing analysis result:', error);
    throw new Error('Failed to store analysis result');
  }
}

/**
 * Retrieves analysis result by analysisId using GSI
 */
export async function getAnalysisById(analysisId: string): Promise<AnalysisResult | null> {
  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'analysisId-index',
      KeyConditionExpression: 'analysisId = :analysisId',
      ExpressionAttributeValues: {
        ':analysisId': analysisId,
      },
      Limit: 1,
    });

    const response = await dynamoClient.send(command);

    if (!response.Items || response.Items.length === 0) {
      console.log(`Analysis not found: ${analysisId}`);
      return null;
    }

    const record = response.Items[0] as DynamoDBRecord;
    return convertRecordToResult(record);
  } catch (error) {
    console.error('Error retrieving analysis by ID:', error);
    throw new Error('Failed to retrieve analysis');
  }
}

/**
 * Retrieves user's analysis history with optional date filters
 */
export async function getUserHistory(params: HistoryQueryParams): Promise<HistoryResult> {
  const { userId, limit = 10, startDate, endDate, lastEvaluatedKey } = params;

  try {
    let filterExpression: string | undefined;
    const expressionAttributeValues: Record<string, any> = {
      ':userId': userId,
    };

    // Add date range filters if provided
    if (startDate && endDate) {
      filterExpression = '#ts BETWEEN :startDate AND :endDate';
      expressionAttributeValues[':startDate'] = startDate;
      expressionAttributeValues[':endDate'] = endDate;
    } else if (startDate) {
      filterExpression = '#ts >= :startDate';
      expressionAttributeValues[':startDate'] = startDate;
    } else if (endDate) {
      filterExpression = '#ts <= :endDate';
      expressionAttributeValues[':endDate'] = endDate;
    }

    const queryInput: QueryCommandInput = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: false, // Sort by timestamp descending (newest first)
      Limit: limit,
    };

    if (filterExpression) {
      queryInput.FilterExpression = filterExpression;
      queryInput.ExpressionAttributeNames = {
        '#ts': 'timestamp',
      };
    }

    if (lastEvaluatedKey) {
      queryInput.ExclusiveStartKey = lastEvaluatedKey;
    }

    const command = new QueryCommand(queryInput);
    const response = await dynamoClient.send(command);

    const analyses = (response.Items || []).map((item) =>
      convertRecordToResult(item as DynamoDBRecord)
    );

    return {
      analyses,
      total: analyses.length,
      hasMore: !!response.LastEvaluatedKey,
      lastEvaluatedKey: response.LastEvaluatedKey,
    };
  } catch (error) {
    console.error('Error retrieving user history:', error);
    throw new Error('Failed to retrieve user history');
  }
}

/**
 * Converts DynamoDB record to AnalysisResult
 */
function convertRecordToResult(record: DynamoDBRecord): AnalysisResult {
  return {
    analysisId: record.analysisId,
    userId: record.userId === 'anonymous' ? undefined : record.userId,
    timestamp: record.timestamp,
    content: record.content,
    targetPlatform: record.targetPlatform as 'blog' | 'linkedin' | 'twitter' | 'medium',
    contentIntent: record.contentIntent as 'inform' | 'educate' | 'persuade',
    overallScore: record.overallScore,
    dimensionScores: record.dimensionScores,
    suggestions: record.suggestions,
    metadata: record.metadata,
  };
}

/**
 * Validates that analysisId is a valid UUID (version 4)
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}
