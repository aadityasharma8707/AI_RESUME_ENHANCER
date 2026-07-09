import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HistoryPage from './pages/HistoryPage';

import ResumeCheckLayout from './layouts/ResumeCheckLayout';
import { NotificationProvider } from './hooks/useNotifications';
import AnalysisDashboard from './pages/AnalysisDashboard';
import ResumeAnalysis from './pages/ResumeAnalysis';
import AtsScore from './pages/AtsScore';
import AiSuggestions from './pages/AiSuggestions';
import ResumeBuilderLayout from './layouts/ResumeBuilderLayout';
import MyResumes from './pages/MyResumes';
import ResumeViewer from './pages/ResumeViewer';
import BuildResume from './pages/BuildResume';
import Templates from './pages/Templates';
import SkillVerificationLayout from './layouts/SkillVerificationLayout';
import MySkills from './pages/MySkills';
import Assessments from './pages/Assessments';
import VerificationHistory from './pages/VerificationHistory';

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

          <Route path="/resume-builder" element={<ResumeBuilderLayout />}>
            <Route index element={<Navigate to="/resume-builder/my-resumes" replace />} />
            <Route path="my-resumes" element={<MyResumes />} />
            <Route path="view/:id" element={<ResumeViewer />} />
            <Route path="build" element={<BuildResume />} />
            <Route path="templates" element={<Templates />} />
          </Route>

          <Route path="/skill-verification" element={<SkillVerificationLayout />}>
            <Route index element={<Navigate to="/skill-verification/my-skills" replace />} />
            <Route path="my-skills" element={<MySkills />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="history" element={<VerificationHistory />} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
