
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  PawPrint, 
  MessageSquareText, 
  Settings, 
  Menu, 
  X,
  Bell,
  User,
  Search,
  Globe,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useNotifications, Toast } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../translations';
import { ApiService } from '../services/api';
import { CropData, AnimalData } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  headerExtra?: React.ReactNode;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'PAGE' | 'CROP' | 'LIVESTOCK';
  targetPage: string;
  targetId?: string;
}

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const { t } = useLanguage();
  
  // Choose Icon and Colors based on Type
  let Icon = Info;
  let bgClass = "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-100";
  
  if (toast.type === 'SUCCESS') {
      Icon = CheckCircle;
      bgClass = "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:border-emerald-700 dark:text-emerald-100";
  } else if (toast.type === 'WARNING') {
      Icon = AlertTriangle;
      bgClass = "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/50 dark:border-amber-700 dark:text-amber-100";
  } else if (toast.type === 'CRITICAL') {
      Icon = XCircle;
      bgClass = "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/50 dark:border-rose-700 dark:text-rose-100";
  }

  return (
    <div className={`w-80 p-4 rounded-xl shadow-lg border flex items-start gap-3 animate-fade-in-up transition-all ${bgClass}`}>
      <Icon size={20} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <h4 className="font-bold text-sm">{toast.title}</h4>
        <p className="text-xs mt-1 opacity-90">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, headerExtra }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  
  const { notifications, toasts, removeToast, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { language, setLanguage, t, dir } = useLanguage();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'overview', label: t('nav_overview'), icon: LayoutDashboard },
    { id: 'crops', label: t('nav_crops'), icon: Sprout },
    { id: 'livestock', label: t('nav_livestock'), icon: PawPrint },
    { id: 'ai-advisor', label: t('nav_advisor'), icon: MessageSquareText },
    { id: 'about', label: t('nav_about'), icon: Info },
    { id: 'blog', label: t('nav_blog'), icon: BookOpen },
    { id: 'settings', label: t('nav_settings'), icon: Settings },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  // Search Logic
  useEffect(() => {
    const performSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results: SearchResult[] = [];

        // 1. Search Pages
        navItems.forEach(item => {
            if (item.label.toLowerCase().includes(query)) {
                results.push({
                    id: `page-${item.id}`,
                    title: item.label,
                    subtitle: 'Navigation',
                    type: 'PAGE',
                    targetPage: item.id
                });
            }
        });

        // 2. Search Crops & Animals (Fetch from ApiService which uses local cache/DB)
        try {
            const [crops, animals] = await Promise.all([
                ApiService.getCrops(),
                ApiService.getAnimals()
            ]);

            // Filter Crops
            crops.forEach(crop => {
                if (
                    crop.name.toLowerCase().includes(query) || 
                    crop.type.toLowerCase().includes(query) ||
                    crop.fieldId.toLowerCase().includes(query)
                ) {
                    results.push({
                        id: `crop-${crop.id}`,
                        title: crop.name,
                        subtitle: `${crop.type} • ${crop.fieldId}`,
                        type: 'CROP',
                        targetPage: 'crops',
                        targetId: crop.id
                    });
                }
            });

            // Filter Animals
            animals.forEach(animal => {
                if (
                    animal.tagId.toLowerCase().includes(query) ||
                    animal.species.toLowerCase().includes(query) ||
                    (animal.breed && animal.breed.toLowerCase().includes(query))
                ) {
                    results.push({
                        id: `animal-${animal.id}`,
                        title: animal.tagId,
                        subtitle: `${animal.species} ${animal.breed ? `• ${animal.breed}` : ''}`,
                        type: 'LIVESTOCK',
                        targetPage: 'livestock',
                        targetId: animal.id
                    });
                }
            });

        } catch (e) {
            console.warn("Search fetch error", e);
        }

        setSearchResults(results);
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle click outside search results
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
              setShowResults(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
      setSearchQuery('');
      setShowResults(false);
      onNavigate(result.targetPage, { id: result.targetId });
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors" dir={dir}>
      {/* Toast Container */}
      <div className={`fixed z-50 flex flex-col gap-2 p-4 ${dir === 'rtl' ? 'bottom-4 left-4 items-start' : 'bottom-4 right-4 items-end'}`}>
        {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} z-30 w-64 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">{t('app_name')}</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left
                ${currentPage === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon size={20} className={dir === 'rtl' ? 'ml-3' : 'mr-3'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className={dir === 'rtl' ? 'mr-3' : 'ml-3'}>
              <p className="text-sm font-medium">Farm Admin</p>
              <p className="text-xs text-emerald-400">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-4 lg:px-8 relative z-20 transition-colors">
          <button 
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 ${dir === 'rtl' ? '-mr-2' : '-ml-2'}`}
          >
            <Menu size={24} />
          </button>

          {/* Search Bar - Visible on Mobile and Desktop */}
          <div className="flex items-center flex-1 mx-2 lg:mx-6 max-w-2xl gap-4">
            {headerExtra}
            <div className="flex-1 relative" ref={searchContainerRef}>
              <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`} size={18} />
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className={`w-full py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100 ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              />
              
              {/* Search Results Dropdown */}
              {showResults && searchQuery && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                      {searchResults.length > 0 ? (
                          <div className="py-2 max-h-64 overflow-y-auto">
                             {searchResults.map((result) => (
                                 <button
                                     key={result.id}
                                     onClick={() => handleResultClick(result)}
                                     className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between group transition-colors"
                                 >
                                     <div className="flex items-center gap-3 overflow-hidden">
                                         <div className={`p-2 rounded-lg flex-shrink-0 ${
                                             result.type === 'PAGE' ? 'bg-slate-100 dark:bg-slate-700 text-slate-500' :
                                             result.type === 'CROP' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                             'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                                         }`}>
                                             {result.type === 'PAGE' && <LayoutDashboard size={16} />}
                                             {result.type === 'CROP' && <Sprout size={16} />}
                                             {result.type === 'LIVESTOCK' && <PawPrint size={16} />}
                                         </div>
                                         <div className="min-w-0">
                                             <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">{result.title}</p>
                                             <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{result.subtitle}</p>
                                         </div>
                                     </div>
                                     <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                 </button>
                             ))}
                          </div>
                      ) : (
                          <div className="p-4 text-center text-slate-500 text-sm">
                              No results found for "{searchQuery}"
                          </div>
                      )}
                  </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Language Switcher */}
            <div className="relative">
                <button 
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="flex items-center gap-1 p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <Globe size={20} />
                    <span className="text-xs font-bold uppercase hidden md:inline">{language}</span>
                </button>

                {langMenuOpen && (
                    <>
                    <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
                    <div className={`absolute top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden ${dir === 'rtl' ? 'left-0' : 'right-0'}`}>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setLangMenuOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 ${language === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}
                            >
                                <span>{lang.flag}</span>
                                <span>{lang.label}</span>
                            </button>
                        ))}
                    </div>
                    </>
                )}
            </div>

            {/* Notification Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-800 animate-pulse"></span>
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className={`absolute top-full mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-20 overflow-hidden animate-fade-in ${dir === 'rtl' ? 'left-0' : 'right-0'}`}>
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                      <h3 className="font-semibold text-slate-800 dark:text-white">{t('priority_alerts')}</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                          <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50 dark:divide-slate-700">
                          {notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => markAsRead(notif.id)}
                              className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${!notif.read ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
                            >
                              <div className="flex justify-between items-start">
                                <h4 className={`text-sm font-medium mb-1 ${
                                  notif.type === 'CRITICAL' ? 'text-rose-600 dark:text-rose-400' : 
                                  notif.type === 'WARNING' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'
                                }`}>
                                  {notif.title}
                                </h4>
                                {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                {notif.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
