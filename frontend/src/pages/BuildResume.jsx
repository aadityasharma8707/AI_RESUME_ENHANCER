import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Loader2, Save, Check, X, Sparkles, FileText, AlertCircle, Download } from 'lucide-react';

export default function BuildResume() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [data, setData] = useState({ html: '' });
  
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const editorRef = useRef(null);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const structured = await apiService.getResumeStructured(id);
      setData({ html: structured.html || '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const stripHighlights = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const marks = tempDiv.querySelectorAll('mark[data-issue-id]');
    marks.forEach(mark => {
        const parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
    });
    return tempDiv.innerHTML;
  };

  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const rawHtml = editorRef.current ? editorRef.current.innerHTML : data.html;
      const cleanHtml = stripHighlights(rawHtml);
      await apiService.updateResumeStructured(id, { html: cleanHtml });
      setData({ html: cleanHtml });
      
      showNotification("Document saved", "success");
    } catch (err) {
      console.error(err);
      showNotification(`Failed to save changes: ${err.message}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportDocument = async () => {
    try {
      setIsExporting(true);
      showNotification("Export started. Preparing Document...", "info");
      
      const rawHtml = editorRef.current ? editorRef.current.innerHTML : data.html;
      const cleanHtml = stripHighlights(rawHtml);
      
      // Simple and robust HTML-to-Word generation
      const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title></head><body>`;
      const footer = "</body></html>";
      const sourceHTML = header + cleanHtml + footer;
      
      const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Resume_Edited.doc';
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

  const handleGlobalReview = async () => {
    setIsReviewing(true);
    setSelectedIssue(null);
    setIssues([]);
    try {
      const plainText = editorRef.current ? editorRef.current.innerText : '';
      
      if (!plainText.trim()) {
        showNotification("Document is empty.", "error");
        setIsReviewing(false);
        return;
      }
      
      const res = await apiService.reviewResumeSection(id, "Entire Resume", plainText);
      const newIssues = res.issues || [];
      
      if (editorRef.current) {
        setData({ html: stripHighlights(editorRef.current.innerHTML) });
      }
      
      setIssues(newIssues);
      if (newIssues.length === 0) {
        showNotification("No writing issues found!", "success");
      } else {
        showNotification(`Found ${newIssues.length} issues.`, "info");
      }
    } catch (err) {
      console.error(err);
      showNotification(`Failed to run AI review: ${err.message}`, "error");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleAcceptSuggestion = (issue) => {
    const rawHtml = editorRef.current ? editorRef.current.innerHTML : data.html;
    const searchString = `<mark class="bg-error-200 border-b-2 border-error-500 cursor-pointer print:bg-transparent print:border-none print:text-inherit" data-issue-id="${issues.indexOf(issue)}">${issue.original_text}</mark>`;
    
    let newHtml = rawHtml;
    if (rawHtml.includes(searchString)) {
        newHtml = rawHtml.replace(searchString, issue.rewrite);
    } else {
        newHtml = rawHtml.replace(issue.original_text, issue.rewrite);
    }
    
    setData({ html: stripHighlights(newHtml) });
    setIssues(prev => prev.filter(i => i !== issue));
    setSelectedIssue(null);
  };

  const handleIgnoreIssue = (issue) => {
    const rawHtml = editorRef.current ? editorRef.current.innerHTML : data.html;
    setData({ html: stripHighlights(rawHtml) });
    setIssues(prev => prev.filter(i => i !== issue));
    setSelectedIssue(null);
  };

  const handleEditorClick = (e) => {
    const mark = e.target.closest('mark[data-issue-id]');
    if (mark) {
      const idx = parseInt(mark.getAttribute('data-issue-id'), 10);
      if (!isNaN(idx) && issues[idx]) {
        setSelectedIssue(issues[idx]);
      }
    }
  };

  const handleBlur = () => {
     if (editorRef.current) {
         setData({ html: stripHighlights(editorRef.current.innerHTML) });
     }
  };

  const getHighlightedHtml = () => {
    let currentHtml = data.html || '';
    if (issues.length === 0) return currentHtml;
    
    issues.forEach((issue, index) => {
      if (currentHtml.includes(issue.original_text)) {
          currentHtml = currentHtml.replace(
              issue.original_text, 
              `<mark class="bg-error-200 border-b-2 border-error-500 cursor-pointer print:bg-transparent print:border-none print:text-inherit" data-issue-id="${index}">${issue.original_text}</mark>`
          );
      }
    });
    
    return currentHtml;
  };

  if (!id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-muted">
        <FileText size={48} className="mb-4 text-border-subtle" />
        <h2 className="text-xl font-bold text-text-main mb-2">No Resume Selected</h2>
        <button onClick={() => navigate('/resume-builder/my-resumes')} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl">Go to My Resumes</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      #resume-document, #resume-document * {
        visibility: visible;
      }
      #resume-document {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        border: none;
        box-shadow: none;
      }
    }
  `;

  return (
    <div className="flex flex-1 h-full bg-neutral-100 overflow-hidden print:bg-white print:overflow-visible">
      <style>{printStyles}</style>
      {/* LEFT: Resume Document */}
      <div className="w-2/3 h-full overflow-y-auto p-8 flex flex-col items-center print:w-full print:p-0 print:overflow-visible print:block">
        
        {/* Toolbar */}
        <div className="w-[800px] flex justify-between items-center mb-6 print:hidden">
          <div className="flex gap-2">
            <button 
              onClick={handleGlobalReview}
              disabled={isReviewing}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isReviewing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              Review Resume Writing
            </button>
          </div>

          <div className="flex gap-2 items-center">
            {notification.show && (
              <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl shadow-lg border z-[100] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
                notification.type === 'error' ? 'bg-error-50 text-error-700 border-error-200' :
                notification.type === 'success' ? 'bg-success-50 text-success-700 border-success-200' :
                'bg-white text-neutral-800 border-neutral-200'
              }`}>
                {notification.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
                <span className="font-medium text-sm">{notification.message}</span>
                <button onClick={() => setNotification(prev => ({ ...prev, show: false }))} className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity">
                  <X size={16} />
                </button>
              </div>
            )}
            <button 
              onClick={handleExportDocument}
              disabled={isExporting || !data.html}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-900 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              Export Document
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || !data.html}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Document
            </button>
          </div>
        </div>

        {/* Formatting hints */}
        <div className="w-[800px] mb-2 text-xs text-neutral-500 text-center print:hidden">
          Edit directly in the document below. Basic formatting (Ctrl+B, Ctrl+I) is supported.
        </div>

        {/* Paper Document */}
        <div 
           id="resume-document"
           ref={editorRef}
           contentEditable={true}
           suppressContentEditableWarning={true}
           onClick={handleEditorClick}
           onBlur={handleBlur}
           dangerouslySetInnerHTML={{ __html: getHighlightedHtml() }}
           className="w-[800px] min-h-[1056px] bg-white shadow-xl rounded-sm p-12 mb-12 border border-neutral-200 outline-none focus:ring-2 focus:ring-indigo-500/20 prose prose-sm max-w-none text-neutral-800 font-serif print:shadow-none print:border-none print:m-0 print:w-full print:max-w-full"
           style={{
             '--tw-prose-headings': '#171717',
             '--tw-prose-body': '#262626',
             '--tw-prose-bold': '#171717',
           }}
        />
      </div>

      {/* RIGHT: AI Suggestion Panel */}
      <div className="w-1/3 h-full bg-white border-l border-border-subtle p-6 overflow-y-auto shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] print:hidden">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border-subtle">
          <Sparkles className="text-indigo-600" size={20} />
          <h2 className="text-lg font-bold text-text-main">AI Review</h2>
        </div>
        
        {!selectedIssue ? (
          <div className="text-center p-8 bg-neutral-50 rounded-xl border border-dashed border-border-subtle">
            {issues.length > 0 ? (
              <>
                <div className="w-12 h-12 rounded-full bg-error-100 text-error-600 flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  {issues.length}
                </div>
                <h3 className="text-text-main font-bold mb-1">Issues Detected</h3>
                <p className="text-text-muted text-sm">Click a red-highlighted text in your document to view the suggestion.</p>
              </>
            ) : (
              <p className="text-text-muted text-sm">
                Click "Review Resume Writing" to check your document for weak phrasing, vague metrics, and wordiness.
              </p>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-5">
              <h3 className="text-xs font-bold text-error-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertCircle size={14} /> Weak Writing
              </h3>
              <div className="p-3 bg-error-50 text-error-700 rounded-lg text-sm border border-error-100 line-through decoration-error-300">
                "{selectedIssue.original_text}"
              </div>
            </div>
            
            <div className="mb-5">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Why it matters</h3>
              <p className="text-sm font-medium text-text-main">{selectedIssue.problem}</p>
              <p className="text-sm text-text-muted mt-1 leading-relaxed">{selectedIssue.why}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xs font-bold text-success-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Check size={14} /> Suggested Rewrite
              </h3>
              <div className="p-4 bg-success-50 text-success-800 rounded-lg text-sm border border-success-200 font-medium leading-relaxed shadow-sm">
                {selectedIssue.rewrite}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => handleAcceptSuggestion(selectedIssue)}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Check size={16} strokeWidth={3} /> Accept
              </button>
              <button 
                onClick={() => handleIgnoreIssue(selectedIssue)}
                className="flex-1 py-2.5 bg-white border border-border-subtle hover:bg-neutral-50 text-text-main rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <X size={16} strokeWidth={3} /> Ignore
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
