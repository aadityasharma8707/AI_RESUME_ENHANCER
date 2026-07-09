import { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { Loader2, FileText, Download, LayoutTemplate, CheckCircle2 } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional layout with serif fonts and clear hierarchy. Best for formal industries.',
    styles: `
      .resume-template-classic {
        font-family: 'Times New Roman', Times, serif;
        color: #000;
        line-height: 1.4;
      }
      .resume-template-classic h1 {
        font-size: 24pt;
        text-align: center;
        text-transform: uppercase;
        margin-bottom: 4px;
        font-weight: bold;
      }
      .resume-template-classic h2 {
        font-size: 14pt;
        border-bottom: 1px solid #000;
        text-transform: uppercase;
        margin-top: 16px;
        margin-bottom: 8px;
        padding-bottom: 2px;
        font-weight: bold;
      }
      .resume-template-classic h3 {
        font-size: 12pt;
        font-weight: bold;
        margin-top: 8px;
        margin-bottom: 4px;
      }
      .resume-template-classic p, .resume-template-classic ul {
        font-size: 11pt;
        margin-bottom: 8px;
      }
      .resume-template-classic ul {
        padding-left: 20px;
        list-style-type: disc;
      }
      .resume-template-classic li {
        margin-bottom: 4px;
      }
    `
  },
  {
    id: 'modern',
    name: 'Modern Accent',
    description: 'Clean sans-serif typography with subtle color accents for a contemporary look.',
    styles: `
      .resume-template-modern {
        font-family: 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;
        color: #333;
        line-height: 1.5;
      }
      .resume-template-modern h1 {
        font-size: 28pt;
        color: #2563eb;
        margin-bottom: 8px;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      .resume-template-modern h2 {
        font-size: 15pt;
        color: #1e40af;
        border-bottom: 2px solid #bfdbfe;
        margin-top: 20px;
        margin-bottom: 12px;
        padding-bottom: 4px;
        font-weight: 700;
      }
      .resume-template-modern h3 {
        font-size: 12pt;
        color: #111827;
        font-weight: 600;
        margin-top: 12px;
        margin-bottom: 4px;
      }
      .resume-template-modern p, .resume-template-modern ul {
        font-size: 10.5pt;
        color: #4b5563;
        margin-bottom: 8px;
      }
      .resume-template-modern ul {
        padding-left: 18px;
      }
      .resume-template-modern li {
        margin-bottom: 6px;
      }
    `
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Ultra-clean design with generous whitespace and understated typography.',
    styles: `
      .resume-template-minimal {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #1a1a1a;
        line-height: 1.6;
      }
      .resume-template-minimal h1 {
        font-size: 22pt;
        font-weight: 300;
        letter-spacing: 2px;
        margin-bottom: 16px;
        text-transform: uppercase;
      }
      .resume-template-minimal h2 {
        font-size: 11pt;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: #666;
        margin-top: 24px;
        margin-bottom: 12px;
        font-weight: 600;
      }
      .resume-template-minimal h3 {
        font-size: 12pt;
        font-weight: 500;
        margin-top: 12px;
        margin-bottom: 4px;
      }
      .resume-template-minimal p, .resume-template-minimal ul {
        font-size: 10pt;
        color: #333;
        margin-bottom: 12px;
      }
      .resume-template-minimal ul {
        padding-left: 16px;
        list-style-type: circle;
      }
      .resume-template-minimal li {
        margin-bottom: 6px;
      }
    `
  },
  {
    id: 'technical',
    name: 'Technical / Developer',
    description: 'Structured layout with monospace accents, perfect for engineers and technical roles.',
    styles: `
      .resume-template-technical {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #24292e;
        line-height: 1.4;
      }
      .resume-template-technical h1 {
        font-family: 'Courier New', Courier, monospace;
        font-size: 24pt;
        font-weight: bold;
        color: #0366d6;
        margin-bottom: 12px;
        border-left: 4px solid #0366d6;
        padding-left: 12px;
      }
      .resume-template-technical h2 {
        font-family: 'Courier New', Courier, monospace;
        font-size: 13pt;
        background-color: #f6f8fa;
        padding: 6px 12px;
        border-radius: 3px;
        margin-top: 20px;
        margin-bottom: 12px;
        font-weight: bold;
      }
      .resume-template-technical h3 {
        font-size: 11.5pt;
        font-weight: 600;
        margin-top: 12px;
        margin-bottom: 4px;
      }
      .resume-template-technical p, .resume-template-technical ul {
        font-size: 10pt;
        margin-bottom: 8px;
      }
      .resume-template-technical ul {
        padding-left: 24px;
        list-style-type: square;
      }
      .resume-template-technical li {
        margin-bottom: 4px;
      }
    `
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Elegant layout with formal serif typography and refined spacing for senior roles.',
    styles: `
      .resume-template-executive {
        font-family: 'Georgia', serif;
        color: #111;
        line-height: 1.6;
      }
      .resume-template-executive h1 {
        font-size: 26pt;
        text-align: center;
        letter-spacing: 1px;
        margin-bottom: 4px;
        font-weight: normal;
      }
      .resume-template-executive h2 {
        font-size: 13pt;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 2px;
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        padding: 6px 0;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: normal;
      }
      .resume-template-executive h3 {
        font-size: 12pt;
        font-style: italic;
        font-weight: bold;
        margin-top: 16px;
        margin-bottom: 4px;
      }
      .resume-template-executive p, .resume-template-executive ul {
        font-size: 10.5pt;
        margin-bottom: 12px;
      }
      .resume-template-executive ul {
        padding-left: 20px;
        list-style-type: disc;
      }
      .resume-template-executive li {
        margin-bottom: 6px;
      }
    `
  },
  {
    id: 'compact',
    name: 'Compact One-Page',
    description: 'High-density layout designed to fit extensive experience onto a single page.',
    styles: `
      .resume-template-compact {
        font-family: 'Arial', sans-serif;
        color: #000;
        line-height: 1.2;
      }
      .resume-template-compact h1 {
        font-size: 18pt;
        font-weight: bold;
        margin-bottom: 4px;
        text-transform: uppercase;
      }
      .resume-template-compact h2 {
        font-size: 11pt;
        font-weight: bold;
        text-transform: uppercase;
        border-bottom: 1px solid #000;
        margin-top: 10px;
        margin-bottom: 6px;
      }
      .resume-template-compact h3 {
        font-size: 10pt;
        font-weight: bold;
        margin-top: 6px;
        margin-bottom: 2px;
      }
      .resume-template-compact p, .resume-template-compact ul {
        font-size: 9pt;
        margin-bottom: 4px;
      }
      .resume-template-compact ul {
        padding-left: 14px;
        margin-top: 2px;
      }
      .resume-template-compact li {
        margin-bottom: 2px;
      }
    `
  }
];

export default function Templates() {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeData, setResumeData] = useState({ html: '' });
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const previewRef = useRef(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    if (selectedResumeId) {
      loadResumeContent(selectedResumeId);
    } else {
      setResumeData({ html: '' });
    }
  }, [selectedResumeId]);

  const loadResumes = async () => {
    try {
      const data = await apiService.getAllResumeDocuments();
      setResumes(data);
      if (data.length > 0) {
        setSelectedResumeId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to load resumes.', 'error');
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const loadResumeContent = async (id) => {
    setIsLoadingContent(true);
    try {
      const structured = await apiService.getResumeStructured(id);
      setResumeData({ html: structured.html || '' });
    } catch (err) {
      console.error(err);
      showNotification('Failed to load resume content.', 'error');
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleExportDocument = async () => {
    if (!resumeData.html) return;
    try {
      setIsExporting(true);
      showNotification("Export started. Preparing Document...", "info");
      
      const cleanHtml = resumeData.html;
      const cssStyles = selectedTemplate.styles;
      
      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title><style>${cssStyles}</style></head><body><div class="resume-template-${selectedTemplate.id}">`;
      const footer = "</div></body></html>";
      const sourceHTML = header + cleanHtml + footer;
      
      const blob = new Blob(['ufeff', sourceHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resume_${selectedTemplate.name.replace(/s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      showNotification("Document Export triggered successfully.", "success");
    } catch (err) {
      console.error(err);
      showNotification(`Failed to export document: ${err.message}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-1 h-full bg-neutral-100 overflow-hidden">
      {/* Dynamic Template Styles injected for the Preview */}
      <style>{selectedTemplate.styles}</style>

      {/* Notifications */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl shadow-lg border z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
          notification.type === 'error' ? 'bg-error-50 text-error-700 border-error-200' :
          notification.type === 'success' ? 'bg-success-50 text-success-700 border-success-200' :
          'bg-white text-neutral-800 border-neutral-200'
        }`}>
          {notification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* LEFT SIDEBAR: Controls */}
      <div className="w-80 h-full bg-white border-r border-border-subtle flex flex-col shadow-sm z-10 overflow-y-auto">
        <div className="p-6 border-b border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <LayoutTemplate className="text-brand-600" size={24} />
            <h1 className="text-xl font-bold text-text-main">Templates</h1>
          </div>
          <p className="text-sm text-text-muted leading-relaxed">
            Choose a professional template to instantly format your resume.
          </p>
        </div>

        {/* Step 1: Select Resume */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="bg-brand-100 text-brand-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
            Select Resume
          </h2>
          
          {isLoadingResumes ? (
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading resumes...
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-sm text-text-muted bg-neutral-50 p-3 rounded-lg border border-dashed border-border-subtle">
              No resumes found. Go to My Resumes to add one.
            </div>
          ) : (
            <div className="space-y-2">
              {resumes.map(resume => (
                <button
                  key={resume.id}
                  onClick={() => setSelectedResumeId(resume.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
                    selectedResumeId === resume.id 
                      ? 'bg-brand-50 border-brand-200 text-brand-700' 
                      : 'bg-white border-border-subtle text-text-main hover:bg-neutral-50'
                  }`}
                >
                  <FileText size={16} className={selectedResumeId === resume.id ? 'text-brand-600' : 'text-text-muted'} />
                  <span className="truncate">{resume.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Choose Template */}
        <div className="p-6 flex-1">
          <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="bg-brand-100 text-brand-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
            Choose Template
          </h2>
          
          <div className="space-y-3">
            {TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTemplate.id === template.id 
                    ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 shadow-sm' 
                    : 'bg-white border-border-subtle hover:border-brand-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-sm ${selectedTemplate.id === template.id ? 'text-brand-700' : 'text-text-main'}`}>
                    {template.name}
                  </span>
                  {selectedTemplate.id === template.id && (
                    <CheckCircle2 size={16} className="text-brand-600" />
                  )}
                </div>
                <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT AREA: Preview & Export */}
      <div className="flex-1 h-full overflow-y-auto flex flex-col items-center p-8">
        
        {/* Toolbar */}
        <div className="w-[800px] flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-2">
              <span className="bg-brand-100 text-brand-700 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">3</span>
              Preview & Export
            </h2>
            <p className="text-sm font-medium text-text-main">
              Previewing: <span className="text-brand-600">{selectedTemplate.name}</span>
            </p>
          </div>
          
          <button 
            onClick={handleExportDocument}
            disabled={isExporting || !resumeData.html || isLoadingContent}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Export Document
          </button>
        </div>

        {/* Paper Preview */}
        {isLoadingContent ? (
          <div className="w-[800px] min-h-[1056px] bg-white shadow-xl rounded-sm p-12 border border-neutral-200 flex items-center justify-center">
             <Loader2 size={32} className="animate-spin text-brand-600" />
          </div>
        ) : !resumeData.html ? (
          <div className="w-[800px] min-h-[1056px] bg-white shadow-xl rounded-sm p-12 border border-neutral-200 flex flex-col items-center justify-center text-text-muted">
            <FileText size={48} className="mb-4 text-border-subtle" />
            <p className="font-medium text-lg text-text-main">No resume content available</p>
            <p className="text-sm">Please select a resume to preview.</p>
          </div>
        ) : (
          <div 
             ref={previewRef}
             className={`w-[800px] min-h-[1056px] bg-white shadow-xl rounded-sm p-12 mb-12 border border-neutral-200 resume-template-${selectedTemplate.id}`}
             dangerouslySetInnerHTML={{ __html: resumeData.html }}
          />
        )}
      </div>
    </div>
  );
}
