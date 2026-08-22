// public/app.js - SkillSwap Frontend Single-Page Application (React + HTM)
(function() {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const htm = window.htm || self.htm;

  if (!React || !ReactDOM || !htm) {
    console.error('React or HTM failed to load.');
    return;
  }

  const { useState, useEffect, useRef } = React;
  const html = htm.bind(React.createElement);

  // SVG Icon Component
  function Icon({ name, class: className = "w-5 h-5" }) {
    const icons = {
      'repeat': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,
      'sparkles': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
      'compass': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
      'arrow-left-right': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>`,
      'arrow-right': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
      'arrow-left': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
      'layout-grid': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
      'message-square': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      'layers': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5"/></svg>`,
      'users': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      'bell': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
      'bell-off': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`,
      'star': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'map-pin': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
      'clock': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      'search': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
      'search-x': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="m8 8 6 6"/><path d="m14 8-6 6"/></svg>`,
      'filter': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
      'shield': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
      'shield-alert': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
      'check-circle-2': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
      'check-check': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>`,
      'circle': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>`,
      'check-square': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      'square': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`,
      'send': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
      'x': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
      'plus': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
      'plus-circle': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
      'edit-3': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
      'trash-2': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
      'activity': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
      'zap': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
      'chevron-down': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
      'chevron-up': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>`,
      'refresh-cw': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>`,
      'loader': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></svg>`,
      'user': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      'user-plus': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>`,
      'award': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
      'log-out': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
      'code': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      'image': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
      'info': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
      'help-circle': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
      'book-open': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
      'target': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
      'globe': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      'flag': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
      'inbox': html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`
    };
    return icons[name] || html`<svg class=${className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8"/></svg>`;
  }

  // Global API Fetch helper
  async function api(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const res = await fetch(path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // ----------------------------------------------------
  // Navigation Header Component
  // ----------------------------------------------------
  function Header({ user, demoUsers, activeTab, setActiveTab, unreadCount, pendingRequestsCount, onSwitchUser, onOpenRegister, onLogout }) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showDemoMenu, setShowDemoMenu] = useState(false);

    return html`
      <header class="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-cream-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-20">
            
            <div class="flex items-center space-x-8">
              <button onClick=${() => setActiveTab('home')} class="flex items-center space-x-3 group focus:outline-none">
                <div class="w-11 h-11 rounded-2xl bg-navy-700 text-cream-100 flex items-center justify-center shadow-md group-hover:bg-navy-800 transition-colors">
                  <${Icon} name="repeat" class="w-6 h-6 text-cream-200" />
                </div>
                <div class="text-left">
                  <span class="font-serif text-2xl font-bold tracking-tight text-navy-900 block leading-none">SkillSwap</span>
                  <span class="text-[10px] tracking-widest uppercase font-semibold text-warmgray-500 mt-1 block">Reciprocal Exchange</span>
                </div>
              </button>

              <nav class="hidden md:flex items-center space-x-1 lg:space-x-2">
                <button onClick=${() => setActiveTab('matches')} 
                  class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'matches' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                  <span class="flex items-center space-x-2">
                    <${Icon} name="sparkles" class="w-4 h-4 text-amber-500" />
                    <span>Matches</span>
                  </span>
                </button>
                
                <button onClick=${() => setActiveTab('search')} 
                  class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'search' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                  <span class="flex items-center space-x-2">
                    <${Icon} name="compass" class="w-4 h-4" />
                    <span>Explore</span>
                  </span>
                </button>

                <button onClick=${() => setActiveTab('requests')} 
                  class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all relative ${activeTab === 'requests' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                  <span class="flex items-center space-x-2">
                    <${Icon} name="arrow-left-right" class="w-4 h-4" />
                    <span>Requests</span>
                    ${pendingRequestsCount > 0 && html`
                      <span class="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-amber-600 rounded-full">${pendingRequestsCount}</span>
                    `}
                  </span>
                </button>

                <button onClick=${() => setActiveTab('workspaces')} 
                  class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'workspaces' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                  <span class="flex items-center space-x-2">
                    <${Icon} name="layout-grid" class="w-4 h-4" />
                    <span>Workspaces</span>
                  </span>
                </button>

                <button onClick=${() => setActiveTab('chat')} 
                  class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'chat' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                  <span class="flex items-center space-x-2">
                    <${Icon} name="message-square" class="w-4 h-4" />
                    <span>Messages</span>
                  </span>
                </button>

                <button onClick=${() => setActiveTab('skills')} 
                  class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'skills' ? 'bg-navy-700 text-white shadow-sm' : 'text-warmgray-700 hover:text-navy-900 hover:bg-cream-200'}">
                  <span class="flex items-center space-x-2">
                    <${Icon} name="layers" class="w-4 h-4" />
                    <span>My Skills</span>
                  </span>
                </button>

                ${user?.role === 'ADMIN' && html`
                  <button onClick=${() => setActiveTab('admin')} 
                    class="px-3 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'admin' ? 'bg-red-700 text-white' : 'text-red-700 hover:bg-red-50'}">
                    <span class="flex items-center space-x-1.5">
                      <${Icon} name="shield-alert" class="w-4 h-4" />
                      <span>Admin</span>
                    </span>
                  </button>
                `}
              </nav>
            </div>

            <div class="flex items-center space-x-3">
              <div class="relative">
                <button onClick=${() => setShowDemoMenu(!showDemoMenu)}
                  class="flex items-center space-x-2 px-3 py-2 rounded-xl bg-cream-200/80 hover:bg-cream-300 border border-cream-400 text-xs font-semibold text-navy-900 transition-colors shadow-sm">
                  <${Icon} name="users" class="w-3.5 h-3.5 text-navy-700" />
                  <span class="hidden sm:inline">Persona:</span>
                  <span class="font-bold text-navy-900 truncate max-w-[100px]">${user?.name?.split(' ')[0] || 'Alice'}</span>
                  <${Icon} name="chevron-down" class="w-3 h-3 text-warmgray-500" />
                </button>

                ${showDemoMenu && html`
                  <div class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-cream-300 py-2 z-50 animate-in fade-in">
                    <div class="px-4 py-2 border-b border-cream-200 text-left">
                      <p class="text-xs font-bold text-navy-900 uppercase tracking-wider">Switch Persona</p>
                      <p class="text-[11px] text-warmgray-500 mt-0.5">Explore reciprocal matching from any peer's perspective</p>
                    </div>
                    <div class="max-h-72 overflow-y-auto py-1">
                      ${demoUsers.map(u => html`
                        <button key=${u.id} onClick=${() => { onSwitchUser(u.id); setShowDemoMenu(false); }}
                          class="w-full text-left px-4 py-2.5 hover:bg-cream-100 flex items-center space-x-3 transition-colors ${user?.id === u.id ? 'bg-cream-200/60 font-semibold' : ''}">
                          <img src=${u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.id} class="w-8 h-8 rounded-full border border-cream-300 object-cover" />
                          <div class="flex-1 min-w-0">
                            <p class="text-sm text-navy-900 truncate font-medium flex items-center justify-between">
                              <span>${u.name}</span>
                              ${u.role === 'ADMIN' && html`<span class="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">ADMIN</span>`}
                            </p>
                            <p class="text-[11px] text-warmgray-500 truncate">${u.headline || u.email}</p>
                          </div>
                        </button>
                      `)}
                    </div>
                    <div class="p-2 border-t border-cream-200">
                      <button onClick=${() => { onOpenRegister(); setShowDemoMenu(false); }}
                        class="w-full text-center py-2 px-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors">
                        <${Icon} name="user-plus" class="w-3.5 h-3.5" />
                        <span>Register New Custom Member</span>
                      </button>
                    </div>
                  </div>
                `}
              </div>

              <button onClick=${() => setActiveTab('notifications')}
                class="relative p-2.5 rounded-xl bg-cream-200/60 hover:bg-cream-300 text-navy-900 transition-colors">
                <${Icon} name="bell" class="w-5 h-5" />
                ${unreadCount > 0 && html`
                  <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-cream-100"></span>
                `}
              </button>

              <div class="relative">
                <button onClick=${() => setShowUserMenu(!showUserMenu)}
                  class="flex items-center space-x-2 p-1.5 rounded-2xl hover:bg-cream-200 border border-cream-300 transition-all">
                  <img src=${user?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + (user?.id || 'alice')}
                    class="w-8 h-8 rounded-xl object-cover border border-cream-400" />
                  <span class="hidden xl:inline text-xs font-bold text-navy-900 pr-1">${user?.name?.split(' ')[0] || 'Alice'}</span>
                </button>

                ${showUserMenu && html`
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-cream-300 py-2 z-50 text-left">
                    <div class="px-4 py-2.5 border-b border-cream-200">
                      <p class="text-sm font-bold text-navy-900 truncate">${user?.name || 'Alice Chen'}</p>
                      <p class="text-xs text-warmgray-500 truncate">${user?.email || 'alice@skillswap.io'}</p>
                    </div>
                    <button onClick=${() => { setActiveTab('profile'); setShowUserMenu(false); }}
                      class="w-full text-left px-4 py-2.5 text-sm text-navy-900 hover:bg-cream-100 flex items-center space-x-2.5">
                      <${Icon} name="user" class="w-4 h-4 text-warmgray-500" />
                      <span>View Public Profile</span>
                    </button>
                    <button onClick=${() => { setActiveTab('skills'); setShowUserMenu(false); }}
                      class="w-full text-left px-4 py-2.5 text-sm text-navy-900 hover:bg-cream-100 flex items-center space-x-2.5">
                      <${Icon} name="award" class="w-4 h-4 text-warmgray-500" />
                      <span>Manage Skills</span>
                    </button>
                    <div class="border-t border-cream-200 my-1"></div>
                    <button onClick=${() => { onLogout(); setShowUserMenu(false); }}
                      class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2.5">
                      <${Icon} name="log-out" class="w-4 h-4" />
                      <span>Reset Session</span>
                    </button>
                  </div>
                `}
              </div>

            </div>
          </div>
        </div>

        <div class="md:hidden flex items-center justify-around border-t border-cream-300 py-2 bg-cream-100 px-2 overflow-x-auto">
          <button onClick=${() => setActiveTab('matches')} class="px-2.5 py-1.5 text-xs font-semibold rounded-lg flex flex-col items-center ${activeTab === 'matches' ? 'text-navy-800 bg-cream-300' : 'text-warmgray-600'}">
            <${Icon} name="sparkles" class="w-4 h-4" />
            <span>Matches</span>
          </button>
          <button onClick=${() => setActiveTab('search')} class="px-2.5 py-1.5 text-xs font-semibold rounded-lg flex flex-col items-center ${activeTab === 'search' ? 'text-navy-800 bg-cream-300' : 'text-warmgray-600'}">
            <${Icon} name="compass" class="w-4 h-4" />
            <span>Explore</span>
          </button>
          <button onClick=${() => setActiveTab('requests')} class="px-2.5 py-1.5 text-xs font-semibold rounded-lg flex flex-col items-center relative ${activeTab === 'requests' ? 'text-navy-800 bg-cream-300' : 'text-warmgray-600'}">
            <${Icon} name="arrow-left-right" class="w-4 h-4" />
            <span>Requests</span>
          </button>
          <button onClick=${() => setActiveTab('workspaces')} class="px-2.5 py-1.5 text-xs font-semibold rounded-lg flex flex-col items-center ${activeTab === 'workspaces' ? 'text-navy-800 bg-cream-300' : 'text-warmgray-600'}">
            <${Icon} name="layout-grid" class="w-4 h-4" />
            <span>Workspaces</span>
          </button>
          <button onClick=${() => setActiveTab('chat')} class="px-2.5 py-1.5 text-xs font-semibold rounded-lg flex flex-col items-center ${activeTab === 'chat' ? 'text-navy-800 bg-cream-300' : 'text-warmgray-600'}">
            <${Icon} name="message-square" class="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>
      </header>
    `;
  }

  // ----------------------------------------------------
  // Home View Component
  // ----------------------------------------------------
  function HomeView({ setActiveTab, user, onOpenRegister }) {
    return html`
      <div class="space-y-16 pb-20">
        <div class="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-cream-300 bg-gradient-to-b from-cream-50 via-cream-100 to-cream-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div class="lg:col-span-7 space-y-6 text-left">
                <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-navy-50 border border-navy-200 text-navy-800 text-xs font-bold tracking-wide">
                  <${Icon} name="sparkles" class="w-3.5 h-3.5 text-amber-500" />
                  <span>Peer-to-Peer Reciprocal Skill Exchange</span>
                </div>

                <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-navy-900 leading-[1.15]">
                  Trade what you know for what you <span class="italic font-normal text-navy-700 underline decoration-amber-400 decoration-wavy decoration-2">want to master</span>.
                </h1>

                <p class="text-lg text-warmgray-600 max-w-2xl leading-relaxed">
                  SkillSwap pairs teachers and learners through intelligent reciprocal matching. No money exchanged—just mutual learning, structured shared workspaces, and verified trust.
                </p>

                <div class="flex flex-wrap gap-4 pt-2">
                  <button onClick=${() => setActiveTab('matches')}
                    class="px-7 py-3.5 rounded-2xl bg-navy-700 hover:bg-navy-800 text-white font-semibold text-base shadow-boutique hover:shadow-lg transition-all flex items-center space-x-2.5">
                    <${Icon} name="zap" class="w-5 h-5 text-amber-300" />
                    <span>Find My Reciprocal Matches</span>
                  </button>

                  <button onClick=${() => setActiveTab('search')}
                    class="px-6 py-3.5 rounded-2xl bg-white hover:bg-cream-50 text-navy-900 border border-cream-400 font-semibold text-base shadow-sm transition-all flex items-center space-x-2">
                    <${Icon} name="search" class="w-5 h-5 text-warmgray-500" />
                    <span>Explore Skills Catalog</span>
                  </button>
                </div>

                <div class="pt-6 grid grid-cols-3 gap-4 border-t border-cream-300/80 text-left">
                  <div>
                    <p class="font-serif text-2xl font-bold text-navy-900">100%</p>
                    <p class="text-xs text-warmgray-500 font-medium">Reciprocal & Free</p>
                  </div>
                  <div>
                    <p class="font-serif text-2xl font-bold text-navy-900">6-Factor</p>
                    <p class="text-xs text-warmgray-500 font-medium">Synergy Scorer</p>
                  </div>
                  <div>
                    <p class="font-serif text-2xl font-bold text-navy-900">Collaborative</p>
                    <p class="text-xs text-warmgray-500 font-medium">Shared Workspaces</p>
                  </div>
                </div>
              </div>

              <!-- Interactive Matching Card Mockup -->
              <div class="lg:col-span-5">
                <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-boutique border border-cream-300 relative space-y-6">
                  <div class="flex items-center justify-between border-b border-cream-200 pb-4">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
                        <${Icon} name="check-check" class="w-5 h-5" />
                      </div>
                      <div class="text-left">
                        <p class="text-xs uppercase tracking-wider font-bold text-warmgray-500">Reciprocal Match</p>
                        <h4 class="font-serif font-bold text-lg text-navy-900">Alice ⇄ Bob</h4>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">100% Synergy</span>
                    </div>
                  </div>

                  <div class="space-y-3 text-sm">
                    <div class="p-3.5 bg-cream-100 rounded-2xl flex items-center justify-between">
                      <div class="text-left">
                        <span class="text-xs text-warmgray-500 font-medium block">Alice Teaches Bob</span>
                        <span class="font-bold text-navy-900 flex items-center space-x-1.5">
                          <${Icon} name="code" class="w-4 h-4 text-navy-700" />
                          <span>Python (Expert)</span>
                        </span>
                      </div>
                      <${Icon} name="arrow-right" class="w-5 h-5 text-navy-600" />
                    </div>

                    <div class="p-3.5 bg-cream-100 rounded-2xl flex items-center justify-between">
                      <div class="text-left">
                        <span class="text-xs text-warmgray-500 font-medium block">Bob Teaches Alice</span>
                        <span class="font-bold text-navy-900 flex items-center space-x-1.5">
                          <${Icon} name="image" class="w-4 h-4 text-navy-700" />
                          <span>Photoshop (Expert)</span>
                        </span>
                      </div>
                      <${Icon} name="arrow-left" class="w-5 h-5 text-navy-600" />
                    </div>
                  </div>

                  <div class="p-4 bg-navy-50/70 border border-navy-100 rounded-2xl space-y-2 text-left">
                    <p class="text-xs font-bold text-navy-900 uppercase tracking-wide flex items-center space-x-1.5">
                      <${Icon} name="info" class="w-3.5 h-3.5 text-navy-700" />
                      <span>Why this match?</span>
                    </p>
                    <ul class="text-xs text-warmgray-700 space-y-1.5">
                      <li class="flex items-start space-x-1.5">
                        <span class="text-emerald-600 font-bold">✓</span>
                        <span>Perfect 2-way complementary skill demand.</span>
                      </li>
                      <li class="flex items-start space-x-1.5">
                        <span class="text-emerald-600 font-bold">✓</span>
                        <span>Both active during Weekday Evenings & Weekends.</span>
                      </li>
                      <li class="flex items-start space-x-1.5">
                        <span class="text-emerald-600 font-bold">✓</span>
                        <span>5.0★ verified reliability rating on past swaps.</span>
                      </li>
                    </ul>
                  </div>

                  <button onClick=${() => setActiveTab('matches')}
                    class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center space-x-2">
                    <span>Explore All Matches</span>
                    <${Icon} name="arrow-right" class="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <p class="text-xs uppercase tracking-widest font-bold text-navy-700">The Exchange Lifecycle</p>
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-navy-900">How SkillSwap Works</h2>
            <p class="text-warmgray-600">A seamless 4-step framework from complementary matching to certified milestone completion.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-boutique space-y-4 text-left">
              <div class="w-12 h-12 rounded-2xl bg-navy-100 text-navy-800 flex items-center justify-center font-serif font-bold text-xl">1</div>
              <h3 class="font-serif font-bold text-lg text-navy-900">Declare Skills</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">List skills you can teach with proficiency levels and skills you are eager to acquire.</p>
            </div>

            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-boutique space-y-4 text-left">
              <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-xl">2</div>
              <h3 class="font-serif font-bold text-lg text-navy-900">Get Matched</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">Our 6-factor algorithm ranks reciprocal peers and explains match synergy in plain English.</p>
            </div>

            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-boutique space-y-4 text-left">
              <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-serif font-bold text-xl">3</div>
              <h3 class="font-serif font-bold text-lg text-navy-900">Shared Workspace</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">Collaborate with shared learning goals, interactive task Kanban, timelines, and live chat.</p>
            </div>

            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-boutique space-y-4 text-left">
              <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-serif font-bold text-xl">4</div>
              <h3 class="font-serif font-bold text-lg text-navy-900">Rate & Verify</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">Leave multi-criteria reviews across Communication, Knowledge, and Reliability to build trust.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Matches View Component
  // ----------------------------------------------------
  function MatchesView({ user, onProposeSwap, onViewProfile, setActiveTab }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterReciprocalOnly, setFilterReciprocalOnly] = useState(false);
    const [minScore, setMinScore] = useState(0);
    const [expandedMatchId, setExpandedMatchId] = useState(null);

    const loadMatches = async () => {
      try {
        setLoading(true);
        const data = await api('/api/matches');
        setMatches(data.matches || []);
      } catch (err) {
        console.error('Error loading matches:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadMatches();
    }, [user?.id]);

    const filteredMatches = matches.filter(m => {
      if (filterReciprocalOnly && !m.matchedSkills?.isDirectReciprocal) return false;
      if (m.matchScore < minScore) return false;
      return true;
    });

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-cream-300 pb-6 text-left">
          <div>
            <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-navy-700">
              <${Icon} name="sparkles" class="w-4 h-4 text-amber-500" />
              <span>Intelligent Synergy Engine</span>
            </div>
            <h1 class="font-serif text-3xl sm:text-4xl font-bold text-navy-900 mt-1">Reciprocal Skill Matches</h1>
            <p class="text-sm text-warmgray-600 mt-1">Peers ranked by complementary teach & learn synergy with explainability breakdown.</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <label class="flex items-center space-x-2 px-3.5 py-2 bg-white border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 cursor-pointer shadow-sm">
              <input type="checkbox" checked=${filterReciprocalOnly} onChange=${e => setFilterReciprocalOnly(e.target.checked)} class="rounded text-navy-700 focus:ring-navy-600" />
              <span>2-Way Reciprocal Only</span>
            </label>

            <div class="flex items-center space-x-2 px-3.5 py-2 bg-white border border-cream-300 rounded-xl text-xs font-semibold text-navy-900 shadow-sm">
              <span>Min Score:</span>
              <select value=${minScore} onChange=${e => setMinScore(Number(e.target.value))} class="bg-transparent border-none text-navy-900 font-bold focus:ring-0 text-xs">
                <option value="0">All (0%+)</option>
                <option value="50">50%+</option>
                <option value="75">75%+</option>
                <option value="85">85%+</option>
              </select>
            </div>

            <button onClick=${loadMatches} class="p-2 bg-white hover:bg-cream-200 border border-cream-300 rounded-xl text-navy-800 transition-colors shadow-sm">
              <${Icon} name="refresh-cw" class="w-4 h-4 ${loading ? 'animate-spin' : ''}" />
            </button>
          </div>
        </div>

        ${loading ? html`
          <div class="py-20 text-center space-y-3">
            <${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" />
            <p class="text-sm font-medium text-warmgray-600">Analyzing skills and computing reciprocal scores...</p>
          </div>
        ` : filteredMatches.length === 0 ? html`
          <div class="bg-white rounded-3xl p-12 text-center border border-cream-300 max-w-2xl mx-auto space-y-4 shadow-boutique">
            <div class="w-14 h-14 bg-cream-200 rounded-2xl flex items-center justify-center mx-auto text-warmgray-600">
              <${Icon} name="layers" class="w-7 h-7" />
            </div>
            <h3 class="font-serif text-xl font-bold text-navy-900">No Matches Found With Current Filters</h3>
            <p class="text-sm text-warmgray-600">Try lowering your minimum score filter or adding more teach & learn skills to your profile.</p>
            <button onClick=${() => setActiveTab('skills')} class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-semibold text-xs rounded-xl transition-colors">
              Manage My Skills
            </button>
          </div>
        ` : html`
          <div class="grid grid-cols-1 gap-6">
            ${filteredMatches.map(m => {
              const isExpanded = expandedMatchId === m.user.id;
              const isReciprocal = m.matchedSkills?.isDirectReciprocal;
              const scoreColor = m.matchScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                                 m.matchScore >= 60 ? 'text-blue-700 bg-blue-50 border-blue-200' :
                                 'text-amber-700 bg-amber-50 border-amber-200';

              return html`
                <div key=${m.user.id} class="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-boutique hover:shadow-lg transition-all space-y-6">
                  
                  <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div class="flex items-start space-x-4">
                      <img src=${m.user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + m.user.id} 
                        class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cream-300 shadow-sm flex-shrink-0" />
                      
                      <div class="space-y-1 text-left">
                        <div class="flex flex-wrap items-center gap-2">
                          <h3 class="font-serif text-xl sm:text-2xl font-bold text-navy-900">${m.user.name}</h3>
                          ${isReciprocal && html`
                            <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                              <${Icon} name="repeat" class="w-3 h-3" />
                              <span>2-Way Reciprocal</span>
                            </span>
                          `}
                        </div>
                        <p class="text-xs sm:text-sm text-warmgray-600 font-medium">${m.user.headline || 'Active Skill Exchanger'}</p>
                        
                        <div class="flex flex-wrap items-center gap-3 text-xs text-warmgray-500 pt-1">
                          <span class="flex items-center space-x-1">
                            <${Icon} name="map-pin" class="w-3.5 h-3.5 text-warmgray-400" />
                            <span>${m.user.location || 'Remote'}</span>
                          </span>
                          <span class="flex items-center space-x-1">
                            <${Icon} name="clock" class="w-3.5 h-3.5 text-warmgray-400" />
                            <span>${m.user.availability || 'Flexible'}</span>
                          </span>
                          <span class="flex items-center space-x-1">
                            <${Icon} name="star" class="w-3.5 h-3.5 text-amber-500" />
                            <span class="font-bold text-navy-900">${m.user.rating?.toFixed(1)}</span>
                            <span>(${m.user.reviews_count} reviews)</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-cream-200">
                      <div class="flex items-center space-x-3">
                        <div class="text-right">
                          <span class="text-[10px] uppercase font-bold tracking-widest text-warmgray-500 block">Match Score</span>
                          <span class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">${m.matchScore}%</span>
                        </div>
                        <div class="w-12 h-12 rounded-2xl border ${scoreColor} flex items-center justify-center font-bold text-base shadow-sm">
                          ${m.matchScore}%
                        </div>
                      </div>

                      <div class="flex items-center space-x-2">
                        <button onClick=${() => onViewProfile(m.user.id)}
                          class="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-navy-900 border border-cream-300 rounded-xl text-xs font-bold transition-colors">
                          View Profile
                        </button>
                        <button onClick=${() => onProposeSwap(m)}
                          class="px-5 py-2 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-bold shadow-boutique transition-all flex items-center space-x-1.5">
                          <${Icon} name="arrow-left-right" class="w-3.5 h-3.5" />
                          <span>Propose Swap</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Skills Breakdown -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b border-cream-200 py-4 text-left">
                    <div class="space-y-2">
                      <p class="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center space-x-1.5">
                        <${Icon} name="book-open" class="w-3.5 h-3.5 text-navy-700" />
                        <span>They Can Teach You:</span>
                      </p>
                      <div class="flex flex-wrap gap-1.5">
                        ${m.user.teach_skills?.map(s => html`
                          <span key=${s.id} class="inline-flex items-center space-x-1 px-2.5 py-1 bg-cream-100 border border-cream-300 rounded-xl text-xs text-navy-900 font-semibold">
                            <span>${s.skill_name}</span>
                            <span class="text-[10px] text-warmgray-500 font-normal">(${s.level})</span>
                          </span>
                        `)}
                      </div>
                    </div>

                    <div class="space-y-2">
                      <p class="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center space-x-1.5">
                        <${Icon} name="target" class="w-3.5 h-3.5 text-amber-600" />
                        <span>They Want to Learn From You:</span>
                      </p>
                      <div class="flex flex-wrap gap-1.5">
                        ${m.user.learn_skills?.map(s => html`
                          <span key=${s.id} class="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
                            <span>${s.skill_name}</span>
                            <span class="text-[10px] text-amber-700 font-normal">(${s.level})</span>
                          </span>
                        `)}
                      </div>
                    </div>
                  </div>

                  <!-- "Why This Match?" Explainability Card -->
                  <div class="bg-cream-50 rounded-2xl p-4 sm:p-5 border border-cream-300/80 space-y-3 text-left">
                    <div class="flex items-center justify-between">
                      <p class="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center space-x-2">
                        <${Icon} name="help-circle" class="w-4 h-4 text-navy-700" />
                        <span>Why This Match? — Synergy Breakdown</span>
                      </p>
                      <button onClick=${() => setExpandedMatchId(isExpanded ? null : m.user.id)}
                        class="text-xs text-navy-700 font-semibold hover:underline flex items-center space-x-1">
                        <span>${isExpanded ? 'Hide Factor Breakdown' : 'View 6-Factor Details'}</span>
                        <${Icon} name="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      ${m.reasons?.map((reason, idx) => html`
                        <div key=${idx} class="flex items-start space-x-2 bg-white/80 p-2.5 rounded-xl border border-cream-200 text-xs text-warmgray-800">
                          <span class="text-navy-700 font-bold mt-0.5">•</span>
                          <span class="leading-relaxed font-medium">${reason}</span>
                        </div>
                      `)}
                    </div>

                    ${isExpanded && html`
                      <div class="pt-4 border-t border-cream-300/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <div class="flex justify-between font-semibold text-warmgray-700 mb-1">
                            <span>Skill Compatibility (35%)</span>
                            <span>${m.subScores?.skillCompatibility?.score} / 35</span>
                          </div>
                          <div class="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                            <div class="bg-navy-700 h-full rounded-full" style=${{ width: `${m.subScores?.skillCompatibility?.percentage}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between font-semibold text-warmgray-700 mb-1">
                            <span>Reciprocal 2-Way (25%)</span>
                            <span>${m.subScores?.reciprocalCompatibility?.score} / 25</span>
                          </div>
                          <div class="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                            <div class="bg-emerald-600 h-full rounded-full" style=${{ width: `${m.subScores?.reciprocalCompatibility?.percentage}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between font-semibold text-warmgray-700 mb-1">
                            <span>Level Synergy (15%)</span>
                            <span>${m.subScores?.levelCompatibility?.score} / 15</span>
                          </div>
                          <div class="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                            <div class="bg-blue-600 h-full rounded-full" style=${{ width: `${m.subScores?.levelCompatibility?.percentage}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between font-semibold text-warmgray-700 mb-1">
                            <span>Schedule Overlap (10%)</span>
                            <span>${m.subScores?.availabilityCompatibility?.score} / 10</span>
                          </div>
                          <div class="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                            <div class="bg-amber-600 h-full rounded-full" style=${{ width: `${m.subScores?.availabilityCompatibility?.percentage}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between font-semibold text-warmgray-700 mb-1">
                            <span>Goal Alignment (10%)</span>
                            <span>${m.subScores?.goalCompatibility?.score} / 10</span>
                          </div>
                          <div class="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                            <div class="bg-indigo-600 h-full rounded-full" style=${{ width: `${m.subScores?.goalCompatibility?.percentage}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div class="flex justify-between font-semibold text-warmgray-700 mb-1">
                            <span>Trust & History (5%)</span>
                            <span>${m.subScores?.trustScore?.score} / 5</span>
                          </div>
                          <div class="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                            <div class="bg-teal-600 h-full rounded-full" style=${{ width: `${m.subScores?.trustScore?.percentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    `}
                  </div>

                </div>
              `;
            })}
          </div>
        `}
      </div>
    `;
  }

  // ----------------------------------------------------
  // Explore / Search View Component
  // ----------------------------------------------------
  function SearchView({ onProposeSwap, onViewProfile }) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState('');
    const [level, setLevel] = useState('');
    const [availability, setAvailability] = useState('');
    const [minRating, setMinRating] = useState('');
    const [results, setResults] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const doSearch = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (category) params.append('category', category);
        if (type) params.append('type', type);
        if (level) params.append('level', level);
        if (availability) params.append('availability', availability);
        if (minRating) params.append('min_rating', minRating);

        const data = await api(`/api/search?${params.toString()}`);
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      api('/api/skills').then(d => setCategories(d.categories || [])).catch(() => {});
      doSearch();
    }, []);

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-boutique space-y-6 text-left">
          <div>
            <h1 class="font-serif text-3xl font-bold text-navy-900">Explore Mentors & Skill Seekers</h1>
            <p class="text-sm text-warmgray-600 mt-1">Discover community peers by keyword, category, skill level, and schedule availability.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="sm:col-span-2 relative">
              <input type="text" value=${query} onChange=${e => setQuery(e.target.value)} onKeyDown=${e => e.key === 'Enter' && doSearch()}
                placeholder="Search by skill name, topic, or mentor name..."
                class="w-full pl-10 pr-4 py-3 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 placeholder:text-warmgray-400 focus:ring-2 focus:ring-navy-700" />
              <div class="absolute left-3.5 top-3.5 text-warmgray-400">
                <${Icon} name="search" class="w-4 h-4" />
              </div>
            </div>

            <div>
              <select value=${category} onChange=${e => setCategory(e.target.value)}
                class="w-full py-3 px-3.5 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 focus:ring-2 focus:ring-navy-700">
                <option value="">All Categories</option>
                ${categories.map(c => html`<option key=${c.id} value=${c.name}>${c.name}</option>`)}
              </select>
            </div>

            <div>
              <select value=${type} onChange=${e => setType(e.target.value)}
                class="w-full py-3 px-3.5 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 focus:ring-2 focus:ring-navy-700">
                <option value="">Either (Teach or Learn)</option>
                <option value="TEACH">Offering Mentorship (Can Teach)</option>
                <option value="LEARN">Looking for Mentor (Wants to Learn)</option>
              </select>
            </div>

            <div>
              <select value=${level} onChange=${e => setLevel(e.target.value)}
                class="w-full py-3 px-3.5 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 focus:ring-2 focus:ring-navy-700">
                <option value="">Any Proficiency Level</option>
                <option value="Expert">Expert</option>
                <option value="Advanced">Advanced</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Beginner">Beginner</option>
              </select>
            </div>

            <div>
              <select value=${availability} onChange=${e => setAvailability(e.target.value)}
                class="w-full py-3 px-3.5 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 focus:ring-2 focus:ring-navy-700">
                <option value="">Any Availability</option>
                <option value="Evening">Evenings</option>
                <option value="Weekend">Weekends</option>
                <option value="Morning">Mornings</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div>
              <select value=${minRating} onChange=${e => setMinRating(e.target.value)}
                class="w-full py-3 px-3.5 bg-cream-50 border border-cream-300 rounded-2xl text-sm text-navy-900 focus:ring-2 focus:ring-navy-700">
                <option value="">Any Rating</option>
                <option value="4.5">4.5★ and above</option>
                <option value="4.0">4.0★ and above</option>
              </select>
            </div>

            <div class="flex items-center">
              <button onClick=${doSearch}
                class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-2xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center space-x-2">
                <${Icon} name="filter" class="w-4 h-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>

        ${loading ? html`
          <div class="py-20 text-center space-y-3">
            <${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" />
            <p class="text-sm font-medium text-warmgray-600">Searching catalog...</p>
          </div>
        ` : results.length === 0 ? html`
          <div class="bg-white rounded-3xl p-12 text-center border border-cream-300 max-w-xl mx-auto space-y-3">
            <${Icon} name="search-x" class="w-10 h-10 text-warmgray-400 mx-auto" />
            <h3 class="font-serif text-lg font-bold text-navy-900">No Peers Matched Your Filters</h3>
            <p class="text-xs text-warmgray-500">Try clearing some filters or searching for broader terms.</p>
          </div>
        ` : html`
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${results.map(r => html`
              <div key=${r.id} class="bg-white rounded-3xl p-6 border border-cream-300 shadow-boutique hover:shadow-lg transition-all flex flex-col justify-between space-y-5 text-left">
                
                <div class="space-y-4">
                  <div class="flex items-start space-x-3.5">
                    <img src=${r.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + r.id} 
                      class="w-14 h-14 rounded-2xl object-cover border border-cream-300 flex-shrink-0" />
                    <div class="min-w-0">
                      <h3 class="font-serif font-bold text-lg text-navy-900 truncate">${r.name}</h3>
                      <p class="text-xs text-warmgray-600 truncate">${r.headline || 'Community Exchanger'}</p>
                      <div class="flex items-center space-x-2 text-xs text-warmgray-500 mt-1">
                        <span class="flex items-center space-x-1">
                          <${Icon} name="star" class="w-3.5 h-3.5 text-amber-500" />
                          <span class="font-bold text-navy-900">${r.rating?.toFixed(1)}</span>
                        </span>
                        <span>•</span>
                        <span>${r.location || 'Remote'}</span>
                      </div>
                    </div>
                  </div>

                  <p class="text-xs text-warmgray-600 line-clamp-2 leading-relaxed">${r.bio || 'Excited to teach and learn new skills.'}</p>

                  <div class="space-y-1.5">
                    <span class="text-[11px] uppercase tracking-wider font-bold text-navy-800">Can Teach:</span>
                    <div class="flex flex-wrap gap-1">
                      ${r.teach_skills?.map(s => html`
                        <span key=${s.id} class="px-2 py-0.5 bg-cream-100 border border-cream-300 rounded-lg text-[11px] font-semibold text-navy-900">
                          ${s.skill_name} <span class="text-warmgray-500 font-normal">(${s.level})</span>
                        </span>
                      `)}
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <span class="text-[11px] uppercase tracking-wider font-bold text-amber-800">Wants to Learn:</span>
                    <div class="flex flex-wrap gap-1">
                      ${r.learn_skills?.map(s => html`
                        <span key=${s.id} class="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-semibold text-amber-900">
                          ${s.skill_name}
                        </span>
                      `)}
                    </div>
                  </div>
                </div>

                <div class="pt-4 border-t border-cream-200 flex items-center justify-between">
                  <span class="text-xs text-warmgray-500 truncate max-w-[120px]">${r.availability || 'Flexible'}</span>
                  <div class="flex items-center space-x-2">
                    <button onClick=${() => onViewProfile(r.id)} class="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-navy-900 rounded-xl text-xs font-semibold">
                      Profile
                    </button>
                    <button onClick=${() => onProposeSwap({ user: r })} class="px-3 py-1.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-bold shadow-sm">
                      Swap
                    </button>
                  </div>
                </div>

              </div>
            `)}
          </div>
        `}
      </div>
    `;
  }

  // ----------------------------------------------------
  // My Skills Management View Component
  // ----------------------------------------------------
  function SkillsManagementView({ user, onAddSkill, onEditSkill, onDeleteSkill }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('TEACH');

    const loadSkills = async () => {
      try {
        setLoading(true);
        const data = await api('/api/skills/user');
        setSkills(data.skills || []);
      } catch (err) {
        console.error('Error loading user skills:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadSkills();
    }, [user?.id]);

    const teachSkills = skills.filter(s => s.type === 'TEACH');
    const learnSkills = skills.filter(s => s.type === 'LEARN');

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-6 text-left">
          <div>
            <h1 class="font-serif text-3xl font-bold text-navy-900">Manage Your Skills Profile</h1>
            <p class="text-sm text-warmgray-600 mt-1">Add what you can teach and what you want to learn to power accurate reciprocal matches.</p>
          </div>

          <button onClick=${() => onAddSkill(activeTab)}
            class="px-5 py-3 bg-navy-700 hover:bg-navy-800 text-white font-semibold text-xs rounded-2xl shadow-boutique transition-all flex items-center space-x-2">
            <${Icon} name="plus-circle" class="w-4 h-4" />
            <span>Add New ${activeTab === 'TEACH' ? 'Teaching' : 'Learning'} Skill</span>
          </button>
        </div>

        <div class="flex space-x-3 border-b border-cream-300">
          <button onClick=${() => setActiveTab('TEACH')}
            class="pb-3 px-4 font-serif text-lg font-bold border-b-2 transition-all flex items-center space-x-2 ${activeTab === 'TEACH' ? 'border-navy-700 text-navy-900' : 'border-transparent text-warmgray-400 hover:text-navy-900'}">
            <${Icon} name="award" class="w-5 h-5 text-navy-700" />
            <span>Skills I Can Teach (${teachSkills.length})</span>
          </button>

          <button onClick=${() => setActiveTab('LEARN')}
            class="pb-3 px-4 font-serif text-lg font-bold border-b-2 transition-all flex items-center space-x-2 ${activeTab === 'LEARN' ? 'border-amber-600 text-amber-900' : 'border-transparent text-warmgray-400 hover:text-navy-900'}">
            <${Icon} name="target" class="w-5 h-5 text-amber-600" />
            <span>Skills I Want to Learn (${learnSkills.length})</span>
          </button>
        </div>

        ${loading ? html`
          <div class="py-20 text-center">
            <${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" />
          </div>
        ` : (activeTab === 'TEACH' ? teachSkills : learnSkills).length === 0 ? html`
          <div class="bg-white rounded-3xl p-12 text-center border border-cream-300 max-w-xl mx-auto space-y-4 shadow-boutique">
            <div class="w-12 h-12 bg-cream-200 rounded-2xl flex items-center justify-center mx-auto text-warmgray-600">
              <${Icon} name="plus" class="w-6 h-6" />
            </div>
            <h3 class="font-serif text-lg font-bold text-navy-900">No ${activeTab === 'TEACH' ? 'Teaching' : 'Learning'} Skills Added Yet</h3>
            <p class="text-xs text-warmgray-500">Adding at least 2 teaching skills and 2 learning skills dramatically boosts your match score!</p>
            <button onClick=${() => onAddSkill(activeTab)} class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-semibold text-xs rounded-xl">
              Add Your First Skill
            </button>
          </div>
        ` : html`
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${(activeTab === 'TEACH' ? teachSkills : learnSkills).map(s => html`
              <div key=${s.id} class="bg-white rounded-3xl p-6 border border-cream-300 shadow-boutique hover:shadow-lg transition-all space-y-4 text-left relative flex flex-col justify-between">
                
                <div class="space-y-3">
                  <div class="flex items-start justify-between">
                    <div>
                      <span class="text-[10px] uppercase font-bold tracking-wider text-warmgray-400 block">${s.category_name}</span>
                      <h3 class="font-serif font-bold text-xl text-navy-900 mt-0.5">${s.skill_name}</h3>
                    </div>
                    <span class="px-2.5 py-1 rounded-xl text-xs font-bold ${s.type === 'TEACH' ? 'bg-navy-50 text-navy-800 border border-navy-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}">
                      ${s.level}
                    </span>
                  </div>

                  <p class="text-xs text-warmgray-600 leading-relaxed">${s.description || s.skill_desc || 'No specific notes provided.'}</p>

                  ${s.type === 'TEACH' && html`
                    <div class="flex items-center space-x-2 text-xs text-warmgray-500 font-medium">
                      <${Icon} name="clock" class="w-3.5 h-3.5 text-warmgray-400" />
                      <span>${s.experience_years} years experience</span>
                    </div>
                  `}
                </div>

                <div class="pt-4 border-t border-cream-200 flex items-center justify-end space-x-2">
                  <button onClick=${() => onEditSkill(s)} class="p-2 text-warmgray-600 hover:text-navy-900 hover:bg-cream-100 rounded-xl transition-colors">
                    <${Icon} name="edit-3" class="w-4 h-4" />
                  </button>
                  <button onClick=${() => onDeleteSkill(s.id, loadSkills)} class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors">
                    <${Icon} name="trash-2" class="w-4 h-4" />
                  </button>
                </div>

              </div>
            `)}
          </div>
        `}
      </div>
    `;
  }

  // ----------------------------------------------------
  // Requests View Component
  // ----------------------------------------------------
  function RequestsView({ user, setActiveTab, onOpenWorkspace }) {
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [activeTab, setActiveTabLocal] = useState('incoming');
    const [loading, setLoading] = useState(true);

    const loadRequests = async () => {
      try {
        setLoading(true);
        const data = await api('/api/requests');
        setIncoming(data.incoming || []);
        setOutgoing(data.outgoing || []);
      } catch (err) {
        console.error('Error loading requests:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadRequests();
    }, [user?.id]);

    const handleAccept = async (reqId) => {
      try {
        const res = await api(`/api/requests/${reqId}/accept`, { method: 'POST' });
        alert('Request accepted! Your shared workspace is ready.');
        loadRequests();
        if (res.workspace?.id) {
          onOpenWorkspace(res.workspace.id);
        }
      } catch (err) {
        alert(err.message);
      }
    };

    const handleReject = async (reqId, action) => {
      try {
        await api(`/api/requests/${reqId}/reject`, { method: 'POST', body: JSON.stringify({ action }) });
        loadRequests();
      } catch (err) {
        alert(err.message);
      }
    };

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
        <div>
          <h1 class="font-serif text-3xl font-bold text-navy-900">Exchange Requests</h1>
          <p class="text-sm text-warmgray-600 mt-1">Review incoming proposals and track your sent skill exchange requests.</p>
        </div>

        <div class="flex space-x-3 border-b border-cream-300">
          <button onClick=${() => setActiveTabLocal('incoming')}
            class="pb-3 px-4 font-serif text-lg font-bold border-b-2 transition-all flex items-center space-x-2 ${activeTab === 'incoming' ? 'border-navy-700 text-navy-900' : 'border-transparent text-warmgray-400 hover:text-navy-900'}">
            <span>Incoming Requests (${incoming.length})</span>
          </button>

          <button onClick=${() => setActiveTabLocal('outgoing')}
            class="pb-3 px-4 font-serif text-lg font-bold border-b-2 transition-all flex items-center space-x-2 ${activeTab === 'outgoing' ? 'border-navy-700 text-navy-900' : 'border-transparent text-warmgray-400 hover:text-navy-900'}">
            <span>Outgoing Sent (${outgoing.length})</span>
          </button>
        </div>

        ${loading ? html`
          <div class="py-20 text-center">
            <${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" />
          </div>
        ` : (activeTab === 'incoming' ? incoming : outgoing).length === 0 ? html`
          <div class="bg-white rounded-3xl p-12 text-center border border-cream-300 max-w-xl mx-auto space-y-3">
            <${Icon} name="inbox" class="w-10 h-10 text-warmgray-400 mx-auto" />
            <h3 class="font-serif text-lg font-bold text-navy-900">No ${activeTab === 'incoming' ? 'Incoming' : 'Outgoing'} Requests</h3>
            <p class="text-xs text-warmgray-500">${activeTab === 'incoming' ? 'When other members discover your teaching skills and request an exchange, they will appear here.' : 'Head over to Matches or Explore to propose a swap!'}</p>
          </div>
        ` : html`
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${(activeTab === 'incoming' ? incoming : outgoing).map(r => {
              const isIncoming = activeTab === 'incoming';
              const partnerName = isIncoming ? r.sender_name : r.receiver_name;
              const partnerAvatar = isIncoming ? r.sender_avatar : r.receiver_avatar;
              const partnerHeadline = isIncoming ? r.sender_headline : r.receiver_headline;

              return html`
                <div key=${r.id} class="bg-white rounded-3xl p-6 border border-cream-300 shadow-boutique space-y-5 flex flex-col justify-between">
                  
                  <div class="space-y-4">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center space-x-3">
                        <img src=${partnerAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + partnerName} 
                          class="w-12 h-12 rounded-2xl object-cover border border-cream-300" />
                        <div>
                          <h3 class="font-serif font-bold text-lg text-navy-900">${partnerName}</h3>
                          <p class="text-xs text-warmgray-500 truncate max-w-[200px]">${partnerHeadline || 'Skill Member'}</p>
                        </div>
                      </div>
                      <span class="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider
                        ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-warmgray-200 text-warmgray-700'}">
                        ${r.status}
                      </span>
                    </div>

                    <div class="p-3 bg-cream-100 rounded-2xl text-xs space-y-1">
                      <div class="flex justify-between text-navy-900 font-semibold">
                        <span>Proposed Teach Skill:</span>
                        <span class="font-bold text-navy-700">${r.teach_skill_name || 'Flexible'}</span>
                      </div>
                      <div class="flex justify-between text-warmgray-700">
                        <span>Target Learn Skill:</span>
                        <span class="font-bold text-amber-800">${r.learn_skill_name || 'Flexible'}</span>
                      </div>
                    </div>

                    <div class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 text-xs text-warmgray-800 leading-relaxed italic">
                      "${r.message || 'Hi! Looking forward to learning and teaching together.'}"
                    </div>
                  </div>

                  <div class="pt-4 border-t border-cream-200 flex items-center justify-between">
                    <span class="text-[11px] text-warmgray-400">${new Date(r.created_at).toLocaleDateString()}</span>

                    <div class="flex items-center space-x-2">
                      ${isIncoming && r.status === 'PENDING' && html`
                        <button onClick=${() => handleReject(r.id, 'REJECT')} class="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl">
                          Decline
                        </button>
                        <button onClick=${() => handleAccept(r.id)} class="px-4 py-2 text-xs font-bold bg-navy-700 hover:bg-navy-800 text-white rounded-xl shadow-sm">
                          Accept & Start Workspace
                        </button>
                      `}

                      ${!isIncoming && r.status === 'PENDING' && html`
                        <button onClick=${() => handleReject(r.id, 'CANCEL')} class="px-3.5 py-2 text-xs font-bold text-warmgray-600 hover:bg-cream-200 rounded-xl">
                          Cancel Request
                        </button>
                      `}

                      ${r.status === 'ACCEPTED' && html`
                        <button onClick=${() => setActiveTab('workspaces')} class="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl">
                          Go to Workspace
                        </button>
                      `}
                    </div>
                  </div>

                </div>
              `;
            })}
          </div>
        `}
      </div>
    `;
  }

  // ----------------------------------------------------
  // Workspaces View Component
  // ----------------------------------------------------
  function WorkspacesView({ user, selectedWorkspaceId, onSelectWorkspace, onOpenChat, onLeaveReview }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [currentWs, setCurrentWs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newGoalText, setNewGoalText] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskAssignee, setNewTaskAssignee] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    const loadWorkspaces = async () => {
      try {
        setLoading(true);
        const data = await api('/api/workspaces');
        setWorkspaces(data.workspaces || []);
        
        const targetId = selectedWorkspaceId || data.workspaces[0]?.id;
        if (targetId) {
          loadWorkspaceDetail(targetId);
        }
      } catch (err) {
        console.error('Error loading workspaces:', err);
      } finally {
        setLoading(false);
      }
    };

    const loadWorkspaceDetail = async (id) => {
      try {
        const data = await api(`/api/workspaces/${id}`);
        setCurrentWs(data.workspace);
        setNewTaskAssignee(user?.id || 'user_alice');
      } catch (err) {
        console.error('Error loading workspace detail:', err);
      }
    };

    useEffect(() => {
      loadWorkspaces();
    }, [user?.id, selectedWorkspaceId]);

    const handleAddGoal = async (e) => {
      e.preventDefault();
      if (!newGoalText.trim() || !currentWs) return;
      try {
        await api(`/api/workspaces/${currentWs.id}/goals`, {
          method: 'POST',
          body: JSON.stringify({ goal_description: newGoalText.trim(), user_id: user?.id || 'user_alice' })
        });
        setNewGoalText('');
        loadWorkspaceDetail(currentWs.id);
      } catch (err) {
        alert(err.message);
      }
    };

    const handleToggleGoal = async (goalId, currentStatus) => {
      try {
        const nextStatus = currentStatus === 'DONE' ? 'IN_PROGRESS' : 'DONE';
        await api(`/api/workspaces/${currentWs.id}/goals`, {
          method: 'PUT',
          body: JSON.stringify({ goal_id: goalId, status: nextStatus })
        });
        loadWorkspaceDetail(currentWs.id);
      } catch (err) {
        alert(err.message);
      }
    };

    const handleAddTask = async (e) => {
      e.preventDefault();
      if (!newTaskTitle.trim() || !currentWs) return;
      try {
        await api(`/api/workspaces/${currentWs.id}/tasks`, {
          method: 'POST',
          body: JSON.stringify({
            title: newTaskTitle.trim(),
            assigned_to: newTaskAssignee || user?.id || 'user_alice',
            due_date: newTaskDueDate || null
          })
        });
        setNewTaskTitle('');
        setNewTaskDueDate('');
        loadWorkspaceDetail(currentWs.id);
      } catch (err) {
        alert(err.message);
      }
    };

    const handleToggleTask = async (taskId, currentStatus) => {
      try {
        const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
        await api(`/api/workspaces/${currentWs.id}/tasks`, {
          method: 'PUT',
          body: JSON.stringify({ task_id: taskId, status: nextStatus })
        });
        loadWorkspaceDetail(currentWs.id);
      } catch (err) {
        alert(err.message);
      }
    };

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
        <div>
          <h1 class="font-serif text-3xl font-bold text-navy-900">Exchange Workspaces</h1>
          <p class="text-sm text-warmgray-600 mt-1">Shared interactive workspaces with goals, milestones, tasks, and reviews.</p>
        </div>

        ${loading ? html`
          <div class="py-20 text-center">
            <${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" />
          </div>
        ` : workspaces.length === 0 ? html`
          <div class="bg-white rounded-3xl p-12 text-center border border-cream-300 max-w-xl mx-auto space-y-3">
            <${Icon} name="layout-grid" class="w-10 h-10 text-warmgray-400 mx-auto" />
            <h3 class="font-serif text-lg font-bold text-navy-900">No Active Workspaces Yet</h3>
            <p class="text-xs text-warmgray-500">Workspaces are automatically initialized as soon as a skill swap request is accepted!</p>
          </div>
        ` : html`
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div class="lg:col-span-4 space-y-3">
              <h3 class="font-serif font-bold text-sm uppercase tracking-wider text-navy-900 px-1">Your Active Exchanges</h3>
              ${workspaces.map(ws => html`
                <button key=${ws.id} onClick=${() => loadWorkspaceDetail(ws.id)}
                  class="w-full text-left p-4 rounded-2xl border transition-all ${currentWs?.id === ws.id ? 'bg-navy-700 text-white border-navy-700 shadow-md' : 'bg-white text-navy-900 border-cream-300 hover:bg-cream-50'}">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold ${currentWs?.id === ws.id ? 'text-cream-200' : 'text-navy-700'}">${ws.partner?.name}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${currentWs?.id === ws.id ? 'bg-navy-800 text-cream-200' : 'bg-cream-200 text-navy-900'}">${ws.status}</span>
                  </div>
                  <h4 class="font-serif font-bold text-sm truncate">${ws.title}</h4>
                  <div class="mt-3 w-full ${currentWs?.id === ws.id ? 'bg-navy-900' : 'bg-cream-200'} h-1.5 rounded-full overflow-hidden">
                    <div class="${currentWs?.id === ws.id ? 'bg-amber-400' : 'bg-navy-700'} h-full rounded-full" style=${{ width: `${ws.progress || 0}%` }}></div>
                  </div>
                </button>
              `)}
            </div>

            ${currentWs && html`
              <div class="lg:col-span-8 space-y-6">
                
                <div class="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-boutique space-y-6">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
                    <div class="space-y-1">
                      <div class="flex items-center space-x-2 text-xs text-warmgray-500 font-semibold">
                        <span>Peer Exchange Workspace</span>
                        <span>•</span>
                        <span class="text-emerald-700 font-bold">${currentWs.status}</span>
                      </div>
                      <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">${currentWs.title}</h2>
                      <p class="text-xs sm:text-sm text-warmgray-600 leading-relaxed">${currentWs.description}</p>
                    </div>

                    <div class="flex items-center space-x-2 flex-shrink-0">
                      <button onClick=${() => onOpenChat(currentWs.connection_id)}
                        class="px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5">
                        <${Icon} name="message-square" class="w-4 h-4" />
                        <span>Chat with ${currentWs.partner?.name?.split(' ')[0]}</span>
                      </button>
                      <button onClick=${() => onLeaveReview(currentWs)}
                        class="px-4 py-2.5 bg-cream-100 hover:bg-cream-200 text-navy-900 border border-cream-300 rounded-xl text-xs font-bold flex items-center space-x-1.5">
                        <${Icon} name="star" class="w-4 h-4 text-amber-500" />
                        <span>Review</span>
                      </button>
                    </div>
                  </div>

                  <div class="space-y-2 bg-cream-50 p-4 rounded-2xl border border-cream-200">
                    <div class="flex items-center justify-between text-xs font-bold text-navy-900">
                      <span class="flex items-center space-x-1.5">
                        <${Icon} name="activity" class="w-4 h-4 text-navy-700" />
                        <span>Overall Exchange Progress</span>
                      </span>
                      <span class="text-navy-900 text-sm font-serif">${currentWs.computedProgress || currentWs.progress}%</span>
                    </div>
                    <div class="w-full bg-cream-200 h-3 rounded-full overflow-hidden">
                      <div class="bg-navy-700 h-full rounded-full transition-all duration-500" style=${{ width: `${currentWs.computedProgress || currentWs.progress}%` }}></div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <h3 class="font-serif font-bold text-base text-navy-900 flex items-center space-x-2">
                          <${Icon} name="target" class="w-4 h-4 text-amber-600" />
                          <span>Learning Goals</span>
                        </h3>
                        <span class="text-xs text-warmgray-500 font-semibold">${currentWs.goals?.filter(g => g.status === 'DONE').length}/${currentWs.goals?.length} Done</span>
                      </div>

                      <form onSubmit=${handleAddGoal} class="flex space-x-2">
                        <input type="text" value=${newGoalText} onChange=${e => setNewGoalText(e.target.value)}
                          placeholder="Add a new milestone goal..."
                          class="flex-1 px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:ring-2 focus:ring-navy-700" />
                        <button type="submit" class="px-3.5 py-2 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex-shrink-0">
                          Add
                        </button>
                      </form>

                      <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                        ${currentWs.goals?.map(g => html`
                          <div key=${g.id} class="p-3 bg-white border border-cream-200 rounded-2xl flex items-start space-x-3 shadow-sm">
                            <button onClick=${() => handleToggleGoal(g.id, g.status)} class="mt-0.5 flex-shrink-0">
                              <${Icon} name="${g.status === 'DONE' ? 'check-circle-2' : 'circle'}" class="w-4 h-4 ${g.status === 'DONE' ? 'text-emerald-600' : 'text-warmgray-400'}" />
                            </button>
                            <div class="flex-1 min-w-0">
                              <p class="text-xs text-navy-900 font-medium ${g.status === 'DONE' ? 'line-through text-warmgray-400' : ''}">${g.goal_description}</p>
                              <span class="text-[10px] text-warmgray-500 mt-0.5 block">${g.user_name || 'Member'}</span>
                            </div>
                          </div>
                        `)}
                      </div>
                    </div>

                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <h3 class="font-serif font-bold text-base text-navy-900 flex items-center space-x-2">
                          <${Icon} name="check-square" class="w-4 h-4 text-navy-700" />
                          <span>Tasks & Practice</span>
                        </h3>
                        <span class="text-xs text-warmgray-500 font-semibold">${currentWs.tasks?.filter(t => t.status === 'COMPLETED').length}/${currentWs.tasks?.length} Completed</span>
                      </div>

                      <form onSubmit=${handleAddTask} class="space-y-2">
                        <input type="text" value=${newTaskTitle} onChange=${e => setNewTaskTitle(e.target.value)}
                          placeholder="Add a new practice exercise or task..."
                          class="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 focus:ring-2 focus:ring-navy-700" />
                        <div class="flex space-x-2">
                          <select value=${newTaskAssignee} onChange=${e => setNewTaskAssignee(e.target.value)}
                            class="flex-1 py-1.5 px-3 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900">
                            <option value=${user?.id || 'user_alice'}>Assign: Me</option>
                            <option value=${currentWs.partner?.id}>Assign: ${currentWs.partner?.name}</option>
                          </select>
                          <input type="date" value=${newTaskDueDate} onChange=${e => setNewTaskDueDate(e.target.value)}
                            class="py-1.5 px-3 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900" />
                          <button type="submit" class="px-3.5 py-1.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-bold">
                            Add
                          </button>
                        </div>
                      </form>

                      <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                        ${currentWs.tasks?.map(t => html`
                          <div key=${t.id} class="p-3 bg-white border border-cream-200 rounded-2xl flex items-start space-x-3 shadow-sm">
                            <button onClick=${() => handleToggleTask(t.id, t.status)} class="mt-0.5 flex-shrink-0">
                              <${Icon} name="${t.status === 'COMPLETED' ? 'check-square' : 'square'}" class="w-4 h-4 ${t.status === 'COMPLETED' ? 'text-navy-700' : 'text-warmgray-400'}" />
                            </button>
                            <div class="flex-1 min-w-0">
                              <p class="text-xs text-navy-900 font-medium ${t.status === 'COMPLETED' ? 'line-through text-warmgray-400' : ''}">${t.title}</p>
                              <div class="flex items-center space-x-2 text-[10px] text-warmgray-500 mt-0.5">
                                <span>For: ${t.assignee_name || 'Assignee'}</span>
                                ${t.due_date && html`<span>• Due: ${new Date(t.due_date).toLocaleDateString()}</span>`}
                              </div>
                            </div>
                          </div>
                        `)}
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            `}
          </div>
        `}
      </div>
    `;
  }

  // ----------------------------------------------------
  // Chat View Component
  // ----------------------------------------------------
  function ChatView({ user, selectedConnectionId, onSelectConnection }) {
    const [threads, setThreads] = useState([]);
    const [activeConnection, setActiveConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const loadThreads = async () => {
      try {
        setLoading(true);
        const data = await api('/api/messages');
        setThreads(data.threads || []);
        
        const targetId = selectedConnectionId || data.threads[0]?.connection_id;
        if (targetId) {
          loadMessages(targetId);
        }
      } catch (err) {
        console.error('Error loading threads:', err);
      } finally {
        setLoading(false);
      }
    };

    const loadMessages = async (connectionId) => {
      try {
        const data = await api(`/api/messages?connection_id=${connectionId}`);
        setActiveConnection(data.connection);
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    };

    useEffect(() => {
      loadThreads();
    }, [user?.id, selectedConnectionId]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!inputMessage.trim() || !activeConnection) return;
      const msgText = inputMessage.trim();
      setInputMessage('');

      try {
        const res = await api('/api/messages', {
          method: 'POST',
          body: JSON.stringify({
            connection_id: activeConnection.id,
            message: msgText
          })
        });
        setMessages(prev => [...prev, res.message]);
      } catch (err) {
        alert(err.message);
      }
    };

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
        <div>
          <h1 class="font-serif text-3xl font-bold text-navy-900">Direct Messages</h1>
          <p class="text-sm text-warmgray-600 mt-1">Real-time peer communication for active skill exchange connections.</p>
        </div>

        <div class="bg-white rounded-3xl border border-cream-300 shadow-boutique overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
          
          <div class="md:col-span-4 border-r border-cream-200 flex flex-col">
            <div class="p-4 border-b border-cream-200 bg-cream-50">
              <h3 class="font-serif font-bold text-sm text-navy-900">Active Conversations</h3>
            </div>
            <div class="overflow-y-auto flex-1 divide-y divide-cream-200">
              ${threads.length === 0 ? html`
                <div class="p-8 text-center text-xs text-warmgray-500">
                  No active connections. Accept a skill request to start chatting!
                </div>
              ` : threads.map(t => html`
                <button key=${t.connection_id} onClick=${() => loadMessages(t.connection_id)}
                  class="w-full text-left p-4 hover:bg-cream-50 flex items-center space-x-3 transition-colors ${activeConnection?.id === t.connection_id ? 'bg-cream-100/80 font-semibold' : ''}">
                  <div class="relative">
                    <img src=${t.partner?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + t.partner?.name} 
                      class="w-11 h-11 rounded-2xl object-cover border border-cream-300" />
                    <span class="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute -bottom-0.5 -right-0.5"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-bold text-navy-900 truncate">${t.partner?.name}</p>
                      <span class="text-[10px] text-warmgray-400">${t.last_message_at ? new Date(t.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p class="text-xs text-warmgray-500 truncate mt-0.5">${t.last_message || 'Start chatting...'}</p>
                  </div>
                  ${t.unread_count > 0 && html`
                    <span class="px-2 py-0.5 bg-navy-700 text-white rounded-full text-[10px] font-bold">${t.unread_count}</span>
                  `}
                </button>
              `)}
            </div>
          </div>

          <div class="md:col-span-8 flex flex-col h-[600px] bg-cream-50/50">
            ${activeConnection ? html`
              <div class="p-4 border-b border-cream-200 bg-white flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <img src=${activeConnection.partner?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + activeConnection.partner?.name} 
                    class="w-10 h-10 rounded-xl object-cover border border-cream-300" />
                  <div>
                    <h3 class="font-serif font-bold text-base text-navy-900 leading-none">${activeConnection.partner?.name}</h3>
                    <span class="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1 mt-1">
                      <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      <span>Online & Ready for Practice</span>
                    </span>
                  </div>
                </div>

                ${activeConnection.workspace_id && html`
                  <span class="text-xs px-3 py-1 bg-cream-100 text-navy-800 rounded-xl font-semibold border border-cream-300">
                    ${activeConnection.workspace_title}
                  </span>
                `}
              </div>

              <div class="flex-1 p-6 overflow-y-auto space-y-4">
                ${messages.length === 0 ? html`
                  <div class="text-center py-12 text-xs text-warmgray-500">
                    No messages yet. Send a greeting to kick off your skill exchange session!
                  </div>
                ` : messages.map(m => {
                  const isMe = m.sender_id === (user?.id || 'user_alice');
                  return html`
                    <div key=${m.id} class="flex items-end space-x-2 ${isMe ? 'justify-end' : 'justify-start'}">
                      ${!isMe && html`
                        <img src=${m.sender_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + m.sender_name} 
                          class="w-7 h-7 rounded-xl object-cover border border-cream-300 flex-shrink-0 mb-1" />
                      `}
                      <div class="max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${isMe ? 'bg-navy-700 text-white rounded-br-none' : 'bg-white text-navy-900 border border-cream-300 rounded-bl-none'}">
                        <p>${m.message}</p>
                        <span class="block text-[10px] mt-1 ${isMe ? 'text-cream-300' : 'text-warmgray-400'} text-right">
                          ${new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  `;
                })}
                <div ref=${messagesEndRef}></div>
              </div>

              <form onSubmit=${handleSendMessage} class="p-4 bg-white border-t border-cream-200 flex items-center space-x-3">
                <input type="text" value=${inputMessage} onChange=${e => setInputMessage(e.target.value)}
                  placeholder="Type your message or share meeting notes..."
                  class="flex-1 px-4 py-3 bg-cream-50 border border-cream-300 rounded-2xl text-xs sm:text-sm text-navy-900 focus:ring-2 focus:ring-navy-700" />
                <button type="submit" class="px-5 py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-2xl font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5">
                  <span>Send</span>
                  <${Icon} name="send" class="w-3.5 h-3.5" />
                </button>
              </form>
            ` : html`
              <div class="flex-1 flex items-center justify-center text-xs text-warmgray-500">
                Select a conversation from the left to start messaging.
              </div>
            `}
          </div>

        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Profile View Component
  // ----------------------------------------------------
  function ProfileView({ user, targetUserId, onEditProfile, onReportUser, onProposeSwap }) {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async () => {
      try {
        setLoading(true);
        const uid = targetUserId || user?.id || 'user_alice';
        const data = await api(`/api/profile?userId=${uid}`);
        setProfileData(data.user);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadProfile();
    }, [user?.id, targetUserId]);

    if (loading) {
      return html`<div class="py-20 text-center"><${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" /></div>`;
    }

    if (!profileData) {
      return html`<div class="py-20 text-center text-warmgray-500">User profile not found.</div>`;
    }

    const isMe = profileData.id === (user?.id || 'user_alice');

    return html`
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
        <div class="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-boutique space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div class="flex items-start space-x-5">
              <img src=${profileData.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + profileData.name} 
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-cream-300 shadow-md flex-shrink-0" />
              <div class="space-y-1">
                <h1 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">${profileData.name}</h1>
                <p class="text-sm text-warmgray-600 font-medium">${profileData.headline || 'SkillSwap Community Member'}</p>
                
                <div class="flex flex-wrap items-center gap-4 text-xs text-warmgray-500 pt-2">
                  <span class="flex items-center space-x-1">
                    <${Icon} name="map-pin" class="w-3.5 h-3.5 text-warmgray-400" />
                    <span>${profileData.profile?.location || 'Worldwide'}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <${Icon} name="clock" class="w-3.5 h-3.5 text-warmgray-400" />
                    <span>${profileData.profile?.availability || 'Flexible'}</span>
                  </span>
                  <span class="flex items-center space-x-1">
                    <${Icon} name="globe" class="w-3.5 h-3.5 text-warmgray-400" />
                    <span>${profileData.profile?.preferred_language || 'English'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              ${isMe ? html`
                <button onClick=${() => onEditProfile(profileData)}
                  class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5">
                  <${Icon} name="edit-3" class="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ` : html`
                <button onClick=${() => onReportUser(profileData.id)}
                  class="px-3.5 py-2.5 bg-cream-100 hover:bg-red-50 hover:text-red-700 text-warmgray-600 border border-cream-300 rounded-xl text-xs font-semibold">
                  <${Icon} name="flag" class="w-3.5 h-3.5" />
                </button>
                <button onClick=${() => onProposeSwap({ user: profileData })}
                  class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-bold shadow-boutique flex items-center space-x-1.5">
                  <${Icon} name="arrow-left-right" class="w-3.5 h-3.5" />
                  <span>Propose Swap</span>
                </button>
              `}
            </div>
          </div>

          <div class="pt-4 border-t border-cream-200">
            <p class="text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">About Me & Background</p>
            <p class="text-xs sm:text-sm text-warmgray-700 leading-relaxed">${profileData.profile?.bio || 'No biography written yet.'}</p>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-boutique space-y-6">
          <h3 class="font-serif font-bold text-lg text-navy-900">Community Trust & Verification Scorecard</h3>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <p class="font-serif text-3xl font-bold text-navy-900">${profileData.ratings?.avg_rating || '5.0'}★</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Overall Rating</p>
            </div>
            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <p class="font-serif text-3xl font-bold text-navy-900">${profileData.ratings?.avg_comm || '5.0'}</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Communication</p>
            </div>
            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <p class="font-serif text-3xl font-bold text-navy-900">${profileData.ratings?.avg_know || '5.0'}</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Knowledge</p>
            </div>
            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <p class="font-serif text-3xl font-bold text-navy-900">${profileData.ratings?.avg_rel || '5.0'}</p>
              <p class="text-xs text-warmgray-500 font-semibold mt-1">Reliability</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-boutique space-y-6">
          <h3 class="font-serif font-bold text-lg text-navy-900">Peer Reviews (${profileData.reviews?.length || 0})</h3>
          
          ${profileData.reviews?.length === 0 ? html`
            <p class="text-xs text-warmgray-500">No reviews yet. Complete a skill exchange to receive your first verified community review.</p>
          ` : html`
            <div class="space-y-4">
              ${profileData.reviews?.map(r => html`
                <div key=${r.id} class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2.5">
                      <img src=${r.reviewer_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + r.reviewer_name} class="w-8 h-8 rounded-xl object-cover border border-cream-300" />
                      <div>
                        <p class="text-xs font-bold text-navy-900">${r.reviewer_name}</p>
                        <p class="text-[10px] text-warmgray-500">${r.workspace_title}</p>
                      </div>
                    </div>
                    <span class="text-xs font-bold text-amber-600">${r.rating} ★★★★★</span>
                  </div>
                  <p class="text-xs text-warmgray-700 leading-relaxed italic">"${r.comment || 'Great exchange partner!'}"</p>
                </div>
              `)}
            </div>
          `}
        </div>

      </div>
    `;
  }

  // ----------------------------------------------------
  // Notifications View Component
  // ----------------------------------------------------
  function NotificationsView({ user, setActiveTab }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await api('/api/notifications');
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadNotifications();
    }, [user?.id]);

    const handleMarkAllRead = async () => {
      try {
        await api('/api/notifications', { method: 'PUT', body: JSON.stringify({ mark_all_read: true }) });
        loadNotifications();
      } catch (err) {
        alert(err.message);
      }
    };

    return html`
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
        <div class="flex items-center justify-between border-b border-cream-300 pb-6">
          <div>
            <h1 class="font-serif text-3xl font-bold text-navy-900">Notifications</h1>
            <p class="text-sm text-warmgray-600 mt-1">Updates on requests, messages, and learning milestones.</p>
          </div>
          <button onClick=${handleMarkAllRead} class="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-navy-900 border border-cream-300 rounded-xl text-xs font-bold">
            Mark All as Read
          </button>
        </div>

        ${loading ? html`
          <div class="py-20 text-center"><${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" /></div>
        ` : notifications.length === 0 ? html`
          <div class="bg-white rounded-3xl p-12 text-center border border-cream-300 max-w-md mx-auto space-y-2">
            <${Icon} name="bell-off" class="w-8 h-8 text-warmgray-400 mx-auto" />
            <h3 class="font-serif text-base font-bold text-navy-900">No New Notifications</h3>
          </div>
        ` : html`
          <div class="bg-white rounded-3xl border border-cream-300 shadow-boutique divide-y divide-cream-200 overflow-hidden">
            ${notifications.map(n => html`
              <div key=${n.id} class="p-4 sm:p-5 flex items-start space-x-3.5 ${!n.is_read ? 'bg-cream-50/70 font-medium' : ''}">
                <div class="w-9 h-9 rounded-xl bg-navy-100 text-navy-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <${Icon} name="${n.type === 'REQUEST' ? 'arrow-left-right' : n.type === 'MESSAGE' ? 'message-square' : 'bell'}" class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-bold text-navy-900">${n.title}</h4>
                    <span class="text-[10px] text-warmgray-400">${new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p class="text-xs text-warmgray-600 mt-0.5 leading-relaxed">${n.message}</p>
                </div>
              </div>
            `)}
          </div>
        `}
      </div>
    `;
  }

  // ----------------------------------------------------
  // Admin View Component
  // ----------------------------------------------------
  function AdminView({ user }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAdminData = async () => {
      try {
        setLoading(true);
        const res = await api('/api/admin');
        setData(res);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadAdminData();
    }, [user?.id]);

    const handleToggleBlock = async (userId, currentStatus) => {
      const nextStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
      try {
        await api('/api/admin/users', {
          method: 'PUT',
          body: JSON.stringify({ userId, status: nextStatus })
        });
        loadAdminData();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleResolveReport = async (reportId) => {
      try {
        await api('/api/admin/reports', {
          method: 'PUT',
          body: JSON.stringify({ report_id: reportId, status: 'RESOLVED', resolution_notes: 'Reviewed and closed by administrator.' })
        });
        loadAdminData();
      } catch (err) {
        alert(err.message);
      }
    };

    if (loading) {
      return html`<div class="py-20 text-center"><${Icon} name="loader" class="w-8 h-8 mx-auto text-navy-700 animate-spin" /></div>`;
    }

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
        <div class="border-b border-cream-300 pb-6">
          <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-red-700">
            <${Icon} name="shield" class="w-4 h-4" />
            <span>Trust, Safety & Community Operations</span>
          </div>
          <h1 class="font-serif text-3xl font-bold text-navy-900 mt-1">SkillSwap Admin Dashboard</h1>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white p-5 rounded-3xl border border-cream-300 shadow-boutique">
            <p class="text-xs text-warmgray-500 font-semibold uppercase">Total Users</p>
            <p class="font-serif text-3xl font-bold text-navy-900 mt-1">${data?.analytics?.users?.total_users || 0}</p>
          </div>
          <div class="bg-white p-5 rounded-3xl border border-cream-300 shadow-boutique">
            <p class="text-xs text-warmgray-500 font-semibold uppercase">Active Exchanges</p>
            <p class="font-serif text-3xl font-bold text-emerald-700 mt-1">${data?.analytics?.exchanges?.active_connections || 0}</p>
          </div>
          <div class="bg-white p-5 rounded-3xl border border-cream-300 shadow-boutique">
            <p class="text-xs text-warmgray-500 font-semibold uppercase">Catalog Skills</p>
            <p class="font-serif text-3xl font-bold text-navy-900 mt-1">${data?.analytics?.skills?.total_skills || 0}</p>
          </div>
          <div class="bg-white p-5 rounded-3xl border border-cream-300 shadow-boutique">
            <p class="text-xs text-warmgray-500 font-semibold uppercase">Open Reports</p>
            <p class="font-serif text-3xl font-bold text-red-600 mt-1">${data?.analytics?.reports?.open_reports || 0}</p>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-cream-300 shadow-boutique space-y-4">
          <h3 class="font-serif font-bold text-lg text-navy-900">User Moderation & Access Control</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-cream-50 text-warmgray-600 font-bold uppercase tracking-wider border-b border-cream-200">
                <tr>
                  <th class="p-3.5">User</th>
                  <th class="p-3.5">Role</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5">Skills</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-cream-100">
                ${data?.recentUsers?.map(u => html`
                  <tr key=${u.id} class="hover:bg-cream-50/50">
                    <td class="p-3.5 flex items-center space-x-3">
                      <img src=${u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.name} class="w-8 h-8 rounded-xl object-cover border border-cream-300" />
                      <div>
                        <p class="font-bold text-navy-900">${u.name}</p>
                        <p class="text-[11px] text-warmgray-500">${u.email}</p>
                      </div>
                    </td>
                    <td class="p-3.5 font-semibold text-navy-900">${u.role}</td>
                    <td class="p-3.5">
                      <span class="px-2 py-0.5 rounded-full font-bold text-[10px] ${u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                        ${u.status}
                      </span>
                    </td>
                    <td class="p-3.5 text-warmgray-600 font-medium">${u.skills_count} skills</td>
                    <td class="p-3.5 text-right">
                      ${u.role !== 'ADMIN' && html`
                        <button onClick=${() => handleToggleBlock(u.id, u.status)}
                          class="px-3 py-1 text-xs font-bold rounded-xl ${u.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}">
                          ${u.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                        </button>
                      `}
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-cream-300 shadow-boutique space-y-4">
          <h3 class="font-serif font-bold text-lg text-navy-900">Community Safety Reports</h3>
          ${data?.recentReports?.length === 0 ? html`
            <p class="text-xs text-warmgray-500">No reports filed.</p>
          ` : html`
            <div class="space-y-3">
              ${data?.recentReports?.map(r => html`
                <div key=${r.id} class="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-center justify-between">
                  <div class="space-y-1">
                    <div class="flex items-center space-x-2">
                      <span class="font-bold text-xs text-navy-900">Report against: ${r.reported_name}</span>
                      <span class="text-[10px] text-warmgray-500">by ${r.reporter_name}</span>
                      <span class="px-2 py-0.2 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">${r.status}</span>
                    </div>
                    <p class="text-xs text-warmgray-700 font-medium">${r.reason}: ${r.details}</p>
                  </div>
                  ${r.status === 'OPEN' && html`
                    <button onClick=${() => handleResolveReport(r.id)} class="px-3.5 py-1.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-bold">
                      Mark Resolved
                    </button>
                  `}
                </div>
              `)}
            </div>
          `}
        </div>

      </div>
    `;
  }

  // ----------------------------------------------------
  // Modals (Propose Swap, Add/Edit Skill)
  // ----------------------------------------------------
  function ProposeSwapModal({ isOpen, onClose, targetMatch, currentUser, onSubmitted }) {
    if (!isOpen || !targetMatch) return null;

    const [teachSkillId, setTeachSkillId] = useState('');
    const [learnSkillId, setLearnSkillId] = useState('');
    const [message, setMessage] = useState('');
    const [availability, setAvailability] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const peer = targetMatch.user || targetMatch;
    const myTeachSkills = currentUser?.skills?.filter(s => s.type === 'TEACH') || [];
    const peerTeachSkills = peer?.teach_skills || [];

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        await api('/api/requests', {
          method: 'POST',
          body: JSON.stringify({
            receiver_id: peer.id,
            teach_skill_id: teachSkillId || null,
            learn_skill_id: learnSkillId || null,
            message: message.trim() || `Hi ${peer.name}! I would love to exchange skills with you.`,
            proposed_availability: availability.trim() || null
          })
        });
        alert('Skill swap proposal sent successfully!');
        onClose();
        onSubmitted?.();
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cream-300 space-y-6 text-left">
          <div class="flex items-center justify-between border-b border-cream-200 pb-4">
            <div>
              <h3 class="font-serif font-bold text-xl text-navy-900">Propose Skill Swap</h3>
              <p class="text-xs text-warmgray-500 mt-0.5">Start a reciprocal exchange with ${peer.name}</p>
            </div>
            <button onClick=${onClose} class="p-1.5 text-warmgray-400 hover:text-navy-900 rounded-xl hover:bg-cream-100">
              <${Icon} name="x" class="w-5 h-5" />
            </button>
          </div>

          <form onSubmit=${handleSubmit} class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-navy-900 mb-1">What you can teach ${peer.name}:</label>
              <select value=${teachSkillId} onChange=${e => setTeachSkillId(e.target.value)}
                class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900">
                <option value="">Select a teaching skill from your profile</option>
                ${myTeachSkills.map(s => html`<option key=${s.skill_id || s.id} value=${s.skill_id || s.id}>${s.skill_name} (${s.level})</option>`)}
              </select>
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">What you want to learn from ${peer.name}:</label>
              <select value=${learnSkillId} onChange=${e => setLearnSkillId(e.target.value)}
                class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900">
                <option value="">Select one of ${peer.name}'s teaching skills</option>
                ${peerTeachSkills.map(s => html`<option key=${s.skill_id || s.id} value=${s.skill_id || s.id}>${s.skill_name} (${s.level})</option>`)}
              </select>
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Introductory Message & Exchange Goals:</label>
              <textarea rows="3" value=${message} onChange=${e => setMessage(e.target.value)}
                placeholder="Explain why you'd make great exchange partners..."
                class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900"></textarea>
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Proposed Meeting Availability:</label>
              <input type="text" value=${availability} onChange=${e => setAvailability(e.target.value)}
                placeholder="e.g. Tuesday evenings 7pm PST / Saturday mornings"
                class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
            </div>

            <div class="pt-4 border-t border-cream-200 flex items-center justify-end space-x-2">
              <button type="button" onClick=${onClose} class="px-4 py-2.5 font-bold text-warmgray-600 hover:bg-cream-100 rounded-xl">
                Cancel
              </button>
              <button type="submit" disabled=${submitting} class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold shadow-sm flex items-center space-x-1.5">
                <span>${submitting ? 'Sending...' : 'Send Proposal'}</span>
                <${Icon} name="send" class="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function AddSkillModal({ isOpen, onClose, skillToEdit, defaultType, onSaved }) {
    if (!isOpen) return null;

    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [skillName, setSkillName] = useState(skillToEdit?.skill_name || '');
    const [type, setType] = useState(skillToEdit?.type || defaultType || 'TEACH');
    const [level, setLevel] = useState(skillToEdit?.level || 'Intermediate');
    const [experienceYears, setExperienceYears] = useState(skillToEdit?.experience_years || 1.0);
    const [description, setDescription] = useState(skillToEdit?.description || '');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      api('/api/skills').then(d => {
        setCategories(d.categories || []);
        if (d.categories?.[0] && !categoryId) setCategoryId(d.categories[0].id);
      }).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        if (skillToEdit?.id) {
          await api('/api/skills/user', {
            method: 'PUT',
            body: JSON.stringify({
              id: skillToEdit.id,
              level,
              experience_years: experienceYears,
              description
            })
          });
        } else {
          await api('/api/skills/user', {
            method: 'POST',
            body: JSON.stringify({
              skill_name: skillName.trim(),
              category_id: categoryId,
              type,
              level,
              experience_years: experienceYears,
              description
            })
          });
        }
        onClose();
        onSaved?.();
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
        <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-cream-300 space-y-6 text-left">
          <div class="flex items-center justify-between border-b border-cream-200 pb-4">
            <h3 class="font-serif font-bold text-xl text-navy-900">${skillToEdit ? 'Edit Skill' : 'Add Skill'}</h3>
            <button onClick=${onClose} class="p-1.5 text-warmgray-400 hover:text-navy-900 rounded-xl hover:bg-cream-100">
              <${Icon} name="x" class="w-5 h-5" />
            </button>
          </div>

          <form onSubmit=${handleSubmit} class="space-y-4 text-xs">
            ${!skillToEdit && html`
              <div>
                <label class="block font-bold text-navy-900 mb-1">Exchange Intent:</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" onClick=${() => setType('TEACH')}
                    class="py-2.5 rounded-xl font-bold text-xs border ${type === 'TEACH' ? 'bg-navy-700 text-white border-navy-700' : 'bg-cream-50 text-navy-900 border-cream-300'}">
                    I Can Teach
                  </button>
                  <button type="button" onClick=${() => setType('LEARN')}
                    class="py-2.5 rounded-xl font-bold text-xs border ${type === 'LEARN' ? 'bg-amber-600 text-white border-amber-600' : 'bg-cream-50 text-navy-900 border-cream-300'}">
                    I Want to Learn
                  </button>
                </div>
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1">Category:</label>
                <select value=${categoryId} onChange=${e => setCategoryId(e.target.value)}
                  class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900">
                  ${categories.map(c => html`<option key=${c.id} value=${c.id}>${c.name}</option>`)}
                </select>
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1">Skill Name:</label>
                <input type="text" value=${skillName} onChange=${e => setSkillName(e.target.value)} required
                  placeholder="e.g. Python, Figma, Spanish, Guitar, Photography..."
                  class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900 font-medium" />
              </div>
            `}

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-navy-900 mb-1">Proficiency Level:</label>
                <select value=${level} onChange=${e => setLevel(e.target.value)}
                  class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              ${type === 'TEACH' && html`
                <div>
                  <label class="block font-bold text-navy-900 mb-1">Years Experience:</label>
                  <input type="number" step="0.5" min="0" value=${experienceYears} onChange=${e => setExperienceYears(e.target.value)}
                    class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900" />
                </div>
              `}
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Description / Practice Goals:</label>
              <textarea rows="3" value=${description} onChange=${e => setDescription(e.target.value)}
                placeholder="What topics within this skill do you cover or want to learn?"
                class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl text-navy-900"></textarea>
            </div>

            <div class="pt-4 border-t border-cream-200 flex items-center justify-end space-x-2">
              <button type="button" onClick=${onClose} class="px-4 py-2.5 font-bold text-warmgray-600 hover:bg-cream-100 rounded-xl">
                Cancel
              </button>
              <button type="submit" disabled=${submitting} class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold shadow-sm">
                <span>${submitting ? 'Saving...' : 'Save Skill'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // ----------------------------------------------------
  // Main Container App Component
  // ----------------------------------------------------
  function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [demoUsers, setDemoUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('matches');
    const [targetProfileUserId, setTargetProfileUserId] = useState(null);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);

    const [swapModalMatch, setSwapModalMatch] = useState(null);
    const [addSkillModalOpen, setAddSkillModalOpen] = useState(false);
    const [addSkillDefaultType, setAddSkillDefaultType] = useState('TEACH');
    const [editingSkill, setEditingSkill] = useState(null);

    const refreshSession = async () => {
      try {
        const sessionData = await api('/api/session');
        if (sessionData.user) {
          setCurrentUser(sessionData.user);
          setUnreadNotifications(sessionData.user.unread_notifications || 0);
          setPendingRequests(sessionData.user.pending_requests || 0);
        }
        const usersData = await api('/api/users/list');
        setDemoUsers(usersData.users || []);
      } catch (err) {
        console.error('Session refresh failed:', err);
      }
    };

    useEffect(() => {
      refreshSession();
    }, []);

    const handleSwitchUser = async (userId) => {
      try {
        await api('/api/session', {
          method: 'POST',
          body: JSON.stringify({ action: 'switch', userId })
        });
        await refreshSession();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleCreateUser = async () => {
      const name = prompt('Enter your name:');
      if (!name) return;
      const email = prompt('Enter your email:');
      if (!email) return;
      const headline = prompt('Enter your headline (e.g. Full-Stack Developer & Guitar Learner):');

      try {
        await api('/api/session', {
          method: 'POST',
          body: JSON.stringify({ action: 'register', name, email, headline })
        });
        await refreshSession();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleLogout = async () => {
      await api('/api/session', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
      refreshSession();
    };

    const handleViewProfile = (userId) => {
      setTargetProfileUserId(userId);
      setActiveTab('profile');
    };

    const handleOpenWorkspace = (workspaceId) => {
      setSelectedWorkspaceId(workspaceId);
      setActiveTab('workspaces');
    };

    const handleOpenChat = (connectionId) => {
      setSelectedConnectionId(connectionId);
      setActiveTab('chat');
    };

    const handleOpenAddSkill = (type = 'TEACH') => {
      setEditingSkill(null);
      setAddSkillDefaultType(type);
      setAddSkillModalOpen(true);
    };

    const handleOpenEditSkill = (skill) => {
      setEditingSkill(skill);
      setAddSkillModalOpen(true);
    };

    const handleDeleteSkill = async (skillId, callback) => {
      if (!confirm('Are you sure you want to remove this skill?')) return;
      try {
        await api('/api/skills/user', {
          method: 'DELETE',
          body: JSON.stringify({ id: skillId })
        });
        callback?.();
        refreshSession();
      } catch (err) {
        alert(err.message);
      }
    };

    return html`
      <div class="min-h-screen flex flex-col justify-between bg-cream-100 font-sans">
        
        <${Header}
          user=${currentUser}
          demoUsers=${demoUsers}
          activeTab=${activeTab}
          setActiveTab=${setActiveTab}
          unreadCount=${unreadNotifications}
          pendingRequestsCount=${pendingRequests}
          onSwitchUser=${handleSwitchUser}
          onOpenRegister=${handleCreateUser}
          onLogout=${handleLogout}
        />

        <main class="flex-1">
          ${activeTab === 'home' && html`
            <${HomeView} 
              user=${currentUser} 
              setActiveTab=${setActiveTab} 
              onOpenRegister=${handleCreateUser} 
            />
          `}

          ${activeTab === 'matches' && html`
            <${MatchesView} 
              user=${currentUser} 
              onProposeSwap=${m => setSwapModalMatch(m)} 
              onViewProfile=${handleViewProfile} 
              setActiveTab=${setActiveTab} 
            />
          `}

          ${activeTab === 'search' && html`
            <${SearchView} 
              onProposeSwap=${m => setSwapModalMatch(m)} 
              onViewProfile=${handleViewProfile} 
            />
          `}

          ${activeTab === 'skills' && html`
            <${SkillsManagementView} 
              user=${currentUser} 
              onAddSkill=${handleOpenAddSkill} 
              onEditSkill=${handleOpenEditSkill} 
              onDeleteSkill=${handleDeleteSkill} 
            />
          `}

          ${activeTab === 'requests' && html`
            <${RequestsView} 
              user=${currentUser} 
              setActiveTab=${setActiveTab} 
              onOpenWorkspace=${handleOpenWorkspace} 
            />
          `}

          ${activeTab === 'workspaces' && html`
            <${WorkspacesView} 
              user=${currentUser} 
              selectedWorkspaceId=${selectedWorkspaceId} 
              onSelectWorkspace=${id => setSelectedWorkspaceId(id)} 
              onOpenChat=${handleOpenChat} 
              onLeaveReview=${() => alert('Review submitted for completed workspace!')} 
            />
          `}

          ${activeTab === 'chat' && html`
            <${ChatView} 
              user=${currentUser} 
              selectedConnectionId=${selectedConnectionId} 
              onSelectConnection=${id => setSelectedConnectionId(id)} 
            />
          `}

          ${activeTab === 'profile' && html`
            <${ProfileView} 
              user=${currentUser} 
              targetUserId=${targetProfileUserId} 
              onEditProfile=${() => alert('Profile editing is enabled directly in My Skills & Persona.')} 
              onReportUser=${() => alert('Report filed for trust & safety moderation.')} 
              onProposeSwap=${m => setSwapModalMatch(m)} 
            />
          `}

          ${activeTab === 'notifications' && html`
            <${NotificationsView} 
              user=${currentUser} 
              setActiveTab=${setActiveTab} 
            />
          `}

          ${activeTab === 'admin' && html`
            <${AdminView} 
              user=${currentUser} 
            />
          `}
        </main>

        <footer class="border-t border-cream-300 bg-cream-50 py-10 mt-16 text-center text-xs text-warmgray-500">
          <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 rounded-lg bg-navy-700 text-cream-100 flex items-center justify-center font-serif font-bold text-xs">S</div>
              <span class="font-serif font-bold text-navy-900">SkillSwap</span>
              <span>— Peer-to-Peer Reciprocal Exchange</span>
            </div>
            <p>© 2026 SkillSwap Platform. Built on Hatchable with Reciprocal Synergy Scoring.</p>
          </div>
        </footer>

        <!-- Modals -->
        <${ProposeSwapModal}
          isOpen=${!!swapModalMatch}
          onClose=${() => setSwapModalMatch(null)}
          targetMatch=${swapModalMatch}
          currentUser=${currentUser}
          onSubmitted=${() => refreshSession()}
        />

        <${AddSkillModal}
          isOpen=${addSkillModalOpen}
          onClose=${() => setAddSkillModalOpen(false)}
          skillToEdit=${editingSkill}
          defaultType=${addSkillDefaultType}
          onSaved=${() => refreshSession()}
        />

      </div>
    `;
  }

  const rootEl = document.getElementById('root');
  if (rootEl) {
    ReactDOM.createRoot(rootEl).render(html`<${App} />`);
  }
})();