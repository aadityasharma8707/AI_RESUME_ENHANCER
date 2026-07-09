import { useState, useEffect } from 'react';
import { History, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { apiService } from '../services/api';
import LoadingState from '../components/LoadingState';

export default function VerificationHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiService.getVerificationHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load history", err);
        setError("Failed to load verification history.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  const renderBadge = (outcome) => {
    if (outcome === 'Verified') {
      return (
        <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-success-700 bg-success-50 px-2 py-1 rounded-md">
          <CheckCircle2 size={14} />
          <span>Verified</span>
        </div>
      );
    }
    if (outcome === 'Needs Improvement') {
      return (
        <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-warning-700 bg-warning-50 px-2 py-1 rounded-md">
          <AlertCircle size={14} />
          <span>Needs Improvement</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center space-x-1.5 text-xs font-medium text-error-700 bg-error-50 px-2 py-1 rounded-md">
        <ShieldAlert size={14} />
        <span>Not Verified</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-app-bg pb-12 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main">Verification History</h1>
          <p className="text-text-muted mt-1">Review the results of your past skill verification assessments.</p>
        </div>
        
        {error && (
          <div className="p-4 bg-error-50 text-error-700 rounded-xl mb-8 flex items-start space-x-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {history.length === 0 ? (
          <div className="text-center py-20 bg-surface-bg rounded-3xl border border-border-subtle border-dashed shadow-sm">
            <div className="inline-flex items-center justify-center p-5 bg-brand-50 rounded-full text-brand-600 mb-4">
              <History size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-text-main">No history available</h3>
            <p className="text-text-muted mt-2 max-w-sm mx-auto mb-6">
              Your assessment history will appear here once you complete a verification.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-surface-bg p-6 rounded-2xl border border-border-subtle shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-text-main">{item.skill}</h3>
                  <p className="text-sm text-text-muted mt-1">Resume: {item.resume_filename}</p>
                  <p className="text-xs text-text-muted mt-1">
                    Completed: {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-text-muted">Total Score</p>
                    <p className="text-2xl font-bold text-text-main">{item.total_score} <span className="text-sm font-normal text-text-muted">/ 100</span></p>
                  </div>
                  <div>
                    {renderBadge(item.outcome)}
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
