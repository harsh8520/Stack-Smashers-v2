import { getAuthHeader, getCurrentUser, signOut as authSignOut } from './authService';

export interface AnalyzeRequest {
  content: string;
  targetPlatform: 'blog' | 'linkedin' | 'twitter' | 'medium';
  contentIntent: 'inform' | 'educate' | 'persuade';
}

export interface QualityScore {
  score: number;
  confidence: number;
  issues: Issue[];
  strengths: string[];
}

export interface Issue {
  type: 'critical' | 'important' | 'minor';
  category: 'structure' | 'tone' | 'accessibility' | 'platform';
  description: string;
  suggestion: string;
  reasoning: string;
}

export interface Suggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  reasoning: string;
  examples?: string[];
}

export interface DimensionScores {
  structure: QualityScore;
  tone: QualityScore;
  accessibility: QualityScore;
  platformAlignment: QualityScore;
}

export interface AnalysisResult {
  analysisId: string;
  userId?: string;
  timestamp: string;
  content: string;
  targetPlatform: 'blog' | 'linkedin' | 'twitter' | 'medium';
  contentIntent: 'inform' | 'educate' | 'persuade';
  overallScore: number;
  dimensionScores: DimensionScores;
  suggestions: Suggestion[];
  metadata: {
    processingTime: number;
    contentLength: number;
    platformOptimized: boolean;
  };
}

export interface HistoryResult {
  analyses: AnalysisResult[];
  total: number;
  hasMore: boolean;
  lastEvaluatedKey?: Record<string, any>;
}

/**
 * Analyzes content using the backend API
 */
export async function analyzeContent(request: AnalyzeRequest): Promise<AnalysisResult> {
  try {
    const authHeaders = getAuthHeader();
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
    
    console.log('Making analyze request to:', `${apiEndpoint}/api/analyze`);
    console.log('Request payload:', request);

    const response = await fetch(`${apiEndpoint}/api/analyze`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Analysis response:', result);
    return result as AnalysisResult;
  } catch (error: any) {
    console.error('Analysis error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
    });
    
    throw new Error(error.message || 'Failed to analyze content. Please try again.');
  }
}

/**
 * Retrieves a specific analysis by ID
 */
export async function getAnalysisById(analysisId: string): Promise<AnalysisResult> {
  try {
    const authHeaders = getAuthHeader();
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
    
    const response = await fetch(`${apiEndpoint}/api/analysis/${analysisId}`, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result as AnalysisResult;
  } catch (error: any) {
    console.log('Fetch analysis error:', error);
    throw new Error('Failed to fetch analysis. Please try again.');
  }
}

/**
 * Retrieves user's analysis history
 */
export async function getUserHistory(limit: number = 10): Promise<HistoryResult> {
  try {
    const authHeaders = getAuthHeader();
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
    
    const response = await fetch(`${apiEndpoint}/api/history?limit=${limit}`, {
      method: 'GET',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result as HistoryResult;
  } catch (error: any) {
    console.error('History fetch error:', error);
    throw new Error('Failed to fetch history. Please try again.');
  }
}

/**
 * Gets the current authenticated user
 */
export { getCurrentUser };

/**
 * Signs out the current user
 */
export async function signOut() {
  try {
    authSignOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}
