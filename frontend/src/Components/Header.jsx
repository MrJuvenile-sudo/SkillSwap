// frontend/src/Components/Header.jsx - Enhanced Responsive Dynamic Navbar
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon } from './Icon.jsx';

export function Header({ currentView, setCurrentView, openAuthModal }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const exploreTimerRef = useRef(null);

  const categories = [
    { name: 'Software & Web Dev', icon: '💻', count: '140+ mentors', filter: 'Technology' },
    { name: 'UI/UX & Graphic Design', icon: '🎨', count: '95+ mentors', filter: 'Design' },
    { name: 'Languages & Communication', icon: '🗣️', count: '80+ mentors', filter: 'Language' },
    { name: 'Music & Audio Production', icon: '🎵', count: '45+ mentors', filter: 'Music' },
    { name: 'Business, Finance & Marketing', icon: '📈', count: '60+ mentors', filter: 'Business' },
    { name: 'AI & Data Science', icon: '🤖', count: '110+ mentors', filter: 'AI' }
  ];

  const handleMouseEnterExplore = () => {
    if (exploreTimerRef.current) clearTimeout(exploreTimerRef.current);
    setExploreOpen(true);
  };

  const handleMouseLeaveExplore = () => {
    exploreTimerRef.current = setTimeout(() => {
      setExploreOpen(false);
    }, 200);
  };

  const navigateTo = (view, param = null) => {
    setMobileMenuOpen(false);
    setExploreOpen(false);
    setUserMenuOpen(false);
    setCurrentView(view);
    if (param && window.onCategorySelect) {
      window.onCategorySelect(param);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0066EE] to-[#007FFF] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-bold text-xl tracking-tighter">SX</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#0B1E36]">
                SkillSwap<span className="text-[#0066EE]">X</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-[#5C6F84]">
                Reciprocal Exchange
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {!isAuthenticated ? (
              <button
                onClick={() => navigateTo('home')}
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  currentView === 'home' ? 'text-[#0066EE] bg-blue-50' : 'text-[#5C6F84] hover:text-[#0B1E36] hover:bg-black/5'
                }`}
              >
                Home
              </button>
            ) : (
              <button
                onClick={() => navigateTo('dashboard')}
                className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  currentView === 'dashboard' ? 'text-[#0066EE] bg-blue-50' : 'text-[#5C6F84] hover:text-[#0B1E36] hover:bg-black/5'
                }`}
              >
                Dashboard
              </button>
            )}

            {/* Explore Hover Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnterExplore}
              onMouseLeave={handleMouseLeaveExplore}
            >
              <button
                onClick={() => navigateTo('skills')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  currentView === 'skills' || exploreOpen ? 'text-[#0066EE] bg-blue-50' : 'text-[#5C6F84] hover:text-[#0B1E36] hover:bg-black/5'
                }`}
              >
                <span>Explore</span>
                <Icon name="chevron-down" className={`w-4 h-4 transition-transform duration-200 ${exploreOpen ? 'rotate-180 text-[#0066EE]' : ''}`} />
              </button>

              {/* Automatic Hover Dropdown Panel */}
              {exploreOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-navy-100 p-3 animate-dropdown z-50">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#5C6F84] px-3 py-2">
                    Browse by Discipline
                  </div>
                  <div className="space-y-1">
                    {categories.map((cat, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigateTo('skills', cat.filter)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                          <div>
                            <div className="text-xs font-bold text-[#0B1E36] group-hover:text-[#0066EE]">{cat.name}</div>
                            <div className="text-[10px] text-[#5C6F84]">{cat.count}</div>
                          </div>
                        </div>
                        <Icon name="arrow-right" className="w-3.5 h-3.5 text-navy-400 group-hover:text-[#0066EE] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-navy-100 text-center">
                    <button
                      onClick={() => navigateTo('skills')}
                      className="text-xs font-bold text-[#0066EE] hover:underline"
                    >
                      View All 500+ Skills &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Exchange Hub */}
            <button
              onClick={() => navigateTo(isAuthenticated ? 'exchange' : 'home')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentView === 'exchange' ? 'text-[#0066EE] bg-blue-50' : 'text-[#5C6F84] hover:text-[#0B1E36] hover:bg-black/5'
              }`}
            >
              Exchange Hub
            </button>

            {/* Learning Hub */}
            <button
              onClick={() => navigateTo('learning')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentView === 'learning' ? 'text-[#0066EE] bg-blue-50' : 'text-[#5C6F84] hover:text-[#0B1E36] hover:bg-black/5'
              }`}
            >
              Learning Hub
            </button>

            {/* Community Feed */}
            <button
              onClick={() => navigateTo('community')}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentView === 'community' ? 'text-[#0066EE] bg-blue-50' : 'text-[#5C6F84] hover:text-[#0B1E36] hover:bg-black/5'
              }`}
            >
              Community
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Chat button */}
                <button
                  onClick={() => navigateTo('chat')}
                  className="p-2.5 text-[#5C6F84] hover:text-[#0066EE] hover:bg-blue-50 rounded-xl transition-colors relative"
                  title="Messages"
                >
                  <Icon name="chat" className="w-5 h-5" />
                </button>

                {/* Notifications badge */}
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="p-2.5 text-[#5C6F84] hover:text-[#0066EE] hover:bg-blue-50 rounded-xl transition-colors relative"
                  title="Notifications"
                >
                  <Icon name="bell" className="w-5 h-5" />
                  {user.unread_notifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                {/* User Avatar & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-navy-200/80 hover:border-[#0066EE] bg-white transition-all shadow-sm"
                  >
                    <span className="text-xs font-bold text-[#0B1E36] hidden sm:inline max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <img 
                      src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`} 
                      alt={user.name} 
                      className="w-7 h-7 rounded-lg bg-blue-100 object-cover" 
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-navy-100 p-2 z-50 animate-dropdown">
                      <div className="px-3 py-2 border-b border-navy-100">
                        <div className="text-xs font-bold text-[#0B1E36]">{user.name}</div>
                        <div className="text-[11px] text-[#5C6F84] truncate">{user.email}</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-[#0066EE] bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                          <span>✨ Karma: {user.karma_score || 100}</span>
                        </div>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => navigateTo('dashboard')}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-[#0B1E36] hover:bg-blue-50 rounded-lg"
                        >
                          My Dashboard
                        </button>
                        <button
                          onClick={() => navigateTo('exchange')}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-[#0B1E36] hover:bg-blue-50 rounded-lg"
                        >
                          My Swaps & Requests
                        </button>
                        {user.role === 'ADMIN' && (
                          <button
                            onClick={() => navigateTo('admin')}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-lg flex items-center justify-between"
                          >
                            <span>Admin Portal</span>
                            <Icon name="shield" className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-sm font-semibold text-[#0B1E36] hover:text-[#0066EE] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#0066EE] to-[#007FFF] hover:from-[#0052CC] hover:to-[#0066EE] rounded-xl shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#5C6F84] hover:text-[#0B1E36] rounded-xl"
            >
              <Icon name={mobileMenuOpen ? 'close' : 'menu'} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-navy-100 bg-[#FAF6EF] animate-dropdown">
            <div className="space-y-1 px-2">
              <button
                onClick={() => navigateTo(isAuthenticated ? 'dashboard' : 'home')}
                className="w-full text-left px-3 py-2.5 text-sm font-bold text-[#0B1E36] hover:bg-blue-50 rounded-xl"
              >
                {isAuthenticated ? 'Dashboard' : 'Home'}
              </button>
              <button
                onClick={() => navigateTo('skills')}
                className="w-full text-left px-3 py-2.5 text-sm font-bold text-[#0B1E36] hover:bg-blue-50 rounded-xl"
              >
                Explore Skills
              </button>
              <button
                onClick={() => navigateTo(isAuthenticated ? 'exchange' : 'home')}
                className="w-full text-left px-3 py-2.5 text-sm font-bold text-[#0B1E36] hover:bg-blue-50 rounded-xl"
              >
                Exchange Hub
              </button>
              <button
                onClick={() => navigateTo('learning')}
                className="w-full text-left px-3 py-2.5 text-sm font-bold text-[#0B1E36] hover:bg-blue-50 rounded-xl"
              >
                Learning Hub
              </button>
              <button
                onClick={() => navigateTo('community')}
                className="w-full text-left px-3 py-2.5 text-sm font-bold text-[#0B1E36] hover:bg-blue-50 rounded-xl"
              >
                Community
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => navigateTo('chat')}
                  className="w-full text-left px-3 py-2.5 text-sm font-bold text-[#0066EE] hover:bg-blue-50 rounded-xl"
                >
                  Messages & Chat
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
