import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileCheck,
  CheckSquare
} from 'lucide-react';

export default function AtsScore() {
  const navigate = useNavigate();
  const location = useLocation();

  const analysis = location.state?.result;

  if (!analysis) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 p-6">
        <div className="p-4 bg-error-50 text-error-700 rounded-xl">No analysis result found. Please upload a resume first.</div>
        <button onClick={() => navigate('/')} className="text-brand-600 hover:underline font-medium">
          Return to Upload
        </button>
      </div>
    );
  }

  const { ats_score } = analysis;

  if (!ats_score) {
     return (
       <div className="min-h-[50vh] flex items-center justify-center text-text-muted">
         ATS Score data not available.
       </div>
     );
  }

  const {
    overall_score,
    score_band,
    categories,
    recommendations,
    ats_engine_version
  } = ats_score;

  // Visual helper for circular ring
  const strokeDasharray = 283; // 2 * pi * r (where r=45)
  const strokeDashoffset = strokeDasharray - (strokeDasharray * overall_score) / 100;

  const bandColors = {
    "Excellent": "text-success-600",
    "Strong": "text-brand-600",
    "Needs Improvement": "text-warning-600",
    "High Risk": "text-error-600"
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Passed": return <CheckCircle2 size={18} className="text-success-500 mt-0.5 flex-shrink-0" />;
      case "Warning": return <AlertTriangle size={18} className="text-warning-500 mt-0.5 flex-shrink-0" />;
      case "Failed": return <XCircle size={18} className="text-error-500 mt-0.5 flex-shrink-0" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main flex items-center gap-3">
            <CheckSquare className="text-brand-600" size={32} />
            ATS Readiness
          </h1>
          <p className="text-text-muted mt-2">
            Deterministic technical evaluation of your resume's machine-readability. Engine Version {ats_engine_version}.
          </p>
        </div>
      </div>

      {/* OVERALL SCORE & RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radial Score Card */}
        <div className="glass-panel p-8 rounded-2xl border border-border-subtle shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative flex items-center justify-center w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" fill="none" strokeWidth="8" 
                className="stroke-border-subtle" 
              />
              <circle 
                cx="50" cy="50" r="45" fill="none" strokeWidth="8" 
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${
                  overall_score >= 90 ? 'stroke-success-500' :
                  overall_score >= 75 ? 'stroke-brand-500' :
                  overall_score >= 60 ? 'stroke-warning-500' : 'stroke-error-500'
                }`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-text-main">{overall_score}</span>
              <span className="text-xs text-text-muted font-bold tracking-widest uppercase mt-1">/ 100</span>
            </div>
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${bandColors[score_band] || 'text-text-main'}`}>
              {score_band}
            </h2>
            <p className="text-sm text-text-muted mt-1 font-medium">Readability Tier</p>
          </div>
        </div>

        {/* ATS Fixes Card */}
        <div className="lg:col-span-2 bg-surface-bg p-8 rounded-2xl border border-border-subtle shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 pb-4 border-b border-border-subtle mb-4">
            <FileCheck size={20} className="text-brand-600" />
            <h2 className="text-lg font-bold">Required ATS Fixes</h2>
          </div>
          
          {recommendations.length > 0 ? (
            <ul className="space-y-4 flex-grow">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 bg-error-50/50 p-4 rounded-xl border border-error-100">
                  <AlertTriangle size={18} className="text-error-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-body leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-success-50/50 rounded-xl border border-success-100">
              <CheckCircle2 size={32} className="text-success-500 mb-3" />
              <h3 className="font-bold text-success-700">Perfect Mechanics</h3>
              <p className="text-sm text-success-600 mt-1">Your resume passes all deterministic ATS formatting checks.</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED CATEGORY BREAKDOWN */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-text-main pb-2 border-b border-border-subtle">Detailed Extraction Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(categories).map(([catName, catData]) => (
            <div key={catName} className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                <h3 className="font-bold text-text-main">{catName}</h3>
                <span className="text-sm font-bold bg-brand-50 text-brand-700 px-3 py-1 rounded-lg">
                  {catData.score} pts
                </span>
              </div>
              <ul className="space-y-4 flex-grow">
                {catData.checks.map((check, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-text-main">{check.name}</div>
                      <div className="text-xs text-text-body">{check.message}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
