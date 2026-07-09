import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UploadCloud, FileText, ChevronRight, Briefcase, Trash2, ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingState from '../components/LoadingState';
import TopBar from '../components/TopBar';
import { useNotifications } from '../hooks/useNotifications';

export default function LandingPage() {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [targetSkills, setTargetSkills] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('new');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();

  // Reset state if navigated here with reset flag
  useEffect(() => {
    if (location.state?.reset) {
      setFile(null);
      setJobTitle('');
      setTargetSkills('');
      setError(null);
      setSelectedResumeId('new');
      // Clear location state so refresh doesn't trigger it again unnecessarily
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const data = await apiService.getCentralResumes();
        if (Array.isArray(data)) {
          const valid = data.filter(r => r && r.id);
          setResumes(valid);
        }
      } catch (err) {
        console.error("Failed to load resumes", err);
      }
    };
    loadResumes();
  }, []);

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation();
    try {
      await apiService.deleteCentralResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      if (selectedResumeId === id) {
        setSelectedResumeId('new');
      }
      addNotification('Resume Deleted', 'Successfully removed from library', 'info');
    } catch (err) {
      console.error('Failed to delete resume', err);
      addNotification('Delete Failed', 'Could not delete resume', 'error');
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a valid PDF file.');
      }
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid PDF file.');
      }
    }
  };

  const handleAnalyze = async () => {
    if ((selectedResumeId === 'new' && !file) || !jobTitle.trim()) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      let finalResumeId = selectedResumeId;
      let finalFileName = 'resume';
      
      if (selectedResumeId === 'new' && file) {
        const uploadResult = await apiService.uploadCentralResume(file);
        finalResumeId = uploadResult.id;
        finalFileName = file.name;
      } else {
        const selectedResume = resumes.find(r => r.id === selectedResumeId);
        if (selectedResume) {
          finalFileName = selectedResume.display_name;
        }
      }

      const formData = new FormData();
      formData.append('resume_id', finalResumeId);
      formData.append('job_title', jobTitle);
      formData.append('target_skills', targetSkills);
      
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      addNotification('Analysis Completed', `Successfully analyzed ${finalFileName}`, 'success');
      navigate('/resume-check/overview', { state: { result } });
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during analysis.';
      setError(errorMsg);
      addNotification('Analysis Failed', errorMsg, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isFormValid = (selectedResumeId !== 'new' || file) && jobTitle.trim().length > 0;

  if (isAnalyzing) {
    return <LoadingState />;
  }

  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-4xl space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-brand-100 text-brand-600 rounded-2xl mb-2">
              <Briefcase size={32} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-main">
              AI Career <span className="text-brand-600">Intelligence</span>
            </h1>
            <p className="text-lg text-text-body max-w-2xl mx-auto leading-relaxed">
              Upload your resume and the target job description to get an evidence-based match analysis. Stop guessing, start knowing.
            </p>
          </div>

          {/* Main Content Form */}
          <div className="glass-panel p-8 md:p-12 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Resume Upload Column */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-text-main">
                  1. Select or Upload Resume
                </label>
                
                {resumes.length > 0 && (
                  <div className="relative mb-4">
                    <div 
                      className="w-full p-3 border border-border-input rounded-xl bg-surface-bg flex justify-between items-center cursor-pointer hover:border-brand-300 transition-all text-text-main text-sm"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span className="truncate">
                        {selectedResumeId === 'new' 
                          ? '+ Upload a new resume' 
                          : resumes.find(r => r.id === selectedResumeId)?.display_name || 'Select resume'}
                      </span>
                      <ChevronDown size={16} className="text-text-muted flex-shrink-0 ml-2" />
                    </div>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-surface-bg border border-border-input rounded-xl shadow-lg overflow-hidden py-1">
                        <div 
                          className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm font-medium text-brand-600 transition-colors"
                          onClick={() => {
                            setSelectedResumeId('new');
                            setIsDropdownOpen(false);
                          }}
                        >
                          + Upload a new resume
                        </div>
                        <div className="h-px bg-border-subtle my-1"></div>
                        <div className="max-h-48 overflow-y-auto">
                          {resumes.map(r => (
                            <div 
                              key={r.id}
                              className={`px-4 py-2 flex justify-between items-center hover:bg-slate-50 cursor-pointer transition-colors ${selectedResumeId === r.id ? 'bg-brand-50' : ''}`}
                              onClick={() => {
                                setSelectedResumeId(r.id);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <span className="text-sm text-text-main truncate pr-4">{r.display_name}</span>
                              <button
                                onClick={(e) => handleDeleteResume(r.id, e)}
                                className="p-1.5 text-text-muted hover:text-error-600 hover:bg-error-50 rounded-md transition-colors flex-shrink-0"
                                title="Delete resume"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedResumeId === 'new' && (
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload').click()}
                  className={`
                    relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200
                    ${isDragging ? 'border-brand-500 bg-brand-50' : 'border-border-input bg-app-bg hover:bg-slate-100 hover:border-brand-300'}
                    ${file ? 'border-success-500 bg-success-50' : ''}
                  `}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center space-y-2 text-success-700">
                      <FileText size={48} className="opacity-80" />
                      <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs opacity-70">Ready to analyze</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4 text-text-muted">
                      <UploadCloud size={48} strokeWidth={1.5} className="text-text-muted" />
                      <div className="text-center">
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-text-muted mt-1">PDF files only (max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                )}
              </div>

              {/* Job Description Column */}
              <div className="space-y-4 flex flex-col">
                <label htmlFor="job-title" className="block text-sm font-semibold text-text-main">
                  2. Target Job Title
                </label>
                
                <input
                  id="job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full p-4 border border-border-input rounded-xl bg-surface-bg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all text-text-main placeholder-text-muted text-sm"
                />

                <label htmlFor="target-skills" className="block text-sm font-semibold text-text-main mt-4">
                  3. Target Skills <span className="text-text-muted font-normal text-xs ml-2">(Optional)</span>
                </label>
                
                <textarea
                  id="target-skills"
                  value={targetSkills}
                  onChange={(e) => setTargetSkills(e.target.value)}
                  placeholder="e.g. Python, React, AWS, Docker (comma separated)"
                  className="w-full flex-grow p-4 border border-border-input rounded-xl bg-surface-bg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all resize-none text-text-main placeholder-text-muted text-sm leading-relaxed"
                ></textarea>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-error-50 text-error-700 rounded-xl text-sm font-medium border border-error-100">
                {error}
              </div>
            )}

            {/* Action Button */}
            <div className="pt-6 border-t border-border-subtle flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!isFormValid || isAnalyzing}
                className={`
                  group flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200
                  ${isFormValid 
                    ? 'bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                    : 'bg-border-input text-text-muted cursor-not-allowed'}
                `}
              >
                <span>Analyze Resume</span>
                <ChevronRight size={20} className={`transition-transform duration-200 ${isFormValid ? 'group-hover:translate-x-1' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
