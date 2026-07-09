import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Loader2, Plus, Clock, Briefcase, PenTool } from 'lucide-react';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

export default function MyResumes() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getCentralResumes();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      const validResumes = data.filter(r => r && r.id);
      
      setResumes(validResumes);
      setError(null);
    } catch (err) {
      setError('Failed to load your resumes. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this resume? This cannot be undone.')) {
      try {
        await apiService.deleteCentralResume(id);
        const resumeToDelete = resumes.find(r => r.id === id);
        setResumes(resumes.filter(r => r.id !== id));
        addNotification('Resume Deleted', `Deleted resume ${resumeToDelete?.display_name || ''}`, 'info');
      } catch (err) {
        alert('Failed to delete resume.');
      }
    }
  };

  const handleOpenResume = (resume) => {
    navigate(`/resume-builder/view/${resume.id}`);
  };

  const formatDate = (isoString) => {
    try {
      if (!isoString) return 'Unknown date';
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      }).format(date);
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div className="min-h-screen bg-app-bg pb-12 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-main">My Resumes</h1>
            <p className="text-text-muted mt-1">Manage your resume documents</p>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>New Resume</span>
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted space-y-4">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading library...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-error-50 text-error-700 rounded-xl text-center">
            {error}
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 bg-surface-bg rounded-3xl border border-border-subtle border-dashed shadow-sm">
            <div className="inline-flex items-center justify-center p-5 bg-brand-50 rounded-full text-brand-600 mb-4">
              <FileText size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-text-main">No resumes yet</h3>
            <p className="text-text-muted mt-2 max-w-sm mx-auto mb-6">
              You haven't uploaded or built any resumes yet. Start by uploading an existing resume or creating a new one.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
            >
              Upload Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resumes.map((resume) => (
              <div 
                key={resume.id} 
                onClick={() => handleOpenResume(resume)}
                className="bg-surface-bg rounded-2xl border border-border-subtle shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer group flex flex-col overflow-hidden"
              >
                {/* Card Header Pattern */}
                <div className="h-24 bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center border-b border-border-subtle relative">
                  <FileText size={40} className="text-brand-300" strokeWidth={1} />
                  <div className="absolute top-3 right-3 flex space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/resume-builder/build?id=${resume.id}`);
                      }}
                      className="p-1.5 bg-white text-text-muted hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors shadow-sm"
                      title="Edit resume content"
                    >
                      <PenTool size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(resume.id, e)}
                      className="p-1.5 bg-white text-text-muted hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors shadow-sm"
                      title="Delete resume"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-text-main text-lg truncate mb-1" title={resume.display_name}>
                    {resume.display_name}
                  </h3>
                  
                  <div className="flex items-center space-x-1.5 text-xs font-medium text-brand-600 bg-brand-50 w-fit px-2 py-0.5 rounded-md mb-4">
                    <span>{resume.source}</span>
                  </div>
                  
                  <div className="mt-auto space-y-2">
                    {resume.target_job_title && (
                      <div className="flex items-center text-xs text-text-muted space-x-2">
                        <Briefcase size={14} className="opacity-70" />
                        <span className="truncate">{resume.target_job_title}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-text-muted space-x-2">
                      <Clock size={14} className="opacity-70" />
                      <span>{formatDate(resume.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
