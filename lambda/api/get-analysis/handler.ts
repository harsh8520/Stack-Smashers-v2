import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getAnalysisById, isValidUUID } from '../../storage/storage-service';

/**
 * Lambda handler for GET /analysis/{id}
 * Retrieves a specific analysis result by ID
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('GET /analysis/{id} request received');
  
  try {
    // Extract analysisId from path parameters
    const analysisId = event.pathParameters?.id;
    
    if (!analysisId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Analysis ID is required',
            retryable: false,
          },
        }),
      };
    }
    
    // Validate UUID format
    if (!isValidUUID(analysisId)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid analysis ID format',
            retryable: false,
          },
        }),
      };
    }
    
    // Retrieve analysis from DynamoDB
    const result = await getAnalysisById(analysisId);
    
    if (!result) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: {
            code: 'NOT_FOUND',
            message: 'Analysis not found',
            retryable: false,
          },
        }),
      };
    }
    
    console.log(`Analysis retrieved successfully: ${analysisId}`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error retrieving analysis:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: {
          code: 'SERVICE_ERROR',
          message: 'Failed to retrieve analysis. Please try again later.',
          retryable: true,
        },
      }),
    };
  }
};
