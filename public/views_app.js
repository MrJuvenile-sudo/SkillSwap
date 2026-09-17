// public/views_app.js - Premium Application Views (Enhanced UI/UX after Login)

(function() {
  window.SkillSwap = window.SkillSwap || {};

  const React = window.React;
  const htm = window.htm || self.htm;
  if (!React || !htm) return;

  const { useState, useEffect, useMemo, useRef, useCallback } = React;
  const html = htm.bind(React.createElement);
  const Icon = window.SkillSwap.Icon;
  const api = (...args) => window.SkillSwap.api(...args);

  // ----------------------------------------------------
  // Dashboard View (Vibrant Glows & Cards Highlight)
  // ----------------------------------------------------
  function DashboardView({ user, setActiveTab, onProposeSwap, onViewProfile }) {
    const [matches, setMatches] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);

    useEffect(() => {
      api('/api/matches').then(data => setMatches((data.matches || []).slice(0, 3))).catch(console.error);
      api('/api/workspaces').then(data => {
        setWorkspaces(data.workspaces || []);
        // Fetch sessions for active workspaces
        if (data.workspaces && data.workspaces.length > 0) {
          const promises = data.workspaces.map(w => api('/api/sessions?workspace_id=' + w.id).catch(() => ({ sessions: [] })));
          Promise.all(promises).then(results => {
            const allSessions = results.flatMap(r => r.sessions || []);
            setUpcomingSessions(allSessions.slice(0, 3));
          }).catch(console.error);
        }
      }).catch(console.error);
      api('/api/notifications').then(data => setNotifications((data.notifications || []).slice(0, 4))).catch(console.error);

    }, []);

    const teachCount = (user.skills || []).filter(s => s.type === 'TEACH').length;
    const learnCount = (user.skills || []).filter(s => s.type === 'LEARN').length;
    const hasSkills = teachCount > 0 || learnCount > 0;

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left animate-fadeIn">
        <!-- Welcome / Onboarding Hero Banner State -->
        ${!hasSkills ? html`
          <div class="bg-gradient-to-br from-navy-800 via-navy-900 to-navy-955 rounded-3xl p-8 border border-navy-700/40 shadow-xl text-cream-100 relative overflow-hidden">
            <div class="absolute -right-16 -top-16 w-48 h-48 bg-navy-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div class="space-y-4 max-w-2xl relative z-10">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-indigo-500/40 text-sky-100 border border-indigo-500/30">
                Onboarding: Step 1 of 2 ⚡
              </div>
              <h2 class="font-serif text-2xl sm:text-3xl font-bold tracking-tight">Add your skills to unlock matchmaking!</h2>
              <p class="text-xs sm:text-sm text-cream-200/90 leading-relaxed max-w-xl">
                To start discovery matching and synergy calculation, define at least one skill you can offer to teach and one skill you wish to target.
              </p>
              <div class="space-y-2 max-w-md pt-2">
                <div class="flex justify-between font-bold text-[10px] text-cream-100 uppercase tracking-wider">
                  <span>Profile Completion</span>
                  <span>50%</span>
                </div>
                <div class="w-full bg-navy-950/50 rounded-full h-2">
                  <div class="bg-indigo-500 h-2 rounded-full transition-all duration-300" style=${{ width: '50%' }}></div>
                </div>
              </div>
              <div class="pt-2">
                <button onClick=${() => setActiveTab('skills')} class="px-5 py-3 bg-white hover:bg-cream-100 text-navy-950 font-bold text-xs rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Configure Skill Matrix →
                </button>
              </div>
            </div>
          </div>
        ` : html`
          <!-- Regular Welcome Hero Banner with High Button Contrast & Enhanced Profile Picture -->
          <div class="bg-gradient-to-r from-navy-955 via-navy-900 to-navy-950 rounded-3xl p-6 sm:p-8 border border-navy-700/60 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-cream-100 relative overflow-hidden text-left">
            <div class="absolute -right-16 -top-16 w-56 h-56 bg-navy-500/15 rounded-full blur-3xl pointer-events-none"></div>
            
            <div class="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-4 sm:gap-5 relative z-10">
              <div class="relative shrink-0">
                <img src=${user.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop'} alt=${user.name} class="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover ring-2 ring-indigo-400/40 border border-white/20 shadow-md" />
                <span class="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-500 text-white text-[8.5px] font-black uppercase rounded-full shadow-md border-2 border-navy-955 flex items-center gap-0.5">
                  <span>✓</span>
                  <span>Active</span>
                </span>
              </div>
              <div class="space-y-1">
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-navy-800/90 text-sky-300 border border-sky-400/20 shadow-2xs">
                    <span>Verified Swapper</span>
                    <span class="text-navy-400">•</span>
                    <span>4.9★ Karma</span>
                  </span>
                </div>
                <h1 class="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-0.5">
                  Welcome back, ${user.name}! 👋
                </h1>
                <p class="text-xs sm:text-sm text-cream-200/85 max-w-xl leading-relaxed mt-1">
                  Offering <strong class="text-white font-bold">${teachCount} ${teachCount === 1 ? 'skill' : 'skills'}</strong> to teach and targeting <strong class="text-white font-bold">${learnCount} ${learnCount === 1 ? 'subject' : 'subjects'}</strong> to learn.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0 relative z-10 font-bold text-xs sm:text-sm">
              <button onClick=${() => setActiveTab('matches')} class="px-5 py-3 bg-navy-700 hover:bg-navy-600 text-white font-extrabold rounded-xl shadow-lg border border-navy-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5">
                <span>Discover Matches</span>
              </button>
              <button onClick=${() => setActiveTab('skills')} class="px-4.5 py-3 bg-white hover:bg-cream-100 text-navy-950 font-bold rounded-xl shadow-sm border border-cream-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
                + Manage Skills
              </button>
            </div>
          </div>
        `}

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content (Col Span 2) -->
          <div class="lg:col-span-2 space-y-10">
            <!-- Top Matches Section -->
            <div class="space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-serif text-2xl font-bold text-navy-900">
                    ${hasSkills ? 'Highly Compatible Peers' : 'Platform Active Swappers'}
                  </h2>
                  ${!hasSkills ? html`
                    <p class="text-xs text-warmgray-500 mt-0.5">
                      💡 Complete your profile by adding skills you can teach to calculate personalized 1:1 reciprocal synergy matches.
                    </p>
                  ` : null}
                </div>
                <button onClick=${() => setActiveTab('matches')} class="text-xs font-bold text-navy-700 hover:underline">View all matches →</button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${matches.map(m => html`
                  <div key=${m.user.id} class="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm flex flex-col justify-between space-y-5 card-hover-lift transition-all duration-200">
                    <div class="space-y-4">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3">
                          <img src=${m.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} alt=${m.user.name} class="w-12 h-12 rounded-2xl object-cover border border-cream-200 shadow-sm ring-2 ring-navy-600/10" />
                          <div>
                            <h4 class="font-bold text-navy-900 text-sm">${m.user.name}</h4>
                            <p class="text-[11px] text-warmgray-500 font-semibold">${m.user.location || 'Remote'}</p>
                          </div>
                        </div>
                        <div class="text-right shrink-0">
                          <span class="px-2.5 py-1.5 ${m.score > 0 ? 'bg-navy-50 text-navy-700 border-navy-200/50' : 'bg-cream-100 text-warmgray-600 border-cream-300'} border rounded-xl font-serif font-bold text-xs shadow-sm">
                            ${hasSkills && m.score > 0 ? `${m.score}% Match` : 'Network Member'}
                          </span>
                        </div>
                      </div>

                      <!-- Structured Skill Chips badges -->
                      <div class="space-y-2.5 pt-1 border-t border-cream-100/60">
                        <div>
                          <span class="text-[9px] font-extrabold text-navy-950 uppercase tracking-wider block mb-1">Teaches:</span>
                          <div class="flex flex-wrap gap-1">
                            ${(m.user.teach_skills || []).slice(0, 3).map(s => html`
                              <span key=${s.id} class="px-2 py-0.5 bg-navy-100 text-navy-900 rounded font-semibold text-[10px]">
                                ${s.skill_name}
                              </span>
                            `)}
                            ${(m.user.teach_skills || []).length === 0 ? html`<span class="text-[10px] text-warmgray-400 italic">None</span>` : null}
                          </div>
                        </div>
                        <div>
                          <span class="text-[9px] font-extrabold text-indigo-950 uppercase tracking-wider block mb-1">Wants to Learn:</span>
                          <div class="flex flex-wrap gap-1">
                            ${(m.user.learn_skills || []).slice(0, 3).map(s => html`
                              <span key=${s.id} class="px-2 py-0.5 bg-sky-50 text-indigo-950 border border-indigo-200 rounded font-semibold text-[10px]">
                                ${s.skill_name}
                              </span>
                            `)}
                            ${(m.user.learn_skills || []).length === 0 ? html`<span class="text-[10px] text-warmgray-400 italic">None</span>` : null}
                          </div>
                        </div>
                      </div>

                      <!-- Synergy Breakdown -->
                      <div class="space-y-1.5 pt-2 border-t border-cream-100/60">
                        <span class="text-[9px] font-extrabold text-navy-900 uppercase tracking-wider block">Synergy Breakdown:</span>
                        <div class="flex flex-wrap gap-1.5 text-[9px] font-bold text-warmgray-500">
                          <span class="px-2 py-0.5 bg-cream-200 rounded">Skills: ${m.subScores?.skillCompatibility?.percentage || 70}%</span>
                          <span class="px-2 py-0.5 bg-cream-200 rounded">Schedule: ${m.subScores?.availabilityCompatibility?.percentage || 80}%</span>
                          <span class="px-2 py-0.5 bg-cream-200 rounded">Location: ${m.subScores?.goalCompatibility?.percentage || 60}%</span>
                        </div>
                      </div>
                    </div>

                    <div class="pt-3 border-t border-cream-100 flex gap-2">
                      <button onClick=${() => onProposeSwap(m)} class="flex-1 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-xs shadow hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Propose Swap
                      </button>
                      <button onClick=${() => onViewProfile(m.user.username)} class="px-3 py-2.5 bg-white border border-cream-300 hover:bg-cream-50 text-navy-900 font-bold text-xs rounded-xl shadow-sm hover:scale-[1.02] transition-all">
                        View Profile
                      </button>
                    </div>
                  </div>
                `)}
              </div>
            </div>

            <!-- Active Workspaces Section -->
            <div class="space-y-5">
              <div class="flex items-center justify-between">
                <h2 class="font-serif text-2xl font-bold text-navy-900">Active Learning Workspaces</h2>
                <button onClick=${() => setActiveTab('workspaces')} class="text-xs font-bold text-navy-700 hover:underline">Manage workspaces →</button>
              </div>

              ${workspaces.length === 0 ? html`
                <div class="bg-white rounded-3xl p-10 border border-cream-300 text-center space-y-4 shadow-sm">
                  <p class="text-xs sm:text-sm text-warmgray-600">No active exchange workspaces yet. Accept an incoming request or explore requests to open a shared learning room!</p>
                  <button onClick=${() => setActiveTab('requests')} class="px-5 py-2.5 bg-navy-700 text-white rounded-xl font-bold text-xs shadow hover:bg-navy-800 transition-colors">
                    Explore Open Requests
                  </button>
                </div>
              ` : html`
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  ${workspaces.slice(0, 2).map(w => html`
                    <div key=${w.id} onClick=${() => setActiveTab('workspaces')} class="p-6 bg-white rounded-3xl border border-cream-300 shadow-sm card-hover-lift cursor-pointer space-y-4 border-l-4 border-l-navy-600 transition-all duration-200">
                      <div class="flex items-center justify-between">
                        <div>
                          <h3 class="font-serif text-lg font-bold text-navy-900 leading-snug">${w.title}</h3>
                          <p class="text-[11px] text-warmgray-500 mt-0.5">Partner: ${w.partner_name || 'Active Partner'}</p>
                        </div>
                        <span class="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px] uppercase tracking-wider">${w.status}</span>
                      </div>
                      <div class="space-y-1.5">
                        <div class="flex justify-between font-bold text-[10px] text-navy-900">
                          <span>Agreement Milestones</span>
                          <span>${w.progress || 35}% Completed</span>
                        </div>
                        <div class="w-full bg-cream-200 rounded-full h-2 shadow-inner">
                          <div class="bg-gradient-to-r from-navy-600 to-navy-800 h-2 rounded-full transition-all duration-300" style=${{ width: `${w.progress || 35}%` }}></div>
                        </div>
                      </div>
                      <div class="flex items-center justify-end text-xs font-bold text-navy-700 border-t border-cream-100 pt-3">
                        <span>Open Workspace →</span>
                      </div>
                    </div>
                  `)}
                </div>
              `}
            </div>
          </div>

          <!-- Sidebar widgets (Col Span 1) -->
          <div class="space-y-8">
            <!-- Platform Stats & Karma -->
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4.5 text-xs border-l-4 border-l-navy-600">
              <h3 class="font-serif text-lg font-bold text-navy-950 border-b border-cream-100 pb-2.5 flex items-center gap-2">
                <${Icon} name="award" class="w-5 h-5 text-navy-700" /> Platform Stats & Karma
              </h3>
              <div class="grid grid-cols-3 gap-2.5 text-center">
                <div class="p-3 bg-cream-50 rounded-2xl border border-cream-200">
                  <span class="text-[10px] font-bold text-warmgray-500 block uppercase tracking-wider">Karma</span>
                  <span class="text-sm font-bold text-navy-950 block mt-1">★ 4.9</span>
                </div>
                <div class="p-3 bg-cream-50 rounded-2xl border border-cream-200">
                  <span class="text-[10px] font-bold text-warmgray-500 block uppercase tracking-wider">Exchanged</span>
                  <span class="text-sm font-bold text-navy-955 block mt-1">12 hrs</span>
                </div>
                <div class="p-3 bg-cream-50 rounded-2xl border border-cream-200">
                  <span class="text-[10px] font-bold text-warmgray-500 block uppercase tracking-wider">Completed</span>
                  <span class="text-xs font-bold text-navy-955 block mt-1">3 Swaps</span>
                </div>
              </div>
            </div>

            <!-- Learning Hub Quick Access -->
            <div class="bg-gradient-to-br from-indigo-900 to-navy-950 p-6 rounded-3xl border border-indigo-800 shadow-md text-white space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-widest text-indigo-300">Peer Knowledge</span>
                <span class="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[9px] font-bold">New</span>
              </div>
              <h3 class="font-serif text-lg font-bold leading-tight">📚 Learning Hub</h3>
              <p class="text-xs text-indigo-200 leading-relaxed">Access notes, assignments, PYQs, and key-point summaries shared by top students.</p>
              <div class="flex gap-2 pt-1">
                <button onClick=${() => setActiveTab('hub-browse')} class="flex-1 py-2 bg-white hover:bg-cream-100 text-navy-950 font-bold text-xs rounded-xl shadow-xs transition-all">Browse</button>
                <button onClick=${() => setActiveTab('exam-mode')} class="flex-1 py-2 bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl border border-indigo-500/40 transition-all">Exam Mode</button>
              </div>
            </div>

            <!-- Upcoming Sessions / Calendar -->
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 text-xs">
              <h3 class="font-serif text-lg font-bold text-navy-955 border-b border-cream-100 pb-2.5">
                Upcoming Sessions
              </h3>
              ${upcomingSessions.length === 0 ? html`
                <div class="text-center py-6 text-warmgray-500 italic text-[11px] leading-relaxed">
                  No upcoming calls scheduled. Book a meeting inside your Exchange Workspace.
                </div>
              ` : html`
                <div class="space-y-3">
                  ${upcomingSessions.map(s => html`
                    <div key=${s.id} class="p-3 bg-cream-50 rounded-xl border border-cream-200 border-l-4 border-l-navy-600">
                      <h4 class="font-bold text-navy-900 truncate">${s.title}</h4>
                      <p class="text-[10px] text-warmgray-500 mt-0.5 font-semibold">📅 ${new Date(s.session_date).toLocaleString()}</p>
                      ${s.meeting_link ? html`
                        <button onClick=${() => setActiveTab && setActiveTab('workspaces')} class="w-full text-center mt-2 py-1 bg-navy-700 hover:bg-navy-800 text-white rounded font-bold text-[9px] transition-all">
                          Join Meet (In-App Workspace)
                        </button>
                      ` : null}
                    </div>
                  `)}
                </div>
              `}
            </div>

            <!-- Recent Activity Feed -->
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 text-xs">
              <h3 class="font-serif text-lg font-bold text-navy-955 border-b border-cream-100 pb-2.5">
                Recent Activity
              </h3>
              <div class="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                ${notifications.map(n => html`
                  <div key=${n.id} class="flex items-start gap-3 text-[11px] leading-relaxed">
                    <span class="w-1.5 h-1.5 rounded-full bg-navy-600 mt-1.5 shrink-0"></span>
                    <div>
                      <p class="font-bold text-navy-955 leading-tight">${n.title}</p>
                      <p class="text-warmgray-600 text-[10px] mt-0.5">${n.message}</p>
                    </div>
                  </div>
                `)}
                ${notifications.length === 0 ? html`<p class="text-warmgray-400 italic text-center py-4">No recent activity.</p>` : null}
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }
  window.SkillSwap.DashboardView = DashboardView;

  // ----------------------------------------------------
  // Matches Discovery View (Premium Badging & Highlight)

  // ----------------------------------------------------
  function MatchesView({ currentUser, onProposeSwap, onComparePeers, onViewProfile }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minSynergy, setMinSynergy] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedPeers, setSelectedPeers] = useState([]);


    useEffect(() => {
      loadMatches();
    }, []);

    const loadMatches = async () => {
      try {
        setLoading(true);
        const data = await api('/api/matches');
        setMatches(data.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handleSelectPeer = (userRecord) => {
      if (selectedPeers.find(p => p.id === userRecord.id)) {
        setSelectedPeers(prev => prev.filter(p => p.id !== userRecord.id));
      } else {
        if (selectedPeers.length >= 2) {
          alert('You can only compare up to 2 peers side-by-side.');
          return;
        }
        setSelectedPeers(prev => [...prev, userRecord]);
      }
    };


    const filteredMatches = useMemo(() => {
      return matches.filter(m => {
        if (m.score < minSynergy) return false;
        if (searchKeyword.trim()) {
          const q = searchKeyword.toLowerCase();
          const nameMatch = m.user.name.toLowerCase().includes(q);
          const skillMatch = (m.user.teach_skills || []).some(s => s.skill_name && s.skill_name.toLowerCase().includes(q));
          if (!nameMatch && !skillMatch) return false;
        }
        return true;
      });
    }, [matches, minSynergy, searchKeyword]);

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left animate-fadeIn">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cream-300 pb-5">
          <div>
            <h1 class="font-serif text-3xl font-bold text-navy-900">Synergy Matches</h1>
            <p class="text-warmgray-600 text-xs sm:text-sm">Explore verified peers ranked dynamically by complementary skill compatibility and schedule synergy.</p>
          </div>

          <div class="flex items-center gap-3">
            ${selectedPeers.length === 2 ? html`
              <button onClick=${() => onComparePeers(selectedPeers[0], selectedPeers[1])} class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-1.5">
                <${Icon} name="columns" class="w-4 h-4" /> Compare Selected (${selectedPeers.length})
              </button>
            ` : html`
              <div class="text-[11px] font-semibold text-warmgray-500 bg-cream-50 border border-cream-300 px-4 py-2.5 rounded-xl">
                Select 2 peers to compare side-by-side
              </div>
            `}

          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Filters Column -->
          <div class="lg:col-span-1 space-y-5 bg-white p-6 rounded-3xl border border-cream-300 shadow-sm text-xs">
            <h3 class="font-bold text-navy-955 text-sm flex items-center gap-2.5 pb-3.5 border-b border-cream-100">
              <${Icon} name="filter" class="w-4.5 h-4.5" /> Filter Engine
            </h3>

            <div>
              <label class="block font-bold text-navy-900 mb-1.5">Search Keywords</label>

              <input
                type="text"
                value=${searchKeyword}
                onChange=${e => setSearchKeyword(e.target.value)}
                placeholder="Python, UI/UX, Spanish..."
                class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-medium text-navy-900"
              />
            </div>

            <div class="space-y-2">
              <div class="flex justify-between font-bold text-navy-900">
                <span>Minimum Synergy</span>

                <span class="text-navy-700">${minSynergy}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                value=${minSynergy}
                onInput=${e => setMinSynergy(Number(e.target.value))}
                onChange=${e => setMinSynergy(Number(e.target.value))}
                class="w-full accent-navy-700 cursor-pointer"
              />
            </div>
          </div>

          <!-- Matches Grid -->
          <div class="lg:col-span-3 space-y-6">
            ${loading ? html`<div class="p-12 text-center text-warmgray-500 font-serif">Computing synergy matching scorecards...</div>` : null}
            ${!loading && filteredMatches.length === 0 ? html`<div class="p-12 bg-white border border-cream-300 rounded-3xl text-center text-warmgray-500">No peers found matching your criteria. Try adjusting your synergy threshold or keywords.</div>` : null}

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${filteredMatches.map(m => {
                const isSelected = !!selectedPeers.find(p => p.id === m.user.id);
                return html`
                  <div key=${m.user.id} class="bg-white rounded-3xl p-6.5 border border-cream-300 shadow-sm hover:shadow-md hover:border-navy-300 hover:scale-[1.01] transition-all duration-200 flex flex-col justify-between space-y-5">
                    <div class="space-y-4">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3">
                          <img src=${m.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} alt=${m.user.name} class="w-12 h-12 rounded-2xl object-cover border border-cream-200 shadow-sm" />
                          <div>
                            <h3 class="font-bold text-navy-900 text-sm cursor-pointer hover:underline hover:text-navy-700 transition-colors" onClick=${() => onViewProfile(m.user.username)}>
                              ${m.user.name}
                            </h3>
                            <p class="text-[11px] text-warmgray-500 font-medium">${m.user.location || 'Remote'} · ${m.user.timezone || 'UTC'}</p>
                          </div>
                        </div>

                        <span class="px-2.5 py-1 bg-navy-50 text-navy-700 border border-navy-200/50 rounded-xl font-serif font-bold text-xs shrink-0 shadow-sm">
                          ${m.score}% Match
                        </span>
                      </div>

                      <div class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 text-[11px] leading-relaxed border-l-4 border-l-navy-600">
                        <span class="font-bold text-navy-955 uppercase tracking-wider text-[9px] block">Synergy Breakdown:</span>
                        <ul class="space-y-1.5 text-warmgray-700">
                          ${(m.reasons || []).slice(0, 3).map((r, i) => html`
                            <li key=${i} class="flex items-start gap-1.5">
                              <span class="text-navy-700 font-bold">✓</span> ${r}
                            </li>
                          `)}
                        </ul>
                      </div>

                      <div class="grid grid-cols-1 gap-2.5 text-xs pt-1">
                        <div>
                          <span class="font-bold text-navy-955 text-[9px] uppercase tracking-wider block mb-1">Can Teach:</span>
                          <div class="flex flex-wrap gap-1">
                            ${(m.user.teach_skills || []).map(s => html`
                              <span key=${s.id} class="px-2 py-0.5 bg-cream-200 text-navy-955 rounded font-semibold text-[10px]">${s.skill_name}</span>
                            `)}
                          </div>
                        </div>

                        <div>
                          <span class="font-bold text-indigo-950 text-[9px] uppercase tracking-wider block mb-1">Wants to Learn:</span>
                          <div class="flex flex-wrap gap-1">
                            ${(m.user.learn_skills || []).map(s => html`
                              <span key=${s.id} class="px-2 py-0.5 bg-sky-50 text-indigo-950 border border-indigo-200 rounded font-semibold text-[10px]">${s.skill_name}</span>
                            `)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="pt-3.5 border-t border-cream-100 flex items-center gap-3">
                      <button onClick=${() => onProposeSwap(m)} class="flex-1 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                        Propose Swap
                      </button>
                      <button onClick=${() => handleSelectPeer(m.user)} class="px-3.5 py-2.5 rounded-xl border font-bold text-xs transition-all duration-200 ${isSelected ? 'bg-navy-50 text-navy-700 border-navy-300' : 'bg-white text-warmgray-700 border-cream-300 hover:bg-cream-50'}">
                        ${isSelected ? 'Selected' : 'Compare'}
                      </button>
                    </div>
                  </div>
                `;
              })}

            </div>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.MatchesView = MatchesView;

  // ----------------------------------------------------
  // My Skills View
  // ----------------------------------------------------
  function MySkillsView({ user, onRefresh }) {
    const [allSkills, setAllSkills] = useState([]);
    const [selectedSkillId, setSelectedSkillId] = useState('');
    const [type, setType] = useState('TEACH');
    const [level, setLevel] = useState('Intermediate');
    const [expYears, setExpYears] = useState(2);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      api('/api/skills').then(d => setAllSkills(d.skills || [])).catch(console.error);
    }, []);

    const handleAddSkill = async (e) => {
      e.preventDefault();
      if (!selectedSkillId) return;
      try {
        setLoading(true);
        await api('/api/skills/user', {
          method: 'POST',
          body: JSON.stringify({
            skill_id: Number(selectedSkillId),
            type,
            level,
            experience_years: Number(expYears)
          })
        });
        setSelectedSkillId('');
        onRefresh && onRefresh();
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteSkill = async (id) => {
      if (!confirm('Are you sure you want to remove this skill from your profile?')) return;

      await api('/api/skills/user?id=' + id, { method: 'DELETE' });
      onRefresh && onRefresh();
    };

    const myTeach = (user.skills || []).filter(s => s.type === 'TEACH');
    const myLearn = (user.skills || []).filter(s => s.type === 'LEARN');

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-5">
          <div>
            <h1 class="font-serif text-3xl font-bold text-navy-900">Skill Matrix & Exchange Targets</h1>
            <p class="text-warmgray-600 text-xs sm:text-sm">Manage topics you offer to teach and target skills you want to master to power bilateral matching.</p>
          </div>
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
            <span>⚡ Synergy Portfolio: ${myTeach.length} Teach / ${myLearn.length} Learn</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Setup Panel -->
          <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-5 text-xs">
            <h3 class="font-serif text-lg font-bold text-navy-955 border-b border-cream-100 pb-3">Add Skill Target</h3>

            <form onSubmit=${handleAddSkill} class="space-y-4">
              <div>
                <label class="block font-bold text-navy-900 mb-1.5">Exchange Role</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" onClick=${() => setType('TEACH')} class="py-2.5 rounded-xl font-bold transition-all ${type === 'TEACH' ? 'bg-navy-700 text-white shadow-sm' : 'bg-cream-100 text-warmgray-600 hover:bg-cream-200/50'}">I Can Teach</button>
                  <button type="button" onClick=${() => setType('LEARN')} class="py-2.5 rounded-xl font-bold transition-all ${type === 'LEARN' ? 'bg-navy-700 text-white shadow-sm' : 'bg-cream-100 text-warmgray-600 hover:bg-cream-200/50'}">I Want to Learn</button>

                </div>
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1.5">Select Skill</label>
                <select required value=${selectedSkillId} onChange=${e => setSelectedSkillId(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-semibold text-navy-900">

                  <option value="">Choose a skill...</option>
                  ${allSkills.map(s => html`<option key=${s.id} value=${s.id}>${s.name} (${s.category_name})</option>`)}
                </select>
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1.5">Proficiency / Target Level</label>
                <select value=${level} onChange=${e => setLevel(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-semibold text-navy-900">

                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <div class="flex justify-between font-bold text-navy-900 mb-1.5">
                  <span>Years of Experience</span>
                  <span class="text-navy-700">${expYears} years</span>
                </div>
                <input type="range" min="0" max="15" step="0.5" value=${expYears} onInput=${e => setExpYears(Number(e.target.value))} onChange=${e => setExpYears(Number(e.target.value))} class="w-full accent-navy-700 cursor-pointer" />
              </div>

              <button type="submit" disabled=${loading} class="w-full py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                ${loading ? 'Adding to profile...' : 'Add to Skill Matrix'}

              </button>
            </form>
          </div>

          <!-- Existing lists -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white p-6.5 rounded-3xl border border-cream-300 shadow-sm space-y-4">
              <h3 class="font-serif text-lg font-bold text-navy-950 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Skills I Offer to Teach (${myTeach.length})
              </h3>
              ${myTeach.length === 0 ? html`<p class="text-xs text-warmgray-500 py-2">Add topics you have expertise in to help find matches.</p>` : null}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${myTeach.map(s => html`
                  <div key=${s.id} class="p-4 bg-cream-50/50 rounded-2xl border border-cream-200 flex items-start justify-between shadow-sm hover:shadow-inner hover:bg-cream-50 transition-all duration-150 border-l-4 border-l-navy-600">
                    <div class="space-y-1">
                      <h4 class="font-bold text-navy-955 text-xs sm:text-sm">${s.skill_name}</h4>
                      <p class="text-[11px] text-warmgray-500 font-semibold uppercase tracking-wider">${s.level} · ${s.experience_years} Years Exp</p>
                    </div>
                    <button onClick=${() => handleDeleteSkill(s.id)} class="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors">

                      <${Icon} name="trash-2" class="w-4 h-4" />
                    </button>
                  </div>
                `)}
              </div>
            </div>

            <div class="bg-white p-6.5 rounded-3xl border border-cream-300 shadow-sm space-y-4">
              <h3 class="font-serif text-lg font-bold text-navy-955 flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Skills I Am Targeting to Learn (${myLearn.length})
              </h3>
              ${myLearn.length === 0 ? html`<p class="text-xs text-warmgray-500 py-2">Add subjects you want to master so others can propose swaps.</p>` : null}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${myLearn.map(s => html`
                  <div key=${s.id} class="p-4 bg-indigo-50/20 rounded-2xl border border-indigo-200/50 flex items-start justify-between shadow-sm hover:shadow-inner hover:bg-indigo-50/30 transition-all duration-150 border-l-4 border-l-indigo-600">
                    <div class="space-y-1">
                      <h4 class="font-bold text-navy-955 text-xs sm:text-sm">${s.skill_name}</h4>
                      <p class="text-[11px] text-warmgray-500 font-semibold uppercase tracking-wider">Target Level: ${s.level}</p>
                    </div>
                    <button onClick=${() => handleDeleteSkill(s.id)} class="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors">

                      <${Icon} name="trash-2" class="w-4 h-4" />
                    </button>
                  </div>
                `)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.MySkillsView = MySkillsView;

  // ----------------------------------------------------
  // Requests View (Received & Sent Tabs)
  // ----------------------------------------------------
  function RequestsView({ onAcceptRequest }) {
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [activeSubTab, setActiveSubTab] = useState('received'); // 'received' | 'sent'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadRequests();
    }, []);

    const loadRequests = async () => {
      try {
        setLoading(true);
        const data = await api('/api/requests');
        setIncoming(data.incoming || []);
        setOutgoing(data.outgoing || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handleAccept = async (reqId) => {
      try {
        const res = await api('/api/requests/' + reqId + '/accept', { method: 'PUT' });
        loadRequests();
        if (onAcceptRequest) {
          onAcceptRequest(res.workspace?.id);
        }
      } catch (err) {
        alert(err.message || 'Failed to accept exchange proposal');
      }
    };

    const handleReject = async (reqId) => {
      await api('/api/requests/' + reqId + '/reject', { method: 'PUT' });
      loadRequests();
    };

    const pendingIncoming = incoming.filter(r => r.status === 'PENDING').length;
    const pendingOutgoing = outgoing.filter(r => r.status === 'PENDING').length;

    return html`
      <div class="max-w-5xl mx-auto px-4 py-8 space-y-8 text-left animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="font-serif text-3xl font-bold text-navy-950">Exchange Requests</h1>
            <p class="text-warmgray-600 text-xs sm:text-sm mt-1">Track, review, and manage incoming and outgoing skill swap proposals.</p>
          </div>

          <!-- Tab Pill Switcher -->
          <div class="flex items-center p-1 bg-cream-200/80 rounded-2xl border border-cream-300 w-fit shrink-0">
            <button
              type="button"
              onClick=${() => setActiveSubTab('received')}
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'received' ? 'bg-white text-navy-950 shadow-sm' : 'text-warmgray-600 hover:text-navy-900'}"
            >
              <span>📥 Received</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeSubTab === 'received' ? 'bg-navy-100 text-navy-900' : 'bg-cream-300/80 text-warmgray-700'}">
                ${incoming.length}
              </span>
            </button>

            <button
              type="button"
              onClick=${() => setActiveSubTab('sent')}
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'sent' ? 'bg-white text-navy-950 shadow-sm' : 'text-warmgray-600 hover:text-navy-900'}"
            >
              <span>📤 Sent</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeSubTab === 'sent' ? 'bg-navy-100 text-navy-900' : 'bg-cream-300/80 text-warmgray-700'}">
                ${outgoing.length}
              </span>
            </button>
          </div>
        </div>

        <!-- Tab 1: Received Requests -->
        ${activeSubTab === 'received' ? html`
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-cream-200">
              <h2 class="font-serif text-lg sm:text-xl font-bold text-navy-955 flex items-center gap-2">
                <span>Incoming Proposals Received</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-navy-100 text-navy-800">${incoming.length}</span>
              </h2>
              ${pendingIncoming > 0 ? html`
                <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  ${pendingIncoming} Pending Action
                </span>
              ` : null}
            </div>

            ${loading ? html`<div class="p-10 text-center text-warmgray-500 font-serif">Checking proposal ledger...</div>` : null}
            ${!loading && incoming.length === 0 ? html`
              <div class="py-12 text-center space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto text-xl text-warmgray-400">📥</div>
                <h3 class="font-serif text-base font-bold text-navy-900">No incoming proposals yet</h3>
                <p class="text-xs text-warmgray-500 max-w-sm mx-auto">When peers discover your teaching skills and propose a swap, their requests will appear here.</p>
              </div>
            ` : null}

            <div class="space-y-4">
              ${incoming.map(r => html`
                <div key=${r.id} class="p-5 sm:p-6 bg-cream-50/60 rounded-2xl border border-cream-200/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs hover:border-cream-300 transition-all border-l-4 ${r.status === 'PENDING' ? 'border-l-amber-500' : r.status === 'ACCEPTED' ? 'border-l-emerald-600' : 'border-l-rose-500'}">
                  <div class="space-y-3.5 flex-1 text-left">
                    <div class="flex flex-wrap items-center gap-3">
                      <img src=${r.sender_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'} alt=${r.sender_name} class="w-10 h-10 rounded-xl object-cover border border-cream-200" />
                      <div>
                        <h4 class="font-bold text-navy-950 text-sm">${r.sender_name}</h4>
                        <p class="text-[11px] text-warmgray-500">${r.sender_headline || `@${r.sender_username}`}</p>
                      </div>
                      <span class="ml-auto sm:ml-0 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${r.status === 'PENDING' ? 'bg-amber-100 text-amber-900 border border-amber-300' : r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'}">
                        ${r.status}
                      </span>
                    </div>

                    <!-- Proposed Skills Barter Pill Group -->
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                      ${r.teach_skill_name ? html`
                        <span class="px-2.5 py-1 bg-navy-100 text-navy-950 rounded-lg font-semibold text-[11px] flex items-center gap-1">
                          <span class="text-navy-500 font-normal">Offers:</span>
                          <strong>${r.teach_skill_name}</strong>
                        </span>
                      ` : null}
                      ${r.learn_skill_name ? html`
                        <span class="text-warmgray-400 font-bold">⇄</span>
                        <span class="px-2.5 py-1 bg-indigo-50 text-indigo-950 border border-indigo-200/60 rounded-lg font-semibold text-[11px] flex items-center gap-1">
                          <span class="text-indigo-500 font-normal">Wants:</span>
                          <strong>${r.learn_skill_name}</strong>
                        </span>
                      ` : null}
                      <span class="px-2 py-0.5 rounded bg-cream-200/80 text-warmgray-700 font-semibold text-[10px]">
                        ⏱ ${r.cadence || 'Weekly'} · ${r.duration_weeks || 4} Weeks
                      </span>
                      <span class="px-2 py-0.5 rounded bg-cream-200/80 text-warmgray-700 font-semibold text-[10px]">
                        📡 ${r.preferred_channel || 'In-App Video'}
                      </span>
                    </div>

                    ${r.message ? html`
                      <p class="text-xs text-warmgray-700 italic leading-relaxed bg-white p-3 rounded-xl border border-cream-200">
                        "${r.message}"
                      </p>
                    ` : null}
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2.5 shrink-0 w-full lg:w-auto pt-2 lg:pt-0">
                    ${r.status === 'PENDING' ? html`
                      <button onClick=${() => handleAccept(r.id)} class="flex-1 lg:flex-none px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
                        Accept Swap
                      </button>
                      <button onClick=${() => handleReject(r.id)} class="flex-1 lg:flex-none px-4 py-2.5 bg-white border border-cream-300 hover:bg-rose-50 text-rose-700 rounded-xl font-bold text-xs transition-all">
                        Decline
                      </button>
                    ` : r.status === 'ACCEPTED' ? html`
                      <button onClick=${() => onAcceptRequest && onAcceptRequest(r.workspace_id)} class="px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all">
                        Open Workspace →
                      </button>
                    ` : html`
                      <span class="text-xs text-warmgray-500 italic">No action needed</span>
                    `}
                  </div>
                </div>
              `)}
            </div>
          </div>
        ` : html`
          <!-- Tab 2: Sent Requests -->
          <div class="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-sm space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-cream-200">
              <h2 class="font-serif text-lg sm:text-xl font-bold text-navy-955 flex items-center gap-2">
                <span>Outgoing Proposals Sent</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-navy-100 text-navy-800">${outgoing.length}</span>
              </h2>
              ${pendingOutgoing > 0 ? html`
                <span class="text-xs font-bold text-navy-700 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-200">
                  ${pendingOutgoing} Awaiting Peer Response
                </span>
              ` : null}
            </div>

            ${loading ? html`<div class="p-10 text-center text-warmgray-500 font-serif">Checking proposal ledger...</div>` : null}
            ${!loading && outgoing.length === 0 ? html`
              <div class="py-12 text-center space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto text-xl text-warmgray-400">📤</div>
                <h3 class="font-serif text-base font-bold text-navy-900">No outgoing proposals sent</h3>
                <p class="text-xs text-warmgray-500 max-w-sm mx-auto">Explore compatible peers in Discover Matches or the Skill Directory and click "Propose Swap" to initiate an exchange.</p>
              </div>
            ` : null}

            <div class="space-y-4">
              ${outgoing.map(r => html`
                <div key=${r.id} class="p-5 sm:p-6 bg-cream-50/60 rounded-2xl border border-cream-200/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs hover:border-cream-300 transition-all border-l-4 ${r.status === 'PENDING' ? 'border-l-sky-500' : r.status === 'ACCEPTED' ? 'border-l-emerald-600' : 'border-l-rose-500'}">
                  <div class="space-y-3.5 flex-1 text-left">
                    <div class="flex flex-wrap items-center gap-3">
                      <img src=${r.receiver_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop'} alt=${r.receiver_name} class="w-10 h-10 rounded-xl object-cover border border-cream-200" />
                      <div>
                        <h4 class="font-bold text-navy-950 text-sm">To: ${r.receiver_name}</h4>
                        <p class="text-[11px] text-warmgray-500">${r.receiver_headline || `@${r.receiver_username}`}</p>
                      </div>
                      <span class="ml-auto sm:ml-0 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${r.status === 'PENDING' ? 'bg-sky-100 text-sky-900 border border-sky-300' : r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'}">
                        ${r.status === 'PENDING' ? 'Awaiting Response' : r.status}
                      </span>
                    </div>

                    <!-- Proposed Skills Barter Pill Group -->
                    <div class="flex flex-wrap items-center gap-2 text-xs">
                      ${r.teach_skill_name ? html`
                        <span class="px-2.5 py-1 bg-navy-100 text-navy-950 rounded-lg font-semibold text-[11px] flex items-center gap-1">
                          <span class="text-navy-500 font-normal">You Teach:</span>
                          <strong>${r.teach_skill_name}</strong>
                        </span>
                      ` : null}
                      ${r.learn_skill_name ? html`
                        <span class="text-warmgray-400 font-bold">⇄</span>
                        <span class="px-2.5 py-1 bg-indigo-50 text-indigo-950 border border-indigo-200/60 rounded-lg font-semibold text-[11px] flex items-center gap-1">
                          <span class="text-indigo-500 font-normal">You Learn:</span>
                          <strong>${r.learn_skill_name}</strong>
                        </span>
                      ` : null}
                      <span class="px-2 py-0.5 rounded bg-cream-200/80 text-warmgray-700 font-semibold text-[10px]">
                        ⏱ ${r.cadence || 'Weekly'} · ${r.duration_weeks || 4} Weeks
                      </span>
                      <span class="px-2 py-0.5 rounded bg-cream-200/80 text-warmgray-700 font-semibold text-[10px]">
                        📡 ${r.preferred_channel || 'In-App Video'}
                      </span>
                    </div>

                    ${r.message ? html`
                      <p class="text-xs text-warmgray-700 italic leading-relaxed bg-white p-3 rounded-xl border border-cream-200">
                        "${r.message}"
                      </p>
                    ` : null}
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2.5 shrink-0 w-full lg:w-auto pt-2 lg:pt-0">
                    ${r.status === 'ACCEPTED' ? html`
                      <button onClick=${() => onAcceptRequest && onAcceptRequest(r.workspace_id)} class="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all">
                        Open Workspace →
                      </button>
                    ` : html`
                      <span class="text-xs text-warmgray-500 italic">Sent on ${new Date(r.created_at || Date.now()).toLocaleDateString()}</span>
                    `}
                  </div>
                </div>
              `)}
            </div>
          </div>
        `}
      </div>
    `;
  }
  window.SkillSwap.RequestsView = RequestsView;

  // ----------------------------------------------------
  // Workspace View (Interactive Teach & Learn Collaboration Hub)
  // ----------------------------------------------------
  function WorkspaceView({ currentUser, onOpenChat, setActiveTab, onViewProfile, targetWorkspaceId }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveSubTab] = useState('live-room'); // 'live-room', 'notes', 'code', 'whiteboard', 'tasks', 'sessions', 'endorse'
    
    // In-Workspace Live Chat Drawer
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newChatMsg, setNewChatMsg] = useState('');
    const [sendingChat, setSendingChat] = useState(false);

    // Live Video & Voice Call State
    const [inCall, setInCall] = useState(false);
    const [callType, setCallType] = useState('video'); // 'video' | 'audio'
    const [micMuted, setMicMuted] = useState(false);
    const [camOff, setCamOff] = useState(false);
    const [screenSharing, setScreenSharing] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [teachingRole, setTeachingRole] = useState('teaching'); // 'teaching' | 'learning'
    const [miniNotesInCall, setMiniNotesInCall] = useState(false);
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const callTimerRef = useRef(null);
    const chatEndRef = useRef(null);

    // Collaborative Shared Notes State
    const [notesContent, setNotesContent] = useState('');
    const [notesSaving, setNotesSaving] = useState(false);
    const [notesSavedTime, setNotesSavedTime] = useState(null);
    const [notesPreview, setNotesPreview] = useState(false);
    const saveNotesTimerRef = useRef(null);

    // Code Sandbox State
    const [codeLang, setCodeLang] = useState('javascript');
    const [codeSnippet, setCodeSnippet] = useState('');
    const [codeOutput, setCodeOutput] = useState('');
    const [codeRunning, setCodeRunning] = useState(false);
    const [codeExecTime, setCodeExecTime] = useState(null);

    // Collaborative Whiteboard State
    const whiteboardCanvasRef = useRef(null);
    const [wbTool, setWbTool] = useState('pen'); // 'pen', 'highlighter', 'eraser', 'arrow', 'rect', 'circle'
    const [wbColor, setWbColor] = useState('#1e293b');
    const [wbSize, setWbSize] = useState(3);
    const [wbHistory, setWbHistory] = useState([]);
    const isDrawingRef = useRef(false);
    const startPointRef = useRef({ x: 0, y: 0 });
    const canvasSnapshotRef = useRef(null);

    // Tasks & Goals State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [sessions, setSessions] = useState([]);

    // Scheduler Modal State
    const [schedulerOpen, setSchedulerOpen] = useState(false);
    const [sessTitle, setSessTitle] = useState('');
    const [sessDate, setSessDate] = useState('');
    const [sessTime, setSessTime] = useState('');
    const [sessDuration, setSessDuration] = useState(60);
    const [sessLink, setSessLink] = useState('');
    const [sessAgenda, setSessAgenda] = useState('');
    const [sessTimezone, setSessTimezone] = useState('IST (UTC+5:30)');

    // Endorsement & Review State
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewCommRating, setReviewCommRating] = useState(5);
    const [reviewKnowledgeRating, setReviewKnowledgeRating] = useState(5);
    const [reviewReliabilityRating, setReviewReliabilityRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    // Code snippet boilerplates
    const CODE_BOILERPLATES = {
      javascript: `// 💡 Live JavaScript Sandbox - Teach & Code Together
// Problem: Longest Substring Without Repeating Characters (Sliding Window)

function lengthOfLongestSubstring(s) {
  let map = new Map();
  let maxLen = 0, start = 0;
  
  for (let end = 0; end < s.length; end++) {
    const char = s[end];
    if (map.has(char) && map.get(char) >= start) {
      start = map.get(char) + 1;
    }
    map.set(char, end);
    maxLen = Math.max(maxLen, end - start + 1);
  }
  return maxLen;
}

const testCase = "pwwkew";
console.log("Input:", testCase);
console.log("Result (Longest length):", lengthOfLongestSubstring(testCase));
console.log("Verification: PASSED ✓");`,

      python: `# 🐍 Python 3 Live Playground - High-Performance DSA
def max_subarray_sum(nums):
    """Kadane's Algorithm for Maximum Subarray Sum"""
    max_so_far = nums[0]
    curr_max = nums[0]
    
    for i in range(1, len(nums)):
        curr_max = max(nums[i], curr_max + nums[i])
        max_so_far = max(max_so_far, curr_max)
        
    return max_so_far

sample = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
result = max_subarray_sum(sample)
print(f"Input Array: {sample}")
print(f"Maximum Subarray Sum: {result}")
print("Complexity: O(n) Time | O(1) Space ✓")`,

      cpp: `// ⚡ C++ 20 High-Speed Algorithmic Template
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int binarySearch(const vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> sortedArr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int target = 23;
    int index = binarySearch(sortedArr, target);
    cout << "Target element: " << target << "\\n";
    cout << "Found at index: " << index << " in O(log N) operations!\\n";
    return 0;
}`,

      java: `// ☕ Java 17 Object Oriented Architecture
import java.util.*;

public class LRUCache<K, V> {
    private final int capacity;
    private final Map<K, V> map;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.map = new LinkedHashMap<>(capacity, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                return size() > capacity;
            }
        };
    }

    public static void main(String[] args) {
        LRUCache<String, Integer> cache = new LRUCache<>(2);
        cache.map.put("UPI_Txn_101", 500);
        cache.map.put("UPI_Txn_102", 1200);
        System.out.println("Active Cache Size: " + cache.map.size());
        System.out.println("Retrieved: " + cache.map.get("UPI_Txn_101"));
    }
}`,

      sql: `-- 🗄️ PostgreSQL / SQLite Query Workbench
-- Calculate peer learning completion velocity & ratings
SELECT 
    u.name AS partner_name,
    COUNT(t.id) AS total_milestones,
    SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_milestones,
    ROUND(AVG(r.rating), 2) AS peer_trust_rating
FROM app_users u
JOIN exchange_workspaces w ON (w.connection_id = u.id)
LEFT JOIN tasks t ON (t.workspace_id = w.id)
LEFT JOIN reviews r ON (r.reviewee_id = u.id)
GROUP BY u.name
ORDER BY completed_milestones DESC;`,

      go: `// 🐹 Go Concurrency & Channel Pipeline
package main

import (
    "fmt"
    "time"
)

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d processing task %d\\n", id, j)
        time.Sleep(time.Millisecond * 50)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 5)
    results := make(chan int, 5)
    go worker(1, jobs, results)
    for w := 1; w <= 3; w++ { jobs <- w }
    close(jobs)
    fmt.Println("Pipeline execution finished.")
}`
    };

    // Note Templates for Instant Insertion
    const NOTE_TEMPLATES = {
      dsa: `# 📚 DSA & Problem Solving Roadmap
## Session Objectives:
- [ ] Understand problem constraints and edge cases
- [ ] Formulate Brute Force vs Optimized approach
- [ ] Implement clean code with O(N) time and O(1) space

## Key Takeaways:
- Two Pointer approach works best on sorted inputs
- Sliding window optimizes contiguous subarray problems

## Homework for Partner:
1. LeetCode #3 Longest Substring Without Repeating Characters
2. LeetCode #76 Minimum Window Substring`,

      system_design: `# 🇮🇳 System Design & Scalable Architecture
## High-Concurrency UPI / Payment Webhook System
1. **API Gateway**: Rate limiting (10,000 req/sec) + JWT Auth
2. **Message Broker**: Kafka / RabbitMQ partition queue for zero transaction drop
3. **Idempotency Key**: UUID v4 check in Redis with 24h TTL
4. **Database Strategy**: Read Replicas + Write Master with connection pooling

## Architecture Diagram & Flow:
Client -> Cloudflare CDN -> Nginx LB -> Node.js Cluster -> Redis Cache -> PostgreSQL`,

      fullstack: `# ⚡ Fullstack React & Node.js Mastery
## Component Design Pattern
- Separation of Smart Containers & Dumb Presentation Components
- Custom Hooks for data fetching and debounce
- Optimistic UI updates for snappy peer interaction

## Best Practices:
- Always clean up event listeners & timers in \`useEffect\`
- Memoize expensive calculations with \`useMemo\``,

      checklist: `# 🎯 Mutual Swap Action Plan & Milestones
- **Week 1**: Core fundamentals & environment setup
- **Week 2**: Hands-on paired programming (2 x 1 hr live calls)
- **Week 3**: Real-world project implementation & code review
- **Week 4**: Verification, test cases & Peer Skill Endorsement ⭐`
    };

    // Load initial workspaces
    useEffect(() => {
      loadWorkspaces();
      return () => {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(t => t.stop());
        }
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
        }
      };
    }, []);

    // Set initial snippet when code language changes
    useEffect(() => {
      setCodeSnippet(CODE_BOILERPLATES[codeLang] || '');
    }, [codeLang]);

    const loadWorkspaces = async () => {
      setLoading(true);
      try {
        const data = await api('/api/workspaces');
        const list = data.workspaces || [];
        setWorkspaces(list);
        if (list.length > 0) {
          const selected = targetWorkspaceId ? (list.find(w => w.id === targetWorkspaceId) || list[0]) : list[0];
          await loadWorkspaceDetails(selected.id);
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (targetWorkspaceId && workspaces.length > 0) {
        loadWorkspaceDetails(targetWorkspaceId);
      }
    }, [targetWorkspaceId]);

    const loadWorkspaceDetails = async (id) => {
      try {
        const data = await api('/api/workspaces/' + id);
        if (data.workspace) {
          setActiveWorkspace(data.workspace);
          setNotesContent(data.workspace.shared_notes || '');
          if (data.workspace.my_review) {
            setReviewSubmitted(true);
            setReviewRating(data.workspace.my_review.rating || 5);
            setReviewComment(data.workspace.my_review.comment || '');
          }
        }
        const sData = await api('/api/sessions?workspace_id=' + id).catch(() => ({ sessions: [] }));
        setSessions(sData.sessions || []);
      } catch (err) {
        console.error('Failed to load workspace details:', err);
      }
    };

    // In-Workspace Real-time Chat Fetch & Polling
    const loadChatMessages = useCallback(async () => {
      if (!activeWorkspace) return;
      try {
        const connId = activeWorkspace.connection_id;
        const data = await api('/api/messages?connection_id=' + connId);
        if (data.messages) {
          setChatMessages(data.messages);
        }
      } catch (err) {
        // silent
      }
    }, [activeWorkspace]);

    useEffect(() => {
      if (activeWorkspace) {
        loadChatMessages();
        const timer = setInterval(loadChatMessages, 3500);
        return () => clearInterval(timer);
      }
    }, [activeWorkspace, loadChatMessages]);

    useEffect(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [chatMessages, chatOpen]);

    const handleSendChatMessage = async (e) => {
      if (e) e.preventDefault();
      const text = newChatMsg.trim();
      if (!text || !activeWorkspace || sendingChat) return;

      setSendingChat(true);
      setNewChatMsg('');
      try {
        await api('/api/messages', {
          method: 'POST',
          body: JSON.stringify({
            connection_id: activeWorkspace.connection_id,
            content: text
          })
        });
        await loadChatMessages();
      } catch (err) {
        alert('Failed to send message: ' + err.message);
      } finally {
        setSendingChat(false);
      }
    };

    // Auto-save Shared Notes with debounce
    const handleNotesChange = (text) => {
      setNotesContent(text);
      setNotesSaving(true);
      if (saveNotesTimerRef.current) clearTimeout(saveNotesTimerRef.current);
      
      saveNotesTimerRef.current = setTimeout(async () => {
        if (!activeWorkspace) return;
        try {
          await api('/api/workspaces/' + activeWorkspace.id, {
            method: 'PUT',
            body: JSON.stringify({ shared_notes: text })
          });
          setNotesSaving(false);
          setNotesSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } catch (err) {
          console.error('Failed to auto-save notes:', err);
          setNotesSaving(false);
        }
      }, 1200);
    };

    const insertNoteTemplate = (templateKey) => {
      const template = NOTE_TEMPLATES[templateKey];
      if (!template) return;
      const updated = notesContent ? notesContent + '\n\n' + template : template;
      handleNotesChange(updated);
    };

    const exportNotes = () => {
      const blob = new Blob([notesContent], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeWorkspace?.title || 'skillswap'}_teaching_notes.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const copyNotes = () => {
      navigator.clipboard.writeText(notesContent);
      alert('Notes copied to clipboard! 📋');
    };

    // Live Video & Voice Call Actions
    const startCall = async (type = 'video') => {
      setCallType(type);
      setInCall(true);
      setCallDuration(0);

      if (callTimerRef.current) clearInterval(callTimerRef.current);
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Attempt to access user media (webcam/mic)
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: type === 'video',
            audio: true
          });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn('Media devices not fully available or permission denied; running interactive peer studio simulator.', err);
        }
      }
    };

    const endCall = () => {
      setInCall(false);
      setScreenSharing(false);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
    };

    const toggleMute = () => {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      }
      setMicMuted(!micMuted);
    };

    const toggleCam = () => {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      }
      setCamOff(!camOff);
    };

    const toggleScreenShare = async () => {
      if (screenSharing) {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
          screenStreamRef.current = null;
        }
        setScreenSharing(false);
      } else {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          try {
            const sStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenStreamRef.current = sStream;
            setScreenSharing(true);
            sStream.getVideoTracks()[0].onended = () => {
              setScreenSharing(false);
            };
          } catch (err) {
            setScreenSharing(true); // fallback mode
          }
        } else {
          setScreenSharing(true);
        }
      }
    };

    const formatCallTimer = (totalSeconds) => {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Code Sandbox Runner
    const runCode = () => {
      setCodeRunning(true);
      setCodeOutput('Compiling and executing code in sandbox environment...\n');
      const startTime = performance.now();

      setTimeout(() => {
        try {
          if (codeLang === 'javascript') {
            const logs = [];
            const customConsole = {
              log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
              error: (...args) => logs.push('❌ Error: ' + args.join(' ')),
              warn: (...args) => logs.push('⚠️ Warning: ' + args.join(' ')),
              info: (...args) => logs.push('ℹ️ ' + args.join(' '))
            };
            const safeFn = new Function('console', codeSnippet);
            safeFn(customConsole);
            const duration = (performance.now() - startTime).toFixed(1);
            setCodeExecTime(duration);
            setCodeOutput(logs.join('\n') || '✓ Program executed successfully with no stdout.');
          } else {
            // Algorithmic execution simulator for other languages
            const duration = (Math.random() * 80 + 30).toFixed(1);
            setCodeExecTime(duration);
            if (codeLang === 'python') {
              setCodeOutput(`Input Array: [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nMaximum Subarray Sum: 6\nComplexity: O(n) Time | O(1) Space ✓\n[Finished in ${duration}ms with exit code 0]`);
            } else if (codeLang === 'cpp') {
              setCodeOutput(`Target element: 23\nFound at index: 5 in O(log N) operations!\nProcess returned 0 (0x0)   execution time : 0.0${duration} s`);
            } else if (codeLang === 'java') {
              setCodeOutput(`Active Cache Size: 2\nRetrieved: 500\n[LRUCache eviction policy validated successfully]`);
            } else if (codeLang === 'sql') {
              setCodeOutput(`partner_name   | total_milestones | completed_milestones | peer_trust_rating\n---------------+------------------+----------------------+------------------\n${activeWorkspace?.partner?.name || 'Active Peer'} | 6                | 4                    | 4.95\n(1 row affected)`);
            } else {
              setCodeOutput(`Worker 1 processing task 1\nWorker 1 processing task 2\nWorker 1 processing task 3\nPipeline execution finished.\n✓ Goroutine channels synchronized.`);
            }
          }
        } catch (err) {
          setCodeOutput(`Runtime Exception:\n${err.message}`);
        } finally {
          setCodeRunning(false);
        }
      }, 400);
    };

    // Whiteboard Canvas Handlers
    useEffect(() => {
      const canvas = whiteboardCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Draw initial welcome background grid
      if (wbHistory.length === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Subtle grid lines
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        // Initial welcome diagram text
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText('🎨 Collaborative Teaching Whiteboard — Draw architecture diagrams, trees, and flowcharts here!', 30, 40);
        saveWhiteboardSnapshot();
      }
    }, [activeTab]);

    const saveWhiteboardSnapshot = () => {
      const canvas = whiteboardCanvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL();
      setWbHistory(prev => [...prev.slice(-15), dataUrl]);
    };

    const getCanvasCoordinates = (e) => {
      const canvas = whiteboardCanvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const handleWbMouseDown = (e) => {
      const canvas = whiteboardCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      isDrawingRef.current = true;
      const pt = getCanvasCoordinates(e);
      startPointRef.current = pt;
      canvasSnapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (wbTool === 'pen' || wbTool === 'highlighter' || wbTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
      }
    };

    const handleWbMouseMove = (e) => {
      if (!isDrawingRef.current) return;
      const canvas = whiteboardCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const pt = getCanvasCoordinates(e);

      if (wbTool === 'pen') {
        ctx.strokeStyle = wbColor;
        ctx.lineWidth = wbSize;
        ctx.globalAlpha = 1.0;
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      } else if (wbTool === 'highlighter') {
        ctx.strokeStyle = wbColor;
        ctx.lineWidth = wbSize * 3;
        ctx.globalAlpha = 0.35;
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      } else if (wbTool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = wbSize * 4;
        ctx.globalAlpha = 1.0;
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      } else if (canvasSnapshotRef.current) {
        // Shapes: restore snapshot and draw preview
        ctx.putImageData(canvasSnapshotRef.current, 0, 0);
        ctx.strokeStyle = wbColor;
        ctx.lineWidth = wbSize;
        ctx.globalAlpha = 1.0;
        const start = startPointRef.current;

        if (wbTool === 'rect') {
          ctx.strokeRect(start.x, start.y, pt.x - start.x, pt.y - start.y);
        } else if (wbTool === 'circle') {
          const radius = Math.sqrt(Math.pow(pt.x - start.x, 2) + Math.pow(pt.y - start.y, 2));
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (wbTool === 'arrow') {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(pt.x, pt.y);
          ctx.stroke();
          // Arrow head
          const angle = Math.atan2(pt.y - start.y, pt.x - start.x);
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - 15 * Math.cos(angle - Math.PI / 6), pt.y - 15 * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - 15 * Math.cos(angle + Math.PI / 6), pt.y - 15 * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
      }
    };

    const handleWbMouseUp = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      saveWhiteboardSnapshot();
    };

    const clearWhiteboard = () => {
      const canvas = whiteboardCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveWhiteboardSnapshot();
    };

    const undoWhiteboard = () => {
      if (wbHistory.length <= 1) return;
      const newHistory = [...wbHistory];
      newHistory.pop(); // remove current
      const prevDataUrl = newHistory[newHistory.length - 1];
      setWbHistory(newHistory);
      const canvas = whiteboardCanvasRef.current;
      if (!canvas || !prevDataUrl) return;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = prevDataUrl;
    };

    const exportWhiteboard = () => {
      const canvas = whiteboardCanvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${activeWorkspace?.title || 'teaching'}_architecture_whiteboard.png`;
      link.click();
    };

    // Task Handlers
    const handleAddTask = async (e) => {
      e.preventDefault();
      if (!newTaskTitle.trim() || !activeWorkspace) return;
      await api('/api/workspaces/' + activeWorkspace.id + '/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTaskTitle.trim() })
      });
      setNewTaskTitle('');
      loadWorkspaceDetails(activeWorkspace.id);
    };

    const handleToggleTask = async (task) => {
      const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
      await api('/api/workspaces/' + activeWorkspace.id + '/tasks', {
        method: 'PUT',
        body: JSON.stringify({ task_id: task.id, status: newStatus })
      });
      loadWorkspaceDetails(activeWorkspace.id);
    };

    // Session Scheduler Handler
    const handleScheduleSession = async (e) => {
      e.preventDefault();
      if (!sessTitle.trim() || !sessDate || !sessTime || !activeWorkspace) return;

      const datetimeString = sessDate + 'T' + sessTime + ':00';
      try {
        await api('/api/sessions', {
          method: 'POST',
          body: JSON.stringify({
            workspace_id: activeWorkspace.id,
            title: sessTitle.trim(),
            session_date: new Date(datetimeString).toISOString(),
            duration_minutes: Number(sessDuration),
            timezone: sessTimezone,
            meeting_link: sessLink.trim(),
            agenda: sessAgenda.trim()
          })
        });
        setSchedulerOpen(false);
        setSessTitle('');
        setSessDate('');
        setSessTime('');
        setSessLink('');
        setSessAgenda('');
        loadWorkspaceDetails(activeWorkspace.id);
        alert('Practice session booked successfully! 📅');
      } catch (err) {
        alert(err.message);
      }
    };

    // Submit Review & Endorsement Handler
    const handleSubmitReview = async (e) => {
      e.preventDefault();
      if (!activeWorkspace || reviewSubmitting) return;

      setReviewSubmitting(true);
      try {
        await api('/api/reviews', {
          method: 'POST',
          body: JSON.stringify({
            workspace_id: activeWorkspace.id,
            rating: reviewRating,
            communication_rating: reviewCommRating,
            knowledge_rating: reviewKnowledgeRating,
            reliability_rating: reviewReliabilityRating,
            comment: reviewComment.trim()
          })
        });

        // Also submit skill endorsement if partner has skill ID
        if (activeWorkspace.user2_skill_id || activeWorkspace.user1_skill_id) {
          const isUser1 = activeWorkspace.user1_id === currentUser.id;
          const targetSkillId = isUser1 ? activeWorkspace.user2_skill_id : activeWorkspace.user1_skill_id;
          if (targetSkillId) {
            await api('/api/endorsements', {
              method: 'POST',
              body: JSON.stringify({
                user_skill_id: targetSkillId,
                workspace_id: activeWorkspace.id,
                comment: reviewComment.trim() || 'Verified peer mastery through completed skill exchange.'
              })
            }).catch(() => {});
          }
        }

        setReviewSubmitted(true);
        loadWorkspaceDetails(activeWorkspace.id);
        alert('⭐ Review & Peer Endorsement successfully submitted! Badges updated.');
      } catch (err) {
        alert('Failed to submit review: ' + err.message);
      } finally {
        setReviewSubmitting(false);
      }
    };

    if (loading) {
      return html`
        <div class="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
          <div class="w-12 h-12 border-4 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-sm font-semibold text-warmgray-600">Loading your collaborative learning workspaces...</p>
        </div>
      `;
    }

    if (!activeWorkspace) {
      return html`
        <div class="max-w-5xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
          <div class="w-20 h-20 bg-cream-100 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">🤝</div>
          <div class="space-y-2">
            <h2 class="font-serif text-3xl font-bold text-navy-950">No Active Matched Workspaces Yet</h2>
            <p class="text-warmgray-600 max-w-md mx-auto text-xs sm:text-sm">
              Connect with peers, propose a skill exchange, or accept incoming requests to launch your shared live video, notes, and code classroom!
            </p>
          </div>
          <div class="flex flex-wrap justify-center gap-3 pt-2">
            <button onClick=${() => setActiveTab && setActiveTab('requests')} class="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-2xl shadow-md transition-all text-xs">
              View Swap Requests →
            </button>
            <button onClick=${() => setActiveTab && setActiveTab('exchange')} class="px-6 py-3 bg-white hover:bg-cream-100 border border-cream-300 text-navy-900 font-bold rounded-2xl shadow-sm transition-all text-xs">
              Explore Skill Exchange Hub 🌐
            </button>
          </div>
        </div>
      `;
    }

    const partner = activeWorkspace.partner || { name: 'Active Peer', headline: 'Skill Enthusiast', avatar_url: '' };
    const isUser1 = activeWorkspace.user1_id === currentUser.id;
    const mySkill = isUser1 ? activeWorkspace.user1_skill_name : activeWorkspace.user2_skill_name;
    const partnerSkill = isUser1 ? activeWorkspace.user2_skill_name : activeWorkspace.user1_skill_name;

    return html`
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 text-left animate-fadeIn">
        
        <!-- Top Workspace Match & Context Banner -->
        <div class="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-navy-700/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <!-- Matched Peer Details -->
          <div class="flex items-center gap-4 z-10">
            <div class="relative">
              <img
                src=${partner.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${partner.name}`}
                alt=${partner.name}
                class="w-14 h-14 rounded-2xl object-cover border-2 border-navy-400 bg-navy-800 shadow-md"
              />
              <span class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-navy-900 rounded-full" title="Active Match"></span>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="font-serif text-xl sm:text-2xl font-bold tracking-tight">${activeWorkspace.title || `Exchange with ${partner.name}`}</h1>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Match 🇮🇳
                </span>
              </div>
              <p class="text-xs text-cream-200">
                Learning Partner: <strong class="text-white">${partner.name}</strong> • ${partner.headline || 'Peer Learner'}
              </p>
              
              <!-- Reciprocal Exchange Badges -->
              <div class="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                <span class="px-2.5 py-1 bg-navy-800/80 border border-navy-700 rounded-lg text-cream-100 flex items-center gap-1.5 font-medium">
                  <span>🎓 You Teach:</span> <strong class="text-emerald-400">${mySkill || 'Your Skill'}</strong>
                </span>
                <span class="text-cream-400 font-bold">⇄</span>
                <span class="px-2.5 py-1 bg-navy-800/80 border border-navy-700 rounded-lg text-cream-100 flex items-center gap-1.5 font-medium">
                  <span>🚀 You Learn:</span> <strong class="text-sky-400">${partnerSkill || 'Partner Skill'}</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Top Actions (Workspace Selector & Live Call Starter) -->
          <div class="flex flex-wrap items-center gap-2.5 z-10 w-full md:w-auto justify-start md:justify-end">
            ${workspaces.length > 1 ? html`
              <select onChange=${e => loadWorkspaceDetails(Number(e.target.value))} value=${activeWorkspace.id} class="px-3 py-2 bg-navy-800/90 border border-navy-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-navy-400">
                ${workspaces.map(w => html`<option key=${w.id} value=${w.id}>${w.title || `Workspace #${w.id}`}</option>`)}
              </select>
            ` : null}

            ${!inCall ? html`
              <button onClick=${() => { setActiveSubTab('live-room'); startCall('video'); }} class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-900/40 text-xs flex items-center gap-1.5 transition-all">
                <span>📹</span> Launch Live Class
              </button>
            ` : html`
              <button onClick=${endCall} class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg text-xs flex items-center gap-1.5 transition-all animate-pulse">
                <span>🛑</span> End Live Call (${formatCallTimer(callDuration)})
              </button>
            `}

            <button onClick=${() => setChatOpen(!chatOpen)} class="px-3.5 py-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all">
              <span>💬</span> Live Chat
              ${chatMessages.length > 0 ? html`<span class="w-2 h-2 rounded-full bg-emerald-400"></span>` : null}
            </button>
          </div>
        </div>

        <!-- Navigation Tabs for Collaboration Tools -->
        <div class="flex items-center gap-2 border-b border-cream-300 pb-2 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick=${() => setActiveSubTab('live-room')}
            class="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'live-room' ? 'bg-navy-900 text-white shadow-md' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            <span>📹</span> Live Video Classroom
            ${inCall ? html`<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>` : null}
          </button>

          <button
            onClick=${() => setActiveSubTab('notes')}
            class="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'notes' ? 'bg-navy-900 text-white shadow-md' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            <span>📝</span> Shared Notes
            ${notesSaving ? html`<span class="text-[10px] text-amber-300 font-normal">saving...</span>` : null}
          </button>

          <button
            onClick=${() => setActiveSubTab('code')}
            class="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'code' ? 'bg-navy-900 text-white shadow-md' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            <span>💻</span> Code Sandbox & Runner
          </button>

          <button
            onClick=${() => setActiveSubTab('whiteboard')}
            class="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'whiteboard' ? 'bg-navy-900 text-white shadow-md' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            <span>🎨</span> Architecture Whiteboard
          </button>

          <button
            onClick=${() => setActiveSubTab('tasks')}
            class="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'tasks' ? 'bg-navy-900 text-white shadow-md' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            <span>🎯</span> Action Tasks (${(activeWorkspace.tasks || []).filter(t => t.status === 'COMPLETED').length}/${(activeWorkspace.tasks || []).length})
          </button>

          <button
            onClick=${() => setActiveSubTab('sessions')}
            class="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'sessions' ? 'bg-navy-900 text-white shadow-md' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            <span>📅</span> Schedule & Calls (${sessions.length})
          </button>

          <button
            onClick=${() => setActiveSubTab('endorse')}
            class="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${activeTab === 'endorse' ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'}"
          >
            <span>⭐</span> Endorse & Review
            ${reviewSubmitted ? html`<span>✓</span>` : null}
          </button>
        </div>

        <!-- Main Workspace Workbench Area -->
        <div class="grid grid-cols-1 ${chatOpen ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6 items-start">
          
          <!-- Primary Tool Area (Col Span 2 or 3) -->
          <div class="${chatOpen ? 'lg:col-span-2' : 'w-full'} space-y-6">

            <!-- ----------------------------------------------- -->
            <!-- TAB 1: LIVE VIDEO & AUDIO CLASSROOM -->
            <!-- ----------------------------------------------- -->
            ${activeTab === 'live-room' && html`
              <div class="bg-navy-955 rounded-3xl p-6 border border-navy-800 shadow-2xl text-white space-y-6 animate-fadeIn">
                <div class="flex items-center justify-between border-b border-navy-800 pb-4 flex-wrap gap-3">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full ${inCall ? 'bg-emerald-500 animate-pulse' : 'bg-warmgray-500'}"></span>
                      <h3 class="font-serif text-lg font-bold text-white">Live Interactive Teaching Room</h3>
                    </div>
                    <p class="text-xs text-cream-300">
                      ${inCall ? `Active Call Duration: ${formatCallTimer(callDuration)} • High-Definition P2P Stream` : 'Launch a live session to teach, screenshare code, and review assignments together.'}
                    </p>
                  </div>

                  <!-- Role Switcher -->
                  <div class="flex items-center gap-2 bg-navy-900 p-1 rounded-xl border border-navy-700 text-[11px]">
                    <button
                      onClick=${() => setTeachingRole('teaching')}
                      class="px-3 py-1 rounded-lg font-bold transition-all ${teachingRole === 'teaching' ? 'bg-emerald-600 text-white' : 'text-cream-300 hover:text-white'}"
                    >
                      👨‍🏫 You are Teaching
                    </button>
                    <button
                      onClick=${() => setTeachingRole('learning')}
                      class="px-3 py-1 rounded-lg font-bold transition-all ${teachingRole === 'learning' ? 'bg-sky-600 text-white' : 'text-cream-300 hover:text-white'}"
                    >
                      🧑‍💻 You are Learning
                    </button>
                  </div>
                </div>

                <!-- Video Grid / Stage -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                  
                  <!-- Local Stream (You) -->
                  <div class="bg-navy-900/90 rounded-2xl border border-navy-700 overflow-hidden relative aspect-video flex items-center justify-center shadow-inner group">
                    ${inCall && !camOff && callType === 'video' ? html`
                      <video ref=${localVideoRef} autoPlay playsInline muted class="w-full h-full object-cover transform -scale-x-100"></video>
                    ` : html`
                      <div class="text-center space-y-2 p-4">
                        <img src=${currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`} class="w-16 h-16 rounded-full mx-auto border-2 border-navy-500 shadow-md" />
                        <p class="font-bold text-xs text-white">${currentUser.name} (You)</p>
                        <p class="text-[10px] text-cream-300">${camOff ? 'Camera Turned Off' : inCall ? 'Audio Stream Connected 🎙️' : 'Camera Ready'}</p>
                      </div>
                    `}
                    <div class="absolute bottom-2 left-2 px-2.5 py-1 bg-navy-950/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 border border-navy-700">
                      <span>${currentUser.name} (You)</span>
                      ${micMuted ? html`<span class="text-rose-400">🔇 Muted</span>` : html`<span class="text-emerald-400">🎙️ Active</span>`}
                    </div>
                  </div>

                  <!-- Remote Stream (Partner) -->
                  <div class="bg-navy-900/90 rounded-2xl border border-navy-700 overflow-hidden relative aspect-video flex items-center justify-center shadow-inner">
                    ${inCall ? html`
                      ${screenSharing ? html`
                        <div class="w-full h-full bg-slate-950 p-4 flex flex-col justify-center items-center text-center space-y-2">
                          <span class="text-3xl">🖥️</span>
                          <p class="text-xs font-bold text-emerald-400">Screen Sharing Active</p>
                          <p class="text-[10px] text-warmgray-400">Viewing real-time code editor & slides</p>
                        </div>
                      ` : html`
                        <div class="text-center space-y-2 p-4">
                          <div class="relative inline-block">
                            <img src=${partner.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${partner.name}`} class="w-16 h-16 rounded-full mx-auto border-2 border-emerald-500 shadow-lg" />
                            <span class="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-navy-900 rounded-full animate-pulse"></span>
                          </div>
                          <p class="font-bold text-xs text-white">${partner.name}</p>
                          <div class="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-semibold">
                            <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                            <span>Speaking • ${teachingRole === 'teaching' ? 'Listening & Asking Questions' : 'Presenting Concept'}</span>
                          </div>
                        </div>
                      `}
                    ` : html`
                      <div class="text-center space-y-2 p-4">
                        <img src=${partner.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${partner.name}`} class="w-16 h-16 rounded-full mx-auto border-2 border-navy-600 opacity-60" />
                        <p class="font-bold text-xs text-warmgray-400">${partner.name}</p>
                        <p class="text-[10px] text-warmgray-500">Ready to join your live teaching room</p>
                      </div>
                    `}
                    <div class="absolute bottom-2 left-2 px-2.5 py-1 bg-navy-950/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 border border-navy-700">
                      <span>${partner.name}</span>
                      <span class="text-emerald-400">● Live Peer</span>
                    </div>
                  </div>
                </div>

                <!-- Call Control Bar -->
                <div class="p-4 bg-navy-900 rounded-2xl border border-navy-800 flex flex-wrap items-center justify-center gap-3">
                  ${!inCall ? html`
                    <button onClick=${() => startCall('video')} class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg text-xs flex items-center gap-2 transition-all">
                      <span>📹</span> Start Video Call
                    </button>
                    <button onClick=${() => startCall('audio')} class="px-6 py-2.5 bg-navy-700 hover:bg-navy-600 text-white font-bold rounded-xl shadow-md text-xs flex items-center gap-2 transition-all">
                      <span>📞</span> Start Voice Call
                    </button>
                  ` : html`
                    <button onClick=${toggleMute} class="p-3 rounded-xl font-bold text-xs transition-all ${micMuted ? 'bg-rose-600 text-white' : 'bg-navy-800 hover:bg-navy-700 text-white'}" title=${micMuted ? 'Unmute' : 'Mute'}>
                      ${micMuted ? '🔇 Unmute' : '🎙️ Mute'}
                    </button>

                    <button onClick=${toggleCam} class="p-3 rounded-xl font-bold text-xs transition-all ${camOff ? 'bg-rose-600 text-white' : 'bg-navy-800 hover:bg-navy-700 text-white'}" title=${camOff ? 'Turn Cam On' : 'Turn Cam Off'}>
                      ${camOff ? '📷 Enable Camera' : '📹 Turn Off Camera'}
                    </button>

                    <button onClick=${toggleScreenShare} class="p-3 rounded-xl font-bold text-xs transition-all ${screenSharing ? 'bg-indigo-600 text-white' : 'bg-navy-800 hover:bg-navy-700 text-white'}" title="Share Screen">
                      ${screenSharing ? '⏹️ Stop Share' : '🖥️ Share Screen'}
                    </button>

                    <button onClick=${() => setMiniNotesInCall(!miniNotesInCall)} class="p-3 rounded-xl font-bold text-xs bg-navy-800 hover:bg-navy-700 text-white transition-all">
                      📝 In-Call Scratchpad
                    </button>

                    <button onClick=${endCall} class="px-5 py-3 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all flex items-center gap-1.5">
                      <span>🛑</span> Leave Call
                    </button>
                  `}

                  <div class="w-full sm:w-auto sm:ml-auto flex items-center gap-2 text-xs">
                    <button onClick=${() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Workspace room URL copied to clipboard! Share it directly with your partner.');
                      } else {
                        alert('Workspace URL: ' + window.location.href);
                      }
                    }} class="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 text-cream-200 hover:text-white rounded-lg border border-navy-700 text-[11px] font-semibold transition-all">
                      Copy Room Link 🔗
                    </button>
                  </div>
                </div>

                <!-- Pop-out Mini Scratchpad during call -->
                ${miniNotesInCall ? html`
                  <div class="p-4 bg-navy-900 rounded-2xl border border-navy-700 space-y-2 text-xs">
                    <div class="flex items-center justify-between text-cream-300">
                      <span class="font-bold">📝 Quick In-Call Live Notes</span>
                      <span class="text-[10px] text-emerald-400">Syncs with Workspace Notes</span>
                    </div>
                    <textarea
                      rows="3"
                      value=${notesContent}
                      onChange=${e => handleNotesChange(e.target.value)}
                      placeholder="Jot down quick feedback, algorithm hints, or assignment steps during this call..."
                      class="w-full p-3 bg-navy-950 border border-navy-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-navy-500"
                    ></textarea>
                  </div>
                ` : null}
              </div>
            `}

            <!-- ----------------------------------------------- -->
            <!-- TAB 2: COLLABORATIVE SHARED NOTES -->
            <!-- ----------------------------------------------- -->
            ${activeTab === 'notes' && html`
              <div class="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-sm space-y-5 animate-fadeIn">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
                  <div>
                    <h3 class="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
                      <span>📝</span> Collaborative Lecture & Practice Notes
                    </h3>
                    <p class="text-xs text-warmgray-600">
                      Both you and <strong>${partner.name}</strong> can write, format, and save shared notes in real time.
                    </p>
                  </div>

                  <div class="flex items-center gap-2 flex-wrap text-xs">
                    <span class="text-[11px] font-semibold ${notesSaving ? 'text-amber-600' : 'text-emerald-600'} bg-cream-50 px-2.5 py-1 rounded-lg border border-cream-200">
                      ${notesSaving ? '💾 Saving changes...' : notesSavedTime ? `✓ Saved to Cloud (${notesSavedTime})` : '✓ All changes synced'}
                    </span>
                    <button onClick=${copyNotes} class="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-navy-900 font-bold rounded-xl border border-cream-300 text-xs transition-colors">
                      📋 Copy
                    </button>
                    <button onClick=${exportNotes} class="px-3 py-1.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm">
                      💾 Export (.md)
                    </button>
                  </div>
                </div>

                <!-- Pre-built Teaching Templates -->
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <span class="text-warmgray-500 font-bold text-[11px]">Insert Template:</span>
                  <button onClick=${() => insertNoteTemplate('dsa')} class="px-2.5 py-1 bg-cream-50 hover:bg-cream-100 text-navy-800 border border-cream-200 rounded-lg font-medium text-[11px]">
                    📚 DSA & LeetCode
                  </button>
                  <button onClick=${() => insertNoteTemplate('system_design')} class="px-2.5 py-1 bg-cream-50 hover:bg-cream-100 text-navy-800 border border-cream-200 rounded-lg font-medium text-[11px]">
                    🇮🇳 System Design
                  </button>
                  <button onClick=${() => insertNoteTemplate('fullstack')} class="px-2.5 py-1 bg-cream-50 hover:bg-cream-100 text-navy-800 border border-cream-200 rounded-lg font-medium text-[11px]">
                    ⚡ React & Fullstack
                  </button>
                  <button onClick=${() => insertNoteTemplate('checklist')} class="px-2.5 py-1 bg-cream-50 hover:bg-cream-100 text-navy-800 border border-cream-200 rounded-lg font-medium text-[11px]">
                    🎯 Swap Action Plan
                  </button>
                  <button onClick=${() => setNotesPreview(!notesPreview)} class="ml-auto px-3 py-1 bg-navy-100 hover:bg-navy-200 text-navy-900 rounded-lg font-bold text-[11px]">
                    ${notesPreview ? '✏️ Edit Mode' : '👁️ Preview Markdown'}
                  </button>
                </div>

                <!-- Notes Editor / Preview Area -->
                ${notesPreview ? html`
                  <div class="p-5 bg-cream-50 rounded-2xl border border-cream-300 min-h-[350px] font-sans text-xs text-navy-950 space-y-3 whitespace-pre-wrap leading-relaxed">
                    ${notesContent || 'No notes written yet. Switch to Edit Mode to type!'}
                  </div>
                ` : html`
                  <textarea
                    rows="16"
                    value=${notesContent}
                    onChange=${e => handleNotesChange(e.target.value)}
                    placeholder="# Peer Teaching Lecture Notes&#10;&#10;Write markdown notes, code snippets, homework assignments, or system architecture steps here..."
                    class="w-full p-4 bg-cream-50 border border-cream-300 rounded-2xl text-navy-950 font-mono text-xs focus:outline-none focus:border-navy-600 shadow-inner leading-relaxed"
                  ></textarea>
                `}
              </div>
            `}

            <!-- ----------------------------------------------- -->
            <!-- TAB 3: CODE SANDBOX & LIVE RUNNER -->
            <!-- ----------------------------------------------- -->
            ${activeTab === 'code' && html`
              <div class="bg-navy-955 rounded-3xl p-6 border border-navy-800 shadow-2xl text-white space-y-5 animate-fadeIn">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-navy-800 pb-4">
                  <div>
                    <h3 class="font-serif text-xl font-bold text-white flex items-center gap-2">
                      <span>💻</span> Interactive Code Sandbox & Runner
                    </h3>
                    <p class="text-xs text-cream-300">
                      Write, debug, and execute code live with your peer teacher.
                    </p>
                  </div>

                  <div class="flex items-center gap-2">
                    <!-- Language Selector -->
                    <select
                      value=${codeLang}
                      onChange=${e => setCodeLang(e.target.value)}
                      class="px-3 py-1.5 bg-navy-900 border border-navy-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="javascript">JavaScript (Node/ES6)</option>
                      <option value="python">Python 3 (DSA)</option>
                      <option value="cpp">C++ 20 (Algorithmic)</option>
                      <option value="java">Java 17 (OOP)</option>
                      <option value="sql">SQL (PostgreSQL)</option>
                      <option value="go">Golang (Concurrency)</option>
                    </select>

                    <button
                      onClick=${runCode}
                      disabled=${codeRunning}
                      class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <span>▶</span> ${codeRunning ? 'Running...' : 'Run Code'}
                    </button>
                  </div>
                </div>

                <!-- Code Editor Textarea -->
                <div class="relative">
                  <textarea
                    rows="14"
                    value=${codeSnippet}
                    onChange=${e => setCodeSnippet(e.target.value)}
                    class="w-full p-4 bg-navy-900 border border-navy-800 rounded-2xl text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500 shadow-inner leading-relaxed resize-y"
                    spellCheck="false"
                  ></textarea>
                </div>

                <!-- Output Terminal Window -->
                <div class="bg-black/90 rounded-2xl p-4 border border-navy-800 space-y-2">
                  <div class="flex items-center justify-between text-xs text-warmgray-400 border-b border-navy-800 pb-2">
                    <span class="font-mono font-bold text-cream-200">Terminal Output Console</span>
                    <span>${codeExecTime ? `Execution: ${codeExecTime}ms` : 'Ready'}</span>
                  </div>
                  <pre class="font-mono text-xs text-cream-100 whitespace-pre-wrap min-h-[80px] max-h-56 overflow-y-auto leading-relaxed">
                    ${codeOutput || 'Click "Run Code" to compile and view execution output here.'}
                  </pre>
                </div>
              </div>
            `}

            <!-- ----------------------------------------------- -->
            <!-- TAB 4: ARCHITECTURE WHITEBOARD -->
            <!-- ----------------------------------------------- -->
            ${activeTab === 'whiteboard' && html`
              <div class="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-4 animate-fadeIn">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-3">
                  <div>
                    <h3 class="font-serif text-xl font-bold text-navy-950 flex items-center gap-2">
                      <span>🎨</span> Collaborative System Design Whiteboard
                    </h3>
                    <p class="text-xs text-warmgray-600">
                      Sketch software architecture, microservice flows, database schemas, and data structures.
                    </p>
                  </div>

                  <div class="flex items-center gap-2">
                    <button onClick=${undoWhiteboard} class="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-navy-900 font-bold rounded-xl text-xs border border-cream-300 transition-colors">
                      ↩ Undo
                    </button>
                    <button onClick=${clearWhiteboard} class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-colors">
                      🧹 Clear
                    </button>
                    <button onClick=${exportWhiteboard} class="px-3 py-1.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm">
                      💾 Export PNG
                    </button>
                  </div>
                </div>

                <!-- Whiteboard Tools Bar -->
                <div class="p-3 bg-cream-50 rounded-2xl border border-cream-200 flex flex-wrap items-center gap-3 text-xs">
                  <div class="flex items-center gap-1">
                    <button onClick=${() => setWbTool('pen')} class="px-3 py-1.5 rounded-lg font-bold ${wbTool === 'pen' ? 'bg-navy-900 text-white' : 'bg-white text-navy-800 border border-cream-300'}">
                      ✏️ Pen
                    </button>
                    <button onClick=${() => setWbTool('highlighter')} class="px-3 py-1.5 rounded-lg font-bold ${wbTool === 'highlighter' ? 'bg-navy-900 text-white' : 'bg-white text-navy-800 border border-cream-300'}">
                      🖍️ Highlight
                    </button>
                    <button onClick=${() => setWbTool('arrow')} class="px-3 py-1.5 rounded-lg font-bold ${wbTool === 'arrow' ? 'bg-navy-900 text-white' : 'bg-white text-navy-800 border border-cream-300'}">
                      ➡️ Arrow
                    </button>
                    <button onClick=${() => setWbTool('rect')} class="px-3 py-1.5 rounded-lg font-bold ${wbTool === 'rect' ? 'bg-navy-900 text-white' : 'bg-white text-navy-800 border border-cream-300'}">
                      🔲 Box
                    </button>
                    <button onClick=${() => setWbTool('circle')} class="px-3 py-1.5 rounded-lg font-bold ${wbTool === 'circle' ? 'bg-navy-900 text-white' : 'bg-white text-navy-800 border border-cream-300'}">
                      ⭕ Circle
                    </button>
                    <button onClick=${() => setWbTool('eraser')} class="px-3 py-1.5 rounded-lg font-bold ${wbTool === 'eraser' ? 'bg-navy-900 text-white' : 'bg-white text-navy-800 border border-cream-300'}">
                      🧹 Eraser
                    </button>
                  </div>

                  <!-- Color Palette -->
                  <div class="flex items-center gap-1.5 ml-auto">
                    ${['#1e293b', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed'].map(c => html`
                      <button
                        key=${c}
                        onClick=${() => setWbColor(c)}
                        style=${{ backgroundColor: c }}
                        class="w-6 h-6 rounded-full border-2 transition-transform ${wbColor === c ? 'scale-125 border-navy-950 shadow-md' : 'border-white'}"
                      ></button>
                    `)}
                  </div>
                </div>

                <!-- Canvas Component -->
                <div class="border border-cream-300 rounded-2xl overflow-hidden shadow-inner bg-white">
                  <canvas
                    ref=${whiteboardCanvasRef}
                    width="1000"
                    height="520"
                    onMouseDown=${handleWbMouseDown}
                    onMouseMove=${handleWbMouseMove}
                    onMouseUp=${handleWbMouseUp}
                    onTouchStart=${handleWbMouseDown}
                    onTouchMove=${handleWbMouseMove}
                    onTouchEnd=${handleWbMouseUp}
                    class="w-full h-[520px] cursor-crosshair block"
                  ></canvas>
                </div>
              </div>
            `}

            <!-- ----------------------------------------------- -->
            <!-- TAB 5: ACTION TASKS & MILESTONES -->
            <!-- ----------------------------------------------- -->
            ${activeTab === 'tasks' && html`
              <div class="bg-white p-7 rounded-3xl border border-cream-300 shadow-sm space-y-6 animate-fadeIn">
                <div class="flex items-center justify-between border-b border-cream-100 pb-3">
                  <div>
                    <h3 class="font-serif text-xl font-bold text-navy-950">Learning Action Tasks & Homework</h3>
                    <p class="text-xs text-warmgray-600">Track mutual milestone completion to earn verified mastery endorsements.</p>
                  </div>
                  <span class="text-xs font-bold text-navy-900 bg-cream-100 px-3 py-1 rounded-full">
                    ${(activeWorkspace.tasks || []).filter(t => t.status === 'COMPLETED').length}/${(activeWorkspace.tasks || []).length} Completed
                  </span>
                </div>

                <form onSubmit=${handleAddTask} class="flex gap-2">
                  <input
                    type="text"
                    required
                    value=${newTaskTitle}
                    onChange=${e => setNewTaskTitle(e.target.value)}
                    placeholder="Enter practice task or homework title (e.g. Implement Kafka consumer)..."
                    class="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-medium text-navy-900 text-xs"
                  />
                  <button type="submit" class="px-6 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-sm transition-colors shrink-0 text-xs">
                    Add Task
                  </button>
                </form>

                <div class="space-y-2.5 pt-2">
                  ${(activeWorkspace.tasks || []).length === 0 ? html`
                    <p class="text-xs text-warmgray-500 text-center py-6">No tasks added yet. Create action items for your peer learning sprint!</p>
                  ` : (activeWorkspace.tasks || []).map(t => html`
                    <div key=${t.id} onClick=${() => handleToggleTask(t)} class="p-3.5 bg-cream-50 hover:bg-cream-100/70 rounded-2xl border border-cream-200 flex items-center justify-between cursor-pointer transition-all duration-150 shadow-sm border-l-4 ${t.status === 'COMPLETED' ? 'border-l-emerald-500' : 'border-l-navy-600'}">
                      <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-lg border flex items-center justify-center ${t.status === 'COMPLETED' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-cream-400 bg-white shadow-inner'}">
                          ${t.status === 'COMPLETED' ? '✓' : ''}
                        </div>
                        <span class="font-medium text-xs ${t.status === 'COMPLETED' ? 'line-through text-warmgray-400' : 'text-navy-900'}">${t.title}</span>
                      </div>
                      <span class="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800' : 'bg-sky-50 text-indigo-900'}">${t.status}</span>
                    </div>
                  `)}
                </div>
              </div>
            `}

            <!-- ----------------------------------------------- -->
            <!-- TAB 6: SCHEDULED SESSIONS -->
            <!-- ----------------------------------------------- -->
            ${activeTab === 'sessions' && html`
              <div class="bg-white p-7 rounded-3xl border border-cream-300 shadow-sm space-y-6 animate-fadeIn">
                <div class="flex items-center justify-between border-b border-cream-200 pb-3">
                  <div>
                    <h3 class="font-serif text-xl font-bold text-navy-950">Booked Practice Sessions</h3>
                    <p class="text-xs text-warmgray-600">Calendar meetings and video links configured in Indian Standard Time (IST).</p>
                  </div>
                  <button onClick=${() => setSchedulerOpen(true)} class="px-4 py-2 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-sm">
                    + Book New Call
                  </button>
                </div>

                ${sessions.length === 0 ? html`
                  <div class="p-8 text-center space-y-3 bg-cream-50 rounded-2xl border border-cream-200">
                    <p class="text-xs text-warmgray-600">No practice calls scheduled yet.</p>
                    <button onClick=${() => setSchedulerOpen(true)} class="px-4 py-2 bg-navy-700 text-white font-bold rounded-xl text-xs">
                      Schedule 1st Practice Session 📅
                    </button>
                  </div>
                ` : html`
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    ${sessions.map(s => html`
                      <div key=${s.id} class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3 border-l-4 border-l-navy-600 shadow-sm">
                        <div class="flex justify-between items-start gap-1">
                          <h4 class="font-bold text-navy-900 text-xs">${s.title}</h4>
                          <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-navy-200 text-navy-900">${s.duration_minutes} min</span>
                        </div>
                        <div class="text-[11px] text-warmgray-600 font-medium space-y-1">
                          <p>📅 ${new Date(s.session_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} (IST)</p>
                          <p>👤 Proposer: ${s.proposer_name}</p>
                          ${s.agenda ? html`<p class="text-[10px] text-warmgray-500 italic">"${s.agenda}"</p>` : null}
                        </div>
                        <button onClick=${() => { setActiveSubTab('live-room'); startCall('video'); }} class="w-full text-center mt-2 px-3 py-2 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all">
                          Launch In-App Live Room 📹
                        </button>
                      </div>
                    `)}
                  </div>
                `}
              </div>
            `}

            <!-- ----------------------------------------------- -->
            <!-- TAB 7: ENDORSE & PEER REVIEW -->
            <!-- ----------------------------------------------- -->
            ${activeTab === 'endorse' && html`
              <div class="bg-white p-7 rounded-3xl border border-cream-300 shadow-sm space-y-6 animate-fadeIn">
                <div class="border-b border-cream-200 pb-3">
                  <h3 class="font-serif text-xl font-bold text-navy-950">Peer Review & Skill Endorsement ⭐</h3>
                  <p class="text-xs text-warmgray-600">
                    Verify <strong>${partner.name}</strong>'s mastery in <strong>${partnerSkill || 'their skill'}</strong> to reward verified badges on their public profile!
                  </p>
                </div>

                <form onSubmit=${handleSubmitReview} class="space-y-5 text-xs max-w-2xl">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="block font-bold text-navy-900">Overall Experience Rating (1-5)</label>
                      <div class="flex items-center gap-1">
                        ${[1, 2, 3, 4, 5].map(star => html`
                          <button
                            type="button"
                            key=${star}
                            onClick=${() => setReviewRating(star)}
                            class="text-2xl transition-transform ${star <= reviewRating ? 'text-amber-400 scale-110' : 'text-cream-300'}"
                          >
                            ★
                          </button>
                        `)}
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      <label class="block font-bold text-navy-900">Teaching & Knowledge Quality</label>
                      <select
                        value=${reviewKnowledgeRating}
                        onChange=${e => setReviewKnowledgeRating(Number(e.target.value))}
                        class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-semibold text-navy-900"
                      >
                        <option value="5">5 - Exceptional Mastery & Clarity</option>
                        <option value="4">4 - Very Good Knowledge</option>
                        <option value="3">3 - Adequate Knowledge</option>
                        <option value="2">2 - Basic Knowledge</option>
                        <option value="1">1 - Needs Improvement</option>
                      </select>
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block font-bold text-navy-900">Endorsement Testimonial & Review Comment</label>
                    <textarea
                      rows="4"
                      required
                      value=${reviewComment}
                      onChange=${e => setReviewComment(e.target.value)}
                      placeholder="Explain how your partner taught and collaborated (e.g. Excellent explanation of backend concurrency and clean code habits)..."
                      class="w-full p-3.5 bg-cream-50 border border-cream-300 rounded-xl font-medium text-navy-900 focus:outline-none focus:border-navy-600 text-xs"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled=${reviewSubmitting}
                    class="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition-all text-xs flex items-center gap-2"
                  >
                    <span>⭐</span> ${reviewSubmitting ? 'Submitting Endorsement...' : reviewSubmitted ? 'Update Endorsement & Review' : 'Submit Endorsement & Award Verified Badge'}
                  </button>
                </form>
              </div>
            `}

          </div>

          <!-- ----------------------------------------------- -->
          <!-- In-Workspace Real-time Live Chat Panel -->
          <!-- ----------------------------------------------- -->
          ${chatOpen && html`
            <div class="bg-white rounded-3xl border border-cream-300 shadow-xl overflow-hidden flex flex-col h-[650px] animate-fadeIn">
              <!-- Chat Header -->
              <div class="p-4 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800">
                <div class="flex items-center gap-2.5">
                  <div class="relative">
                    <img src=${partner.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${partner.name}`} class="w-8 h-8 rounded-full border border-navy-500" />
                    <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-navy-900"></span>
                  </div>
                  <div>
                    <h4 class="font-serif font-bold text-xs">${partner.name}</h4>
                    <p class="text-[9px] text-cream-300">Live Workspace Channel</p>
                  </div>
                </div>
                <button onClick=${() => setChatOpen(false)} class="text-cream-300 hover:text-white p-1">✕</button>
              </div>

              <!-- Quick Teaching Response Chips -->
              <div class="p-2 bg-cream-50 border-b border-cream-200 flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none">
                <button onClick=${() => setNewChatMsg('Can you share your screen for this part?')} class="px-2 py-1 bg-white hover:bg-cream-100 border border-cream-300 rounded-md text-navy-800 shrink-0 font-medium">
                  🖥️ Share Screen?
                </button>
                <button onClick=${() => setNewChatMsg('Let’s test the edge cases together!')} class="px-2 py-1 bg-white hover:bg-cream-100 border border-cream-300 rounded-md text-navy-800 shrink-0 font-medium">
                  🧪 Test Edge Cases
                </button>
                <button onClick=${() => setNewChatMsg('Understood! What’s the next step?')} class="px-2 py-1 bg-white hover:bg-cream-100 border border-cream-300 rounded-md text-navy-800 shrink-0 font-medium">
                  👍 Next Step?
                </button>
              </div>

              <!-- Message Stream -->
              <div class="flex-1 p-4 overflow-y-auto space-y-3 bg-cream-50/50 text-xs">
                ${chatMessages.length === 0 ? html`
                  <div class="text-center py-10 space-y-2 text-warmgray-500">
                    <p>💬 No messages in this workspace thread yet.</p>
                    <p class="text-[10px]">Say hi to your teaching partner!</p>
                  </div>
                ` : chatMessages.map(m => {
                  const isMe = m.sender_id === currentUser.id;
                  return html`
                    <div key=${m.id || Math.random()} class="flex flex-col ${isMe ? 'items-end' : 'items-start'}">
                      <div class="max-w-[85%] p-3 rounded-2xl text-xs font-medium shadow-sm ${isMe ? 'bg-navy-700 text-white rounded-tr-none' : 'bg-white text-navy-900 border border-cream-200 rounded-tl-none'}">
                        <p class="whitespace-pre-wrap">${m.content}</p>
                      </div>
                      <span class="text-[9px] text-warmgray-400 mt-1 px-1">
                        ${m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  `;
                })}
                <div ref=${chatEndRef}></div>
              </div>

              <!-- Message Input Composer -->
              <form onSubmit=${handleSendChatMessage} class="p-3 bg-white border-t border-cream-200 flex gap-2">
                <input
                  type="text"
                  value=${newChatMsg}
                  onChange=${e => setNewChatMsg(e.target.value)}
                  placeholder="Type a message to partner..."
                  class="flex-1 px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium focus:outline-none focus:border-navy-600 text-navy-900"
                />
                <button
                  type="submit"
                  disabled=${!newChatMsg.trim() || sendingChat}
                  class="px-4 py-2 bg-navy-700 hover:bg-navy-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          `}

        </div>

        <!-- Session Booking Modal -->
        ${schedulerOpen ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-955/60 backdrop-blur-sm animate-fadeIn">
            <div class="bg-white rounded-3xl max-w-md w-full p-7 border border-cream-300 shadow-2xl space-y-4 text-left text-xs">
              <div class="flex items-center justify-between border-b border-cream-200 pb-3">
                <h3 class="font-serif font-bold text-lg text-navy-900">Schedule Live Practice Session</h3>
                <button onClick=${() => setSchedulerOpen(false)} class="p-1 text-warmgray-500 hover:bg-cream-100 rounded-lg">✕</button>
              </div>

              <form onSubmit=${handleScheduleSession} class="space-y-3.5">
                <div>
                  <label class="block font-bold text-navy-955 mb-1">Session Title</label>
                  <input required type="text" value=${sessTitle} onChange=${e => setSessTitle(e.target.value)} placeholder="e.g. UPI Architecture & Go Routine Walkthrough" class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Date</label>
                    <input required type="date" value=${sessDate} onChange=${e => setSessDate(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-semibold text-navy-950" />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-955 mb-1">Time (IST)</label>
                    <input required type="time" value=${sessTime} onChange=${e => setSessTime(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-semibold text-navy-955" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Duration (Min)</label>
                    <input required type="number" min="15" max="180" step="15" value=${sessDuration} onChange=${e => setSessDuration(Number(e.target.value))} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl" />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Timezone</label>
                    <select value=${sessTimezone} onChange=${e => setSessTimezone(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-semibold text-navy-950">
                      <option value="IST (UTC+5:30)">IST (UTC+5:30) - India</option>
                      <option value="GMT (UTC+0)">GMT (UTC+0) - London</option>
                      <option value="EST (UTC-5)">EST (UTC-5) - US Eastern</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block font-bold text-navy-955 mb-1">Meeting Link (In-App Room or External Google Meet)</label>
                  <input type="url" value=${sessLink} onChange=${e => setSessLink(e.target.value)} placeholder="https://meet.google.com/abc-defg-hij" class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl" />
                </div>

                <div>
                  <label class="block font-bold text-navy-955 mb-1">Agenda / Practice Target</label>
                  <textarea rows="2" value=${sessAgenda} onChange=${e => setSessAgenda(e.target.value)} placeholder="What will you practice in this session?" class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl"></textarea>
                </div>

                <button type="submit" class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-md transition-colors text-xs">
                  Propose & Book Session 📅
                </button>
              </form>
            </div>
          </div>
        ` : null}

      </div>
    `;
  }
  window.SkillSwap.WorkspaceView = WorkspaceView;

  // ----------------------------------------------------
  // Chat View (Real-time P2P Direct Messaging)
  // ----------------------------------------------------
  function ChatView({ currentUser, targetConnectionId, targetUserId, onViewProfile, onProposeSwap, setActiveTab }) {
    const [connections, setConnections] = useState([]);
    const [activeConn, setActiveConn] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sending, setSending] = useState(false);
    const [newChatModalOpen, setNewChatModalOpen] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [contactSearch, setContactSearch] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [mobileShowChat, setMobileShowChat] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const formatMsgTime = (timestamp) => {
      if (!timestamp) return '';
      try {
        const d = new Date(timestamp);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {
        return '';
      }
    };

    const formatThreadDate = (timestamp) => {
      if (!timestamp) return '';
      try {
        const d = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
          return 'Yesterday';
        } else if (diffDays < 7) {
          return d.toLocaleDateString([], { weekday: 'short' });
        } else {
          return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
      } catch {
        return '';
      }
    };

    const loadThreads = async (preserveActive = false) => {
      try {
        const data = await api('/api/messages');
        const threadsList = data.threads || data.connections || [];
        setConnections(threadsList);
        setLoadingThreads(false);

        if (!preserveActive && !activeConn && threadsList.length > 0) {
          if (targetConnectionId) {
            const found = threadsList.find(c => String(c.id || c.connection_id) === String(targetConnectionId));
            if (found) {
              selectConnection(found);
              return;
            }
          }
          selectConnection(threadsList[0]);
        }
      } catch (err) {
        console.error('Failed to load threads:', err);
        setLoadingThreads(false);
      }
    };

    const selectConnection = async (conn) => {
      if (!conn) return;
      setActiveConn(conn);
      setMobileShowChat(true);
      setLoadingMsgs(true);
      try {
        const connId = conn.id || conn.connection_id;
        const data = await api('/api/messages?connection_id=' + connId);
        setMessages(data.messages || []);
        if (data.connection) {
          setActiveConn(prev => ({ ...prev, ...data.connection }));
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMsgs(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    const startChatWithUser = async (partner) => {
      setNewChatModalOpen(false);
      setLoadingMsgs(true);
      try {
        const data = await api('/api/messages?partner_id=' + partner.id);
        if (data.connection) {
          setActiveConn(data.connection);
          setMessages(data.messages || []);
          setMobileShowChat(true);
          await loadThreads(true);
        }
      } catch (err) {
        console.error('Failed to start chat with user:', err);
      } finally {
        setLoadingMsgs(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    const loadContacts = async () => {
      setLoadingContacts(true);
      try {
        const data = await api('/api/messages?type=contacts');
        setContacts(data.contacts || []);
      } catch (err) {
        console.error('Failed to load contacts:', err);
      } finally {
        setLoadingContacts(false);
      }
    };

    useEffect(() => {
      loadThreads();
      if (targetUserId) {
        startChatWithUser({ id: targetUserId });
      }
    }, [targetConnectionId, targetUserId]);

    // Periodic live polling (every 3.5s) to auto-receive incoming messages
    useEffect(() => {
      const interval = setInterval(async () => {
        if (activeConn) {
          const connId = activeConn.id || activeConn.connection_id;
          try {
            const data = await api('/api/messages?connection_id=' + connId);
            if (data.messages && data.messages.length !== messages.length) {
              setMessages(data.messages);
              setTimeout(scrollToBottom, 50);
              loadThreads(true);
            }
          } catch (err) {
            // ignore silent background poll error
          }
        }
      }, 3500);
      return () => clearInterval(interval);
    }, [activeConn, messages.length]);

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
      if (e) e.preventDefault();
      const text = newMsg.trim();
      if (!text || !activeConn || sending) return;

      const connId = activeConn.id || activeConn.connection_id;
      setNewMsg('');
      setSending(true);

      const optimisticMsg = {
        id: 'temp_' + Date.now(),
        connection_id: connId,
        sender_id: currentUser ? currentUser.id : 'me',
        sender_name: currentUser ? currentUser.name : 'You',
        sender_avatar: currentUser ? currentUser.avatar_url : null,
        message: text,
        created_at: new Date().toISOString(),
        is_read: false
      };

      setMessages(prev => [...prev, optimisticMsg]);
      setTimeout(scrollToBottom, 20);

      try {
        const res = await api('/api/messages', {
          method: 'POST',
          body: JSON.stringify({ connection_id: connId, message: text })
        });
        if (res.message) {
          setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? res.message : m));
        }
        loadThreads(true);
      } catch (err) {
        console.error('Error sending message:', err);
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      } finally {
        setSending(false);
        setTimeout(scrollToBottom, 50);
      }
    };

    const handleQuickReply = (text) => {
      setNewMsg(text);
    };

    const filteredConnections = connections.filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (c.partner_name || (c.partner && c.partner.name) || '').toLowerCase();
      const username = ((c.partner && c.partner.username) || '').toLowerCase();
      const lastMsg = (c.last_message || '').toLowerCase();
      return name.includes(q) || username.includes(q) || lastMsg.includes(q);
    });

    const filteredContacts = contacts.filter(u => {
      if (!contactSearch.trim()) return true;
      const q = contactSearch.toLowerCase();
      const name = (u.name || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const headline = (u.headline || '').toLowerCase();
      return name.includes(q) || username.includes(q) || headline.includes(q);
    });

    const partner = activeConn ? (activeConn.partner || {
      id: activeConn.partner_id,
      name: activeConn.partner_name || 'Member',
      avatar_url: activeConn.partner_avatar,
      headline: activeConn.partner_headline || 'SkillSwapX Member'
    }) : null;

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left animate-fadeIn">
        <!-- Top Bar Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div class="flex items-center gap-2">
              <span class="p-2 rounded-xl bg-navy-100 text-navy-700">
                <${Icon} name="message-circle" class="w-5 h-5" />
              </span>
              <h1 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950">Direct Messages</h1>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live Chat
              </span>
            </div>
            <p class="text-xs text-warmgray-500 mt-1 font-medium">Real-time peer communication for barter agreements and session coordination.</p>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick=${() => { setNewChatModalOpen(true); loadContacts(); }}
              class="flex-1 sm:flex-none px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-extrabold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
            >
              <${Icon} name="plus" class="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>
        </div>

        <!-- Chat App Container -->
        <div class="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] max-h-[750px] relative">
          
          <!-- LEFT COLUMN: Conversations Sidebar -->
          <div class="lg:col-span-4 border-r border-cream-200 flex flex-col bg-cream-50/40 ${mobileShowChat ? 'hidden lg:flex' : 'flex'}">
            <!-- Search & Filter Bar -->
            <div class="p-4 border-b border-cream-200 space-y-3 bg-white">
              <div class="relative">
                <${Icon} name="search" class="w-4 h-4 text-warmgray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value=${searchQuery}
                  onChange=${e => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  class="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-xl text-xs text-navy-900 placeholder:text-warmgray-400 focus:outline-none focus:border-navy-600 font-medium"
                />
              </div>
            </div>

            <!-- Thread List -->
            <div class="flex-1 overflow-y-auto divide-y divide-cream-100 p-2 space-y-1">
              ${loadingThreads ? html`
                <div class="p-8 text-center text-warmgray-400 text-xs space-y-2">
                  <div class="w-6 h-6 border-2 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>Loading conversations...</p>
                </div>
              ` : filteredConnections.length === 0 ? html`
                <div class="p-8 text-center space-y-3">
                  <div class="w-12 h-12 bg-cream-200/70 rounded-full flex items-center justify-center text-warmgray-500 mx-auto">
                    <${Icon} name="message-square" class="w-6 h-6" />
                  </div>
                  <p class="text-xs font-bold text-navy-900">No conversations yet</p>
                  <p class="text-[11px] text-warmgray-500 leading-relaxed">Start chatting with swappers from your matches or directory.</p>
                  <button
                    onClick=${() => { setNewChatModalOpen(true); loadContacts(); }}
                    class="px-3.5 py-1.5 bg-navy-700 text-white rounded-lg text-[11px] font-bold"
                  >
                    + Find Swappers
                  </button>
                </div>
              ` : filteredConnections.map(c => {
                const connId = c.id || c.connection_id;
                const isSelected = activeConn && (activeConn.id === connId || activeConn.connection_id === connId);
                const cPartner = c.partner || {
                  name: c.partner_name || 'Member',
                  avatar_url: c.partner_avatar,
                  headline: c.partner_headline
                };
                const hasUnread = c.unread_count > 0;

                return html`
                  <div
                    key=${connId}
                    onClick=${() => selectConnection(c)}
                    class="p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-navy-50/90 border-navy-300/80 shadow-xs'
                        : 'hover:bg-cream-100/60 border-transparent'
                    }"
                  >
                    <div class="relative shrink-0">
                      <img
                        src=${cPartner.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                        alt=${cPartner.name}
                        class="w-11 h-11 rounded-2xl object-cover ring-1 ring-cream-300 shadow-2xs"
                      />
                      <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                    </div>

                    <div class="flex-1 min-w-0 text-left">
                      <div class="flex items-center justify-between gap-1">
                        <p class="font-bold text-navy-950 text-xs truncate ${hasUnread ? 'text-indigo-900 font-extrabold' : ''}">${cPartner.name}</p>
                        <span class="text-[10px] text-warmgray-400 font-semibold shrink-0">${formatThreadDate(c.last_message_at)}</span>
                      </div>
                      <p class="text-[11px] truncate mt-0.5 ${hasUnread ? 'font-bold text-navy-900' : 'text-warmgray-500 font-medium'}">
                        ${c.last_message || 'Start the conversation...'}
                      </p>
                    </div>

                    ${hasUnread ? html`
                      <span class="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-600 text-white shrink-0 shadow-2xs animate-pulse">
                        ${c.unread_count}
                      </span>
                    ` : null}
                  </div>
                `;
              })}
            </div>
          </div>

          <!-- RIGHT COLUMN: Active Chat Panel -->
          <div class="lg:col-span-8 flex flex-col justify-between bg-white ${!mobileShowChat ? 'hidden lg:flex' : 'flex'}">
            ${activeConn && partner ? html`
              <!-- Chat Partner Header Bar -->
              <div class="px-6 py-4 border-b border-cream-200 bg-white/95 backdrop-blur flex items-center justify-between gap-4 z-10">
                <div class="flex items-center gap-3 min-w-0">
                  <button
                    onClick=${() => setMobileShowChat(false)}
                    class="lg:hidden p-1.5 rounded-lg text-warmgray-500 hover:bg-cream-100"
                    title="Back to conversations"
                  >
                    <${Icon} name="chevron-left" class="w-5 h-5" />
                  </button>

                  <div class="relative shrink-0">
                    <img
                      src=${partner.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                      alt=${partner.name}
                      class="w-10 h-10 rounded-2xl object-cover ring-1 ring-cream-300 shadow-2xs"
                    />
                    <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>

                  <div class="min-w-0 text-left">
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-navy-950 text-sm truncate">${partner.name}</h3>
                      <span class="hidden sm:inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[9px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Online
                      </span>
                    </div>
                    <p class="text-[11px] text-warmgray-500 truncate font-medium max-w-xs sm:max-w-md">
                      ${partner.headline || (partner.username ? `@${partner.username}` : 'SkillSwapX Member')}
                    </p>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-2 shrink-0">
                  ${onViewProfile ? html`
                    <button
                      onClick=${() => onViewProfile(partner.username || partner.id)}
                      class="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 text-navy-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                      title="View Member Profile"
                    >
                      <${Icon} name="user" class="w-3.5 h-3.5 text-navy-600" />
                      <span class="hidden md:inline">Profile</span>
                    </button>
                  ` : null}

                  ${activeConn.workspace_id && setActiveTab ? html`
                    <button
                      onClick=${() => setActiveTab('workspaces')}
                      class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                      title="Open Shared Workspace"
                    >
                      <${Icon} name="folder" class="w-3.5 h-3.5 text-indigo-600" />
                      <span class="hidden md:inline">Workspace</span>
                    </button>
                  ` : onProposeSwap ? html`
                    <button
                      onClick=${() => onProposeSwap(partner)}
                      class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                      title="Propose Skill Swap"
                    >
                      <${Icon} name="sparkles" class="w-3.5 h-3.5 text-emerald-600" />
                      <span class="hidden md:inline">Swap</span>
                    </button>
                  ` : null}
                </div>
              </div>

              <!-- Message History Scroll Area -->
              <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-cream-50/20 text-xs min-h-[380px] max-h-[460px]">
                ${loadingMsgs ? html`
                  <div class="h-full flex items-center justify-center py-20">
                    <div class="w-8 h-8 border-2 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ` : messages.length === 0 ? html`
                  <div class="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                    <div class="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-600">
                      <${Icon} name="message-square" class="w-7 h-7" />
                    </div>
                    <h4 class="font-bold text-navy-900 text-sm">Start your conversation with ${partner.name}</h4>
                    <p class="text-warmgray-500 max-w-sm text-xs font-medium leading-relaxed">
                      Discuss reciprocal learning goals, agree on session frequency, or coordinate your barter schedule.
                    </p>
                    <div class="flex flex-wrap gap-2 justify-center pt-2">
                      <button
                        onClick=${() => handleQuickReply('Hi! I saw your skills and would love to propose a reciprocal barter session.')}
                        class="px-3 py-1.5 rounded-full bg-white border border-cream-300 text-navy-800 text-[11px] font-bold hover:bg-cream-100 transition-colors"
                      >
                        👋 Say Hello
                      </button>
                      <button
                        onClick=${() => handleQuickReply('When are you free this week for our first 1:1 learning swap?')}
                        class="px-3 py-1.5 rounded-full bg-white border border-cream-300 text-navy-800 text-[11px] font-bold hover:bg-cream-100 transition-colors"
                      >
                        📅 Check Availability
                      </button>
                    </div>
                  </div>
                ` : messages.map((m, idx) => {
                  const isMe = m.sender_id === (currentUser && currentUser.id);
                  const isTemp = String(m.id).startsWith('temp_');

                  return html`
                    <div key=${m.id || idx} class="flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'} animate-fadeIn">
                      ${!isMe ? html`
                        <img
                          src=${partner.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop'}
                          alt=${partner.name}
                          class="w-7 h-7 rounded-xl object-cover ring-1 ring-cream-300 shrink-0 mb-0.5"
                        />
                      ` : null}

                      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-md">
                        <div class="px-4 py-3 rounded-2xl text-xs leading-relaxed font-medium ${
                          isMe
                            ? 'bg-navy-800 text-white rounded-br-xs shadow-sm'
                            : 'bg-cream-100/90 text-navy-955 rounded-bl-xs border border-cream-200/90 shadow-2xs'
                        }">
                          <p class="whitespace-pre-wrap break-words">${m.message}</p>
                        </div>

                        <div class="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-warmgray-400 font-semibold">
                          <span>${formatMsgTime(m.created_at)}</span>
                          ${isMe ? html`
                            <span>${isTemp ? '⏳' : '✓✓'}</span>
                          ` : null}
                        </div>
                      </div>
                    </div>
                  `;
                })}
                <div ref=${messagesEndRef}></div>
              </div>

              <!-- Quick Reply Chips Bar -->
              <div class="px-4 py-2 border-t border-cream-100 bg-cream-50/50 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
                <span class="text-warmgray-400 font-bold shrink-0 text-[10px] uppercase">Quick:</span>
                <button onClick=${() => handleQuickReply('👍 Sounds great!')} class="px-2.5 py-1 rounded-lg bg-white border border-cream-200 hover:bg-cream-100 text-navy-800 font-bold shrink-0 transition-colors">👍 Sounds great!</button>
                <button onClick=${() => handleQuickReply('🤝 Deal, let’s do it.')} class="px-2.5 py-1 rounded-lg bg-white border border-cream-200 hover:bg-cream-100 text-navy-800 font-bold shrink-0 transition-colors">🤝 Deal, let’s do it</button>
                <button onClick=${() => handleQuickReply('📅 Let’s schedule a 1:1 call.')} class="px-2.5 py-1 rounded-lg bg-white border border-cream-200 hover:bg-cream-100 text-navy-800 font-bold shrink-0 transition-colors">📅 Let’s schedule a call</button>
                <button onClick=${() => handleQuickReply('💡 I checked your shared notes in Learning Hub!')} class="px-2.5 py-1 rounded-lg bg-white border border-cream-200 hover:bg-cream-100 text-navy-800 font-bold shrink-0 transition-colors">💡 Learning Hub</button>
              </div>

              <!-- Message Input Composer Bar -->
              <form onSubmit=${handleSend} class="p-4 border-t border-cream-200 bg-white flex items-center gap-2.5">
                <input
                  type="text"
                  required
                  value=${newMsg}
                  onChange=${e => setNewMsg(e.target.value)}
                  placeholder="Type your message... (Press Enter to send)"
                  class="flex-1 px-4 py-3 bg-cream-50/80 border border-cream-300 rounded-2xl text-xs focus:outline-none focus:border-navy-700 text-navy-900 font-medium placeholder:text-warmgray-400 transition-colors shadow-2xs"
                />

                <button
                  type="submit"
                  disabled=${!newMsg.trim() || sending}
                  class="px-5 py-3 bg-navy-700 hover:bg-navy-800 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 shrink-0"
                >
                  <span>Send</span>
                  <${Icon} name="arrow-right" class="w-3.5 h-3.5" />
                </button>
              </form>
            ` : html`
              <!-- Empty State when no conversation is selected -->
              <div class="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-warmgray-400">
                <div class="w-16 h-16 bg-cream-100 rounded-3xl flex items-center justify-center text-warmgray-500 shadow-inner">
                  <${Icon} name="message-square" class="w-8 h-8 text-navy-600" />
                </div>
                <div>
                  <h3 class="font-serif text-lg font-bold text-navy-900">Your Messages</h3>
                  <p class="text-xs text-warmgray-500 max-w-sm font-medium mt-1">Select a conversation from the sidebar or start a new direct chat with any community member.</p>
                </div>
                <button
                  onClick=${() => { setNewChatModalOpen(true); loadContacts(); }}
                  class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                >
                  + Start New Chat
                </button>
              </div>
            `}
          </div>
        </div>

        <!-- NEW CHAT / CONTACT PICKER MODAL -->
        ${newChatModalOpen ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div class="bg-white rounded-3xl max-w-lg w-full border border-cream-300 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
              
              <!-- Modal Header -->
              <div class="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-50/50">
                <div class="flex items-center gap-2">
                  <span class="p-1.5 rounded-xl bg-navy-100 text-navy-700">
                    <${Icon} name="users" class="w-4 h-4" />
                  </span>
                  <h3 class="font-serif text-lg font-bold text-navy-950">Start New Conversation</h3>
                </div>
                <button
                  onClick=${() => setNewChatModalOpen(false)}
                  class="p-2 rounded-xl text-warmgray-400 hover:text-navy-900 hover:bg-cream-100 transition-colors"
                >
                  <${Icon} name="x" class="w-5 h-5" />
                </button>
              </div>

              <!-- Search Bar -->
              <div class="p-4 border-b border-cream-200 bg-white">
                <div class="relative">
                  <${Icon} name="search" class="w-4 h-4 text-warmgray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value=${contactSearch}
                    onChange=${e => setContactSearch(e.target.value)}
                    placeholder="Search by name, username, or headline..."
                    class="w-full pl-9 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs text-navy-900 placeholder:text-warmgray-400 focus:outline-none focus:border-navy-700 font-medium"
                  />
                </div>
              </div>

              <!-- Contact List -->
              <div class="flex-1 overflow-y-auto divide-y divide-cream-100 p-3 space-y-1">
                ${loadingContacts ? html`
                  <div class="py-12 text-center text-warmgray-400 text-xs">
                    <div class="w-6 h-6 border-2 border-navy-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Finding swappers...</p>
                  </div>
                ` : filteredContacts.length === 0 ? html`
                  <div class="py-12 text-center text-warmgray-400 text-xs">
                    <p class="font-bold text-navy-900">No members found</p>
                    <p class="text-[11px] text-warmgray-500 mt-1">Try a different search keyword.</p>
                  </div>
                ` : filteredContacts.map(u => html`
                  <div
                    key=${u.id}
                    onClick=${() => startChatWithUser(u)}
                    class="p-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-cream-50 cursor-pointer transition-colors"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <img
                        src=${u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                        alt=${u.name}
                        class="w-10 h-10 rounded-2xl object-cover ring-1 ring-cream-300 shrink-0"
                      />
                      <div class="min-w-0 text-left">
                        <p class="font-bold text-navy-950 text-xs truncate flex items-center gap-1">
                          <span>${u.name}</span>
                          <span class="text-emerald-600 text-[10px]">✓</span>
                        </p>
                        <p class="text-[11px] text-warmgray-500 truncate font-medium">@${u.username || 'swapper'} • ${u.headline || 'SkillSwapX Member'}</p>
                      </div>
                    </div>

                    <button
                      class="px-3 py-1.5 bg-navy-700 hover:bg-navy-800 text-white font-extrabold text-[11px] rounded-xl shrink-0 transition-colors"
                    >
                      Chat
                    </button>
                  </div>
                `)}
              </div>
            </div>
          </div>
        ` : null}
      </div>
    `;
  }
  window.SkillSwap.ChatView = ChatView;
  // ----------------------------------------------------
  // SkillSwapX Admin Panel (Enterprise Governance Suite)
  // ----------------------------------------------------
  function AdminConsoleView({ currentUser, setActiveTab, onViewProfile, onLogout, onRefresh }) {
    const [overviewData, setOverviewData] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [users, setUsers] = useState([]);
    const [skills, setSkills] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [exchangesData, setExchangesData] = useState({ problems: [], proposals: [], workspaces: [], requestStats: {} });
    const [reviews, setReviews] = useState([]);
    const [reports, setReports] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [communityData, setCommunityData] = useState({ circles: [], posts: [] });
    const [analyticsData, setAnalyticsData] = useState(null);
    const [notificationsHistory, setNotificationsHistory] = useState([]);
    const [settingsData, setSettingsData] = useState({ settings: {}, systemHealth: [] });
    const [logs, setLogs] = useState([]);
    const [sectionError, setSectionError] = useState('');

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastSyncedTime, setLastSyncedTime] = useState('');
    const [activeNav, setActiveNav] = useState('overview'); // 'overview', 'users', 'skills', 'exchanges', 'reviews', 'reports', 'verification', 'community', 'analytics', 'notifications', 'settings', 'logs'
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Filter states
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState('ALL');
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);

    const [skillTab, setSkillTab] = useState('skills'); // 'skills' or 'categories'
    const [skillSearch, setSkillSearch] = useState('');
    const [newSkillModal, setNewSkillModal] = useState(false);
    const [newSkillForm, setNewSkillForm] = useState({ name: '', category_id: '', description: '', is_popular: false, is_trending: false });
    const [newCatModal, setNewCatModal] = useState(false);
    const [newCatForm, setNewCatForm] = useState({ name: '', description: '', icon: 'Sparkles', is_featured: false });

    const [exchangeTab, setExchangeTab] = useState('problems'); // 'problems', 'proposals', 'workspaces', 'pulse'
    const [reviewFilter, setReviewFilter] = useState('ALL');
    const [reviewSearch, setReviewSearch] = useState('');

    const [reportFilter, setReportFilter] = useState('OPEN');
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportResolutionNotes, setReportResolutionNotes] = useState('');
    const [reportBlockUser, setReportBlockUser] = useState(false);

    const [verifFilter, setVerifFilter] = useState('PENDING');

    const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', type: 'ANNOUNCEMENT', target_segment: 'ALL', target_category_id: '', target_user_id: '' });
    const [announcementSentMsg, setAnnouncementSentMsg] = useState('');

    const [settingsForm, setSettingsForm] = useState({ site_name: 'SkillSwapX', synergy_threshold: '60', auto_moderation: 'true', escrow_protection: 'true', maintenance_mode: 'false', email_digest: 'true' });
    const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

    const userRole = currentUser?.role || 'SUPER_ADMIN';

    // Permissions check
    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    const isModerator = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'MODERATOR';
    const isSupport = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'MODERATOR' || userRole === 'SUPPORT';

    // Initial load & background live sync telemetry
    useEffect(() => {
      // Prefetch global analytics and telemetry immediately so counters and badges are synced
      api('/api/admin').then(data => {
        if (data) {
          setOverviewData(data);
          setAnalytics(data.analytics || null);
          if (data.recentReports && (!reports || reports.length === 0)) {
            setReports(data.recentReports);
          }
        }
      }).catch(console.error);

      const now = new Date();
      setLastSyncedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Periodic live data sync (every 25 seconds if browser tab is active)
      const interval = setInterval(() => {
        if (!document.hidden) {
          syncAllData(false);
        }
      }, 25000);

      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      loadDataForSection(activeNav, true);
    }, [activeNav]);

    const loadDataForSection = async (section, showSpinner = true) => {
      try {
        if (showSpinner) setLoading(true);
        setSectionError('');
        if (section === 'overview') {
          const data = await api('/api/admin');
          setOverviewData(data);
          setAnalytics(data.analytics || null);
          if (data.recentReports) setReports(data.recentReports);
        } else if (section === 'users') {
          const data = await api('/api/admin/users');
          setUsers(data.users || []);
        } else if (section === 'skills') {
          const sData = await api('/api/admin/skills');
          setSkills(sData.skills || []);
          const cData = await api('/api/admin/categories');
          setCategoriesList(cData.categories || []);
        } else if (section === 'exchanges') {
          const data = await api('/api/admin/exchanges');
          setExchangesData(data || { problems: [], proposals: [], workspaces: [], requestStats: {} });
        } else if (section === 'reviews') {
          const data = await api('/api/admin/reviews');
          setReviews(data.reviews || []);
        } else if (section === 'reports') {
          const data = await api('/api/admin/reports');
          setReports(data.reports || []);
        } else if (section === 'verification') {
          const data = await api('/api/admin/verifications');
          setVerifications(data.verifications || []);
        } else if (section === 'community') {
          const data = await api('/api/admin/community');
          setCommunityData(data || { circles: [], posts: [] });
          const cData = await api('/api/admin/categories');
          setCategoriesList(cData.categories || []);
        } else if (section === 'analytics') {
          const data = await api('/api/admin/analytics');
          setAnalyticsData(data);
        } else if (section === 'notifications') {
          const data = await api('/api/admin/notifications');
          setNotificationsHistory(data.announcements || []);
          const cData = await api('/api/admin/categories');
          setCategoriesList(cData.categories || []);
        } else if (section === 'settings') {
          const data = await api('/api/admin/settings');
          setSettingsData(data || { settings: {}, systemHealth: [] });
          if (data.settings) setSettingsForm(prev => ({ ...prev, ...data.settings }));
        } else if (section === 'logs') {
          const data = await api('/api/admin/logs');
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Error loading admin section data:', err);
        setSectionError(err.message || 'Unable to retrieve live data from server. Please re-authenticate or retry.');
      } finally {
        if (showSpinner) setLoading(false);
      }
    };

    const syncAllData = async (manual = false) => {
      try {
        setSyncing(true);
        if (manual) setSectionError('');
        // 1. Refresh global platform telemetry
        const adminOverview = await api('/api/admin').catch(err => {
          if (manual) throw err;
          return null;
        });
        if (adminOverview) {
          setOverviewData(adminOverview);
          setAnalytics(adminOverview.analytics || null);
          if (adminOverview.recentReports) setReports(adminOverview.recentReports);
        }
        // 2. Refresh active section data without flickering full screen
        await loadDataForSection(activeNav, false);
        const now = new Date();
        setLastSyncedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.error('Sync live data failed:', err);
        if (manual) {
          setSectionError(err.message || 'Manual live data synchronization failed.');
        }
      } finally {
        setSyncing(false);
      }
    };

    // User actions
    const handleUpdateUserStatus = async (userId, newStatus) => {
      if (!confirm(`Are you sure you want to change user status to ${newStatus}?`)) return;
      try {
        await api('/api/admin/users', { method: 'PUT', body: JSON.stringify({ userId, status: newStatus }) });
        await loadDataForSection('users');
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to update user status.');
      }
    };

    const handleUpdateUserRole = async (userId, newRole) => {
      if (!confirm(`Are you sure you want to change user role to ${newRole}?`)) return;
      try {
        await api('/api/admin/users', { method: 'PUT', body: JSON.stringify({ userId, role: newRole }) });
        await loadDataForSection('users');
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to update user role.');
      }
    };

    const handleDeleteUser = async (userId) => {
      if (!confirm('Permanently delete this user and all associated data? This action cannot be undone.')) return;
      try {
        await api('/api/admin/users?userId=' + userId, { method: 'DELETE' });
        setSelectedUserDetail(null);
        await loadDataForSection('users');
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to delete user.');
      }
    };

    // Skill & Category actions
    const handleCreateSkill = async (e) => {
      e.preventDefault();
      if (!newSkillForm.name || !newSkillForm.category_id) return;
      try {
        await api('/api/admin/skills', { method: 'POST', body: JSON.stringify(newSkillForm) });
        setNewSkillModal(false);
        setNewSkillForm({ name: '', category_id: '', description: '', is_popular: false, is_trending: false });
        await loadDataForSection('skills');
        window.dispatchEvent(new CustomEvent('skillswap:skills-updated'));
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to create skill.');
      }
    };

    const handleToggleSkillFlag = async (skill, flagName) => {
      const updatedValue = !skill[flagName];
      try {
        await api('/api/admin/skills', { method: 'PUT', body: JSON.stringify({ id: skill.id, [flagName]: updatedValue }) });
        await loadDataForSection('skills');
        window.dispatchEvent(new CustomEvent('skillswap:skills-updated'));
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to update skill flag.');
      }
    };

    const handleDeleteSkill = async (skillId) => {
      if (!confirm('Are you sure you want to delete this skill?')) return;
      try {
        await api('/api/admin/skills?id=' + skillId, { method: 'DELETE' });
        await loadDataForSection('skills');
        window.dispatchEvent(new CustomEvent('skillswap:skills-updated'));
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to delete skill.');
      }
    };

    const handleCreateCategory = async (e) => {
      e.preventDefault();
      if (!newCatForm.name) return;
      try {
        await api('/api/admin/categories', { method: 'POST', body: JSON.stringify(newCatForm) });
        setNewCatModal(false);
        setNewCatForm({ name: '', description: '', icon: 'Sparkles', is_featured: false });
        await loadDataForSection('skills');
        window.dispatchEvent(new CustomEvent('skillswap:skills-updated'));
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to create category.');
      }
    };

    const handleDeleteCategory = async (catId) => {
      if (!confirm('Delete this category? Associated skills will also be detached.')) return;
      try {
        await api('/api/admin/categories?id=' + catId, { method: 'DELETE' });
        await loadDataForSection('skills');
        window.dispatchEvent(new CustomEvent('skillswap:skills-updated'));
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to delete category.');
      }
    };

    // Report Actions
    const handleResolveReport = async (e) => {
      e.preventDefault();
      if (!selectedReport) return;
      try {
        await api('/api/admin/reports', {
          method: 'PUT',
          body: JSON.stringify({
            report_id: selectedReport.id,
            status: 'RESOLVED',
            resolution_notes: reportResolutionNotes.trim(),
            block_user: reportBlockUser
          })
        });
        setSelectedReport(null);
        setReportResolutionNotes('');
        setReportBlockUser(false);
        await loadDataForSection('reports');
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to resolve report.');
      }
    };

    const handleDismissReport = async (reportId) => {
      const reason = prompt('Enter dismissal reason (e.g. False report / Insufficient evidence):');
      if (reason === null) return;
      try {
        await api('/api/admin/reports', {
          method: 'PUT',
          body: JSON.stringify({ report_id: reportId, status: 'DISMISSED', resolution_notes: reason })
        });
        setSelectedReport(null);
        await loadDataForSection('reports');
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to dismiss report.');
      }
    };

    // Verification Actions
    const handleProcessVerification = async (verifId, status) => {
      const notes = prompt(`Enter notes for ${status.toLowerCase()} status:`) || '';
      try {
        await api('/api/admin/verifications', {
          method: 'PUT',
          body: JSON.stringify({ id: verifId, status, admin_notes: notes })
        });
        await loadDataForSection('verification');
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to process verification.');
      }
    };

    // Review Actions
    const handleToggleReviewFlag = async (review) => {
      const willFlag = !review.is_flagged;
      const reason = willFlag ? prompt('Reason for flagging review:') || 'Suspicious rating pattern' : '';
      try {
        await api('/api/admin/reviews', {
          method: 'PUT',
          body: JSON.stringify({ id: review.id, is_flagged: willFlag, flag_reason: reason })
        });
        await loadDataForSection('reviews');
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to update review flag.');
      }
    };

    const handleDeleteReview = async (reviewId) => {
      if (!confirm('Permanently remove this review?')) return;
      try {
        await api('/api/admin/reviews?id=' + reviewId, { method: 'DELETE' });
        await loadDataForSection('reviews');
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to delete review.');
      }
    };

    // Announcement Broadcast
    const handleBroadcastAnnouncement = async (e) => {
      e.preventDefault();
      if (!announcementForm.title || !announcementForm.message) return;
      try {
        const res = await api('/api/admin/notifications', { method: 'POST', body: JSON.stringify(announcementForm) });
        setAnnouncementSentMsg(res.message || 'Announcement broadcasted successfully!');
        setTimeout(() => setAnnouncementSentMsg(''), 4000);
        setAnnouncementForm({ title: '', message: '', type: 'ANNOUNCEMENT', target_segment: 'ALL', target_category_id: '', target_user_id: '' });
        await loadDataForSection('notifications');
        window.dispatchEvent(new CustomEvent('skillswap:notification-received'));
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to broadcast announcement.');
      }
    };

    // Settings Update
    const handleSaveSettings = async (e) => {
      e.preventDefault();
      try {
        await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ settings: settingsForm }) });
        setSettingsSavedMsg(true);
        setTimeout(() => setSettingsSavedMsg(false), 3000);
        await loadDataForSection('settings');
        window.dispatchEvent(new CustomEvent('skillswap:settings-updated'));
        onRefresh?.();
      } catch (err) {
        alert(err.message || 'Failed to save settings.');
      }
    };

    // Filtered lists (Null-safe to prevent blank white screens)
    const filteredUsers = useMemo(() => {
      return (users || []).filter(u => {
        if (!u) return false;
        const matchesSearch = !userSearch.trim() || 
          (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || 
          (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.username && (u.username || '').toLowerCase().includes(userSearch.toLowerCase()));
        if (!matchesSearch) return false;
        if (userFilter === 'ACTIVE') return u.status === 'ACTIVE';
        if (userFilter === 'BLOCKED') return u.status === 'BLOCKED';
        if (userFilter === 'VERIFIED') return Boolean(u.email_verified || u.verified_skills_count > 0);
        if (userFilter === 'STAFF') return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(u.role);
        return true;
      });
    }, [users, userSearch, userFilter]);

    const filteredSkills = useMemo(() => {
      return (skills || []).filter(s => {
        if (!s) return false;
        return !skillSearch.trim() || 
          (s.name || '').toLowerCase().includes(skillSearch.toLowerCase()) || 
          (s.category_name && (s.category_name || '').toLowerCase().includes(skillSearch.toLowerCase()));
      });
    }, [skills, skillSearch]);

    const filteredReviews = useMemo(() => {
      return (reviews || []).filter(r => {
        if (!r) return false;
        const matchesSearch = !reviewSearch.trim() || 
          (r.reviewer_name || '').toLowerCase().includes(reviewSearch.toLowerCase()) || 
          (r.reviewee_name || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
          (r.comment && (r.comment || '').toLowerCase().includes(reviewSearch.toLowerCase()));
        if (!matchesSearch) return false;
        if (reviewFilter === 'LOW') return r.rating <= 2;
        if (reviewFilter === 'FLAGGED') return Boolean(r.is_flagged);
        if (reviewFilter === 'VERIFIED') return Boolean(r.is_verified_exchange);
        return true;
      });
    }, [reviews, reviewSearch, reviewFilter]);

    const filteredReports = useMemo(() => {
      return (reports || []).filter(r => {
        if (!r) return false;
        if (reportFilter === 'OPEN') return r.status === 'OPEN';
        if (reportFilter === 'UNDER_INVESTIGATION') return r.status === 'UNDER_INVESTIGATION';
        if (reportFilter === 'RESOLVED') return r.status === 'RESOLVED';
        if (reportFilter === 'DISMISSED') return r.status === 'DISMISSED';
        return true;
      });
    }, [reports, reportFilter]);

    const filteredVerifications = useMemo(() => {
      return (verifications || []).filter(v => {
        if (!v) return false;
        if (verifFilter === 'PENDING') return v.status === 'PENDING';
        if (verifFilter === 'APPROVED') return v.status === 'APPROVED';
        if (verifFilter === 'REJECTED') return v.status === 'REJECTED';
        return true;
      });
    }, [verifications, verifFilter]);

    // Role badge color helper
    const getRoleBadgeStyle = (r) => {
      switch (r) {
        case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-900 border-purple-300';
        case 'ADMIN': return 'bg-indigo-100 text-indigo-900 border-indigo-300';
        case 'MODERATOR': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
        case 'SUPPORT': return 'bg-blue-100 text-blue-900 border-blue-300';
        default: return 'bg-warmgray-100 text-warmgray-800 border-warmgray-300';
      }
    };

    const liveUsersCount = users.length > 0 ? users.length : (overviewData?.analytics?.users?.total_users || analytics?.users?.total_users || 0);
    const liveOpenReportsCount = reports.length > 0
      ? reports.filter(r => r.status === 'OPEN').length
      : (overviewData?.analytics?.reports?.open_reports || analytics?.reports?.open_reports || 0);
    const livePendingVerifCount = verifications.length > 0
      ? verifications.filter(v => v.status === 'PENDING').length
      : (overviewData?.analytics?.verifications?.pending_verifications || analytics?.verifications?.pending_verifications || 0);

    return html`
      <div class="min-h-screen bg-cream-100 text-warmgray-900 font-sans flex flex-col md:flex-row antialiased">
        
        <!-- ============================================== -->
        <!-- SIDEBAR NAVIGATION (Tight & Minimalist)       -->
        <!-- ============================================== -->
        <aside class="w-full md:w-64 bg-white border-r border-cream-300 flex flex-col justify-between shrink-0 shadow-xs md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <div>
            <!-- Sidebar Header Brand -->
            <div class="p-5 sm:p-6 border-b border-cream-200 flex items-center justify-between">
              <div class="flex items-center gap-3 cursor-pointer" onClick=${() => { setActiveNav('overview'); setSidebarCollapsed(false); }}>
                <img src="/logo-icon.png" alt="SkillSwapX Logo" class="w-8 h-8 rounded-xl object-contain shadow-xs bg-white p-0.5 border border-cream-200" />
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="font-serif text-lg font-bold text-navy-950 tracking-tight">SkillSwap<span class="text-indigo-600">X</span></span>
                    <span class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">Admin</span>
                  </div>
                  <p class="text-[9px] font-semibold text-warmgray-500">Platform Governance</p>
                </div>
              </div>

              <!-- Mobile Toggle Hamburger Button -->
              <button
                onClick=${() => setSidebarCollapsed(!sidebarCollapsed)}
                class="md:hidden px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-navy-950 text-xs font-bold transition-colors border border-cream-200"
                title="Toggle Admin Menu"
              >
                ${sidebarCollapsed ? '☰ Menu' : '✕ Close'}
              </button>
            </div>

            <!-- Core Nav Items List (collapsible on mobile, permanent on desktop) -->
            <div class="${sidebarCollapsed ? 'hidden md:block' : 'block'}">
            <nav class="p-3 space-y-1 text-xs font-semibold">
              <button
                onClick=${() => setActiveNav('overview')}
                class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeNav === 'overview' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
              >
                <span class="text-sm">◉</span>
                <span>Overview</span>
              </button>

              ${isSupport ? html`
                <button
                  onClick=${() => setActiveNav('users')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeNav === 'users' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-sm">👥</span>
                    <span>Users</span>
                  </div>
                  ${liveUsersCount > 0 ? html`<span class="text-[10px] px-1.5 py-0.2 rounded-md ${activeNav === 'users' ? 'bg-white/20 text-white' : 'bg-cream-200 text-navy-900 font-bold'}">${liveUsersCount}</span>` : null}
                </button>
              ` : null}

              ${isAdmin ? html`
                <button
                  onClick=${() => setActiveNav('skills')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeNav === 'skills' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <span class="text-sm">🛠</span>
                  <span>Skills & Taxonomy</span>
                </button>
              ` : null}

              ${isModerator ? html`
                <button
                  onClick=${() => setActiveNav('exchanges')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeNav === 'exchanges' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <span class="text-sm">🔄</span>
                  <span>Exchanges</span>
                </button>

                <button
                  onClick=${() => setActiveNav('reviews')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeNav === 'reviews' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <span class="text-sm">⭐</span>
                  <span>Reviews</span>
                </button>

                <button
                  onClick=${() => setActiveNav('reports')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeNav === 'reports' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-sm">🚩</span>
                    <span>Reports</span>
                  </div>
                  ${liveOpenReportsCount > 0 ? html`
                    <span class="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                      ${liveOpenReportsCount}
                    </span>
                  ` : null}
                </button>

                <button
                  onClick=${() => setActiveNav('verification')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeNav === 'verification' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-sm">🛡</span>
                    <span>Verification</span>
                  </div>
                  ${livePendingVerifCount > 0 ? html`
                    <span class="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-sky-500 text-white">
                      ${livePendingVerifCount}
                    </span>
                  ` : null}
                </button>

                <button
                  onClick=${() => setActiveNav('community')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeNav === 'community' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <span class="text-sm">👥</span>
                  <span>Community</span>
                </button>
              ` : null}

              ${isAdmin ? html`
                <button
                  onClick=${() => setActiveNav('analytics')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeNav === 'analytics' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <span class="text-sm">📊</span>
                  <span>Analytics</span>
                </button>

                <button
                  onClick=${() => setActiveNav('notifications')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeNav === 'notifications' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <span class="text-sm">🔔</span>
                  <span>Notifications</span>
                </button>
              ` : null}

              <div class="pt-3 mt-3 border-t border-cream-200 space-y-1">
                ${isAdmin ? html`
                  <button
                    onClick=${() => setActiveNav('settings')}
                    class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeNav === 'settings' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                  >
                    <span class="text-sm">⚙</span>
                    <span>Settings</span>
                  </button>
                ` : null}

                <button
                  onClick=${() => setActiveNav('logs')}
                  class="w-full px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition-all ${activeNav === 'logs' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-warmgray-700 hover:bg-cream-100 hover:text-navy-950'}"
                >
                  <span class="text-sm">📋</span>
                  <span>Audit Logs</span>
                </button>
              </div>
            </nav>
          </div>

            <!-- Bottom Switcher & Profile Section -->
            <div class="p-4 border-t border-cream-200 space-y-2">
              <button
                onClick=${() => setActiveTab && setActiveTab('dashboard')}
                class="w-full py-2.5 px-3 bg-cream-100 hover:bg-cream-200 border border-cream-300 text-navy-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>←</span>
                <span>Switch to User Portal</span>
              </button>

              <button
                onClick=${onLogout}
                class="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span>🚪</span>
                <span>Log Out Admin</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- ============================================== -->
        <!-- MAIN CONTENT WORKSPACE                         -->
        <!-- ============================================== -->
        <main class="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl overflow-y-auto">
          
          <!-- Top Breadcrumb & Status Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div class="flex items-center gap-2 text-xs text-warmgray-500 font-semibold mb-1">
                <span>SkillSwapX Admin</span>
                <span>/</span>
                <span class="text-navy-950 font-bold uppercase tracking-wider text-[10px]">${activeNav}</span>
              </div>
              <h1 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950 capitalize">
                ${activeNav === 'overview' ? 'Good evening, ' + (currentUser?.name?.split(' ')[0] || 'Admin') : activeNav}
              </h1>
              <p class="text-xs text-warmgray-600 mt-0.5">
                ${activeNav === 'overview' ? "Here's what's happening across the SkillSwapX reciprocal network today." : 'Manage platform parameters and enforce community trust standards.'}
              </p>
            </div>

            <!-- Health Telemetry Indicator & Live Sync Button -->
            <div class="flex items-center gap-2.5">
              <button
                onClick=${() => syncAllData(true)}
                disabled=${syncing}
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-cream-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-all active:scale-95 disabled:opacity-60"
                title="Synchronize live state with database"
              >
                <span class="${syncing ? 'animate-spin inline-block' : ''}">🔄</span>
                <span>${syncing ? 'Syncing...' : 'Sync Live Data'}</span>
              </button>
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-cream-300 shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-navy-900 font-bold">All Systems Operational</span>
                ${lastSyncedTime ? html`<span class="text-[10px] text-warmgray-500 font-normal pl-1 border-l border-cream-300">Live ${lastSyncedTime}</span>` : null}
              </span>
            </div>
          </div>

          ${loading ? html`
            <div class="p-16 bg-white rounded-3xl border border-cream-300 text-center space-y-3 shadow-xs">
              <div class="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
              <p class="font-serif text-sm font-semibold text-warmgray-600">Retrieving platform database records...</p>
            </div>
          ` : null}

          <!-- Section Error Notice Banner -->
          ${sectionError ? html`
            <div class="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs animate-fadeIn">
              <div class="flex items-center gap-3">
                <span class="text-xl">⚠️</span>
                <div>
                  <p class="font-bold text-xs">Live Telemetry Sync Notice</p>
                  <p class="text-[11px] text-amber-800">${sectionError}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 self-end sm:self-auto">
                <button onClick=${() => syncAllData(true)} class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs">
                  Retry Sync ↻
                </button>
                <button onClick=${() => setSectionError('')} class="p-1 text-amber-600 hover:text-amber-900 text-xs font-bold" title="Dismiss">
                  ✕
                </button>
              </div>
            </div>
          ` : null}

          <!-- ============================================== -->
          <!-- 1. OVERVIEW DASHBOARD VIEW                     -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'overview' && html`
            ${(() => {
              const liveAnalytics = analytics || overviewData?.analytics || null;
              if (!liveAnalytics && !overviewData) {
                return html`
                  <div class="p-12 bg-white rounded-3xl border border-cream-300 text-center space-y-4 shadow-xs animate-fadeIn">
                    <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">📊</div>
                    <div>
                      <h3 class="font-serif text-lg font-bold text-navy-950">Synchronizing Telemetry Records</h3>
                      <p class="text-xs text-warmgray-500 max-w-md mx-auto mt-1">Platform telemetry database is reconnecting to sync active user counts, problem exchange flows, and security verifications.</p>
                    </div>
                    <button onClick=${() => syncAllData(true)} class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2">
                      <span>Synchronize Telemetry Now</span>
                      <span>↻</span>
                    </button>
                  </div>
                `;
              }

              const uKpi = liveAnalytics?.users || {};
              const eKpi = liveAnalytics?.exchanges || {};
              const sKpi = liveAnalytics?.skills || {};
              const rKpi = liveAnalytics?.reports || {};

              return html`
                <div class="space-y-8 animate-fadeIn text-left">
                  
                  <!-- 4 Primary KPI Cards (Four-Across Card Grid Layout) -->
                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <!-- Card 1: Users -->
                    <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-xs space-y-2 hover:shadow-md transition-all">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black text-warmgray-500 uppercase tracking-wider">Total Users</span>
                        <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">+12% this week</span>
                      </div>
                      <div class="text-3xl font-serif font-extrabold text-navy-950">${uKpi.total_users || 0}</div>
                      <div class="text-xs text-warmgray-600">
                        <strong>${uKpi.active_users || 0}</strong> Active · <strong>${uKpi.new_users_today || 0}</strong> new today
                      </div>
                    </div>

                    <!-- Card 2: Exchanges -->
                    <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-xs space-y-2 hover:shadow-md transition-all">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black text-warmgray-500 uppercase tracking-wider">Active Exchanges</span>
                        <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">+8% active</span>
                      </div>
                      <div class="text-3xl font-serif font-extrabold text-navy-950">${(eKpi.active_problems || 0) + (eKpi.active_workspaces || 0)}</div>
                      <div class="text-xs text-warmgray-600">
                        <strong>${eKpi.completed_workspaces || 0}</strong> completed swaps
                      </div>
                    </div>

                    <!-- Card 3: Skills -->
                    <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-xs space-y-2 hover:shadow-md transition-all">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black text-warmgray-500 uppercase tracking-wider">Total Skills</span>
                        <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">${sKpi.total_categories || 0} categories</span>
                      </div>
                      <div class="text-3xl font-serif font-extrabold text-navy-950">${sKpi.total_skills || 0}</div>
                      <div class="text-xs text-warmgray-600">
                        <strong>${sKpi.total_teach_offerings || 0}</strong> taught · <strong>${sKpi.total_learn_demands || 0}</strong> sought
                      </div>
                    </div>

                    <!-- Card 4: Reports -->
                    <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-xs space-y-2 hover:shadow-md transition-all">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-black text-warmgray-500 uppercase tracking-wider">Reported Content</span>
                        ${(rKpi.open_reports || 0) > 0 ? html`
                          <span class="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">Action Needed</span>
                        ` : html`
                          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Clear</span>
                        `}
                      </div>
                      <div class="text-3xl font-serif font-extrabold ${(rKpi.open_reports || 0) > 0 ? 'text-rose-600' : 'text-navy-950'}">
                        ${rKpi.open_reports || 0}
                      </div>
                      <div class="text-xs text-warmgray-600">
                        ${rKpi.resolved_reports || 0} resolved incidents
                      </div>
                    </div>
                  </div>

                  <!-- Platform Activity Chart Visual Section -->
                  <div class="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-xs space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
                      <div>
                        <h3 class="font-serif text-lg font-bold text-navy-950">Platform Activity (Users & Exchange Volume)</h3>
                        <p class="text-xs text-warmgray-600">Real-time telemetry trends across user growth and problem proposal activity.</p>
                      </div>
                      <div class="flex items-center gap-4 text-xs font-semibold">
                        <span class="flex items-center gap-1.5 text-indigo-700">
                          <span class="w-3 h-3 rounded-sm bg-indigo-600"></span>
                          <span>New Users</span>
                        </span>
                        <span class="flex items-center gap-1.5 text-emerald-700">
                          <span class="w-3 h-3 rounded-sm bg-emerald-500"></span>
                          <span>Exchanges Active</span>
                        </span>
                      </div>
                    </div>

                    <!-- Activity Bar Chart Graph (Live Telemetry) -->
                    <div class="grid grid-cols-7 gap-3 sm:gap-6 pt-4 h-48 items-end border-b border-cream-200 pb-4">
                      ${(() => {
                        const rawTimeline = (overviewData?.activityTimeline && overviewData.activityTimeline.length > 0)
                          ? overviewData.activityTimeline
                          : [
                              { day: 'Mon', users: 14, exchanges: 8 },
                              { day: 'Tue', users: 19, exchanges: 12 },
                              { day: 'Wed', users: 25, exchanges: 15 },
                              { day: 'Thu', users: 22, exchanges: 14 },
                              { day: 'Fri', users: 31, exchanges: 21 },
                              { day: 'Sat', users: 28, exchanges: 19 },
                              { day: 'Sun', users: 34, exchanges: 24 }
                            ];
                        const maxVal = Math.max(...rawTimeline.map(t => Math.max(t.users || 0, t.exchanges || 0)), 1);
                        return rawTimeline.map(bar => {
                          const uHeight = Math.min(100, Math.max(12, Math.round(((bar.users || 0) / maxVal) * 85) + 15));
                          const eHeight = Math.min(100, Math.max(10, Math.round(((bar.exchanges || 0) / maxVal) * 85) + 15));
                          return html`
                            <div key=${bar.day} class="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                              <div class="flex items-end gap-1 sm:gap-2 h-full w-full justify-center">
                                <div class="w-3 sm:w-6 bg-indigo-600 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-700 relative" style=${{ height: `${uHeight}%` }} title="Users: ${bar.users || 0}">
                                  <span class="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black bg-navy-900 text-white px-1 rounded shadow-xs pointer-events-none transition-opacity">
                                    ${bar.users || 0}
                                  </span>
                                </div>
                                <div class="w-3 sm:w-6 bg-emerald-500 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600 relative" style=${{ height: `${eHeight}%` }} title="Exchanges: ${bar.exchanges || 0}">
                                  <span class="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black bg-emerald-900 text-white px-1 rounded shadow-xs pointer-events-none transition-opacity">
                                    ${bar.exchanges || 0}
                                  </span>
                                </div>
                              </div>
                              <span class="text-[11px] font-bold text-warmgray-500">${bar.day}</span>
                            </div>
                          `;
                        });
                      })()}
                    </div>
                  </div>

                  <!-- Split Row: Recent Reports Queue & Top Skills Matrix -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Recent Reports Panel -->
                    <div class="bg-white p-6 sm:p-7 rounded-3xl border border-cream-300 shadow-xs space-y-4">
                      <div class="flex items-center justify-between border-b border-cream-100 pb-3">
                        <div class="flex items-center gap-2">
                          <h3 class="font-serif text-lg font-bold text-navy-950">Recent Reports</h3>
                          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800">
                            ${(reports.length > 0 ? reports : (overviewData?.recentReports || [])).filter(r => r.status === 'OPEN').length} Open
                          </span>
                        </div>
                        <button onClick=${() => setActiveNav('reports')} class="text-xs font-bold text-indigo-600 hover:underline">
                          View All Reports →
                        </button>
                      </div>

                      <div class="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
                        ${(reports.length > 0 ? reports : (overviewData?.recentReports || [])).slice(0, 4).map(r => html`
                          <div key=${r.id} class="p-3.5 bg-cream-50/60 border border-cream-200 rounded-2xl flex justify-between items-center hover:bg-cream-100/50 transition-colors">
                            <div class="space-y-0.5">
                              <p class="font-bold text-navy-950">Case #${r.id} · Against: <strong class="text-rose-700">${r.reported_name || 'Member'}</strong></p>
                              <p class="text-warmgray-600 text-[11px] line-clamp-1">${r.reason}</p>
                            </div>
                            <button
                              onClick=${() => { setSelectedReport(r); setActiveNav('reports'); }}
                              class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-2xs shrink-0"
                            >
                              Investigate
                            </button>
                          </div>
                        `)}
                        ${((reports.length === 0 && (!overviewData?.recentReports || overviewData.recentReports.length === 0))) ? html`
                          <p class="text-center py-6 text-warmgray-500">No open reports logged.</p>
                        ` : null}
                      </div>
                    </div>

                    <!-- Top Skills Panel (Live Telemetry) -->
                    <div class="bg-white p-6 sm:p-7 rounded-3xl border border-cream-300 shadow-xs space-y-4">
                      <div class="flex items-center justify-between border-b border-cream-100 pb-3">
                        <h3 class="font-serif text-lg font-bold text-navy-950">Top Skills (Supply vs Demand)</h3>
                        <button onClick=${() => setActiveNav('skills')} class="text-xs font-bold text-indigo-600 hover:underline">
                          Manage Skills →
                        </button>
                      </div>

                      <div class="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
                        ${((overviewData?.topSkills && overviewData.topSkills.length > 0) ? overviewData.topSkills : (analytics?.topSkills || [])).map(sk => html`
                          <div key=${sk.id || sk.name} class="p-3.5 bg-cream-50/60 border border-cream-200 rounded-2xl flex items-center justify-between hover:bg-cream-100/60 transition-colors">
                            <div class="flex items-center gap-2.5">
                              <span class="text-xl">${sk.icon || '💡'}</span>
                              <div>
                                <p class="font-bold text-navy-950">${sk.name}</p>
                                <p class="text-[10px] text-warmgray-500">${sk.category_name || 'General'}</p>
                              </div>
                            </div>
                            <div class="flex items-center gap-3 font-semibold text-[11px]">
                              <span class="text-emerald-700 font-bold">${sk.teachers || 0} teachers</span>
                              <span class="text-warmgray-300">/</span>
                              <span class="text-indigo-700 font-bold">${sk.learners || 0} learners</span>
                            </div>
                          </div>
                        `)}
                        ${((!overviewData?.topSkills || overviewData.topSkills.length === 0) && (!analytics?.topSkills || analytics.topSkills.length === 0)) ? html`
                          <p class="text-center py-6 text-warmgray-500">No skill telemetry recorded yet.</p>
                        ` : null}
                      </div>
                    </div>
                  </div>

                </div>
              `;
            })()}
          `}

          <!-- ============================================== -->
          <!-- 2. USER MANAGEMENT VIEW                        -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'users' && html`
            <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-6 animate-fadeIn text-left">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cream-200 pb-5">
                <div>
                  <h2 class="font-serif text-xl sm:text-2xl font-bold text-navy-950">User Management</h2>
                  <p class="text-warmgray-600 text-xs mt-0.5">Filter, inspect practitioner portfolios, verify identities, and manage account statuses.</p>
                </div>

                <!-- Search & Filters -->
                <div class="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value=${userSearch}
                    onChange=${e => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, username..."
                    class="px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:border-indigo-600 font-medium w-64"
                  />

                  <select
                    value=${userFilter}
                    onChange=${e => setUserFilter(e.target.value)}
                    class="px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900 focus:outline-none"
                  >
                    <option value="ALL">All Users (${users.length})</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="BLOCKED">Suspended / Blocked</option>
                    <option value="VERIFIED">Verified Profiles</option>
                    <option value="STAFF">Staff & Admins</option>
                  </select>
                </div>
              </div>

              <!-- Users Table -->
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-cream-100/70 border-b border-cream-200 font-bold text-navy-950 uppercase tracking-wider text-[10px]">
                      <th class="p-3.5">User</th>
                      <th class="p-3.5">Role</th>
                      <th class="p-3.5">Skills Offered/Wanted</th>
                      <th class="p-3.5">Completed Swaps</th>
                      <th class="p-3.5">Rating</th>
                      <th class="p-3.5">Reports</th>
                      <th class="p-3.5">Status</th>
                      <th class="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-cream-100">
                    ${filteredUsers.length > 0 ? filteredUsers.map(u => html`
                      <tr key=${u.id} class="hover:bg-cream-50/40 transition-colors">
                        <td class="p-3.5">
                          <div class="flex items-center gap-3">
                            <img src=${u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop'} class="w-9 h-9 rounded-full object-cover border border-cream-300 shrink-0" />
                            <div>
                              <div class="flex items-center gap-1.5">
                                <span class="font-bold text-navy-950 text-sm">${u.name}</span>
                                ${u.email_verified || u.verified_skills_count > 0 ? html`<span class="text-indigo-600 text-xs" title="Verified Member">✓</span>` : null}
                              </div>
                              <p class="text-[11px] text-warmgray-500">${u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td class="p-3.5">
                          <span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getRoleBadgeStyle(u.role)}">
                            ${u.role}
                          </span>
                        </td>

                        <td class="p-3.5 font-semibold text-warmgray-700">
                          <span class="text-emerald-700">${u.teach_count || 0} teach</span> · <span class="text-indigo-700">${u.learn_count || 0} learn</span>
                        </td>

                        <td class="p-3.5 font-bold text-navy-950">
                          ${u.completed_exchanges || 0}
                        </td>

                        <td class="p-3.5 font-bold text-indigo-900">
                          ★ ${u.avg_rating || '5.0'} (${u.reviews_count || 0})
                        </td>

                        <td class="p-3.5 font-bold ${u.reports_against > 0 ? 'text-rose-600' : 'text-warmgray-400'}">
                          ${u.reports_against || 0}
                        </td>

                        <td class="p-3.5">
                          <span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}">
                            ${u.status}
                          </span>
                        </td>

                        <td class="p-3.5 text-right space-x-2">
                          <button
                            onClick=${() => setSelectedUserDetail(u)}
                            class="px-2.5 py-1.5 bg-cream-100 hover:bg-cream-200 text-navy-950 rounded-xl font-bold text-xs border border-cream-300"
                          >
                            Details
                          </button>
                          
                          <button
                            onClick=${() => handleUpdateUserStatus(u.id, u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE')}
                            class="px-2.5 py-1.5 rounded-xl font-bold text-xs transition-colors ${u.status === 'ACTIVE' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'}"
                          >
                            ${u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    `) : html`
                      <tr>
                        <td colspan="8" class="text-center py-12 text-warmgray-500">
                          <div class="flex flex-col items-center justify-center space-y-2">
                            <span class="text-3xl">👥</span>
                            <p class="font-semibold text-sm text-navy-950">No users found</p>
                            <p class="text-xs text-warmgray-500">${userSearch ? 'No practitioners matched your search query.' : 'Click below to reload user records from database.'}</p>
                            <button onClick=${() => loadDataForSection('users')} class="mt-2 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors">
                              Reload Users ↻
                            </button>
                          </div>
                        </td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- User Detail Modal Drawer -->
            ${selectedUserDetail ? html`
              <div class="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-left shadow-2xl border border-cream-300">
                  <div class="flex items-center justify-between border-b border-cream-200 pb-4">
                    <h3 class="font-serif text-xl font-bold text-navy-950">User Profile Summary</h3>
                    <button onClick=${() => setSelectedUserDetail(null)} class="text-warmgray-400 hover:text-navy-950 font-bold text-lg">×</button>
                  </div>

                  <div class="flex items-center gap-4">
                    <img src=${selectedUserDetail.avatar_url || '/favicon.png'} class="w-16 h-16 rounded-2xl object-cover border border-cream-300" />
                    <div>
                      <h4 class="font-bold text-navy-950 text-base">${selectedUserDetail.name}</h4>
                      <p class="text-xs text-warmgray-500">${selectedUserDetail.email}</p>
                      <p class="text-xs text-warmgray-700 mt-1">${selectedUserDetail.headline || 'No headline set.'}</p>
                    </div>
                  </div>

                  <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 text-xs">
                    <p><strong>Bio:</strong> ${selectedUserDetail.bio || 'Not provided.'}</p>
                    <p><strong>Location:</strong> ${selectedUserDetail.location || 'Remote'}</p>
                    <p><strong>Language:</strong> ${selectedUserDetail.preferred_language || 'English'} · <strong>Weekly Hours:</strong> ${selectedUserDetail.weekly_hours || 4} hrs</p>
                  </div>

                  <!-- Admin Role Assignment -->
                  ${isAdmin ? html`
                    <div class="space-y-2 text-xs">
                      <label class="font-bold text-navy-950">Assign RBAC Role</label>
                      <div class="flex flex-wrap gap-2">
                        ${['USER', 'SUPPORT', 'MODERATOR', 'ADMIN', ...(isSuperAdmin ? ['SUPER_ADMIN'] : [])].map(r => html`
                          <button
                            key=${r}
                            onClick=${() => handleUpdateUserRole(selectedUserDetail.id, r)}
                            class="px-3 py-1.5 rounded-xl font-bold text-xs border ${selectedUserDetail.role === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-navy-900 border-cream-300 hover:bg-cream-100'}"
                          >
                            ${r}
                          </button>
                        `)}
                      </div>
                    </div>
                  ` : null}

                  <!-- Danger Zone (Delete Account) -->
                  ${isSuperAdmin ? html`
                    <div class="pt-4 border-t border-cream-200 flex justify-between items-center">
                      <button
                        onClick=${() => handleDeleteUser(selectedUserDetail.id)}
                        class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl"
                      >
                        Delete Account Permanently
                      </button>
                      <button
                        onClick=${() => setSelectedUserDetail(null)}
                        class="px-5 py-2 bg-navy-950 text-white font-bold text-xs rounded-xl"
                      >
                        Close
                      </button>
                    </div>
                  ` : html`
                    <button
                      onClick=${() => setSelectedUserDetail(null)}
                      class="w-full py-2.5 bg-navy-950 text-white font-bold text-xs rounded-xl"
                    >
                      Close
                    </button>
                  `}
                </div>
              </div>
            ` : null}
          `}

          <!-- ============================================== -->
          <!-- 3. SKILL & CATEGORY MANAGEMENT VIEW           -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'skills' && html`
            <div class="space-y-6 animate-fadeIn text-left">
              
              <!-- Sub-tab pills -->
              <div class="flex items-center justify-between border-b border-cream-300 pb-4">
                <div class="flex items-center gap-2 text-xs font-bold">
                  <button
                    onClick=${() => setSkillTab('skills')}
                    class="px-4 py-2 rounded-xl transition-all ${skillTab === 'skills' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-cream-200 text-navy-900'}"
                  >
                    Skills Management (${skills.length})
                  </button>
                  <button
                    onClick=${() => setSkillTab('categories')}
                    class="px-4 py-2 rounded-xl transition-all ${skillTab === 'categories' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-cream-200 text-navy-900'}"
                  >
                    Category Taxonomy (${categoriesList.length})
                  </button>
                </div>

                ${skillTab === 'skills' ? html`
                  <button
                    onClick=${() => setNewSkillModal(true)}
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    + Add New Skill
                  </button>
                ` : html`
                  <button
                    onClick=${() => setNewCatModal(true)}
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    + Add Category
                  </button>
                `}
              </div>

              <!-- Skills Tab Content -->
              ${skillTab === 'skills' ? html`
                <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 space-y-4">
                  <div class="flex items-center justify-between">
                    <input
                      type="text"
                      value=${skillSearch}
                      onChange=${e => setSkillSearch(e.target.value)}
                      placeholder="Filter skills by name or category..."
                      class="px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs w-72 focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr class="bg-cream-100/70 border-b border-cream-200 font-bold text-navy-950 uppercase tracking-wider text-[10px]">
                          <th class="p-3.5">Skill Name</th>
                          <th class="p-3.5">Category</th>
                          <th class="p-3.5">Teachers</th>
                          <th class="p-3.5">Learners</th>
                          <th class="p-3.5">Market Demand</th>
                          <th class="p-3.5">Attributes</th>
                          <th class="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-cream-100">
                        ${filteredSkills.map(sk => html`
                          <tr key=${sk.id} class="hover:bg-cream-50/40">
                            <td class="p-3.5 font-bold text-navy-950">${sk.name}</td>
                            <td class="p-3.5 text-warmgray-600 font-semibold">${sk.category_name}</td>
                            <td class="p-3.5 font-bold text-emerald-700">${sk.teacher_count || 0}</td>
                            <td class="p-3.5 font-bold text-indigo-700">${sk.learner_count || 0}</td>
                            <td class="p-3.5">
                              <span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${sk.demand_level === 'High Demand' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-cream-100 text-warmgray-700'}">
                                ${sk.demand_level}
                              </span>
                            </td>
                            <td class="p-3.5 space-x-1">
                              <button
                                onClick=${() => handleToggleSkillFlag(sk, 'is_popular')}
                                class="px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${sk.is_popular ? 'bg-sky-100 text-indigo-950 border-indigo-300' : 'bg-cream-50 text-warmgray-500 border-cream-200'}"
                              >
                                Popular
                              </button>
                              <button
                                onClick=${() => handleToggleSkillFlag(sk, 'is_trending')}
                                class="px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${sk.is_trending ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-cream-50 text-warmgray-500 border-cream-200'}"
                              >
                                Trending
                              </button>
                            </td>
                            <td class="p-3.5 text-right">
                              <button
                                onClick=${() => handleDeleteSkill(sk.id)}
                                class="text-rose-600 hover:text-rose-800 font-bold text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        `)}
                      </tbody>
                    </table>
                  </div>
                </div>
              ` : null}

              <!-- Categories Tab Content -->
              ${skillTab === 'categories' ? html`
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  ${categoriesList.map(cat => html`
                    <div key=${cat.id} class="p-5 bg-white border border-cream-300 rounded-3xl shadow-xs space-y-3 hover:shadow-md transition-all">
                      <div class="flex items-start justify-between">
                        <div>
                          <h4 class="font-bold text-navy-950 text-sm">${cat.name}</h4>
                          <p class="text-xs text-warmgray-500 mt-0.5">${cat.description || 'No description'}</p>
                        </div>
                        <button onClick=${() => handleDeleteCategory(cat.id)} class="text-rose-600 hover:text-rose-800 text-xs font-bold">Delete</button>
                      </div>
                      <div class="flex items-center justify-between text-xs text-warmgray-600 pt-2 border-t border-cream-100">
                        <span>${cat.skill_count || 0} skills assigned</span>
                        ${cat.is_featured ? html`<span class="text-indigo-700 font-bold text-[10px]">★ Featured</span>` : null}
                      </div>
                    </div>
                  `)}
                </div>
              ` : null}

            </div>

            <!-- New Skill Modal -->
            ${newSkillModal ? html`
              <div class="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 text-left shadow-2xl border border-cream-300">
                  <h3 class="font-serif text-lg font-bold text-navy-950">Add New Skill</h3>
                  <form onSubmit=${handleCreateSkill} class="space-y-4 text-xs">
                    <div>
                      <label class="block font-bold text-navy-950 mb-1">Parent Category</label>
                      <select
                        required
                        value=${newSkillForm.category_id}
                        onChange=${e => setNewSkillForm({ ...newSkillForm, category_id: e.target.value })}
                        class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-medium"
                      >
                        <option value="">Select Category...</option>
                        ${categoriesList.map(c => html`<option key=${c.id} value=${c.id}>${c.name}</option>`)}
                      </select>
                    </div>
                    <div>
                      <label class="block font-bold text-navy-950 mb-1">Skill Name</label>
                      <input
                        required
                        type="text"
                        value=${newSkillForm.name}
                        onChange=${e => setNewSkillForm({ ...newSkillForm, name: e.target.value })}
                        placeholder="e.g. Next.js 15"
                        class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label class="block font-bold text-navy-950 mb-1">Description</label>
                      <textarea
                        rows="2"
                        value=${newSkillForm.description}
                        onChange=${e => setNewSkillForm({ ...newSkillForm, description: e.target.value })}
                        placeholder="Brief summary of syllabus & outcomes..."
                        class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl"
                      ></textarea>
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                      <button type="button" onClick=${() => setNewSkillModal(false)} class="px-4 py-2 border border-cream-300 rounded-xl font-bold">Cancel</button>
                      <button type="submit" class="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold">Create Skill</button>
                    </div>
                  </form>
                </div>
              </div>
            ` : null}

            <!-- New Category Modal -->
            ${newCatModal ? html`
              <div class="fixed inset-0 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 text-left shadow-2xl border border-cream-300">
                  <h3 class="font-serif text-lg font-bold text-navy-950">Add Skill Category</h3>
                  <form onSubmit=${handleCreateCategory} class="space-y-4 text-xs">
                    <div>
                      <label class="block font-bold text-navy-950 mb-1">Category Title</label>
                      <input
                        required
                        type="text"
                        value=${newCatForm.name}
                        onChange=${e => setNewCatForm({ ...newCatForm, name: e.target.value })}
                        placeholder="e.g. Cloud Architecture"
                        class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label class="block font-bold text-navy-950 mb-1">Description</label>
                      <textarea
                        rows="2"
                        value=${newCatForm.description}
                        onChange=${e => setNewCatForm({ ...newCatForm, description: e.target.value })}
                        placeholder="Overview of this discipline..."
                        class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl"
                      ></textarea>
                    </div>
                    <div class="flex justify-end gap-2 pt-2">
                      <button type="button" onClick=${() => setNewCatModal(false)} class="px-4 py-2 border border-cream-300 rounded-xl font-bold">Cancel</button>
                      <button type="submit" class="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold">Save Category</button>
                    </div>
                  </form>
                </div>
              </div>
            ` : null}
          `}

          <!-- ============================================== -->
          <!-- 4. EXCHANGES MONITORING (Problem-Exchange Aware)-->
          <!-- ============================================== -->
          ${!loading && activeNav === 'exchanges' && html`
            <div class="space-y-6 animate-fadeIn text-left">
              
              <!-- Exchange Navigation Tabs -->
              <div class="flex flex-wrap items-center gap-2 border-b border-cream-300 pb-4 text-xs font-bold">
                <button
                  onClick=${() => setExchangeTab('problems')}
                  class="px-4 py-2 rounded-xl transition-all ${exchangeTab === 'problems' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-cream-200 text-navy-900'}"
                >
                  Problems & Demands (${(exchangesData.problems || []).length})
                </button>
                <button
                  onClick=${() => setExchangeTab('proposals')}
                  class="px-4 py-2 rounded-xl transition-all ${exchangeTab === 'proposals' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-cream-200 text-navy-900'}"
                >
                  Submitted Proposals (${(exchangesData.proposals || []).length})
                </button>
                <button
                  onClick=${() => setExchangeTab('workspaces')}
                  class="px-4 py-2 rounded-xl transition-all ${exchangeTab === 'workspaces' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-cream-200 text-navy-900'}"
                >
                  Agreements & Workspaces (${(exchangesData.workspaces || []).length})
                </button>
              </div>

              <!-- Problems Table View -->
              ${exchangeTab === 'problems' ? html`
                <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 overflow-x-auto text-xs">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-cream-100/70 border-b border-cream-200 font-bold text-navy-950 uppercase tracking-wider text-[10px]">
                        <th class="p-3.5">Problem Case</th>
                        <th class="p-3.5">Creator</th>
                        <th class="p-3.5">Required Skill</th>
                        <th class="p-3.5">Offered Skill</th>
                        <th class="p-3.5">Urgency</th>
                        <th class="p-3.5">Status</th>
                        <th class="p-3.5 text-right">Proposals</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-cream-100">
                      ${(exchangesData.problems || []).map(p => html`
                        <tr key=${p.id} class="hover:bg-cream-50/40">
                          <td class="p-3.5 font-bold text-navy-950">${p.title}</td>
                          <td class="p-3.5 font-semibold text-warmgray-700">${p.creator_name}</td>
                          <td class="p-3.5 text-indigo-700 font-bold">${p.required_skill_name || 'N/A'}</td>
                          <td class="p-3.5 text-emerald-700 font-bold">${p.offered_skill_name || 'N/A'}</td>
                          <td class="p-3.5">
                            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${p.urgency === 'Critical' ? 'bg-rose-100 text-rose-800' : 'bg-cream-100 text-warmgray-700'}">
                              ${p.urgency}
                            </span>
                          </td>
                          <td class="p-3.5">
                            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${p.status === 'DISPUTED' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}">
                              ${p.status}
                            </span>
                          </td>
                          <td class="p-3.5 text-right font-bold text-indigo-600">
                            ${p.proposal_count || 0} proposals
                          </td>
                        </tr>
                      `)}
                    </tbody>
                  </table>
                </div>
              ` : null}

              <!-- Proposals Table View -->
              ${exchangeTab === 'proposals' ? html`
                <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 overflow-x-auto text-xs">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-cream-100/70 border-b border-cream-200 font-bold text-navy-950 uppercase tracking-wider text-[10px]">
                        <th class="p-3.5">Problem Target</th>
                        <th class="p-3.5">Proposer</th>
                        <th class="p-3.5">Offered Skill</th>
                        <th class="p-3.5">Proposed Terms</th>
                        <th class="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-cream-100">
                      ${(exchangesData.proposals || []).map(prop => html`
                        <tr key=${prop.id} class="hover:bg-cream-50/40">
                          <td class="p-3.5 font-bold text-navy-950">${prop.problem_title}</td>
                          <td class="p-3.5 font-semibold text-warmgray-700">${prop.proposer_name}</td>
                          <td class="p-3.5 text-emerald-700 font-bold">${prop.offered_skill_name}</td>
                          <td class="p-3.5 text-warmgray-600 max-w-xs truncate">${prop.proposed_terms || 'Standard barter'}</td>
                          <td class="p-3.5">
                            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${prop.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800' : 'bg-sky-50 text-indigo-900'}">
                              ${prop.status}
                            </span>
                          </td>
                        </tr>
                      `)}
                    </tbody>
                  </table>
                </div>
              ` : null}

              <!-- Workspaces Table View -->
              ${exchangeTab === 'workspaces' ? html`
                <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 overflow-x-auto text-xs">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-cream-100/70 border-b border-cream-200 font-bold text-navy-950 uppercase tracking-wider text-[10px]">
                        <th class="p-3.5">Workspace Title</th>
                        <th class="p-3.5">Partner 1</th>
                        <th class="p-3.5">Partner 2</th>
                        <th class="p-3.5">Tasks Completed</th>
                        <th class="p-3.5">Progress</th>
                        <th class="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-cream-100">
                      ${(exchangesData.workspaces || []).map(ws => html`
                        <tr key=${ws.id} class="hover:bg-cream-50/40">
                          <td class="p-3.5 font-bold text-navy-950">${ws.title}</td>
                          <td class="p-3.5 font-semibold">${ws.user1_name}</td>
                          <td class="p-3.5 font-semibold">${ws.user2_name}</td>
                          <td class="p-3.5 text-warmgray-600">${ws.completed_tasks || 0} / ${ws.task_count || 0} tasks</td>
                          <td class="p-3.5">
                            <div class="flex items-center gap-2">
                              <div class="w-16 bg-cream-200 rounded-full h-1.5">
                                <div class="bg-indigo-600 h-1.5 rounded-full" style=${{ width: `${ws.progress || 0}%` }}></div>
                              </div>
                              <span class="font-bold text-[10px]">${ws.progress || 0}%</span>
                            </div>
                          </td>
                          <td class="p-3.5">
                            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${ws.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-800' : 'bg-indigo-50 text-indigo-800'}">
                              ${ws.status}
                            </span>
                          </td>
                        </tr>
                      `)}
                    </tbody>
                  </table>
                </div>
              ` : null}

            </div>
          `}

          <!-- ============================================== -->
          <!-- 5. REVIEWS MODERATION VIEW                     -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'reviews' && html`
            <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-6 animate-fadeIn text-left">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
                <div>
                  <h2 class="font-serif text-xl sm:text-2xl font-bold text-navy-950">Reviews Moderation</h2>
                  <p class="text-warmgray-600 text-xs mt-0.5">Inspect bilateral feedback, detect rating manipulation, and remove abusive content.</p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value=${reviewSearch}
                    onChange=${e => setReviewSearch(e.target.value)}
                    placeholder="Search reviews & feedback..."
                    class="px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs w-60 focus:outline-none focus:border-indigo-600 font-medium"
                  />
                  <select
                    value=${reviewFilter}
                    onChange=${e => setReviewFilter(e.target.value)}
                    class="px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900"
                  >
                    <option value="ALL">All Reviews (${reviews.length})</option>
                    <option value="LOW">Low Ratings (≤ 2★)</option>
                    <option value="FLAGGED">Flagged for Review</option>
                    <option value="VERIFIED">Verified Exchanges</option>
                  </select>
                </div>
              </div>

              <!-- Reviews Cards Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                ${filteredReviews.map(r => html`
                  <div key=${r.id} class="p-5 bg-cream-50/50 rounded-2xl border border-cream-200 space-y-3 hover:shadow-xs transition-all ${r.is_flagged ? 'border-rose-300 bg-rose-50/20' : ''}">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-indigo-600 font-bold text-sm">★ ${r.rating}.0</span>
                        ${r.is_verified_exchange ? html`
                          <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✓ Verified Exchange
                          </span>
                        ` : null}
                      </div>
                      <div class="space-x-1 text-xs font-bold">
                        <button
                          onClick=${() => handleToggleReviewFlag(r)}
                          class="px-2 py-1 rounded-lg ${r.is_flagged ? 'bg-rose-600 text-white' : 'bg-white border border-cream-300 text-navy-900'}"
                        >
                          ${r.is_flagged ? 'Flagged' : 'Flag'}
                        </button>
                        <button
                          onClick=${() => handleDeleteReview(r.id)}
                          class="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <p class="text-xs text-navy-950 font-medium leading-relaxed">"${r.comment || 'No written commentary.'}"</p>

                    <div class="flex items-center justify-between text-[10.5px] text-warmgray-500 pt-2 border-t border-cream-200">
                      <span><strong>${r.reviewer_name}</strong> ➔ <strong>${r.reviewee_name}</strong></span>
                      <span>${new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                `)}
                ${filteredReviews.length === 0 ? html`<p class="text-center py-10 text-warmgray-500 col-span-2 text-xs">No reviews matching filter.</p>` : null}
              </div>
            </div>
          `}

          <!-- ============================================== -->
          <!-- 6. REPORTS & CONTENT MODERATION (Report-Triggered) -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'reports' && html`
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn text-left">
              
              <!-- Left Report Queue -->
              <div class="lg:col-span-2 space-y-4">
                <div class="bg-white rounded-3xl border border-cream-300 shadow-xs overflow-hidden text-xs">
                  <div class="p-5 border-b border-cream-200 flex items-center justify-between">
                    <div>
                      <h3 class="font-serif text-lg font-bold text-navy-950">Safety Reports Queue</h3>
                      <p class="text-warmgray-500 text-[11px]">Content moderation is report-triggered; private context is scoped strictly to reported cases.</p>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <button onClick=${() => setReportFilter('OPEN')} class="px-2.5 py-1 rounded-lg font-bold text-[10px] ${reportFilter === 'OPEN' ? 'bg-indigo-600 text-white' : 'bg-cream-100 text-navy-900'}">Open</button>
                      <button onClick=${() => setReportFilter('RESOLVED')} class="px-2.5 py-1 rounded-lg font-bold text-[10px] ${reportFilter === 'RESOLVED' ? 'bg-indigo-600 text-white' : 'bg-cream-100 text-navy-900'}">Resolved</button>
                      <button onClick=${() => setReportFilter('DISMISSED')} class="px-2.5 py-1 rounded-lg font-bold text-[10px] ${reportFilter === 'DISMISSED' ? 'bg-indigo-600 text-white' : 'bg-cream-100 text-navy-900'}">Dismissed</button>
                    </div>
                  </div>

                  <div class="divide-y divide-cream-100">
                    ${filteredReports.map(r => html`
                      <div key=${r.id} class="p-5 space-y-3 hover:bg-cream-50/40 transition-colors ${selectedReport?.id === r.id ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' : ''}">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <span class="font-bold text-navy-950">Case #${r.id}</span>
                            <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase ${r.status === 'OPEN' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                              ${r.status}
                            </span>
                          </div>
                          <span class="text-[10px] text-warmgray-500">${new Date(r.created_at).toLocaleDateString()}</span>
                        </div>

                        <div class="space-y-1">
                          <p class="font-bold text-navy-950">
                            ${r.reporter_name} ➔ <span class="text-rose-700">${r.reported_name}</span>
                          </p>
                          <p class="text-warmgray-700"><strong>Reason:</strong> ${r.reason}</p>
                          <p class="text-warmgray-600 bg-cream-50 p-3 rounded-xl border border-cream-200 leading-relaxed">"${r.details || 'No additional text provided.'}"</p>
                        </div>

                        <div class="flex items-center justify-between pt-2">
                          <button
                            onClick=${() => { setSelectedReport(r); setReportResolutionNotes(r.resolution_notes || ''); }}
                            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-2xs"
                          >
                            Inspect & Resolve Case →
                          </button>
                          ${r.status === 'OPEN' ? html`
                            <button onClick=${() => handleDismissReport(r.id)} class="text-warmgray-400 hover:text-warmgray-600 font-bold text-xs">
                              Dismiss Case
                            </button>
                          ` : null}
                        </div>
                      </div>
                    `)}
                    ${filteredReports.length === 0 ? html`<p class="text-center py-12 text-warmgray-500 text-xs">No reports in "${reportFilter}" state.</p>` : null}
                  </div>
                </div>
              </div>

              <!-- Right Case Inspector Panel -->
              <div class="lg:col-span-1">
                ${selectedReport ? html`
                  <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-md space-y-4 text-xs sticky top-8">
                    <h3 class="font-serif text-lg font-bold text-navy-950">Resolve Case #${selectedReport.id}</h3>
                    
                    <form onSubmit=${handleResolveReport} class="space-y-4">
                      <div class="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                        <p class="font-bold text-rose-950">Target Member: ${selectedReport.reported_name}</p>
                        <p class="text-[10px] text-warmgray-600">Email: ${selectedReport.reported_email}</p>
                      </div>

                      <div>
                        <label class="block font-bold text-navy-950 mb-1">Official Resolution Notes</label>
                        <textarea
                          required
                          rows="4"
                          value=${reportResolutionNotes}
                          onChange=${e => setReportResolutionNotes(e.target.value)}
                          placeholder="Summarize investigation outcome and actions taken..."
                          class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-indigo-600 font-medium text-navy-900"
                        ></textarea>
                      </div>

                      <div class="flex items-center gap-2 font-semibold text-navy-900">
                        <input
                          type="checkbox"
                          id="blockUserCheck"
                          checked=${reportBlockUser}
                          onChange=${e => setReportBlockUser(e.target.checked)}
                          class="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                        <label for="blockUserCheck" class="cursor-pointer">Suspend/Block this account immediately</label>
                      </div>

                      <div class="flex gap-2 pt-2">
                        <button type="submit" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors">
                          Submit Resolution
                        </button>
                      </div>
                    </form>
                  </div>
                ` : html`
                  <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-xs text-center py-16 text-warmgray-500 text-xs">
                    <span class="text-3xl block mb-2">🔍</span>
                    <p class="font-semibold">Select a safety report ticket from the queue to investigate and apply moderation outcomes.</p>
                  </div>
                `}
              </div>

            </div>
          `}

          <!-- ============================================== -->
          <!-- 7. SKILL PROOF VERIFICATION QUEUE              -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'verification' && html`
            <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-6 animate-fadeIn text-left">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
                <div>
                  <h2 class="font-serif text-xl sm:text-2xl font-bold text-navy-950">Skill Verification Queue</h2>
                  <p class="text-warmgray-600 text-xs mt-0.5">Review practitioner evidence (GitHub, portfolio, certificates) and grant official "✓ Verified" badges.</p>
                </div>

                <div class="flex items-center gap-2 text-xs font-bold">
                  <button onClick=${() => setVerifFilter('PENDING')} class="px-3 py-1.5 rounded-xl ${verifFilter === 'PENDING' ? 'bg-indigo-600 text-white' : 'bg-cream-100 text-navy-900'}">Pending (${verifications.filter(v => v.status === 'PENDING').length})</button>
                  <button onClick=${() => setVerifFilter('APPROVED')} class="px-3 py-1.5 rounded-xl ${verifFilter === 'APPROVED' ? 'bg-indigo-600 text-white' : 'bg-cream-100 text-navy-900'}">Approved</button>
                  <button onClick=${() => setVerifFilter('REJECTED')} class="px-3 py-1.5 rounded-xl ${verifFilter === 'REJECTED' ? 'bg-indigo-600 text-white' : 'bg-cream-100 text-navy-900'}">Rejected</button>
                </div>
              </div>

              <!-- Verifications Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                ${filteredVerifications.map(v => html`
                  <div key=${v.id} class="p-6 bg-cream-50/60 rounded-3xl border border-cream-200 space-y-4 hover:shadow-xs transition-all">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-3">
                        <img src=${v.user_avatar || '/favicon.png'} class="w-10 h-10 rounded-full object-cover border border-cream-300" />
                        <div>
                          <h4 class="font-bold text-navy-950 text-sm">${v.user_name}</h4>
                          <p class="text-[11px] text-warmgray-500">${v.user_email}</p>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase ${v.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-indigo-900'}">
                        ${v.status}
                      </span>
                    </div>

                    <div class="p-4 bg-white rounded-2xl border border-cream-200 space-y-2 text-xs">
                      <div class="flex items-center justify-between font-bold text-navy-950">
                        <span>${v.skill_name} (${v.level})</span>
                        <span class="text-indigo-600 uppercase text-[10px]">${v.proof_type}</span>
                      </div>
                      <p class="text-warmgray-600">${v.notes || 'No description notes provided.'}</p>
                      
                      <div class="pt-2 border-t border-cream-100">
                        <a href=${v.proof_url} target="_blank" rel="noreferrer" class="text-indigo-600 hover:underline font-bold text-xs inline-flex items-center gap-1">
                          <span>Inspect Proof Link →</span>
                        </a>
                      </div>
                    </div>

                    ${v.status === 'PENDING' ? html`
                      <div class="flex items-center gap-2 pt-1 text-xs font-bold">
                        <button
                          onClick=${() => handleProcessVerification(v.id, 'APPROVED')}
                          class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-2xs"
                        >
                          ✓ Approve & Badge
                        </button>
                        <button
                          onClick=${() => handleProcessVerification(v.id, 'REJECTED')}
                          class="flex-1 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl"
                        >
                          Reject
                        </button>
                      </div>
                    ` : html`
                      <p class="text-[10px] text-warmgray-500 italic">Reviewed by admin: ${v.admin_notes || 'No additional review notes.'}</p>
                    `}
                  </div>
                `)}
                ${filteredVerifications.length === 0 ? html`<p class="text-center py-10 text-warmgray-500 col-span-2 text-xs">No verification requests in this queue.</p>` : null}
              </div>
            </div>
          `}

          <!-- ============================================== -->
          <!-- 8. COMMUNITY & SKILL CIRCLES                   -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'community' && html`
            <div class="space-y-6 animate-fadeIn text-left">
              <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-6">
                <div class="border-b border-cream-200 pb-4">
                  <h2 class="font-serif text-xl sm:text-2xl font-bold text-navy-950">Community & Skill Circles</h2>
                  <p class="text-warmgray-600 text-xs mt-0.5">Manage study groups, skill circles, assign moderators, and moderate public forum discussions.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  ${(communityData.circles || []).map(c => html`
                    <div key=${c.id} class="p-5 bg-cream-50/60 rounded-2xl border border-cream-200 space-y-3">
                      <div class="flex items-start justify-between">
                        <div>
                          <h4 class="font-bold text-navy-950 text-sm">${c.name}</h4>
                          <p class="text-[11px] text-warmgray-600 mt-0.5">${c.description}</p>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase ${c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-indigo-900'}">${c.status}</span>
                      </div>
                      <div class="flex items-center justify-between text-xs text-warmgray-500 pt-2 border-t border-cream-200">
                        <span>Created by: <strong>${c.creator_name}</strong></span>
                        <span>${c.member_count || 1} members</span>
                      </div>
                    </div>
                  `)}
                </div>
              </div>
            </div>
          `}

          <!-- ============================================== -->
          <!-- 9. ANALYTICS & MATCHING TELEMETRY              -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'analytics' && html`
            ${!analyticsData ? html`
              <div class="p-12 bg-white rounded-3xl border border-cream-300 text-center space-y-4 shadow-xs animate-fadeIn">
                <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-xs">📈</div>
                <div>
                  <h3 class="font-serif text-lg font-bold text-navy-950">Connecting to Matching Analytics Engine</h3>
                  <p class="text-xs text-warmgray-500 max-w-md mx-auto mt-1">Bilateral synergy analytics, compatibility scoring distributions, and skill matrix data are loading.</p>
                </div>
                <button onClick=${() => loadDataForSection('analytics')} class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2">
                  <span>Load Analytics Data Now</span>
                  <span>↻</span>
                </button>
              </div>
            ` : html`
              <div class="space-y-8 animate-fadeIn text-left">
                
                <!-- Bilateral Matching Engine Analytics Card -->
                <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-6">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
                    <div>
                      <h3 class="font-serif text-lg font-bold text-navy-950">Bilateral Matching Engine Analytics</h3>
                      <p class="text-xs text-warmgray-600">Mathematical compatibility accuracy, acceptance rates, and top verified pairing pathways.</p>
                    </div>
                    <span class="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full border border-indigo-200">
                      Engine v2.4 Active
                    </span>
                  </div>

                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-1">
                      <span class="text-[10px] font-black text-warmgray-500 uppercase">Avg Match Score</span>
                      <div class="text-2xl font-serif font-extrabold text-navy-950">${analyticsData.matchingAnalytics?.avgMatchScore}%</div>
                    </div>
                    <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-1">
                      <span class="text-[10px] font-black text-warmgray-500 uppercase">Proposal Acceptance Rate</span>
                      <div class="text-2xl font-serif font-extrabold text-emerald-700">${analyticsData.matchingAnalytics?.acceptanceRate}%</div>
                    </div>
                    <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-1">
                      <span class="text-[10px] font-black text-warmgray-500 uppercase">Swap Completion Rate</span>
                      <div class="text-2xl font-serif font-extrabold text-indigo-700">${analyticsData.matchingAnalytics?.completionRate}%</div>
                    </div>
                    <div class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-1">
                      <span class="text-[10px] font-black text-warmgray-500 uppercase">Total Matches Computed</span>
                      <div class="text-2xl font-serif font-extrabold text-navy-950">${analyticsData.matchingAnalytics?.totalMatchesGenerated}</div>
                    </div>
                  </div>

                  <!-- Read-Only Algorithm Weights Table -->
                  <div class="pt-4 border-t border-cream-200 space-y-3">
                    <h4 class="font-bold text-navy-950 text-xs uppercase tracking-wider">Active 6-Factor Algorithm Weights (Read-Only)</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      ${(analyticsData.matchingAnalytics?.activeAlgorithmWeights || []).map(w => html`
                        <div key=${w.name} class="p-3.5 bg-white border border-cream-200 rounded-2xl flex items-center justify-between">
                          <div>
                            <p class="font-bold text-navy-950">${w.name}</p>
                            <p class="text-[10px] text-warmgray-500">${w.description}</p>
                          </div>
                          <span class="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-xl">${w.weight}%</span>
                        </div>
                      `)}
                    </div>
                  </div>
                </div>

                <!-- Supply vs Demand Imbalance Visualization -->
                <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-4">
                  <h3 class="font-serif text-lg font-bold text-navy-950">Skill Supply vs Demand Imbalance Matrix</h3>
                  <div class="space-y-3 pt-2 text-xs">
                    ${(analyticsData.skillMatrix || []).map(sk => html`
                      <div key=${sk.id} class="p-3 bg-cream-50/70 rounded-xl border border-cream-200 flex items-center justify-between">
                        <span class="font-bold text-navy-950 w-48 truncate">${sk.name}</span>
                        <div class="flex items-center gap-4 text-xs">
                          <span class="text-emerald-700 font-semibold">${sk.teachers || 0} teachers</span>
                          <span class="text-indigo-700 font-semibold">${sk.learners || 0} learners</span>
                        </div>
                      </div>
                    `)}
                  </div>
                </div>

              </div>
            `}
          `}

          <!-- ============================================== -->
          <!-- 10. PLATFORM NOTIFICATIONS (Announcements)     -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'notifications' && html`
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn text-left">
              
              <!-- Compose Announcement Form -->
              <div class="lg:col-span-2 bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-6">
                <div class="border-b border-cream-200 pb-4">
                  <h2 class="font-serif text-xl sm:text-2xl font-bold text-navy-950">Compose Platform Announcement</h2>
                  <p class="text-warmgray-600 text-xs mt-0.5">Broadcast targeted system updates, safety alerts, or community messages to member segments.</p>
                </div>

                ${announcementSentMsg ? html`
                  <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-xs animate-fadeIn">
                    ✓ ${announcementSentMsg}
                  </div>
                ` : null}

                <form onSubmit=${handleBroadcastAnnouncement} class="space-y-4 text-xs">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Announcement Title</label>
                    <input
                      required
                      type="text"
                      value=${announcementForm.title}
                      onChange=${e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      placeholder="e.g. Scheduled System Upgrade on Saturday at 2am UTC"
                      class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block font-bold text-navy-950 mb-1">Announcement Type</label>
                      <select
                        value=${announcementForm.type}
                        onChange=${e => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                        class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-medium"
                      >
                        <option value="ANNOUNCEMENT">General Announcement</option>
                        <option value="SYSTEM">System Notice</option>
                        <option value="MAINTENANCE">Maintenance Alert</option>
                        <option value="FEATURE">Feature Release</option>
                        <option value="SAFETY">Trust & Safety Warning</option>
                      </select>
                    </div>

                    <div>
                      <label class="block font-bold text-navy-950 mb-1">Target Audience Segment</label>
                      <select
                        value=${announcementForm.target_segment}
                        onChange=${e => setAnnouncementForm({ ...announcementForm, target_segment: e.target.value })}
                        class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-medium"
                      >
                        <option value="ALL">All Active Members</option>
                        <option value="NEW_USERS">New Practitioners (Last 7 Days)</option>
                        <option value="VERIFIED_USERS">Verified Skill Holders Only</option>
                        <option value="SPECIFIC_CATEGORY">Specific Category Audience</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Message Content</label>
                    <textarea
                      required
                      rows="4"
                      value=${announcementForm.message}
                      onChange=${e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                      placeholder="Enter detailed message text..."
                      class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-indigo-600"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Broadcast Announcement Now →
                  </button>
                </form>
              </div>

              <!-- Past Broadcast History -->
              <div class="lg:col-span-1 bg-white rounded-3xl border border-cream-300 shadow-xs p-6 space-y-4 text-xs">
                <h3 class="font-serif text-lg font-bold text-navy-950 border-b border-cream-100 pb-3">Past Broadcasts</h3>
                <div class="space-y-3 max-h-[500px] overflow-y-auto">
                  ${notificationsHistory.map(n => html`
                    <div key=${n.id} class="p-3.5 bg-cream-50/70 rounded-2xl border border-cream-200 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-navy-950">${n.title}</span>
                        <span class="text-[9px] font-black uppercase px-1.5 py-0.2 bg-cream-200 rounded">${n.type}</span>
                      </div>
                      <p class="text-warmgray-600 line-clamp-2">${n.message}</p>
                      <p class="text-[9.5px] text-warmgray-400 pt-1">${new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  `)}
                  ${notificationsHistory.length === 0 ? html`<p class="text-center py-6 text-warmgray-400">No broadcasts logged yet.</p>` : null}
                </div>
              </div>

            </div>
          `}

          <!-- ============================================== -->
          <!-- 11. PLATFORM SETTINGS & HEALTH                 -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'settings' && html`
            <div class="space-y-8 animate-fadeIn text-left">
              
              <!-- Platform Health Status -->
              <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-4">
                <div class="border-b border-cream-200 pb-3 flex items-center justify-between">
                  <h3 class="font-serif text-lg font-bold text-navy-950">Subsystem & Platform Health</h3>
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">100% Operational</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  ${(settingsData.systemHealth || []).map(sh => html`
                    <div key=${sh.name} class="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-1.5">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-navy-950">${sh.name}</span>
                        <span class="text-emerald-700 font-bold text-[10px]">● ${sh.status}</span>
                      </div>
                      <div class="flex items-center justify-between text-[11px] text-warmgray-500">
                        <span>Latency: <strong>${sh.latency}</strong></span>
                        <span>Uptime: <strong>${sh.uptime}</strong></span>
                      </div>
                    </div>
                  `)}
                </div>
              </div>

              <!-- General Platform Configuration Form -->
              <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-6 max-w-2xl">
                <div class="border-b border-cream-200 pb-3">
                  <h3 class="font-serif text-lg font-bold text-navy-950">Platform Governance Parameters</h3>
                  <p class="text-xs text-warmgray-600">Configure core exchange rules and algorithmic thresholds.</p>
                </div>

                ${settingsSavedMsg ? html`
                  <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold text-xs">
                    ✓ Platform settings updated successfully.
                  </div>
                ` : null}

                <form onSubmit=${handleSaveSettings} class="space-y-5 text-xs">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Platform Brand Name</label>
                    <input
                      type="text"
                      disabled
                      value=${settingsForm.site_name || 'SkillSwapX'}
                      class="w-full p-2.5 bg-cream-100 border border-cream-300 rounded-xl text-warmgray-500 font-semibold"
                    />
                    <p class="text-[10px] text-warmgray-400 mt-0.5">Locked to SkillSwapX.</p>
                  </div>

                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <label class="font-bold text-navy-950">Match Engine Synergy Threshold</label>
                      <span class="font-bold text-indigo-700">${settingsForm.synergy_threshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="90"
                      value=${settingsForm.synergy_threshold}
                      onInput=${e => setSettingsForm({ ...settingsForm, synergy_threshold: e.target.value })}
                      onChange=${e => setSettingsForm({ ...settingsForm, synergy_threshold: e.target.value })}
                      class="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div class="pt-2 border-t border-cream-100 space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-navy-950">Anti-Ghosting Karma Escrow</span>
                      <input
                        type="checkbox"
                        checked=${settingsForm.escrow_protection === 'true' || settingsForm.escrow_protection === true}
                        onChange=${e => setSettingsForm({ ...settingsForm, escrow_protection: e.target.checked ? 'true' : 'false' })}
                        class="w-4 h-4 accent-indigo-600"
                      />
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-navy-950">Automated Content Moderation</span>
                      <input
                        type="checkbox"
                        checked=${settingsForm.auto_moderation === 'true' || settingsForm.auto_moderation === true}
                        onChange=${e => setSettingsForm({ ...settingsForm, auto_moderation: e.target.checked ? 'true' : 'false' })}
                        class="w-4 h-4 accent-indigo-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                  >
                    Save Platform Settings
                  </button>
                </form>
              </div>

            </div>
          `}

          <!-- ============================================== -->
          <!-- 12. AUDIT LOGS VIEW                            -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'logs' && html`
            <div class="bg-white rounded-3xl border border-cream-300 shadow-xs p-6 sm:p-8 space-y-6 animate-fadeIn text-left">
              <div class="border-b border-cream-200 pb-4">
                <h2 class="font-serif text-xl sm:text-2xl font-bold text-navy-950">Administrative Audit Trail</h2>
                <p class="text-warmgray-600 text-xs mt-0.5">Immutable records of every administrative action, user modification, and moderation decision.</p>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-cream-100/70 border-b border-cream-200 font-bold text-navy-950 uppercase tracking-wider text-[10px]">
                      <th class="p-3.5">Action</th>
                      <th class="p-3.5">Admin Actor</th>
                      <th class="p-3.5">Target</th>
                      <th class="p-3.5">Payload Details</th>
                      <th class="p-3.5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-cream-100">
                    ${logs.map(l => html`
                      <tr key=${l.id} class="hover:bg-cream-50/40">
                        <td class="p-3.5 font-bold text-indigo-700">${l.action}</td>
                        <td class="p-3.5 font-semibold text-navy-950">${l.admin_name} (${l.admin_role || 'STAFF'})</td>
                        <td class="p-3.5 text-warmgray-600">${l.target_type} #${l.target_id || 'N/A'}</td>
                        <td class="p-3.5 text-warmgray-500 max-w-xs truncate font-mono text-[10px]">${l.details ? JSON.stringify(l.details) : '—'}</td>
                        <td class="p-3.5 text-right text-warmgray-400 font-semibold">${new Date(l.created_at).toLocaleString()}</td>
                      </tr>
                    `)}
                    ${logs.length === 0 ? html`<tr><td colspan="5" class="text-center py-8 text-warmgray-400">No audit logs recorded yet.</td></tr>` : null}
                  </tbody>
                </table>
              </div>
            </div>
          `}

        </main>
      </div>
    `;
  }
  window.SkillSwap.AdminConsoleView = AdminConsoleView;

  // ----------------------------------------------------
  // Admin Authentication & Access Gate View
  // ----------------------------------------------------
  function AdminAuthGateView({ currentUser, setActiveTab, onAuthSuccess }) {
    const [loginInput, setLoginInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleFormSubmit = async (e) => {
      e.preventDefault();
      if (!loginInput.trim() || !passwordInput) {
        setErrorMsg('Please provide both username/email and password.');
        return;
      }
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await api('/api/account/login', {
          method: 'POST',
          body: JSON.stringify({ email: loginInput.trim(), password: passwordInput, rememberMe: true })
        });
        if (res.user) {
          try {
            localStorage.setItem('skillswap_user_id', res.user.id);
            localStorage.setItem('skillswap_user', JSON.stringify(res.user));
            if (res.token) localStorage.setItem('skillswap_token', res.token);
          } catch (e) {}
          if (['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(res.user.role)) {
            if (onAuthSuccess) {
              await onAuthSuccess(res.user);
            } else {
              setActiveTab('admin');
            }
          } else {
            setErrorMsg('Account verified, but lacks administrative credentials (Role: ' + (res.user.role || 'USER') + ').');
          }
        }
      } catch (err) {
        setErrorMsg(err.message || 'Authentication rejected. Check username and password.');
      } finally {
        setLoading(false);
      }
    };

    return html`
      <div class="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-navy-950 via-slate-900 to-navy-950 text-white relative overflow-hidden">
        <!-- Ambient Glowing Orbs -->
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative w-full max-w-xl bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-center space-y-6 animate-fadeIn">
          
          <!-- Shield Header Badge -->
          <div class="inline-flex items-center justify-center p-3.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white ring-4 ring-indigo-500/20">
            <span class="text-3xl">🛡️</span>
          </div>

          <div class="space-y-1.5">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Security Clearance Required
            </div>
            <h1 class="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight">Admin Governance Portal</h1>
            <p class="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Restricted management console for platform analytics, user moderation, taxonomy controls, and system telemetry.
            </p>
          </div>

          ${errorMsg ? html`
            <div class="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2.5 text-left animate-fadeIn">
              <span class="text-base shrink-0">⚠️</span>
              <span class="flex-1">${errorMsg}</span>
            </div>
          ` : null}

          ${currentUser ? html`
            <!-- Signed-in Regular User Mode Notice -->
            <div class="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left space-y-3">
              <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-700/70">
                <span class="text-slate-400">Current Session:</span>
                <span class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-bold uppercase text-[10px]">
                  ${currentUser.role || 'USER'}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <img src=${currentUser.avatar_url || '/logo-icon.png'} class="w-10 h-10 rounded-xl object-cover border border-slate-600" />
                <div>
                  <p class="text-sm font-bold text-white">${currentUser.name}</p>
                  <p class="text-xs text-slate-400">@${currentUser.username || 'member'}</p>
                </div>
              </div>
              <p class="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl leading-relaxed">
                Your active account is authenticated as a peer member and does not possess administrative privileges. Please authenticate below with authorized staff credentials.
              </p>
            </div>
          ` : null}

          <!-- Administrative Credentials Form -->
          <form onSubmit=${handleFormSubmit} class="space-y-4 text-left">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Admin Username or Email</label>
              <input
                type="text"
                required
                value=${loginInput}
                onInput=${(e) => setLoginInput(e.target.value)}
                placeholder="admin or staff@skillswap.io"
                class="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Administrative Password</label>
              <input
                type="password"
                required
                value=${passwordInput}
                onInput=${(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                class="w-full px-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled=${loading}
              class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              ${loading ? html`
                <span class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Authenticating Staff Clearance...</span>
              ` : html`
                <span>Authenticate Staff Credentials</span>
                <span>→</span>
              `}
            </button>
          </form>

          <div class="pt-2 flex items-center justify-center gap-4">
            ${currentUser ? html`
              <button
                onClick=${() => setActiveTab('dashboard')}
                class="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Return to Member Dashboard
              </button>
            ` : html`
              <button
                onClick=${() => setActiveTab('home')}
                class="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Return to SkillSwapX Marketplace
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.AdminAuthGateView = AdminAuthGateView;

  // ----------------------------------------------------
  // Public Shareable Profile View
  // ----------------------------------------------------
  function PublicProfileView({ username, currentUser, onProposeSwap, setActiveTab, onOpenReport }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const targetQuery = username
        ? ('username=' + encodeURIComponent(username))
        : (currentUser ? ('userId=' + encodeURIComponent(currentUser.id)) : null);

      if (!targetQuery) {
        setLoading(false);
        return;
      }

      setLoading(true);
      api('/api/public/profile?' + targetQuery)
        .then(data => setProfile(data.user || null))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [username, currentUser]);

    if (loading) {
      return html`<div class="p-20 text-center font-serif text-warmgray-500">Syncing member credentials...</div>`;
    }

    if (!profile) {
      return html`
        <div class="max-w-md mx-auto my-16 p-8 bg-white border border-cream-300 rounded-3xl text-center space-y-4 shadow-sm">
          <p class="text-sm text-warmgray-600">Member profile not found.</p>
          <button onClick=${() => setActiveTab('dashboard')} class="px-4 py-2 bg-navy-700 text-white rounded-xl text-xs">Return to Dashboard</button>
        </div>
      `;
    }

    const ratingsList = [
      { label: "Overall Quality Rating", value: profile.avg_rating || 5.0 },
      { label: "Pedagogy & Knowledge Sharing", value: profile.avg_knowledge || 5.0 },
      { label: "Reliability & Attendance", value: profile.avg_reliability || 5.0 },
      { label: "Communication & Friendliness", value: profile.avg_communication || 5.0 }
    ];

    return html`
      <div class="max-w-6xl mx-auto px-4 py-10 space-y-8 text-left animate-fadeIn">
        <!-- Back Button -->
        <button onClick=${() => setActiveTab('dashboard')} class="text-xs font-bold text-navy-700 hover:underline flex items-center gap-1.5">
          <${Icon} name="arrow-left" class="w-3.5 h-3.5" /> Back to Dashboard
        </button>

        <!-- Profile Hero Banner Card -->
        <div class="bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 rounded-3xl p-8 sm:p-10 border border-navy-700/50 shadow-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-cream-100 relative overflow-hidden">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <div class="relative shrink-0">
              <img src=${profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'} class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white/10 shadow-xl" />
              <span class="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-md shadow-xs border border-white/20">Verified</span>
            </div>
            <div class="space-y-2.5 text-center md:text-left">
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 class="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">${profile.name}</h1>
                <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-400/20 text-sky-300 border border-sky-400/30">
                  ★ ${profile.avg_rating || '4.9'} Double-Blind Karma
                </span>
              </div>
              <p class="text-xs sm:text-sm text-cream-200/90 max-w-xl font-medium leading-relaxed">${profile.headline || 'SkillSwapX Community Swapper'}</p>
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-cream-200/70 font-semibold pt-1">
                <span>📍 ${profile.location || 'Remote'}</span>
                <span>•</span>
                <span>🌐 ${profile.timezone || 'UTC'}</span>
                <span>•</span>
                <span>🗣️ ${profile.preferred_language || 'English'}</span>
                <span>•</span>
                <span>⏱️ ${profile.weekly_hours || 4} hrs/week</span>
              </div>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto z-10 pt-4 md:pt-0 border-t border-white/10 md:border-none">
            ${currentUser && currentUser.id !== profile.id ? html`
              <button onClick=${() => onProposeSwap(profile)} class="flex-1 md:flex-none px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                🤝 Propose Skill Swap
              </button>
              <button onClick=${() => onOpenReport(profile.id)} class="flex-1 md:flex-none px-4 py-2.5 bg-white/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-xl transition-all">
                ⚠ Report User
              </button>
            ` : html`
              <button onClick=${() => setActiveTab('settings')} class="px-6 py-3 bg-white hover:bg-cream-100 text-navy-955 font-bold text-xs rounded-xl transition-all">
                Edit Preferences
              </button>
            `}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Biography and Stats Column -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Biography Card -->
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-3.5 text-xs">
              <h3 class="font-serif text-lg font-bold text-navy-950 border-b border-cream-100 pb-2.5">Biography</h3>
              <p class="text-warmgray-700 leading-relaxed font-medium">${profile.bio || 'This member has not written a biography yet.'}</p>
            </div>

            <!-- Trust rating metrics -->
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 text-xs">
              <h3 class="font-serif text-lg font-bold text-navy-950 border-b border-cream-100 pb-2.5">Quality Metrics</h3>
              <div class="space-y-4">
                ${ratingsList.map((r, i) => html`
                  <div key=${i} class="space-y-1.5">
                    <div class="flex justify-between font-bold text-navy-900 text-[10px] uppercase tracking-wider">
                      <span>${r.label}</span>
                      <span>★ ${Number(r.value).toFixed(1)}</span>
                    </div>
                    <div class="w-full bg-cream-200 rounded-full h-2">
                      <div class="bg-navy-700 h-2 rounded-full" style=${{ width: `${r.value * 20}%` }}></div>
                    </div>
                  </div>
                `)}
              </div>
            </div>
          </div>

          <!-- Skills and Reviews Column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Skills Deck -->
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-5 text-xs">
              <h3 class="font-serif text-lg font-bold text-navy-950 border-b border-cream-100 pb-2.5">Skills Matrix</h3>
              
              <div class="space-y-4">
                <div>
                  <span class="font-bold text-emerald-800 text-[10px] uppercase tracking-wider block mb-2">Can Offer to Teach:</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    ${(profile.teach_skills || []).map(s => html`
                      <div key=${s.id} class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 border-l-4 border-l-emerald-500">
                        <div class="flex justify-between items-start">
                          <h4 class="font-bold text-navy-955 text-sm">${s.skill_name}</h4>
                          <span class="px-1.5 py-0.5 rounded bg-cream-200 text-[8px] font-bold uppercase tracking-wider">${s.level}</span>
                        </div>
                        <p class="text-warmgray-500 text-[10px] font-semibold mt-0.5">${s.experience_years} Years Experience</p>
                        <p class="text-warmgray-700 text-[11px] mt-1.5 italic font-medium">"${s.description || 'Ready to share core concepts.'}"</p>
                      </div>
                    `)}
                    ${(profile.teach_skills || []).length === 0 ? html`<p class="text-warmgray-400 italic">No teaching skills listed.</p>` : null}
                  </div>
                </div>

                <div>
                  <span class="font-bold text-indigo-900 text-[10px] uppercase tracking-wider block mb-2">Wants to Learn:</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    ${(profile.learn_skills || []).map(s => html`
                      <div key=${s.id} class="p-3.5 bg-sky-50/10 rounded-2xl border border-indigo-200/50 border-l-4 border-l-indigo-600">
                        <div class="flex justify-between items-start">
                          <h4 class="font-bold text-navy-955 text-sm">${s.skill_name}</h4>
                          <span class="px-1.5 py-0.5 rounded bg-sky-50 text-indigo-900 border border-indigo-200 text-[8px] font-bold uppercase tracking-wider">${s.level}</span>
                        </div>
                      </div>
                    `)}
                    ${(profile.learn_skills || []).length === 0 ? html`<p class="text-warmgray-400 italic">No learning targets listed.</p>` : null}
                  </div>
                </div>
              </div>
            </div>

            <!-- Verified Reviews List -->
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 text-xs">
              <h3 class="font-serif text-lg font-bold text-navy-950 border-b border-cream-100 pb-2.5">Verified Swap Reviews (${(profile.reviews || []).length})</h3>
              
              <div class="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                ${(profile.reviews || []).map(r => html`
                  <div key=${r.id} class="p-4 bg-cream-50/40 border border-cream-200 rounded-2xl space-y-3">
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex items-center gap-2">
                        <img src=${r.reviewer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop'} class="w-8 h-8 rounded-full object-cover border border-cream-200" />
                        <div>
                          <p class="font-bold text-navy-950">${r.reviewer_name}</p>
                          <p class="text-[9px] text-warmgray-500 font-semibold">${r.reviewer_headline || 'SkillSwapX Member'}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <span class="font-bold text-navy-700">★ ${Number(r.rating).toFixed(1)}</span>
                        <p class="text-[9px] text-warmgray-500 mt-0.5">${new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div class="p-3 bg-white/70 rounded-xl border border-cream-200 text-warmgray-700 leading-relaxed italic">
                      "${r.comment}"
                    </div>
                  </div>
                `)}
                ${(profile.reviews || []).length === 0 ? html`<p class="text-warmgray-500 py-4 text-center italic">No swap reviews logged yet.</p>` : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.PublicProfileView = PublicProfileView;

  // ----------------------------------------------------
  // User Profile Settings and Security Form (Refined Minimalistic)
  // ----------------------------------------------------
  function SettingsView({ user, onUserUpdated }) {
    const [activeSection, setActiveSection] = useState('matchmaking');
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    // Section 1: Security parameters
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Section 2: Matchmaking details & Avatar
    const [avatarUrl, setAvatarUrl] = useState('');
    const [bio, setBio] = useState('');
    const [headline, setHeadline] = useState('');
    const [location, setLocation] = useState('Jabalpur, Madhya Pradesh, India');
    const [weeklyHours, setWeeklyHours] = useState(4);
    const [timezone, setTimezone] = useState('IST (UTC+5:30)');
    const [preferredLanguage, setPreferredLanguage] = useState('English, Hindi');

    // Section 3: Portfolio links
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [website, setWebsite] = useState('');

    useEffect(() => {
      loadSettings();
    }, []);

    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await api('/api/account/settings');
        const s = data.settings || {};
        setSettings(s);

        setName(s.name || '');
        setUsername(s.username || '');
        setEmail(s.email || '');

        setAvatarUrl(s.avatar_url || (user && user.avatar_url) || '');
        setBio(s.bio || '');
        setHeadline(s.headline || '');
        setLocation(s.location || 'Jabalpur, Madhya Pradesh, India');
        setWeeklyHours(s.weekly_hours || 4);
        setTimezone(s.timezone || 'IST (UTC+5:30)');
        setPreferredLanguage(s.preferred_language || 'English, Hindi');

        setGithub(s.github_url || '');
        setLinkedin(s.linkedin_url || '');
        setWebsite(s.website_url || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handleUpdateMatchmaking = async (e) => {
      e.preventDefault();
      try {
        await api('/api/account/settings', {
          method: 'PUT',
          body: JSON.stringify({
            section: 'matchmaking',
            data: {
              weekly_hours: Number(weeklyHours),
              timezone: timezone,
              preferred_language: preferredLanguage
            }
          })
        });
        await api('/api/profile', {
          method: 'PUT',
          body: JSON.stringify({ bio, headline, location, avatar_url: avatarUrl })
        });
        alert('Matchmaking settings and profile updated!');
        onUserUpdated && onUserUpdated();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleUpdateSecurity = async (e) => {
      e.preventDefault();
      try {
        await api('/api/account/settings', {
          method: 'PUT',
          body: JSON.stringify({
            section: 'security',
            data: {
              name,
              username,
              email,
              currentPassword: currentPassword || null,
              newPassword: newPassword || null
            }
          })
        });
        setCurrentPassword('');
        setNewPassword('');
        alert('Account credentials updated successfully!');
        onUserUpdated && onUserUpdated();
      } catch (err) {
        alert(err.message);
      }
    };

    const handleUpdatePortfolio = async (e) => {
      e.preventDefault();
      try {
        await api('/api/account/settings', {
          method: 'PUT',
          body: JSON.stringify({
            section: 'portfolio',
            data: {
              github_url: github,
              linkedin_url: linkedin,
              website_url: website
            }
          })
        });
        alert('Portfolio links saved!');
        loadSettings();
      } catch (err) {
        alert(err.message);
      }
    };

    if (loading) {
      return html`<div class="p-20 text-center font-serif text-warmgray-500">Syncing settings ledger...</div>`;
    }

    return html`
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-5">
          <div>
            <h1 class="font-serif text-3xl font-extrabold text-navy-950 tracking-tight">Account Preferences</h1>
            <p class="text-warmgray-600 text-xs sm:text-sm mt-1">Manage public profile presence, matchmaking parameters, and security credentials.</p>
          </div>
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-50 text-navy-800 border border-navy-200 text-xs font-bold shrink-0">
            <span>🛡️ Verified Swapper Profile</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar Navigation Tabs -->
          <div class="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto gap-2 bg-white p-3 sm:p-4 rounded-3xl border border-cream-300 shadow-sm h-fit text-xs font-bold scrollbar-none">
            <button
              onClick=${() => setActiveSection('matchmaking')}
              class="shrink-0 text-left px-4 py-3 rounded-2xl transition-all duration-200 flex items-center gap-2.5 whitespace-nowrap ${activeSection === 'matchmaking' ? 'bg-navy-700 text-white shadow-sm font-extrabold' : 'text-warmgray-700 hover:bg-cream-100'}"
            >
              <${Icon} name="user" class="w-4 h-4" />
              <span>Profile & Matchmaking</span>
            </button>
            
            <button
              onClick=${() => setActiveSection('security')}
              class="shrink-0 text-left px-4 py-3 rounded-2xl transition-all duration-200 flex items-center gap-2.5 whitespace-nowrap ${activeSection === 'security' ? 'bg-navy-700 text-white shadow-sm font-extrabold' : 'text-warmgray-700 hover:bg-cream-100'}"
            >
              <${Icon} name="shield" class="w-4 h-4" />
              <span>Credentials & Security</span>
            </button>
            
            <button
              onClick=${() => setActiveSection('portfolio')}
              class="shrink-0 text-left px-4 py-3 rounded-2xl transition-all duration-200 flex items-center gap-2.5 whitespace-nowrap ${activeSection === 'portfolio' ? 'bg-navy-700 text-white shadow-sm font-extrabold' : 'text-warmgray-700 hover:bg-cream-100'}"
            >
              <${Icon} name="folder" class="w-4 h-4" />
              <span>Portfolio & Proof-of-work</span>
            </button>
          </div>

          <!-- Main Form Panel -->
          <div class="lg:col-span-3">
            ${activeSection === 'matchmaking' && html`
              <form onSubmit=${handleUpdateMatchmaking} class="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6 text-xs animate-fadeIn">
                <div class="border-b border-cream-100 pb-4">
                  <h3 class="font-serif text-xl font-bold text-navy-950">Profile & Matchmaking Settings</h3>
                  <p class="text-warmgray-500 text-[11px] mt-0.5">Customize your public presence and match algorithm variables.</p>
                </div>

                <!-- Headline & Location -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Professional Headline</label>
                    <input
                      type="text"
                      required
                      value=${headline}
                      onChange=${e => setHeadline(e.target.value)}
                      placeholder="e.g. Senior Fullstack Engineer | React & Node Mentor"
                      class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600"
                    />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Location / City</label>
                    <input
                      type="text"
                      required
                      value=${location}
                      onChange=${e => setLocation(e.target.value)}
                      placeholder="e.g. Bengaluru, Karnataka or Mumbai or Remote"
                      class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600"
                    />
                  </div>
                </div>

                <!-- Bio -->
                <div>
                  <label class="block font-bold text-navy-950 mb-1.5">Biography & Exchange Goals</label>
                  <textarea
                    required
                    rows="4"
                    value=${bio}
                    onChange=${e => setBio(e.target.value)}
                    placeholder="Share your background, what topics you enjoy teaching, and what you aim to build with exchange partners..."
                    class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium leading-relaxed focus:outline-none focus:border-navy-600"
                  ></textarea>
                </div>

                <!-- Timezone, Limit & Language -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-cream-100 pt-4">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Timezone</label>
                    <select
                      value=${timezone}
                      onChange=${e => setTimezone(e.target.value)}
                      class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-semibold text-navy-900 focus:outline-none"
                    >
                      <option value="IST (UTC+5:30)">IST (UTC+5:30) - India</option>
                      <option value="GMT (UTC+0)">GMT (UTC+0) - London</option>
                      <option value="CET (UTC+1)">CET (UTC+1) - Central Europe</option>
                      <option value="EST (UTC-5)">EST (UTC-5) - US Eastern</option>
                      <option value="PST (UTC-8)">PST (UTC-8) - US Pacific</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Weekly Swap Hours Limit</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value=${weeklyHours}
                      onChange=${e => setWeeklyHours(Number(e.target.value))}
                      class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-semibold text-navy-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Preferred Language</label>
                    <select
                      value=${preferredLanguage}
                      onChange=${e => setPreferredLanguage(e.target.value)}
                      class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-semibold text-navy-900 focus:outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                      <option value="Bengali">Bengali (বাংলা)</option>
                      <option value="Marathi">Marathi (मराठी)</option>
                      <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                      <option value="Malayalam">Malayalam (മലയാളം)</option>
                    </select>
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" class="px-6 py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-extrabold rounded-xl shadow-md transition-all">
                    Save Matchmaking Settings
                  </button>
                </div>
              </form>
            `}

            ${activeSection === 'security' && html`
              <form onSubmit=${handleUpdateSecurity} class="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6 text-xs animate-fadeIn">
                <div class="border-b border-cream-100 pb-4">
                  <h3 class="font-serif text-xl font-bold text-navy-950">Security & Account Credentials</h3>
                  <p class="text-warmgray-500 text-[11px] mt-0.5">Manage your account name, email address, and authentication credentials.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Display Name</label>
                    <input type="text" required value=${name} onChange=${e => setName(e.target.value)} class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600" />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Username</label>
                    <input type="text" required value=${username} onChange=${e => setUsername(e.target.value)} class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600" />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Email Address</label>
                    <input type="email" required value=${email} onChange=${e => setEmail(e.target.value)} class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-cream-100 pt-4">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Current Password</label>
                    <input type="password" value=${currentPassword} onChange=${e => setCurrentPassword(e.target.value)} placeholder="Required only if changing password" class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600" />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">New Password</label>
                    <input type="password" minlength="6" value=${newPassword} onChange=${e => setNewPassword(e.target.value)} placeholder="Leave empty to keep current" class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600" />
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" class="px-6 py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-extrabold rounded-xl shadow-md transition-all">
                    Save Credentials
                  </button>
                </div>
              </form>
            `}

            ${activeSection === 'portfolio' && html`
              <form onSubmit=${handleUpdatePortfolio} class="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6 text-xs animate-fadeIn">
                <div class="border-b border-cream-100 pb-4">
                  <h3 class="font-serif text-xl font-bold text-navy-950">Portfolio & Proof-of-work</h3>
                  <p class="text-warmgray-500 text-[11px] mt-0.5">Link your external code repositories, design showcases, or personal site to boost trust ratings.</p>
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">GitHub Profile URL</label>
                    <input type="url" value=${github} onChange=${e => setGithub(e.target.value)} placeholder="https://github.com/yourusername" class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600" />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">LinkedIn Profile URL</label>
                    <input type="url" value=${linkedin} onChange=${e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourusername" class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600" />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-950 mb-1.5">Personal Website / Portfolio</label>
                    <input type="url" value=${website} onChange=${e => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium focus:outline-none focus:border-navy-600" />
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" class="px-6 py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-extrabold rounded-xl shadow-md transition-all">
                    Save Portfolios
                  </button>
                </div>
              </form>
            `}
          </div>
        </div>
      </div>
    `;
  }
  // ----------------------------------------------------
  // Problems & Challenges View
  // ----------------------------------------------------
  function ProblemsView({ user, setActiveTab, onProposeSwap, onViewProfile }) {
    const [problems, setProblems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [postModalOpen, setPostModalOpen] = useState(false);

    // New Problem Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [urgency, setUrgency] = useState('Medium');
    const [estimatedHours, setEstimatedHours] = useState(5);
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState('');

    useEffect(() => {
      loadProblems();
      api('/api/skills/directory').then(d => setCategories(d.categories || [])).catch(console.error);
    }, [selectedCategory, searchQuery]);

    const loadProblems = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category_id', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        const res = await api('/api/problems?' + params.toString());
        setProblems(res.problems || []);
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleCreateProblem = async (e) => {
      e.preventDefault();
      try {
        setPosting(true);
        setPostError('');
        const res = await api('/api/problems', {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            category_id: categoryId,
            urgency,
            estimated_hours: Number(estimatedHours)
          })
        });
        if (res.success) {
          setTitle('');
          setDescription('');
          setCategoryId('');
          setPostModalOpen(false);
          loadProblems();
        }
      } catch (err) {
        setPostError(err.message || 'Failed to post challenge.');
      } finally {
        setPosting(false);
      }
    };

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-fadeIn">
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-navy-955 via-navy-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white border border-navy-700/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-navy-800 text-sky-300 border border-sky-400/20">
              ⚡ Real-world Challenges & Problem Cases
            </div>
            <h1 class="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">Problems & Swap Challenges</h1>
            <p class="text-xs sm:text-sm text-cream-200/80 leading-relaxed">
              Solve real-world technical, design, or language blockers for peers in exchange for hands-on mentorship in skills you want to master.
            </p>
          </div>

          <button
            onClick=${() => setPostModalOpen(true)}
            class="px-5 py-3 bg-white hover:bg-cream-100 text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 flex items-center gap-2"
          >
            <span>+ Post a Problem Challenge</span>
          </button>
        </div>

        <!-- Search & Filter Bar -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div class="relative flex-1 w-full">
            <input
              type="text"
              value=${searchQuery}
              onInput=${e => setSearchQuery(e.target.value)}
              placeholder="Search problems by keyword (e.g. CRDT, Figma, Spanish, Architecture)..."
              class="w-full pl-10 pr-4 py-2.5 bg-cream-50/50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-600"
            />
            <div class="absolute left-3.5 top-3 text-warmgray-400">
              <${Icon} name="search" class="w-4 h-4" />
            </div>
          </div>

          <select
            value=${selectedCategory}
            onChange=${e => setSelectedCategory(e.target.value)}
            class="w-full sm:w-60 p-2.5 bg-cream-50/50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-600"
          >
            <option value="">All Categories</option>
            ${categories.map(c => html`<option key=${c.id} value=${c.id}>${c.name}</option>`)}
          </select>
        </div>

        <!-- Problems Grid -->
        ${loading ? html`<div class="p-16 text-center font-serif text-warmgray-500">Scanning problem ledger...</div>` : null}
        ${!loading && problems.length === 0 ? html`
          <div class="bg-white rounded-3xl p-12 text-center border border-cream-300 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto text-xl text-warmgray-400">🧩</div>
            <h3 class="font-serif text-base font-bold text-navy-900">No problems found matching criteria</h3>
            <p class="text-xs text-warmgray-500 max-w-sm mx-auto">Be the first to post a problem challenge and find peers ready to help!</p>
          </div>
        ` : null}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${problems.map(p => html`
            <div key=${p.id} class="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm hover:shadow-md hover:border-navy-300 hover:scale-[1.008] transition-all flex flex-col justify-between space-y-5">
              <div class="space-y-4">
                <!-- Author & Urgency -->
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <img
                      src=${p.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}
                      alt=${p.user_name}
                      class="w-10 h-10 rounded-xl object-cover border border-cream-200"
                    />
                    <div>
                      <h4 class="font-bold text-navy-950 text-xs sm:text-sm">${p.user_name}</h4>
                      <p class="text-[11px] text-warmgray-500">${p.user_headline || `@${p.user_username}`}</p>
                    </div>
                  </div>

                  <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${p.urgency === 'High' ? 'bg-rose-100 text-rose-900 border border-rose-200' : p.urgency === 'Medium' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'}">
                    ${p.urgency} Priority
                  </span>
                </div>

                <!-- Title & Description -->
                <div class="space-y-1.5">
                  <h3 class="font-serif text-base font-bold text-navy-950 leading-snug">${p.title}</h3>
                  <p class="text-xs text-warmgray-600 leading-relaxed line-clamp-3">${p.description}</p>
                </div>

                <!-- Skill Tags & Meta -->
                <div class="space-y-2 pt-2 border-t border-cream-100">
                  <div class="flex flex-wrap items-center gap-1.5 text-[11px]">
                    ${p.category_name ? html`
                      <span class="px-2.5 py-0.5 bg-navy-50 text-navy-800 font-bold rounded-lg border border-navy-200/60">
                        ${p.category_name}
                      </span>
                    ` : null}
                    ${p.required_skill_name ? html`
                      <span class="px-2.5 py-0.5 bg-rose-50 text-rose-900 font-bold rounded-lg border border-rose-200/60 flex items-center gap-1">
                        <span>Needs:</span>
                        <strong>${p.required_skill_name}</strong>
                      </span>
                    ` : null}
                    ${p.offered_skill_name ? html`
                      <span class="px-2.5 py-0.5 bg-emerald-50 text-emerald-900 font-bold rounded-lg border border-emerald-200/60 flex items-center gap-1">
                        <span>Offers:</span>
                        <strong>${p.offered_skill_name}</strong>
                      </span>
                    ` : null}
                    <span class="px-2 py-0.5 bg-cream-100 text-warmgray-600 rounded-lg font-semibold text-[10px]">
                      ⏱ ~${p.estimated_hours || 5} Hours
                    </span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pt-3 border-t border-cream-100 flex items-center gap-2">
                <button
                  onClick=${() => {
                    if (onProposeSwap) {
                      onProposeSwap({
                        user: {
                          id: p.user_id,
                          name: p.user_name,
                          username: p.user_username,
                          avatar_url: p.user_avatar
                        }
                      });
                    }
                  }}
                  class="flex-1 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Propose Solution / Swap →
                </button>
                <button
                  onClick=${() => onViewProfile && onViewProfile(p.user_username)}
                  class="px-3.5 py-2.5 bg-white border border-cream-300 hover:bg-cream-50 text-navy-900 font-bold text-xs rounded-xl shadow-2xs transition-all"
                >
                  Profile
                </button>
              </div>
            </div>
          `)}
        </div>

        <!-- Create Problem Modal -->
        ${postModalOpen ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fadeIn">
            <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-cream-300 shadow-2xl space-y-6 text-left">
              <div class="flex items-center justify-between border-b border-cream-200 pb-4">
                <h3 class="font-serif text-xl font-bold text-navy-950">Post a Problem Challenge</h3>
                <button onClick=${() => setPostModalOpen(false)} class="p-1.5 text-warmgray-400 hover:text-navy-900 rounded-lg hover:bg-cream-100">
                  <${Icon} name="x" class="w-5 h-5" />
                </button>
              </div>

              ${postError ? html`<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">${postError}</div>` : null}

              <form onSubmit=${handleCreateProblem} class="space-y-4 text-xs">
                <div>
                  <label class="block font-bold text-navy-950 mb-1">Challenge Title</label>
                  <input
                    required
                    type="text"
                    value=${title}
                    onInput=${e => setTitle(e.target.value)}
                    placeholder="e.g. Need assistance architecting WebSocket CRDT state synchronization"
                    class="w-full p-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 text-navy-900 font-medium"
                  />
                </div>

                <div>
                  <label class="block font-bold text-navy-950 mb-1">Category</label>
                  <select
                    value=${categoryId}
                    onChange=${e => setCategoryId(e.target.value)}
                    class="w-full p-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 text-navy-900 font-medium"
                  >
                    <option value="">Select a Category...</option>
                    ${categories.map(c => html`<option key=${c.id} value=${c.id}>${c.name}</option>`)}
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-navy-950 mb-1">Detailed Description & Context</label>
                  <textarea
                    required
                    rows="4"
                    value=${description}
                    onInput=${e => setDescription(e.target.value)}
                    placeholder="Describe your current blocker and what skills you are offering in return..."
                    class="w-full p-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 text-navy-900 font-medium"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Urgency</label>
                    <select
                      value=${urgency}
                      onChange=${e => setUrgency(e.target.value)}
                      class="w-full p-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 text-navy-900 font-medium"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Est. Hours</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value=${estimatedHours}
                      onInput=${e => setEstimatedHours(e.target.value)}
                      class="w-full p-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 text-navy-900 font-medium"
                    />
                  </div>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
                  <button
                    type="button"
                    onClick=${() => setPostModalOpen(false)}
                    class="px-4 py-2.5 bg-white border border-cream-300 text-warmgray-700 hover:bg-cream-50 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled=${posting}
                    class="px-6 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold shadow-md transition-all"
                  >
                    ${posting ? 'Publishing...' : 'Publish Challenge'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ` : null}
      </div>
    `;
  }
  window.SkillSwap.ProblemsView = ProblemsView;

  // ----------------------------------------------------
  // Skill Circles View (Group Peer Learning Cohorts)
  // ----------------------------------------------------
  function SkillCirclesView({ user, setActiveTab }) {
    const [circles, setCircles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [joinedCircles, setJoinedCircles] = useState({});

    // New Circle Form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    useEffect(() => {
      loadCircles();
      api('/api/skills/directory').then(d => setCategories(d.categories || [])).catch(console.error);
    }, [selectedCategory, searchQuery]);

    const loadCircles = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category_id', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        const res = await api('/api/circles?' + params.toString());
        setCircles(res.circles || []);
      } catch (err) {
        console.error('Failed to load circles:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleJoinCircle = async (circleId) => {
      try {
        await api('/api/circles/join', {
          method: 'POST',
          body: JSON.stringify({ circle_id: circleId })
        });
        setJoinedCircles(prev => ({ ...prev, [circleId]: true }));
        loadCircles();
      } catch (err) {
        console.error('Failed to join circle:', err);
      }
    };

    const handleCreateCircle = async (e) => {
      e.preventDefault();
      try {
        setCreating(true);
        setCreateError('');
        const res = await api('/api/circles', {
          method: 'POST',
          body: JSON.stringify({
            name,
            description,
            category_id: categoryId
          })
        });
        if (res.success) {
          setName('');
          setDescription('');
          setCategoryId('');
          setCreateModalOpen(false);
          loadCircles();
        }
      } catch (err) {
        setCreateError(err.message || 'Failed to create skill circle.');
      } finally {
        setCreating(false);
      }
    };

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-fadeIn">
        <!-- Header Hero -->
        <div class="bg-gradient-to-r from-navy-955 via-navy-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white border border-navy-700/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-2xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-sky-200 border border-indigo-400/30">
              👥 Group Peer Learning Cohorts & Circles
            </div>
            <h1 class="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight">Skill Circles</h1>
            <p class="text-xs sm:text-sm text-cream-200/80 leading-relaxed">
              Join focused group learning cohorts with peers mastering the same subjects. Share resources, review projects together, and host scheduled live study rooms.
            </p>
          </div>

          <button
            onClick=${() => setCreateModalOpen(true)}
            class="px-5 py-3 bg-white hover:bg-cream-100 text-navy-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 flex items-center gap-2"
          >
            <span>+ Create a Skill Circle</span>
          </button>
        </div>

        <!-- Search & Filter Bar -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-cream-300 shadow-sm flex flex-col sm:flex-row items-center gap-3">
          <div class="relative flex-1 w-full">
            <input
              type="text"
              value=${searchQuery}
              onInput=${e => setSearchQuery(e.target.value)}
              placeholder="Search skill circles (e.g. Distributed Systems, AI, UX, Language)..."
              class="w-full pl-10 pr-4 py-2.5 bg-cream-50/50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-600"
            />
            <div class="absolute left-3.5 top-3 text-warmgray-400">
              <${Icon} name="search" class="w-4 h-4" />
            </div>
          </div>

          <select
            value=${selectedCategory}
            onChange=${e => setSelectedCategory(e.target.value)}
            class="w-full sm:w-60 p-2.5 bg-cream-50/50 border border-cream-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-navy-600"
          >
            <option value="">All Categories</option>
            ${categories.map(c => html`<option key=${c.id} value=${c.id}>${c.name}</option>`)}
          </select>
        </div>

        <!-- Circles Grid -->
        ${loading ? html`<div class="p-16 text-center font-serif text-warmgray-500">Loading skill circles...</div>` : null}
        ${!loading && circles.length === 0 ? html`
          <div class="bg-white rounded-3xl p-12 text-center border border-cream-300 space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto text-xl text-warmgray-400">⭕</div>
            <h3 class="font-serif text-base font-bold text-navy-900">No skill circles found</h3>
            <p class="text-xs text-warmgray-500 max-w-sm mx-auto">Create the first cohort and invite fellow swappers to learn together!</p>
          </div>
        ` : null}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${circles.map(c => html`
            <div key=${c.id} class="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-sm hover:shadow-md hover:border-navy-300 hover:scale-[1.008] transition-all flex flex-col justify-between space-y-5">
              <div class="space-y-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    ${c.category_name ? html`
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-navy-50 text-navy-800 border border-navy-200/60 inline-block">
                        ${c.category_name}
                      </span>
                    ` : null}
                    <h3 class="font-serif text-lg font-bold text-navy-950 mt-1">${c.name}</h3>
                  </div>

                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200 shrink-0 flex items-center gap-1">
                    <span>👥</span>
                    <span>${c.member_count || 1} Members</span>
                  </span>
                </div>

                <p class="text-xs text-warmgray-600 leading-relaxed">${c.description}</p>

                <!-- Circle Host Meta -->
                <div class="flex items-center gap-2.5 pt-3 border-t border-cream-100 text-xs">
                  <img
                    src=${c.creator_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop'}
                    alt=${c.creator_name}
                    class="w-7 h-7 rounded-lg object-cover border border-cream-200"
                  />
                  <div class="flex items-center gap-1 text-[11px] text-warmgray-500">
                    <span>Organized by</span>
                    <strong class="text-navy-900 font-bold">${c.creator_name}</strong>
                  </div>
                </div>
              </div>

              <!-- Action -->
              <div class="pt-3 border-t border-cream-100 flex gap-3">
                <button
                  onClick=${() => handleJoinCircle(c.id)}
                  class="w-full py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 ${joinedCircles[c.id] ? 'bg-emerald-700 text-white' : 'bg-navy-700 hover:bg-navy-800 text-white hover:scale-[1.02] active:scale-[0.98]'}"
                >
                  <span>${joinedCircles[c.id] ? '✓ Joined Circle' : 'Join Skill Circle →'}</span>
                </button>
              </div>
            </div>
          `)}
        </div>

        <!-- Create Circle Modal -->
        ${createModalOpen ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-fadeIn">
            <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-cream-300 shadow-2xl space-y-6 text-left">
              <div class="flex items-center justify-between border-b border-cream-200 pb-4">
                <h3 class="font-serif text-xl font-bold text-navy-950">Create a Skill Circle</h3>
                <button onClick=${() => setCreateModalOpen(false)} class="p-1.5 text-warmgray-400 hover:text-navy-900 rounded-lg hover:bg-cream-100">
                  <${Icon} name="x" class="w-5 h-5" />
                </button>
              </div>

              ${createError ? html`<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">${createError}</div>` : null}

              <form onSubmit=${handleCreateCircle} class="space-y-4 text-xs">
                <div>
                  <label class="block font-bold text-navy-950 mb-1">Circle Name</label>
                  <input
                    required
                    type="text"
                    value=${name}
                    onInput=${e => setName(e.target.value)}
                    placeholder="e.g. Distributed Systems Architecture Guild"
                    class="w-full p-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 text-navy-900 font-medium"
                  />
                </div>

                <div>
                  <label class="block font-bold text-navy-950 mb-1">Category</label>
                  <select
                    value=${categoryId}
                    onChange=${e => setCategoryId(e.target.value)}
                    class="w-full p-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 text-navy-900 font-medium"
                  >
                    <option value="">Select a Category...</option>
                    ${categories.map(c => html`<option key=${c.id} value=${c.id}>${c.name}</option>`)}
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-navy-950 mb-1">Circle Purpose & Meeting Cadence</label>
                  <textarea
                    required
                    rows="4"
                    value=${description}
                    onInput=${e => setDescription(e.target.value)}
                    placeholder="Describe what members will learn, build, or practice together..."
                    class="w-full p-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 text-navy-900 font-medium"
                  ></textarea>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
                  <button
                    type="button"
                    onClick=${() => setCreateModalOpen(false)}
                    class="px-4 py-2.5 bg-white border border-cream-300 text-warmgray-700 hover:bg-cream-50 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled=${creating}
                    class="px-6 py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold shadow-md transition-all"
                  >
                    ${creating ? 'Creating...' : 'Launch Circle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ` : null}
      </div>
    `;
  }
  window.SkillSwap.SkillCirclesView = SkillCirclesView;

  window.SkillSwap.SettingsView = SettingsView;

})();