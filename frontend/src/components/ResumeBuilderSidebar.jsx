import { NavLink, useLocation } from 'react-router-dom';
import { 
  FolderOpen, 
  PenTool, 
  LayoutTemplate
} from 'lucide-react';

export default function ResumeBuilderSidebar() {
  const location = useLocation();
  const menuItems = [
    { name: 'My Resumes', path: '/resume-builder/my-resumes', icon: <FolderOpen size={18} /> },
    { name: 'Build Resume', path: '/resume-builder/build', icon: <PenTool size={18} /> },
    { name: 'Templates', path: '/resume-builder/templates', icon: <LayoutTemplate size={18} /> },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border-subtle bg-surface-bg min-h-[calc(100vh-112px)] hidden md:block">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            state={location.state}
            className={({ isActive }) => {
              // Custom active state logic to keep My Resumes highlighted when viewing a resume
              const isActuallyActive = isActive || (item.name === 'My Resumes' && location.pathname.includes('/view/'));
              
              return `
                flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActuallyActive 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-text-body hover:bg-app-bg hover:text-text-main'}
              `;
            }}
          >
            {({ isActive }) => {
              const isActuallyActive = isActive || (item.name === 'My Resumes' && location.pathname.includes('/view/'));
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
