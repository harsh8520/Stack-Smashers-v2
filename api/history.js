const { authenticateRequest } = require('../lib/auth');
const { getUserHistory } = require('../lib/storage');

/**
 * Get user analysis history endpoint
 * GET /api/history?limit=10
 * 
 * Query parameters:
 * - limit: number (optional, default: 10) - Maximum number of results to return
 * 
 * Response:
 * - 200: { analyses: Array, total: number, hasMore: boolean }
 * - 401: { error: string } - Unauthorized
 * - 500: { error: string } - Server error
 */
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate HTTP method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate request
    const user = await authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse and validate query parameters
    const { limit = '10' } = req.query;
    const parsedLimit = parseInt(limit, 10);
    
    // Validate limit
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({ error: 'Invalid limit parameter. Must be a positive integer.' });
    }

    if (parsedLimit > 100) {
      return res.status(400).json({ error: 'Limit cannot exceed 100' });
    }

    // Retrieve user history
    const history = await getUserHistory(user.id, parsedLimit);

    return res.status(200).json(history);

  } catch (error) {
    console.error('History error:', {
      message: error.message,
      stack: error.stack,
      method: req.method,
      path: req.url,
      userId: req.user?.id
    });
    
    return res.status(500).json({ 
      error: 'Failed to retrieve history' 
    });
  }
};
