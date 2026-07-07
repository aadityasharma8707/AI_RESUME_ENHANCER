import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Lightbulb, 
  Wand2, 
  AlertTriangle, 
  Target, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';

export default function AiSuggestions() {
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

  const { ai_suggestions } = analysis;

  if (!ai_suggestions) {
     return (
       <div className="min-h-[50vh] flex flex-col items-center justify-center text-text-muted space-y-4">
         <AlertTriangle size={32} className="text-warning-500" />
         <p>AI Suggestions are currently unavailable or failed to generate.</p>
       </div>
     );
  }

  const { resume_improvements, skill_improvements } = ai_suggestions;

  const [expandedResumeIds, setExpandedResumeIds] = useState({});

  const toggleResumeExpand = (idx) => {
    setExpandedResumeIds(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const priorityColors = {
    "High": "bg-error-50 text-error-700 border-error-200",
    "Medium": "bg-warning-50 text-warning-700 border-warning-200",
    "Low": "bg-success-50 text-success-700 border-success-200"
  };

  const gapTypeColors = {
    "Target Skill Gap": "text-error-600",
    "Role-relevant Opportunity": "text-brand-600",
    "Evidence Gap": "text-warning-600"
  };

  const hasSuggestions = resume_improvements.length > 0 || skill_improvements.length > 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      <div className="flex items-center justify-between border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-main flex items-center gap-3">
            <Wand2 className="text-brand-600" size={32} />
            AI Action Plan
          </h1>
          <p className="text-text-muted mt-2">
            Targeted, evidence-based recommendations to improve your resume and skills.
          </p>
        </div>
      </div>

      {!hasSuggestions && (
        <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 size={48} className="text-success-500" />
          <h2 className="text-2xl font-bold text-text-main">No Major Improvements Needed</h2>
          <p className="text-text-muted max-w-md">Your resume is highly optimized for this target role and we could not find any high-value suggestions to add.</p>
        </div>
      )}

      {hasSuggestions && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section A: Resume Improvements */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-text-main">
              <Lightbulb size={24} className="text-warning-500" />
              <h2 className="text-2xl font-bold">Resume Rewrites</h2>
            </div>
            <p className="text-sm text-text-muted">Suggestions to clarify ownership, strengthen phrasing, and remove vagueness based strictly on your existing facts.</p>
            
            <div className="space-y-4">
              {resume_improvements.map((imp, idx) => (
                <div key={idx} className="bg-surface-bg border border-border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Header row */}
                  <div 
                    className="p-5 flex items-start justify-between cursor-pointer bg-app-bg/50 hover:bg-app-bg transition-colors"
                    onClick={() => toggleResumeExpand(idx)}
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-md font-bold border ${priorityColors[imp.priority] || 'bg-slate-50 text-slate-700'}`}>
                          {imp.priority} Priority
                        </span>
                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{imp.issue_type}</span>
                      </div>
                      <h3 className="font-bold text-text-main leading-snug">{imp.reason}</h3>
                      <p className="text-xs text-text-muted">Location: {imp.location}</p>
                    </div>
                    {expandedResumeIds[idx] ? <ChevronUp size={20} className="text-text-muted flex-shrink-0" /> : <ChevronDown size={20} className="text-text-muted flex-shrink-0" />}
                  </div>

                  {/* Expandable content */}
                  {expandedResumeIds[idx] && (
                    <div className="p-5 border-t border-border-subtle bg-surface-bg space-y-4">
                      
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Original Text</div>
                        <div className="p-3 bg-error-50 text-error-900 border border-error-100 rounded-xl text-sm italic relative">
                          "{imp.original_text}"
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <ArrowRight size={20} className="text-border-strong" />
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-brand-600 uppercase tracking-wider">Suggested Rewrite</div>
                        <div className="p-3 bg-success-50 text-success-900 border border-success-100 rounded-xl text-sm font-medium">
                          {imp.suggested_text}
                        </div>
                      </div>
                      
                    </div>
                  )}

                </div>
              ))}
              
              {resume_improvements.length === 0 && (
                <div className="p-6 text-center border border-dashed border-border-subtle rounded-xl text-text-muted">
                  No critical resume wording improvements found.
                </div>
              )}
            </div>
          </div>

          {/* Section B: Skill Improvements */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-text-main">
              <Target size={24} className="text-brand-500" />
              <h2 className="text-2xl font-bold">Skill Action Plan</h2>
            </div>
            <p className="text-sm text-text-muted">Actionable steps to close gaps between your current resume and the target role requirements.</p>
            
            <div className="space-y-4">
              {skill_improvements.map((skill, idx) => (
                <div key={idx} className="bg-surface-bg border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
                  
                  <div className="flex items-start justify-between pb-4 border-b border-border-subtle">
                    <div>
                      <h3 className="text-xl font-bold text-text-main mb-1">{skill.skill}</h3>
                      <div className={`text-sm font-semibold ${gapTypeColors[skill.gap_type] || 'text-text-muted'}`}>
                        {skill.gap_type}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-bold border ${priorityColors[skill.priority] || 'bg-slate-50 text-slate-700'}`}>
                      {skill.priority} Priority
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Why it matters</span>
                      <p className="text-sm text-text-body">{skill.why_it_matters}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Current Evidence</span>
                      <p className="text-sm text-text-body italic">"{skill.current_evidence}"</p>
                    </div>
                    
                    <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl mt-4">
                      <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-1">Recommended Next Step</span>
                      <p className="text-sm text-brand-900 font-medium">{skill.next_step}</p>
                    </div>
                  </div>

                </div>
              ))}

              {skill_improvements.length === 0 && (
                <div className="p-6 text-center border border-dashed border-border-subtle rounded-xl text-text-muted">
                  No critical skill gaps identified.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
