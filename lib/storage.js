const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const TTL_DAYS = 30;
const TTL_SECONDS = TTL_DAYS * 24 * 60 * 60;

// Singleton pattern for MongoDB connection
let client = null;
let db = null;

/**
 * Get MongoDB database instance with connection pooling
 * @returns {Promise<Db>} MongoDB database instance
 * @throws {Error} If MONGODB_URI environment variable is not set
 */
async function getDatabase() {
  if (db) {
    return db;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is not set. ' +
      'Please configure MongoDB connection string.'
    );
  }

  client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000
  });

  await client.connect();
  db = client.db('content_quality_reviewer');

  // Initialize indexes
  await initializeIndexes(db);

  return db;
}

/**
 * Initialize database indexes
 * @param {Db} database - MongoDB database instance
 * @returns {Promise<void>}
 */
async function initializeIndexes(database) {
  const usersCollection = database.collection('users');
  const analysesCollection = database.collection('analyses');

  // Create unique index on users.email
  await usersCollection.createIndex(
    { email: 1 },
    { unique: true, name: 'email_unique' }
  );

  // Create index on analyses.analysisId
  await analysesCollection.createIndex(
    { analysisId: 1 },
    { name: 'analysisId_1' }
  );

  // Create compound index on analyses.userId and analyses.createdAt (descending)
  await analysesCollection.createIndex(
    { userId: 1, createdAt: -1 },
    { name: 'userId_1_createdAt_-1' }
  );

  // Create TTL index on analyses.createdAt with 30-day expiration
  await analysesCollection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: TTL_SECONDS, name: 'createdAt_ttl' }
  );
}

/**
 * Store an analysis result in MongoDB
 * @param {Object} data - Analysis data to store
 * @returns {Promise<Object>} Stored analysis result with generated ID
 */
async function storeAnalysisResult(data) {
  const database = await getDatabase();
  const analysesCollection = database.collection('analyses');
  
  const analysisId = uuidv4();
  const timestamp = new Date().toISOString();
  const createdAt = new Date();
  
  const analysisDocument = {
    analysisId,
    userId: data.userId,
    timestamp,
    createdAt,
    content: data.content,
    targetPlatform: data.targetPlatform,
    contentIntent: data.contentIntent,
    overallScore: data.overallScore,
    dimensionScores: data.dimensionScores,
    suggestions: data.suggestions,
    metadata: data.metadata
  };
  
  await analysesCollection.insertOne(analysisDocument);
  
  // Return result without MongoDB's _id field
  const result = {
    analysisId,
    userId: data.userId,
    timestamp,
    content: data.content,
    targetPlatform: data.targetPlatform,
    contentIntent: data.contentIntent,
    overallScore: data.overallScore,
    dimensionScores: data.dimensionScores,
    suggestions: data.suggestions,
    metadata: data.metadata
  };
  
  return result;
}

/**
 * Retrieve an analysis by ID
 * @param {string} analysisId - Analysis ID to retrieve
 * @param {string} userId - User ID for ownership verification
 * @returns {Promise<Object|null>} Analysis result or null if not found
 */
async function getAnalysisById(analysisId, userId) {
  const database = await getDatabase();
  const analysesCollection = database.collection('analyses');
  
  // Query by analysisId field
  const analysis = await analysesCollection.findOne({ analysisId });
  
  // Return null if not found
  if (!analysis) {
    return null;
  }
  
  // Verify userId matches requesting user
  if (analysis.userId !== userId) {
    return null;
  }
  
  // Return analysis document without MongoDB's _id and createdAt Date object
  const result = {
    analysisId: analysis.analysisId,
    userId: analysis.userId,
    timestamp: analysis.timestamp,
    content: analysis.content,
    targetPlatform: analysis.targetPlatform,
    contentIntent: analysis.contentIntent,
    overallScore: analysis.overallScore,
    dimensionScores: analysis.dimensionScores,
    suggestions: analysis.suggestions,
    metadata: analysis.metadata
  };
  
  return result;
}

/**
 * Retrieve user's analysis history
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of results to return (default: 10)
 * @returns {Promise<Object>} Object containing analyses array, total count, and hasMore flag
 */
async function getUserHistory(userId, limit = 10) {
  const database = await getDatabase();
  const analysesCollection = database.collection('analyses');
  
  // Query analyses collection for documents matching userId
  // Sort by createdAt descending (most recent first)
  // Limit results to specified limit
  const analyses = await analysesCollection
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  
  // Get total count of user's analyses
  const total = await analysesCollection.countDocuments({ userId });
  
  // Calculate hasMore flag (total > limit)
  const hasMore = total > limit;
  
  // Map analyses to remove MongoDB's _id and createdAt Date object
  const mappedAnalyses = analyses.map(analysis => ({
    analysisId: analysis.analysisId,
    userId: analysis.userId,
    timestamp: analysis.timestamp,
    content: analysis.content,
    targetPlatform: analysis.targetPlatform,
    contentIntent: analysis.contentIntent,
    overallScore: analysis.overallScore,
    dimensionScores: analysis.dimensionScores,
    suggestions: analysis.suggestions,
    metadata: analysis.metadata
  }));
  
  return {
    analyses: mappedAnalyses,
    total,
    hasMore
  };
}

/**
 * Create a new user
 * @param {Object} userData - User data containing email and hashedPassword
 * @returns {Promise<Object>} Created user object
 */
async function createUser(userData) {
  const database = await getDatabase();
  const usersCollection = database.collection('users');
  
  const userId = uuidv4();
  const user = {
    id: userId,
    email: userData.email,
    hashedPassword: userData.hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  await usersCollection.insertOne(user);
  
  return user;
}

/**
 * Retrieve user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUserByEmail(email) {
  const database = await getDatabase();
  const usersCollection = database.collection('users');
  
  const user = await usersCollection.findOne({ email });
  
  return user;
}

/**
 * Retrieve user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function getUserById(userId) {
  const database = await getDatabase();
  const usersCollection = database.collection('users');
  
  const user = await usersCollection.findOne({ id: userId });
  
  return user;
}

module.exports = {
  storeAnalysisResult,
  getAnalysisById,
  getUserHistory,
  createUser,
  getUserByEmail,
  getUserById
};
