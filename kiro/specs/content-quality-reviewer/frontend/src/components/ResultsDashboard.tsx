import { 
  ArrowLeft, 
  Download, 
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Info,
  Edit3
} from 'lucide-react';

type ResultsDashboardProps = {
  onNavigate: (screen: 'landing' | 'login' | 'signup' | 'dashboard' | 'processing' | 'results' | 'history' | 'settings') => void;
  content: string;
  onEditContent: () => void;
  results: any;
};

export default function ResultsDashboard({ onNavigate, content, onEditContent, results }: ResultsDashboardProps) {
  // Extract data from API response
  const overallScore = results?.overallScore || 0;
  const dimensionScores = results?.dimensionScores || {};
  const suggestions = results?.suggestions || [];
  
  const dimensionScoresArray = [
    { 
      name: 'Structure', 
      score: dimensionScores.structure?.score || 0, 
      color: 'bg-blue-500',
      details: dimensionScores.structure
    },
    { 
      name: 'Tone', 
      score: dimensionScores.tone?.score || 0, 
      color: 'bg-purple-500',
      details: dimensionScores.tone
    },
    { 
      name: 'Accessibility', 
      score: dimensionScores.accessibility?.score || 0, 
      color: 'bg-orange-500',
      details: dimensionScores.accessibility
    },
    { 
      name: 'Platform Alignment', 
      score: dimensionScores.platformAlignment?.score || 0, 
      color: 'bg-green-500',
      details: dimensionScores.platformAlignment
    },
  ];

  // Extract strengths from all dimensions
  const strengths = Object.values(dimensionScores)
    .flatMap((dim: any) => dim?.strengths || [])
    .slice(0, 4);

  // Extract issues/improvements from all dimensions
  const improvements = Object.values(dimensionScores)
    .flatMap((dim: any) => dim?.issues || [])
    .map((issue: any) => issue.suggestion || issue.description)
    .slice(0, 4);

  // Map suggestions to recommendations format
  const recommendations = suggestions.slice(0, 3).map((sug: any) => ({
    title: sug.title,
    description: sug.description,
    priority: sug.priority,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={onEditContent}
              className="px-4 py-2 border border-[#E5E7EB] bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Content
            </button>
            <button 
              onClick={() => alert('Report would be exported as PDF')}
              className="px-4 py-2 border border-[#E5E7EB] bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              onClick={() => {
                onNavigate('dashboard');
              }}
              className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Review Another
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Analysis Results</h1>
          <p className="text-sm text-gray-600">Detailed AI-powered feedback on your content</p>
        </div>

        {/* Overall Score */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 mb-6">
          <div className="flex items-center gap-8">
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#2563EB"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - overallScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </div>
                  <div className="text-sm text-gray-500">/ 100</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Overall Quality Score</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your content is performing well! With a few improvements, you can reach excellent quality.
              </p>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${getScoreBgColor(overallScore)} border rounded-lg text-sm font-medium`}>
                <TrendingUp className="w-4 h-4" />
                Good Quality - Ready to publish with minor edits
              </div>
            </div>
          </div>
        </div>

        {/* Dimension Scores */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {dimensionScoresArray.map((dimension) => (
            <div key={dimension.name} className="bg-white border border-[#E5E7EB] rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">{dimension.name}</span>
                <span className={`text-2xl font-bold ${getScoreColor(dimension.score)}`}>
                  {dimension.score}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${dimension.color}`}
                  style={{ width: `${dimension.score}%` }}
                ></div>
              </div>
              {dimension.details?.confidence && (
                <p className="text-xs text-gray-500 mt-2">
                  Confidence: {Math.round(dimension.details.confidence * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-semibold">Actionable Recommendations</h3>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-[#E5E7EB] rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{rec.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'high' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    {rec.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Explainable Reasoning */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-semibold">Why This Score?</h3>
          </div>
          <div className="space-y-4 text-sm text-gray-600">
            {dimensionScoresArray.map((dimension) => (
              dimension.details && (
                <div key={dimension.name}>
                  <p>
                    <strong className="text-gray-900">{dimension.name} ({dimension.score}/100):</strong>{' '}
                    {dimension.details.issues?.length > 0 
                      ? dimension.details.issues[0].reasoning 
                      : dimension.details.strengths?.[0] || 'Analysis complete.'}
                  </p>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}