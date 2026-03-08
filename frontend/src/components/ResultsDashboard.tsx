import { 
  ArrowLeft, 
  Download, 
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Info,
  Edit3,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Hash,
  Heart,
  CheckCircle2,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { useState } from 'react';

type ResultsDashboardProps = {
  onNavigate: (screen: 'landing' | 'login' | 'signup' | 'dashboard' | 'processing' | 'results' | 'history' | 'settings') => void;
  content: string;
  onEditContent: () => void;
  onReviewAnother: () => void;
  results: any;
};

export default function ResultsDashboard({ onNavigate, content, onEditContent, onReviewAnother, results }: ResultsDashboardProps) {
  // State for expandable dimension cards
  const [expandedDimensions, setExpandedDimensions] = useState<Record<string, boolean>>({});
  // State for checklist items
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  // State for expandable checklist items
  const [expandedChecklistItems, setExpandedChecklistItems] = useState<Record<number, boolean>>({});

  const toggleDimension = (dimensionName: string) => {
    setExpandedDimensions(prev => ({
      ...prev,
      [dimensionName]: !prev[dimensionName]
    }));
  };

  const toggleChecklistItem = (priority: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  const toggleChecklistExpand = (priority: number) => {
    setExpandedChecklistItems(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  // Extract data from API response
  const overallScore = results?.overallScore || 0;
  const dimensionScores = results?.dimensionScores || {};
  const suggestions = results?.suggestions || [];
  const readability = results?.readability;
  const keywords = results?.keywords;
  const emotionalTone = results?.emotionalTone;
  const rewrites = results?.rewrites;
  const improvementChecklist = results?.improvementChecklist;
  
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
              onClick={onReviewAnother}
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

        {/* Detailed Explanations Section */}
        {dimensionScoresArray.some(d => d.details?.explanation) && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-semibold">Detailed Score Explanations</h3>
            </div>
            <div className="space-y-3">
              {dimensionScoresArray.map((dimension) => (
                dimension.details?.explanation && (
                  <div 
                    key={dimension.name}
                    className="border border-[#E5E7EB] rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleDimension(dimension.name)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${dimension.color}`}></div>
                        <span className="font-medium">{dimension.name}</span>
                        <span className={`text-lg font-bold ${getScoreColor(dimension.score)}`}>
                          {dimension.score}/100
                        </span>
                        {dimension.details?.confidence && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {Math.round(dimension.details.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      {expandedDimensions[dimension.name] ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedDimensions[dimension.name] && (
                      <div className="px-4 pb-4 pt-2 border-t border-[#E5E7EB] bg-gray-50">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {dimension.details.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Content Examples Section */}
        {(() => {
          // Collect all examples from all dimensions, limit to 3-4
          const allExamples = dimensionScoresArray
            .flatMap((dimension) => 
              (dimension.details?.examples || []).map(example => ({
                ...example,
                dimensionName: dimension.name,
                dimensionScore: dimension.score,
                dimensionColor: dimension.color
              }))
            )
            .slice(0, 4);

          return allExamples.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Content Examples</h3>
                <span className="text-xs text-gray-500">Specific sections that need attention</span>
              </div>
              <div className="space-y-4">
                {allExamples.map((example, index) => {
                  // Determine severity color based on dimension score
                  const getSeverityColor = (score: number) => {
                    if (score < 60) return {
                      bg: 'bg-red-50',
                      border: 'border-red-200',
                      text: 'text-red-700',
                      badge: 'bg-red-100 text-red-700 border-red-300'
                    };
                    if (score < 80) return {
                      bg: 'bg-orange-50',
                      border: 'border-orange-200',
                      text: 'text-orange-700',
                      badge: 'bg-orange-100 text-orange-700 border-orange-300'
                    };
                    return {
                      bg: 'bg-yellow-50',
                      border: 'border-yellow-200',
                      text: 'text-yellow-700',
                      badge: 'bg-yellow-100 text-yellow-700 border-yellow-300'
                    };
                  };

                  const colors = getSeverityColor(example.dimensionScore);

                  return (
                    <div 
                      key={index}
                      className={`border ${colors.border} ${colors.bg} rounded-lg p-4`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${colors.badge}`}>
                          {example.dimensionName}
                        </span>
                      </div>
                      
                      {/* Quoted content */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Original Text:</p>
                        <blockquote className={`border-l-4 ${colors.border} pl-3 py-2 ${colors.text} italic text-sm`}>
                          "{example.quote}"
                        </blockquote>
                      </div>

                      {/* Issue description */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Issue:</p>
                        <p className="text-sm text-gray-700">{example.issue}</p>
                      </div>

                      {/* Suggestion */}
                      <div className="bg-white border border-gray-200 rounded p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">💡 Suggestion:</p>
                        <p className="text-sm text-gray-700">{example.suggestion}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Before/After Rewrites Section */}
        {rewrites && rewrites.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Edit3 className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-semibold">Before/After Rewrites</h3>
              <span className="text-xs text-gray-500">Concrete examples to improve your content</span>
            </div>
            <div className="space-y-6">
              {rewrites.map((rewrite, index) => {
                const impactColors = {
                  high: 'bg-red-100 text-red-700 border-red-300',
                  medium: 'bg-orange-100 text-orange-700 border-orange-300',
                  low: 'bg-yellow-100 text-yellow-700 border-yellow-300'
                };

                return (
                  <div key={index} className="border border-[#E5E7EB] rounded-lg p-4">
                    {/* Impact Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded border ${impactColors[rewrite.impact]}`}>
                        {rewrite.impact.toUpperCase()} IMPACT
                      </span>
                    </div>

                    {/* Side-by-side comparison */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Original (Before) */}
                      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <p className="text-xs font-semibold text-red-700 uppercase">Before</p>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {rewrite.original}
                        </p>
                      </div>

                      {/* Improved (After) */}
                      <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="text-xs font-semibold text-green-700 uppercase">After</p>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {rewrite.improved}
                        </p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-blue-700 mb-1">💡 What Improved:</p>
                      <p className="text-sm text-gray-700">{rewrite.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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

        {/* Readability Metrics Card */}
        {readability && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-semibold">Readability Metrics</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Flesch-Kincaid Score with Gauge */}
              <div className="text-center">
                <div className="relative inline-block mb-3">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke={
                        readability.fleschKincaidScore >= 60 ? '#10B981' :
                        readability.fleschKincaidScore >= 30 ? '#F59E0B' : '#EF4444'
                      }
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - readability.fleschKincaidScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        readability.fleschKincaidScore >= 60 ? 'text-green-600' :
                        readability.fleschKincaidScore >= 30 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {Math.round(readability.fleschKincaidScore)}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Flesch-Kincaid Score</p>
                <p className="text-xs text-gray-500 mt-1">
                  {readability.fleschKincaidScore >= 60 ? 'Easy to read' :
                   readability.fleschKincaidScore >= 30 ? 'Moderate difficulty' : 'Difficult to read'}
                </p>
              </div>

              {/* Grade Level */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 mb-3 ${
                  readability.gradeLevel <= 12 ? 'border-green-200 bg-green-50' :
                  readability.gradeLevel <= 16 ? 'border-orange-200 bg-orange-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      readability.gradeLevel <= 12 ? 'text-green-600' :
                      readability.gradeLevel <= 16 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {readability.gradeLevel}
                    </div>
                    <div className="text-xs text-gray-500">Grade</div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Reading Level</p>
                <p className="text-xs text-gray-500 mt-1">
                  {readability.gradeLevel <= 12 ? 'General audience' :
                   readability.gradeLevel <= 16 ? 'College level' : 'Advanced'}
                </p>
              </div>

              {/* Reading Time */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-200 bg-blue-50 mb-3">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                    <div className="text-3xl font-bold text-blue-600">
                      {readability.readingTimeMinutes}
                    </div>
                    <div className="text-xs text-gray-500">min</div>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">Reading Time</p>
                <p className="text-xs text-gray-500 mt-1">Estimated duration</p>
              </div>
            </div>

            {/* Interpretation */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Interpretation:</strong> {readability.interpretation}
              </p>
            </div>
          </div>
        )}

        {/* Keyword Analysis Section */}
        {keywords && keywords.primary && keywords.primary.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-semibold">Keyword Analysis</h3>
              <span className="text-xs text-gray-500">SEO optimization insights</span>
            </div>

            {/* Keywords Table */}
            <div className="mb-4 overflow-hidden border border-[#E5E7EB] rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Keyword</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Frequency</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Density</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Visual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {keywords.primary.map((kw, index) => {
                    const isStuffing = kw.density > 3;
                    return (
                      <tr key={index} className={isStuffing ? 'bg-red-50' : ''}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {kw.keyword}
                          {isStuffing && (
                            <span className="ml-2 text-xs text-red-600 font-semibold">⚠️ STUFFING</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{kw.frequency}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{kw.density.toFixed(2)}%</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[120px]">
                              <div 
                                className={`h-full ${isStuffing ? 'bg-red-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(kw.density * 20, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Keyword Stuffing Warning */}
            {keywords.primary.some(kw => kw.density > 3) && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-1">Keyword Stuffing Detected</p>
                    <p className="text-sm text-red-600">
                      Some keywords have a density above 3%, which may be flagged as keyword stuffing by search engines. 
                      Consider using synonyms or reducing repetition.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Suggestions */}
            {keywords.suggestions && keywords.suggestions.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-700 mb-2">💡 SEO Suggestions:</p>
                <ul className="space-y-1">
                  {keywords.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Emotional Tone Card */}
        {emotionalTone && emotionalTone.primary && emotionalTone.primary.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-semibold">Emotional Tone Analysis</h3>
              <span className="text-xs text-gray-500">How your content resonates</span>
            </div>

            {/* Primary Emotions with Confidence Bars */}
            <div className="space-y-3 mb-4">
              {emotionalTone.primary.map((emotion, index) => {
                const confidence = emotionalTone.confidence[emotion] || 0;
                const emotionIcons: Record<string, string> = {
                  professional: '💼',
                  enthusiastic: '🎉',
                  empathetic: '🤝',
                  urgent: '⚡',
                  informative: '📚',
                  persuasive: '🎯',
                  friendly: '😊',
                  serious: '🎓',
                  casual: '👋'
                };
                const emotionColors: Record<string, string> = {
                  professional: 'bg-blue-500',
                  enthusiastic: 'bg-yellow-500',
                  empathetic: 'bg-green-500',
                  urgent: 'bg-red-500',
                  informative: 'bg-purple-500',
                  persuasive: 'bg-orange-500',
                  friendly: 'bg-pink-500',
                  serious: 'bg-gray-600',
                  casual: 'bg-teal-500'
                };

                return (
                  <div key={index} className="border border-[#E5E7EB] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{emotionIcons[emotion.toLowerCase()] || '💭'}</span>
                        <span className="font-medium text-gray-900 capitalize">{emotion}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {Math.round(confidence * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${emotionColors[emotion.toLowerCase()] || 'bg-gray-500'}`}
                        style={{ width: `${confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alignment Assessment */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-700 mb-1">Alignment Assessment:</p>
              <p className="text-sm text-gray-700">{emotionalTone.alignment}</p>
            </div>
          </div>
        )}

        {/* Enhanced Improvement Checklist */}
        {improvementChecklist && improvementChecklist.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
              <h3 className="font-semibold">Prioritized Improvement Checklist</h3>
              <span className="text-xs text-gray-500">Focus on high-impact changes first</span>
            </div>

            <div className="space-y-3">
              {improvementChecklist
                .sort((a, b) => a.priority - b.priority)
                .map((item, index) => {
                  const isTopPriority = item.priority <= 3;
                  const effortColors = {
                    low: 'bg-green-100 text-green-700 border-green-300',
                    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                    high: 'bg-red-100 text-red-700 border-red-300'
                  };

                  return (
                    <div 
                      key={index}
                      className={`border rounded-lg overflow-hidden ${
                        isTopPriority ? 'border-[#2563EB] bg-blue-50' : 'border-[#E5E7EB]'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleChecklistItem(item.priority)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              checkedItems[item.priority]
                                ? 'bg-[#2563EB] border-[#2563EB]'
                                : 'bg-white border-gray-300 hover:border-[#2563EB]'
                            }`}
                          >
                            {checkedItems[item.priority] && (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-bold ${
                                  isTopPriority ? 'text-[#2563EB]' : 'text-gray-700'
                                }`}>
                                  #{item.priority}
                                </span>
                                {isTopPriority && (
                                  <span className="text-xs font-semibold px-2 py-0.5 bg-[#2563EB] text-white rounded">
                                    TOP PRIORITY
                                  </span>
                                )}
                                <span className={`text-xs font-medium px-2 py-1 rounded border ${effortColors[item.effort]}`}>
                                  {item.effort.toUpperCase()} EFFORT
                                </span>
                              </div>
                              <button
                                onClick={() => toggleChecklistExpand(item.priority)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {expandedChecklistItems[item.priority] ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>

                            <p className={`text-sm font-medium mb-2 ${
                              checkedItems[item.priority] ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {item.action}
                            </p>

                            {/* Expandable Details */}
                            {expandedChecklistItems[item.priority] && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-start gap-2">
                                  <Target className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-gray-700 mb-1">Expected Impact:</p>
                                    <p className="text-sm text-gray-600">{item.impact}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Progress Summary */}
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Progress: {Object.values(checkedItems).filter(Boolean).length} of {improvementChecklist.length} completed
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2563EB]"
                      style={{ 
                        width: `${(Object.values(checkedItems).filter(Boolean).length / improvementChecklist.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    {Math.round((Object.values(checkedItems).filter(Boolean).length / improvementChecklist.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actionable Recommendations */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[#2563EB]" />
            <h3 className="font-semibold">Detailed Actionable Recommendations</h3>
            <span className="text-xs text-gray-500">AI-powered insights for improvement</span>
          </div>
          <div className="space-y-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-[#E5E7EB] rounded-lg overflow-hidden shadow-sm">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                          rec.priority === 'high' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : rec.priority === 'medium'
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        }`}>
                          {rec.priority === 'high' ? '🔴 HIGH PRIORITY' : rec.priority === 'medium' ? '🟡 MEDIUM' : '🟢 LOW'}
                        </span>
                        {rec.category && (
                          <span className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                            {rec.category.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-3">{rec.title}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">{rec.description}</p>
                      
                      {/* Reasoning Section */}
                      {rec.reasoning && (
                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                          <p className="text-xs font-semibold text-blue-900 mb-2">💡 Why This Matters:</p>
                          <p className="text-sm text-blue-800 leading-relaxed">{rec.reasoning}</p>
                        </div>
                      )}
                      
                      {/* Examples Section */}
                      {rec.examples && rec.examples.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">📝 Examples:</p>
                          {rec.examples.map((example, exIdx) => (
                            <div key={exIdx} className="p-4 bg-gray-50 border border-gray-200 rounded text-sm">
                              <p className="text-gray-700 italic leading-relaxed">{example}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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