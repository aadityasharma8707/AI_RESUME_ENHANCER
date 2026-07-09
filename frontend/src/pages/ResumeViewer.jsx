import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ResumeViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfObjectUrl, setPdfObjectUrl] = useState(null);

  useEffect(() => {
    fetchMetadataAndFile();
    return () => {
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl);
      }
    };
  }, [id]);

  const fetchMetadataAndFile = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getResumeDocument(id);
      setMetadata(data);
      
      const fileUrl = apiService.getResumeFileUrl(id);
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch PDF file');
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPdfObjectUrl(objectUrl);
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load resume details. It may have been deleted.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const downloadUrl = apiService.getResumeDownloadUrl(id);

  return (
    <div className="h-full flex flex-col bg-surface-bg">
      {/* Header bar */}
      <div className="h-14 border-b border-border-subtle flex items-center px-4 justify-between bg-app-bg shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/resume-builder/my-resumes')}
            className="p-2 -ml-2 text-text-muted hover:text-text-main hover:bg-surface-bg rounded-lg transition-colors flex items-center space-x-1"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="h-6 w-px bg-border-subtle mx-2"></div>
          
          {metadata ? (
            <div>
              <h2 className="font-bold text-text-main text-sm truncate max-w-md">
                {metadata.display_name}
              </h2>
            </div>
          ) : (
            <div className="h-4 w-32 bg-border-subtle rounded animate-pulse"></div>
          )}
        </div>
        
        {metadata && (
          <div className="flex items-center space-x-4">
            {numPages && numPages > 1 && (
              <div className="flex items-center space-x-2 text-sm text-text-muted">
                <button 
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                  className="p-1 hover:bg-neutral-200 rounded disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span>{pageNumber} of {numPages}</span>
                <button 
                  onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                  disabled={pageNumber >= numPages}
                  className="p-1 hover:bg-neutral-200 rounded disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            <a
              href={downloadUrl}
              download
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-bg border border-border-subtle hover:bg-neutral-100 rounded-lg text-sm font-medium text-text-main transition-colors shadow-sm"
            >
              <Download size={16} />
              <span>Download</span>
            </a>
          </div>
        )}
      </div>

      {/* Viewer Area */}
      <div className="flex-1 bg-neutral-900 relative overflow-y-auto flex justify-center p-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center text-white/70 space-y-4 my-auto">
            <Loader2 className="animate-spin" size={32} />
            <p>Loading document...</p>
          </div>
        ) : error ? (
          <div className="bg-neutral-800 text-white p-6 rounded-2xl max-w-md text-center border border-neutral-700 my-auto">
            <AlertCircle size={40} className="mx-auto text-error-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Document Unavailable</h3>
            <p className="text-neutral-400 text-sm mb-6">{error}</p>
            <button 
              onClick={() => navigate('/resume-builder/my-resumes')}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-sm font-medium transition-colors"
            >
              Return to Library
            </button>
          </div>
        ) : (
          <div className="shadow-2xl rounded-lg overflow-hidden flex flex-col bg-white w-fit mx-auto h-fit">
            {pdfObjectUrl && (
              <Document
                file={pdfObjectUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="w-[600px] h-[800px] flex items-center justify-center text-neutral-400">
                    <Loader2 className="animate-spin" size={32} />
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  width={800}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
