import { NavLink, useLocation } from 'react-router-dom';
import { 
  Award,
  ClipboardList,
  History
} from 'lucide-react';

export default function SkillVerificationSidebar() {
  const location = useLocation();
  const menuItems = [
    { name: 'My Skills', path: '/skill-verification/my-skills', icon: <Award size={18} /> },
    { name: 'Assessments', path: '/skill-verification/assessments', icon: <ClipboardList size={18} /> },
    { name: 'Verification History', path: '/skill-verification/history', icon: <History size={18} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border-subtle bg-surface-bg min-h-[calc(100vh-112px)] hidden md:block">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => {
              const isActuallyActive = isActive;
              
              return `
                flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActuallyActive 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-text-body hover:bg-app-bg hover:text-text-main'}
              `;
            }}
          >
            {({ isActive }) => {
              const isActuallyActive = isActive;
              return (
                <>
                  <span className={isActuallyActive ? 'text-brand-600' : 'text-text-muted'}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
