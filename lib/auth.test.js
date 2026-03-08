// Set environment variable BEFORE any imports
process.env.JWT_SECRET = 'test-secret-key';

// Mock dependencies BEFORE importing the module under test
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('./storage', () => ({
  getUserById: jest.fn()
}));

// Now import the modules
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getUserById } = require('./storage');
const {
  generateJWT,
  verifyJWT,
  authenticateRequest,
  hashPassword,
  comparePassword
} = require('./auth');

describe('Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateJWT', () => {
    it('should generate a JWT token with user data', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      };
      const mockToken = 'mock-jwt-token';

      jwt.sign.mockReturnValue(mockToken);

      const result = generateJWT(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          userId: 'user-123',
          email: 'test@example.com'
        },
        'test-secret-key',
        { expiresIn: '7d' }
      );
      expect(result).toBe(mockToken);
    });

    it('should throw error if JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const mockUser = { id: 'user-123', email: 'test@example.com' };

      expect(() => generateJWT(mockUser)).toThrow('JWT_SECRET environment variable is not set');

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('verifyJWT', () => {
    it('should verify and decode a valid JWT token', () => {
      const mockToken = 'valid-token';
      const mockDecoded = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890
      };

      jwt.verify.mockReturnValue(mockDecoded);

      const result = verifyJWT(mockToken);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret-key');
      expect(result).toEqual(mockDecoded);
    });

    it('should return null for invalid token', () => {
      const mockToken = 'invalid-token';

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyJWT(mockToken);

      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const mockToken = 'expired-token';

      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const result = verifyJWT(mockToken);

      expect(result).toBeNull();
    });

    it('should throw error if JWT_SECRET is not set', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      expect(() => verifyJWT('some-token')).toThrow('JWT_SECRET environment variable is not set');

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('authenticateRequest', () => {
    it('should authenticate request with valid Bearer token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        hashedPassword: 'hashed'
      };
      const mockDecoded = {
        userId: 'user-123',
        email: 'test@example.com'
      };

      const req = {
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      jwt.verify.mockReturnValue(mockDecoded);
      getUserById.mockResolvedValue(mockUser);

      const result = await authenticateRequest(req);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret-key');
      expect(getUserById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if Authorization header is missing', async () => {
      const req = {
        headers: {}
      };

      const result = await authenticateRequest(req);

      expect(result).toBeNull();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return null if Authorization header does not start with Bearer', async () => {
      const req = {
        headers: {
          authorization: 'Basic some-credentials'
        }
      };

      const result = await authenticateRequest(req);

      expect(result).toBeNull();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return null if token is invalid', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        }
      };

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await authenticateRequest(req);

      expect(result).toBeNull();
      expect(getUserById).not.toHaveBeenCalled();
    });

    it('should return null if user not found in storage', async () => {
      const mockDecoded = {
        userId: 'user-123',
        email: 'test@example.com'
      };

      const req = {
        headers: {
          authorization: 'Bearer valid-token'
        }
      };

      jwt.verify.mockReturnValue(mockDecoded);
      getUserById.mockResolvedValue(null);

      const result = await authenticateRequest(req);

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash a password using bcrypt', async () => {
      const password = 'mySecurePassword123';
      const hashedPassword = '$2a$10$hashedPasswordString';

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should use salt rounds of 10', async () => {
      const password = 'testPassword';
      bcrypt.hash.mockResolvedValue('hashed');

      await hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'myPassword123';
      const hashedPassword = '$2a$10$hashedPasswordString';

      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'wrongPassword';
      const hashedPassword = '$2a$10$hashedPasswordString';

      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword(password, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should complete full authentication flow', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        hashedPassword: '$2a$10$hashedPassword'
      };

      // Generate token
      jwt.sign.mockReturnValue('generated-token');
      const token = generateJWT(mockUser);

      // Verify token
      jwt.verify.mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com'
      });
      const decoded = verifyJWT(token);

      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@example.com');
    });

    it('should handle password hashing and comparison', async () => {
      const plainPassword = 'mySecurePassword';
      const hashedPassword = '$2a$10$hashedVersion';

      bcrypt.hash.mockResolvedValue(hashedPassword);
      const hashed = await hashPassword(plainPassword);

      bcrypt.compare.mockResolvedValue(true);
      const isValid = await comparePassword(plainPassword, hashed);

      expect(isValid).toBe(true);
    });
  });
});
