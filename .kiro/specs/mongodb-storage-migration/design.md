# Design Document: MongoDB Storage Migration

## Overview

This design describes the migration from Vercel KV (Redis-based storage) to MongoDB Atlas for the content quality reviewer application. The migration maintains the existing storage interface while replacing the underlying persistence mechanism. The design focuses on preserving functionality, ensuring data consistency, and optimizing query performance through appropriate indexing strategies.

The migration involves replacing the `@vercel/kv` client with the MongoDB Node.js driver, restructuring data storage from key-value pairs to document collections, and implementing MongoDB-native features like TTL indexes for automatic data expiration.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Endpoints Layer                      │
│  (signup, login, analyze, history - unchanged)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Same Interface
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Storage Layer (lib/storage.js)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  createUser, getUserByEmail, getUserById             │  │
│  │  storeAnalysisResult, getAnalysisById, getUserHistory│  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ MongoDB Driver
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    MongoDB Atlas                             │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │  users collection   │  │  analyses collection         │ │
│  │  - id (UUID)        │  │  - analysisId (UUID)         │ │
│  │  - email (unique)   │  │  - userId                    │ │
│  │  - hashedPassword   │  │  - timestamp                 │ │
│  │  - createdAt        │  │  - content, scores, etc.     │ │
│  │                     │  │  - createdAt (TTL indexed)   │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Connection Management

The MongoDB client will use a singleton pattern with connection pooling:

```javascript
let client = null;
let db = null;

async function getDatabase() {
  if (db) return db;
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
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
```

This approach ensures:
- Single connection pool shared across serverless function invocations
- Automatic connection reuse in warm Lambda containers
- Graceful error handling for connection failures
- Lazy initialization (connects only when first needed)

## Components and Interfaces

### Storage Layer Interface

The storage layer maintains the exact same public interface:

```javascript
// User operations
async function createUser(userData: {
  email: string,
  hashedPassword: string
}): Promise<User>

async function getUserByEmail(email: string): Promise<User | null>

async function getUserById(userId: string): Promise<User | null>

// Analysis operations
async function storeAnalysisResult(data: AnalysisData): Promise<AnalysisResult>

async function getAnalysisById(
  analysisId: string,
  userId: string
): Promise<AnalysisResult | null>

async function getUserHistory(
  userId: string,
  limit?: number
): Promise<{
  analyses: AnalysisResult[],
  total: number,
  hasMore: boolean
}>
```

### Internal Helper Functions

```javascript
// Database connection
async function getDatabase(): Promise<Db>

// Index initialization
async function initializeIndexes(db: Db): Promise<void>

// Collection accessors
function getUsersCollection(db: Db): Collection
function getAnalysesCollection(db: Db): Collection
```

## Data Models

### User Document Schema

```javascript
{
  id: string,              // UUID v4
  email: string,           // Unique, indexed
  hashedPassword: string,  // bcrypt hash
  createdAt: string        // ISO 8601 timestamp
}
```

**Indexes:**
- `{ email: 1 }` - Unique index for email lookups and duplicate prevention
- `{ id: 1 }` - Index for id-based lookups

### Analysis Document Schema

```javascript
{
  analysisId: string,      // UUID v4, indexed
  userId: string,          // Foreign key to user, indexed
  timestamp: string,       // ISO 8601 timestamp (for display)
  createdAt: Date,         // Date object (for TTL index)
  content: string,         // Original content analyzed
  targetPlatform: string,  // Platform (e.g., "twitter", "linkedin")
  contentIntent: string,   // Intent (e.g., "informative", "promotional")
  overallScore: number,    // Overall quality score
  dimensionScores: {       // Scores by dimension
    clarity: number,
    engagement: number,
    professionalism: number,
    // ... other dimensions
  },
  suggestions: string[],   // Improvement suggestions
  metadata: object         // Additional metadata
}
```

**Indexes:**
- `{ analysisId: 1 }` - Index for direct lookups
- `{ userId: 1, createdAt: -1 }` - Compound index for user history queries (sorted by date)
- `{ createdAt: 1 }` - TTL index with expireAfterSeconds: 2592000 (30 days)

### Key Design Decisions

**Dual Timestamp Fields:**
- `timestamp` (string): ISO 8601 string for API responses and display
- `createdAt` (Date): Native Date object for MongoDB TTL index functionality

**UUID Strategy:**
- Continue using UUID v4 for id generation (maintains compatibility)
- Store as strings (not MongoDB ObjectId) to preserve existing ID format

**TTL Implementation:**
- MongoDB TTL index on `createdAt` field automatically deletes expired documents
- Background process runs every 60 seconds
- More efficient than manual cleanup or application-level expiration

**Index Strategy:**
- Compound index `{ userId: 1, createdAt: -1 }` optimizes the common query pattern (user history sorted by date)
- Separate indexes on `analysisId` and `email` for direct lookups
- Unique constraint on email prevents duplicate user registrations at database level



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: User Document Completeness

*For any* user creation operation with valid email and hashedPassword, the stored document should contain id, email, hashedPassword, and createdAt fields.

**Validates: Requirements 2.1**

### Property 2: User ID Format

*For any* created user, the id field should be a valid UUID v4 format.

**Validates: Requirements 2.2**

### Property 3: User Storage Round-Trip

*For any* created user, retrieving that user by email or by id should return an equivalent user object with all fields matching.

**Validates: Requirements 2.3, 2.4**

### Property 4: Non-Existent User Returns Null

*For any* email or id that does not correspond to an existing user, retrieval operations should return null.

**Validates: Requirements 2.5, 2.6**

### Property 5: Email Uniqueness Enforcement

*For any* existing user, attempting to create another user with the same email should fail with a duplicate key error.

**Validates: Requirements 2.7**

### Property 6: Analysis Document Completeness

*For any* analysis storage operation, the stored document should contain all required fields: analysisId, userId, timestamp, createdAt, content, targetPlatform, contentIntent, overallScore, dimensionScores, suggestions, and metadata.

**Validates: Requirements 3.1**

### Property 7: Analysis ID Format

*For any* stored analysis, the analysisId field should be a valid UUID v4 format.

**Validates: Requirements 3.2**

### Property 8: Timestamp ISO Format

*For any* stored analysis, the timestamp field should be a valid ISO 8601 formatted string.

**Validates: Requirements 3.3**

### Property 9: Analysis Retrieval with Ownership

*For any* stored analysis, retrieving it with the correct analysisId and userId should return the equivalent analysis object, while retrieving it with a different userId should return null.

**Validates: Requirements 3.4, 3.5**

### Property 10: Non-Existent Analysis Returns Null

*For any* analysisId that does not correspond to an existing analysis, retrieval should return null.

**Validates: Requirements 3.7**

### Property 11: User History Filtering

*For any* user history query, all returned analyses should have a userId matching the requested user.

**Validates: Requirements 4.1**

### Property 12: History Sort Order

*For any* user history query, the returned analyses should be sorted by timestamp in descending order, where each analysis timestamp is greater than or equal to the next analysis timestamp.

**Validates: Requirements 4.2**

### Property 13: History Limit Enforcement

*For any* user history query with a limit parameter, the number of returned analyses should be less than or equal to the limit.

**Validates: Requirements 4.3**

### Property 14: History Response Structure

*For any* user history query, the response should be an object containing an analyses array, a total number, and a hasMore boolean.

**Validates: Requirements 4.5**

### Property 15: HasMore Flag Accuracy

*For any* user history query, the hasMore flag should be true if and only if the total count exceeds the limit.

**Validates: Requirements 4.6**

### Property 16: TTL Field Presence

*For any* stored analysis, the document should include a createdAt field that is a Date object (for TTL index functionality).

**Validates: Requirements 5.3**

## Error Handling

### Connection Errors

**Missing Environment Variable:**
```javascript
if (!process.env.MONGODB_URI) {
  throw new Error(
    'MONGODB_URI environment variable is not set. ' +
    'Please configure MongoDB connection string.'
  );
}
```

**Connection Failure:**
```javascript
try {
  await client.connect();
} catch (error) {
  throw new Error(
    `Failed to connect to MongoDB: ${error.message}. ` +
    `Check MONGODB_URI configuration and network connectivity.`
  );
}
```

### Operation Errors

**Duplicate Email:**
- MongoDB will throw a duplicate key error (code 11000) when attempting to insert a user with an existing email
- The error should propagate to the API layer for appropriate HTTP response (409 Conflict)

**Invalid Data:**
- Validation should occur at the API layer before reaching storage
- Storage layer assumes data is pre-validated

**Network Timeouts:**
- MongoDB driver handles retries automatically
- Configure `serverSelectionTimeoutMS` to fail fast (5 seconds)

### Graceful Degradation

**Connection Pool Exhaustion:**
- Configure `maxPoolSize` to handle expected concurrent load
- Monitor connection pool metrics in production

**Database Unavailability:**
- Serverless functions will fail and retry automatically
- Consider implementing circuit breaker pattern for repeated failures

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** verify:
- Specific configuration examples (connection string, database name, pool settings)
- Index creation and configuration
- Error handling for specific failure cases
- Default parameter values

**Property-Based Tests** verify:
- Universal properties across all valid inputs
- Data integrity through round-trip operations
- Ownership verification across random user/analysis combinations
- Sort order and pagination logic with varying data sets

### Property-Based Testing Configuration

**Library:** fast-check (already in devDependencies)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: mongodb-storage-migration, Property N: [property text]`
- Use custom arbitraries for generating valid user and analysis data

**Example Test Structure:**
```javascript
const fc = require('fast-check');

// Feature: mongodb-storage-migration, Property 3: User Storage Round-Trip
test('user storage round-trip preserves all fields', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        email: fc.emailAddress(),
        hashedPassword: fc.string({ minLength: 60, maxLength: 60 })
      }),
      async (userData) => {
        const created = await createUser(userData);
        const byEmail = await getUserByEmail(userData.email);
        const byId = await getUserById(created.id);
        
        expect(byEmail).toEqual(created);
        expect(byId).toEqual(created);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Test Coverage

**Configuration Tests:**
- Verify MONGODB_URI is read from environment
- Verify database name is "content_quality_reviewer"
- Verify connection pool configuration
- Verify error thrown when MONGODB_URI is missing

**Index Tests:**
- Verify users collection has unique index on email
- Verify analyses collection has index on userId
- Verify analyses collection has index on analysisId
- Verify analyses collection has TTL index on createdAt with 30-day expiration

**Edge Cases:**
- Empty user history (no analyses for user)
- History with exactly limit items
- History with fewer than limit items
- Default limit behavior (10 items)

### Integration Testing

**Database Setup:**
- Use MongoDB Memory Server for isolated test environment
- Create fresh database for each test suite
- Clean up collections between tests

**Test Data:**
- Generate realistic test data using faker or custom generators
- Test with various data sizes (empty, small, large datasets)
- Test with edge cases (special characters in emails, large content strings)

### Migration Validation

**Pre-Migration Checklist:**
- [ ] MongoDB Atlas cluster provisioned
- [ ] MONGODB_URI environment variable configured in Vercel
- [ ] Database user created with read/write permissions
- [ ] Network access configured (allow Vercel IP ranges or 0.0.0.0/0)

**Post-Migration Validation:**
- [ ] All unit tests pass
- [ ] All property tests pass (100+ iterations each)
- [ ] Signup endpoint creates users successfully
- [ ] Login endpoint retrieves users correctly
- [ ] Analysis storage and retrieval works
- [ ] User history queries return correct results
- [ ] TTL index is active (verify with `db.analyses.getIndexes()`)

**Rollback Plan:**
- Keep @vercel/kv dependency temporarily
- Implement feature flag to switch between storage backends
- Monitor error rates and latency after migration
- Rollback to Vercel KV if critical issues arise
