// public/views_app.js - Application Views (Dashboard, Matches, Matrix, Requests, Workspaces, Chat)
(function() {
  window.SkillSwap = window.SkillSwap || {};

  const React = window.React;
  const htm = window.htm || self.htm;
  if (!React || !htm) return;

  const { useState, useEffect, useMemo } = React;
  const html = htm.bind(React.createElement);
  const { api, Icon } = window.SkillSwap;

  // ----------------------------------------------------
  // Dashboard View
  // ----------------------------------------------------
  function DashboardView({ user, setActiveTab, onProposeSwap }) {
    const [matches, setMatches] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);

    useEffect(() => {
      api('/api/matches').then(data => setMatches((data.matches || []).slice(0, 3))).catch(console.error);
      api('/api/workspaces').then(data => setWorkspaces(data.workspaces || [])).catch(console.error);
    }, []);

    const teachCount = (user.skills || []).filter(s => s.type === 'TEACH').length;
    const learnCount = (user.skills || []).filter(s => s.type === 'LEARN').length;

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
        <div class="bg-gradient-to-r from-white via-cream-50 to-navy-50 rounded-3xl p-8 border border-cream-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-2">
            <h1 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">
              Welcome, ${user.name}! 👋
            </h1>
            <p class="text-xs sm:text-sm text-warmgray-600 max-w-xl">
              You have <strong class="text-navy-900">${teachCount} skills</strong> to teach and <strong class="text-navy-900">${learnCount} goals</strong> to learn.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button onClick=${() => setActiveTab('matches')} class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold text-xs rounded-xl shadow-sm">
              Discover Matches
            </button>
            <button onClick=${() => setActiveTab('skills')} class="px-4 py-2.5 bg-white border border-cream-300 text-navy-800 font-bold text-xs rounded-xl shadow-sm">
              + Manage Skills
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-serif text-xl font-bold text-navy-900">Top Reciprocal Matches</h2>
            <button onClick=${() => setActiveTab('matches')} class="text-xs font-bold text-navy-700 hover:underline">View all →</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${matches.map(m => html`
              <div key=${m.user.id} class="bg-white rounded-3xl p-6 border border-cream-200 shadow-sm space-y-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <img src=${m.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} alt=${m.user.name} class="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 class="font-bold text-navy-900 text-sm">${m.user.name}</h4>
                      <p class="text-[11px] text-warmgray-500">${m.user.location || 'Remote'}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200">
                      ${m.score}%
                    </span>
                  </div>
                </div>

                <div class="space-y-2 text-xs">
                  <div class="p-2.5 bg-cream-50 rounded-xl text-navy-900 border border-cream-100 font-medium text-[11px]">
                    ${(m.reasons && m.reasons[0]) || 'High skill compatibility detected.'}
                  </div>
                </div>

                <button onClick=${() => onProposeSwap(m)} class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-xs shadow-sm">
                  Propose Swap
                </button>
              </div>
            `)}
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-serif text-xl font-bold text-navy-900">Active Workspaces & Exchanges</h2>
            <button onClick=${() => setActiveTab('workspaces')} class="text-xs font-bold text-navy-700 hover:underline">View all →</button>
          </div>

          ${workspaces.length === 0 ? html`
            <div class="bg-white rounded-3xl p-8 border border-cream-200 text-center space-y-3">
              <p class="text-xs text-warmgray-600">No active exchange workspaces yet. Connect with a peer or accept a request to launch a shared learning workspace!</p>
              <button onClick=${() => setActiveTab('matches')} class="px-4 py-2 bg-navy-700 text-white rounded-xl font-bold text-xs">Find a Match Now</button>
            </div>
          ` : html`
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${workspaces.map(w => html`
                <div key=${w.id} onClick=${() => setActiveTab('workspaces')} class="p-6 bg-white rounded-3xl border border-cream-200 shadow-sm hover:border-navy-400 cursor-pointer space-y-3">
                  <div class="flex items-center justify-between">
                    <h3 class="font-bold text-navy-900 text-sm">${w.title}</h3>
                    <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px]">${w.status}</span>
                  </div>
                  <div class="w-full bg-cream-200 rounded-full h-2">
                    <div class="bg-navy-700 h-2 rounded-full" style="width: 35%"></div>
                  </div>
                  <div class="flex items-center justify-between text-xs text-warmgray-500">
                    <span>Progress: ${w.progress || 35}%</span>
                    <span class="font-bold text-navy-700">Open Workspace →</span>
                  </div>
                </div>
              `)}
            </div>
          `}
        </div>
      </div>
    `;
  }
  window.SkillSwap.DashboardView = DashboardView;

  // ----------------------------------------------------
  // Matches Discovery View
  // ----------------------------------------------------
  function MatchesView({ onProposeSwap, onComparePeers, onViewProfile }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [minSynergy, setMinSynergy] = useState(50);
    const [searchKeyword, setSearchKeyword] = useState('');

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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cream-300 pb-5">
          <div>
            <h1 class="font-serif text-3xl font-bold text-navy-900">Reciprocal Peer Matches</h1>
            <p class="text-warmgray-600 text-xs sm:text-sm">Ranked by complementary teach/learn overlap and mutual goals.</p>
          </div>

          <div class="flex items-center gap-3">
            <button onClick=${() => onComparePeers(matches[0] && matches[0].user, matches[1] && matches[1].user)} class="px-4 py-2 bg-white border border-cream-300 rounded-xl text-xs font-bold text-navy-800 shadow-sm flex items-center gap-1.5">
              <${Icon} name="columns" class="w-4 h-4" /> Compare Peers
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div class="lg:col-span-1 space-y-5 bg-white p-6 rounded-3xl border border-cream-200 shadow-sm text-xs">
            <h3 class="font-bold text-navy-900 text-sm flex items-center gap-2">
              <${Icon} name="filter" class="w-4 h-4" /> Filter Matches
            </h3>

            <div>
              <label class="block font-bold mb-1">Keywords</label>
              <input
                type="text"
                value=${searchKeyword}
                onChange=${e => setSearchKeyword(e.target.value)}
                placeholder="Skill or peer name..."
                class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl"
              />
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span>Min Synergy Score</span>
                <span class="text-navy-700">${minSynergy}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                value=${minSynergy}
                onChange=${e => setMinSynergy(Number(e.target.value))}
                class="w-full accent-navy-700"
              />
            </div>
          </div>

          <div class="lg:col-span-3 space-y-6">
            ${loading ? html`<div class="p-12 text-center text-warmgray-500 font-serif">Computing reciprocal match synergies...</div>` : null}

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${filteredMatches.map(m => html`
                <div key=${m.user.id} class="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                  <div class="space-y-4">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <img src=${m.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} alt=${m.user.name} class="w-12 h-12 rounded-2xl object-cover border border-cream-200" />
                        <div>
                          <h3 class="font-bold text-navy-900 text-sm cursor-pointer hover:underline" onClick=${() => onViewProfile(m.user.username)}>
                            ${m.user.name}
                          </h3>
                          <p class="text-[11px] text-warmgray-500">${m.user.location || 'Worldwide'} · ${m.user.timezone || 'UTC'}</p>
                        </div>
                      </div>

                      <div class="text-right">
                        <span class="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-serif font-bold text-xs">
                          ${m.score}% Match
                        </span>
                      </div>
                    </div>

                    <div class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 text-xs">
                      <span class="font-bold text-navy-900 uppercase tracking-wider text-[10px]">Why this match:</span>
                      <ul class="space-y-1 text-warmgray-700">
                        ${(m.reasons || []).slice(0, 3).map((r, i) => html`
                          <li key=${i} class="flex items-start gap-1.5 text-[11px]">
                            <span class="text-navy-700 font-bold">✓</span> ${r}
                          </li>
                        `)}
                      </ul>
                    </div>

                    <div class="space-y-2 text-xs">
                      <div>
                        <span class="font-bold text-navy-900 text-[10px] uppercase">Can Teach:</span>
                        <div class="flex flex-wrap gap-1 mt-1">
                          ${(m.user.teach_skills || []).map(s => html`
                            <span key=${s.id} class="px-2 py-0.5 bg-cream-200 text-navy-900 rounded font-semibold text-[10px]">${s.skill_name}</span>
                          `)}
                        </div>
                      </div>

                      <div>
                        <span class="font-bold text-amber-900 text-[10px] uppercase">Wants to Learn:</span>
                        <div class="flex flex-wrap gap-1 mt-1">
                          ${(m.user.learn_skills || []).map(s => html`
                            <span key=${s.id} class="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-semibold text-[10px]">${s.skill_name}</span>
                          `)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-cream-100">
                    <button onClick=${() => onProposeSwap(m)} class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all">
                      Propose Swap
                    </button>
                  </div>
                </div>
              `)}
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
      if (!confirm('Remove this skill?')) return;
      await api('/api/skills/user?id=' + id, { method: 'DELETE' });
      onRefresh && onRefresh();
    };

    const myTeach = (user.skills || []).filter(s => s.type === 'TEACH');
    const myLearn = (user.skills || []).filter(s => s.type === 'LEARN');

    return html`
      <div class="max-w-6xl mx-auto px-4 py-8 space-y-8 text-left">
        <div>
          <h1 class="font-serif text-3xl font-bold text-navy-900">Skill Matrix & Management</h1>
          <p class="text-warmgray-600 text-xs sm:text-sm">Manage the topics you can teach and what you want to learn.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 text-xs">
            <h3 class="font-serif text-lg font-bold text-navy-900">+ Add Skill to Profile</h3>

            <form onSubmit=${handleAddSkill} class="space-y-3">
              <div>
                <label class="block font-bold mb-1">Intent</label>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" onClick=${() => setType('TEACH')} class="py-2 rounded-xl font-bold ${type === 'TEACH' ? 'bg-navy-700 text-white' : 'bg-cream-100 text-warmgray-700'}">I Can Teach</button>
                  <button type="button" onClick=${() => setType('LEARN')} class="py-2 rounded-xl font-bold ${type === 'LEARN' ? 'bg-amber-700 text-white' : 'bg-cream-100 text-warmgray-700'}">I Want to Learn</button>
                </div>
              </div>

              <div>
                <label class="block font-bold mb-1">Select Skill</label>
                <select required value=${selectedSkillId} onChange=${e => setSelectedSkillId(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl">
                  <option value="">Choose a skill...</option>
                  ${allSkills.map(s => html`<option key=${s.id} value=${s.id}>${s.name} (${s.category_name})</option>`)}
                </select>
              </div>

              <div>
                <label class="block font-bold mb-1">Proficiency Level</label>
                <select value=${level} onChange=${e => setLevel(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <label class="block font-bold mb-1">Years Experience: ${expYears}</label>
                <input type="range" min="0" max="15" step="0.5" value=${expYears} onChange=${e => setExpYears(Number(e.target.value))} class="w-full accent-navy-700" />
              </div>

              <button type="submit" disabled=${loading} class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-md">
                ${loading ? 'Adding...' : 'Add to Skill Matrix'}
              </button>
            </form>
          </div>

          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4">
              <h3 class="font-serif text-lg font-bold text-navy-900">Skills I Can Teach (${myTeach.length})</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${myTeach.map(s => html`
                  <div key=${s.id} class="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex items-start justify-between">
                    <div>
                      <h4 class="font-bold text-navy-900 text-xs">${s.skill_name}</h4>
                      <p class="text-[11px] text-warmgray-500">${s.level} · ${s.experience_years} yrs</p>
                    </div>
                    <button onClick=${() => handleDeleteSkill(s.id)} class="text-rose-600 hover:text-rose-800 p-1">
                      <${Icon} name="trash-2" class="w-4 h-4" />
                    </button>
                  </div>
                `)}
              </div>
            </div>

            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4">
              <h3 class="font-serif text-lg font-bold text-navy-900">Skills I Want to Learn (${myLearn.length})</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${myLearn.map(s => html`
                  <div key=${s.id} class="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 flex items-start justify-between">
                    <div>
                      <h4 class="font-bold text-navy-900 text-xs">${s.skill_name}</h4>
                      <p class="text-[11px] text-warmgray-500">Target: ${s.level}</p>
                    </div>
                    <button onClick=${() => handleDeleteSkill(s.id)} class="text-rose-600 hover:text-rose-800 p-1">
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

    useEffect(() => {
      loadRequests();
    }, []);

    const loadRequests = async () => {
      const data = await api('/api/requests');
      setIncoming(data.incoming || []);
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
      <div class="max-w-5xl mx-auto px-4 py-8 space-y-8 text-left">
        <div>
          <h1 class="font-serif text-3xl font-bold text-navy-900">Exchange Requests</h1>
          <p class="text-warmgray-600 text-xs sm:text-sm">Manage incoming and outgoing skill swap proposals.</p>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-4">
            <h2 class="font-serif text-lg font-bold text-navy-900">Incoming Proposals (${incoming.length})</h2>
            ${incoming.length === 0 ? html`<p class="text-xs text-warmgray-500 py-4">No pending incoming proposals.</p>` : null}
            <div class="space-y-3">
              ${incoming.map(r => html`
                <div key=${r.id} class="p-5 bg-cream-50 rounded-2xl border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div class="space-y-1">
                    <span class="font-bold text-navy-900 text-sm">${r.sender_name}</span>
                    <p class="text-xs text-warmgray-600">"${r.message}"</p>
                  </div>

                  ${r.status === 'PENDING' ? html`
                    <div class="flex items-center gap-2">
                      <button onClick=${() => handleAccept(r.id)} class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm">
                        Accept Swap
                      </button>
                      <button onClick=${() => handleReject(r.id)} class="px-4 py-2 bg-white border border-cream-300 text-rose-700 rounded-xl font-bold text-xs">
                        Decline
                      </button>
                    </div>
                  ` : html`<span class="text-xs font-bold">${r.status}</span>`}
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.RequestsView = RequestsView;

  // ----------------------------------------------------
  // Workspace View
  // ----------------------------------------------------
  function WorkspaceView() {
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
      api('/api/workspaces').then(data => {
        setWorkspaces(data.workspaces || []);
        if (data.workspaces && data.workspaces[0]) {
          loadWorkspaceDetails(data.workspaces[0].id);
        }
      }).catch(console.error);
    }, []);

    const loadWorkspaceDetails = async (id) => {
      const data = await api('/api/workspaces/' + id);
      setActiveWorkspace(data.workspace);
    };

    const handleAddTask = async (e) => {
      e.preventDefault();
      if (!newTaskTitle.trim() || !activeWorkspace) return;
      await api('/api/workspaces/' + activeWorkspace.id + '/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: newTaskTitle })
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

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
        <div>
          <h1 class="font-serif text-3xl font-bold text-navy-900">Exchange Workspace</h1>
          <p class="text-warmgray-600 text-xs sm:text-sm">Collaborative hub for learning milestones and tasks.</p>
        </div>

        ${!activeWorkspace ? html`
          <div class="bg-white p-12 rounded-3xl border border-cream-200 text-center space-y-3">
            <p class="text-sm text-warmgray-600">No active workspaces yet. Once an exchange proposal is accepted, your shared workspace launches here.</p>
          </div>
        ` : html`
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="space-y-6">
              <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 text-xs">
                <h3 class="font-serif text-lg font-bold text-navy-900">Exchange Agreement</h3>
                <div class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                  <div class="flex justify-between font-semibold">
                    <span class="text-warmgray-500">Partner:</span>
                    <span class="text-navy-900">${activeWorkspace.partner_name || 'Active Peer'}</span>
                  </div>
                  <div class="flex justify-between font-semibold">
                    <span class="text-warmgray-500">Duration:</span>
                    <span class="text-navy-900">4 Weeks</span>
                  </div>
                </div>

                <div class="space-y-1.5 pt-2">
                  <div class="flex justify-between font-bold text-[11px]">
                    <span>Workspace Progress</span>
                    <span class="text-navy-700">${activeWorkspace.progress || 30}%</span>
                  </div>
                  <div class="w-full bg-cream-200 rounded-full h-2.5">
                    <div class="bg-navy-700 h-2.5 rounded-full transition-all" style="width: 30%"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="lg:col-span-2 space-y-6">
              <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 text-xs">
                <div class="flex items-center justify-between">
                  <h3 class="font-serif text-lg font-bold text-navy-900">Learning Action Tasks</h3>
                  <span class="text-warmgray-500">${(activeWorkspace.tasks || []).filter(t => t.status === 'COMPLETED').length}/${(activeWorkspace.tasks || []).length} Done</span>
                </div>

                <form onSubmit=${handleAddTask} class="flex gap-2">
                  <input
                    type="text"
                    required
                    value=${newTaskTitle}
                    onChange=${e => setNewTaskTitle(e.target.value)}
                    placeholder="Add new practice task..."
                    class="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl"
                  />
                  <button type="submit" class="px-5 py-2 bg-navy-700 text-white font-bold rounded-xl shrink-0">Add</button>
                </form>

                <div class="space-y-2 pt-2">
                  ${(activeWorkspace.tasks || []).map(t => html`
                    <div key=${t.id} onClick=${() => handleToggleTask(t)} class="p-3.5 bg-cream-50 hover:bg-cream-100 rounded-2xl border border-cream-200 flex items-center justify-between cursor-pointer transition-all">
                      <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-lg border flex items-center justify-center ${t.status === 'COMPLETED' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-cream-400 bg-white'}">
                          ${t.status === 'COMPLETED' ? '✓' : ''}
                        </div>
                        <span class="font-medium ${t.status === 'COMPLETED' ? 'line-through text-warmgray-400' : 'text-navy-900'}">${t.title}</span>
                      </div>
                      <span class="text-[10px] font-bold uppercase text-warmgray-400">${t.status}</span>
                    </div>
                  `)}
                </div>
              </div>
            </div>
          </div>
        `}
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
      <div class="max-w-7xl mx-auto px-4 py-8 text-left">
        <div class="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[600px]">
          <div class="border-r border-cream-200 p-4 space-y-3">
            <h3 class="font-serif text-lg font-bold text-navy-900 px-2">Direct Messages</h3>
            <div class="space-y-1">
              ${connections.map(c => html`
                <div
                  key=${c.id}
                  onClick=${() => selectConnection(c)}
                  class="p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${activeConn && activeConn.id === c.id ? 'bg-cream-100 border border-cream-200' : 'hover:bg-cream-50'}"
                >
                  <img src=${c.partner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} class="w-10 h-10 rounded-xl object-cover" />
                  <div class="text-xs truncate">
                    <p class="font-bold text-navy-900 truncate">${c.partner_name}</p>
                    <p class="text-warmgray-500 text-[11px] truncate">${c.last_message || 'Start chatting...'}</p>
                  </div>
                </div>
              `)}
            </div>
          </div>

          <div class="md:col-span-2 flex flex-col justify-between p-6">
            ${activeConn ? html`
              <div class="flex items-center justify-between border-b border-cream-200 pb-3 mb-4">
                <div class="flex items-center gap-3">
                  <img src=${activeConn.partner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} class="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <h4 class="font-bold text-navy-900 text-sm">${activeConn.partner_name}</h4>
                    <span class="text-[10px] text-emerald-700 font-semibold">● Active Connection</span>
                  </div>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto space-y-3 p-2 text-xs">
                ${messages.map(m => html`
                  <div key=${m.id} class="flex ${m.sender_id === (currentUser && currentUser.id) ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-xs sm:max-w-md p-3.5 rounded-2xl leading-relaxed ${m.sender_id === (currentUser && currentUser.id) ? 'bg-navy-700 text-white rounded-br-none' : 'bg-cream-100 text-navy-900 rounded-bl-none'}">
                      ${m.message}
                    </div>
                  </div>
                `)}
              </div>

              <form onSubmit=${handleSend} class="flex gap-2 pt-4 border-t border-cream-200">
                <input
                  type="text"
                  required
                  value=${newMsg}
                  onChange=${e => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  class="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs focus:outline-none focus:border-navy-600"
                />
                <button type="submit" class="px-5 py-2.5 bg-navy-700 text-white font-bold text-xs rounded-xl shadow-sm">
                  Send
                </button>
              </form>
            ` : html`
              <div class="h-full flex items-center justify-center text-warmgray-400 text-sm">
                Select a conversation to start chatting.
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.ChatView = ChatView;
})();