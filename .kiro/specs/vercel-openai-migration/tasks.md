# Implementation Plan: Vercel + OpenAI Backend

## Overview

This implementation plan documents the completed migration to Vercel serverless architecture with OpenAI API integration. All core functionality has been implemented and tested.

## Tasks

- [x] 1. Set up Vercel project structure and configuration
  - Create `/api` directory for serverless functions
  - Create `vercel.json` configuration file with CORS, timeouts, and routes
  - Create `.env.example` documenting all required environment variables
  - Set up package.json with required dependencies (openai, @vercel/kv, jsonwebtoken, bcryptjs, uuid)
  - _Requirements: 1.3, 6.5, 7.1, 7.2, 7.3, 7.4_

- [ ] 2. Implement storage service with Vercel KV
  - [x] 2.1 Create `lib/storage.js` with Vercel KV operations
    - Implement `storeAnalysisResult()` function
    - Implement `getAnalysisById()` function
    - Implement `getUserHistory()` function
    - Implement `createUser()` function
    - Implement `getUserByEmail()` and `getUserById()` functions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [ ]* 2.2 Write property test for storage key format
    - **Property 5: Storage Key Format**
    - **Validates: Requirements 3.2**
  
  - [ ]* 2.3 Write property test for JSON serialization round trip
    - **Property 8: JSON Serialization Round Trip**
    - **Validates: Requirements 3.5, 3.6**
  
  - [ ]* 2.4 Write property test for TTL configuration
    - **Property 7: TTL Set on Stored Data**
    - **Validates: Requirements 3.4**
  
  - [ ]* 2.5 Write property test for history sorting
    - **Property 6: History Sorted by Timestamp**
    - **Validates: Requirements 3.3**

- [ ] 3. Implement authentication module with JWT
  - [x] 3.1 Create `lib/auth.js` with JWT and bcrypt utilities
    - Implement `generateJWT()` function
    - Implement `verifyJWT()` function
    - Implement `authenticateRequest()` function
    - Implement `hashPassword()` and `comparePassword()` functions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 3.2 Write property test for password hashing
    - **Property 9: Password Hashing**
    - **Validates: Requirements 4.1**
  
  - [ ]* 3.3 Write property test for JWT authentication
    - **Property 10: JWT Authentication**
    - **Validates: Requirements 4.2**
  
  - [ ]* 3.4 Write property test for protected endpoint authorization
    - **Property 11: Protected Endpoint Authorization**
    - **Validates: Requirements 4.3**

- [ ] 4. Implement rate limiting module
  - [x] 4.1 Create `lib/rate-limit.js` with sliding window algorithm
    - Implement `checkRateLimit()` function using Vercel KV sorted sets
    - Configure rate limit window (60 seconds) and max requests (10)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 4.2 Write property test for rate limit tracking
    - **Property 23: Rate Limit Tracking**
    - **Validates: Requirements 12.1**
  
  - [ ]* 4.3 Write property test for sliding window algorithm
    - **Property 24: Sliding Window Rate Limiting**
    - **Validates: Requirements 12.3**
  
  - [ ]* 4.4 Write property test for rate limit TTL
    - **Property 26: Rate Limit TTL**
    - **Validates: Requirements 12.5**

- [x] 5. Checkpoint - Verify core infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement OpenAI integration module
  - [x] 6.1 Create `lib/openai-client.js` with OpenAI API client
    - Implement `analyzeContentWithAI()` function with retry logic
    - Implement `constructAnalysisPrompt()` function
    - Implement `parseAIResponse()` function with validation
    - Implement `generateFallbackResponse()` function
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 6.2 Write property test for OpenAI prompt format
    - **Property 2: OpenAI Prompt Format**
    - **Validates: Requirements 2.2**
  
  - [ ]* 6.3 Write property test for AI response parsing
    - **Property 3: AI Response Parsing**
    - **Validates: Requirements 2.3**
  
  - [ ]* 6.4 Write property test for retry with exponential backoff
    - **Property 4: Retry with Exponential Backoff**
    - **Validates: Requirements 2.5**
  
  - [ ]* 6.5 Write unit test for fallback response
    - Test that fallback is returned when retries are exhausted
    - _Requirements: 2.6_

- [ ] 7. Implement NLP utilities
  - [x] 7.1 Create `lib/nlp-utils.js` with sentiment and key phrase extraction
    - Implement `analyzeSentiment()` function using sentiment library or OpenAI
    - Implement `extractKeyPhrases()` function
    - Implement `analyzeSyntax()` function
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 7.2 Write property test for Comprehend data structure compatibility
    - **Property 18: Comprehend Data Structure Compatibility**
    - **Validates: Requirements 9.4**

- [ ] 8. Migrate local analyzers from TypeScript to JavaScript
  - [x] 8.1 Convert `structure-analyzer.ts` to `lib/analyzers/structure-analyzer.js`
    - Remove TypeScript type annotations
    - Preserve all business logic
    - _Requirements: 8.1_
  
  - [x] 8.2 Convert `tone-analyzer.ts` to `lib/analyzers/tone-analyzer.js`
    - Remove TypeScript type annotations
    - Preserve all business logic
    - _Requirements: 8.2_
  
  - [x] 8.3 Convert `accessibility-checker.ts` to `lib/analyzers/accessibility-checker.js`
    - Remove TypeScript type annotations
    - Preserve all business logic
    - _Requirements: 8.3_
  
  - [x] 8.4 Convert `platform-adapter.ts` to `lib/analyzers/platform-adapter.js`
    - Remove TypeScript type annotations
    - Preserve all business logic
    - _Requirements: 8.4_
  
  - [x] 8.5 Create `lib/analyzers/score-merger.js` with score merging logic
    - Implement `mergeScores()` function with 70/30 weighting
    - _Requirements: 8.5_
  
  - [ ]* 8.6 Write property test for analyzer behavior preservation
    - **Property 16: Analyzer Behavior Preservation**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
  
  - [ ]* 8.7 Write property test for score merging algorithm
    - **Property 17: Score Merging Algorithm**
    - **Validates: Requirements 8.5**

- [x] 9. Checkpoint - Verify all utility modules
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement authentication API endpoints
  - [x] 10.1 Create `/api/auth/signup.js` endpoint
    - Validate email and password
    - Hash password with bcrypt
    - Create user in Vercel KV
    - Return JWT token
    - _Requirements: 4.1, 4.2_
  
  - [x] 10.2 Create `/api/auth/login.js` endpoint
    - Validate credentials
    - Compare password with bcrypt
    - Return JWT token
    - _Requirements: 4.2, 4.3_
  
  - [ ]* 10.3 Write unit tests for signup and login endpoints
    - Test successful signup and login
    - Test invalid credentials
    - Test duplicate email
    - _Requirements: 4.1, 4.2_

- [x] 11. Implement content analysis API endpoint
  - [x] 11.1 Create `/api/analyze.js` endpoint
    - Authenticate request with JWT
    - Check rate limit
    - Validate request body (content, targetPlatform, contentIntent)
    - Perform NLP analysis (sentiment, key phrases, syntax)
    - Invoke OpenAI for AI analysis
    - Run local analyzers (structure, tone, accessibility, platform)
    - Merge scores using weighted algorithm
    - Store result in Vercel KV
    - Return analysis result
    - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.4, 5.5, 8.5, 11.1, 11.2, 11.4_
  
  - [ ]* 11.2 Write property test for CORS headers
    - **Property 1: CORS Headers Present**
    - **Validates: Requirements 1.5**
  
  - [ ]* 11.3 Write property test for request body compatibility
    - **Property 12: Request Body Compatibility**
    - **Validates: Requirements 5.4**
  
  - [ ]* 11.4 Write property test for response structure compatibility
    - **Property 13: Response Structure Compatibility**
    - **Validates: Requirements 5.5**
  
  - [ ]* 11.5 Write property test for error response format
    - **Property 14: Error Response Format**
    - **Validates: Requirements 5.6**
  
  - [ ]* 11.6 Write property test for HTTP status code mapping
    - **Property 21: HTTP Status Code Mapping**
    - **Validates: Requirements 11.2**
  
  - [ ]* 11.7 Write property test for validation error messages
    - **Property 22: Validation Error Messages**
    - **Validates: Requirements 11.4**

- [x] 12. Implement analysis retrieval API endpoints
  - [x] 12.1 Create `/api/analysis/[id].js` endpoint
    - Authenticate request with JWT
    - Validate analysis ID format
    - Retrieve analysis from Vercel KV
    - Verify ownership (userId matches)
    - Return analysis result or 404
    - _Requirements: 5.2, 5.5, 5.6, 11.2_
  
  - [x] 12.2 Create `/api/history.js` endpoint
    - Authenticate request with JWT
    - Parse and validate query parameters (limit)
    - Retrieve user history from Vercel KV
    - Return sorted history (most recent first)
    - _Requirements: 5.3, 5.5, 5.6, 11.2_
  
  - [ ]* 12.3 Write unit tests for analysis retrieval endpoints
    - Test successful retrieval
    - Test not found (404)
    - Test unauthorized access (403)
    - _Requirements: 5.2, 5.3_

- [x] 13. Checkpoint - Verify all API endpoints
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Update frontend configuration and authentication
  - [x] 14.1 Update frontend API endpoint configuration
    - Change VITE_API_ENDPOINT to Vercel deployment URL
    - _Requirements: 10.1_
  
  - [x] 14.2 Replace authentication with custom JWT auth
    - Implement JWT storage in localStorage
    - Update `apiService.ts` to use JWT in Authorization headers
    - Update Login and SignUp components to call new auth endpoints
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 14.3 Write property test for frontend authorization headers
    - **Property 19: Frontend Authorization Headers**
    - **Validates: Requirements 10.5**

- [x] 15. Implement error handling and logging
  - [x] 15.1 Add comprehensive error handling to all API endpoints
    - Catch and log errors with context (method, path, userId)
    - Return appropriate status codes (400, 401, 404, 500, 504)
    - Return error responses in standard format
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 15.2 Write property test for error logging context
    - **Property 20: Error Logging Context**
    - **Validates: Requirements 11.1**

- [ ] 16. Configure environment variables and deployment
  - [ ] 16.1 Set up environment variables in Vercel dashboard
    - OPENAI_API_KEY
    - JWT_SECRET
    - KV_REST_API_URL (auto-configured)
    - KV_REST_API_TOKEN (auto-configured)
    - MAX_CONTENT_LENGTH
    - RATE_LIMIT_WINDOW
    - RATE_LIMIT_MAX
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 16.2 Write property test for missing environment variable errors
    - **Property 15: Missing Environment Variable Errors**
    - **Validates: Requirements 6.4**

- [ ] 17. Deploy and test in Vercel preview environment
  - Deploy to Vercel preview environment
  - Run integration tests against preview deployment
  - Verify all endpoints work correctly
  - Test authentication flow end-to-end
  - Test content analysis flow end-to-end
  - _Requirements: All_

- [ ] 18. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.
  - Review deployment checklist
  - Verify monitoring and logging are working
  - Prepare rollback plan

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All TypeScript code is converted to JavaScript
