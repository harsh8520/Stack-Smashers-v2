import { Play, CheckCircle2, Zap, Target, FileText, BarChart3, Shield, Users, ArrowRight } from 'lucide-react';

type LandingPageProps = {
  onNavigate: (screen: 'landing' | 'login' | 'signup' | 'dashboard' | 'processing' | 'results' | 'history' | 'settings') => void;
};

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">ContentLens AI</span>
          </div>
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">How it Works</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <button 
              onClick={() => onNavigate('login')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Log In
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#1d4ed8] transition-colors"
            >
              Sign Up
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Review Your Content with Explainable AI Feedback
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get instant, actionable insights on clarity, tone, structure, and accessibility. 
            Perfect for student creators who want to publish with confidence.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate('signup')}
              className="px-6 py-3 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
            >
              Start Reviewing
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => alert('Demo video would open here')}
              className="px-6 py-3 border border-[#E5E7EB] bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          AI-Powered Content Analysis
        </h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h3 className="font-semibold mb-2">Clarity Analysis</h3>
            <p className="text-sm text-gray-600">
              Detect complex sentences, jargon, and unclear phrasing that might confuse readers.
            </p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Tone Detection</h3>
            <p className="text-sm text-gray-600">
              Ensure your content matches your intended voice—professional, casual, or persuasive.
            </p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Structure Review</h3>
            <p className="text-sm text-gray-600">
              Get feedback on flow, organization, and logical progression of your ideas.
            </p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2">Accessibility Check</h3>
            <p className="text-sm text-gray-600">
              Ensure your content is inclusive and accessible to diverse audiences.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2563EB] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              1
            </div>
            <h3 className="font-semibold mb-2">Paste Your Content</h3>
            <p className="text-sm text-gray-600">
              Copy your draft into our editor—blog posts, LinkedIn updates, or essays.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2563EB] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              2
            </div>
            <h3 className="font-semibold mb-2">Select Platform & Intent</h3>
            <p className="text-sm text-gray-600">
              Choose where you'll publish and what you want to achieve.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2563EB] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              3
            </div>
            <h3 className="font-semibold mb-2">AI Analyzes</h3>
            <p className="text-sm text-gray-600">
              Our AI reviews your content across multiple quality dimensions.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#2563EB] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              4
            </div>
            <h3 className="font-semibold mb-2">Get Actionable Feedback</h3>
            <p className="text-sm text-gray-600">
              Review detailed insights and improve before publishing.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Trusted by Student Creators
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div>
                <div className="font-semibold">Sarah Chen</div>
                <div className="text-sm text-gray-600">Tech Blogger</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              "ContentLens helped me identify unclear explanations in my tutorials. My engagement increased by 40% after implementing the feedback."
            </p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div>
                <div className="font-semibold">Marcus Johnson</div>
                <div className="text-sm text-gray-600">LinkedIn Creator</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              "The tone analysis is spot-on. I now know exactly how my posts will be perceived before hitting publish."
            </p>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div>
                <div className="font-semibold">Priya Patel</div>
                <div className="text-sm text-gray-600">Student Writer</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              "As a non-native English speaker, the accessibility feedback helps me create content that resonates with everyone."
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Simple, Transparent Pricing
        </h2>
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
            <h3 className="font-semibold text-lg mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>5 reviews per month</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Basic analysis</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Email support</span>
              </li>
            </ul>
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Get Started
            </button>
          </div>
          <div className="bg-white border-2 border-[#2563EB] rounded-lg p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-xs px-3 py-1 rounded-full">
              Popular
            </div>
            <h3 className="font-semibold text-lg mb-2">Pro</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">$12</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Unlimited reviews</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Advanced AI analysis</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Analytics dashboard</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Export reports</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
            >
              Get Started
            </button>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
            <h3 className="font-semibold text-lg mb-2">Team</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">$39</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Up to 5 team members</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Shared workspace</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Team analytics</span>
              </li>
            </ul>
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white mt-24">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold">ContentLens AI</span>
              </div>
              <p className="text-sm text-gray-600">
                Empowering student creators with AI-powered content feedback.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900">API</a></li>
                <li><a href="#" className="hover:text-gray-900">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Support</a></li>
                <li><a href="#" className="hover:text-gray-900">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#E5E7EB] text-sm text-gray-600 text-center">
            © 2026 ContentLens AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}