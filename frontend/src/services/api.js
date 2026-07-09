const API_BASE_URL = 'http://127.0.0.1:8000';

export const apiService = {
  analyzeResume: async (pdfFile, jobDescription) => {
    const formData = new FormData();
    formData.append('resume', pdfFile);
    formData.append('job_description', jobDescription);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to analyze resume');
    }

    return response.json();
  },

  getAllAnalyses: async () => {
    const response = await fetch(`${API_BASE_URL}/analyses`);
    if (!response.ok) {
      throw new Error('Failed to fetch analyses history');
    }
    return response.json();
  },

  getAnalysis: async (analysisId) => {
    const response = await fetch(`${API_BASE_URL}/analyses/${analysisId}`);
    if (!response.ok) {
      throw new Error('Analysis not found');
    }
    return response.json();
  },

  deleteAnalysis: async (analysisId) => {
    const response = await fetch(`${API_BASE_URL}/analyses/${analysisId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete analysis');
    }
    return response.json();
  },

  // --- NEW RESUME CHECK API ---
  analyzeResumeCheck: async (pdfFile) => {
    const formData = new FormData();
    formData.append('resume', pdfFile);

    const response = await fetch(`${API_BASE_URL}/resume-check/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to analyze resume');
    }

    return response.json();
  },

  getResumeCheck: async (analysisId) => {
    const response = await fetch(`${API_BASE_URL}/resume-check/analyses/${analysisId}`);
    if (!response.ok) {
      throw new Error('Analysis session not found');
    }
    return response.json();
  },

  // --- NEW RESUME BUILDER API ---
  getAllResumeDocuments: async () => {
    const response = await fetch(`${API_BASE_URL}/resume-builder/resumes`);
    if (!response.ok) {
      throw new Error('Failed to fetch resumes');
    }
    return response.json();
  },

  getResumeDocument: async (docId) => {
    const response = await fetch(`${API_BASE_URL}/resume-builder/resumes/${docId}`);
    if (!response.ok) {
      throw new Error('Resume not found');
    }
    return response.json();
  },

  deleteResumeDocument: async (docId) => {
    const response = await fetch(`${API_BASE_URL}/resume-builder/resumes/${docId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete resume');
    }
    return response.json();
  },

  // --- CENTRAL RESUME LIBRARY ---
  uploadCentralResume: async (pdfFile) => {
    const formData = new FormData();
    formData.append('resume', pdfFile);

    const response = await fetch(`${API_BASE_URL}/resumes`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload resume');
    return response.json();
  },

  getCentralResumes: async () => {
    const response = await fetch(`${API_BASE_URL}/resumes`);
    if (!response.ok) throw new Error('Failed to fetch resumes');
    return response.json();
  },

  getCentralResume: async (docId) => {
    const response = await fetch(`${API_BASE_URL}/resumes/${docId}`);
    if (!response.ok) throw new Error('Resume not found');
    return response.json();
  },

  deleteCentralResume: async (docId) => {
    const response = await fetch(`${API_BASE_URL}/resumes/${docId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete resume');
    return response.json();
  },

  // Assessment Endpoints
  generateAssessment: async (resumeId, skill) => {
    const response = await fetch(`${API_BASE_URL}/assessments/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resume_id: resumeId, skill }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Error generating assessment: ${response.statusText}`);
    }
    return response.json();
  },

  submitAssessment: async (assessmentId, answers) => {
    const response = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || `Error submitting assessment: ${response.statusText}`);
    }
    return response.json();
  },

  getVerificationHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/assessments/history`);
    if (!response.ok) {
      throw new Error(`Error fetching history: ${response.statusText}`);
    }
    return response.json();
  },

  getResumeSkillStatus: async (resumeId) => {
    const response = await fetch(`${API_BASE_URL}/assessments/resume/${resumeId}/status`);
    if (!response.ok) {
      throw new Error(`Error fetching skill status: ${response.statusText}`);
    }
    return response.json();
  },

  getResumeFileUrl: (docId) => {
    return `${API_BASE_URL}/resume-builder/resumes/${docId}/file`;
  },

  getResumeDownloadUrl: (docId) => {
    return `${API_BASE_URL}/resume-builder/resumes/${docId}/download`;
  },

  getResumeStructured: async (docId) => {
    const response = await fetch(`${API_BASE_URL}/resume-builder/resumes/${docId}/structured?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!response.ok) throw new Error('Failed to fetch structured data');
    return response.json();
  },

  updateResumeStructured: async (docId, structuredData) => {
    const response = await fetch(`${API_BASE_URL}/resume-builder/resumes/${docId}/structured`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structured_data: structuredData })
    });
    if (!response.ok) throw new Error('Failed to update structured data');
    return response.json();
  },

  reviewResumeSection: async (docId, sectionName, text) => {
    const response = await fetch(`${API_BASE_URL}/resume-builder/resumes/${docId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_name: sectionName, text })
    });
    if (!response.ok) throw new Error('Failed to review section');
    return response.json();
  }
};
