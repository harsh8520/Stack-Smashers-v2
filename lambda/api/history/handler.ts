import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getUserHistory } from '../../storage/storage-service';

/**
 * Lambda handler for GET /history
 * Retrieves user's analysis history with optional filters
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('GET /history request received');
  
  try {
    // Extract query parameters
    const userId = event.queryStringParameters?.userId;
    const limitParam = event.queryStringParameters?.limit;
    const startDate = event.queryStringParameters?.startDate;
    const endDate = event.queryStringParameters?.endDate;
    
    // Validate required parameters
    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'User ID is required',
            retryable: false,
          },
        }),
      };
    }
    
    // Parse and validate limit
    let limit = 10; // Default limit
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            error: {
              code: 'INVALID_INPUT',
              message: 'Limit must be between 1 and 100',
              retryable: false,
            },
          }),
        };
      }
      limit = parsedLimit;
    }
    
    // Validate date formats if provided
    if (startDate && !isValidISODate(startDate)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid startDate format. Use ISO 8601 format.',
            retryable: false,
          },
        }),
      };
    }
    
    if (endDate && !isValidISODate(endDate)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: {
            code: 'INVALID_INPUT',
            message: 'Invalid endDate format. Use ISO 8601 format.',
            retryable: false,
          },
        }),
      };
    }
    
    // Retrieve history from DynamoDB
    const result = await getUserHistory({
      userId,
      limit,
      startDate,
      endDate,
    });
    
    console.log(`Retrieved ${result.total} analyses for user: ${userId}`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error retrieving history:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: {
          code: 'SERVICE_ERROR',
          message: 'Failed to retrieve history. Please try again later.',
          retryable: true,
        },
      }),
    };
  }
};

/**
 * Validates ISO 8601 date format
 */
function isValidISODate(dateString: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!isoDateRegex.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
