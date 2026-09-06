// public/views_app.js - Premium Application Views (Enhanced UI/UX after Login)

(function() {
  window.SkillSwap = window.SkillSwap || {};

  const React = window.React;
  const htm = window.htm || self.htm;
  if (!React || !htm) return;

  const { useState, useEffect, useMemo } = React;
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
          <div class="bg-gradient-to-br from-navy-800 via-navy-900 to-navy-955 rounded-3xl p-8 border border-navy-700/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-cream-100 relative overflow-hidden">
            <div class="absolute -right-16 -top-16 w-48 h-48 bg-navy-600/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div class="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4.5 relative z-10">
              <div class="relative shrink-0">
                <img src=${user.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop'} alt=${user.name} class="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl object-cover ring-4 ring-navy-600/30 border-2 border-white/20 shadow-xl" />
                <span class="absolute -bottom-1 -right-1 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-full shadow-md border-2 border-navy-900 flex items-center gap-0.5">
                  <span>✓</span>
                  <span>Active</span>
                </span>
              </div>
              <div class="space-y-1.5">
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-navy-800 text-sky-300 border border-navy-700/80">
                    Verified Swapper · 4.9★ Karma
                  </span>
                </div>
                <h1 class="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Welcome back, ${user.name}! 👋
                </h1>
                <p class="text-xs sm:text-sm text-cream-200/80 max-w-xl leading-relaxed">
                  Offering <strong class="text-white">${teachCount} skills</strong> to teach and targeting <strong class="text-white">${learnCount} subjects</strong> to learn.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0 relative z-10 font-bold text-xs">
              <button onClick=${() => setActiveTab('matches')} class="px-5 py-3 bg-gradient-to-r from-navy-600 to-navy-700 hover:from-navy-700 hover:to-navy-800 text-white font-extrabold rounded-xl shadow-lg border border-navy-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                Discover Matches
              </button>
              <button onClick=${() => setActiveTab('skills')} class="px-4 py-3 bg-white hover:bg-cream-50 text-navy-900 border border-cream-200 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
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
                  <div key=${m.user.id} class="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md hover:border-navy-300 hover:scale-[1.01] transition-all duration-200">
                    <div class="space-y-4">
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex items-center gap-3">
                          <img src=${m.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} alt=${m.user.name} class="w-12 h-12 rounded-2xl object-cover border border-cream-200 shadow-sm" />
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
                    <div key=${w.id} onClick=${() => setActiveTab('workspaces')} class="p-6 bg-white rounded-3xl border border-cream-300 shadow-sm hover:border-navy-400 hover:shadow hover:scale-[1.01] transition-all duration-200 cursor-pointer space-y-4 border-l-4 border-l-navy-600">
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
                        <a href=${s.meeting_link} target="_blank" class="block text-center mt-2 py-1 bg-navy-700 text-white rounded font-bold text-[9px]">Join Meet</a>
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
                min="35"
                max="95"
                value=${minSynergy}
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
                <input type="range" min="0" max="15" step="0.5" value=${expYears} onChange=${e => setExpYears(Number(e.target.value))} class="w-full accent-navy-700 cursor-pointer" />
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
  // Requests View
  // ----------------------------------------------------
  function RequestsView({ onAcceptRequest }) {
    const [incoming, setIncoming] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
      loadRequests();
    }, []);

    const loadRequests = async () => {
      try {
        setLoading(true);
        const data = await api('/api/requests');
        setIncoming(data.incoming || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }

    };

    const handleAccept = async (reqId) => {
      await api('/api/requests/' + reqId + '/accept', { method: 'PUT' });
      loadRequests();
      onAcceptRequest && onAcceptRequest();
    };

    const handleReject = async (reqId) => {
      await api('/api/requests/' + reqId + '/reject', { method: 'PUT' });
      loadRequests();
    };

    return html`
      <div class="max-w-5xl mx-auto px-4 py-8 space-y-8 text-left animate-fadeIn">
        <div>
          <h1 class="font-serif text-3xl font-bold text-navy-900">Exchange Requests</h1>
          <p class="text-warmgray-600 text-xs sm:text-sm">Track and manage exchange proposals sent by compatible peers.</p>
        </div>

        <div class="bg-white rounded-3xl p-7 border border-cream-300 shadow-sm space-y-5 text-xs sm:text-sm">
          <h2 class="font-serif text-xl font-bold text-navy-955 pb-3 border-b border-cream-100">Incoming Swap Proposals (${incoming.length})</h2>
          ${loading ? html`<div class="p-6 text-center text-warmgray-500 font-serif">Checking proposal ledger...</div>` : null}
          ${!loading && incoming.length === 0 ? html`<p class="text-xs text-warmgray-500 py-6 text-center">No pending incoming requests at the moment.</p>` : null}
          
          <div class="space-y-4">
            ${incoming.map(r => html`
              <div key=${r.id} class="p-5 bg-cream-50/70 rounded-2xl border border-cream-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-sm hover:border-cream-300 transition-colors border-l-4 border-l-navy-600">
                <div class="space-y-2 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-navy-955 text-sm">${r.sender_name}</span>
                    <span class="px-2 py-0.5 rounded bg-navy-100 text-navy-900 font-bold text-[9px] uppercase tracking-wider">${r.cadence || 'Weekly'}</span>
                  </div>
                  <p class="text-xs text-warmgray-700 italic leading-relaxed bg-white/70 p-3 rounded-xl border border-cream-200">"${r.message}"</p>
                </div>

                ${r.status === 'PENDING' ? html`
                  <div class="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
                    <button onClick=${() => handleAccept(r.id)} class="flex-1 md:flex-none px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
                      Accept Swap
                    </button>
                    <button onClick=${() => handleReject(r.id)} class="flex-1 md:flex-none px-4 py-2.5 bg-white border border-cream-300 hover:bg-rose-50 text-rose-700 rounded-xl font-bold text-xs transition-all">
                      Decline
                    </button>
                  </div>
                ` : html`<span class="px-3 py-1 rounded bg-cream-200 font-bold text-xs text-navy-800">${r.status}</span>`}
              </div>
            `)}

          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.RequestsView = RequestsView;

  // ----------------------------------------------------
  // Workspace View (Checklist Card Indicators)
  // ----------------------------------------------------
  function WorkspaceView({ currentUser }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [sessions, setSessions] = useState([]);
    
    // Scheduler form state
    const [schedulerOpen, setSchedulerOpen] = useState(false);
    const [sessTitle, setSessTitle] = useState('');
    const [sessDate, setSessDate] = useState('');
    const [sessTime, setSessTime] = useState('');
    const [sessDuration, setSessDuration] = useState(60);
    const [sessLink, setSessLink] = useState('');
    const [sessAgenda, setSessAgenda] = useState('');
    const [sessTimezone, setSessTimezone] = useState('PST (UTC-8)');

    useEffect(() => {
      loadWorkspaces();
    }, []);

    const loadWorkspaces = async () => {

      api('/api/workspaces').then(data => {
        setWorkspaces(data.workspaces || []);
        if (data.workspaces && data.workspaces[0]) {
          loadWorkspaceDetails(data.workspaces[0].id);
        }
      }).catch(console.error);
    };


    const loadWorkspaceDetails = async (id) => {
      const data = await api('/api/workspaces/' + id);
      setActiveWorkspace(data.workspace);
      api('/api/sessions?workspace_id=' + id).then(sData => {
        setSessions(sData.sessions || []);
      }).catch(console.error);

    };

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
      } catch (err) {
        alert(err.message);
      }
    };

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-300 pb-5">
          <div>
            <h1 class="font-serif text-3xl font-bold text-navy-900">Exchange Workspace</h1>
            <p class="text-warmgray-600 text-xs sm:text-sm">Review milestone checklists and schedule practice meetings with your partner.</p>
          </div>

          ${workspaces.length > 1 ? html`
            <select onChange=${e => loadWorkspaceDetails(Number(e.target.value))} class="p-2.5 bg-white border border-cream-300 rounded-xl text-xs font-semibold text-navy-900">
              ${workspaces.map(w => html`<option key=${w.id} value=${w.id}>${w.title}</option>`)}
            </select>
          ` : null}
        </div>

        ${!activeWorkspace ? html`
          <div class="bg-white p-14 rounded-3xl border border-cream-300 text-center space-y-3.5 shadow-sm">
            <p class="text-sm text-warmgray-600">No active exchange workspaces yet. Connect with a peer or accept a request to launch a workspace.</p>
          </div>
        ` : html`
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Sidebar: Details and Sessions -->
            <div class="space-y-6">
              <!-- Workspace Agreement -->
              <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4.5 text-xs border-l-4 border-l-navy-600">
                <h3 class="font-serif text-lg font-bold text-navy-955 pb-2 border-b border-cream-100">Exchange Agreement</h3>
                
                <div class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2.5">
                  <div class="flex justify-between font-semibold">
                    <span class="text-warmgray-500">Learning Partner:</span>
                    <span class="text-navy-900">${activeWorkspace.partner_name || 'Active Peer'}</span>
                  </div>
                  <div class="flex justify-between font-semibold">
                    <span class="text-warmgray-500">Frequency:</span>
                    <span class="text-navy-900">Weekly (1-2 hrs)</span>
                  </div>
                  <div class="flex justify-between font-semibold">
                    <span class="text-warmgray-500">Duration Limit:</span>

                    <span class="text-navy-900">4 Weeks</span>
                  </div>
                </div>

                <div class="space-y-2 pt-2">
                  <div class="flex justify-between font-bold text-[10px] text-navy-900 uppercase tracking-wider">
                    <span>Agreement Progress</span>
                    <span>${activeWorkspace.progress || 35}%</span>
                  </div>
                  <div class="w-full bg-cream-200 rounded-full h-2 shadow-inner">
                    <div class="bg-gradient-to-r from-navy-600 to-navy-800 h-2 rounded-full transition-all duration-300" style=${{ width: `${activeWorkspace.progress || 35}%` }}></div>
                  </div>
                </div>
              </div>

              <!-- Scheduled Sessions Panel -->
              <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4.5 text-xs">
                <div class="flex items-center justify-between border-b border-cream-100 pb-2.5">
                  <h3 class="font-serif text-lg font-bold text-navy-955">Practice Sessions</h3>
                  <button onClick=${() => setSchedulerOpen(true)} class="text-[10px] font-bold text-navy-700 hover:text-navy-900 flex items-center gap-1">
                    + Schedule
                  </button>
                </div>

                ${sessions.length === 0 ? html`
                  <p class="text-warmgray-500 text-[11px] py-4 text-center">No practice sessions booked yet.</p>
                ` : html`
                  <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
                    ${sessions.map(s => html`
                      <div key=${s.id} class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 border-l-4 border-l-navy-600">
                        <div class="flex justify-between items-start gap-1">
                          <h4 class="font-bold text-navy-900 text-xs">${s.title}</h4>
                          <span class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-navy-200 text-navy-800">${s.duration_minutes} min</span>
                        </div>
                        <div class="text-[10px] text-warmgray-600 font-semibold space-y-0.5">
                          <p>📅 ${new Date(s.session_date).toLocaleString()}</p>
                          <p>👤 Proposer: ${s.proposer_name}</p>
                        </div>
                        ${s.meeting_link ? html`
                          <a href=${s.meeting_link} target="_blank" class="block text-center mt-2 px-3 py-1.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-lg text-[10px] shadow-sm hover:scale-[1.02] transition-transform">
                            Join Meeting link 🔗
                          </a>
                        ` : null}
                      </div>
                    `)}
                  </div>
                `}
              </div>
            </div>

            <!-- Tasks check-lists -->
            <div class="lg:col-span-2 space-y-6">
              <div class="bg-white p-7 rounded-3xl border border-cream-300 shadow-sm space-y-5 text-xs">
                <div class="flex items-center justify-between border-b border-cream-100 pb-3">
                  <h3 class="font-serif text-xl font-bold text-navy-950">Learning Action Tasks</h3>
                  <span class="text-xs font-bold text-warmgray-500 bg-cream-100 px-3 py-1 rounded-full">
                    ${(activeWorkspace.tasks || []).filter(t => t.status === 'COMPLETED').length}/${(activeWorkspace.tasks || []).length} Completed
                  </span>

                </div>

                <form onSubmit=${handleAddTask} class="flex gap-2">
                  <input
                    type="text"
                    required
                    value=${newTaskTitle}
                    onChange=${e => setNewTaskTitle(e.target.value)}
                    placeholder="Enter practice task title..."
                    class="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-medium text-navy-900"
                  />
                  <button type="submit" class="px-6 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-sm transition-colors shrink-0">Add Task</button>
                </form>

                <div class="space-y-2.5 pt-2">
                  ${(activeWorkspace.tasks || []).map(t => html`
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
            </div>
          </div>
        `}
        <!-- Scheduler Form Modal -->
        ${schedulerOpen ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-955/60 backdrop-blur-sm">
            <div class="bg-white rounded-3xl max-w-md w-full p-8 border border-cream-300 shadow-2xl space-y-5 text-left text-xs">
              <div class="flex items-center justify-between border-b border-cream-200 pb-3">
                <h3 class="font-serif font-bold text-lg text-navy-900">Schedule Practice Session</h3>
                <button onClick=${() => setSchedulerOpen(false)} class="p-1 text-warmgray-500 hover:bg-cream-100 rounded-lg"><${Icon} name="x" class="w-4 h-4" /></button>
              </div>

              <form onSubmit=${handleScheduleSession} class="space-y-4">
                <div>
                  <label class="block font-bold text-navy-955 mb-1">Session Title</label>
                  <input required type="text" value=${sessTitle} onChange=${e => setSessTitle(e.target.value)} placeholder="e.g. Python API Setup call" class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Date</label>
                    <input required type="date" value=${sessDate} onChange=${e => setSessDate(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-semibold text-navy-950" />
                  </div>
                  <div>
                    <label class="block font-bold text-navy-955 mb-1">Time</label>
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
                      <option value="PST (UTC-8)">PST (UTC-8)</option>
                      <option value="EST (UTC-5)">EST (UTC-5)</option>
                      <option value="GMT (UTC+0)">GMT (UTC+0)</option>
                      <option value="CET (UTC+1)">CET (UTC+1)</option>
                      <option value="IST (UTC+5:30)">IST (UTC+5:30)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block font-bold text-navy-955 mb-1">Video Meeting Link (Zoom, Meet, Teams)</label>
                  <input type="url" value=${sessLink} onChange=${e => setSessLink(e.target.value)} placeholder="https://meet.google.com/abc-defg-hij" class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl" />
                </div>

                <div>
                  <label class="block font-bold text-navy-955 mb-1">Agenda / Target Notes</label>
                  <textarea rows="3" value=${sessAgenda} onChange=${e => setSessAgenda(e.target.value)} placeholder="What will you practice in this session?" class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl"></textarea>
                </div>

                <button type="submit" class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-md transition-colors">
                  Propose & Book Session
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
  // Chat View
  // ----------------------------------------------------
  function ChatView({ currentUser }) {
    const [connections, setConnections] = useState([]);
    const [activeConn, setActiveConn] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');

    useEffect(() => {
      api('/api/messages').then(d => {
        setConnections(d.connections || []);
        if (d.connections && d.connections[0]) {
          selectConnection(d.connections[0]);
        }
      }).catch(console.error);
    }, []);

    const selectConnection = async (conn) => {
      setActiveConn(conn);
      const data = await api('/api/messages?connection_id=' + conn.id);
      setMessages(data.messages || []);
    };

    const handleSend = async (e) => {
      e.preventDefault();
      if (!newMsg.trim() || !activeConn) return;
      const text = newMsg;
      setNewMsg('');
      const res = await api('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ connection_id: activeConn.id, message: text })
      });
      setMessages(prev => [...prev, res.message]);
    };

    return html`
      <div class="max-w-7xl mx-auto px-4 py-8 text-left animate-fadeIn">
        <div class="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[600px]">
          <!-- Sidebar: conversations -->
          <div class="border-r border-cream-200 p-4 space-y-4 bg-cream-50/30">
            <h3 class="font-serif text-lg font-bold text-navy-955 px-2 flex items-center gap-2">
              <${Icon} name="message-square" class="w-5 h-5 text-navy-700" /> Direct Messages
            </h3>
            <div class="space-y-1.5">

              ${connections.map(c => html`
                <div
                  key=${c.id}
                  onClick=${() => selectConnection(c)}
                  class="p-3.5 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all border border-transparent ${activeConn && activeConn.id === c.id ? 'bg-cream-100/80 border-cream-300 shadow-sm border-l-4 border-l-navy-600' : 'hover:bg-cream-50'}"
                >
                  <img src=${c.partner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} class="w-10.5 h-10.5 rounded-xl object-cover border border-cream-200" />
                  <div class="text-xs truncate flex-1">
                    <p class="font-bold text-navy-900 truncate">${c.partner_name}</p>
                    <p class="text-warmgray-500 text-[11px] truncate mt-0.5 font-medium">${c.last_message || 'Start the conversation...'}</p>

                  </div>
                </div>
              `)}
            </div>
          </div>

          <!-- Chat logs panel -->
          <div class="md:col-span-2 flex flex-col justify-between p-6">
            ${activeConn ? html`
              <div class="flex items-center justify-between border-b border-cream-200 pb-3.5 mb-4">
                <div class="flex items-center gap-3">
                  <img src=${activeConn.partner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} class="w-9 h-9 rounded-xl object-cover border border-cream-200" />
                  <div>
                    <h4 class="font-bold text-navy-900 text-sm leading-snug">${activeConn.partner_name}</h4>
                    <span class="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Active swap</span>

                  </div>
                </div>
              </div>

              <!-- Message listing -->
              <div class="flex-1 overflow-y-auto space-y-3.5 p-3 text-xs min-h-[400px] max-h-[500px]">
                ${messages.map(m => {
                  const isMe = m.sender_id === (currentUser && currentUser.id);
                  return html`
                    <div key=${m.id} class="flex ${isMe ? 'justify-end' : 'justify-start'}">
                      <div class="max-w-xs sm:max-w-md p-3.5 rounded-2xl leading-relaxed font-medium shadow-sm ${isMe ? 'bg-navy-700 text-white rounded-br-none' : 'bg-cream-100/90 text-navy-955 rounded-bl-none'}">
                        ${m.message}
                      </div>
                    </div>
                  `;
                })}
              </div>

              <!-- Input form -->

              <form onSubmit=${handleSend} class="flex gap-2 pt-4 border-t border-cream-200">
                <input
                  type="text"
                  required
                  value=${newMsg}
                  onChange=${e => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  class="w-full px-4 py-3 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:border-navy-600 text-navy-900 font-medium"
                />
                <button type="submit" class="px-6 py-3 bg-navy-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0">
                  Send Message
                </button>
              </form>
            ` : html`
              <div class="h-full flex flex-col items-center justify-center text-warmgray-400 text-xs py-20 space-y-3">
                <div class="w-12 h-12 bg-cream-100 rounded-full flex items-center justify-center text-warmgray-500">
                  <${Icon} name="message-square" class="w-6 h-6" />
                </div>
                <p>Select a learning partner from the sidebar to begin swap discussions.</p>

              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.ChatView = ChatView;
  // ----------------------------------------------------
  // SkillSwapX Admin Panel (Enterprise Governance Suite)
  // ----------------------------------------------------
  function AdminConsoleView({ currentUser, setActiveTab, onViewProfile, onLogout }) {
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

    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
      loadDataForSection(activeNav);
    }, [activeNav]);

    const loadDataForSection = async (section) => {
      try {
        setLoading(true);
        if (section === 'overview') {
          const data = await api('/api/admin');
          setAnalytics(data.analytics || null);
          setReports(data.recentReports || []);
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
          setExchangesData(data);
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
          setCommunityData(data);
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
          setSettingsData(data);
          if (data.settings) setSettingsForm(prev => ({ ...prev, ...data.settings }));
        } else if (section === 'logs') {
          const data = await api('/api/admin/logs');
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error('Error loading admin section data:', err);
      } finally {
        setLoading(false);
      }
    };

    // User actions
    const handleUpdateUserStatus = async (userId, newStatus) => {
      if (!confirm(`Are you sure you want to change user status to ${newStatus}?`)) return;
      await api('/api/admin/users', { method: 'PUT', body: JSON.stringify({ userId, status: newStatus }) });
      loadDataForSection('users');
    };

    const handleUpdateUserRole = async (userId, newRole) => {
      if (!confirm(`Are you sure you want to change user role to ${newRole}?`)) return;
      await api('/api/admin/users', { method: 'PUT', body: JSON.stringify({ userId, role: newRole }) });
      loadDataForSection('users');
    };

    const handleDeleteUser = async (userId) => {
      if (!confirm('Permanently delete this user and all associated data? This action cannot be undone.')) return;
      await api('/api/admin/users?userId=' + userId, { method: 'DELETE' });
      setSelectedUserDetail(null);
      loadDataForSection('users');
    };

    // Skill & Category actions
    const handleCreateSkill = async (e) => {
      e.preventDefault();
      if (!newSkillForm.name || !newSkillForm.category_id) return;
      await api('/api/admin/skills', { method: 'POST', body: JSON.stringify(newSkillForm) });
      setNewSkillModal(false);
      setNewSkillForm({ name: '', category_id: '', description: '', is_popular: false, is_trending: false });
      loadDataForSection('skills');
    };

    const handleToggleSkillFlag = async (skill, flagName) => {
      const updatedValue = !skill[flagName];
      await api('/api/admin/skills', { method: 'PUT', body: JSON.stringify({ id: skill.id, [flagName]: updatedValue }) });
      loadDataForSection('skills');
    };

    const handleDeleteSkill = async (skillId) => {
      if (!confirm('Are you sure you want to delete this skill?')) return;
      await api('/api/admin/skills?id=' + skillId, { method: 'DELETE' });
      loadDataForSection('skills');
    };

    const handleCreateCategory = async (e) => {
      e.preventDefault();
      if (!newCatForm.name) return;
      await api('/api/admin/categories', { method: 'POST', body: JSON.stringify(newCatForm) });
      setNewCatModal(false);
      setNewCatForm({ name: '', description: '', icon: 'Sparkles', is_featured: false });
      loadDataForSection('skills');
    };

    const handleDeleteCategory = async (catId) => {
      if (!confirm('Delete this category? Associated skills will also be detached.')) return;
      await api('/api/admin/categories?id=' + catId, { method: 'DELETE' });
      loadDataForSection('skills');
    };

    // Report Actions
    const handleResolveReport = async (e) => {
      e.preventDefault();
      if (!selectedReport) return;
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
      loadDataForSection('reports');
    };

    const handleDismissReport = async (reportId) => {
      const reason = prompt('Enter dismissal reason (e.g. False report / Insufficient evidence):');
      if (reason === null) return;
      await api('/api/admin/reports', {
        method: 'PUT',
        body: JSON.stringify({ report_id: reportId, status: 'DISMISSED', resolution_notes: reason })
      });
      setSelectedReport(null);
      loadDataForSection('reports');
    };

    // Verification Actions
    const handleProcessVerification = async (verifId, status) => {
      const notes = prompt(`Enter notes for ${status.toLowerCase()} status:`) || '';
      await api('/api/admin/verifications', {
        method: 'PUT',
        body: JSON.stringify({ id: verifId, status, admin_notes: notes })
      });
      loadDataForSection('verification');
    };

    // Review Actions
    const handleToggleReviewFlag = async (review) => {
      const willFlag = !review.is_flagged;
      const reason = willFlag ? prompt('Reason for flagging review:') || 'Suspicious rating pattern' : '';
      await api('/api/admin/reviews', {
        method: 'PUT',
        body: JSON.stringify({ id: review.id, is_flagged: willFlag, flag_reason: reason })
      });
      loadDataForSection('reviews');
    };

    const handleDeleteReview = async (reviewId) => {
      if (!confirm('Permanently remove this review?')) return;
      await api('/api/admin/reviews?id=' + reviewId, { method: 'DELETE' });
      loadDataForSection('reviews');
    };

    // Announcement Broadcast
    const handleBroadcastAnnouncement = async (e) => {
      e.preventDefault();
      if (!announcementForm.title || !announcementForm.message) return;
      const res = await api('/api/admin/notifications', { method: 'POST', body: JSON.stringify(announcementForm) });
      setAnnouncementSentMsg(res.message || 'Announcement broadcasted successfully!');
      setTimeout(() => setAnnouncementSentMsg(''), 4000);
      setAnnouncementForm({ title: '', message: '', type: 'ANNOUNCEMENT', target_segment: 'ALL', target_category_id: '', target_user_id: '' });
      loadDataForSection('notifications');
    };

    // Settings Update
    const handleSaveSettings = async (e) => {
      e.preventDefault();
      await api('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ settings: settingsForm }) });
      setSettingsSavedMsg(true);
      setTimeout(() => setSettingsSavedMsg(false), 3000);
      loadDataForSection('settings');
    };

    // Filtered lists
    const filteredUsers = useMemo(() => {
      return users.filter(u => {
        const matchesSearch = !userSearch.trim() || 
          u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase()));
        if (!matchesSearch) return false;
        if (userFilter === 'ACTIVE') return u.status === 'ACTIVE';
        if (userFilter === 'BLOCKED') return u.status === 'BLOCKED';
        if (userFilter === 'VERIFIED') return u.email_verified || u.verified_skills_count > 0;
        if (userFilter === 'STAFF') return ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(u.role);
        return true;
      });
    }, [users, userSearch, userFilter]);

    const filteredSkills = useMemo(() => {
      return skills.filter(s => {
        return !skillSearch.trim() || 
          s.name.toLowerCase().includes(skillSearch.toLowerCase()) || 
          (s.category_name && s.category_name.toLowerCase().includes(skillSearch.toLowerCase()));
      });
    }, [skills, skillSearch]);

    const filteredReviews = useMemo(() => {
      return reviews.filter(r => {
        const matchesSearch = !reviewSearch.trim() || 
          r.reviewer_name.toLowerCase().includes(reviewSearch.toLowerCase()) || 
          r.reviewee_name.toLowerCase().includes(reviewSearch.toLowerCase()) ||
          (r.comment && r.comment.toLowerCase().includes(reviewSearch.toLowerCase()));
        if (!matchesSearch) return false;
        if (reviewFilter === 'LOW') return r.rating <= 2;
        if (reviewFilter === 'FLAGGED') return r.is_flagged;
        if (reviewFilter === 'VERIFIED') return r.is_verified_exchange;
        return true;
      });
    }, [reviews, reviewSearch, reviewFilter]);

    const filteredReports = useMemo(() => {
      return reports.filter(r => {
        if (reportFilter === 'OPEN') return r.status === 'OPEN';
        if (reportFilter === 'UNDER_INVESTIGATION') return r.status === 'UNDER_INVESTIGATION';
        if (reportFilter === 'RESOLVED') return r.status === 'RESOLVED';
        if (reportFilter === 'DISMISSED') return r.status === 'DISMISSED';
        return true;
      });
    }, [reports, reportFilter]);

    const filteredVerifications = useMemo(() => {
      return verifications.filter(v => {
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

    return html`
      <div class="min-h-screen bg-cream-100 text-warmgray-900 font-sans flex flex-col md:flex-row antialiased">
        
        <!-- ============================================== -->
        <!-- SIDEBAR NAVIGATION (Tight & Minimalist)       -->
        <!-- ============================================== -->
        <aside class="w-full md:w-64 bg-white border-r border-cream-300 flex flex-col justify-between shrink-0 shadow-xs">
          <div>
            <!-- Sidebar Header Brand -->
            <div class="p-6 border-b border-cream-200 flex items-center justify-between">
              <div class="flex items-center gap-3 cursor-pointer" onClick=${() => setActiveNav('overview')}>
                <img src="/logo-icon.png" alt="SkillSwapX Logo" class="w-8 h-8 rounded-xl object-contain shadow-xs bg-white p-0.5 border border-cream-200" />
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="font-serif text-lg font-bold text-navy-950 tracking-tight">SkillSwap<span class="text-indigo-600">X</span></span>
                    <span class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">Admin</span>
                  </div>
                  <p class="text-[9px] font-semibold text-warmgray-500">Platform Governance</p>
                </div>
              </div>
            </div>



            <!-- Core Nav Items List -->
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
                  ${users.length > 0 ? html`<span class="text-[10px] px-1.5 py-0.2 rounded-md ${activeNav === 'users' ? 'bg-white/20 text-white' : 'bg-cream-200 text-navy-900'}">${users.length}</span>` : null}
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
                  ${reports.filter(r => r.status === 'OPEN').length > 0 ? html`
                    <span class="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                      ${reports.filter(r => r.status === 'OPEN').length}
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
                  ${verifications.filter(v => v.status === 'PENDING').length > 0 ? html`
                    <span class="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-sky-500 text-white">
                      ${verifications.filter(v => v.status === 'PENDING').length}
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

            <!-- Health Telemetry Indicator -->
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-cream-300 shadow-2xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-navy-900 font-bold">All Systems Operational</span>
              </span>
            </div>
          </div>

          ${loading ? html`
            <div class="p-16 bg-white rounded-3xl border border-cream-300 text-center space-y-3 shadow-xs">
              <div class="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
              <p class="font-serif text-sm font-semibold text-warmgray-600">Retrieving platform database records...</p>
            </div>
          ` : null}

          <!-- ============================================== -->
          <!-- 1. OVERVIEW DASHBOARD VIEW                     -->
          <!-- ============================================== -->
          ${!loading && activeNav === 'overview' && analytics && html`
            <div class="space-y-8 animate-fadeIn text-left">
              
              <!-- 4 Primary KPI Cards (Four-Across Card Grid Layout) -->
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <!-- Card 1: Users -->
                <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-xs space-y-2 hover:shadow-md transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-warmgray-500 uppercase tracking-wider">Total Users</span>
                    <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">+12% this week</span>
                  </div>
                  <div class="text-3xl font-serif font-extrabold text-navy-950">${analytics.users?.total_users || 0}</div>
                  <div class="text-xs text-warmgray-600">
                    <strong>${analytics.users?.active_users || 0}</strong> Active · <strong>${analytics.users?.new_users_today || 0}</strong> new today
                  </div>
                </div>

                <!-- Card 2: Exchanges -->
                <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-xs space-y-2 hover:shadow-md transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-warmgray-500 uppercase tracking-wider">Active Exchanges</span>
                    <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">+8% active</span>
                  </div>
                  <div class="text-3xl font-serif font-extrabold text-navy-950">${(analytics.exchanges?.active_problems || 0) + (analytics.exchanges?.active_workspaces || 0)}</div>
                  <div class="text-xs text-warmgray-600">
                    <strong>${analytics.exchanges?.completed_workspaces || 0}</strong> completed swaps
                  </div>
                </div>

                <!-- Card 3: Skills -->
                <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-xs space-y-2 hover:shadow-md transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-warmgray-500 uppercase tracking-wider">Total Skills</span>
                    <span class="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">${analytics.skills?.total_categories || 0} categories</span>
                  </div>
                  <div class="text-3xl font-serif font-extrabold text-navy-950">${analytics.skills?.total_skills || 0}</div>
                  <div class="text-xs text-warmgray-600">
                    <strong>${analytics.skills?.total_teach_offerings || 0}</strong> taught · <strong>${analytics.skills?.total_learn_demands || 0}</strong> sought
                  </div>
                </div>

                <!-- Card 4: Reports -->
                <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-xs space-y-2 hover:shadow-md transition-all">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-warmgray-500 uppercase tracking-wider">Reported Content</span>
                    ${(analytics.reports?.open_reports || 0) > 0 ? html`
                      <span class="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">Action Needed</span>
                    ` : html`
                      <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Clear</span>
                    `}
                  </div>
                  <div class="text-3xl font-serif font-extrabold ${(analytics.reports?.open_reports || 0) > 0 ? 'text-rose-600' : 'text-navy-950'}">
                    ${analytics.reports?.open_reports || 0}
                  </div>
                  <div class="text-xs text-warmgray-600">
                    ${analytics.reports?.resolved_reports || 0} resolved incidents
                  </div>
                </div>
              </div>

              <!-- Platform Activity Chart Visual Section -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-xs space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
                  <div>
                    <h3 class="font-serif text-lg font-bold text-navy-950">Platform Activity (Users & Exchange Volume)</h3>
                    <p class="text-xs text-warmgray-600">Real-time daily growth trends across registrations and problem proposals.</p>
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

                <!-- Activity Bar Chart Graph -->
                <div class="grid grid-cols-7 gap-3 sm:gap-6 pt-4 h-48 items-end border-b border-cream-200 pb-4">
                  ${[
                    { day: 'Mon', u: 40, e: 25 },
                    { day: 'Tue', u: 55, e: 38 },
                    { day: 'Wed', u: 70, e: 45 },
                    { day: 'Thu', u: 62, e: 40 },
                    { day: 'Fri', u: 90, e: 68 },
                    { day: 'Sat', u: 80, e: 58 },
                    { day: 'Sun', u: 100, e: 78 }
                  ].map(bar => html`
                    <div key=${bar.day} class="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                      <div class="flex items-end gap-1 sm:gap-2 h-full w-full justify-center">
                        <div class="w-3 sm:w-6 bg-indigo-600 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-700" style=${{ height: `${bar.u}%` }} title="Users: ${bar.u}"></div>
                        <div class="w-3 sm:w-6 bg-emerald-500 rounded-t-lg transition-all duration-300 group-hover:bg-emerald-600" style=${{ height: `${bar.e}%` }} title="Exchanges: ${bar.e}"></div>
                      </div>
                      <span class="text-[11px] font-bold text-warmgray-500">${bar.day}</span>
                    </div>
                  `)}
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
                        ${reports.filter(r => r.status === 'OPEN').length} Open
                      </span>
                    </div>
                    <button onClick=${() => setActiveNav('reports')} class="text-xs font-bold text-indigo-600 hover:underline">
                      View All Reports →
                    </button>
                  </div>

                  <div class="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
                    ${reports.slice(0, 4).map(r => html`
                      <div key=${r.id} class="p-3.5 bg-cream-50/60 border border-cream-200 rounded-2xl flex justify-between items-center hover:bg-cream-100/50 transition-colors">
                        <div class="space-y-0.5">
                          <p class="font-bold text-navy-950">Case #${r.id} · Against: <strong class="text-rose-700">${r.reported_name}</strong></p>
                          <p class="text-warmgray-600 text-[11px]">${r.reason}</p>
                        </div>
                        <button
                          onClick=${() => { setSelectedReport(r); setActiveNav('reports'); }}
                          class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-2xs"
                        >
                          Investigate
                        </button>
                      </div>
                    `)}
                    ${reports.length === 0 ? html`<p class="text-center py-6 text-warmgray-500">No open reports logged.</p>` : null}
                  </div>
                </div>

                <!-- Top Skills Panel -->
                <div class="bg-white p-6 sm:p-7 rounded-3xl border border-cream-300 shadow-xs space-y-4">
                  <div class="flex items-center justify-between border-b border-cream-100 pb-3">
                    <h3 class="font-serif text-lg font-bold text-navy-950">Top Skills (Supply vs Demand)</h3>
                    <button onClick=${() => setActiveNav('skills')} class="text-xs font-bold text-indigo-600 hover:underline">
                      Manage Skills →
                    </button>
                  </div>

                  <div class="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
                    ${(analytics.topSkills || []).map(sk => html`
                      <div key=${sk.id || sk.name} class="p-3.5 bg-cream-50/60 border border-cream-200 rounded-2xl flex items-center justify-between">
                        <div>
                          <p class="font-bold text-navy-950">${sk.name}</p>
                          <p class="text-[10px] text-warmgray-500">${sk.category_name}</p>
                        </div>
                        <div class="flex items-center gap-3 font-semibold text-[11px]">
                          <span class="text-emerald-700 font-bold">${sk.teachers || 0} teachers</span>
                          <span class="text-warmgray-300">/</span>
                          <span class="text-indigo-700 font-bold">${sk.learners || 0} learners</span>
                        </div>
                      </div>
                    `)}
                  </div>
                </div>
              </div>

            </div>
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
                    ${filteredUsers.map(u => html`
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
                    `)}
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
          ${!loading && activeNav === 'analytics' && analyticsData && html`
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
    const [location, setLocation] = useState('');
    const [weeklyHours, setWeeklyHours] = useState(4);
    const [timezone, setTimezone] = useState('PST (UTC-8)');
    const [preferredLanguage, setPreferredLanguage] = useState('English');

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
        setLocation(s.location || '');
        setWeeklyHours(s.weekly_hours || 4);
        setTimezone(s.timezone || 'PST (UTC-8)');
        setPreferredLanguage(s.preferred_language || 'English');

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
                      placeholder="e.g. San Francisco, CA or Remote"
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
                      <option value="PST (UTC-8)">PST (UTC-8)</option>
                      <option value="EST (UTC-5)">EST (UTC-5)</option>
                      <option value="GMT (UTC+0)">GMT (UTC+0)</option>
                      <option value="CET (UTC+1)">CET (UTC+1)</option>
                      <option value="IST (UTC+5:30)">IST (UTC+5:30)</option>
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
                    <input
                      type="text"
                      value=${preferredLanguage}
                      onChange=${e => setPreferredLanguage(e.target.value)}
                      class="w-full p-3 bg-cream-50/70 border border-cream-300 rounded-xl font-medium text-navy-900 focus:outline-none"
                    />
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
  window.SkillSwap.SettingsView = SettingsView;

})();