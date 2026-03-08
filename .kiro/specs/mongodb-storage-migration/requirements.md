# Requirements Document

## Introduction

This document specifies the requirements for migrating the storage layer from Vercel KV (Redis-based) to MongoDB Atlas. The migration is necessary because Vercel KV is not configured in the production environment, causing signup endpoint failures. The migration must maintain the existing storage interface and functionality while transitioning to MongoDB as the persistence layer.

## Glossary

- **Storage_Layer**: The abstraction layer that provides data persistence operations for users and analysis results
- **MongoDB_Client**: The MongoDB Node.js driver that connects to and interacts with MongoDB Atlas
- **User_Collection**: MongoDB collection storing user documents with email, password, and metadata
- **Analysis_Collection**: MongoDB collection storing analysis result documents
- **TTL_Index**: MongoDB Time-To-Live index that automatically deletes documents after a specified duration
- **Connection_Pool**: MongoDB's internal connection management system that reuses database connections

## Requirements

### Requirement 1: MongoDB Driver Integration

**User Story:** As a developer, I want to replace the Vercel KV client with the MongoDB driver, so that the application can connect to MongoDB Atlas for data persistence.

#### Acceptance Criteria

1. THE Storage_Layer SHALL use the mongodb npm package instead of @vercel/kv
2. WHEN the Storage_Layer initializes, THE MongoDB_Client SHALL connect using the MONGODB_URI environment variable
3. THE MongoDB_Client SHALL use a connection pool to efficiently manage database connections
4. WHEN the connection fails, THE Storage_Layer SHALL throw a descriptive error with connection details
5. THE Storage_Layer SHALL target a database named "content_quality_reviewer"

### Requirement 2: User Storage Operations

**User Story:** As a developer, I want to store and retrieve user data in MongoDB, so that user authentication and management continue to work seamlessly.

#### Acceptance Criteria

1. WHEN creating a user, THE Storage_Layer SHALL insert a document into the User_Collection with id, email, hashedPassword, and createdAt fields
2. WHEN creating a user, THE Storage_Layer SHALL generate a unique UUID for the user id field
3. WHEN retrieving a user by email, THE Storage_Layer SHALL query the User_Collection using the email field
4. WHEN retrieving a user by id, THE Storage_Layer SHALL query the User_Collection using the id field
5. WHEN a user with the given email does not exist, THE Storage_Layer SHALL return null
6. WHEN a user with the given id does not exist, THE Storage_Layer SHALL return null
7. THE User_Collection SHALL have a unique index on the email field to prevent duplicate registrations

### Requirement 3: Analysis Storage Operations

**User Story:** As a developer, I want to store and retrieve analysis results in MongoDB, so that users can access their content analysis history.

#### Acceptance Criteria

1. WHEN storing an analysis result, THE Storage_Layer SHALL insert a document into the Analysis_Collection with all analysis fields
2. WHEN storing an analysis result, THE Storage_Layer SHALL generate a unique UUID for the analysisId field
3. WHEN storing an analysis result, THE Storage_Layer SHALL include a timestamp field with the current ISO date
4. WHEN retrieving an analysis by id, THE Storage_Layer SHALL query the Analysis_Collection using the analysisId field
5. WHEN retrieving an analysis by id, THE Storage_Layer SHALL verify that the userId matches the requesting user
6. WHEN the userId does not match, THE Storage_Layer SHALL return null
7. WHEN an analysis with the given id does not exist, THE Storage_Layer SHALL return null

### Requirement 4: User History Retrieval

**User Story:** As a user, I want to retrieve my analysis history sorted by most recent first, so that I can review my past content analyses.

#### Acceptance Criteria

1. WHEN retrieving user history, THE Storage_Layer SHALL query the Analysis_Collection for all documents matching the userId
2. WHEN retrieving user history, THE Storage_Layer SHALL sort results by timestamp in descending order (most recent first)
3. WHEN a limit parameter is provided, THE Storage_Layer SHALL return at most that many results
4. WHEN no limit is provided, THE Storage_Layer SHALL default to returning 10 results
5. THE Storage_Layer SHALL return an object containing analyses array, total count, and hasMore boolean flag
6. THE hasMore flag SHALL be true when the total count exceeds the limit

### Requirement 5: TTL Implementation

**User Story:** As a system administrator, I want analysis results to automatically expire after 30 days, so that storage costs remain manageable and old data is cleaned up.

#### Acceptance Criteria

1. THE Analysis_Collection SHALL have a TTL_Index on a field that triggers automatic document deletion
2. THE TTL_Index SHALL be configured to delete documents 30 days after creation
3. WHEN storing an analysis result, THE Storage_Layer SHALL include a field that the TTL_Index uses for expiration calculation
4. THE TTL_Index SHALL run automatically without requiring manual intervention

### Requirement 6: Index Creation

**User Story:** As a developer, I want appropriate indexes created on MongoDB collections, so that query performance remains optimal.

#### Acceptance Criteria

1. THE User_Collection SHALL have a unique index on the email field
2. THE Analysis_Collection SHALL have an index on the userId field for efficient history queries
3. THE Analysis_Collection SHALL have an index on the analysisId field for efficient lookups
4. THE Analysis_Collection SHALL have a TTL index on the createdAt field set to expire after 2592000 seconds (30 days)
5. WHEN the Storage_Layer initializes, THE MongoDB_Client SHALL create all required indexes if they do not exist

### Requirement 7: Interface Compatibility

**User Story:** As a developer, I want the storage interface to remain unchanged, so that existing API endpoints continue to work without modifications.

#### Acceptance Criteria

1. THE Storage_Layer SHALL export a createUser function with the same signature as the current implementation
2. THE Storage_Layer SHALL export a getUserByEmail function with the same signature as the current implementation
3. THE Storage_Layer SHALL export a getUserById function with the same signature as the current implementation
4. THE Storage_Layer SHALL export a storeAnalysisResult function with the same signature as the current implementation
5. THE Storage_Layer SHALL export a getAnalysisById function with the same signature as the current implementation
6. THE Storage_Layer SHALL export a getUserHistory function with the same signature as the current implementation
7. ALL exported functions SHALL return the same data structures as the current implementation

### Requirement 8: Dependency Management

**User Story:** As a developer, I want the package.json updated with MongoDB dependencies, so that the application can be deployed with the correct packages.

#### Acceptance Criteria

1. THE package.json SHALL include the mongodb npm package as a dependency
2. THE package.json SHALL remove the @vercel/kv dependency
3. THE mongodb package version SHALL be compatible with MongoDB Atlas (version 6.0 or higher)

### Requirement 9: Environment Configuration

**User Story:** As a developer, I want to configure the MongoDB connection via environment variable, so that different environments can use different database instances.

#### Acceptance Criteria

1. THE Storage_Layer SHALL read the connection string from the MONGODB_URI environment variable
2. WHEN MONGODB_URI is not set, THE Storage_Layer SHALL throw a descriptive error indicating the missing configuration
3. THE connection string SHALL support MongoDB Atlas connection format with authentication credentials
