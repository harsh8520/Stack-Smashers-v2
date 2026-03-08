import { useState } from 'react';
import { 
  FileText, 
  History, 
  Settings, 
  Search, 
  Bell, 
  User,
  Zap,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

type DashboardProps = {
  onNavigate: (screen: 'landing' | 'login' | 'signup' | 'dashboard' | 'processing' | 'results' | 'history' | 'settings') => void;
  onStartAnalysis: (content: string, config: any) => void;
  initialContent?: string;
  onSignOut: () => void;
};

export default function Dashboard({ onNavigate, onStartAnalysis, initialContent = '', onSignOut }: DashboardProps) {
  const [content, setContent] = useState(initialContent);
  const [platform, setPlatform] = useState('Blog');
  const [intent, setIntent] = useState('Inform');
  const [activeNav, setActiveNav] = useState('review');
  const [error, setError] = useState('');

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleAnalyze = () => {
    setError('');
    
    if (content.trim().length === 0) {
      setError('Please enter some content to analyze.');
      return;
    }

    if (wordCount < 10) {
      setError('Content is too short. Please enter at least 10 words.');
      return;
    }

    try {
      // Map UI values to API format
      const platformMap: Record<string, 'blog' | 'linkedin' | 'twitter' | 'medium'> = {
        'Blog': 'blog',
        'LinkedIn': 'linkedin',
        'Twitter': 'twitter',
        'Medium': 'medium',
        'Academic Essay': 'blog', // Map to blog as fallback
      };

      const intentMap: Record<string, 'inform' | 'educate' | 'persuade'> = {
        'Inform': 'inform',
        'Educate': 'educate',
        'Persuade': 'persuade',
        'Entertain': 'inform', // Map to inform as fallback
        'Inspire': 'educate', // Map to educate as fallback
      };

      const mappedPlatform = platformMap[platform] || 'blog';
      const mappedIntent = intentMap[intent] || 'inform';

      onStartAnalysis(content, {
        targetPlatform: mappedPlatform,
        contentIntent: mappedIntent,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to start analysis. Please try again.');
    }
  };

  const navItems = [
    { id: 'review', icon: FileText, label: 'Review Content' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleNavClick = (id: string) => {
    setActiveNav(id);
    if (id === 'history') {
      onNavigate('history');
    } else if (id === 'settings') {
      onNavigate('settings');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">ContentLens AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeNav === item.id
                      ? 'bg-blue-50 text-[#2563EB]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Usage Card */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Free Plan</span>
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-xs text-gray-600 mb-2">2 of 5 reviews used</div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#2563EB] w-[40%]"></div>
            </div>
            <button className="text-xs text-[#2563EB] font-medium mt-3 hover:underline">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#E5E7EB] px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors" onClick={onSignOut}>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Review Content</h1>
            <p className="text-sm text-gray-600">Paste your content and get instant AI-powered feedback</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Editor */}
            <div className="col-span-2">
              <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden h-[600px] flex flex-col">
                <div className="border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Content Editor</span>
                  <span className="text-xs text-gray-500">{wordCount} words</span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste or type your content here...

Example: Start writing your blog post, LinkedIn update, or essay. Our AI will analyze it for clarity, tone, structure, and accessibility."
                  className="flex-1 p-4 resize-none focus:outline-none text-sm"
                />
                <div className="border-t border-[#E5E7EB] px-4 py-2 bg-gray-50">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span>Ready to analyze</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Configuration */}
            <div className="space-y-6">
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                <h3 className="font-semibold mb-4">Analysis Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
                    >
                      <option>Blog</option>
                      <option>LinkedIn</option>
                      <option>Twitter</option>
                      <option>Medium</option>
                      <option>Academic Essay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content Intent
                    </label>
                    <select
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
                    >
                      <option>Inform</option>
                      <option>Educate</option>
                      <option>Persuade</option>
                      <option>Entertain</option>
                      <option>Inspire</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={content.trim().length === 0}
                    className="w-full py-2.5 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Analyze Content
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                <h3 className="font-semibold mb-4">AI Will Evaluate</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Clarity & Readability</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Tone & Voice Consistency</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Content Structure</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Accessibility</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Engagement Potential</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Grammar & Style</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}