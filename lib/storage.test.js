// Mock MongoDB client before importing storage
const mockFindOne = jest.fn();
const mockInsertOne = jest.fn();
const mockCreateIndex = jest.fn();
const mockFind = jest.fn();
const mockSort = jest.fn();
const mockLimit = jest.fn();
const mockToArray = jest.fn();
const mockCountDocuments = jest.fn();

const mockCollection = jest.fn((name) => ({
  findOne: mockFindOne,
  insertOne: mockInsertOne,
  createIndex: mockCreateIndex,
  find: mockFind,
  countDocuments: mockCountDocuments
}));

const mockDb = jest.fn(() => ({
  collection: mockCollection
}));
const mockConnect = jest.fn();
const mockClient = {
  connect: mockConnect,
  db: mockDb
};

jest.mock('mongodb', () => ({
  MongoClient: jest.fn(() => mockClient)
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234')
}));

// Set environment variable
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

const { getUserByEmail, createUser, getUserById, getAnalysisById, getUserHistory } = require('./storage');

describe('Storage Module - User Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        hashedPassword: 'hashed-password',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockFindOne.mockResolvedValue(mockUser);

      const result = await getUserByEmail('test@example.com');

      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockFindOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await getUserByEmail('nonexistent@example.com');

      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockFindOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(result).toBeNull();
    });

    it('should query the correct collection', async () => {
      mockFindOne.mockResolvedValue(null);

      await getUserByEmail('test@example.com');

      expect(mockCollection).toHaveBeenCalledWith('users');
    });
  });

  describe('createUser', () => {
    it('should create user with all required fields', async () => {
      const userData = {
        email: 'newuser@example.com',
        hashedPassword: 'hashed-password-123'
      };

      mockInsertOne.mockResolvedValue({ acknowledged: true });

      const result = await createUser(userData);

      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockInsertOne).toHaveBeenCalledWith({
        id: 'test-uuid-1234',
        email: 'newuser@example.com',
        hashedPassword: 'hashed-password-123',
        createdAt: expect.any(String)
      });
      expect(result).toEqual({
        id: 'test-uuid-1234',
        email: 'newuser@example.com',
        hashedPassword: 'hashed-password-123',
        createdAt: expect.any(String)
      });
    });
  });

  describe('getUserById', () => {
    it('should return user when found by id', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        hashedPassword: 'hashed-password',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      mockFindOne.mockResolvedValue(mockUser);

      const result = await getUserById('user-123');

      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockFindOne).toHaveBeenCalledWith({ id: 'user-123' });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await getUserById('nonexistent-id');

      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockFindOne).toHaveBeenCalledWith({ id: 'nonexistent-id' });
      expect(result).toBeNull();
    });

    it('should query the correct collection', async () => {
      mockFindOne.mockResolvedValue(null);

      await getUserById('user-123');

      expect(mockCollection).toHaveBeenCalledWith('users');
    });
  });
});

describe('Storage Module - Analysis Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeAnalysisResult', () => {
    it('should store analysis with all required fields', async () => {
      const { storeAnalysisResult } = require('./storage');
      
      const analysisData = {
        userId: 'user-123',
        content: 'Test content for analysis',
        targetPlatform: 'twitter',
        contentIntent: 'informative',
        overallScore: 85,
        dimensionScores: { clarity: 90, engagement: 80, professionalism: 85 },
        suggestions: ['Great job!', 'Consider adding more details'],
        metadata: { source: 'test' }
      };

      mockInsertOne.mockResolvedValue({ acknowledged: true });

      const result = await storeAnalysisResult(analysisData);

      expect(mockCollection).toHaveBeenCalledWith('analyses');
      expect(mockInsertOne).toHaveBeenCalledWith({
        analysisId: 'test-uuid-1234',
        userId: 'user-123',
        timestamp: expect.any(String),
        createdAt: expect.any(Date),
        content: 'Test content for analysis',
        targetPlatform: 'twitter',
        contentIntent: 'informative',
        overallScore: 85,
        dimensionScores: { clarity: 90, engagement: 80, professionalism: 85 },
        suggestions: ['Great job!', 'Consider adding more details'],
        metadata: { source: 'test' }
      });
      
      expect(result).toEqual({
        analysisId: 'test-uuid-1234',
        userId: 'user-123',
        timestamp: expect.any(String),
        content: 'Test content for analysis',
        targetPlatform: 'twitter',
        contentIntent: 'informative',
        overallScore: 85,
        dimensionScores: { clarity: 90, engagement: 80, professionalism: 85 },
        suggestions: ['Great job!', 'Consider adding more details'],
        metadata: { source: 'test' }
      });
      
      // Verify createdAt Date object is not included in result
      expect(result.createdAt).toBeUndefined();
    });

    it('should generate unique analysisId', async () => {
      const { storeAnalysisResult } = require('./storage');
      
      const analysisData = {
        userId: 'user-123',
        content: 'Test content',
        targetPlatform: 'linkedin',
        contentIntent: 'promotional',
        overallScore: 75,
        dimensionScores: { clarity: 80, engagement: 70 },
        suggestions: [],
        metadata: {}
      };

      mockInsertOne.mockResolvedValue({ acknowledged: true });

      const result = await storeAnalysisResult(analysisData);

      expect(result.analysisId).toBe('test-uuid-1234');
    });

    it('should include both timestamp (ISO string) and createdAt (Date) in stored document', async () => {
      const { storeAnalysisResult } = require('./storage');
      
      const analysisData = {
        userId: 'user-123',
        content: 'Test content',
        targetPlatform: 'twitter',
        contentIntent: 'informative',
        overallScore: 85,
        dimensionScores: { clarity: 90 },
        suggestions: [],
        metadata: {}
      };

      mockInsertOne.mockResolvedValue({ acknowledged: true });

      await storeAnalysisResult(analysisData);

      const insertedDoc = mockInsertOne.mock.calls[0][0];
      
      // Verify timestamp is ISO string
      expect(typeof insertedDoc.timestamp).toBe('string');
      expect(insertedDoc.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Verify createdAt is Date object
      expect(insertedDoc.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getAnalysisById', () => {
    it('should return analysis when found and userId matches', async () => {
      const mockAnalysis = {
        analysisId: 'analysis-123',
        userId: 'user-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        content: 'Test content',
        targetPlatform: 'twitter',
        contentIntent: 'informative',
        overallScore: 85,
        dimensionScores: { clarity: 90, engagement: 80 },
        suggestions: ['Great job!'],
        metadata: {}
      };

      mockFindOne.mockResolvedValue(mockAnalysis);

      const result = await getAnalysisById('analysis-123', 'user-123');

      expect(mockCollection).toHaveBeenCalledWith('analyses');
      expect(mockFindOne).toHaveBeenCalledWith({ analysisId: 'analysis-123' });
      expect(result).toEqual({
        analysisId: 'analysis-123',
        userId: 'user-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        content: 'Test content',
        targetPlatform: 'twitter',
        contentIntent: 'informative',
        overallScore: 85,
        dimensionScores: { clarity: 90, engagement: 80 },
        suggestions: ['Great job!'],
        metadata: {}
      });
      // Verify createdAt Date object is not included in result
      expect(result.createdAt).toBeUndefined();
    });

    it('should return null when analysis not found', async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await getAnalysisById('nonexistent-id', 'user-123');

      expect(mockCollection).toHaveBeenCalledWith('analyses');
      expect(mockFindOne).toHaveBeenCalledWith({ analysisId: 'nonexistent-id' });
      expect(result).toBeNull();
    });

    it('should return null when userId does not match', async () => {
      const mockAnalysis = {
        analysisId: 'analysis-123',
        userId: 'user-123',
        timestamp: '2024-01-01T00:00:00.000Z',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        content: 'Test content',
        targetPlatform: 'twitter',
        contentIntent: 'informative',
        overallScore: 85,
        dimensionScores: { clarity: 90, engagement: 80 },
        suggestions: ['Great job!'],
        metadata: {}
      };

      mockFindOne.mockResolvedValue(mockAnalysis);

      const result = await getAnalysisById('analysis-123', 'different-user');

      expect(mockCollection).toHaveBeenCalledWith('analyses');
      expect(mockFindOne).toHaveBeenCalledWith({ analysisId: 'analysis-123' });
      expect(result).toBeNull();
    });

    it('should query the correct collection', async () => {
      mockFindOne.mockResolvedValue(null);

      await getAnalysisById('analysis-123', 'user-123');

      expect(mockCollection).toHaveBeenCalledWith('analyses');
    });

    it('should verify ownership before returning analysis', async () => {
      const mockAnalysis = {
        analysisId: 'analysis-123',
        userId: 'owner-user',
        timestamp: '2024-01-01T00:00:00.000Z',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        content: 'Test content',
        targetPlatform: 'twitter',
        contentIntent: 'informative',
        overallScore: 85,
        dimensionScores: { clarity: 90, engagement: 80 },
        suggestions: ['Great job!'],
        metadata: {}
      };

      mockFindOne.mockResolvedValue(mockAnalysis);

      // Should return analysis for owner
      const resultOwner = await getAnalysisById('analysis-123', 'owner-user');
      expect(resultOwner).not.toBeNull();
      expect(resultOwner.userId).toBe('owner-user');

      // Should return null for non-owner
      const resultNonOwner = await getAnalysisById('analysis-123', 'other-user');
      expect(resultNonOwner).toBeNull();
    });
  });
});


describe('Storage Module - User History Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock chain for find().sort().limit().toArray()
    mockToArray.mockResolvedValue([]);
    mockLimit.mockReturnValue({ toArray: mockToArray });
    mockSort.mockReturnValue({ limit: mockLimit });
    mockFind.mockReturnValue({ sort: mockSort, limit: mockLimit });
    mockCountDocuments.mockResolvedValue(0);
  });

  describe('getUserHistory', () => {
    it('should return user history with default limit of 10', async () => {
      const mockAnalyses = [
        {
          analysisId: 'analysis-1',
          userId: 'user-123',
          timestamp: '2024-01-03T00:00:00.000Z',
          createdAt: new Date('2024-01-03T00:00:00.000Z'),
          content: 'Content 1',
          targetPlatform: 'twitter',
          contentIntent: 'informative',
          overallScore: 85,
          dimensionScores: { clarity: 90 },
          suggestions: [],
          metadata: {}
        },
        {
          analysisId: 'analysis-2',
          userId: 'user-123',
          timestamp: '2024-01-02T00:00:00.000Z',
          createdAt: new Date('2024-01-02T00:00:00.000Z'),
          content: 'Content 2',
          targetPlatform: 'linkedin',
          contentIntent: 'promotional',
          overallScore: 75,
          dimensionScores: { clarity: 80 },
          suggestions: [],
          metadata: {}
        }
      ];

      mockToArray.mockResolvedValue(mockAnalyses);
      mockCountDocuments.mockResolvedValue(2);

      const result = await getUserHistory('user-123');

      expect(mockCollection).toHaveBeenCalledWith('analyses');
      expect(mockFind).toHaveBeenCalledWith({ userId: 'user-123' });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockCountDocuments).toHaveBeenCalledWith({ userId: 'user-123' });
      
      expect(result).toEqual({
        analyses: [
          {
            analysisId: 'analysis-1',
            userId: 'user-123',
            timestamp: '2024-01-03T00:00:00.000Z',
            content: 'Content 1',
            targetPlatform: 'twitter',
            contentIntent: 'informative',
            overallScore: 85,
            dimensionScores: { clarity: 90 },
            suggestions: [],
            metadata: {}
          },
          {
            analysisId: 'analysis-2',
            userId: 'user-123',
            timestamp: '2024-01-02T00:00:00.000Z',
            content: 'Content 2',
            targetPlatform: 'linkedin',
            contentIntent: 'promotional',
            overallScore: 75,
            dimensionScores: { clarity: 80 },
            suggestions: [],
            metadata: {}
          }
        ],
        total: 2,
        hasMore: false
      });
      
      // Verify createdAt Date objects are not included in results
      expect(result.analyses[0].createdAt).toBeUndefined();
      expect(result.analyses[1].createdAt).toBeUndefined();
    });

    it('should respect custom limit parameter', async () => {
      const mockAnalyses = [
        {
          analysisId: 'analysis-1',
          userId: 'user-123',
          timestamp: '2024-01-03T00:00:00.000Z',
          createdAt: new Date('2024-01-03T00:00:00.000Z'),
          content: 'Content 1',
          targetPlatform: 'twitter',
          contentIntent: 'informative',
          overallScore: 85,
          dimensionScores: { clarity: 90 },
          suggestions: [],
          metadata: {}
        }
      ];

      mockToArray.mockResolvedValue(mockAnalyses);
      mockCountDocuments.mockResolvedValue(5);

      const result = await getUserHistory('user-123', 1);

      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result.analyses).toHaveLength(1);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
    });

    it('should set hasMore to true when total exceeds limit', async () => {
      mockToArray.mockResolvedValue([]);
      mockCountDocuments.mockResolvedValue(15);

      const result = await getUserHistory('user-123', 10);

      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(15);
    });

    it('should set hasMore to false when total does not exceed limit', async () => {
      mockToArray.mockResolvedValue([]);
      mockCountDocuments.mockResolvedValue(5);

      const result = await getUserHistory('user-123', 10);

      expect(result.hasMore).toBe(false);
      expect(result.total).toBe(5);
    });

    it('should return empty array when user has no analyses', async () => {
      mockToArray.mockResolvedValue([]);
      mockCountDocuments.mockResolvedValue(0);

      const result = await getUserHistory('user-123');

      expect(result).toEqual({
        analyses: [],
        total: 0,
        hasMore: false
      });
    });

    it('should sort analyses by createdAt descending', async () => {
      mockToArray.mockResolvedValue([]);
      mockCountDocuments.mockResolvedValue(0);

      await getUserHistory('user-123');

      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should filter analyses by userId', async () => {
      mockToArray.mockResolvedValue([]);
      mockCountDocuments.mockResolvedValue(0);

      await getUserHistory('user-456');

      expect(mockFind).toHaveBeenCalledWith({ userId: 'user-456' });
      expect(mockCountDocuments).toHaveBeenCalledWith({ userId: 'user-456' });
    });

    it('should return correct response structure', async () => {
      mockToArray.mockResolvedValue([]);
      mockCountDocuments.mockResolvedValue(0);

      const result = await getUserHistory('user-123');

      expect(result).toHaveProperty('analyses');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.analyses)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.hasMore).toBe('boolean');
    });
  });
});
