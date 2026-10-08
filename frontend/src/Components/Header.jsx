// frontend/src/Components/Header.jsx - Enhanced Responsive Dynamic Navbar with Spotlight Search
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Icon } from './Icon.jsx';

export function Header({ currentView, setCurrentView, openAuthModal, onProposeSwap }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const exploreTimerRef = useRef(null);

  // Spotlight Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ skills: [], peers: [], circles: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);

  const categories = [
    { name: 'Software & Web Dev', icon: '💻', count: '140+ mentors', filter: 'Technology' },
    { name: 'UI/UX & Graphic Design', icon: '🎨', count: '95+ mentors', filter: 'Design' },
    { name: 'Languages & Communication', icon: '🗣️', count: '80+ mentors', filter: 'Language' },
    { name: 'Music & Audio Production', icon: '🎵', count: '45+ mentors', filter: 'Music' },
    { name: 'Business, Finance & Marketing', icon: '📈', count: '60+ mentors', filter: 'Business' },
    { name: 'AI & Data Science', icon: '🤖', count: '110+ mentors', filter: 'AI' }
  ];

  const POPULAR_SKILLS = [
    { name: 'React & Frontend Engineering', category: 'Technology', mentors: 142, icon: '💻', highlight: '98% Match Rate' },
    { name: 'Figma & UI/UX Product Design', category: 'Design', mentors: 118, icon: '🎨', highlight: 'High Demand' },
    { name: 'Python, ML & Generative AI', category: 'AI', mentors: 165, icon: '🤖', highlight: 'Top Barter' },
    { name: 'Spoken English & Communication', category: 'Language', mentors: 94, icon: '🗣️', highlight: 'Fast Trade' },
    { name: 'Node.js & Backend Architecture', category: 'Technology', mentors: 120, icon: '⚡', highlight: 'Verified' },
    { name: 'Docker, DevOps & AWS Cloud', category: 'Technology', mentors: 86, icon: '☁️', highlight: 'Industry Grade' },
    { name: 'Guitar & Music Production', category: 'Music', mentors: 52, icon: '🎵', highlight: 'Creative' },
    { name: 'Financial Modeling & Valuation', category: 'Business', mentors: 64, icon: '📈', highlight: 'Entrepreneurial' }
  ];

  // Execute Spotlight Search
  const executeSearch = async (q) => {
    const trimmed = (q || '').trim().toLowerCase();
    setSearchLoading(true);

    if (!trimmed) {
      try {
        const res = await api.getPeerRecommendations();
        setSearchResults({
          skills: POPULAR_SKILLS.slice(0, 4),
          peers: (res.peers || []).slice(0, 4),
          circles: []
        });
      } catch (e) {
        setSearchResults({ skills: POPULAR_SKILLS.slice(0, 4), peers: [], circles: [] });
      } finally {
        setSearchLoading(false);
      }
      return;
    }

    const matchedSkills = POPULAR_SKILLS.filter(s =>
      s.name.toLowerCase().includes(trimmed) || s.category.toLowerCase().includes(trimmed)
    );

    try {
      const [usersData, circlesData] = await Promise.all([
        api.getUsers(`search=${encodeURIComponent(trimmed)}`).catch(() => ({ users: [] })),
        api.getCircles().catch(() => ({ circles: [] }))
      ]);

      const matchedCircles = (circlesData.circles || []).filter(c =>
        (c.name || '').toLowerCase().includes(trimmed) || (c.description || '').toLowerCase().includes(trimmed)
      );

      setSearchResults({
        skills: matchedSkills,
        peers: (usersData.users || []).slice(0, 6),
        circles: matchedCircles.slice(0, 4)
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInput = (val) => {
    setSearchQuery(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      executeSearch(val);
    }, 140);
  };

  useEffect(() => {
    if (searchOpen) {
      if (searchInputRef.current) {
        setTimeout(() => searchInputRef.current.focus(), 60);
      }
      executeSearch(searchQuery);
    }
  }, [searchOpen]);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K and ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setExploreOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    setSearchOpen(false);
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
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
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

          {/* Right Action Area with Enhanced Search Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Desktop Spotlight Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#FAF6EF] hover:bg-white border border-navy-200/90 hover:border-[#0066EE] text-[#5C6F84] hover:text-[#0B1E36] shadow-sm transition-all duration-200 group w-44 lg:w-56 xl:w-68 text-left select-none"
              title="Search skills, verified mentors & study circles (Ctrl + K)"
            >
              <span className="text-[#0066EE] group-hover:scale-110 transition-transform">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <span className="text-xs font-medium text-[#5C6F84] group-hover:text-[#0B1E36] truncate flex-1">
                Search 500+ skills to swap...
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9.5px] font-mono font-bold bg-white text-[#0B1E36] rounded-md border border-navy-200 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-xl text-[#5C6F84] hover:text-[#0B1E36] hover:bg-blue-50 transition-all"
              title="Search Skills"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

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
                  Join Free
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
                onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
                className="w-full text-left px-3 py-2.5 text-sm font-bold text-[#0066EE] bg-blue-50/80 hover:bg-blue-100 rounded-xl flex items-center justify-between"
              >
                <span>🔍 Search 500+ Skills</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white text-[#0066EE] rounded-md border border-blue-200">⌘K</span>
              </button>
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

      {/* Spotlight Command Palette Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          {/* Frosted Glass Backdrop */}
          <div
            className="fixed inset-0 bg-[#061324]/75 backdrop-blur-md transition-opacity animate-fadeIn"
            onClick={() => setSearchOpen(false)}
          />

          <div className="flex min-h-full items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-navy-100 overflow-hidden animate-dropdown text-left ring-1 ring-black/5">
              
              {/* Search Input Bar */}
              <div className="p-4 sm:p-5 border-b border-navy-100 bg-[#FAF6EF]/60 flex items-center gap-3">
                <span className="text-[#0066EE] animate-pulse">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search any skill to learn or trade (e.g. React, Python, UI/UX, Spanish)..."
                  value={searchQuery}
                  onChange={e => handleSearchInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      setSearchOpen(false);
                      navigateTo('skills');
                    }
                    if (e.key === 'Escape') setSearchOpen(false);
                  }}
                  className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-[#0B1E36] placeholder:text-[#5C6F84]/70 placeholder:font-normal focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchInput('')}
                    className="p-1 rounded-lg hover:bg-navy-100 text-[#5C6F84] hover:text-[#0B1E36] transition-colors"
                    title="Clear search"
                  >
                    <Icon name="close" className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setSearchOpen(false)}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-cream-100 rounded-lg border border-navy-200 text-[10px] font-bold text-[#5C6F84] shadow-2xs transition-colors"
                >
                  <span>ESC</span>
                </button>
              </div>

              {/* Psychological Motivational Banner */}
              <div className="px-5 py-3 bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-emerald-50/70 border-b border-navy-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#0066EE] uppercase tracking-wider flex items-center gap-1">
                    <span>✨</span>
                    <span>100% Reciprocal Barter Economy</span>
                  </span>
                  <span className="text-[10px] text-[#5C6F84] hidden sm:inline">• Trade knowledge, zero money</span>
                </div>
                <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200/80">
                  ⚡ 4.9/5 Reciprocity Score
                </span>
              </div>

              {/* Trending / Suggested Filter Chips */}
              <div className="px-5 py-2.5 bg-[#FAF6EF]/40 border-b border-navy-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
                <span className="font-bold text-[#5C6F84] shrink-0 mr-1 flex items-center gap-1">
                  <span>🔥</span>
                  <span>Trending:</span>
                </span>
                {['React', 'Figma & UX', 'Python AI', 'Spoken English', 'System Design', 'Music'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSearchInput(tag)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-[#0066EE] hover:border-[#0066EE] border border-navy-200 text-[#0B1E36] font-semibold transition-all shrink-0 active:scale-95 shadow-2xs"
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Search Results Stream */}
              <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-6">
                
                {searchLoading && (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-7 h-7 border-2 border-[#0066EE] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-medium text-[#5C6F84]">Searching 500+ verified barter skills and active mentors across India...</p>
                  </div>
                )}

                {!searchLoading && searchResults.skills.length === 0 && searchResults.peers.length === 0 && searchResults.circles.length === 0 && (
                  <div className="py-10 px-4 text-center max-w-md mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl shadow-xs">
                      💡
                    </div>
                    <h4 className="text-sm font-bold text-[#0B1E36]">Looking for "{searchQuery}"?</h4>
                    <p className="text-xs text-[#5C6F84] leading-relaxed">
                      Nobody has registered this exact barter yet — you could be the pioneer! Propose it to our community or explore 120+ active categories.
                    </p>
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigateTo('community')}
                        className="px-3.5 py-2 bg-[#0066EE] hover:bg-[#0052CC] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                      >
                        Post in Community
                      </button>
                      <button
                        onClick={() => navigateTo('skills')}
                        className="px-3.5 py-2 bg-cream-100 hover:bg-cream-200 text-[#0B1E36] font-bold text-xs rounded-xl border border-navy-200 transition-all"
                      >
                        Browse All Categories
                      </button>
                    </div>
                  </div>
                )}

                {/* 1. Matching Skills Section */}
                {!searchLoading && searchResults.skills.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5C6F84] flex items-center gap-1.5">
                        <span>📚</span>
                        <span>Skills & Disciplines</span>
                      </h4>
                      <button
                        onClick={() => navigateTo('skills')}
                        className="text-[11px] font-bold text-[#0066EE] hover:underline"
                      >
                        View Directory &rarr;
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.skills.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => navigateTo('skills')}
                          className="p-3 rounded-2xl bg-[#FAF6EF]/70 hover:bg-blue-50/70 border border-navy-200 hover:border-blue-300 cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl group-hover:scale-110 transition-transform">{s.icon || '🎯'}</span>
                            <div>
                              <div className="text-xs font-bold text-[#0B1E36] group-hover:text-[#0066EE]">{s.name}</div>
                              <div className="text-[10px] text-[#5C6F84]">{s.mentors || 20}+ active mentors</div>
                            </div>
                          </div>
                          <span className="text-[9.5px] font-bold text-[#0066EE] bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                            {s.highlight || 'Tradeable'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Matching Mentors / Peers Section */}
                {!searchLoading && searchResults.peers.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5C6F84] flex items-center gap-1.5">
                        <span>👥</span>
                        <span>Verified Mentors Ready to Barter</span>
                      </h4>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Instant Reciprocal Matches
                      </span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.peers.map((peer, idx) => (
                        <div
                          key={peer.id || idx}
                          className="p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-cream-50 border border-navy-200 hover:border-navy-300 shadow-2xs hover:shadow transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={peer.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(peer.name)}`}
                              alt={peer.name}
                              className="w-11 h-11 rounded-2xl object-cover bg-blue-50 border border-blue-100 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs sm:text-sm font-bold text-[#0B1E36] truncate">{peer.name}</h5>
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200">
                                  ★ 4.9
                                </span>
                              </div>
                              <p className="text-[11px] text-[#5C6F84] truncate">{peer.headline || 'SkillSwap Member'}</p>
                              {peer.location && (
                                <p className="text-[10px] text-[#5C6F84]/80 mt-0.5">📍 {peer.location}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => {
                                setSearchOpen(false);
                                if (onProposeSwap) {
                                  onProposeSwap(peer);
                                } else {
                                  navigateTo('skills');
                                }
                              }}
                              className="px-3.5 py-1.5 bg-[#0B1E36] hover:bg-[#0066EE] text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow"
                            >
                              Propose Swap &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Skill Circles Section */}
                {!searchLoading && searchResults.circles.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5C6F84] flex items-center gap-1.5">
                        <span>⭕</span>
                        <span>Study Circles & Cohorts</span>
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {searchResults.circles.map((c, idx) => (
                        <div
                          key={c.id || idx}
                          onClick={() => navigateTo('learning')}
                          className="p-3 rounded-2xl bg-[#FAF6EF]/70 hover:bg-blue-50/70 border border-navy-200 hover:border-blue-300 cursor-pointer transition-all"
                        >
                          <div className="text-xs font-bold text-[#0B1E36] truncate">{c.name}</div>
                          <div className="text-[10px] text-[#5C6F84] line-clamp-1 mt-0.5">{c.description || 'Group peer cohort'}</div>
                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            <span className="text-[#0066EE] font-bold">👥 {c.member_count || 1} members</span>
                            <span className="text-emerald-700 font-bold">Join Circle &rarr;</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Spotlight Footer Guidance */}
              <div className="p-3 sm:p-4 bg-[#FAF6EF]/80 border-t border-navy-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5C6F84]">
                <div className="flex items-center gap-3">
                  <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-navy-200 rounded font-mono font-bold text-[9px] text-[#0B1E36]">↵ Enter</kbd> to search all</span>
                  <span><kbd className="px-1.5 py-0.5 bg-white border border-navy-200 rounded font-mono font-bold text-[9px] text-[#0B1E36]">ESC</kbd> to exit</span>
                </div>
                <div className="text-[#0066EE] font-bold flex items-center gap-1">
                  <span>🛡️ Escrow Verified Reciprocal Exchange</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </header>
  );
}
