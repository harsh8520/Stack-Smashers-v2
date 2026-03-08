// Simple in-memory rate limiting for local development
const rateLimitStore = new Map();

const RATE_LIMIT_WINDOW = 60; // 60 seconds
const RATE_LIMIT_MAX = 10; // 10 requests per window

/**
 * Check if a user has exceeded their rate limit using a sliding window algorithm
 * @param {string} userId - User ID to check rate limit for
 * @returns {Promise<boolean>} - True if request is allowed, false if rate limit exceeded
 */
async function checkRateLimit(userId) {
  const key = `ratelimit:${userId}`;
  const now = Date.now();
  const windowStart = now - (RATE_LIMIT_WINDOW * 1000);
  
  // Get or create user's request timestamps
  let timestamps = rateLimitStore.get(key) || [];
  
  // Remove old entries outside the sliding window
  timestamps = timestamps.filter(ts => ts > windowStart);
  
  // Check if limit exceeded
  if (timestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  // Add current request
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.1) { // 10% chance to cleanup
    for (const [k, v] of rateLimitStore.entries()) {
      const filtered = v.filter(ts => ts > windowStart);
      if (filtered.length === 0) {
        rateLimitStore.delete(k);
      } else {
        rateLimitStore.set(k, filtered);
      }
    }
  }
  
  return true;
}

module.exports = {
  checkRateLimit
};
