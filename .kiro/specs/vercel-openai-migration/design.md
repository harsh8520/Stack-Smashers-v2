# Design Document: Vercel + OpenAI Migration

## Overview

This design document outlines the architecture for migrating the Content Quality Reviewer application from AWS infrastructure to Vercel hosting with OpenAI API integration. The migration transforms TypeScript Lambda functions into JavaScript Vercel serverless functions, replaces AWS Bedrock with OpenAI's GPT models, migrates DynamoDB storage to Vercel KV (Redis), and replaces Cognito authentication with JWT-based authentication.

The migration maintains API compatibility with the existing frontend while modernizing the infrastructure to leverage Vercel's edge network and OpenAI's advanced language models.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                  (Existing, minimal changes)                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS + JWT
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ /api/analyze │  │/api/analysis │  │ /api/history │     │
│  │              │  │    /[id]     │  │              │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│         ┌──────────────────┴──────────────────┐             │
│         │                                      │             │
│         ▼                                      ▼             │
│  ┌─────────────┐                      ┌──────────────┐     │
│  │  OpenAI API │                      │  Vercel KV   │     │
│  │  (GPT-4)    │                      │  (Redis)     │     │
│  └─────────────┘                      └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Mapping

| AWS Component | Vercel Equivalent | Notes |
|--------------|-------------------|-------|
| Lambda Functions | Vercel Serverless Functions | File-based routing in `/api` |
| API Gateway | Vercel Edge Network | Automatic routing and CORS |
| DynamoDB | Vercel KV (Redis) | Key-value storage with TTL |
| Cognito | JWT + bcrypt | Custom auth implementation |
| Bedrock (Nova) | OpenAI API (GPT-4) | Chat completion API |
| AWS Comprehend | OpenAI + local NLP | Sentiment/key phrase extraction |
| CloudWatch Logs | Vercel Logs | Automatic log capture |

## Components and Interfaces

### 1. Vercel Serverless Functions

#### `/api/analyze.js`
Main content analysis endpoint that orchestrates the analysis pipeline.

```javascript
// Request Handler
export default async function handler(req, res) {
  // Validate HTTP method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authenticate request
  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check rate limit
  const rateLimitOk = await checkRateLimit(user.id);
  if (!rateLimitOk) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  // Parse and validate request
  const { content, targetPlatform, contentIntent } = req.body;
  const validation = validateAnalyzeRequest(content, targetPlatform, contentIntent);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    // Perform analysis
    const result = await analyzeContent({
      content,
      targetPlatform,
      contentIntent,
      userId: user.id
    });

    // Return result
    return res.status(200).json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ 
      error: 'Analysis failed',
      retryable: true 
    });
  }
}
```

#### `/api/analysis/[id].js`
Retrieves a specific analysis by ID.

```javascript
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  
  try {
    const result = await getAnalysisById(id, user.id);
    if (!result) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Get analysis error:', error);
    return res.status(500).json({ error: 'Failed to retrieve analysis' });
  }
}
```

#### `/api/history.js`
Retrieves user's analysis history.

```javascript
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await authenticateRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { limit = 10 } = req.query;
  
  try {
    const history = await getUserHistory(user.id, parseInt(limit));
    return res.status(200).json(history);
  } catch (error) {
    console.error('History error:', error);
    return res.status(500).json({ error: 'Failed to retrieve history' });
  }
}
```

#### `/api/auth/signup.js`
User registration endpoint.

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await createUser({ email, hashedPassword });

    // Generate JWT
    const token = generateJWT(user);

    return res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Signup failed' });
  }
}
```

#### `/api/auth/login.js`
User login endpoint.

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  
  try {
    // Get user
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateJWT(user);

    return res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}
```

### 2. OpenAI Integration Module

#### `lib/openai-client.js`
Handles OpenAI API communication.

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = 'gpt-4-turbo-preview';
const MAX_RETRIES = 2;
const TIMEOUT_MS = 25000;

export async function analyzeContentWithAI(input) {
  const prompt = constructAnalysisPrompt(input);
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a content quality analyzer. Return analysis as JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      return parseAIResponse(content);
    } catch (error) {
      console.error(`OpenAI attempt ${attempt + 1} failed:`, error);
      
      if (attempt < MAX_RETRIES) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }
  
  // Return fallback response
  return generateFallbackResponse();
}

function constructAnalysisPrompt(input) {
  return `Analyze the following content for quality across four dimensions:

Content: "${input.content}"
Target Platform: ${input.targetPlatform}
Content Intent: ${input.contentIntent}
Word Count: ${input.wordCount}

Return a JSON object with this structure:
{
  "dimensionScores": {
    "structure": {
      "score": 0-100,
      "confidence": 0-1,
      "issues": [{"type": "critical|important|minor", "category": "structure", "description": "...", "suggestion": "...", "reasoning": "..."}],
      "strengths": ["..."]
    },
    "tone": { /* same structure */ },
    "accessibility": { /* same structure */ },
    "platformAlignment": { /* same structure */ }
  },
  "overallScore": 0-100,
  "suggestions": [
    {
      "priority": "high|medium|low",
      "category": "...",
      "title": "...",
      "description": "...",
      "reasoning": "...",
      "examples": ["..."]
    }
  ]
}`;
}

function parseAIResponse(content) {
  try {
    const parsed = JSON.parse(content);
    
    // Validate structure
    if (!parsed.dimensionScores || !parsed.overallScore) {
      throw new Error('Invalid response structure');
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return generateFallbackResponse();
  }
}

function generateFallbackResponse() {
  return {
    dimensionScores: {
      structure: { score: 50, confidence: 0.3, issues: [], strengths: [] },
      tone: { score: 50, confidence: 0.3, issues: [], strengths: [] },
      accessibility: { score: 50, confidence: 0.3, issues: [], strengths: [] },
      platformAlignment: { score: 50, confidence: 0.3, issues: [], strengths: [] }
    },
    overallScore: 50,
    suggestions: [{
      priority: 'high',
      category: 'system',
      title: 'Analysis Unavailable',
      description: 'AI analysis temporarily unavailable',
      reasoning: 'Service error',
      examples: []
    }]
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 3. Storage Service (Vercel KV)

#### `lib/storage.js`
Abstracts Vercel KV operations.

```javascript
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

const TTL_DAYS = 30;
const TTL_SECONDS = TTL_DAYS * 24 * 60 * 60;

export async function storeAnalysisResult(data) {
  const analysisId = uuidv4();
  const timestamp = new Date().toISOString();
  
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
  
  // Store analysis by ID
  const analysisKey = `analysis:${analysisId}`;
  await kv.set(analysisKey, JSON.stringify(result), { ex: TTL_SECONDS });
  
  // Add to user's history (sorted set by timestamp)
  const userHistoryKey = `user:${data.userId}:history`;
  await kv.zadd(userHistoryKey, { score: Date.now(), member: analysisId });
  
  // Set TTL on user history key
  await kv.expire(userHistoryKey, TTL_SECONDS);
  
  return result;
}

export async function getAnalysisById(analysisId, userId) {
  const analysisKey = `analysis:${analysisId}`;
  const data = await kv.get(analysisKey);
  
  if (!data) {
    return null;
  }
  
  const result = JSON.parse(data);
  
  // Verify ownership
  if (result.userId !== userId) {
    return null;
  }
  
  return result;
}

export async function getUserHistory(userId, limit = 10) {
  const userHistoryKey = `user:${userId}:history`;
  
  // Get most recent analysis IDs (sorted by timestamp, descending)
  const analysisIds = await kv.zrange(userHistoryKey, 0, limit - 1, { rev: true });
  
  if (!analysisIds || analysisIds.length === 0) {
    return {
      analyses: [],
      total: 0,
      hasMore: false
    };
  }
  
  // Fetch all analyses
  const analyses = [];
  for (const id of analysisIds) {
    const analysisKey = `analysis:${id}`;
    const data = await kv.get(analysisKey);
    if (data) {
      analyses.push(JSON.parse(data));
    }
  }
  
  // Get total count
  const total = await kv.zcard(userHistoryKey);
  
  return {
    analyses,
    total,
    hasMore: total > limit
  };
}

export async function createUser(userData) {
  const userId = uuidv4();
  const user = {
    id: userId,
    email: userData.email,
    hashedPassword: userData.hashedPassword,
    createdAt: new Date().toISOString()
  };
  
  // Store user by ID
  const userKey = `user:${userId}`;
  await kv.set(userKey, JSON.stringify(user));
  
  // Store email -> userId mapping
  const emailKey = `email:${userData.email}`;
  await kv.set(emailKey, userId);
  
  return user;
}

export async function getUserByEmail(email) {
  // Get userId from email mapping
  const emailKey = `email:${email}`;
  const userId = await kv.get(emailKey);
  
  if (!userId) {
    return null;
  }
  
  // Get user data
  const userKey = `user:${userId}`;
  const data = await kv.get(userKey);
  
  if (!data) {
    return null;
  }
  
  return JSON.parse(data);
}

export async function getUserById(userId) {
  const userKey = `user:${userId}`;
  const data = await kv.get(userKey);
  
  if (!data) {
    return null;
  }
  
  return JSON.parse(data);
}
```

### 4. Authentication Module

#### `lib/auth.js`
JWT-based authentication.

```javascript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getUserById } from './storage.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '7d';

export function generateJWT(user) {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateRequest(req) {
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

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
```

### 5. Rate Limiting Module

#### `lib/rate-limit.js`
Sliding window rate limiting using Vercel KV.

```javascript
import { kv } from '@vercel/kv';

const RATE_LIMIT_WINDOW = 60; // 60 seconds
const RATE_LIMIT_MAX = 10; // 10 requests per window

export async function checkRateLimit(userId) {
  const key = `ratelimit:${userId}`;
  const now = Date.now();
  const windowStart = now - (RATE_LIMIT_WINDOW * 1000);
  
  // Remove old entries
  await kv.zremrangebyscore(key, 0, windowStart);
  
  // Count requests in current window
  const count = await kv.zcard(key);
  
  if (count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  // Add current request
  await kv.zadd(key, { score: now, member: `${now}` });
  
  // Set TTL
  await kv.expire(key, RATE_LIMIT_WINDOW * 2);
  
  return true;
}
```

### 6. Local Analyzers

The existing local analyzers (structure, tone, accessibility, platform) will be converted from TypeScript to JavaScript with minimal changes. The core logic remains the same.

#### `lib/analyzers/structure-analyzer.js`
```javascript
export function analyzeStructure(input) {
  const { content, keyPhrases, syntaxTokens } = input;
  
  const issues = [];
  const strengths = [];
  let score = 100;
  
  // Analyze paragraph structure
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length < 2) {
    issues.push({
      type: 'important',
      category: 'structure',
      description: 'Content lacks clear paragraph structure',
      suggestion: 'Break content into multiple paragraphs',
      reasoning: 'Well-structured paragraphs improve readability'
    });
    score -= 15;
  } else {
    strengths.push('Clear paragraph structure');
  }
  
  // Analyze sentence length
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = content.split(/\s+/).length / sentences.length;
  
  if (avgSentenceLength > 25) {
    issues.push({
      type: 'minor',
      category: 'structure',
      description: 'Sentences are too long on average',
      suggestion: 'Break long sentences into shorter ones',
      reasoning: 'Shorter sentences improve clarity'
    });
    score -= 10;
  }
  
  // Check for key phrases (indicates good structure)
  if (keyPhrases && keyPhrases.length > 3) {
    strengths.push('Rich key phrase usage');
  }
  
  return {
    score: Math.max(0, score),
    confidence: 0.8,
    issues,
    strengths
  };
}
```

Similar conversions will be done for `tone-analyzer.js`, `accessibility-checker.js`, and `platform-adapter.js`.

### 7. NLP Utilities (Replacing AWS Comprehend)

#### `lib/nlp-utils.js`
Simple NLP utilities to replace AWS Comprehend.

```javascript
// For sentiment analysis, we'll use OpenAI or a simple library
export async function analyzeSentiment(content) {
  // Option 1: Use OpenAI for sentiment
  // Option 2: Use a library like 'sentiment' npm package
  const Sentiment = require('sentiment');
  const sentiment = new Sentiment();
  const result = sentiment.analyze(content);
  
  // Map to AWS Comprehend format
  let sentimentType = 'NEUTRAL';
  if (result.score > 2) sentimentType = 'POSITIVE';
  if (result.score < -2) sentimentType = 'NEGATIVE';
  
  return {
    Sentiment: sentimentType,
    SentimentScore: {
      Positive: Math.max(0, result.score / 10),
      Negative: Math.max(0, -result.score / 10),
      Neutral: 0.5,
      Mixed: 0
    }
  };
}

export function extractKeyPhrases(content) {
  // Simple key phrase extraction
  // Split into words, filter common words, return top phrases
  const words = content.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  
  const phrases = words
    .filter(w => w.length > 4 && !stopWords.has(w))
    .slice(0, 10);
  
  return phrases.map(phrase => ({
    Text: phrase,
    Score: 0.8
  }));
}

export function analyzeSyntax(content) {
  // Simple syntax analysis
  const words = content.split(/\s+/);
  
  return words.map((word, index) => ({
    TokenId: index,
    Text: word,
    PartOfSpeech: { Tag: 'NOUN' } // Simplified
  }));
}
```

## Data Models

### Analysis Result
```javascript
{
  analysisId: string,          // UUID
  userId: string,              // User ID
  timestamp: string,           // ISO 8601
  content: string,             // Original content
  targetPlatform: string,      // 'blog' | 'linkedin' | 'twitter' | 'medium'
  contentIntent: string,       // 'inform' | 'educate' | 'persuade'
  overallScore: number,        // 0-100
  dimensionScores: {
    structure: QualityScore,
    tone: QualityScore,
    accessibility: QualityScore,
    platformAlignment: QualityScore
  },
  suggestions: Suggestion[],
  metadata: {
    processingTime: number,    // milliseconds
    contentLength: number,     // word count
    platformOptimized: boolean
  }
}
```

### Quality Score
```javascript
{
  score: number,               // 0-100
  confidence: number,          // 0-1
  issues: Issue[],
  strengths: string[]
}
```

### Issue
```javascript
{
  type: string,                // 'critical' | 'important' | 'minor'
  category: string,            // 'structure' | 'tone' | 'accessibility' | 'platform'
  description: string,
  suggestion: string,
  reasoning: string
}
```

### Suggestion
```javascript
{
  priority: string,            // 'high' | 'medium' | 'low'
  category: string,
  title: string,
  description: string,
  reasoning: string,
  examples: string[]
}
```

### User
```javascript
{
  id: string,                  // UUID
  email: string,
  hashedPassword: string,
  createdAt: string            // ISO 8601
}
```

## Correctness Properties


A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: CORS Headers Present
*For any* Vercel function and any HTTP request, the response SHALL include appropriate CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers).
**Validates: Requirements 1.5**

### Property 2: OpenAI Prompt Format
*For any* content analysis request, the constructed prompt SHALL follow OpenAI's chat completion message format with role and content fields.
**Validates: Requirements 2.2**

### Property 3: AI Response Parsing
*For any* valid OpenAI JSON response containing dimension scores, parsing SHALL successfully extract all four dimension scores (structure, tone, accessibility, platformAlignment).
**Validates: Requirements 2.3**

### Property 4: Retry with Exponential Backoff
*For any* OpenAI API call that fails with a retryable error, the system SHALL retry with exponentially increasing delays (2^attempt * 1000ms).
**Validates: Requirements 2.5**

### Property 5: Storage Key Format
*For any* userId and analysisId, the generated storage key SHALL match the format `user:{userId}:analysis:{analysisId}` or `analysis:{analysisId}`.
**Validates: Requirements 3.2**

### Property 6: History Sorted by Timestamp
*For any* user with multiple analysis results, retrieving history SHALL return results sorted by timestamp in descending order (most recent first).
**Validates: Requirements 3.3**

### Property 7: TTL Set on Stored Data
*For any* analysis result stored in Vercel KV, the TTL (time-to-live) SHALL be set to 30 days (2,592,000 seconds).
**Validates: Requirements 3.4**

### Property 8: JSON Serialization Round Trip
*For any* valid analysis result object, serializing to JSON then deserializing SHALL produce an equivalent object with all required fields intact.
**Validates: Requirements 3.5, 3.6**

### Property 9: Password Hashing
*For any* user signup with a plaintext password, the stored password SHALL be hashed (not equal to the plaintext password).
**Validates: Requirements 4.1**

### Property 10: JWT Authentication
*For any* valid user credentials, successful login SHALL return a JWT token that can be verified and decoded to extract userId and email.
**Validates: Requirements 4.2**

### Property 11: Protected Endpoint Authorization
*For any* protected API endpoint, requests without a valid JWT token in the Authorization header SHALL be rejected with 401 Unauthorized.
**Validates: Requirements 4.3**

### Property 12: Request Body Compatibility
*For any* valid AWS Lambda request body structure, the Vercel function SHALL accept and process it without errors.
**Validates: Requirements 5.4**

### Property 13: Response Structure Compatibility
*For any* successful analysis request, the response structure SHALL match the AWS Lambda response structure with the same fields (analysisId, userId, timestamp, dimensionScores, suggestions, metadata).
**Validates: Requirements 5.5**

### Property 14: Error Response Format
*For any* error condition, the error response SHALL include an error object with code, message, and retryable fields.
**Validates: Requirements 5.6**

### Property 15: Missing Environment Variable Errors
*For any* required environment variable that is missing, the system SHALL throw an error with a descriptive message indicating which variable is missing.
**Validates: Requirements 6.4**

### Property 16: Analyzer Behavior Preservation
*For any* input to the structure analyzer, the JavaScript version SHALL produce the same score and issues as the TypeScript version (within a tolerance of ±5 points).
**Validates: Requirements 8.1**

### Property 17: Score Merging Algorithm
*For any* local analyzer score and AI score, the merged score SHALL equal `Math.round(localScore * 0.7 + aiScore * 0.3)`.
**Validates: Requirements 8.5**

### Property 18: Comprehend Data Structure Compatibility
*For any* sentiment analysis result, the output SHALL include Sentiment field and SentimentScore object matching AWS Comprehend structure.
**Validates: Requirements 9.4**

### Property 19: Frontend Authorization Headers
*For any* API request from the frontend, the Authorization header SHALL include a Bearer token in the format `Bearer {jwt}`.
**Validates: Requirements 10.5**

### Property 20: Error Logging Context
*For any* error that occurs in a Vercel function, the error log SHALL include the error message, stack trace, and request context (method, path, userId if available).
**Validates: Requirements 11.1**

### Property 21: HTTP Status Code Mapping
*For any* error type, the correct HTTP status code SHALL be returned: validation errors → 400, authentication errors → 401, not found → 404, server errors → 500, timeouts → 504.
**Validates: Requirements 11.2**

### Property 22: Validation Error Messages
*For any* validation failure, the response SHALL have status 400 and include a descriptive error message explaining what validation failed.
**Validates: Requirements 11.4**

### Property 23: Rate Limit Tracking
*For any* authenticated user request, the request count SHALL be incremented in Vercel KV under the key `ratelimit:{userId}`.
**Validates: Requirements 12.1**

### Property 24: Sliding Window Rate Limiting
*For any* user, the rate limit SHALL only count requests within the last 60 seconds (sliding window), automatically excluding older requests.
**Validates: Requirements 12.3**

### Property 25: Per-Endpoint Rate Limits
*For any* endpoint with a configured rate limit, exceeding the limit SHALL result in a 429 response, and staying within the limit SHALL allow the request to proceed.
**Validates: Requirements 12.4**

### Property 26: Rate Limit TTL
*For any* rate limit entry in Vercel KV, the TTL SHALL be set to twice the rate limit window (120 seconds) to ensure automatic cleanup.
**Validates: Requirements 12.5**

## Error Handling

### Error Categories

1. **Validation Errors (400)**
   - Invalid request body structure
   - Missing required fields
   - Content exceeds length limits
   - Invalid platform or intent values

2. **Authentication Errors (401)**
   - Missing JWT token
   - Invalid JWT token
   - Expired JWT token
   - Invalid credentials

3. **Authorization Errors (403)**
   - User attempting to access another user's data

4. **Not Found Errors (404)**
   - Analysis ID not found
   - User not found

5. **Rate Limit Errors (429)**
   - Too many requests within time window

6. **Server Errors (500)**
   - OpenAI API failures (after retries)
   - Vercel KV connection failures
   - Unexpected exceptions

7. **Timeout Errors (504)**
   - OpenAI API timeout
   - Vercel function timeout

### Error Response Format

All errors follow this structure:
```javascript
{
  error: {
    code: string,        // Error code (e.g., 'INVALID_INPUT', 'UNAUTHORIZED')
    message: string,     // Human-readable error message
    retryable: boolean   // Whether the client should retry
  }
}
```

### Retry Strategy

- **OpenAI API**: 2 retries with exponential backoff (1s, 2s)
- **Vercel KV**: No automatic retries (fail fast)
- **Client**: Should retry on 429, 500, 504 with backoff

## Testing Strategy

### Dual Testing Approach

The migration will use both unit tests and property-based tests to ensure correctness:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Together, these provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Property-Based Testing Configuration

- **Library**: Use `fast-check` for JavaScript property-based testing
- **Iterations**: Minimum 100 iterations per property test
- **Tagging**: Each property test must reference its design document property
- **Tag format**: `Feature: vercel-openai-migration, Property {number}: {property_text}`

### Test Categories

1. **API Endpoint Tests**
   - Unit tests for each endpoint with valid/invalid inputs
   - Property tests for request/response structure compatibility
   - Integration tests for end-to-end flows

2. **Authentication Tests**
   - Unit tests for signup, login, token validation
   - Property tests for JWT generation and verification
   - Edge cases: expired tokens, malformed tokens

3. **Storage Tests**
   - Unit tests for CRUD operations
   - Property tests for key format, serialization, TTL
   - Edge cases: missing data, corrupted JSON

4. **OpenAI Integration Tests**
   - Unit tests for prompt construction
   - Property tests for response parsing
   - Mock tests for retry logic and fallback

5. **Rate Limiting Tests**
   - Unit tests for sliding window algorithm
   - Property tests for rate limit enforcement
   - Edge cases: concurrent requests, TTL expiration

6. **Analyzer Migration Tests**
   - Unit tests comparing TypeScript vs JavaScript outputs
   - Property tests for score merging algorithm
   - Regression tests to ensure behavior preservation

### Testing Tools

- **Test Framework**: Jest or Vitest
- **Property Testing**: fast-check
- **Mocking**: jest.mock() or vitest.mock()
- **API Testing**: supertest or similar
- **Coverage**: Aim for >80% code coverage

### Example Property Test

```javascript
import fc from 'fast-check';
import { mergeScores } from '../lib/analyzers/score-merger';

// Feature: vercel-openai-migration, Property 17: Score Merging Algorithm
test('merged score equals weighted average (70% local, 30% AI)', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 100 }), // local score
      fc.integer({ min: 0, max: 100 }), // AI score
      (localScore, aiScore) => {
        const result = mergeScores(
          { score: localScore, confidence: 0.8, issues: [], strengths: [] },
          { score: aiScore, confidence: 0.8, issues: [], strengths: [] }
        );
        
        const expected = Math.round(localScore * 0.7 + aiScore * 0.3);
        expect(result.score).toBe(expected);
      }
    ),
    { numRuns: 100 }
  );
});
```

## Deployment Strategy

### Phase 1: Development Environment
1. Set up Vercel project
2. Configure environment variables
3. Deploy to preview environment
4. Run integration tests

### Phase 2: Staging Environment
1. Deploy to staging
2. Run full test suite
3. Perform manual testing
4. Load testing with realistic traffic

### Phase 3: Production Migration
1. Deploy to production
2. Monitor error rates and performance
3. Gradual traffic migration (if possible)
4. Rollback plan ready

### Environment Variables

Required environment variables for Vercel:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Vercel KV Configuration (auto-configured by Vercel)
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Application Configuration
MAX_CONTENT_LENGTH=2000
RATE_LIMIT_WINDOW=60
RATE_LIMIT_MAX=10
```

### Monitoring and Observability

- **Vercel Analytics**: Track function execution time and errors
- **Vercel Logs**: Monitor console.log and console.error output
- **OpenAI Usage**: Track API usage and costs
- **Vercel KV Metrics**: Monitor storage usage and operation counts

## Migration Checklist

- [ ] Convert all Lambda functions to Vercel functions
- [ ] Replace Bedrock client with OpenAI client
- [ ] Migrate DynamoDB operations to Vercel KV
- [ ] Implement JWT authentication
- [ ] Update frontend to use new auth and API endpoints
- [ ] Convert all TypeScript to JavaScript
- [ ] Migrate local analyzers
- [ ] Implement NLP utilities to replace Comprehend
- [ ] Set up rate limiting
- [ ] Configure vercel.json
- [ ] Set up environment variables
- [ ] Write unit tests
- [ ] Write property-based tests
- [ ] Deploy to preview environment
- [ ] Run integration tests
- [ ] Deploy to production
- [ ] Monitor and verify functionality
