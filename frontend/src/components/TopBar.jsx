import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Bell, 
  Moon, 
  Sun, 
  User, 
  PlusCircle, 
  Search, 
  Check, 
  Trash2, 
  Settings, 
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export default function TopBar({ onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications,
    removeNotification
  } = useNotifications();

  const [theme, setTheme] = useState('system');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('resulyze_theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('resulyze_theme', nextTheme);
    applyTheme(nextTheme);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
      if (userRef.current && !userRef.current.contains(event.target)) setIsUserOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewAnalysis = () => {
    navigate('/', { state: { reset: true } });
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) onSearch(query);
  };

  const formatDate = (isoString) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric'
    }).format(new Date(isoString));
  };

  const isHistoryPage = location.pathname === '/resume-check/history';

  return (
    <nav className="bg-surface-bg border-b border-border-subtle sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left side: Brand & Action */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="font-extrabold text-xl tracking-tight text-text-main flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold leading-none">R</span>
            </div>
            <span className="hidden sm:block">Resulyze</span>
          </Link>

          <button 
            onClick={handleNewAnalysis}
            className="flex items-center space-x-1 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-sm font-semibold transition-colors"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:block">New Analysis</span>
          </button>
        </div>

        {/* Middle: Search (Only on History page) */}
        {isHistoryPage && (
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-text-muted" />
              </div>
              <input 
                type="text" 
                placeholder="Search by filename, job title, or skill..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-border-input rounded-xl bg-app-bg text-sm text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => handleSearchChange({ target: { value: '' } })}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right side: Tools */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-text-muted hover:bg-app-bg rounded-lg transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 text-text-muted hover:bg-app-bg rounded-lg transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 w-2 h-2 bg-error-500 rounded-full"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-bg border border-border-subtle rounded-2xl shadow-lg overflow-hidden flex flex-col max-h-[24rem]">
                <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-app-bg">
                  <h3 className="font-semibold text-text-main">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    <button onClick={markAllAsRead} className="text-xs text-brand-600 hover:underline">Mark all read</button>
                  </div>
                </div>
                
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-text-muted">
                      No new notifications.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 border-b border-border-subtle cursor-pointer transition-colors hover:bg-app-bg relative group ${!n.read ? 'bg-brand-50/30' : ''}`}
                      >
                        <div className="flex justify-between items-start pr-6">
                          <p className={`text-sm font-medium ${!n.read ? 'text-text-main' : 'text-text-muted'}`}>{n.title}</p>
                          {!n.read && <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 flex-shrink-0"></div>}
                        </div>
                        <p className="text-xs text-text-muted mt-1 pr-6">{n.message}</p>
                        <p className="text-xs text-text-muted mt-2 opacity-70">{formatDate(n.timestamp)}</p>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(n.id);
                          }}
                          className="absolute top-4 right-4 p-1 rounded-md text-text-muted hover:text-error-600 hover:bg-error-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Clear notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-border-subtle bg-app-bg text-center">
                    <button onClick={clearNotifications} className="text-xs text-error-600 hover:underline font-medium">
                      Clear all
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Account */}
          <div className="relative" ref={userRef}>
            <button 
              onClick={() => setIsUserOpen(!isUserOpen)}
              className="p-1 border border-border-input hover:border-brand-300 rounded-full transition-colors flex items-center justify-center bg-app-bg"
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                <User size={16} />
              </div>
            </button>

            {isUserOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-bg border border-border-subtle rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-border-subtle bg-app-bg">
                  <p className="text-sm font-semibold text-text-main">Guest User</p>
                  <p className="text-xs text-text-muted mt-0.5">Not logged in</p>
                </div>
                <div className="p-2 space-y-1">
                  <button className="w-full text-left px-3 py-2 text-sm text-text-main hover:bg-app-bg rounded-lg transition-colors flex items-center space-x-2">
                    <Settings size={16} className="text-text-muted" />
                    <span>Settings</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-text-main hover:bg-app-bg rounded-lg transition-colors flex items-center space-x-2">
                    <HelpCircle size={16} className="text-text-muted" />
                    <span>Help & Support</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
