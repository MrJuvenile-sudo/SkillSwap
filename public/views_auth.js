// public/views_auth.js - Auth, Landing, Directory, Profiles & Static Views
(function() {
  window.SkillSwap = window.SkillSwap || {};

  const React = window.React;
  const htm = window.htm || self.htm;
  if (!React || !htm) return;

  const { useState, useEffect, useMemo } = React;
  const html = htm.bind(React.createElement);
  const { api, Icon } = window.SkillSwap;

  // ----------------------------------------------------
  // Home Landing Page View
  // ----------------------------------------------------
  function HomeLandingView({ setActiveTab }) {
    const [searchVal, setSearchVal] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
      api('/api/skills/directory').then(data => {
        setCategories(data.categories || []);
      }).catch(console.error);
    }, []);

    const handleSearchSubmit = (e) => {
      e.preventDefault();
      setActiveTab('skills-dir');
    };

    return html`
      <div class="space-y-20 pb-12 text-center">
        <section class="pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-200 border border-cream-300 text-navy-800 text-xs font-bold tracking-wide shadow-sm">
            <${Icon} name="sparkles" class="w-4 h-4 text-amber-600" />
            Reciprocal Skill Exchange Network
          </div>
          <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-navy-900 tracking-tight leading-tight">
            Teach what you know.<br />
            <span class="italic text-navy-700">Master what you need.</span>
          </h1>
          <p class="text-base sm:text-lg text-warmgray-600 max-w-2xl mx-auto leading-relaxed">
            Trade expertise 1-on-1 with verified peers. SkillSwap algorithmically scores two-way synergy so you learn faster without paying expensive course fees.
          </p>

          <form onSubmit=${handleSearchSubmit} class="max-w-2xl mx-auto pt-4">
            <div class="flex items-center bg-white p-2 rounded-2xl border border-cream-300 shadow-lg focus-within:border-navy-600 transition-all">
              <div class="pl-3 text-warmgray-400">
                <${Icon} name="search" class="w-5 h-5" />
              </div>
              <input
                type="text"
                value=${searchVal}
                onChange=${e => setSearchVal(e.target.value)}
                placeholder="What do you want to learn today? (e.g. Python, UI Design, Guitar, Spanish)"
                class="w-full px-3 py-2.5 text-sm sm:text-base text-navy-900 placeholder-warmgray-400 focus:outline-none bg-transparent"
              />
              <button type="submit" class="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0">
                Find Matches
              </button>
            </div>
          </form>

          <div class="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-warmgray-600 text-xs sm:text-sm">
            <div class="flex items-center gap-2">
              <span class="font-bold text-navy-900 text-base sm:text-lg font-serif">12,400+</span> Swaps Completed
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-navy-900 text-base sm:text-lg font-serif">98.4%</span> Synergy Satisfaction
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-navy-900 text-base sm:text-lg font-serif">100%</span> Free Peer Exchange
            </div>
          </div>
        </section>

        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center space-y-3 mb-12">
            <h2 class="font-serif text-3xl font-bold text-navy-900">How SkillSwap Works</h2>
            <p class="text-warmgray-600 text-sm max-w-xl mx-auto">Three simple steps to unlock reciprocal learning with qualified peers around the world.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm text-left space-y-4 hover:shadow-md transition-all">
              <div class="w-12 h-12 rounded-2xl bg-navy-50 text-navy-700 flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 class="font-serif text-xl font-bold text-navy-900">List Your Skills</h3>
              <p class="text-warmgray-600 text-sm leading-relaxed">
                Add skills you can <strong class="text-navy-900">Teach</strong> with your proficiency level, and skills you want to <strong class="text-navy-900">Learn</strong>.
              </p>
            </div>

            <div class="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm text-left space-y-4 hover:shadow-md transition-all">
              <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 class="font-serif text-xl font-bold text-navy-900">Get Reciprocally Matched</h3>
              <p class="text-warmgray-600 text-sm leading-relaxed">
                Our 6-factor algorithm discovers peers where <strong class="text-navy-900">both parties benefit</strong>, providing plain-language match explanations.
              </p>
            </div>

            <div class="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm text-left space-y-4 hover:shadow-md transition-all">
              <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 class="font-serif text-xl font-bold text-navy-900">Swap & Build in Workspace</h3>
              <p class="text-warmgray-600 text-sm leading-relaxed">
                Coordinate sessions in your shared workspace, track learning milestones and tasks, chat in real-time, and leave blind reviews.
              </p>
            </div>
          </div>
        </section>

        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div class="text-left">
              <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-900">Explore Skill Categories</h2>
              <p class="text-warmgray-600 text-sm">Discover thousands of topics taught by practitioners.</p>
            </div>
            <button onClick=${() => setActiveTab('skills-dir')} class="text-sm font-bold text-navy-700 hover:text-navy-900 flex items-center gap-1.5">
              Browse full directory <${Icon} name="arrow-right" class="w-4 h-4" />
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            ${categories.map(cat => html`
              <div key=${cat.id} onClick=${() => setActiveTab('skills-dir')} class="p-5 bg-white rounded-2xl border border-cream-200 shadow-sm hover:border-navy-400 hover:shadow-md transition-all cursor-pointer text-left space-y-2">
                <div class="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center text-navy-700">
                  <${Icon} name="sparkles" class="w-5 h-5" />
                </div>
                <h4 class="font-bold text-navy-900 text-sm">${cat.name}</h4>
                <p class="text-xs text-warmgray-500 line-clamp-2">${cat.description}</p>
                <div class="text-[11px] font-semibold text-navy-600 pt-1">
                  ${cat.skills_count || 0} skills · ${cat.active_members_count || 0} members
                </div>
              </div>
            `)}
          </div>
        </section>
      </div>
    `;
  }
  window.SkillSwap.HomeLandingView = HomeLandingView;

  // ----------------------------------------------------
  // Signup View
  // ----------------------------------------------------
  function SignupView({ setActiveTab, onAuthSuccess }) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [headline, setHeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        setError('');
        const res = await api('/api/account/signup', {
          method: 'POST',
          body: JSON.stringify({
            name,
            username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
            email,
            password,
            headline
          })
        });
        if (res.user) {
          onAuthSuccess(res.user);
          setActiveTab('onboarding');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return html`
      <div class="max-w-md mx-auto my-12 px-4 text-left">
        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-xl space-y-6">
          <div class="space-y-2 text-center">
            <div class="w-10 h-10 rounded-2xl bg-navy-700 text-cream-100 flex items-center justify-center font-serif font-bold text-lg mx-auto shadow-sm">
              S
            </div>
            <h2 class="font-serif text-2xl font-bold text-navy-900">Create your account</h2>
            <p class="text-xs text-warmgray-500">Join verified peer mentors exchanging skills</p>
          </div>

          ${error ? html`<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">${error}</div>` : null}

          <form onSubmit=${handleSignup} class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-navy-900 mb-1">Full Name</label>
              <input required type="text" value=${name} onChange=${e => setName(e.target.value)} placeholder="e.g. Jordan Smith" class="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600" />
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Username</label>
              <input required type="text" value=${username} onChange=${e => setUsername(e.target.value)} placeholder="jordansmith" class="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600" />
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Email Address</label>
              <input required type="email" value=${email} onChange=${e => setEmail(e.target.value)} placeholder="jordan@example.com" class="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600" />
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Password</label>
              <input required type="password" minlength="6" value=${password} onChange=${e => setPassword(e.target.value)} placeholder="At least 6 characters" class="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600" />
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Professional Headline</label>
              <input type="text" value=${headline} onChange=${e => setHeadline(e.target.value)} placeholder="e.g. Full-Stack Developer & Guitar Hobbyist" class="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600" />
            </div>

            <button type="submit" disabled=${loading} class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-md transition-all">
              ${loading ? 'Creating Account...' : 'Complete & Launch Onboarding →'}
            </button>
          </form>

          <div class="text-center pt-2 border-t border-cream-200 text-xs text-warmgray-600">
            Already have an account? <button onClick=${() => setActiveTab('login')} class="font-bold text-navy-700 hover:underline">Log in</button>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.SignupView = SignupView;

  // ----------------------------------------------------
  // Login View
  // ----------------------------------------------------
  function LoginView({ setActiveTab, onAuthSuccess }) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        setError('');
        const res = await api('/api/account/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password, remember_me: true })
        });
        if (res.user) {
          onAuthSuccess(res.user);
          setActiveTab('dashboard');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleQuickLogin = (emailStr) => {
      setIdentifier(emailStr);
      setPassword('password123');
    };

    return html`
      <div class="max-w-md mx-auto my-12 px-4 text-left">
        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-xl space-y-6">
          <div class="space-y-2 text-center">
            <div class="w-10 h-10 rounded-2xl bg-navy-700 text-cream-100 flex items-center justify-center font-serif font-bold text-lg mx-auto shadow-sm">
              S
            </div>
            <h2 class="font-serif text-2xl font-bold text-navy-900">Welcome Back</h2>
            <p class="text-xs text-warmgray-500">Sign in to your SkillSwap account</p>
          </div>

          ${error ? html`<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">${error}</div>` : null}

          <form onSubmit=${handleLogin} class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-navy-900 mb-1">Email or Username</label>
              <input
                required
                type="text"
                value=${identifier}
                onChange=${e => setIdentifier(e.target.value)}
                placeholder="alice@skillswap.io or alice"
                class="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600"
              />
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Password</label>
              <input
                required
                type="password"
                value=${password}
                onChange=${e => setPassword(e.target.value)}
                placeholder="••••••••"
                class="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600"
              />
            </div>

            <button type="submit" disabled=${loading} class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-md transition-all">
              ${loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2 text-xs">
            <p class="font-bold text-navy-900">Quick Test Personas:</p>
            <div class="flex flex-wrap gap-2">
              <button onClick=${() => handleQuickLogin('alice@skillswap.io')} class="px-2.5 py-1 bg-white border border-cream-300 rounded-lg text-warmgray-700 hover:bg-cream-100">
                Alice (Python/React)
              </button>
              <button onClick=${() => handleQuickLogin('bob@skillswap.io')} class="px-2.5 py-1 bg-white border border-cream-300 rounded-lg text-warmgray-700 hover:bg-cream-100">
                Bob (Photoshop/Design)
              </button>
              <button onClick=${() => handleQuickLogin('admin@skillswap.io')} class="px-2.5 py-1 bg-white border border-cream-300 rounded-lg text-navy-700 font-bold hover:bg-cream-100">
                Admin
              </button>
            </div>
          </div>

          <div class="text-center pt-2 border-t border-cream-200 text-xs text-warmgray-600">
            Don't have an account? <button onClick=${() => setActiveTab('signup')} class="font-bold text-navy-700 hover:underline">Sign up free</button>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.LoginView = LoginView;

  // ----------------------------------------------------
  // Onboarding Wizard View
  // ----------------------------------------------------
  function OnboardingWizardView({ user, setActiveTab, onComplete }) {
    const [timezone, setTimezone] = useState('PST (UTC-8)');
    const [weeklyHours, setWeeklyHours] = useState(4);
    const [bio, setBio] = useState('');

    const handleSave = async (e) => {
      e.preventDefault();
      await api('/api/account/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          timezone,
          weekly_hours: weeklyHours,
          bio: bio.trim() || 'Excited to exchange skills with motivated peers!',
          preferred_language: 'English',
          availability_schedule: { monday: ['evening'], saturday: ['morning'] }
        })
      });
      onComplete?.();
      setActiveTab('dashboard');
    };

    return html`
      <div class="max-w-2xl mx-auto my-12 px-4 text-left">
        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-xl space-y-6">
          <div class="space-y-1">
            <h2 class="font-serif text-2xl font-bold text-navy-900">Welcome to SkillSwap, ${user?.name?.split(' ')[0] || 'Friend'}!</h2>
            <p class="text-xs text-warmgray-500">Let's set your learning capacity and weekly availability to power smart matching.</p>
          </div>

          <form onSubmit=${handleSave} class="space-y-6 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-navy-900 mb-1">Your Timezone</label>
                <select value=${timezone} onChange=${e => setTimezone(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl">
                  <option value="PST (UTC-8)">PST (UTC-8) - US Pacific</option>
                  <option value="EST (UTC-5)">EST (UTC-5) - US Eastern</option>
                  <option value="GMT (UTC+0)">GMT (UTC+0) - London</option>
                  <option value="CET (UTC+1)">CET (UTC+1) - Central Europe</option>
                  <option value="IST (UTC+5:30)">IST (UTC+5:30) - India</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1">Max Weekly Hours for Swaps</label>
                <input type="number" min="1" max="20" value=${weeklyHours} onChange=${e => setWeeklyHours(Number(e.target.value))} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl" />
              </div>
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Short Bio & Learning Goal</label>
              <textarea rows="3" value=${bio} onChange=${e => setBio(e.target.value)} placeholder="Share a few sentences about what you're building and why you love peer teaching..." class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl"></textarea>
            </div>

            <button type="submit" class="w-full py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-md text-sm">
              Save & Launch Dashboard →
            </button>
          </form>
        </div>
      </div>
    `;
  }
  window.SkillSwap.OnboardingWizardView = OnboardingWizardView;

  // ----------------------------------------------------
  // Public Skill Directory View
  // ----------------------------------------------------
  function SkillsDirectoryView({ setActiveTab }) {
    const [directory, setDirectory] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
      api('/api/skills/directory').then(data => setDirectory(data.directory || [])).catch(console.error);
    }, []);

    const filtered = useMemo(() => {
      if (!search.trim()) return directory;
      const q = search.toLowerCase();
      return directory.map(cat => ({
        ...cat,
        skills: (cat.skills || []).filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
      })).filter(cat => cat.skills.length > 0 || cat.name.toLowerCase().includes(q));
    }, [directory, search]);

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cream-300 pb-6">
          <div>
            <h1 class="font-serif text-3xl font-bold text-navy-900">Skill Directory</h1>
            <p class="text-warmgray-600 text-sm">Discover verified peer mentors and learners across all disciplines.</p>
          </div>
          <div class="w-full md:w-80 relative">
            <input
              type="text"
              value=${search}
              onChange=${e => setSearch(e.target.value)}
              placeholder="Search skills (e.g. React, Spanish, Piano)..."
              class="w-full pl-9 pr-3.5 py-2.5 bg-white border border-cream-300 rounded-xl text-xs focus:outline-none focus:border-navy-600"
            />
            <div class="absolute left-3 top-3 text-warmgray-400">
              <${Icon} name="search" class="w-4 h-4" />
            </div>
          </div>
        </div>

        <div class="space-y-10">
          ${filtered.map(cat => html`
            <div key=${cat.id} class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-navy-700 text-cream-100 flex items-center justify-center font-bold text-xs">
                  <${Icon} name="sparkles" class="w-4 h-4" />
                </div>
                <div>
                  <h2 class="font-serif text-xl font-bold text-navy-900">${cat.name}</h2>
                  <p class="text-xs text-warmgray-500">${cat.description}</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                ${cat.skills.map(s => html`
                  <div key=${s.id} class="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-3 hover:border-navy-300 transition-all">
                    <div class="flex items-start justify-between">
                      <h3 class="font-bold text-navy-900 text-sm">${s.name}</h3>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cream-200 text-navy-800">
                        ${s.total_members || 0} active
                      </span>
                    </div>
                    <p class="text-xs text-warmgray-600 line-clamp-2">${s.description}</p>
                    <div class="flex items-center justify-between pt-2 border-t border-cream-100 text-[11px]">
                      <span class="text-emerald-700 font-semibold">${s.teachers_count || 0} Teachers</span>
                      <span class="text-navy-700 font-semibold">${s.learners_count || 0} Learners</span>
                      <button onClick=${() => setActiveTab('matches')} class="font-bold text-navy-700 hover:underline">
                        Find Peers →
                      </button>
                    </div>
                  </div>
                `)}
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }
  window.SkillSwap.SkillsDirectoryView = SkillsDirectoryView;

  // ----------------------------------------------------
  // Public Profile View
  // ----------------------------------------------------
  function PublicProfileView({ username, currentUser, onProposeSwap, setActiveTab }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const u = username || currentUser?.username || 'alice';
      api('/api/public/profile?username=' + encodeURIComponent(u)).then(data => {
        setProfile(data.user);
      }).catch(console.error).finally(() => setLoading(false));
    }, [username, currentUser]);

    if (loading) {
      return html`<div class="p-20 text-center text-warmgray-500 font-serif">Loading profile...</div>`;
    }

    if (!profile) {
      return html`
        <div class="p-20 text-center space-y-3">
          <h2 class="font-serif text-2xl font-bold text-navy-900">User Profile Not Found</h2>
          <button onClick=${() => setActiveTab('matches')} class="px-4 py-2 bg-navy-700 text-white rounded-xl text-xs font-bold">Explore Matches</button>
        </div>
      `;
    }

    return html`
      <div class="max-w-4xl mx-auto px-4 py-10 space-y-8 text-left">
        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-sm space-y-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div class="flex items-center gap-5">
              <img src=${profile.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'} alt=${profile.name} class="w-20 h-20 rounded-2xl object-cover border-2 border-cream-200 shadow-md" />
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h1 class="font-serif text-2xl font-bold text-navy-900">${profile.name}</h1>
                  <span class="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">Verified Peer</span>
                </div>
                <p class="text-xs text-warmgray-500">@${profile.username || 'member'} · ${profile.location || 'Worldwide'}</p>
                <p class="text-xs font-medium text-navy-800">${profile.headline || 'SkillSwap Community Member'}</p>
              </div>
            </div>

            ${currentUser?.id !== profile.id ? html`
              <button onClick=${() => onProposeSwap({ user: profile })} class="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-xs shadow-md transition-all">
                Propose Skill Swap
              </button>
            ` : html`
              <button onClick=${() => setActiveTab('settings')} class="px-4 py-2 bg-cream-200 text-navy-900 rounded-xl font-bold text-xs">
                Edit Profile
              </button>
            `}
          </div>

          <p class="text-sm text-warmgray-700 leading-relaxed border-t border-cream-100 pt-4">
            ${profile.bio || 'No bio provided yet.'}
          </p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div class="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <div class="text-[10px] uppercase font-bold text-warmgray-500">Overall Trust</div>
              <div class="text-base font-bold text-navy-900 font-serif">★ ${profile.avg_rating || '5.0'} / 5</div>
            </div>
            <div class="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <div class="text-[10px] uppercase font-bold text-warmgray-500">Communication</div>
              <div class="text-base font-bold text-navy-900 font-serif">★ ${profile.avg_communication || '5.0'}</div>
            </div>
            <div class="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <div class="text-[10px] uppercase font-bold text-warmgray-500">Knowledge</div>
              <div class="text-base font-bold text-navy-900 font-serif">★ ${profile.avg_knowledge || '5.0'}</div>
            </div>
            <div class="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <div class="text-[10px] uppercase font-bold text-warmgray-500">Reliability</div>
              <div class="text-base font-bold text-navy-900 font-serif">★ ${profile.avg_reliability || '5.0'}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-4">
            <h3 class="font-serif text-lg font-bold text-navy-900 flex items-center gap-2">
              <${Icon} name="award" class="w-5 h-5 text-emerald-700" />
              Can Teach & Mentor
            </h3>
            <div class="space-y-3">
              ${(profile.teach_skills || []).map(s => html`
                <div key=${s.id} class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-navy-900">${s.skill_name}</span>
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px]">${s.level}</span>
                  </div>
                  <p class="text-[11px] text-warmgray-600">${s.description || 'Experienced in practical applications.'}</p>
                </div>
              `)}
            </div>
          </div>

          <div class="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-4">
            <h3 class="font-serif text-lg font-bold text-navy-900 flex items-center gap-2">
              <${Icon} name="sparkles" class="w-5 h-5 text-amber-700" />
              Wants to Learn
            </h3>
            <div class="space-y-3">
              ${(profile.learn_skills || []).map(s => html`
                <div key=${s.id} class="p-3.5 bg-cream-50 rounded-2xl border border-cream-200 space-y-1">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-navy-900">${s.skill_name}</span>
                    <span class="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">Target: ${s.level}</span>
                  </div>
                  <p class="text-[11px] text-warmgray-600">${s.description || 'Active learning objective.'}</p>
                </div>
              `)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.PublicProfileView = PublicProfileView;

  // ----------------------------------------------------
  // Settings View
  // ----------------------------------------------------
  function SettingsView({ user, onUserUpdated }) {
    const [name, setName] = useState(user.name || '');
    const [headline, setHeadline] = useState(user.headline || '');
    const [saved, setSaved] = useState(false);

    const handleSave = async (e) => {
      e.preventDefault();
      await api('/api/account/settings', {
        method: 'PUT',
        body: JSON.stringify({ name, headline })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onUserUpdated?.();
    };

    return html`
      <div class="max-w-3xl mx-auto px-4 py-8 space-y-6 text-left">
        <div>
          <h1 class="font-serif text-3xl font-bold text-navy-900">Account Preferences</h1>
          <p class="text-warmgray-600 text-xs sm:text-sm">Manage personal profile details.</p>
        </div>

        <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6 text-xs">
          ${saved ? html`<div class="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold">✓ Preferences successfully updated!</div>` : null}

          <form onSubmit=${handleSave} class="space-y-4">
            <div>
              <label class="block font-bold mb-1">Full Name</label>
              <input type="text" value=${name} onChange=${e => setName(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl" />
            </div>

            <div>
              <label class="block font-bold mb-1">Professional Headline</label>
              <input type="text" value=${headline} onChange=${e => setHeadline(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl" />
            </div>

            <button type="submit" class="px-6 py-3 bg-navy-700 text-white font-bold rounded-xl shadow-md">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    `;
  }
  window.SkillSwap.SettingsView = SettingsView;

  // ----------------------------------------------------
  // Help Center View
  // ----------------------------------------------------
  function HelpCenterView() {
    return html`
      <div class="max-w-4xl mx-auto px-4 py-10 space-y-8 text-left">
        <div>
          <h1 class="font-serif text-3xl font-bold text-navy-900">Help Center & FAQ</h1>
          <p class="text-warmgray-600 text-sm">Everything you need to know about reciprocal peer matching on SkillSwap.</p>
        </div>

        <div class="space-y-4 text-xs">
          <div class="bg-white p-6 rounded-3xl border border-cream-300 space-y-2">
            <h3 class="font-bold text-navy-900 text-sm">How does the 6-factor matching engine calculate synergy?</h3>
            <p class="text-warmgray-600 leading-relaxed">
              SkillSwap computes a weighted score: 35% skill overlap, 25% two-way reciprocity (you teach what they want to learn and vice versa), 15% level compatibility, 10% schedule overlap, 10% goal alignment, and 5% peer trust score.
            </p>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-cream-300 space-y-2">
            <h3 class="font-bold text-navy-900 text-sm">Are there any fees or token transactions?</h3>
            <p class="text-warmgray-600 leading-relaxed">
              No. SkillSwap is a pure peer-to-peer barter platform. You trade your knowledge directly in exchange for a peer's knowledge.
            </p>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.HelpCenterView = HelpCenterView;
})();