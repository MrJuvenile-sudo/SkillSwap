// public/components.js - Premium Shared UI, Modals & Notifications Center for SkillSwap

(function() {
  window.SkillSwap = window.SkillSwap || {};

  const React = window.React;
  const htm = window.htm || self.htm;
  if (!React || !htm) return;

  const { useState, useEffect } = React;
  const html = htm.bind(React.createElement);
  const { api } = window.SkillSwap;


  // ----------------------------------------------------
  // Global API fetcher
  // ----------------------------------------------------
  async function apiFetch(path, options) {

    const opt = options || {};
    const headers = {
      'Content-Type': 'application/json',
      ...(opt.headers || {})
    };
    const res = await fetch(path, { ...opt, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Request failed with status ' + res.status);
    }
    return data;
  }
  window.SkillSwap.api = apiFetch;


  // ----------------------------------------------------
  // Lightweight SVG Icon Component
  // ----------------------------------------------------
  function Icon({ name, class: className }) {
    const cls = className || "w-5 h-5";
    const icons = {
      'sparkles': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
      'compass': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
      'arrow-right': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
      'arrow-left': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
      'layout-grid': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
      'message-square': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      'layers': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5"/></svg>`,
      'users': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      'bell': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
      'star': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'clock': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      'search': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
      'filter': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
      'shield': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
      'x': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
      'trash-2': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
      'chevron-down': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
      'user': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      'award': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
      'log-out': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
      'settings': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      'columns': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>`,
      'book-open': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
      'bot': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="12" x="3" y="6" rx="2"/><path d="M9 11h.01"/><path d="M15 11h.01"/><path d="M12 2v4"/><path d="M12 18v4"/></svg>`,
      'menu': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
      'activity': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      'inbox': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
      'message-circle': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`,
      'circle': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/></svg>`,
      'folder': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z"/></svg>`

    };
    return icons[name] || html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8"/></svg>`;
  }
  window.SkillSwap.Icon = Icon;

  // ----------------------------------------------------
  // Premium Multi-Column Light Footer
  // ----------------------------------------------------
  function Footer({ setActiveTab, onOpenRegister, user }) {

    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
      e.preventDefault();
      if (!newsletterEmail.trim()) return;
      setSubscribed(true);
      setNewsletterEmail('');
    };

    return html`
      <footer class="mt-24 border-t border-cream-300 bg-cream-50/90 text-left">
        ${!user ? html`
          <div class="border-b border-cream-300 bg-gradient-to-r from-cream-100 via-white to-navy-50 py-16 px-4 sm:px-6 lg:px-8">
            <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
              <div class="space-y-2 text-center md:text-left">
                <h3 class="font-serif text-3xl sm:text-4xl font-bold text-navy-900 leading-tight">Ready to trade skills with verified peers?</h3>
                <p class="text-sm text-warmgray-600 max-w-xl">Join thousands of software engineers, designers, creators, and professionals swapping expert knowledge every day.</p>
              </div>
              <div class="flex flex-wrap items-center gap-3.5">
                <button onClick=${onOpenRegister} class="px-7 py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  Get Started Free
                </button>
                <button onClick=${() => setActiveTab('skills-dir')} class="px-7 py-3.5 bg-white hover:bg-cream-100 text-navy-700 border border-navy-200 font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all duration-200">
                  Explore Skills
                </button>
              </div>
            </div>
          </div>
        ` : null}

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 text-sm">
          <div class="lg:col-span-2 space-y-6">
            <div class="flex items-center gap-3">
              <img src="/logo-icon.png" alt="SkillSwapX Logo" class="w-10 h-10 rounded-xl object-contain shadow-sm bg-white p-0.5 border border-cream-200" />
              <span class="font-serif text-2xl font-extrabold text-navy-950 tracking-tight">SkillSwap<span class="text-indigo-600">X</span></span>
            </div>
            <p class="text-warmgray-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              The premium reciprocal peer-to-peer exchange network. Teach what you know best, master what you need next — with explainable synergy matching and collaborative workspaces.
            </p>
            <div class="flex items-center gap-2.5 pt-2">
              <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Synergy Match Engine: Active

              </span>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="font-bold text-navy-900 text-xs tracking-wider uppercase">Platform</h4>
            <ul class="space-y-2.5 text-warmgray-600 text-xs font-medium">
              <li><button onClick=${() => setActiveTab('matches')} class="hover:text-navy-700 transition-colors">Reciprocal Matches</button></li>
              <li><button onClick=${() => setActiveTab('skills-dir')} class="hover:text-navy-700 transition-colors">Skill Directory</button></li>
              <li><button onClick=${() => setActiveTab('community')} class="hover:text-navy-700 transition-colors">Community Feed</button></li>
              <li><button onClick=${() => setActiveTab('skills')} class="hover:text-navy-700 transition-colors">Skill Matrix</button></li>
            </ul>
          </div>

          <div class="space-y-4">
            <h4 class="font-bold text-navy-900 text-xs tracking-wider uppercase">Trust & Legal</h4>
            <ul class="space-y-2.5 text-warmgray-600 text-xs font-medium">
              <li><button onClick=${() => setActiveTab('help')} class="hover:text-navy-700 transition-colors">Help Center & FAQ</button></li>
              <li><button onClick=${() => setActiveTab('guidelines')} class="hover:text-navy-700 transition-colors">Community Guidelines</button></li>
              <li><button onClick=${() => setActiveTab('terms')} class="hover:text-navy-700 transition-colors">Swap Agreements</button></li>
              <li><button onClick=${() => setActiveTab('privacy')} class="hover:text-navy-700 transition-colors">Privacy Policy</button></li>
            </ul>
          </div>

          <div class="space-y-4">
            <h4 class="font-bold text-navy-900 text-xs tracking-wider uppercase">Skill Digest</h4>
            <p class="text-xs text-warmgray-600 leading-relaxed">Weekly curated skill matchups, peer spotlights, and teaching frameworks.</p>
            ${subscribed ? html`
              <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                ✓ Subscribed to weekly digest!

              </div>
            ` : html`
              <form onSubmit=${handleSubscribe} class="space-y-2">
                <input
                  type="email"
                  required
                  value=${newsletterEmail}
                  onChange=${(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  class="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-xs focus:outline-none focus:border-navy-600"
                />
                <button type="submit" class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow transition-all duration-200">

                  Join Newsletter
                </button>
              </form>
            `}
          </div>
        </div>

        <div class="border-t border-cream-200 bg-cream-200/20 py-8 px-4 sm:px-6 lg:px-8 text-xs text-warmgray-600">

          <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © 2026 SkillSwap Platform. Built for authentic peer learning.
            </div>
            <div class="flex flex-wrap items-center gap-4 sm:gap-6">
              <button onClick=${() => setActiveTab('privacy')} class="hover:text-navy-800 transition-colors">Privacy</button>
              <button onClick=${() => setActiveTab('terms')} class="hover:text-navy-800 transition-colors">Terms of Service</button>
              <button onClick=${() => setActiveTab('guidelines')} class="hover:text-navy-800 transition-colors">Guidelines</button>

            </div>
          </div>
        </div>
      </footer>
    `;
  }
  window.SkillSwap.Footer = Footer;

  // ----------------------------------------------------
  // Header Navigation Component with Notification Center
  // ----------------------------------------------------
  function Header({ user, activeTab, setActiveTab, pendingRequestsCount, onLogout, onViewProfile }) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = () => {
      if (!user) return;
      apiFetch('/api/notifications').then(data => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }).catch(console.error);
    };

    useEffect(() => {
      loadNotifications();
    }, [user, pendingRequestsCount]);

    useEffect(() => {
      const handleOutsideClick = (e) => {
        const userContainer = document.getElementById('user-menu-container');
        const notifContainer = document.getElementById('notif-menu-container');
        if (userContainer && !userContainer.contains(e.target)) {
          setUserMenuOpen(false);
        }
        if (notifContainer && !notifContainer.contains(e.target)) {
          setNotifOpen(false);
        }
      };
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleToggleNotif = () => {
      setNotifOpen(!notifOpen);
      if (userMenuOpen) setUserMenuOpen(false);
      loadNotifications();
    };

    const handleMarkAllRead = async () => {
      await apiFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ mark_all_read: true })
      });
      loadNotifications();
    };

    const handleReadNotification = async (id) => {
      await apiFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ id })
      });
      loadNotifications();
    };

    const handleNavClick = (tab) => {
      setActiveTab(tab);
      setMobileOpen(false);
      setUserMenuOpen(false);
      setNotifOpen(false);
    };

    const guestNavLinks = [
      { id: 'home', label: 'Home', icon: 'sparkles' },
      { id: 'features', label: 'Features', icon: 'layers' },
      { id: 'skills-dir', label: 'Skill Directory', icon: 'search' },
      { id: 'community', label: 'Community Feed', icon: 'message-square' },
      { id: 'hub-browse', label: 'Learning Hub', icon: 'book-open' }
    ];

    const authNavLinks = [
      { id: 'dashboard', label: 'Dashboard', icon: 'activity' },
      { id: 'matches', label: 'Matches', badge: 'AI', icon: 'sparkles' },
      { id: 'hub-browse', label: 'Learning Hub', icon: 'book-open' },
      { id: 'community', label: 'Community Feed', icon: 'message-square' },
      { id: 'skills', label: 'My Skills', icon: 'layers' },
      { id: 'requests', label: 'Requests', count: pendingRequestsCount, icon: 'inbox' },
      { id: 'workspaces', label: 'Workspace', icon: 'folder' },
      { id: 'chat', label: 'Chat', icon: 'message-circle' }
    ];

    return html`
      <header class="sticky top-0 z-50 transition-all">
        <!-- Minimalistic Ultra-Premium Top Utility Bar -->
        <div class="bg-gradient-to-r from-navy-955 via-navy-900 to-navy-955 text-cream-200/90 border-b border-navy-800/80 text-[11px] font-medium tracking-tight">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
            <!-- Left Live Indicator & Stats -->
            <div class="flex items-center gap-2 sm:gap-3 text-[10.5px]">
              <span class="inline-flex items-center gap-1.5 font-bold text-white">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live P2P Network</span>
              </span>
              <span class="text-navy-400 hidden sm:inline">•</span>
              <span class="hidden sm:inline text-cream-200/80">14,200+ Verified Swappers</span>
              <span class="text-navy-400 hidden md:inline">•</span>
              <span class="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-navy-800/90 text-amber-300 border border-amber-400/20 shadow-2xs">
                Zero Fees Forever
              </span>
            </div>

            <!-- Center Micro-Announcement -->
            <div class="hidden lg:flex items-center gap-2 text-[10.5px] text-cream-200/70">
              <span class="text-amber-400 font-bold">⚡ AI Synergy Engine:</span>
              <span>Matching 120+ Skills with 99.4% Bilateral Precision</span>
            </div>

            <!-- Right Quick Utility Links -->
            <div class="flex items-center gap-3 sm:gap-4 text-[10.5px] font-semibold text-cream-200/80">
              ${user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(user.role) ? html`
                <button
                  onClick=${() => handleNavClick(activeTab === 'admin' ? 'dashboard' : 'admin')}
                  class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/40 hover:bg-indigo-500/30 transition-all font-bold flex items-center gap-1"
                >
                  <span>🛡️</span>
                  <span>${activeTab === 'admin' ? 'Switch to User Portal' : 'Admin Panel'}</span>
                </button>
                <span class="text-navy-500">•</span>
              ` : null}
              <button onClick=${() => handleNavClick('help')} class="hover:text-white transition-colors flex items-center gap-1">
                <span>How It Works</span>
              </button>
              <span class="text-navy-500">•</span>
              <button onClick=${() => handleNavClick('faq')} class="hover:text-white transition-colors flex items-center gap-1">
                <span>FAQ</span>
              </button>
              <span class="text-navy-500 hidden sm:inline">•</span>
              <div class="hidden sm:flex items-center gap-1 text-emerald-400">
                <span class="text-[9px]">🔒</span>
                <span>Escrow Protected</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Glassmorphic Navbar (Enhanced Height: h-20) -->
        <div class="bg-white/85 backdrop-blur-xl border-b border-cream-300/80 shadow-[0_4px_20px_rgba(0,102,238,0.04)]">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
            
            <!-- Brand Logo & Live Status Pill -->
            <div class="flex items-center gap-3.5 cursor-pointer select-none group" onClick=${() => handleNavClick(user ? 'dashboard' : 'home')}>
              <div class="relative">
                <img src="/logo-icon.png" alt="SkillSwapX Logo" class="w-11 h-11 rounded-xl object-contain shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200 ring-2 ring-navy-600/15 bg-white p-0.5" />
                <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300 animate-pulse"></span>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-1.5">
                  <span class="font-serif text-xl sm:text-2xl font-extrabold text-navy-950 tracking-tight">SkillSwap<span class="text-indigo-600">X</span></span>
                  <span class="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider bg-navy-50 text-navy-700 border border-navy-200/60 shadow-2xs">P2P</span>
                </div>
                <span class="text-[9.5px] font-semibold text-warmgray-500 hidden sm:inline -mt-0.5">Reciprocal Knowledge Barter</span>
              </div>
            </div>

            <!-- Desktop Navigation Bar -->
            <nav class="hidden lg:flex items-center gap-1.5 text-xs font-bold tracking-tight">
              ${!user ? guestNavLinks.map(link => html`
                <button
                  key=${link.id}
                  onClick=${() => handleNavClick(link.id)}
                  class="px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-1.5 relative ${
                    activeTab === link.id
                      ? 'bg-navy-700 text-white shadow-sm font-extrabold'
                      : 'text-warmgray-600 hover:text-navy-900 hover:bg-cream-200/60'
                  }"
                >
                  <span>${link.label}</span>
                </button>
              `) : html`
                ${authNavLinks.map(link => html`
                  <button
                    key=${link.id}
                    onClick=${() => handleNavClick(link.id)}
                    class="px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 relative ${
                      activeTab === link.id
                        ? 'bg-navy-700 text-white shadow-sm font-extrabold'
                        : 'text-warmgray-600 hover:text-navy-900 hover:bg-cream-200/60'
                    }"
                  >
                    <span>${link.label}</span>
                    ${link.badge ? html`
                      <span class="px-1 py-0.2 text-[8px] font-black rounded-md ${activeTab === link.id ? 'bg-white/20 text-white' : 'bg-navy-100 text-navy-700'}">${link.badge}</span>
                    ` : null}
                    ${link.count > 0 ? html`
                      <span class="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-white shadow-xs">${link.count}</span>
                    ` : null}
                  </button>
                `)}
                <!-- (Admin Panel link moved inside Admin Profile dropdown) -->
              `}
            </nav>

            <!-- Right Controls / Auth / Profile Actions -->
            <div class="flex items-center gap-2.5 sm:gap-3">
              ${!user ? html`
                <button onClick=${() => handleNavClick('skills-dir')} class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-navy-700 bg-navy-50 hover:bg-navy-100 border border-navy-200/60 rounded-xl transition-all">
                  <${Icon} name="search" class="w-3.5 h-3.5" />
                  <span>Explore</span>
                </button>
                <button onClick=${() => handleNavClick('login')} class="px-4 py-2 text-xs sm:text-sm font-bold text-navy-900 hover:text-navy-700 hover:bg-cream-100 rounded-xl transition-all">
                  Log In
                </button>
                <button onClick=${() => handleNavClick('signup')} class="px-5 py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-navy-700 to-navy-800 hover:from-navy-800 hover:to-navy-900 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5">
                  <span>Join Free</span>
                  <${Icon} name="arrow-right" class="w-3.5 h-3.5" />
                </button>
              ` : html`
                <!-- Notification center dropdown toggle -->
                <div class="relative" id="notif-menu-container">
                  <button onClick=${handleToggleNotif} class="p-2 rounded-xl hover:bg-cream-200/70 border border-transparent hover:border-cream-300 relative transition-all duration-200">
                    <${Icon} name="bell" class="w-5 h-5 text-navy-900" />
                    ${unreadCount > 0 ? html`<span class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-600 border-2 border-cream-100 animate-pulse"></span>` : null}
                  </button>

                  <!-- Notifications list dropdown -->
                  ${notifOpen ? html`
                    <div class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-cream-200 py-3 z-50 text-xs text-left animate-fadeIn ring-1 ring-black/5">
                      <div class="px-4 pb-2.5 border-b border-cream-100 flex items-center justify-between font-bold text-navy-950">
                        <span class="flex items-center gap-1.5">
                          <${Icon} name="bell" class="w-3.5 h-3.5 text-navy-600" />
                          Notifications (${unreadCount})
                        </span>
                        ${unreadCount > 0 ? html`
                          <button onClick=${handleMarkAllRead} class="text-[10px] text-navy-700 hover:underline font-bold">Mark all read</button>
                        ` : null}
                      </div>
                      
                      <div class="max-h-72 overflow-y-auto divide-y divide-cream-100/50 mt-1">
                        ${notifications.map(n => html`
                          <div
                            key=${n.id}
                            onClick=${() => { handleReadNotification(n.id); if (n.link) handleNavClick(n.link.split('/')[1] || 'dashboard'); setNotifOpen(false); }}
                            class="p-3.5 hover:bg-cream-50/70 cursor-pointer flex flex-col gap-1 transition-colors ${!n.is_read ? 'bg-navy-50/40 font-semibold' : ''}"
                          >
                            <div class="flex justify-between items-center text-[10px] text-warmgray-500">
                              <span class="font-bold text-navy-800 truncate">${n.title}</span>
                              <span class="shrink-0">${new Date(n.created_at).toLocaleDateString()}</span>
                            </div>
                            <p class="text-warmgray-600 leading-normal text-[11px]">${n.message}</p>
                          </div>
                        `)}
                        ${notifications.length === 0 ? html`<p class="text-center text-warmgray-400 py-8 italic">No notifications logged.</p>` : null}
                      </div>
                    </div>
                  ` : null}
                </div>

                <!-- User profile dropdown toggle -->
                <div class="relative" id="user-menu-container">
                  <button onClick=${() => { setUserMenuOpen(!userMenuOpen); if (notifOpen) setNotifOpen(false); }} class="flex items-center gap-2.5 p-1.5 pl-2 rounded-2xl hover:bg-cream-200/70 border border-cream-200 hover:border-cream-300 transition-all duration-200 group bg-white shadow-2xs">
                    <div class="relative">
                      ${['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? html`
                        <div class="w-9 h-9 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs border border-indigo-500">
                          🛡️
                        </div>
                      ` : html`
                        <img src=${user.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop'} alt=${user.name} class="w-9 h-9 rounded-full object-cover ring-2 ring-navy-600/30 group-hover:ring-navy-600 shadow-xs transition-all duration-200" />
                        <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300"></span>
                      `}
                    </div>
                    <div class="hidden sm:flex flex-col text-left -space-y-0.5">
                      <span class="font-bold text-xs text-navy-950 flex items-center gap-1">
                        <span>${['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? user.name : (user.name || 'User').split(' ')[0]}</span>
                        <span class="text-[9px] text-emerald-600 font-extrabold">✓</span>
                      </span>
                      <span class="text-[10px] text-warmgray-500 font-semibold">
                        ${['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? 'Administrator' : '4.9★ Karma'}
                      </span>
                    </div>
                    <${Icon} name="chevron-down" class="w-3.5 h-3.5 text-warmgray-400 group-hover:text-navy-900 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}" />
                  </button>

                  ${userMenuOpen ? html`
                    <div class="absolute right-0 mt-2.5 w-72 bg-white rounded-3xl shadow-2xl border border-cream-300 py-3 z-50 text-xs text-left animate-fadeIn ring-1 ring-black/5 overflow-hidden">
                      <div class="px-4 py-3.5 border-b border-cream-100 mb-2 bg-gradient-to-br from-navy-50/80 to-cream-50/60 flex items-center gap-3.5">
                        <div class="relative shrink-0">
                          ${['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? html`
                            <div class="w-12 h-12 rounded-2xl bg-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-md border border-indigo-500">
                              🛡️
                            </div>
                          ` : html`
                            <img src=${user.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=140&h=140&fit=crop'} alt=${user.name} class="w-12 h-12 rounded-2xl object-cover ring-2 ring-navy-600 shadow-md" />
                            <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300"></span>
                          `}
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="font-bold text-navy-950 text-sm truncate flex items-center gap-1">
                            <span>${user.name}</span>
                            <span class="text-navy-600 font-black text-xs" title="Verified Swapper">✓</span>
                          </p>
                          <p class="text-warmgray-500 truncate text-[11px]">@${user.username || 'admin'}</p>
                          <div class="flex items-center gap-1.5 mt-1">
                            ${['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? html`
                              <span class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-[9px] uppercase tracking-wider border border-purple-300">Super Admin</span>
                            ` : html`
                              <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-extrabold text-[9px] uppercase tracking-wider border border-emerald-200">Karma: 4.9★</span>
                            `}
                          </div>
                        </div>
                      </div>
                      ${['SUPER_ADMIN', 'ADMIN'].includes(user.role) ? html`
                        <button onClick=${() => { setUserMenuOpen(false); handleNavClick(activeTab === 'admin' ? 'dashboard' : 'admin'); }} class="w-full text-left px-4 py-2.5 hover:bg-indigo-50 text-indigo-900 flex items-center gap-2.5 transition-colors font-bold">
                          <${Icon} name="shield" class="w-4 h-4 text-indigo-600" /> ${activeTab === 'admin' ? 'Switch to User Portal' : 'Admin Panel'}
                        </button>
                      ` : html`
                        <button onClick=${() => { setUserMenuOpen(false); if (onViewProfile && user) { onViewProfile(user.username || user.id); } else { handleNavClick('public-profile'); } }} class="w-full text-left px-4 py-2.5 hover:bg-cream-100 text-warmgray-700 flex items-center gap-2.5 transition-colors font-semibold">
                          <${Icon} name="user" class="w-4 h-4 text-navy-600" /> View Public Profile
                        </button>
                        <button onClick=${() => { setUserMenuOpen(false); handleNavClick('skills'); }} class="w-full text-left px-4 py-2.5 hover:bg-cream-100 text-warmgray-700 flex items-center gap-2.5 transition-colors font-semibold">
                          <${Icon} name="layers" class="w-4 h-4 text-navy-600" /> Manage Teach & Learn
                        </button>
                        <button onClick=${() => { setUserMenuOpen(false); handleNavClick('settings'); }} class="w-full text-left px-4 py-2.5 hover:bg-cream-100 text-warmgray-700 flex items-center gap-2.5 transition-colors font-semibold">
                          <${Icon} name="settings" class="w-4 h-4 text-navy-600" /> Account & Preferences
                        </button>
                      `}
                      <div class="border-t border-cream-100 my-2"></div>
                      <button onClick=${() => { setUserMenuOpen(false); onLogout(); }} class="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-700 flex items-center gap-2.5 font-bold transition-colors">
                        <${Icon} name="log-out" class="w-4 h-4 text-rose-500" /> Log Out

                      </button>
                    </div>
                  ` : null}
                </div>
              `}
              <!-- Mobile Menu Toggle Button -->
              <button
                onClick=${() => setMobileOpen(!mobileOpen)}
                class="lg:hidden p-2 rounded-xl text-navy-900 hover:bg-cream-200/70 border border-cream-300 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                <${Icon} name=${mobileOpen ? 'x' : 'menu'} class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

        <!-- Mobile Drawer Navigation -->
        ${mobileOpen ? html`
          <div class="lg:hidden bg-white/95 backdrop-blur-xl border-t border-cream-200 px-4 py-4 space-y-2 animate-fadeIn shadow-xl">
            <div class="space-y-1">
              ${(!user ? guestNavLinks : authNavLinks).map(link => html`
                <button
                  key=${link.id}
                  onClick=${() => handleNavClick(link.id)}
                  class="w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
                    activeTab === link.id ? 'bg-navy-700 text-white' : 'text-warmgray-700 hover:bg-cream-100'
                  }"
                >
                  <span class="flex items-center gap-2.5">
                    <${Icon} name=${link.icon || 'circle'} class="w-4 h-4" />
                    ${link.label}
                  </span>
                  ${link.count > 0 ? html`
                    <span class="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white">${link.count}</span>
                  ` : null}
                </button>
              `)}
              ${user && user.role === 'ADMIN' ? html`
                <button
                  onClick=${() => handleNavClick('admin')}
                  class="w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 text-amber-800 bg-amber-50 border border-amber-200"
                >
                  🛡️ Admin Console
                </button>
              ` : null}
            </div>

            ${!user ? html`
              <div class="pt-3 border-t border-cream-200 grid grid-cols-2 gap-2">
                <button onClick=${() => handleNavClick('login')} class="w-full py-2.5 text-center font-bold text-navy-900 bg-cream-100 hover:bg-cream-200 rounded-xl text-xs">
                  Log In
                </button>
                <button onClick=${() => handleNavClick('signup')} class="w-full py-2.5 text-center font-bold text-white bg-navy-700 hover:bg-navy-800 rounded-xl text-xs shadow-sm">
                  Join Free →
                </button>
              </div>
            ` : html`
              <div class="pt-3 border-t border-cream-200 space-y-1">
                <button onClick=${() => { setMobileOpen(false); if (onViewProfile && user) { onViewProfile(user.username || user.id); } else { handleNavClick('public-profile'); } }} class="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-warmgray-700 hover:bg-cream-100 flex items-center gap-2.5">
                  <${Icon} name="user" class="w-4 h-4 text-navy-600" /> View Public Profile
                </button>
                <button onClick=${() => { setMobileOpen(false); handleNavClick('settings'); }} class="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-warmgray-700 hover:bg-cream-100 flex items-center gap-2.5">
                  <${Icon} name="settings" class="w-4 h-4 text-navy-600" /> Account & Preferences
                </button>
                <button onClick=${() => { setMobileOpen(false); onLogout(); }} class="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 flex items-center gap-2.5">
                  <${Icon} name="log-out" class="w-4 h-4 text-rose-500" /> Log Out
                </button>
              </div>
            `}
          </div>
        ` : null}

      </header>
    `;
  }
  window.SkillSwap.Header = Header;

  // ----------------------------------------------------
  // Proposal Modal
  // ----------------------------------------------------
  function ProposalModal({ isOpen, onClose, targetMatch, onSubmitted }) {
    if (!isOpen || !targetMatch) return null;

    const peer = targetMatch.user || targetMatch;
    const [message, setMessage] = useState('');
    const [duration, setDuration] = useState(4);
    const [cadence, setCadence] = useState('Weekly (1-2 hrs)');

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        await api('/api/requests', {
          method: 'POST',
          body: JSON.stringify({
            receiver_id: peer.id,
            duration_weeks: duration,
            cadence: cadence,
            message: message.trim() || `Hi ${peer.name}! I would love to exchange skills with you.`
          })
        });

        onClose();
        onSubmitted?.();
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-955/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl max-w-lg w-full p-8 border border-cream-300 shadow-2xl space-y-6 text-left text-xs">
          <div class="flex items-center justify-between border-b border-cream-200 pb-4">
            <div>
              <h3 class="font-serif font-bold text-xl text-navy-900">Propose Skill Swap</h3>
              <p class="text-[11px] text-warmgray-500 mt-0.5">Send exchange proposal details to ${peer.name}</p>
            </div>
            <button onClick=${onClose} class="p-1 rounded-lg hover:bg-cream-100 text-warmgray-600 transition-colors">
              <${Icon} name="x" class="w-4 h-4" />
            </button>
          </div>

          <form onSubmit=${handleSubmit} class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-navy-950 mb-1.5">Exchange Duration</label>
                <select value=${duration} onChange=${e => setDuration(Number(e.target.value))} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-semibold text-navy-900">
                  <option value=${2}>2 Weeks (Fast Track)</option>
                  <option value=${4}>4 Weeks (Standard)</option>
                  <option value=${8}>8 Weeks (Extended)</option>
                  <option value=${12}>12 Weeks (Deep Dive)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-navy-950 mb-1.5">Meeting Cadence</label>
                <select value=${cadence} onChange=${e => setCadence(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-semibold text-navy-900">
                  <option value="Weekly (1-2 hrs)">Weekly (1-2 hrs)</option>
                  <option value="Bi-Weekly (2-3 hrs)">Bi-Weekly (2-3 hrs)</option>
                  <option value="Flexible Schedule">Flexible / As Agreed</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-navy-955 mb-1.5">Personalized Introduction Message</label>
              <textarea
                required
                rows="4"
                value=${message}
                onChange=${e => setMessage(e.target.value)}
                placeholder="Hi ${peer.name}, I noticed we have a high synergy match! I'd love to learn your skills in exchange for sharing my expertise. Let's arrange a brief setup call next week!"
                class="w-full p-3.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 leading-relaxed text-navy-900"
              ></textarea>
            </div>

            <button type="submit" disabled=${submitting} class="w-full py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              ${submitting ? 'Sending Proposal...' : 'Send Reciprocal Exchange Proposal →'}

            </button>
          </form>
        </div>
      </div>
    `;
  }
  window.SkillSwap.ProposalModal = ProposalModal;

  // ----------------------------------------------------
  // Side-by-Side Peer Compare Modal
  // ----------------------------------------------------
  function CompareModal({ isOpen, onClose, peer1, peer2, onProposeSwap }) {
    if (!isOpen || !peer1 || !peer2) return null;

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-955/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl max-w-3xl w-full p-8 border border-cream-300 shadow-2xl space-y-6 text-left text-xs">
          <div class="flex items-center justify-between border-b border-cream-200 pb-4">
            <div>
              <h3 class="font-serif font-bold text-xl text-navy-900">Side-by-Side Peer Comparison</h3>
              <p class="text-[11px] text-warmgray-500 mt-0.5">Compare profiles to choose the best learning match</p>
            </div>
            <button onClick=${onClose} class="p-1 rounded-lg hover:bg-cream-100 text-warmgray-600 transition-colors">
              <${Icon} name="x" class="w-4 h-4" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="p-5 bg-cream-50/50 rounded-2xl border border-cream-200 space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <img src=${peer1.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} class="w-12 h-12 rounded-xl object-cover border border-cream-300" />
                  <div>
                    <h4 class="font-bold text-navy-900 text-sm">${peer1.name}</h4>
                    <p class="text-[10px] text-warmgray-500">${peer1.location || 'Remote'}</p>
                  </div>
                </div>
                <p class="text-[11px] font-semibold text-navy-950 line-clamp-1 border-t border-cream-200/60 pt-2">${peer1.headline || 'SkillSwap Member'}</p>
                <p class="text-[11px] text-warmgray-600 line-clamp-3 leading-relaxed">${peer1.profile?.bio || 'No bio provided.'}</p>
              </div>
              <button onClick=${() => { onClose(); onProposeSwap({ user: peer1 }); }} class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow transition-all duration-200">
                Propose Swap with ${peer1.name.split(' ')[0]}
              </button>
            </div>

            <div class="p-5 bg-cream-50/50 rounded-2xl border border-cream-200 space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <img src=${peer2.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} class="w-12 h-12 rounded-xl object-cover border border-cream-300" />
                  <div>
                    <h4 class="font-bold text-navy-900 text-sm">${peer2.name}</h4>
                    <p class="text-[10px] text-warmgray-500">${peer2.location || 'Remote'}</p>
                  </div>
                </div>
                <p class="text-[11px] font-semibold text-navy-950 line-clamp-1 border-t border-cream-200/60 pt-2">${peer2.headline || 'SkillSwap Member'}</p>
                <p class="text-[11px] text-warmgray-600 line-clamp-3 leading-relaxed">${peer2.profile?.bio || 'No bio provided.'}</p>
              </div>
              <button onClick=${() => { onClose(); onProposeSwap({ user: peer2 }); }} class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow transition-all duration-200">
                Propose Swap with ${peer2.name.split(' ')[0]}
              </button>

            </div>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.CompareModal = CompareModal;
})();