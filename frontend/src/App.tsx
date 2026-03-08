import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated as checkAuth, signOut } from './services/authService';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import ProcessingState from './components/ProcessingState';
import ResultsDashboard from './components/ResultsDashboard';
import History from './components/History';
import Settings from './components/Settings';

type Screen = 'landing' | 'login' | 'signup' | 'dashboard' | 'processing' | 'results' | 'history' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [contentToAnalyze, setContentToAnalyze] = useState('');
  const [analysisConfig, setAnalysisConfig] = useState<{
    targetPlatform: 'blog' | 'linkedin' | 'twitter' | 'medium';
    contentIntent: 'inform' | 'educate' | 'persuade';
  }>({
    targetPlatform: 'blog',
    contentIntent: 'inform'
  });
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = checkAuth();
      setIsAuthenticated(isAuth);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const navigate = (screen: Screen) => {
    // Protect authenticated routes
    if (!isAuthenticated && ['dashboard', 'processing', 'results', 'history', 'settings'].includes(screen)) {
      setCurrentScreen('login');
      return;
    }
    setCurrentScreen(screen);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleSignOut = async () => {
    try {
      signOut();
      setIsAuthenticated(false);
      setCurrentScreen('landing');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const startAnalysis = (content: string, config: any) => {
    setContentToAnalyze(content);
    setAnalysisConfig(config);
    setCurrentScreen('processing');
    setAnalysisResults(null);
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
    setSelectedAnalysis(results);
    setCurrentScreen('results');
  };

  const handleViewAnalysis = (analysis: any) => {
    setSelectedAnalysis(analysis);
    setContentToAnalyze(analysis.content);
    setAnalysisResults(analysis);
    setCurrentScreen('results');
  };

  const handleAnalysisError = (error: Error) => {
    console.error('Analysis error:', error);
    alert(`Analysis failed: ${error.message}`);
    setCurrentScreen('dashboard');
  };

  const editContent = () => {
    // Go back to dashboard with the content pre-filled
    setCurrentScreen('dashboard');
  };

  const reviewAnother = () => {
    // Clear content and go back to dashboard
    setContentToAnalyze('');
    setAnalysisResults(null);
    setSelectedAnalysis(null);
    setCurrentScreen('dashboard');
  };

  const renderScreen = () => {
    if (isCheckingAuth) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    switch (currentScreen) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'login':
        return <Login onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      case 'signup':
        return <SignUp onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      case 'dashboard':
        return <Dashboard onNavigate={navigate} onStartAnalysis={startAnalysis} initialContent={contentToAnalyze} onSignOut={handleSignOut} />;
      case 'processing':
        return <ProcessingState content={contentToAnalyze} config={analysisConfig} onComplete={handleAnalysisComplete} onError={handleAnalysisError} />;
      case 'results':
        return <ResultsDashboard onNavigate={navigate} content={contentToAnalyze} onEditContent={editContent} onReviewAnother={reviewAnother} results={selectedAnalysis || analysisResults} />;
      case 'history':
        return <History onNavigate={navigate} onSignOut={handleSignOut} onViewAnalysis={handleViewAnalysis} />;
      case 'settings':
        return <Settings onNavigate={navigate} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderScreen()}
    </div>
  );
}