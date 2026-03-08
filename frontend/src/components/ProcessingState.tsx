import { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { analyzeContent, AnalyzeRequest } from '../services/apiService';

const steps = [
  { id: 1, label: 'Analyzing clarity and readability...', duration: 1000 },
  { id: 2, label: 'Checking tone and voice consistency...', duration: 1000 },
  { id: 3, label: 'Evaluating content structure...', duration: 1000 },
  { id: 4, label: 'Assessing accessibility...', duration: 1000 },
];

type ProcessingStateProps = {
  content: string;
  config: {
    targetPlatform: 'blog' | 'linkedin' | 'twitter' | 'medium';
    contentIntent: 'inform' | 'educate' | 'persuade';
  };
  onComplete: (results: any) => void;
  onError: (error: Error) => void;
};

export default function ProcessingState({ content, config, onComplete, onError }: ProcessingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Start the analysis immediately
    performAnalysis();
  }, []);

  useEffect(() => {
    // Animate through steps only if no error
    if (currentStep < steps.length - 1 && !hasError) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, steps[currentStep].duration);
      return () => clearTimeout(timer);
    }
  }, [currentStep, hasError]);

  const performAnalysis = async () => {
    try {
      const request: AnalyzeRequest = {
        content,
        targetPlatform: config.targetPlatform,
        contentIntent: config.contentIntent,
      };

      const result = await analyzeContent(request);
      
      // Show results immediately after API response
      onComplete(result);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setHasError(true);
      onError(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-[#2563EB] animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-2">
            AI Analysis in Progress
          </h2>
          <p className="text-sm text-gray-600 text-center mb-8">
            Our AI is carefully reviewing your content
          </p>

          {/* Progress Steps */}
          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 transition-opacity ${
                  index <= currentStep ? 'opacity-100' : 'opacity-30'
                }`}
              >
                {index < currentStep ? (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : index === currentStep ? (
                  <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                )}
                <span className={`text-sm ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Estimated Time */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Estimated time remaining</span>
              <span className="text-sm font-semibold text-[#2563EB]">
                {Math.max(0, (steps.length - currentStep - 1))} seconds
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#2563EB] transition-all duration-1000 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-xs text-center text-gray-500 mt-6">
          This usually takes a few seconds. Please don't close this window.
        </p>
      </div>
    </div>
  );
}
