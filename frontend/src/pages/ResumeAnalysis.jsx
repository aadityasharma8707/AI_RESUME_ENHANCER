import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Briefcase,
  FolderDot
} from 'lucide-react';

export default function ResumeAnalysis() {
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

  const {
    target_job_title,
    target_skills,
    skill_matches = [],
    deep_analysis
  } = analysis;

  if (!deep_analysis) {
     return (
       <div className="min-h-[50vh] flex items-center justify-center text-text-muted">
         Deep analysis data not found.
       </div>
     );
  }

  const {
    overall_fit,
    overall_reasoning,
    experience_relevance,
    project_relevance,
    strengths,
    gaps,
    inferred_skills,
    missing_skills
  } = deep_analysis;

  const fitColors = {
    "Strong Fit": "bg-success-100 text-success-800 border-success-200",
    "Good Fit": "bg-brand-100 text-brand-800 border-brand-200",
    "Partial Fit": "bg-warning-100 text-warning-800 border-warning-200",
    "Weak Fit": "bg-error-100 text-error-800 border-error-200"
  };
  
  const fitColor = fitColors[overall_fit] || "bg-slate-100 text-slate-800";

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. TARGET SUMMARY & OVERALL FIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-brand-600 mb-2">
            <Target size={20} />
            <h2 className="font-bold text-sm uppercase tracking-wider">Target Profile</h2>
          </div>
          <h1 className="text-3xl font-extrabold text-text-main">{target_job_title || 'Unknown Title'}</h1>
          {target_skills && (
             <div className="text-sm text-text-muted mt-2">
               <span className="font-semibold text-text-main">User Provided Skills:</span> {target_skills}
             </div>
          )}
          {inferred_skills && inferred_skills.length > 0 && (
             <div className="text-sm text-text-muted mt-2">
               <span className="font-semibold text-text-main">AI Inferred Requirements:</span> {inferred_skills.join(", ")}
             </div>
          )}
        </div>

        <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm flex flex-col justify-center items-center text-center space-y-3 ${fitColor}`}>
          <div className="text-sm font-bold uppercase tracking-widest opacity-80">Overall Fit</div>
          <div className="text-3xl font-black">{overall_fit}</div>
          <p className="text-sm font-medium opacity-90 leading-relaxed">{overall_reasoning}</p>
        </div>
      </div>

      {/* 2. STRENGTHS AND GAPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-success-600 pb-2 border-b border-border-subtle">
            <TrendingUp size={20} />
            <h2 className="font-bold text-lg">Top Strengths</h2>
          </div>
          <ul className="space-y-3">
            {strengths.map((str, i) => (
              <li key={i} className="flex items-start space-x-3 text-sm text-text-body">
                <CheckCircle2 size={16} className="text-success-500 mt-0.5 flex-shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-error-600 pb-2 border-b border-border-subtle">
            <AlertTriangle size={20} />
            <h2 className="font-bold text-lg">Key Gaps</h2>
          </div>
          <ul className="space-y-3">
            {gaps.map((gap, i) => (
              <li key={i} className="flex items-start space-x-3 text-sm text-text-body">
                <XCircle size={16} className="text-error-500 mt-0.5 flex-shrink-0" />
                <span>{gap}</span>
              </li>
            ))}
            {missing_skills && missing_skills.length > 0 && (
              <li className="flex items-start space-x-3 text-sm text-text-body">
                <XCircle size={16} className="text-error-500 mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold">Missing Target Skills:</span> {missing_skills.join(", ")}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* 3. RELEVANCE BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-brand-600 pb-2 border-b border-border-subtle">
            <Briefcase size={20} />
            <h2 className="font-bold text-lg">Experience Relevance</h2>
          </div>
          <p className="text-sm text-text-body leading-relaxed">{experience_relevance}</p>
        </div>

        <div className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-brand-600 pb-2 border-b border-border-subtle">
            <FolderDot size={20} />
            <h2 className="font-bold text-lg">Project Relevance</h2>
          </div>
          <p className="text-sm text-text-body leading-relaxed">{project_relevance}</p>
        </div>
      </div>

      {/* 4. MATCHED SKILLS (EVIDENCE) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-text-main pb-2 border-b border-border-subtle">Skill Evidence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skill_matches.map((match, idx) => {
            if (match.status === 'No Evidence') return null; // We already show missing skills in gaps
            const isStrong = match.status === 'Strong Match';
            
            return (
              <div key={idx} className="bg-surface-bg rounded-xl p-5 border border-border-subtle shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-text-main">{match.skill}</h3>
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${isStrong ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'}`}>
                    {match.status}
                  </span>
                </div>
                {match.evidence && match.evidence !== 'none' && (
                  <p className="text-xs text-text-muted italic border-l-2 border-border-subtle pl-2">"{match.evidence}"</p>
                )}
                <p className="text-sm text-text-body">{match.reason}</p>
              </div>
            );
          })}
          {skill_matches.filter(m => m.status !== 'No Evidence').length === 0 && (
             <div className="col-span-1 md:col-span-2 p-6 text-center text-text-muted border border-dashed border-border-subtle rounded-xl">
               No strong or partial skill matches were found.
             </div>
          )}
        </div>
      </div>

    </div>
  );
}
