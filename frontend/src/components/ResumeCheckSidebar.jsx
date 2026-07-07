import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSearch, 
  CheckSquare, 
  Type, 
  ListTree, 
  AlertTriangle, 
  Lightbulb, 
  GitCompare, 
  History 
} from 'lucide-react';

export default function ResumeCheckSidebar() {
  const location = useLocation();
  const menuItems = [
    { name: 'Overview', path: '/resume-check/overview', icon: <LayoutDashboard size={18} /> },
    { name: 'Resume Analysis', path: '/resume-check/analysis', icon: <FileSearch size={18} /> },
    { name: 'ATS Score', path: '/resume-check/ats-score', icon: <CheckSquare size={18} /> },
    { name: 'AI Suggestions', path: '/resume-check/ai-suggestions', icon: <Lightbulb size={18} /> },
    { name: 'History', path: '/resume-check/history', icon: <History size={18} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border-subtle bg-surface-bg min-h-[calc(100vh-112px)] hidden md:block">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            state={location.state}
            className={({ isActive }) => `
              flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-brand-50 text-brand-700' 
                : 'text-text-body hover:bg-app-bg hover:text-text-main'}
            `}
          >
            <span className={({ isActive }) => isActive ? 'text-brand-600' : 'text-text-muted'}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
