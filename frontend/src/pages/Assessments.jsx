import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Loader2, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import LoadingState from '../components/LoadingState';

export default function Assessments() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const { resumeId: initialResumeId, skill: initialSkill } = location.state || {};

  const [resumeId, setResumeId] = useState(initialResumeId || '');
  const [skill, setSkill] = useState(initialSkill || '');

  const [assessment, setAssessment] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  // Direct Entry States
  const isDirectEntry = !initialResumeId || !initialSkill;
  const [availableResumes, setAvailableResumes] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedDirectResumeId, setSelectedDirectResumeId] = useState('');
  const [selectedDirectSkill, setSelectedDirectSkill] = useState('');

  useEffect(() => {
    if (isDirectEntry && !assessment) {
      const fetchResumes = async () => {
        try {
          const data = await apiService.getCentralResumes();
          if (Array.isArray(data)) {
            setAvailableResumes(data.filter(r => r && r.id));
          }
        } catch (err) {
          console.error("Failed to fetch resumes", err);
        }
      };
      fetchResumes();
    }
  }, [isDirectEntry, assessment]);

  useEffect(() => {
    const fetchSkills = async () => {
      if (!selectedDirectResumeId) {
        setAvailableSkills([]);
        return;
      }
      try {
        const resume = await apiService.getCentralResume(selectedDirectResumeId);
        if (resume && resume.extracted_skills) {
          setAvailableSkills(JSON.parse(resume.extracted_skills));
        } else {
          setAvailableSkills([]);
        }
      } catch (err) {
        console.error("Failed to fetch skills", err);
      }
    };
    fetchSkills();
  }, [selectedDirectResumeId]);

  const handleGenerate = async (targetResumeId, targetSkill) => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await apiService.generateAssessment(targetResumeId, targetSkill);
      setAssessment(data.assessment);
      setAssessmentId(data.assessment_id);
      setResumeId(targetResumeId);
      setSkill(targetSkill);
      addNotification('Assessment Generated', 'Your skill assessment is ready.', 'success');
    } catch (err) {
      setError(err.message || 'Failed to generate assessment.');
      addNotification('Generation Failed', err.message || 'Could not generate assessment.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    // Validate 6 answers
    const mcqs = assessment.mcqs || [];
    const scenarios = assessment.scenarios || [];
    const practicalTask = assessment.practical_task || {};
    
    const expectedIds = [...mcqs.map(q => q.id), ...scenarios.map(q => q.id), practicalTask.id];
    const missing = expectedIds.some(id => !answers[id] || !String(answers[id]).trim());
    
    if (missing) {
      setError('Please answer all 6 questions before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await apiService.submitAssessment(assessmentId, answers);
      setResult(data);
      addNotification('Evaluation Complete', 'Your results are ready.', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to submit assessment.');
      addNotification('Submission Failed', err.message || 'Could not submit assessment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center p-8">
        <Loader2 className="animate-spin text-brand-600 mb-4" size={48} />
        <h2 className="text-xl font-bold text-text-main">Generating Assessment...</h2>
        <p className="text-text-muted mt-2 text-center max-w-md">
          Creating a custom assessment. This includes concept checks, scenarios, and a practical task.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg pb-12 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 text-sm text-text-muted mb-4 cursor-pointer hover:text-brand-600 transition-colors" onClick={() => navigate('/skill-verification/my-skills')}>
            <span>My Skills</span>
            <ChevronRight size={14} />
            <span>Assessments</span>
          </div>
          <h1 className="text-3xl font-bold text-text-main">
            {skill ? `Skill Assessment: ${skill}` : 'Assessments'}
          </h1>
          <p className="text-text-muted mt-2">
            {skill ? 'Complete this assessment to verify your expertise.' : 'Choose a resume and technical skill to start a skill verification assessment.'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-error-50 text-error-700 rounded-xl mb-8 flex items-start space-x-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-8">
            <div className="bg-surface-bg p-8 rounded-3xl border border-border-subtle shadow-sm text-center">
              <h2 className="text-3xl font-bold text-text-main mb-2">Total Score: {result.total_score} / 100</h2>
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-bold text-lg mb-6 ${
                result.outcome === 'Verified' ? 'bg-success-100 text-success-700' :
                result.outcome === 'Needs Improvement' ? 'bg-warning-100 text-warning-700' :
                'bg-error-100 text-error-700'
              }`}>
                {result.outcome === 'Verified' && <CheckCircle2 size={24} />}
                {result.outcome === 'Needs Improvement' && <AlertCircle size={24} />}
                <span>{result.outcome}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 bg-app-bg rounded-xl border border-border-subtle">
                  <p className="text-text-muted text-sm font-semibold mb-1">Concept Check</p>
                  <p className="text-2xl font-bold text-text-main">{result.concept_score} <span className="text-text-muted text-lg">/ 30</span></p>
                </div>
                <div className="p-4 bg-app-bg rounded-xl border border-border-subtle">
                  <p className="text-text-muted text-sm font-semibold mb-1">Applied Understanding</p>
                  <p className="text-2xl font-bold text-text-main">{result.applied_score} <span className="text-text-muted text-lg">/ 40</span></p>
                </div>
                <div className="p-4 bg-app-bg rounded-xl border border-border-subtle">
                  <p className="text-text-muted text-sm font-semibold mb-1">Practical Task</p>
                  <p className="text-2xl font-bold text-text-main">{result.practical_score} <span className="text-text-muted text-lg">/ 30</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm">
                <h3 className="font-bold text-success-700 mb-4 flex items-center space-x-2">
                  <CheckCircle2 size={20} /> <span>Strengths</span>
                </h3>
                <ul className="list-disc list-inside space-y-2 text-text-main text-sm">
                  {result.feedback?.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm">
                <h3 className="font-bold text-warning-700 mb-4 flex items-center space-x-2">
                  <AlertCircle size={20} /> <span>Areas for Improvement</span>
                </h3>
                <ul className="list-disc list-inside space-y-2 text-text-main text-sm">
                  {result.feedback?.improvement_areas?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>

            <div className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-text-main border-b border-border-subtle pb-2">Detailed Feedback</h3>
              <div>
                <p className="font-semibold text-text-main">Scenario 1</p>
                <p className="text-text-muted mt-1 text-sm">{result.feedback?.scenario_1_feedback}</p>
              </div>
              <div>
                <p className="font-semibold text-text-main">Scenario 2</p>
                <p className="text-text-muted mt-1 text-sm">{result.feedback?.scenario_2_feedback}</p>
              </div>
              <div>
                <p className="font-semibold text-text-main">Practical Task</p>
                <p className="text-text-muted mt-1 text-sm">{result.feedback?.practical_feedback}</p>
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <button 
                onClick={() => navigate('/skill-verification/my-skills')}
                className="px-8 py-3.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
              >
                Back to My Skills
              </button>
            </div>
          </div>
        ) : !assessment ? (
          isDirectEntry ? (
            <div className="bg-surface-bg p-8 rounded-3xl border border-border-subtle shadow-sm">
              <div className="space-y-6 max-w-lg mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center p-5 bg-brand-50 rounded-full text-brand-600 mb-6">
                    <ClipboardList size={48} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-text-main">Start Assessment</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">Select Resume</label>
                  <select 
                    value={selectedDirectResumeId}
                    onChange={(e) => {
                      setSelectedDirectResumeId(e.target.value);
                      setSelectedDirectSkill('');
                    }}
                    className="w-full p-3.5 border border-border-input rounded-xl bg-app-bg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all text-text-main text-sm"
                  >
                    <option value="">-- Choose a resume --</option>
                    {availableResumes.map(r => (
                      <option key={r.id} value={r.id}>{r.display_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">Select Technical Skill</label>
                  <select 
                    value={selectedDirectSkill}
                    onChange={(e) => setSelectedDirectSkill(e.target.value)}
                    disabled={!selectedDirectResumeId || availableSkills.length === 0}
                    className="w-full p-3.5 border border-border-input rounded-xl bg-app-bg focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all text-text-main text-sm disabled:opacity-50"
                  >
                    <option value="">-- Choose a skill --</option>
                    {availableSkills.map((s, idx) => (
                      <option key={idx} value={s}>{s}</option>
                    ))}
                  </select>
                  {selectedDirectResumeId && availableSkills.length === 0 && (
                    <p className="text-xs text-error-600 mt-2">No technical skills found in this resume.</p>
                  )}
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => handleGenerate(selectedDirectResumeId, selectedDirectSkill)}
                    disabled={!selectedDirectResumeId || !selectedDirectSkill}
                    className="w-full px-8 py-3.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-bg p-8 rounded-3xl border border-border-subtle shadow-sm text-center">
              <div className="inline-flex items-center justify-center p-5 bg-brand-50 rounded-full text-brand-600 mb-6">
                <ClipboardList size={48} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-text-main mb-4">Ready to verify {skill}?</h2>
              
              <div className="max-w-md mx-auto bg-app-bg p-6 rounded-2xl border border-border-subtle mb-8 text-left">
                <h3 className="font-semibold text-text-main mb-4">Assessment Structure</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3 text-text-muted">
                    <CheckCircle2 size={18} className="text-brand-600" />
                    <span>3 Concept Questions (Multiple Choice)</span>
                  </li>
                  <li className="flex items-center space-x-3 text-text-muted">
                    <CheckCircle2 size={18} className="text-brand-600" />
                    <span>2 Applied Scenarios (Written)</span>
                  </li>
                  <li className="flex items-center space-x-3 text-text-muted">
                    <CheckCircle2 size={18} className="text-brand-600" />
                    <span>1 Practical Task (Written/Code)</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={() => handleGenerate(resumeId, skill)}
                className="px-8 py-3.5 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm text-lg"
              >
                Generate Assessment
              </button>
            </div>
          )
        ) : (
          <div className="space-y-10">
            {/* Concept Check */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-text-main border-b border-border-subtle pb-2">1. Concept Check</h2>
              {assessment.mcqs?.map((q, idx) => (
                <div key={q.id} className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm">
                  <p className="font-semibold text-text-main mb-4">
                    <span className="text-brand-600 mr-2">Q{idx + 1}.</span>
                    {q.question_text}
                  </p>
                  <div className="space-y-3">
                    {q.options?.map(opt => (
                      <label key={opt.id} className={`flex items-start p-4 rounded-xl border cursor-pointer transition-colors ${answers[q.id] === opt.id ? 'border-brand-500 bg-brand-50' : 'border-border-input hover:border-brand-300 bg-app-bg'}`}>
                        <input 
                          type="radio" 
                          name={`mcq-${q.id}`} 
                          value={opt.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() => handleAnswerChange(q.id, opt.id)}
                          className="mt-1 mr-3 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-text-main text-sm">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Applied Understanding */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-text-main border-b border-border-subtle pb-2">2. Applied Understanding</h2>
              {assessment.scenarios?.map((q, idx) => (
                <div key={q.id} className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm">
                  <p className="font-semibold text-text-main mb-4">
                    <span className="text-brand-600 mr-2">Scenario {idx + 1}.</span>
                    {q.scenario_text}
                  </p>
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Describe your approach..."
                    className="w-full p-4 border border-border-input rounded-xl bg-app-bg min-h-[150px] focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all text-sm"
                  />
                </div>
              ))}
            </section>

            {/* Practical Task */}
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-text-main border-b border-border-subtle pb-2">3. Practical Task</h2>
              <div className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm">
                <p className="font-semibold text-text-main mb-4">
                  {assessment.practical_task?.task_text}
                </p>
                <textarea
                  value={answers[assessment.practical_task?.id] || ''}
                  onChange={(e) => handleAnswerChange(assessment.practical_task?.id, e.target.value)}
                  placeholder="Provide your solution or code here..."
                  className="w-full p-4 border border-border-input rounded-xl bg-app-bg min-h-[250px] font-mono focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all text-sm"
                />
              </div>
            </section>

            <div className="pt-6 pb-20 flex justify-end">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="group flex items-center justify-center space-x-2 px-8 py-4 bg-brand-600 text-white font-medium rounded-xl hover:bg-brand-700 transition-colors shadow-sm text-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Assessment</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
