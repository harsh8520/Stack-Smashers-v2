const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getUserById } = require('./storage');

const JWT_EXPIRY = '7d';

/**
 * Get JWT secret from environment
 * @returns {string} JWT secret
 * @throws {Error} If JWT_SECRET is not set
 */
function getJWTSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object containing id and email
 * @returns {string} JWT token
 */
function generateJWT(user) {
  const secret = getJWTSecret();
  
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email
    },
    secret,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyJWT(token) {
  const secret = getJWTSecret();
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

/**
 * Authenticate a request by validating the JWT token in the Authorization header
 * @param {Object} req - Request object with headers
 * @returns {Promise<Object|null>} User object or null if authentication fails
 */
async function authenticateRequest(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyJWT(token);
  
  if (!decoded) {
    return null;
  }
  
  // Get user from storage
  const user = await getUserById(decoded.userId);
  
  return user;
}

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

module.exports = {
  generateJWT,
  verifyJWT,
  authenticateRequest,
  hashPassword,
  comparePassword
};
