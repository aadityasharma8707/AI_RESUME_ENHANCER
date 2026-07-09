import { NavLink, useLocation } from 'react-router-dom';

export default function ProductSectionNav() {
  const location = useLocation();
  const sections = [
    { name: 'Resume Check', path: '/resume-check/overview', active: true },
    { name: 'Resume Builder', path: '/resume-builder', active: true },
    { name: 'Skill Verification', path: '/skill-verification/my-skills', active: true },
    { name: 'Learning Roadmap', path: '#', active: false },
    { name: 'Interview Prep', path: '#', active: false },
  ];

  return (
    <div className="bg-surface-bg border-b border-border-subtle overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 h-12">
          {sections.map((section, idx) => (
            <div key={idx} className="flex flex-col justify-end">
              {section.active ? (
                <NavLink
                  to={section.path}
                  state={location.state}
                  className={({ isActive }) => `
                    pb-3 text-sm font-semibold transition-colors border-b-2 
                    ${(isActive || 
                      (section.path === '/resume-check/overview' && window.location.pathname.startsWith('/resume-check')) || 
                      (section.path === '/resume-builder' && window.location.pathname.startsWith('/resume-builder')) ||
                      (section.path === '/skill-verification/my-skills' && window.location.pathname.startsWith('/skill-verification'))
                      )
                      ? 'border-brand-600 text-brand-600' 
                      : 'border-transparent text-text-muted hover:text-text-main'}
                  `}
                >
                  {section.name}
                </NavLink>
              ) : (
                <span className="pb-3 text-sm font-medium text-text-muted opacity-50 cursor-not-allowed whitespace-nowrap">
                  {section.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
