import { useState, useEffect } from 'react';
import { Award, ShieldAlert, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingState from '../components/LoadingState';

export default function MySkills() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillStatuses, setSkillStatuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getCentralResumes();
        if (Array.isArray(data)) {
          const valid = data.filter(r => r && r.id);
          setResumes(valid);
          if (valid.length > 0) {
            setSelectedResumeId(valid[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load resumes", err);
        setError("Failed to load resumes.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResumes();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!selectedResumeId) return;
      try {
        const [resume, statusMap] = await Promise.all([
          apiService.getCentralResume(selectedResumeId),
          apiService.getResumeSkillStatus(selectedResumeId).catch(() => ({}))
        ]);
        
        if (resume && resume.extracted_skills) {
          const parsedSkills = JSON.parse(resume.extracted_skills);
          setSkills(parsedSkills);
        } else {
          setSkills([]);
        }
        setSkillStatuses(statusMap);
      } catch (err) {
        console.error("Failed to load skills", err);
      }
    };
    fetchSkills();
  }, [selectedResumeId]);

  const renderBadge = (skill) => {
    const status = skillStatuses[skill];
    
    if (status === 'Verified') {
      return (
        <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-success-700 bg-success-50 px-2 py-1 rounded-md">
          <Award size={14} />
          <span>Verified</span>
        </div>
      );
    }
    
    if (status === 'Needs Improvement') {
      return (
        <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-warning-700 bg-warning-50 px-2 py-1 rounded-md">
          <ShieldAlert size={14} />
          <span>Needs Improvement</span>
        </div>
      );
    }
    
    if (status === 'Not Verified') {
      return (
        <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-error-700 bg-error-50 px-2 py-1 rounded-md">
          <ShieldAlert size={14} />
          <span>Not Verified</span>
        </div>
      );
    }
    
    // Default
    return (
      <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-text-muted bg-surface-bg border border-border-subtle px-2 py-1 rounded-md">
        <ShieldAlert size={14} />
        <span>Unverified</span>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-app-bg pb-12 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main">My Skills</h1>
          <p className="text-text-muted mt-1">Review the skills claimed by your resume and their verification status.</p>
        </div>
        
        {error && (
          <div className="p-4 bg-error-50 text-error-700 rounded-xl text-center mb-6">
            {error}
          </div>
        )}

        {resumes.length === 0 ? (
          <div className="text-center py-20 bg-surface-bg rounded-3xl border border-border-subtle border-dashed shadow-sm">
            <div className="inline-flex items-center justify-center p-5 bg-brand-50 rounded-full text-brand-600 mb-4">
              <Award size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-text-main">No resumes yet</h3>
            <p className="text-text-muted mt-2 max-w-sm mx-auto mb-6">
              You haven't uploaded any resumes yet. Upload a resume to extract your skills.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
            >
              Upload Resume
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-main mb-1">Select Resume</label>
                <select 
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full sm:w-80 p-3 border border-border-input rounded-xl bg-app-bg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all text-text-main text-sm"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.display_name}</option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-text-muted">
                {skills.length} skills extracted
              </div>
            </div>

            {skills.length === 0 ? (
               <div className="text-center py-20 bg-surface-bg rounded-3xl border border-border-subtle shadow-sm">
                 <p className="text-text-muted">No technical skills were extracted from this resume.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill, idx) => (
                  <div key={idx} className="bg-surface-bg p-5 rounded-2xl border border-border-subtle shadow-sm flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="font-bold text-text-main text-lg mb-2">{skill}</h3>
                      {renderBadge(skill)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
