import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HistoryPage from './pages/HistoryPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ResumeCheckLayout from './layouts/ResumeCheckLayout';
import { NotificationProvider } from './hooks/useNotifications';
import AnalysisDashboard from './pages/AnalysisDashboard';
import ResumeAnalysis from './pages/ResumeAnalysis';
import AtsScore from './pages/AtsScore';
import AiSuggestions from './pages/AiSuggestions';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/resume-check" element={<ResumeCheckLayout />}>
            <Route index element={<Navigate to="/resume-check/history" replace />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="overview" element={<AnalysisDashboard />} />
            <Route path="analysis" element={<ResumeAnalysis />} />
            <Route path="ats-score" element={<AtsScore />} />
            <Route path="ai-suggestions" element={<AiSuggestions />} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
