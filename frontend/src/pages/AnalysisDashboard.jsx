import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Briefcase, 
  Layers, 
  BarChart 
} from 'lucide-react';

export default function AnalysisDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const analysis = location.state?.result;

  if (!analysis) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center space-y-4 p-6">
        <div className="p-4 bg-error-50 text-error-700 rounded-xl">No analysis result found. Please upload a resume first.</div>
        <button onClick={() => navigate('/')} className="text-brand-600 hover:underline font-medium">
          Return to Upload
        </button>
      </div>
    );
  }

  const {
    filename,
    total_chunks,
    job_requirements = {},
    skill_matches = []
  } = analysis;
  
  // Calculate Match Summary
  let strongCount = 0;
  let partialCount = 0;
  let noEvidenceCount = 0;

  skill_matches.forEach(match => {
    if (match.status === 'Strong Match') strongCount++;
    else if (match.status === 'Partial Match') partialCount++;
    else noEvidenceCount++;
  });

  const totalRequiredSkills = job_requirements.required_skills?.length || skill_matches.length;
  
  // Basic scoring heuristic for the UI
  const calculateScore = () => {
    if (totalRequiredSkills === 0) return 0;
    const rawScore = ((strongCount * 1) + (partialCount * 0.5)) / totalRequiredSkills;
    return Math.round(rawScore * 100);
  };
  
  const overallScore = calculateScore();

  return (
    <div className="min-h-screen bg-app-bg pb-12">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Overview Header Card */}
        <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium">
              <Briefcase size={16} />
              <span>Target Role: {job_requirements.job_title || 'Unknown Title'}</span>
            </div>
            <h1 className="text-3xl font-bold text-text-main">Match Overview</h1>
            <div className="flex flex-wrap gap-4 text-sm text-text-muted">
              <div className="flex items-center space-x-1">
                <FileText size={16} />
                <span>{filename}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Layers size={16} />
                <span>{total_chunks || 0} Data Chunks</span>
              </div>
            </div>
          </div>
          
          {/* Score Display */}
          <div className="flex items-center space-x-6 p-6 bg-surface-bg rounded-2xl border border-border-subtle shadow-sm">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-brand-600">{overallScore}</div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">Match Score</div>
            </div>
            <div className="h-12 w-px bg-border-subtle"></div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between space-x-4">
                <span className="text-text-muted">Strong</span>
                <span className="font-semibold text-success-600">{strongCount}</span>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <span className="text-text-muted">Partial</span>
                <span className="font-semibold text-warning-600">{partialCount}</span>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <span className="text-text-muted">Missing</span>
                <span className="font-semibold text-error-600">{noEvidenceCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Skill Matches */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-border-subtle">
              <BarChart className="text-text-muted" size={20} />
              <h2 className="text-xl font-bold text-text-main">Skill Analysis</h2>
            </div>
            
            <div className="space-y-4">
              {skill_matches.map((match, idx) => {
                const isStrong = match.status === 'Strong Match';
                const isPartial = match.status === 'Partial Match';
                const isMissing = match.status === 'No Evidence';

                return (
                  <div key={idx} className="bg-surface-bg rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col space-y-4 hover:shadow-md transition-shadow">
                    
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-text-main">{match.skill}</h3>
                      <div className={`
                        flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${isStrong ? 'bg-success-50 text-success-700' : ''}
                        ${isPartial ? 'bg-warning-50 text-warning-700' : ''}
                        ${isMissing ? 'bg-error-50 text-error-700' : ''}
                      `}>
                        {isStrong && <CheckCircle2 size={14} />}
                        {isPartial && <AlertCircle size={14} />}
                        {isMissing && <XCircle size={14} />}
                        <span>{match.status}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mt-2">
                      {match.evidence && match.evidence.toLowerCase() !== 'none' && (
                        <div>
                          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Evidence Found</div>
                          <p className="text-sm text-text-body bg-app-bg p-3 rounded-xl border border-border-subtle">"{match.evidence}"</p>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Reasoning</div>
                        <p className="text-sm text-text-body leading-relaxed">{match.reason}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {skill_matches.length === 0 && (
                <div className="p-8 text-center bg-surface-bg rounded-2xl border border-border-subtle border-dashed">
                  <p className="text-text-muted">No skill matches were identified in the analysis.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Job Intelligence */}
          <div className="space-y-6">
            <div className="bg-surface-bg border border-border-subtle rounded-2xl p-6 shadow-md space-y-6 sticky top-24">
              <div className="border-b border-border-subtle pb-4">
                <h2 className="text-xl font-bold text-text-main">Job Intelligence</h2>
                <p className="text-sm text-text-muted mt-1">Extracted target requirements</p>
              </div>

              {job_requirements.experience_required && (
                <div>
                  <h3 className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">Experience</h3>
                  <p className="text-sm text-text-body">{job_requirements.experience_required}</p>
                </div>
              )}

              {job_requirements.required_skills && job_requirements.required_skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">Required Skills</h3>
                  <ul className="space-y-1">
                    {job_requirements.required_skills.map((skill, idx) => (
                      <li key={idx} className="text-sm text-text-body flex items-start space-x-2">
                        <span className="text-brand-500 mt-0.5">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job_requirements.preferred_skills && job_requirements.preferred_skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">Preferred</h3>
                  <ul className="space-y-1">
                    {job_requirements.preferred_skills.map((skill, idx) => (
                      <li key={idx} className="text-sm text-text-body flex items-start space-x-2">
                        <span className="text-brand-500 mt-0.5">•</span>
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
