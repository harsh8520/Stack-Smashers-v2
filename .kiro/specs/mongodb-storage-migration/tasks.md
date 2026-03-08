# Implementation Plan: MongoDB Storage Migration

## Overview

This plan migrates the storage layer from Vercel KV to MongoDB Atlas while maintaining the existing API interface. The implementation follows an incremental approach: update dependencies, implement connection management, migrate user operations, migrate analysis operations, add testing, and validate the migration.

## Tasks

- [x] 1. Update project dependencies
  - Remove @vercel/kv from package.json dependencies
  - Add mongodb package (version ^6.0.0 or higher) to dependencies
  - Run npm install to update package-lock.json
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 2. Implement MongoDB connection management
  - [x] 2.1 Create database connection module with singleton pattern
    - Implement getDatabase() function with connection pooling
    - Configure maxPoolSize: 10, minPoolSize: 2, serverSelectionTimeoutMS: 5000
    - Read MONGODB_URI from environment variable
    - Target database name: "content_quality_reviewer"
    - Throw descriptive error if MONGODB_URI is not set
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 9.1, 9.2_
  
  - [x] 2.2 Implement index initialization function
    - Create initializeIndexes() function
    - Add unique index on users.email
    - Add index on analyses.analysisId
    - Add compound index on analyses.userId and analyses.createdAt (descending)
    - Add TTL index on analyses.createdAt with expireAfterSeconds: 2592000 (30 days)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 5.1, 5.2_
  
  - [ ]* 2.3 Write unit tests for connection configuration
    - Test MONGODB_URI environment variable is used
    - Test error thrown when MONGODB_URI is missing
    - Test database name is "content_quality_reviewer"
    - Test connection pool configuration
    - _Requirements: 1.2, 1.4, 1.5, 9.2_
  
  - [ ]* 2.4 Write unit tests for index creation
    - Test users collection has unique index on email
    - Test analyses collection has index on analysisId
    - Test analyses collection has compound index on userId + createdAt
    - Test analyses collection has TTL index with 30-day expiration
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 5.1, 5.2_

- [x] 3. Checkpoint - Verify connection and indexes
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Migrate user storage operations
  - [x] 4.1 Implement createUser function
    - Generate UUID v4 for user id
    - Create user document with id, email, hashedPassword, createdAt (ISO string)
    - Insert into users collection
    - Return created user object
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 4.2 Write property test for user document completeness
    - **Property 1: User Document Completeness**
    - **Validates: Requirements 2.1**
  
  - [ ]* 4.3 Write property test for user ID format
    - **Property 2: User ID Format**
    - **Validates: Requirements 2.2**
  
  - [x] 4.4 Implement getUserByEmail function
    - Query users collection by email field
    - Return user document or null if not found
    - _Requirements: 2.3, 2.5_
  
  - [x] 4.5 Implement getUserById function
    - Query users collection by id field
    - Return user document or null if not found
    - _Requirements: 2.4, 2.6_
  
  - [ ]* 4.6 Write property test for user storage round-trip
    - **Property 3: User Storage Round-Trip**
    - **Validates: Requirements 2.3, 2.4**
  
  - [ ]* 4.7 Write property test for non-existent user returns null
    - **Property 4: Non-Existent User Returns Null**
    - **Validates: Requirements 2.5, 2.6**
  
  - [ ]* 4.8 Write property test for email uniqueness enforcement
    - **Property 5: Email Uniqueness Enforcement**
    - **Validates: Requirements 2.7**

- [x] 5. Checkpoint - Verify user operations
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Migrate analysis storage operations
  - [x] 6.1 Implement storeAnalysisResult function
    - Generate UUID v4 for analysisId
    - Create timestamp as ISO string
    - Create createdAt as Date object
    - Create analysis document with all fields
    - Insert into analyses collection
    - Return analysis result object
    - _Requirements: 3.1, 3.2, 3.3, 5.3_
  
  - [ ]* 6.2 Write property test for analysis document completeness
    - **Property 6: Analysis Document Completeness**
    - **Validates: Requirements 3.1**
  
  - [ ]* 6.3 Write property test for analysis ID format
    - **Property 7: Analysis ID Format**
    - **Validates: Requirements 3.2**
  
  - [ ]* 6.4 Write property test for timestamp ISO format
    - **Property 8: Timestamp ISO Format**
    - **Validates: Requirements 3.3**
  
  - [ ]* 6.5 Write property test for TTL field presence
    - **Property 16: TTL Field Presence**
    - **Validates: Requirements 5.3**
  
  - [x] 6.6 Implement getAnalysisById function
    - Query analyses collection by analysisId field
    - Return null if not found
    - Verify userId matches requesting user
    - Return null if userId does not match
    - Return analysis document if ownership verified
    - _Requirements: 3.4, 3.5, 3.6, 3.7_
  
  - [ ]* 6.7 Write property test for analysis retrieval with ownership
    - **Property 9: Analysis Retrieval with Ownership**
    - **Validates: Requirements 3.4, 3.5**
  
  - [ ]* 6.8 Write property test for non-existent analysis returns null
    - **Property 10: Non-Existent Analysis Returns Null**
    - **Validates: Requirements 3.7**

- [x] 7. Checkpoint - Verify analysis operations
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement user history retrieval
  - [x] 8.1 Implement getUserHistory function
    - Default limit to 10 if not provided
    - Query analyses collection for documents matching userId
    - Sort by createdAt descending (most recent first)
    - Limit results to specified limit
    - Get total count of user's analyses
    - Calculate hasMore flag (total > limit)
    - Return object with analyses array, total, and hasMore
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 8.2 Write property test for user history filtering
    - **Property 11: User History Filtering**
    - **Validates: Requirements 4.1**
  
  - [ ]* 8.3 Write property test for history sort order
    - **Property 12: History Sort Order**
    - **Validates: Requirements 4.2**
  
  - [ ]* 8.4 Write property test for history limit enforcement
    - **Property 13: History Limit Enforcement**
    - **Validates: Requirements 4.3**
  
  - [ ]* 8.5 Write unit test for default limit behavior
    - Test that omitting limit parameter defaults to 10 results
    - _Requirements: 4.4_
  
  - [ ]* 8.6 Write property test for history response structure
    - **Property 14: History Response Structure**
    - **Validates: Requirements 4.5**
  
  - [ ]* 8.7 Write property test for hasMore flag accuracy
    - **Property 15: HasMore Flag Accuracy**
    - **Validates: Requirements 4.6**

- [x] 9. Final checkpoint - Verify all functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Update module exports and cleanup
  - Verify all six functions are exported: createUser, getUserByEmail, getUserById, storeAnalysisResult, getAnalysisById, getUserHistory
  - Remove all @vercel/kv imports
  - Ensure no references to kv client remain
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical breakpoints
- Property tests validate universal correctness properties across random inputs
- Unit tests validate specific examples, edge cases, and configuration
- The migration maintains the exact same interface, so API endpoints require no changes
- MongoDB connection uses singleton pattern for serverless efficiency
- TTL index handles automatic cleanup of 30-day-old analyses
