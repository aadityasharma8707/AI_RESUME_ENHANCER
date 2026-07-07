import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

const loadingSteps = [
  "Reading your resume...",
  "Understanding job requirements...",
  "Searching for relevant evidence...",
  "Evaluating skill matches...",
  "Preparing your analysis..."
];

export default function LoadingState() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Simulate progression through steps for visual feedback
    // In a real WebSocket setup, this would be driven by backend events.
    // For now, we'll advance the step every 3-4 seconds.
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < loadingSteps.length - 1) {
          return prev + 1;
        }
        return prev; // Stay on the last step until the API returns
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-6">
      <div className="glass-panel p-10 max-w-lg w-full flex flex-col items-center space-y-8">
        
        {/* Loading Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-100 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-surface-bg p-4 rounded-2xl shadow-sm border border-border-subtle">
            <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-text-main">Analyzing Profile</h2>
          <p className="text-text-muted text-sm">Please wait while our AI evaluates your match.</p>
        </div>

        {/* Steps */}
        <div className="w-full space-y-4 mt-4">
          {loadingSteps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div 
                key={index} 
                className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 ${
                  isCurrent ? 'bg-brand-50 border border-brand-100' : 'border border-transparent'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-success-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-6 h-6 text-brand-500 animate-spin flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-border-input flex-shrink-0" />
                )}
                
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isCompleted ? 'text-text-main' : 
                  isCurrent ? 'text-brand-700' : 
                  'text-text-muted'
                }`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
