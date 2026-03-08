const { authenticateRequest } = require('../../lib/auth');
const { getAnalysisById } = require('../../lib/storage');

/**
 * Get analysis by ID endpoint
 * GET /api/analysis/[id]
 * 
 * Response:
 * - 200: Analysis result object
 * - 401: { error: string } - Unauthorized
 * - 404: { error: string } - Analysis not found
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

    // Get analysis ID from query parameters
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Analysis ID is required' });
    }

    // Validate ID format (UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid analysis ID format' });
    }

    // Retrieve analysis from storage
    const result = await getAnalysisById(id, user.id);
    
    if (!result) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Get analysis error:', {
      message: error.message,
      stack: error.stack,
      method: req.method,
      path: req.url,
      userId: req.user?.id
    });
    
    return res.status(500).json({ 
      error: 'Failed to retrieve analysis' 
    });
  }
};
