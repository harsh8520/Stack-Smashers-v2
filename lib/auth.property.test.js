// Set JWT_SECRET for tests BEFORE any imports
process.env.JWT_SECRET = 'test-secret-key-for-property-tests';

// Mock storage module for property tests
jest.mock('./storage', () => ({
  getUserById: jest.fn()
}));

const fc = require('fast-check');
const {
  generateJWT,
  verifyJWT,
  authenticateRequest,
  hashPassword,
  comparePassword
} = require('./auth');

describe('Auth Module - Property-Based Tests', () => {
  describe('Property 9: Password Hashing', () => {
    /**
     * Feature: vercel-openai-migration, Property 9: Password Hashing
     * **Validates: Requirements 4.1**
     * 
     * For any user signup with a plaintext password, the stored password 
     * SHALL be hashed (not equal to the plaintext password).
     */
    test('hashed password should never equal plaintext password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (password) => {
            const hashed = await hashPassword(password);
            
            // Hashed password must not equal plaintext
            expect(hashed).not.toBe(password);
            
            // Hashed password should be a bcrypt hash (starts with $2a$ or $2b$)
            expect(hashed).toMatch(/^\$2[ab]\$/);
          }
        ),
        { numRuns: 50 }
      );
    });

    test('same password should produce different hashes (salt)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (password) => {
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);
            
            // Different hashes due to different salts
            expect(hash1).not.toBe(hash2);
            
            // But both should verify correctly
            const valid1 = await comparePassword(password, hash1);
            const valid2 = await comparePassword(password, hash2);
            expect(valid1).toBe(true);
            expect(valid2).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 10: JWT Authentication', () => {
    /**
     * Feature: vercel-openai-migration, Property 10: JWT Authentication
     * **Validates: Requirements 4.2**
     * 
     * For any valid user credentials, successful login SHALL return a JWT token 
     * that can be verified and decoded to extract userId and email.
     */
    test('generated JWT can be verified and decoded to extract user data', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            email: fc.emailAddress()
          }),
          (user) => {
            const token = generateJWT(user);
            
            // Token should be a non-empty string
            expect(typeof token).toBe('string');
            expect(token.length).toBeGreaterThan(0);
            
            // Token should be verifiable
            const decoded = verifyJWT(token);
            expect(decoded).not.toBeNull();
            
            // Decoded token should contain userId and email
            expect(decoded.userId).toBe(user.id);
            expect(decoded.email).toBe(user.email);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('JWT token contains expiry information', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            email: fc.emailAddress()
          }),
          (user) => {
            const token = generateJWT(user);
            const decoded = verifyJWT(token);
            
            // Token should have iat (issued at) and exp (expiry) fields
            expect(decoded).toHaveProperty('iat');
            expect(decoded).toHaveProperty('exp');
            
            // Expiry should be in the future
            expect(decoded.exp).toBeGreaterThan(decoded.iat);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 11: Protected Endpoint Authorization', () => {
    /**
     * Feature: vercel-openai-migration, Property 11: Protected Endpoint Authorization
     * **Validates: Requirements 4.3**
     * 
     * For any protected API endpoint, requests without a valid JWT token in the 
     * Authorization header SHALL be rejected with 401 Unauthorized.
     */
    test('requests without Authorization header should return null', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            headers: fc.record({
              'content-type': fc.constantFrom('application/json', 'text/plain'),
              'user-agent': fc.string()
            })
          }),
          async (req) => {
            const result = await authenticateRequest(req);
            expect(result).toBeNull();
          }
        ),
        { numRuns: 50 }
      );
    });

    test('requests with invalid Bearer token format should return null', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(''),
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.constant('Basic credentials'),
            fc.constant('Token abc123')
          ),
          async (authValue) => {
            const req = {
              headers: {
                authorization: authValue
              }
            };
            
            const result = await authenticateRequest(req);
            expect(result).toBeNull();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 19: Frontend Authorization Headers', () => {
    /**
     * Feature: vercel-openai-migration, Property 19: Frontend Authorization Headers
     * **Validates: Requirements 10.5**
     * 
     * For any API request from the frontend, the Authorization header SHALL include 
     * a Bearer token in the format `Bearer {jwt}`.
     */
    test('authenticateRequest should extract token after "Bearer " prefix', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.uuid(),
            email: fc.emailAddress()
          }),
          async (user) => {
            // Generate a valid token
            const token = generateJWT(user);
            
            // Create request with Bearer token
            const req = {
              headers: {
                authorization: `Bearer ${token}`
              }
            };
            
            // Mock getUserById to return the user
            const storage = require('./storage');
            storage.getUserById.mockResolvedValue(user);
            
            const result = await authenticateRequest(req);
            
            // Should successfully authenticate
            expect(result).not.toBeNull();
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Password Comparison Properties', () => {
    test('correct password should always verify against its hash', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (password) => {
            const hashed = await hashPassword(password);
            const isValid = await comparePassword(password, hashed);
            
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    }, 30000); // 30 second timeout

    test('incorrect password should not verify against hash', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (password1, password2) => {
            // Skip if passwords are the same
            fc.pre(password1 !== password2);
            
            const hashed = await hashPassword(password1);
            const isValid = await comparePassword(password2, hashed);
            
            expect(isValid).toBe(false);
          }
        ),
        { numRuns: 20 }
      );
    }, 30000); // 30 second timeout
  });

  describe('JWT Token Properties', () => {
    test('verifyJWT should return null for malformed tokens', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.constant('not.a.jwt'),
            fc.constant('invalid-token'),
            fc.constant(''),
            fc.constant('a.b.c.d.e')
          ),
          (invalidToken) => {
            const result = verifyJWT(invalidToken);
            expect(result).toBeNull();
          }
        ),
        { numRuns: 50 }
      );
    });

    test('JWT round-trip preserves user data', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            email: fc.emailAddress()
          }),
          (user) => {
            const token = generateJWT(user);
            const decoded = verifyJWT(token);
            
            // User data should be preserved
            expect(decoded.userId).toBe(user.id);
            expect(decoded.email).toBe(user.email);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
