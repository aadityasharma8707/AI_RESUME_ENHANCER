import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Trash2, FileText, ChevronRight, Loader2, Briefcase } from 'lucide-react';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchQuery } = useOutletContext();
  
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAnalyses(analyses);
      return;
    }
    
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = analyses.filter(a => {
      const filenameMatch = (a.filename || '').toLowerCase().includes(lowerQuery);
      const titleMatch = (a.job_requirements?.job_title || '').toLowerCase().includes(lowerQuery);
      
      const skills = a.job_requirements?.required_skills || [];
      const skillMatch = skills.some(s => s.toLowerCase().includes(lowerQuery));

      return filenameMatch || titleMatch || skillMatch;
    });
    setFilteredAnalyses(filtered);
  }, [searchQuery, analyses]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAllAnalyses();
      setAnalyses(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load analysis history. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateScore = (analysis) => {
    const job_requirements = analysis.job_requirements || {};
    const skill_matches = analysis.skill_matches || [];
    
    let strongCount = 0;
    let partialCount = 0;
    
    skill_matches.forEach(match => {
      if (match.status === 'Strong Match') strongCount++;
      else if (match.status === 'Partial Match') partialCount++;
    });

    const totalRequiredSkills = job_requirements.required_skills?.length || skill_matches.length;
    if (totalRequiredSkills === 0) return 0;
    const rawScore = ((strongCount * 1) + (partialCount * 0.5)) / totalRequiredSkills;
    return Math.round(rawScore * 100);
  };

  const handleOpenAnalysis = (analysis) => {
    navigate('/resume-check/overview', { state: { result: analysis } });
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await apiService.deleteAnalysis(id);
        const analysisToDelete = analyses.find(a => a.id === id);
        setAnalyses(analyses.filter(a => a.id !== id));
        addNotification('Analysis Deleted', `Deleted analysis for ${analysisToDelete?.filename || 'resume'}`, 'info');
      } catch (err) {
        alert('Failed to delete analysis.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-app-bg pb-12">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted space-y-4">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading history...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-error-50 text-error-700 rounded-xl text-center">
            {error}
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-20 bg-surface-bg rounded-3xl border border-border-subtle border-dashed">
            <div className="inline-flex items-center justify-center p-4 bg-app-bg rounded-full text-text-muted mb-4">
              <FileText size={48} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-bold text-text-main">No analyses yet</h3>
            <p className="text-text-muted mt-2 max-w-sm mx-auto">
              You haven't analyzed any resumes yet. Upload a resume and job description to get started.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-2 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors"
            >
              Start Analysis
            </button>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted">No analyses match your search "{searchQuery}".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnalyses.map((analysis) => {
              // Calculate summary stats
              const overall = calculateScore(analysis);
              const hasJobMatch = !!analysis.job_requirements;

              return (
                <div 
                  key={analysis.id} 
                  onClick={() => handleOpenAnalysis(analysis)}
                  className="bg-surface-bg p-5 rounded-2xl border border-border-subtle shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-grow">
                    {hasJobMatch && (
                      <div className="flex items-center space-x-2 text-sm font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md w-fit">
                        <Briefcase size={14} />
                        <span>{analysis.job_requirements?.job_title || 'Unknown Role'}</span>
                      </div>
                    )}
                    {!hasJobMatch && (
                      <div className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                        <FileText size={14} />
                        <span>Resume Check Only</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-text-main font-bold text-lg">
                      <FileText size={18} className="text-text-muted" />
                      <span>{analysis.filename}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 sm:space-x-8 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center px-4">
                        <span className="text-brand-600 font-bold text-xl">{overall}</span>
                        <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Score</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 border-l border-border-subtle pl-4">
                      <button 
                        onClick={(e) => handleDelete(analysis.id, e)}
                        className="p-2 text-text-muted hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        title="Delete analysis"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="p-2 text-border-input group-hover:text-brand-600 transition-colors">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
