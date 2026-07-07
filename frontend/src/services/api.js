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
};
