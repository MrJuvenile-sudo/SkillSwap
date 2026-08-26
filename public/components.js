// public/components.js - Core Shared UI & Modals for SkillSwap
(function() {
  window.SkillSwap = window.SkillSwap || {};

  const React = window.React;
  const htm = window.htm || self.htm;
  if (!React || !htm) return;

  const { useState } = React;
  const html = htm.bind(React.createElement);

  // ----------------------------------------------------
  // Global API fetcher
  // ----------------------------------------------------
  async function api(path, options) {
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
  window.SkillSwap.api = api;

  // ----------------------------------------------------
  // Lightweight SVG Icon Component
  // ----------------------------------------------------
  function Icon({ name, class: className }) {
    const cls = className || "w-5 h-5";
    const icons = {
      'sparkles': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
      'compass': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
      'arrow-right': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
      'arrow-left': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
      'layout-grid': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
      'message-square': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      'layers': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-9.17 4.16a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-9.17 4.16a2 2 0 0 1-1.66 0L2 17.5"/></svg>`,
      'users': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      'bell': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
      'star': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      'clock': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      'search': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
      'filter': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
      'shield': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
      'x': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
      'trash-2': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
      'chevron-down': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
      'user': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      'award': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
      'log-out': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
      'settings': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      'columns': html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/></svg>`
    };
    return icons[name] || html`<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8"/></svg>`;
  }
  window.SkillSwap.Icon = Icon;

  // ----------------------------------------------------
  // Premium Multi-Column Light Footer
  // ----------------------------------------------------
  function Footer({ setActiveTab, onOpenRegister }) {
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
      e.preventDefault();
      if (!newsletterEmail.trim()) return;
      setSubscribed(true);
      setNewsletterEmail('');
    };

    return html`
      <footer class="mt-20 border-t border-cream-300 bg-cream-50/70 text-left">
        <div class="border-b border-cream-300 bg-gradient-to-r from-cream-100 via-white to-navy-50 py-12 px-4 sm:px-6 lg:px-8">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="space-y-1.5 text-center md:text-left">
              <h3 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">Ready to trade skills with verified peers?</h3>
              <p class="text-sm text-warmgray-600">Join thousands of engineers, designers, polyglots, and creators swapping knowledge every day.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onClick=${() => onOpenRegister ? onOpenRegister() : setActiveTab('signup')} class="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold text-sm rounded-xl shadow-md transition-all">
                Get Started Free
              </button>
              <button onClick=${() => setActiveTab('matches')} class="px-6 py-3 bg-white hover:bg-cream-100 text-navy-700 border border-navy-200 font-bold text-sm rounded-xl shadow-sm transition-all">
                Explore Matches
              </button>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-sm">
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-navy-700 text-cream-100 flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                S
              </div>
              <span class="font-serif text-xl font-bold text-navy-900 tracking-tight">SkillSwap</span>
            </div>
            <p class="text-warmgray-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              The reciprocal peer-to-peer exchange network. Teach what you know best, master what you need next — with explainable synergy matching and collaborative workspaces.
            </p>
            <div class="flex items-center gap-2.5 pt-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Synergy Engine: Operational
              </span>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="font-bold text-navy-900 text-xs tracking-wider uppercase">Platform</h4>
            <ul class="space-y-2 text-warmgray-600 text-xs">
              <li><button onClick=${() => setActiveTab('matches')} class="hover:text-navy-700">Reciprocal Matches</button></li>
              <li><button onClick=${() => setActiveTab('skills-dir')} class="hover:text-navy-700">Skill Directory</button></li>
              <li><button onClick=${() => setActiveTab('skills')} class="hover:text-navy-700">Skill Matrix</button></li>
              <li><button onClick=${() => setActiveTab('workspaces')} class="hover:text-navy-700">Workspaces</button></li>
            </ul>
          </div>

          <div class="space-y-3">
            <h4 class="font-bold text-navy-900 text-xs tracking-wider uppercase">Resources</h4>
            <ul class="space-y-2 text-warmgray-600 text-xs">
              <li><button onClick=${() => setActiveTab('help')} class="hover:text-navy-700">Help Center & FAQ</button></li>
              <li><button onClick=${() => setActiveTab('guidelines')} class="hover:text-navy-700">Swap Etiquette</button></li>
              <li><button onClick=${() => setActiveTab('terms')} class="hover:text-navy-700">Exchange Agreements</button></li>
            </ul>
          </div>

          <div class="space-y-3">
            <h4 class="font-bold text-navy-900 text-xs tracking-wider uppercase">Skill Digest</h4>
            <p class="text-xs text-warmgray-600">Weekly curated skill matchups, peer spotlights, and teaching frameworks.</p>
            ${subscribed ? html`
              <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                ✓ You are subscribed to the weekly digest!
              </div>
            ` : html`
              <form onSubmit=${handleSubscribe} class="space-y-2">
                <input
                  type="email"
                  required
                  value=${newsletterEmail}
                  onChange=${(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  class="w-full px-3.5 py-2.5 bg-white border border-cream-300 rounded-xl text-xs focus:outline-none focus:border-navy-600"
                />
                <button type="submit" class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all">
                  Join Newsletter
                </button>
              </form>
            `}
          </div>
        </div>

        <div class="border-t border-cream-200 bg-cream-200/50 py-6 px-4 sm:px-6 lg:px-8 text-xs text-warmgray-600">
          <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © 2026 SkillSwap Platform. Built for authentic peer learning.
            </div>
            <div class="flex flex-wrap items-center gap-4 sm:gap-6">
              <button onClick=${() => setActiveTab('privacy')} class="hover:text-navy-800">Privacy Policy</button>
              <button onClick=${() => setActiveTab('terms')} class="hover:text-navy-800">Terms of Service</button>
              <button onClick=${() => setActiveTab('guidelines')} class="hover:text-navy-800">Community Guidelines</button>
            </div>
          </div>
        </div>
      </footer>
    `;
  }
  window.SkillSwap.Footer = Footer;

  // ----------------------------------------------------
  // Header Navigation Component
  // ----------------------------------------------------
  function Header({ user, activeTab, setActiveTab, pendingRequestsCount, onLogout }) {
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return html`
      <header class="sticky top-0 z-40 bg-cream-100/90 backdrop-blur-md border-b border-cream-300 transition-all">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3 cursor-pointer" onClick=${() => setActiveTab(user ? 'dashboard' : 'home')}>
              <div class="w-9 h-9 rounded-2xl bg-navy-700 text-cream-100 flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                S
              </div>
              <div>
                <span class="font-serif text-xl font-bold text-navy-900 tracking-tight">SkillSwap</span>
                <span class="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cream-200 text-navy-800">P2P Exchange</span>
              </div>
            </div>

            <nav class="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
              ${!user ? html`
                <button onClick=${() => setActiveTab('home')} class="px-3.5 py-2 rounded-xl transition-all ${activeTab === 'home' ? 'bg-cream-200 font-bold text-navy-900' : 'text-warmgray-600 hover:text-navy-900'}">Home</button>
                <button onClick=${() => setActiveTab('skills-dir')} class="px-3.5 py-2 rounded-xl transition-all ${activeTab === 'skills-dir' ? 'bg-cream-200 font-bold text-navy-900' : 'text-warmgray-600 hover:text-navy-900'}">Directory</button>
                <button onClick=${() => setActiveTab('help')} class="px-3.5 py-2 rounded-xl transition-all ${activeTab === 'help' ? 'bg-cream-200 font-bold text-navy-900' : 'text-warmgray-600 hover:text-navy-900'}">How It Works</button>
              ` : html`
                <button onClick=${() => setActiveTab('dashboard')} class="px-3 py-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white shadow-sm font-bold text-navy-900' : 'text-warmgray-600 hover:text-navy-900'}">
                  Dashboard
                </button>
                <button onClick=${() => setActiveTab('matches')} class="px-3 py-2 rounded-xl transition-all ${activeTab === 'matches' ? 'bg-white shadow-sm font-bold text-navy-900' : 'text-warmgray-600 hover:text-navy-900'}">
                  Matches
                </button>
                <button onClick=${() => setActiveTab('skills')} class="px-3 py-2 rounded-xl transition-all ${activeTab === 'skills' ? 'bg-white shadow-sm font-bold text-navy-900' : 'text-warmgray-600 hover:text-navy-900'}">
                  My Skills
                </button>
                <button onClick=${() => setActiveTab('requests')} class="px-3 py-2 rounded-xl relative transition-all ${activeTab === 'requests' ? 'bg-white shadow-sm font-bold text-navy-900' : 'text-warmgray-600 hover:text-navy-900'}">
                  Requests
                  ${pendingRequestsCount > 0 ? html`<span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">${pendingRequestsCount}</span>` : null}
                </button>
                <button onClick=${() => setActiveTab('workspaces')} class="px-3 py-2 rounded-xl transition-all ${activeTab === 'workspaces' ? 'bg-white shadow-sm font-bold text-navy-900' : 'text-warmgray-600 hover:text-navy-900'}">
                  Workspace
                </button>
                <button onClick=${() => setActiveTab('chat')} class="px-3 py-2 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm font-bold text-navy-900' : 'text-warmgray-600 hover:text-navy-900'}">
                  Chat
                </button>
              `}
            </nav>

            <div class="flex items-center gap-3">
              ${!user ? html`
                <button onClick=${() => setActiveTab('login')} class="px-4 py-2 text-sm font-bold text-navy-900 hover:text-navy-700">
                  Log In
                </button>
                <button onClick=${() => setActiveTab('signup')} class="px-5 py-2.5 text-sm font-bold bg-navy-700 hover:bg-navy-800 text-white rounded-xl shadow-sm transition-all">
                  Join Free
                </button>
              ` : html`
                <div class="relative">
                  <button onClick=${() => setUserMenuOpen(!userMenuOpen)} class="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-cream-200 transition-all">
                    <img src=${user.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'} alt=${user.name} class="w-8 h-8 rounded-full object-cover border border-cream-300 shadow-sm" />
                    <span class="hidden sm:inline font-bold text-xs text-navy-900">${(user.name || 'User').split(' ')[0]}</span>
                    <${Icon} name="chevron-down" class="w-3.5 h-3.5 text-warmgray-500" />
                  </button>

                  ${userMenuOpen ? html`
                    <div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 text-xs text-left">
                      <div class="px-4 py-2.5 border-b border-cream-100">
                        <p class="font-bold text-navy-900 text-sm truncate">${user.name}</p>
                        <p class="text-warmgray-500 truncate">@${user.username || 'member'}</p>
                      </div>
                      <button onClick=${() => { setUserMenuOpen(false); setActiveTab('public-profile'); }} class="w-full text-left px-4 py-2 hover:bg-cream-100 text-warmgray-700 flex items-center gap-2">
                        <${Icon} name="user" class="w-4 h-4" /> View Public Profile
                      </button>
                      <button onClick=${() => { setUserMenuOpen(false); setActiveTab('skills'); }} class="w-full text-left px-4 py-2 hover:bg-cream-100 text-warmgray-700 flex items-center gap-2">
                        <${Icon} name="layers" class="w-4 h-4" /> Manage Teach & Learn
                      </button>
                      <button onClick=${() => { setUserMenuOpen(false); setActiveTab('settings'); }} class="w-full text-left px-4 py-2 hover:bg-cream-100 text-warmgray-700 flex items-center gap-2">
                        <${Icon} name="settings" class="w-4 h-4" /> Account & Preferences
                      </button>
                      <div class="border-t border-cream-100 my-1"></div>
                      <button onClick=${() => { setUserMenuOpen(false); onLogout(); }} class="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 font-bold">
                        <${Icon} name="log-out" class="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  ` : null}
                </div>
              `}
            </div>
          </div>
        </div>
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
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setSubmitting(true);
        await api('/api/requests', {
          method: 'POST',
          body: JSON.stringify({
            receiver_id: peer.id,
            duration_weeks: 4,
            cadence: 'Weekly (1-2 hrs)',
            message: message.trim() || ('Hi ' + peer.name + '! I would love to exchange skills with you.')
          })
        });
        alert('Exchange proposal sent!');
        onClose();
        onSubmitted?.();
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl max-w-md w-full p-8 border border-cream-300 shadow-2xl space-y-4 text-left text-xs">
          <div class="flex items-center justify-between border-b border-cream-200 pb-3">
            <h3 class="font-serif font-bold text-lg text-navy-900">Propose Swap with ${peer.name}</h3>
            <button onClick=${onClose}><${Icon} name="x" class="w-4 h-4" /></button>
          </div>

          <form onSubmit=${handleSubmit} class="space-y-4">
            <div>
              <label class="block font-bold mb-1">Introductory Note</label>
              <textarea rows="3" value=${message} onChange=${e => setMessage(e.target.value)} placeholder="Introduce yourself and outline your learning goals..." class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl"></textarea>
            </div>

            <button type="submit" disabled=${submitting} class="w-full py-3 bg-navy-700 text-white font-bold rounded-xl shadow-md">
              ${submitting ? 'Sending...' : 'Send Proposal'}
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
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-8 border border-cream-300 shadow-2xl space-y-4 text-left text-xs">
          <div class="flex items-center justify-between border-b border-cream-200 pb-3">
            <h3 class="font-serif font-bold text-lg text-navy-900">Side-by-Side Peer Comparison</h3>
            <button onClick=${onClose}><${Icon} name="x" class="w-4 h-4" /></button>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
              <h4 class="font-bold text-navy-900 text-sm">${peer1.name}</h4>
              <p class="text-warmgray-500">${peer1.location || 'Remote'}</p>
              <button onClick=${() => { onClose(); onProposeSwap({ user: peer1 }); }} class="w-full py-2 bg-navy-700 text-white rounded-xl font-bold">Propose Swap</button>
            </div>

            <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
              <h4 class="font-bold text-navy-900 text-sm">${peer2.name}</h4>
              <p class="text-warmgray-500">${peer2.location || 'Remote'}</p>
              <button onClick=${() => { onClose(); onProposeSwap({ user: peer2 }); }} class="w-full py-2 bg-navy-700 text-white rounded-xl font-bold">Propose Swap</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.CompareModal = CompareModal;
})();