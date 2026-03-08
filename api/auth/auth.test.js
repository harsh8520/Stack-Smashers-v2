const signup = require('./signup');
const login = require('./login');

// Mock the dependencies
jest.mock('../../lib/storage', () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn()
}));

jest.mock('../../lib/auth', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateJWT: jest.fn()
}));

const { getUserByEmail, createUser } = require('../../backend/lib/storage');
const { hashPassword, comparePassword, generateJWT } = require('../../backend/lib/auth');

describe('Auth Endpoints', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock request
    mockReq = {
      method: 'POST',
      body: {},
      headers: {}
    };

    // Setup mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };

    // Setup default mock implementations
    hashPassword.mockResolvedValue('hashed_password');
    comparePassword.mockResolvedValue(true);
    generateJWT.mockReturnValue('mock_jwt_token');
  });

  describe('POST /api/auth/signup', () => {
    it('should successfully create a new user', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      getUserByEmail.mockResolvedValue(null);
      createUser.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        hashedPassword: 'hashed_password',
        createdAt: '2024-01-01T00:00:00.000Z'
      });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        token: 'mock_jwt_token',
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      });
    });

    it('should return 400 if email is missing', async () => {
      mockReq.body = {
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email and password required'
      });
    });

    it('should return 400 if password is missing', async () => {
      mockReq.body = {
        email: 'test@example.com'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email and password required'
      });
    });

    it('should return 400 if email format is invalid', async () => {
      mockReq.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid email format'
      });
    });

    it('should return 400 if password is too short', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: '12345'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Password must be at least 6 characters'
      });
    });

    it('should return 409 if user already exists', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      getUserByEmail.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com'
      });

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User already exists'
      });
    });

    it('should return 405 for non-POST requests', async () => {
      mockReq.method = 'GET';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      });
    });

    it('should handle OPTIONS request for CORS', async () => {
      mockReq.method = 'OPTIONS';

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should return 500 on server error', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      getUserByEmail.mockRejectedValue(new Error('Database error'));

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Signup failed'
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      getUserByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        hashedPassword: 'hashed_password'
      });

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        token: 'mock_jwt_token',
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      });
    });

    it('should return 400 if email is missing', async () => {
      mockReq.body = {
        password: 'password123'
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email and password required'
      });
    });

    it('should return 400 if password is missing', async () => {
      mockReq.body = {
        email: 'test@example.com'
      };

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Email and password required'
      });
    });

    it('should return 401 if user does not exist', async () => {
      mockReq.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      getUserByEmail.mockResolvedValue(null);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });

    it('should return 401 if password is incorrect', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      getUserByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        hashedPassword: 'hashed_password'
      });

      comparePassword.mockResolvedValue(false);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });

    it('should return 405 for non-POST requests', async () => {
      mockReq.method = 'GET';

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      });
    });

    it('should handle OPTIONS request for CORS', async () => {
      mockReq.method = 'OPTIONS';

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('should return 500 on server error', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      getUserByEmail.mockRejectedValue(new Error('Database error'));

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Login failed'
      });
    });
  });
});
