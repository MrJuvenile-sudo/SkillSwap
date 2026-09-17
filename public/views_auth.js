// public/views_auth.js - Refactored Landing, Directory, Category details, FAQs, Community Board & comments

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
  // Home Landing Page View (Pristine Hero, FAQ, Roadmap)

  // ----------------------------------------------------
  function HomeLandingView({ setActiveTab }) {
    const [searchVal, setSearchVal] = useState('');
    const [categories, setCategories] = useState([]);
    const [faqOpen, setFaqOpen] = useState({});
    const [featuredPeers, setFeaturedPeers] = useState([]);
    
    // Interactive Synergy Sandbox State
    const [sandboxTeach, setSandboxTeach] = useState('Python');
    const [sandboxLearn, setSandboxLearn] = useState('Figma');
    const [sandboxWorkflowStep, setSandboxWorkflowStep] = useState(0);

    const availableSandboxSkills = [
      'Python', 'React', 'Figma', 'UI/UX Design', 'Machine Learning', 
      'System Design', 'Spanish', 'Guitar', 'Product Management', 'SQL & Database Design'
    ];


    useEffect(() => {
      api('/api/skills/directory').then(data => {
        setCategories(data.categories || []);
      }).catch(console.error);
      api('/api/users/list').then(data => {
        setFeaturedPeers((data.users || []).slice(0, 3));
      }).catch(console.error);

    }, []);

    const handleSearchSubmit = (e) => {
      e.preventDefault();
      setActiveTab('skills-dir');
    };

    const toggleFaq = (index) => {
      setFaqOpen(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    };

    const popularTags = ['Python', 'Figma', 'React', 'Spanish', 'Machine Learning', 'System Design', 'Prompt Engineering'];

    const tracks = [
      {
        title: "Fullstack Engineering",
        icon: "code",
        badge: "High Demand",
        color: "bg-navy-50 text-navy-700 border-navy-200",
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Next.js"],
        description: "Swap frontend React skills for backend distributed systems and database indexing.",
        swappers: "3,400+ Active"
      },
      {
        title: "AI & Machine Learning",
        icon: "cpu",
        badge: "Trending 🔥",
        color: "bg-sky-50 text-indigo-900 border-indigo-200",
        skills: ["Python", "PyTorch", "LLM Fine-Tuning", "RAG Pipelines", "LangChain"],
        description: "Trade software architecture knowledge to master transformer models and prompt engineering.",
        swappers: "2,850+ Active"
      },
      {
        title: "Product Design & UX",
        icon: "layout",
        badge: "Popular",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Wireframing"],
        description: "Pair with engineers to build live portfolio prototypes while teaching design tokens.",
        swappers: "2,200+ Active"
      },
      {
        title: "Cloud & DevOps",
        icon: "server",
        badge: "Essential",
        color: "bg-purple-50 text-purple-800 border-purple-200",
        skills: ["Docker", "Kubernetes", "AWS", "CI/CD Pipelines", "Terraform"],
        description: "Exchange web dev expertise for automated cloud deployment and container orchestration.",
        swappers: "1,900+ Active"
      },
      {
        title: "Growth & Product Marketing",
        icon: "trending-up",
        badge: "Career",
        color: "bg-rose-50 text-rose-800 border-rose-200",
        skills: ["SEO", "Conversion Rate Optimization", "Analytics", "Copywriting", "GTM Strategy"],
        description: "Trade technical implementation skills for high-impact growth funnels and organic search.",
        swappers: "1,450+ Active"
      },
      {
        title: "Language Immersion",
        icon: "globe",
        badge: "Global",
        color: "bg-blue-50 text-blue-800 border-blue-200",
        skills: ["Spanish", "Japanese", "German", "French", "Mandarin"],
        description: "Practice real conversational fluency with native speakers in reciprocal language rooms.",
        swappers: "2,100+ Active"
      }
    ];

    const comparisonPoints = [
      { feature: "Cost per skill mastered", traditional: "$1,500 – $4,000", bootcamps: "$10,000 – $25,000", skillswap: "$0 (Pure Barter)" },
      { feature: "1-on-1 Personalized Attention", traditional: "❌ Rare (Recorded Videos)", bootcamps: "⚠️ Limited (1 TA per 30)", skillswap: "✅ 100% Dedicated 1:1" },
      { feature: "Bilateral Accountability", traditional: "❌ 6% Course Completion Rate", bootcamps: "⚠️ Strict Timelines", skillswap: "✅ Mutual Swapper Escrow" },
      { feature: "Real Portfolio Proof-of-Work", traditional: "❌ Cookie-cutter exercises", bootcamps: "⚠️ Generic capstones", skillswap: "✅ Live Collaborative Projects" },
      { feature: "Active Mentorship & Synergy", traditional: "❌ None", bootcamps: "⚠️ Fixed curriculum", skillswap: "✅ 6-Factor AI Matching" },
      { feature: "Reputation & Verified Badges", traditional: "❌ Generic certificate", bootcamps: "⚠️ PDF Certificate", skillswap: "✅ Verified Double-Blind Karma" }
    ];

    const workflowSteps = [
      {
        step: 1,
        title: "Define Skills Matrix",
        subtitle: "Takes 2 minutes",
        description: "List what you are proficient in (e.g. Python, Figma) and select the skills you want to conquer next. Set your weekly availability and preferred meeting hours.",
        action: "Build Matrix",
        highlight: "35% complementary synergy index unlocked"
      },
      {
        step: 2,
        title: "AI Synergy Engine Matching",
        subtitle: "Instant compatibility ranking",
        description: "Our algorithm ranks peers based on 6 key dimensions: complementary topics, proficiency parity, timezone overlap, schedule cadence, and community karma score.",
        action: "View Matches",
        highlight: "99.4% matching accuracy guarantee"
      },
      {
        step: 3,
        title: "Collaborative Exchange Workspace",
        subtitle: "Built-in accountability",
        description: "Accepted swaps launch a dedicated workspace with scheduled video calls (Zoom/Meet), milestone checklist, session minutes, and shared notes.",
        action: "Open Workspace",
        highlight: "Structured milestones prevent dropouts"
      },
      {
        step: 4,
        title: "Double-Blind Reviews & Karma",
        subtitle: "Earn verified reputation",
        description: "Conclude exchanges with confidential feedback. Blind reviews prevent bias and build your public Karma rating to unlock masterclass swap tiers.",
        action: "Build Karma",
        highlight: "Authentic peer reputation for career growth"
      }
    ];

    const faqs = [
      {
        q: "Is SkillSwapX really 100% free? Are there any hidden tokens or fees?",
        a: "Yes, 100% free forever. SkillSwapX is built on pure knowledge barter. You teach a peer what you know in exchange for them teaching you what you want to learn. There are no tokens, coins, credits, subscription paywalls, or processing fees."
      },
      {
        q: "How does the 6-factor synergy calculation engine match peers?",
        a: "Our algorithm calculates a multidimensional compatibility score: 35% skill complementarity (you teach what they want, they teach what you want), 25% proficiency levels, 15% timezone overlap, 10% target availability schedule, 10% milestone timeline, and 5% community trust ratings."
      },
      {
        q: "What happens if an exchange partner becomes unresponsive or misses sessions?",
        a: "Every workspace contains built-in anti-ghosting safeguards. If a partner misses sessions, you can cancel the agreement from your dashboard and log feedback. This adjusts their community reliability rating, keeping our network high-quality and accountable."
      },
      {
        q: "How are video calls and meetings structured?",
        a: "Every workspace contains an integrated meeting scheduler. You can schedule 1:1 video calls, add direct links (Zoom, Google Meet, or Microsoft Teams), write session agendas, and log meeting minutes right in your workspace."
      },
      {
        q: "Can I swap skills asynchronously if our timezones don't align?",
        a: "Absolutely! Many peers engage in asynchronous swaps: code reviews, Figma design critiques, pull request audits, and recorded walkthroughs via Loom or workspace notes."
      }
    ];

    return html`
      <div class="space-y-28 pb-24 text-center relative overflow-hidden bg-dots-pattern">
        <!-- Ambient Backdrop Glow -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[400px] bg-navy-500/8 blur-[140px] rounded-full pointer-events-none"></div>

        <!-- 1. Hero Section with Live Search & Badges -->
        <section class="relative pt-16 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-50/90 border border-navy-200/80 text-navy-800 text-xs font-extrabold tracking-wider shadow-xs animate-hero-badge">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Verified Reciprocal Peer-to-Peer Learning Network</span>
          </div>
          
          <h1 class="font-serif text-5xl sm:text-6xl lg:text-7xl font-extrabold text-navy-950 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            <span class="block animate-hero-title-1">Teach what you know.</span>
            <span class="inline-block italic bg-gradient-to-r from-navy-800 via-indigo-600 to-navy-900 bg-clip-text text-transparent animate-hero-title-2">Master what you need next.</span>
          </h1>
          
          <p class="text-base sm:text-lg text-warmgray-600 max-w-2xl mx-auto leading-relaxed font-semibold animate-hero-subtitle">
            Trade expertise 1-on-1 with verified practitioners. SkillSwapX matches schedule, levels, and mutual topics so you co-learn faster for free.
          </p>

          <form onSubmit=${handleSearchSubmit} class="max-w-2xl mx-auto pt-2">
            <div class="flex items-center bg-white p-2.5 rounded-2xl border border-cream-300 shadow-xl focus-within:border-navy-600 focus-within:ring-2 focus-within:ring-navy-100 transition-all duration-200">
              <div class="pl-3.5 text-warmgray-400">
                <${Icon} name="search" class="w-5.5 h-5.5" />

              </div>
              <input
                type="text"
                value=${searchVal}
                onChange=${e => setSearchVal(e.target.value)}
                placeholder="What do you want to learn? (e.g. Python, UI/UX, Rust, Spanish)..."
                class="w-full px-3.5 py-3 text-sm sm:text-base text-navy-955 placeholder-warmgray-400 focus:outline-none bg-transparent"
              />
              <button type="submit" class="px-7 py-3.5 bg-gradient-to-r from-navy-700 to-navy-800 hover:from-navy-800 hover:to-navy-900 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all shrink-0">
                Find Matches
              </button>
            </div>
            
            <!-- Quick Suggestion Tags -->
            <div class="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-warmgray-600">
              <span>Popular topics:</span>
              ${popularTags.map(tag => html`
                <button
                  type="button"
                  key=${tag}
                  onClick=${() => { setSearchVal(tag); setActiveTab('skills-dir'); }}
                  class="px-3 py-1.5 bg-cream-50 hover:bg-cream-200/60 border border-cream-300 rounded-lg text-navy-900 transition-colors shadow-2xs font-semibold"
                >
                  ${tag}
                </button>
              `)}
            </div>
          </form>

          <!-- Metrics Ticker -->
          <div class="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-14 text-warmgray-600 text-xs sm:text-sm font-semibold border-t border-cream-300/70 max-w-3xl mx-auto">
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-navy-900 text-lg sm:text-xl font-serif">14,200+</span> Swaps Completed
            </div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-navy-900 text-lg sm:text-xl font-serif">99.4%</span> Synergy Match Accuracy
            </div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-navy-900 text-lg sm:text-xl font-serif">★ 4.9 / 5</span> Average Karma
            </div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-navy-900 text-lg sm:text-xl font-serif">$0</span> Cost Forever
            </div>
          </div>

          <!-- Hero Graphical Visualization: Live Reciprocal Exchange Animation -->
          <div class="pt-10 max-w-4xl mx-auto relative">
            <div class="relative bg-gradient-to-b from-white/90 to-cream-50/90 rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-2xl backdrop-blur-xl overflow-hidden text-left">
              <!-- Glow Aura -->
              <div class="absolute -top-24 -right-24 w-72 h-72 bg-navy-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <!-- Top Bar -->
              <div class="flex items-center justify-between border-b border-cream-200/80 pb-4 mb-6">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-rose-400"></span>
                  <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                  <span class="ml-2 text-xs font-extrabold uppercase tracking-wider text-navy-900">Live Reciprocal Exchange Simulation</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="flex h-2 w-2 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Mutual Synergy: 98%
                  </span>
                </div>
              </div>

              <!-- 2-Way Exchange Graphic Grid -->
              <div class="grid grid-cols-1 md:grid-cols-11 items-center gap-4 relative">
                <!-- Peer 1 Card -->
                <div class="md:col-span-4 bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-3 card-hover-lift">
                  <div class="flex items-center gap-3">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=shubhank" class="w-12 h-12 rounded-2xl p-1 bg-navy-50 border border-navy-200 shadow-xs" />
                    <div>
                      <h4 class="font-bold text-navy-950 text-sm flex items-center gap-1">
                        Shubhank Parihar
                        <span class="text-navy-600 text-xs font-black" title="Verified Creator">✓</span>
                      </h4>
                      <p class="text-[11px] text-warmgray-500">MCA Final Year • JEC Jabalpur</p>
                      <p class="text-[10px] text-sky-700 font-semibold">📍 Jabalpur, MP (IST)</p>
                    </div>
                  </div>
                  <div class="space-y-1.5 pt-1 text-xs">
                    <div class="flex items-center justify-between p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                      <span class="text-[10px] font-bold uppercase text-emerald-800">Teaching:</span>
                      <span class="font-extrabold text-emerald-900">React & Node.js</span>
                    </div>
                    <div class="flex items-center justify-between p-2 rounded-xl bg-sky-50/80 border border-sky-200/80">
                      <span class="text-[10px] font-bold uppercase text-sky-800">Learning:</span>
                      <span class="font-extrabold text-sky-900">AI & PyTorch</span>
                    </div>
                  </div>
                </div>

                <!-- Animated SVG Data Beam Flow (Middle) -->
                <div class="md:col-span-3 flex flex-col items-center justify-center py-2 text-center space-y-2">
                  <div class="w-full relative flex items-center justify-center">
                    <svg class="w-full h-14 overflow-visible" viewBox="0 0 160 40">
                      <!-- Base Line -->
                      <line x1="10" y1="20" x2="150" y2="20" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="4 4" />
                      <!-- Animated Energy Flow Line -->
                      <line x1="10" y1="20" x2="150" y2="20" stroke="#0066EE" stroke-width="2.5" class="animate-beam" />
                      <!-- Left Arrow Pulse -->
                      <circle cx="30" cy="20" r="4" fill="#0066EE" class="animate-pulse" />
                      <!-- Right Arrow Pulse -->
                      <circle cx="130" cy="20" r="4" fill="#10B981" class="animate-pulse" />
                    </svg>
                    <!-- Floating Center Synergy Pill -->
                    <div class="absolute px-3 py-1 bg-navy-900 text-white rounded-full text-[10px] font-black shadow-lg border border-navy-700 flex items-center gap-1.5 animate-pulse-glow">
                      <span>⚡</span>
                      <span>Zero-Cost Barter</span>
                    </div>
                  </div>
                  <span class="text-[10px] text-warmgray-500 font-bold uppercase tracking-wider">
                    Mutual 1:1 Co-Mentorship
                  </span>
                </div>

                <!-- Peer 2 Card -->
                <div class="md:col-span-4 bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-3 card-hover-lift">
                  <div class="flex items-center gap-3">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=priya_architect" class="w-12 h-12 rounded-2xl p-1 bg-navy-50 border border-navy-200 shadow-xs" />
                    <div>
                      <h4 class="font-bold text-navy-950 text-sm flex items-center gap-1">
                        Priya Sharma
                        <span class="text-navy-600 text-xs font-black" title="Verified Practitioner">✓</span>
                      </h4>
                      <p class="text-[11px] text-warmgray-500">Senior Cloud Architect</p>
                      <p class="text-[10px] text-sky-700 font-semibold">📍 Bengaluru, Karnataka (IST)</p>
                    </div>
                  </div>
                  <div class="space-y-1.5 pt-1 text-xs">
                    <div class="flex items-center justify-between p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                      <span class="text-[10px] font-bold uppercase text-emerald-800">Teaching:</span>
                      <span class="font-extrabold text-emerald-900">AI & PyTorch</span>
                    </div>
                    <div class="flex items-center justify-between p-2 rounded-xl bg-sky-50/80 border border-sky-200/80">
                      <span class="text-[10px] font-bold uppercase text-sky-800">Learning:</span>
                      <span class="font-extrabold text-sky-900">React & Node.js</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Interactive Collaboration Highlights Footer -->
              <div class="mt-6 pt-4 border-t border-cream-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg bg-cream-100 text-navy-900 text-[11px] font-bold border border-cream-300">
                    📹 Real-time Classroom & Audio
                  </span>
                  <span class="px-2.5 py-1 rounded-lg bg-cream-100 text-navy-900 text-[11px] font-bold border border-cream-300">
                    📝 Real-time Notes & Scratchpad
                  </span>
                  <span class="px-2.5 py-1 rounded-lg bg-cream-100 text-navy-900 text-[11px] font-bold border border-cream-300">
                    💻 Live Multi-Lang Code Sandbox
                  </span>
                </div>
                <button onClick=${() => setActiveTab('signup')} class="text-xs font-extrabold text-navy-700 hover:text-navy-900 hover:underline flex items-center gap-1">
                  Experience Live Synergy →
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Interactive Synergy Sandbox / Simulator Widget -->
        <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-gradient-to-br from-navy-900 via-navy-950 to-navy-955 rounded-3xl p-8 sm:p-10 text-white border border-navy-700/40 shadow-2xl space-y-8 relative overflow-hidden text-left">
            <div class="absolute top-0 right-0 w-80 h-80 bg-navy-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-6">
              <div class="space-y-1">
                <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-navy-800 text-navy-200 border border-navy-700/60 inline-block">
                  ⚡ Interactive Simulator
                </span>
                <h2 class="font-serif text-2xl sm:text-3xl font-bold">Test Your Synergy Match Potential</h2>
                <p class="text-xs sm:text-sm text-cream-200/80">Select what you can teach and what you want to learn to see the real-time algorithm in action.</p>
              </div>
              <div class="text-right shrink-0 bg-navy-800/80 p-3 rounded-2xl border border-navy-700 text-center">
                <span class="text-[10px] uppercase font-bold text-cream-200/70 block">Calculated Synergy</span>
                <span class="font-serif text-3xl font-extrabold text-sky-400">96%</span>
              </div>
            </div>

            <!-- Interactive Skill Selectors -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2 bg-navy-800/40 p-5 rounded-2xl border border-navy-700/50">
                <label class="block text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Step 1: What can you offer to teach?
                </label>
                <select
                  value=${sandboxTeach}
                  onChange=${e => setSandboxTeach(e.target.value)}
                  class="w-full p-3 bg-navy-900 border border-navy-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-navy-500"
                >
                  ${availableSandboxSkills.map(s => html`<option key=${s} value=${s}>${s} (Proficient)</option>`)}
                </select>
                <p class="text-[10px] text-cream-200/60">You will teach this in 1:1 sessions or async pairing.</p>
              </div>

              <div class="space-y-2 bg-navy-800/40 p-5 rounded-2xl border border-navy-700/50">
                <label class="block text-xs font-bold uppercase tracking-wider text-sky-400">
                  Step 2: What skill do you want to learn?
                </label>
                <select
                  value=${sandboxLearn}
                  onChange=${e => setSandboxLearn(e.target.value)}
                  class="w-full p-3 bg-navy-900 border border-navy-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-navy-500"
                >
                  ${availableSandboxSkills.map(s => html`<option key=${s} value=${s}>${s} (Target Goal)</option>`)}
                </select>
                <p class="text-[10px] text-cream-200/60">A matched partner will guide and review your work.</p>
              </div>
            </div>

            <!-- Live Match Preview Card -->
            <div class="bg-navy-950/70 p-6 rounded-2xl border border-navy-800 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-navy-300">Live Peer Match Simulation</span>
                <span class="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                  Optimal Match Available
                </span>
              </div>

              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3.5">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" class="w-12 h-12 rounded-xl object-cover ring-2 ring-navy-600" />
                  <div>
                    <h4 class="font-bold text-white text-base">Elena Rostova <span class="text-xs font-normal text-cream-200/70">(Senior Practitioner)</span></h4>
                    <p class="text-xs text-cream-200/70">★ 4.98 Karma · 18 Swaps Completed · UTC-4 (New York)</p>
                  </div>
                </div>
                <button onClick=${() => setActiveTab('signup')} class="px-6 py-3 bg-gradient-to-r from-navy-700 to-indigo-700 hover:from-navy-800 hover:to-indigo-800 text-navy-950 font-extrabold rounded-xl shadow-lg transition-all text-xs shrink-0">
                  Claim Match & Start Free →
                </button>
              </div>

              <!-- Synergy Breakdown Chips -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
                <div class="p-2.5 bg-navy-900/80 rounded-xl border border-navy-800">
                  <span class="text-cream-200/60 block text-[9px] uppercase font-bold">They Teach:</span>
                  <span class="font-bold text-sky-300">${sandboxLearn}</span>
                </div>
                <div class="p-2.5 bg-navy-900/80 rounded-xl border border-navy-800">
                  <span class="text-cream-200/60 block text-[9px] uppercase font-bold">They Want:</span>
                  <span class="font-bold text-emerald-300">${sandboxTeach}</span>
                </div>
                <div class="p-2.5 bg-navy-900/80 rounded-xl border border-navy-800">
                  <span class="text-cream-200/60 block text-[9px] uppercase font-bold">Overlap Timezone:</span>
                  <span class="font-bold text-white">4.5 hrs / day</span>
                </div>
                <div class="p-2.5 bg-navy-900/80 rounded-xl border border-navy-800">
                  <span class="text-cream-200/60 block text-[9px] uppercase font-bold">Commitment:</span>
                  <span class="font-bold text-white">2 hrs / week</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. Popular Exchange Tracks & Skill Paths -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
          <div class="text-center space-y-3 max-w-2xl mx-auto">
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-navy-950">Curated Exchange Tracks</h2>
            <p class="text-warmgray-600 text-sm">Explore our most popular reciprocal learning tracks engineered for rapid career growth and practical mastery.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${tracks.map((t, idx) => html`
              <div key=${idx} class="bg-white rounded-3xl p-7 border border-cream-300 shadow-sm hover:shadow-xl hover:border-navy-300 transition-all duration-300 flex flex-col justify-between space-y-5">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${t.color}">
                      ${t.badge}
                    </span>
                    <span class="text-[11px] font-semibold text-warmgray-500">
                      👥 ${t.swappers}
                    </span>
                  </div>

                  <div>
                    <h3 class="font-serif text-xl font-bold text-navy-950">${t.title}</h3>
                    <p class="text-xs text-warmgray-600 mt-1.5 leading-relaxed">${t.description}</p>
                  </div>

                  <div class="flex flex-wrap gap-1.5 pt-2 border-t border-cream-100">
                    ${t.skills.map(s => html`
                      <span key=${s} class="px-2 py-0.5 bg-cream-100 text-navy-900 rounded-md text-[10px] font-semibold">
                        ${s}
                      </span>
                    `)}
                  </div>
                </div>

                <button
                  onClick=${() => { setSearchVal(t.skills[0]); setActiveTab('skills-dir'); }}
                  class="w-full py-2.5 bg-cream-50 hover:bg-navy-700 hover:text-white text-navy-800 font-bold text-xs rounded-xl border border-cream-300 transition-all duration-200 text-center"
                >
                  Explore ${t.title} Peers →
                </button>
              </div>
            `)}
          </div>
        </section>

        <!-- 4. "Why Peer Barter Beats Paid Courses" Comparison Table -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
          <div class="text-center space-y-3 max-w-2xl mx-auto">
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-navy-50 text-navy-800 border border-navy-200 inline-block">
              Value Proposition
            </span>
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-navy-950">Why Peer Barter Beats Expensive Courses</h2>
            <p class="text-warmgray-600 text-sm">Compare SkillSwapX to traditional asynchronous video courses, $15k bootcamps, and expensive private tutoring.</p>
          </div>

          <div class="bg-white rounded-3xl border border-cream-300 shadow-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-cream-100/80 border-b border-cream-300 text-navy-950 font-bold uppercase tracking-wider text-[10px]">
                    <th class="p-4 sm:p-5">Learning Model Dimensions</th>
                    <th class="p-4 sm:p-5 text-warmgray-500">Video Courses (Udemy/Coursera)</th>
                    <th class="p-4 sm:p-5 text-warmgray-500">Coding Bootcamps</th>
                    <th class="p-4 sm:p-5 bg-navy-50 text-navy-900 font-black border-l border-r border-navy-200">
                      SkillSwapX (Peer Barter)
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-cream-100">
                  ${comparisonPoints.map((row, rIdx) => html`
                    <tr key=${rIdx} class="hover:bg-cream-50/40 transition-colors">
                      <td class="p-4 sm:p-5 font-bold text-navy-950">${row.feature}</td>
                      <td class="p-4 sm:p-5 text-warmgray-600">${row.traditional}</td>
                      <td class="p-4 sm:p-5 text-warmgray-600">${row.bootcamps}</td>
                      <td class="p-4 sm:p-5 bg-navy-50/60 font-extrabold text-navy-900 border-l border-r border-navy-200">
                        ${row.skillswap}
                      </td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- 5. Detailed Interactive 4-Step Roadmap Showcase -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white/60 py-16 rounded-3xl border border-cream-300 shadow-sm text-left space-y-12">
          <div class="text-center space-y-3 max-w-2xl mx-auto">
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-navy-950">The Reciprocal Learning Roadmap</h2>
            <p class="text-warmgray-600 text-sm">Four structured phases engineered to align scheduling, credentials, and goals for direct peer-to-peer success.</p>
          </div>

          <!-- Step Tabs -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-cream-200 pb-6">
            ${workflowSteps.map((ws, i) => html`
              <button
                key=${ws.step}
                onClick=${() => setSandboxWorkflowStep(i)}
                class="p-4 rounded-2xl text-left transition-all duration-200 border ${
                  sandboxWorkflowStep === i
                    ? 'bg-navy-700 text-white shadow-md border-navy-700'
                    : 'bg-white text-navy-950 border-cream-300 hover:bg-cream-100'
                }"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-black uppercase tracking-wider opacity-80">Phase 0${ws.step}</span>
                  <span class="w-2 h-2 rounded-full ${sandboxWorkflowStep === i ? 'bg-sky-400' : 'bg-cream-300'}"></span>
                </div>
                <h4 class="font-bold text-xs sm:text-sm truncate">${ws.title}</h4>
              </button>
            `)}
          </div>

          <!-- Active Step Deep Dive -->
          <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div class="lg:col-span-2 space-y-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-[10px] font-bold border border-navy-200">
                <span>Phase 0${workflowSteps[sandboxWorkflowStep].step}</span>
                <span>•</span>
                <span>${workflowSteps[sandboxWorkflowStep].subtitle}</span>
              </div>
              <h3 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950">
                ${workflowSteps[sandboxWorkflowStep].title}
              </h3>
              <p class="text-sm text-warmgray-600 leading-relaxed max-w-xl">
                ${workflowSteps[sandboxWorkflowStep].description}
              </p>
              <div class="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold">
                🛡️ ${workflowSteps[sandboxWorkflowStep].highlight}
              </div>
            </div>

            <div class="bg-cream-50 p-6 rounded-2xl border border-cream-200 text-center space-y-4">
              <span class="text-[10px] font-extrabold uppercase text-warmgray-500 tracking-wider block">Ready to start this step?</span>
              <button
                onClick=${() => setActiveTab('signup')}
                class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                ${workflowSteps[sandboxWorkflowStep].action} →
              </button>
              <p class="text-[10px] text-warmgray-500">Free account · No credit card required</p>
            </div>
          </div>
        </section>

        <!-- 6. Featured Active Practitioners Carousel -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
          <div class="text-center space-y-2 max-w-xl mx-auto">
            <h2 class="font-serif text-3xl font-bold text-navy-950">Featured Active Practitioners</h2>
            <p class="text-warmgray-600 text-sm">Join verified practitioners exchanging skills inside active workspaces.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${featuredPeers.map(p => html`
              <div key=${p.id} class="bg-white rounded-3xl p-6.5 border border-cream-300 text-left space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                <div class="space-y-3.5">
                  <div class="flex items-center gap-3">
                    <img src=${p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} class="w-11 h-11 rounded-xl object-cover border border-cream-200" />
                    <div>
                      <h4 class="font-bold text-navy-900 text-sm">${p.name}</h4>
                      <p class="text-[10px] text-warmgray-500 font-semibold">${p.location || 'Remote'} · ★ ${p.avg_rating || '5.0'} (${p.reviews_count || 0} reviews)</p>
                    </div>
                  </div>
                  <p class="text-[11px] font-semibold text-navy-950 line-clamp-1 border-t border-cream-100 pt-2">${p.headline || 'SkillSwap Community Practitioner'}</p>
                </div>
                <div class="flex items-center justify-between pt-3 text-[11px] font-bold text-navy-700">
                  <span>${p.teach_count || 2} skills to teach</span>
                  <button onClick=${() => { setSearchVal(p.username); setActiveTab('skills-dir'); }} class="hover:underline">View profile →</button>

                </div>
              </div>
            `)}
          </div>
        </section>
        <!-- 7. Trust, Escrow & Safety Architecture -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div class="text-center space-y-2 max-w-xl mx-auto">
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block">
              Network Safety
            </span>
            <h2 class="font-serif text-3xl font-bold text-navy-950">Engineered for Trust & Accountability</h2>
            <p class="text-warmgray-600 text-sm">We combine algorithmic matching with strict peer reputation to prevent ghosting and ensure productive learning.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-sm space-y-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200">
                🔒
              </div>
              <h3 class="font-serif text-lg font-bold text-navy-950">Double-Blind Reviews</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">
                Reviews remain completely hidden until both parties submit feedback, eliminating revenge ratings and guaranteeing honest quality scoring.
              </p>
            </div>

            <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-sm space-y-3">
              <div class="w-10 h-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center font-bold text-lg border border-navy-200">
                ⚡
              </div>
              <h3 class="font-serif text-lg font-bold text-navy-950">Anti-Ghosting Karma</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">
                Unexcused missed sessions or premature workspace abandonments adjust user reliability metrics, protecting committed practitioners.
              </p>
            </div>

            <div class="p-6 bg-white border border-cream-300 rounded-3xl shadow-sm space-y-3">
              <div class="w-10 h-10 rounded-xl bg-sky-50 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200">
                🛡️
              </div>
              <h3 class="font-serif text-lg font-bold text-navy-950">Admin Mediation & Reports</h3>
              <p class="text-xs text-warmgray-600 leading-relaxed">
                Report suspicious profiles or solicitation directly to our 24/7 admin moderation console for immediate investigation and ban enforcement.
              </p>
            </div>
          </div>
        </section>

        <!-- 8. FAQ Accordion Section -->
        <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div class="text-center space-y-2">
            <h2 class="font-serif text-3xl font-bold text-navy-950">Frequently Asked Questions</h2>
            <p class="text-warmgray-600 text-sm">Everything you need to know about peer matching, safety, and workspaces.</p>
          </div>

          <div class="space-y-4 text-left">
            ${faqs.map((faq, index) => {
              const isOpen = !!faqOpen[index];
              return html`
                <div key=${index} class="bg-white rounded-2xl border border-cream-300 shadow-sm overflow-hidden text-left transition-all duration-200">
                  <button
                    onClick=${() => toggleFaq(index)}
                    class="w-full px-6 py-4.5 flex items-center justify-between text-navy-950 font-bold text-sm focus:outline-none hover:bg-cream-50/50"
                  >
                    <span>${faq.q}</span>
                    <span class="text-navy-500 text-lg transition-transform duration-200 transform ${isOpen ? 'rotate-180' : ''}">▼</span>
                  </button>
                  ${isOpen ? html`
                    <div class="px-6 pb-5 pt-1 text-xs sm:text-sm text-warmgray-600 border-t border-cream-100 leading-relaxed bg-cream-50/20">
                      ${faq.a}
                    </div>
                  ` : null}
                </div>
              `;
            })}
          </div>

          <div class="text-center pt-2">
            <button onClick=${() => setActiveTab('faq')} class="text-xs font-bold text-navy-700 hover:underline">
              View all platform FAQs →
            </button>
          </div>
        </section>

        <!-- 9. Final High-Impact Conversion CTA Section -->
        <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="bg-gradient-to-r from-navy-700 via-navy-800 to-navy-900 rounded-3xl p-10 sm:p-14 text-white text-center space-y-6 shadow-2xl border border-navy-600/50 relative overflow-hidden">
            <div class="space-y-3 relative z-10 max-w-2xl mx-auto">
              <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Ready to trade skills with verified peers?
              </h2>
              <p class="text-sm sm:text-base text-cream-200/90 leading-relaxed">
                Join thousands of software engineers, designers, creators, and practitioners swapping expert knowledge every single day.
              </p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3.5 pt-2 relative z-10">
              <button
                onClick=${() => setActiveTab('signup')}
                class="px-8 py-4 bg-white hover:bg-cream-100 text-navy-950 font-extrabold text-sm rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Create Free Account Now →
              </button>
              <button
                onClick=${() => setActiveTab('skills-dir')}
                class="px-7 py-4 bg-navy-800/80 hover:bg-navy-800 text-white font-bold text-sm rounded-xl border border-navy-500 transition-all duration-200"
              >
                Explore Skills Directory
              </button>
            </div>

            <div class="flex items-center justify-center gap-6 text-xs text-cream-200/70 pt-4 relative z-10 font-semibold">
              <span>✓ 100% Free Knowledge Barter</span>
              <span>✓ Zero Credit Card Required</span>
              <span>✓ 1-on-1 Dedicated Workspaces</span>
            </div>
          </div>
        </section>

      </div>
    `;
  }
  window.SkillSwap.HomeLandingView = HomeLandingView;

  // ----------------------------------------------------
  // Password Policy Helper
  // ----------------------------------------------------
  function checkPasswordRules(pwd) {
    const p = pwd || '';
    return {
      hasLength: p.length >= 8,
      hasCapStart: /^[A-Z]/.test(p),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(p)
    };
  }

  // ----------------------------------------------------
  // Signup View
  // ----------------------------------------------------
  function SignupView({ setActiveTab, onAuthSuccess }) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [headline, setHeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const rules = useMemo(() => checkPasswordRules(password), [password]);
    const isPasswordValid = rules.hasLength && rules.hasCapStart && rules.hasSymbol;

    const handleSignup = async (e) => {
      e.preventDefault();
      if (!isPasswordValid) {
        setError('Please ensure your password satisfies all security requirements: 8+ digits/chars, starts with a Capital letter, and contains at least 1 symbol.');
        return;
      }

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
      <div class="max-w-md mx-auto my-14 px-4 text-left animate-fadeIn relative">
        <!-- Ambient Glowing Backdrop Aura -->
        <div class="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="bg-white/95 rounded-3xl p-8 border border-cream-300 shadow-2xl backdrop-blur-xl space-y-6 relative">
          <div class="space-y-2 text-center">
            <div class="relative inline-block">
              <img src="/logo-icon.png" alt="SkillSwapX Logo" class="w-14 h-14 rounded-2xl object-contain mx-auto shadow-md bg-white p-1 border border-cream-200 animate-float-slow" />
              <span class="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <h2 class="font-serif text-2xl font-bold text-navy-950 mt-2">Create your account</h2>
            <p class="text-xs text-warmgray-500 font-medium">Join verified peer practitioners exchanging skills across India</p>
          </div>

          ${error ? html`<div class="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-fadeIn">${error}</div>` : null}

          <form onSubmit=${handleSignup} class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-navy-950 mb-1">Full Name</label>
              <input required type="text" value=${name} onInput=${e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" class="w-full px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold transition-colors" />
            </div>

            <div>
              <label class="block font-bold text-navy-950 mb-1">Username</label>
              <input required type="text" value=${username} onInput=${e => setUsername(e.target.value)} placeholder="e.g. rahul_dev" class="w-full px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold transition-colors" />
            </div>

            <div>
              <label class="block font-bold text-navy-950 mb-1">Email Address</label>
              <input required type="email" value=${email} onInput=${e => setEmail(e.target.value)} placeholder="e.g. rahul@example.com" class="w-full px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold transition-colors" />
            </div>

            <div>
              <label class="block font-bold text-navy-950 mb-1">Password</label>
              <div class="relative flex items-center">
                <input
                  required
                  type=${showPassword ? "text" : "password"}
                  value=${password}
                  onInput=${e => setPassword(e.target.value)}
                  placeholder="Min 8 chars, Capital start, 1 symbol"
                  class="w-full pr-11 px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold transition-colors"
                />
                <button
                  type="button"
                  onClick=${() => setShowPassword(!showPassword)}
                  class="absolute right-3 p-1 text-warmgray-500 hover:text-navy-800 transition-colors focus:outline-none"
                  title=${showPassword ? "Hide password" : "Show password"}
                >
                  <${Icon} name=${showPassword ? "eye-off" : "eye"} class="w-4 h-4" />
                </button>
              </div>

              <!-- Password Policy Real-time Requirements Indicator -->
              <div class="mt-2.5 p-3 bg-cream-50/90 rounded-xl border border-cream-200/80 space-y-1.5 text-[11px]">
                <div class="flex items-center gap-2 ${rules.hasLength ? 'text-emerald-700 font-bold' : 'text-warmgray-500'}">
                  <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${rules.hasLength ? 'bg-emerald-100 text-emerald-800 font-black' : 'bg-cream-200 text-warmgray-500'}">${rules.hasLength ? '✓' : '○'}</span>
                  <span>Minimum 8 characters length</span>
                </div>
                <div class="flex items-center gap-2 ${rules.hasCapStart ? 'text-emerald-700 font-bold' : 'text-warmgray-500'}">
                  <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${rules.hasCapStart ? 'bg-emerald-100 text-emerald-800 font-black' : 'bg-cream-200 text-warmgray-500'}">${rules.hasCapStart ? '✓' : '○'}</span>
                  <span>First letter must be Capital (A-Z)</span>
                </div>
                <div class="flex items-center gap-2 ${rules.hasSymbol ? 'text-emerald-700 font-bold' : 'text-warmgray-500'}">
                  <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${rules.hasSymbol ? 'bg-emerald-100 text-emerald-800 font-black' : 'bg-cream-200 text-warmgray-500'}">${rules.hasSymbol ? '✓' : '○'}</span>
                  <span>Must include at least 1 symbol (!@#$%...)</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block font-bold text-navy-950 mb-1">Headline / Tech Interest</label>
              <input type="text" value=${headline} onInput=${e => setHeadline(e.target.value)} placeholder="e.g. Student at JEC / Frontend Learner" class="w-full px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold transition-colors" />
            </div>

            <button type="submit" disabled=${loading || (password.length > 0 && !isPasswordValid)} class="w-full py-3.5 bg-gradient-to-r from-navy-700 to-navy-800 hover:from-navy-800 hover:to-navy-900 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm mt-2 flex items-center justify-center gap-2">
              ${loading ? html`
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Creating Account...</span>
              ` : 'Complete & Launch Onboarding →'}
            </button>
          </form>

          <div class="text-center pt-3 border-t border-cream-200 text-xs text-warmgray-600">
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
    const [showPassword, setShowPassword] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e, overrideId, overridePass) => {
      if (e && e.preventDefault) e.preventDefault();
      const loginId = overrideId !== undefined ? overrideId : identifier;
      const loginPass = overridePass !== undefined ? overridePass : password;

      if (!loginId || !loginPass) {
        setError('Please enter your email/username and password.');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await api('/api/account/login', {
          method: 'POST',
          body: JSON.stringify({ email: loginId, password: loginPass, rememberMe: true })
        });
        if (res.user) {
          onAuthSuccess(res.user);
          const isAdmin = res.user.role === 'ADMIN' || res.user.role === 'SUPER_ADMIN';
          setActiveTab(isAdmin ? 'admin' : 'dashboard');
        }
      } catch (err) {
        setError(err.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    };

    const demoAccounts = [
      { label: 'Super Admin', id: 'admin', pass: 'Admin123!', role: 'SUPER_ADMIN', icon: '🛡️', desc: 'Full Console & Moderation' },
      { label: 'Shubhank (JEC)', id: 'shubhank', pass: 'Admin123!', role: 'Creator', icon: '🎓', desc: 'MCA Full-Stack Dev' },
      { label: 'Anushka (JEC)', id: 'anushka', pass: 'Admin123!', role: 'Creator', icon: '🎨', desc: 'MCA UI/UX Lead' },
      { label: 'Priya (Bengaluru)', id: 'priya_architect', pass: 'Admin123!', role: 'Mentor', icon: '☁️', desc: 'Cloud Architect' }
    ];

    const fillAndLogin = (acc) => {
      setIdentifier(acc.id);
      setPassword(acc.pass);
      handleLogin(null, acc.id, acc.pass);
    };

    return html`
      <div class="max-w-md mx-auto my-14 px-4 text-left animate-fadeIn relative">
        <!-- Ambient Glowing Backdrop Aura -->
        <div class="absolute -top-12 -left-12 w-64 h-64 bg-navy-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="bg-white/95 rounded-3xl p-8 border border-cream-300 shadow-2xl backdrop-blur-xl space-y-6 relative">
          <div class="space-y-2 text-center">
            <div class="relative inline-block">
              <img src="/logo-icon.png" alt="SkillSwapX Logo" class="w-14 h-14 rounded-2xl object-contain mx-auto shadow-md bg-white p-1 border border-cream-200 animate-float-slow" />
              <span class="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <h2 class="font-serif text-2xl font-bold text-navy-950 mt-2">Welcome to SkillSwapX</h2>
            <p class="text-xs text-warmgray-500 font-medium">Sign in with your verified ID or 1-click demo accounts</p>
          </div>

          <!-- ⚡ 1-Click Quick Demo Sign-In Panel -->
          <div class="p-4 bg-gradient-to-br from-navy-50/90 via-cream-50/70 to-indigo-50/40 rounded-2xl border border-navy-100 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-black uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                <span class="text-amber-500">⚡</span>
                <span>Instant 1-Click Demo Logins</span>
              </span>
              <span class="text-[9.5px] font-bold text-navy-700 bg-white px-2 py-0.5 rounded-full border border-navy-100 shadow-2xs">
                Password: Admin123!
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1">
              ${demoAccounts.map(acc => html`
                <button
                  type="button"
                  key=${acc.id}
                  onClick=${() => fillAndLogin(acc)}
                  disabled=${loading}
                  class="p-2.5 bg-white hover:bg-navy-50/80 border border-cream-200 hover:border-navy-300 rounded-xl text-left transition-all duration-150 shadow-2xs hover:shadow-xs group flex flex-col justify-between"
                  title="Click to auto-fill & login as ${acc.label}"
                >
                  <div class="flex items-center gap-1.5">
                    <span class="text-base">${acc.icon}</span>
                    <span class="font-bold text-navy-950 text-xs truncate group-hover:text-navy-700">${acc.label}</span>
                  </div>
                  <span class="text-[10px] text-warmgray-500 mt-1 truncate">${acc.desc}</span>
                </button>
              `)}
            </div>
          </div>

          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-cream-200"></div>
            <span class="flex-shrink mx-3 text-[10px] uppercase font-bold text-warmgray-400">or sign in with credentials</span>
            <div class="flex-grow border-t border-cream-200"></div>
          </div>

          ${error ? html`<div class="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold animate-fadeIn">${error}</div>` : null}

          <form onSubmit=${handleLogin} class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-navy-950 mb-1">Email or Username</label>
              <input
                required
                type="text"
                value=${identifier}
                onInput=${e => setIdentifier(e.target.value)}
                placeholder="e.g. admin or shubhank"
                class="w-full px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold transition-colors"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-navy-950">Password</label>
                <button
                  type="button"
                  onClick=${() => setActiveTab('forgot-password')}
                  class="font-semibold text-navy-700 hover:text-navy-900 hover:underline text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
              <div class="relative flex items-center">
                <input
                  required
                  type=${showPassword ? "text" : "password"}
                  value=${password}
                  onInput=${e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  class="w-full pr-11 px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold transition-colors"
                />
                <button
                  type="button"
                  onClick=${() => setShowPassword(!showPassword)}
                  class="absolute right-3 p-1 text-warmgray-500 hover:text-navy-800 transition-colors focus:outline-none"
                  title=${showPassword ? "Hide password" : "Show password"}
                >
                  <${Icon} name=${showPassword ? "eye-off" : "eye"} class="w-4 h-4" />
                </button>
              </div>
            </div>

            <button type="submit" disabled=${loading} class="w-full py-3.5 bg-gradient-to-r from-navy-700 to-navy-800 hover:from-navy-800 hover:to-navy-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm flex items-center justify-center gap-2">
              ${loading ? html`
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              ` : 'Sign In to SkillSwapX →'}
            </button>
          </form>

          <div class="text-center pt-3 border-t border-cream-200 text-xs text-warmgray-600">
            Don't have an account? <button onClick=${() => setActiveTab('signup')} class="font-bold text-navy-700 hover:underline">Sign up free</button>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.LoginView = LoginView;

  // ----------------------------------------------------
  // Forgot Password View
  // ----------------------------------------------------
  function ForgotPasswordView({ setActiveTab }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [debugToken, setDebugToken] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        setError('');
        setMessage('');
        const res = await api('/api/account/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
        setMessage(res.message || 'If an account exists with that email, a password reset link has been dispatched.');
        if (res.debug_reset_token) {
          setDebugToken(res.debug_reset_token);
        }
      } catch (err) {
        setError(err.message || 'Failed to submit password reset request.');
      } finally {
        setLoading(false);
      }
    };

    return html`
      <div class="max-w-md mx-auto my-16 px-4 text-left animate-fadeIn">
        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-xl space-y-6">
          <div class="space-y-2 text-center">
            <div class="w-14 h-14 rounded-2xl bg-navy-50 border border-navy-200 flex items-center justify-center mx-auto shadow-sm">
              <span class="text-2xl">🔐</span>
            </div>
            <h2 class="font-serif text-2xl font-bold text-navy-950 mt-3">Reset Password</h2>
            <p class="text-xs text-warmgray-500">Enter your registered email address to receive reset instructions</p>
          </div>

          ${error ? html`<div class="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">${error}</div>` : null}
          ${message ? html`
            <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs space-y-3">
              <p class="font-semibold">${message}</p>
              ${debugToken ? html`
                <div class="p-3 bg-white rounded-lg border border-emerald-300 text-navy-900 space-y-1.5">
                  <span class="text-[10px] font-bold text-warmgray-500 uppercase tracking-wider block">Security Reset Token:</span>
                  <code class="text-xs font-mono font-bold select-all bg-cream-100 px-2 py-0.5 rounded">${debugToken}</code>
                  <div class="pt-2">
                    <button
                      type="button"
                      onClick=${() => {
                        window._presetResetToken = debugToken;
                        setActiveTab('reset-password');
                      }}
                      class="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors"
                    >
                      Continue to Set New Password →
                    </button>
                  </div>
                </div>
              ` : null}
            </div>
          ` : null}

          <form onSubmit=${handleSubmit} class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-navy-950 mb-1">Registered Email Address</label>
              <input
                required
                type="email"
                value=${email}
                onInput=${e => setEmail(e.target.value)}
                class="w-full px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold"
              />
            </div>

            <button type="submit" disabled=${loading} class="w-full py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-lg transition-all duration-200 text-sm">
              ${loading ? 'Sending Instructions...' : 'Send Password Reset Token'}
            </button>
          </form>

          <div class="flex items-center justify-between pt-4 border-t border-cream-200 text-xs text-warmgray-600">
            <button onClick=${() => setActiveTab('login')} class="font-bold text-navy-700 hover:underline">← Back to Login</button>
            <button onClick=${() => setActiveTab('reset-password')} class="font-semibold text-warmgray-500 hover:text-navy-700">Have a token? Reset here →</button>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.ForgotPasswordView = ForgotPasswordView;

  // ----------------------------------------------------
  // Reset Password View
  // ----------------------------------------------------
  function ResetPasswordView({ setActiveTab }) {
    const [token, setToken] = useState(window._presetResetToken || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const rules = useMemo(() => checkPasswordRules(newPassword), [newPassword]);
    const isPasswordValid = rules.hasLength && rules.hasCapStart && rules.hasSymbol;

    const handleReset = async (e) => {
      e.preventDefault();
      if (!isPasswordValid) {
        setError('Password must satisfy security policies: 8+ chars, start with a Capital letter, and contain at least 1 symbol.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match. Please re-check.');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await api('/api/account/reset-password', {
          method: 'POST',
          body: JSON.stringify({ token, newPassword })
        });
        setSuccess(true);
      } catch (err) {
        setError(err.message || 'Failed to reset password. Token may be invalid or expired.');
      } finally {
        setLoading(false);
      }
    };

    return html`
      <div class="max-w-md mx-auto my-16 px-4 text-left animate-fadeIn">
        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-xl space-y-6">
          <div class="space-y-2 text-center">
            <div class="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto shadow-sm">
              <span class="text-2xl">✨</span>
            </div>
            <h2 class="font-serif text-2xl font-bold text-navy-950 mt-3">Set New Password</h2>
            <p class="text-xs text-warmgray-500">Enter your reset token and new secure password</p>
          </div>

          ${error ? html`<div class="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">${error}</div>` : null}
          ${success ? html`
            <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-3 text-center">
              <p class="font-bold text-sm">🎉 Password successfully updated!</p>
              <p class="text-emerald-700">You can now sign in using your new password credentials.</p>
              <button
                type="button"
                onClick=${() => setActiveTab('login')}
                class="w-full py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Proceed to Login →
              </button>
            </div>
          ` : html`
            <form onSubmit=${handleReset} class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-navy-950 mb-1">Reset Token</label>
                <input
                  required
                  type="text"
                  value=${token}
                  onInput=${e => setToken(e.target.value)}
                  class="w-full px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl font-mono focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold"
                />
              </div>

              <div>
                <label class="block font-bold text-navy-950 mb-1">New Password</label>
                <div class="relative flex items-center">
                  <input
                    required
                    type=${showPassword ? "text" : "password"}
                    value=${newPassword}
                    onInput=${e => setNewPassword(e.target.value)}
                    class="w-full pr-11 px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick=${() => setShowPassword(!showPassword)}
                    class="absolute right-3 p-1 text-warmgray-500 hover:text-navy-800 transition-colors focus:outline-none"
                    title=${showPassword ? "Hide password" : "Show password"}
                  >
                    <${Icon} name=${showPassword ? "eye-off" : "eye"} class="w-4 h-4" />
                  </button>
                </div>

                <!-- Password Policy Real-time Requirements Indicator -->
                <div class="mt-2.5 p-3 bg-cream-50/80 rounded-xl border border-cream-200/80 space-y-1.5 text-[11px]">
                  <div class="flex items-center gap-2 ${rules.hasLength ? 'text-emerald-700 font-bold' : 'text-warmgray-500'}">
                    <span>${rules.hasLength ? '✓' : '○'}</span>
                    <span>Minimum 8 characters length</span>
                  </div>
                  <div class="flex items-center gap-2 ${rules.hasCapStart ? 'text-emerald-700 font-bold' : 'text-warmgray-500'}">
                    <span>${rules.hasCapStart ? '✓' : '○'}</span>
                    <span>First letter must be Capital (A-Z)</span>
                  </div>
                  <div class="flex items-center gap-2 ${rules.hasSymbol ? 'text-emerald-700 font-bold' : 'text-warmgray-500'}">
                    <span>${rules.hasSymbol ? '✓' : '○'}</span>
                    <span>Must include at least 1 symbol (!@#$%...)</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="block font-bold text-navy-950 mb-1">Confirm New Password</label>
                <input
                  required
                  type="password"
                  value=${confirmPassword}
                  onInput=${e => setConfirmPassword(e.target.value)}
                  class="w-full px-4 py-3 bg-cream-50/50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 focus:bg-white text-navy-900 text-xs font-semibold"
                />
              </div>

              <button type="submit" disabled=${loading || (newPassword.length > 0 && !isPasswordValid)} class="w-full py-3.5 bg-navy-700 hover:bg-navy-800 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg transition-all duration-200 text-sm">
                ${loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          `}

          <div class="text-center pt-4 border-t border-cream-200 text-xs text-warmgray-600">
            Remember your credentials? <button onClick=${() => setActiveTab('login')} class="font-bold text-navy-700 hover:underline">Back to Login</button>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.ResetPasswordView = ResetPasswordView;

  // ----------------------------------------------------
  // Onboarding Wizard View - Step 1: Profile Params

  // ----------------------------------------------------
  function OnboardingWizardView({ user, setActiveTab, onComplete }) {
    const [timezone, setTimezone] = useState('IST (UTC+5:30)');
    const [location, setLocation] = useState('Jabalpur, Madhya Pradesh, India');
    const [preferredLanguage, setPreferredLanguage] = useState('English, Hindi');
    const [weeklyHours, setWeeklyHours] = useState(4);
    const [bio, setBio] = useState('');

    const handleSave = async (e) => {
      e.preventDefault();
      await api('/api/account/onboarding', {
        method: 'POST',
        body: JSON.stringify({
          timezone,
          location,
          weekly_hours: weeklyHours,
          bio: bio.trim() || 'Excited to exchange skills with motivated peers at Jabalpur Engineering College and across India!',
          preferred_language: preferredLanguage,
          availability_schedule: { monday: ['evening'], saturday: ['morning'] }
        })
      });
      // Move to Step 2: Skill setups rather than closing
      setActiveTab('onboarding-skills');
    };

    return html`
      <div class="max-w-2xl mx-auto my-16 px-4 text-left animate-fadeIn">
        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-xl space-y-6">
          <div class="flex items-center justify-between border-b border-cream-200 pb-3">
            <div>
              <h2 class="font-serif text-2xl font-bold text-navy-900">Onboarding: Profile Setup (Step 1/2)</h2>
              <p class="text-xs text-warmgray-500 mt-1">Configure your location, timezone, learning capacity, and a brief biography.</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-navy-50 text-navy-700 border border-navy-100">Step 1</span>

          </div>

          <form onSubmit=${handleSave} class="space-y-6 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-navy-950 mb-1.5">Your Location / City (India)</label>
                <select value=${location} onChange=${e => setLocation(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-semibold text-navy-900">
                  <option value="Jabalpur, Madhya Pradesh, India">Jabalpur, Madhya Pradesh (JEC)</option>
                  <option value="Bhopal, Madhya Pradesh, India">Bhopal, Madhya Pradesh</option>
                  <option value="Indore, Madhya Pradesh, India">Indore, Madhya Pradesh</option>
                  <option value="Gwalior, Madhya Pradesh, India">Gwalior, Madhya Pradesh</option>
                  <option value="Bengaluru, Karnataka, India">Bengaluru, Karnataka</option>
                  <option value="Delhi NCR, India">Delhi NCR</option>
                  <option value="Mumbai, Maharashtra, India">Mumbai, Maharashtra</option>
                  <option value="Hyderabad, Telangana, India">Hyderabad, Telangana</option>
                  <option value="Pune, Maharashtra, India">Pune, Maharashtra</option>
                  <option value="Chennai, Tamil Nadu, India">Chennai, Tamil Nadu</option>
                  <option value="Kolkata, West Bengal, India">Kolkata, West Bengal</option>
                  <option value="Ahmedabad, Gujarat, India">Ahmedabad, Gujarat</option>
                  <option value="Jaipur, Rajasthan, India">Jaipur, Rajasthan</option>
                  <option value="Remote, India">Remote (India)</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-navy-950 mb-1.5">Your Local Timezone</label>
                <select value=${timezone} onChange=${e => setTimezone(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-semibold text-navy-900">
                  <option value="IST (UTC+5:30)">IST (UTC+5:30) - India Standard Time</option>
                  <option value="GMT (UTC+0)">GMT (UTC+0) - London</option>
                  <option value="CET (UTC+1)">CET (UTC+1) - Central Europe</option>
                  <option value="EST (UTC-5)">EST (UTC-5) - US Eastern</option>
                  <option value="PST (UTC-8)">PST (UTC-8) - US Pacific</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-bold text-navy-955 mb-1.5">Max Target Weekly Swap Hours</label>
                <input type="number" min="1" max="20" value=${weeklyHours} onChange=${e => setWeeklyHours(Number(e.target.value))} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-semibold text-navy-900" />
              </div>

              <div>
                <label class="block font-bold text-navy-950 mb-1.5">Preferred Language</label>
                <select value=${preferredLanguage} onChange=${e => setPreferredLanguage(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-semibold text-navy-900">
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

            <div>
              <label class="block font-bold text-navy-955 mb-1.5">Short Bio & Learning Objective</label>
              <textarea rows="4" value=${bio} onChange=${e => setBio(e.target.value)} placeholder="Tell peers what you want to learn, what you can teach, and any projects you want to build..." class="w-full p-3.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 leading-relaxed text-navy-900"></textarea>
            </div>

            <button type="submit" class="w-full py-4 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm">
              Save & Proceed to Skills Wizard →

            </button>
          </form>
        </div>
      </div>
    `;
  }
  window.SkillSwap.OnboardingWizardView = OnboardingWizardView;

  // ----------------------------------------------------
  // Onboarding Wizard View - Step 2: Skill Setups
  // ----------------------------------------------------
  function OnboardingSkillsWizardView({ user, setActiveTab, onComplete }) {
    const [allSkills, setAllSkills] = useState([]);
    const [selectedSkillId, setSelectedSkillId] = useState('');
    const [type, setType] = useState('TEACH');
    const [level, setLevel] = useState('Intermediate');
    const [expYears, setExpYears] = useState(2);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

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
        setSuccessMessage('✓ Added skill setup to your portfolio!');
        setTimeout(() => setSuccessMessage(''), 3000);
        onComplete?.();
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    return html`
      <div class="max-w-2xl mx-auto my-16 px-4 text-left animate-fadeIn">
        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-xl space-y-6">
          <div class="flex items-center justify-between border-b border-cream-200 pb-3">
            <div>
              <h2 class="font-serif text-2xl font-bold text-navy-900">Onboarding: Skill Selection (Step 2/2)</h2>
              <p class="text-xs text-warmgray-500 mt-1">Add at least one skill you can teach and one you want to learn to initialize matches.</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-indigo-700 border border-sky-100">Step 2</span>
          </div>

          ${successMessage ? html`<div class="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs">${successMessage}</div>` : null}

          <form onSubmit=${handleAddSkill} class="space-y-4 text-xs bg-cream-50/50 p-5 rounded-2xl border border-cream-200">
            <h3 class="font-bold text-navy-900 text-sm">Add Skill Entry</h3>
            
            <div class="grid grid-cols-2 gap-3">
              <button type="button" onClick=${() => setType('TEACH')} class="py-2 rounded-xl font-bold ${type === 'TEACH' ? 'bg-navy-700 text-white' : 'bg-cream-100 text-warmgray-700'}">I Can Teach</button>
              <button type="button" onClick=${() => setType('LEARN')} class="py-2 rounded-xl font-bold ${type === 'LEARN' ? 'bg-navy-700 text-white' : 'bg-cream-100 text-warmgray-700'}">I Want to Learn</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-navy-900 mb-1.5">Select Topic</label>
                <select required value=${selectedSkillId} onChange=${e => setSelectedSkillId(e.target.value)} class="w-full p-2.5 bg-white border border-cream-300 rounded-xl font-semibold">
                  <option value="">Choose topic...</option>
                  ${allSkills.map(s => html`<option key=${s.id} value=${s.id}>${s.name} (${s.category_name})</option>`)}
                </select>
              </div>

              <div>
                <label class="block font-bold text-navy-900 mb-1.5">Proficiency</label>
                <select value=${level} onChange=${e => setLevel(e.target.value)} class="w-full p-2.5 bg-white border border-cream-300 rounded-xl font-semibold">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-navy-900 mb-1">Years Experience: ${expYears}</label>
              <input type="range" min="0" max="15" step="0.5" value=${expYears} onInput=${e => setExpYears(Number(e.target.value))} onChange=${e => setExpYears(Number(e.target.value))} class="w-full accent-navy-700" />
            </div>

            <button type="submit" disabled=${loading} class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-sm">
              ${loading ? 'Adding...' : 'Add Skill to Portfolio'}
            </button>
          </form>

          <button onClick=${() => setActiveTab('dashboard')} class="w-full py-3.5 bg-white hover:bg-cream-50 text-navy-900 border border-cream-300 font-bold rounded-xl shadow text-xs">
            Complete Onboarding & Go to Dashboard →
          </button>
        </div>
      </div>
    `;
  }
  window.SkillSwap.OnboardingSkillsWizardView = OnboardingSkillsWizardView;

  // ----------------------------------------------------
  // Public Skill Directory View (Detailed alphabetical top filters)
  // ----------------------------------------------------
  function SkillsDirectoryView({ setActiveTab, onViewCategory }) {
    const [directory, setDirectory] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedAlphaFilter, setSelectedAlphaFilter] = useState('');
    const [selectedTrending, setSelectedTrending] = useState('ALL');
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('ALL');
    const [sortBy, setSortBy] = useState('ACTIVE'); // 'ACTIVE', 'TEACHERS', 'LEARNERS', 'ALPHA'
    
    // Track request form state
    const [requestSkillName, setRequestSkillName] = useState('');
    const [requestCategory, setRequestCategory] = useState('Engineering');
    const [requestSubmitted, setRequestSubmitted] = useState(false);


    useEffect(() => {
      api('/api/skills/directory').then(data => setDirectory(data.directory || [])).catch(console.error);
    }, []);

    const alphabeticalIndex = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const trendingSkills = ['ALL', 'Python', 'React', 'Figma', 'System Design', 'Machine Learning', 'Rust', 'Prompt Engineering', 'Spanish'];
    
    const categoryTabs = [
      { id: 'ALL', label: 'All Disciplines', icon: '✨' },
      { id: 'Engineering', label: 'Engineering & Code', icon: '💻' },
      { id: 'Design', label: 'Design & Creative', icon: '🎨' },
      { id: 'AI', label: 'AI & Data Science', icon: '🤖' },
      { id: 'Languages', label: 'Languages', icon: '🗣️' },
      { id: 'Product', label: 'Product & Business', icon: '📈' }
    ];

    const synergyPathways = [
      {
        title: "Fullstack Pairing",
        teach: "React & TypeScript",
        learn: "Python & FastAPI",
        pairs: "840 Active Pairs",
        badge: "High Reciprocity 🔥",
        color: "from-navy-900 to-navy-950 text-white border-navy-700"
      },
      {
        title: "AI & Cloud Systems",
        teach: "PyTorch / LLMs",
        learn: "Docker & AWS",
        pairs: "620 Active Pairs",
        badge: "Trending ⚡",
        color: "from-navy-900 to-navy-950 text-white border-navy-700"
      },
      {
        title: "Product Design & Code",
        teach: "Figma Design Systems",
        learn: "Tailwind & Frontend",
        pairs: "710 Active Pairs",
        badge: "Popular ⭐",
        color: "from-navy-900 to-navy-950 text-white border-navy-700"
      },
      {
        title: "Bilingual Immersion",
        teach: "Conversational Spanish",
        learn: "English Fluency",
        pairs: "930 Active Pairs",
        badge: "Global 🌐",
        color: "from-navy-900 to-navy-950 text-white border-navy-700"
      }
    ];

    const filtered = useMemo(() => {
      let result = directory;
      
      // Category Tab Filter
      if (selectedCategoryTab !== 'ALL') {
        const catQ = selectedCategoryTab.toLowerCase();
        result = result.filter(cat => cat.name.toLowerCase().includes(catQ) || cat.description.toLowerCase().includes(catQ));
      }

      // Keyword search
      if (search.trim()) {
        const q = search.toLowerCase();
        result = result.map(cat => ({
          ...cat,
          skills: (cat.skills || []).filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
        })).filter(cat => cat.skills.length > 0 || cat.name.toLowerCase().includes(q));
      }
      
      // Trending filter
      if (selectedTrending !== 'ALL') {
        const trend = selectedTrending.toLowerCase();
        result = result.map(cat => ({
          ...cat,
          skills: (cat.skills || []).filter(s => s.name.toLowerCase().includes(trend))
        })).filter(cat => cat.skills.length > 0);
      }

      // Alphabetical filter
      if (selectedAlphaFilter) {
        result = result.filter(cat => cat.name.startsWith(selectedAlphaFilter));
      }

      // Sort skills inside each category
      result = result.map(cat => {
        const sortedSkills = [...(cat.skills || [])];
        if (sortBy === 'ACTIVE') {
          sortedSkills.sort((a, b) => (b.total_members || 0) - (a.total_members || 0));
        } else if (sortBy === 'TEACHERS') {
          sortedSkills.sort((a, b) => (b.teachers_count || 0) - (a.teachers_count || 0));
        } else if (sortBy === 'LEARNERS') {
          sortedSkills.sort((a, b) => (b.learners_count || 0) - (a.learners_count || 0));
        } else if (sortBy === 'ALPHA') {
          sortedSkills.sort((a, b) => a.name.localeCompare(b.name));
        }
        return { ...cat, skills: sortedSkills };
      });

      return result;
    }, [directory, search, selectedAlphaFilter, selectedTrending, selectedCategoryTab, sortBy]);

    const handleRequestTrackSubmit = (e) => {
      e.preventDefault();
      if (!requestSkillName.trim()) return;
      setRequestSubmitted(true);
      setTimeout(() => {
        setRequestSkillName('');
        setRequestSubmitted(false);
      }, 4000);
    };

    const totalSkillsCount = directory.reduce((acc, c) => acc + (c.skills || []).length, 0);

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-left animate-fadeIn">
        
        <!-- Header Banner & Search Controls -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-cream-300 pb-8">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-[10px] font-bold border border-navy-200 mb-2">
              <span>Verified Directory</span>
              <span>•</span>
              <span>100% Reciprocal Knowledge Barter</span>
            </div>
            <h1 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-950 tracking-tight">Skills & Topics Directory</h1>
            <p class="text-warmgray-600 text-xs sm:text-sm mt-1.5 max-w-xl">
              Explore ${totalSkillsCount}+ verified skills across all disciplines. Find peer mentors, compare complementary pairings, and unlock 1-on-1 swaps.
            </p>
            <div class="flex flex-wrap items-center gap-3 text-xs font-bold text-navy-900 mt-4">
              <span class="px-3.5 py-1.5 bg-white border border-cream-300 rounded-xl shadow-2xs">📚 ${directory.length} Categories</span>
              <span class="px-3.5 py-1.5 bg-white border border-cream-300 rounded-xl shadow-2xs">⚡ ${totalSkillsCount}+ Verified Skills</span>
              <span class="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl shadow-2xs">👥 14,200+ Active Swappers</span>
            </div>
          </div>

          <!-- Search & Sort Controls -->
          <div class="w-full lg:w-96 space-y-3 shrink-0">
            <div class="relative">
              <input
                type="text"
                value=${search}
                onChange=${e => setSearch(e.target.value)}
                placeholder="Search skills (e.g. Python, Spanish, Figma)..."
                class="w-full pl-11 pr-4 py-3.5 bg-white border border-cream-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-navy-600 shadow-sm font-medium"
              />
              <div class="absolute left-4 top-3.5 text-warmgray-400">
                <${Icon} name="search" class="w-4.5 h-4.5" />
              </div>
              ${search ? html`
                <button onClick=${() => setSearch('')} class="absolute right-4 top-3.5 text-warmgray-400 hover:text-navy-900 text-xs font-bold">✕</button>
              ` : null}
            </div>

            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="text-[11px] font-bold text-warmgray-500">Sort Skills By:</span>
              <select
                value=${sortBy}
                onChange=${e => setSortBy(e.target.value)}
                class="p-2 bg-white border border-cream-300 rounded-xl text-xs font-bold text-navy-900 focus:outline-none shadow-2xs"
              >
                <option value="ACTIVE">👥 Most Active Members</option>
                <option value="TEACHERS">🌱 Most Offering to Teach</option>
                <option value="LEARNERS">🎯 Most Learners Seeking</option>
                <option value="ALPHA">🔤 Alphabetical (A-Z)</option>
              </select>

            </div>
          </div>
        </div>

        <!-- Complementary Synergy Pairing Pathways -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="space-y-0.5">
              <span class="text-[10px] font-black uppercase tracking-wider text-navy-600">High-Reciprocity Combinations</span>
              <h2 class="font-serif text-xl sm:text-2xl font-bold text-navy-950">Curated Synergy Pairing Pathways</h2>
            </div>
            <span class="text-xs text-warmgray-500 font-semibold hidden sm:inline">Click any pathway to filter matches</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${synergyPathways.map((path, pIdx) => html`
              <div
                key=${pIdx}
                onClick=${() => { setSearch(path.teach.split(' ')[0]); setSelectedTrending('ALL'); }}
                class="bg-gradient-to-br ${path.color} p-5 rounded-3xl border shadow-md hover:shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 text-left"
              >
                <div class="space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="px-2 py-0.5 rounded-md bg-navy-800 text-sky-300 text-[9px] font-black uppercase tracking-wider border border-navy-700">
                      ${path.badge}
                    </span>
                    <span class="text-[10px] text-cream-200/70 font-semibold">${path.pairs}</span>
                  </div>
                  <h3 class="font-serif text-base font-bold text-white">${path.title}</h3>
                </div>

                <div class="space-y-1.5 pt-2 border-t border-navy-800 text-[11px]">
                  <div class="flex items-center justify-between text-emerald-300 font-semibold">
                    <span>Teach:</span>
                    <span class="font-bold">${path.teach}</span>
                  </div>
                  <div class="flex items-center justify-between text-sky-300 font-semibold">
                    <span>Learn:</span>
                    <span class="font-bold">${path.learn}</span>
                  </div>
                </div>
              </div>
            `)}
          </div>
        </div>

        <!-- Mentor of the Week Spotlight Card -->
        <div class="bg-gradient-to-r from-navy-900 via-navy-950 to-navy-900 rounded-3xl p-6 sm:p-8 text-white border border-navy-700/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div class="flex items-center gap-4">
            <div class="relative shrink-0">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&h=140&fit=crop" class="w-15 h-15 sm:w-18 sm:h-18 rounded-2xl object-cover ring-2 ring-indigo-400 shadow-lg" />
              <span class="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-sky-400 text-navy-950 text-[8px] font-black uppercase rounded-md shadow-xs">Mentor</span>
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-sky-300 text-[9px] font-extrabold border border-indigo-500/30">🌟 Practitioner Spotlight of the Week</span>
                <span class="text-xs text-cream-200/70">★ 5.0 (24 verified reviews)</span>
              </div>
              <h3 class="font-serif text-lg sm:text-xl font-bold">Sophia Lin · Senior Staff UI/UX Architect</h3>
              <p class="text-xs text-cream-200/80 max-w-xl">
                Teaches <strong>Figma Design Systems & Design Tokens</strong> in exchange for <strong>Rust Backend Optimization</strong>.
              </p>
            </div>
          </div>
          <button onClick=${() => setActiveTab('signup')} class="px-6 py-3.5 bg-white hover:bg-cream-100 text-navy-950 font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0">
            Request Swap with Sophia →
          </button>
        </div>

        <!-- Discipline / Category Tabs Filter -->
        <div class="space-y-3">
          <span class="text-[10px] font-black uppercase tracking-wider text-warmgray-500 block">Filter by Discipline:</span>
          <div class="flex flex-wrap items-center gap-2">
            ${categoryTabs.map(cat => html`
              <button
                key=${cat.id}
                onClick=${() => { setSelectedCategoryTab(cat.id); setSelectedTrending('ALL'); setSelectedAlphaFilter(''); }}
                class="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                  selectedCategoryTab === cat.id
                    ? 'bg-navy-700 text-white shadow-md'
                    : 'bg-white text-warmgray-700 border border-cream-300 hover:bg-cream-100 hover:text-navy-950'
                }"
              >
                <span>${cat.icon}</span>
                <span>${cat.label}</span>
              </button>
            `)}
          </div>
        </div>

        <!-- Trending Skill Filter Pills -->
        <div class="space-y-3">
          <span class="text-[10px] font-black uppercase tracking-wider text-warmgray-500 block">Trending Topics:</span>
          <div class="flex flex-wrap items-center gap-2">
            ${trendingSkills.map(tag => html`
              <button
                key=${tag}
                onClick=${() => { setSelectedTrending(tag); setSelectedAlphaFilter(''); }}
                class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  selectedTrending === tag
                    ? 'bg-navy-700 text-white shadow-sm'
                    : 'bg-white text-warmgray-700 border border-cream-300 hover:bg-cream-100 hover:text-navy-950'
                }"
              >
                ${tag === 'ALL' ? '🔥 All Topics' : tag}
              </button>
            `)}
          </div>
        </div>

        <!-- Alphabetical Index Filter Bar -->
        <div class="flex items-center flex-wrap gap-1 text-[11px] font-bold text-warmgray-500 border-b border-cream-200 pb-4">
          <span class="mr-2">Alphabetical:</span>
          <button onClick=${() => { setSelectedAlphaFilter(''); setSelectedTrending('ALL'); setSelectedCategoryTab('ALL'); }} class="px-2.5 py-1 rounded-lg hover:bg-cream-200 transition-colors ${!selectedAlphaFilter ? 'bg-navy-700 text-white font-bold' : 'bg-white text-navy-950 border border-cream-200'}">All</button>
          ${alphabeticalIndex.map(letter => html`
            <button
              key=${letter}
              onClick=${() => { setSelectedAlphaFilter(letter); setSelectedTrending('ALL'); }}
              class="px-2 py-1 rounded-lg hover:bg-cream-200 transition-colors ${selectedAlphaFilter === letter ? 'bg-navy-700 text-white font-bold' : 'bg-white text-navy-950 border border-cream-200'}"
            >
              ${letter}
            </button>
          `)}
        </div>

        <!-- Category Grid & Skills Listing -->
        <div class="space-y-12">
          ${filtered.map(cat => html`
            <div key=${cat.id} class="space-y-5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-navy-700 pl-3.5 pr-2">
                <div>
                  <h2 class="font-serif text-2xl font-bold text-navy-950 hover:text-navy-700 cursor-pointer flex items-center gap-2" onClick=${() => onViewCategory(cat.id)}>
                    <span>${cat.name}</span>
                    <span class="text-xs font-normal text-warmgray-500">(${cat.skills.length} topics)</span>
                  </h2>
                  <p class="text-xs text-warmgray-600 mt-0.5">${cat.description}</p>
                </div>
                <button onClick=${() => onViewCategory(cat.id)} class="text-xs font-bold text-navy-700 hover:underline flex items-center gap-1 shrink-0">
                  <span>View All ${cat.name} Peers</span>
                  <span>→</span>
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                ${cat.skills.map(s => html`
                  <div key=${s.id} class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 hover:border-navy-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                    <div class="space-y-2.5">
                      <div class="flex items-start justify-between gap-2">
                        <h3 class="font-bold text-navy-950 text-base">${s.name}</h3>
                        <span class="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-navy-50 text-navy-800 border border-navy-100 tracking-wider shrink-0">
                          ${s.total_members || 0} active
                        </span>
                      </div>
                      <p class="text-xs text-warmgray-600 line-clamp-2 leading-relaxed">${s.description || 'Master practical skills with 1:1 peer mentorship.'}</p>
                    </div>

                    <div class="pt-3 border-t border-cream-100 space-y-3">
                      <div class="flex items-center justify-between text-[11px] font-bold">
                        <span class="text-emerald-700 flex items-center gap-1">
                          <span>🌱</span>
                          <span>${s.teachers_count || 1} Teachers</span>
                        </span>
                        <span class="text-indigo-700 flex items-center gap-1">
                          <span>🎯</span>
                          <span>${s.learners_count || 1} Learners</span>
                        </span>
                      </div>
                      <button onClick=${() => setActiveTab('matches')} class="w-full py-2.5 bg-cream-50 hover:bg-navy-700 hover:text-white text-navy-900 font-bold text-xs rounded-xl border border-cream-200 hover:border-navy-700 transition-all duration-200 text-center shadow-2xs">
                        Find Synergy Matches →

                      </button>
                    </div>
                  </div>
                `)}
              </div>
            </div>
          `)}
          ${filtered.length === 0 ? html`
            <div class="bg-white p-12 rounded-3xl border border-cream-300 text-center space-y-4 shadow-sm">
              <p class="text-sm font-semibold text-warmgray-600">No skills or categories match your active filters.</p>
              <button onClick=${() => { setSearch(''); setSelectedTrending('ALL'); setSelectedAlphaFilter(''); setSelectedCategoryTab('ALL'); }} class="px-5 py-2.5 bg-navy-700 text-white rounded-xl font-bold text-xs shadow-md">
                Reset All Filters
              </button>
            </div>
          ` : null}
        </div>

        <!-- "Can't Find Your Skill?" Track Request Section -->
        <div class="bg-white rounded-3xl p-8 sm:p-10 border border-cream-300 shadow-md space-y-6">
          <div class="space-y-1">
            <span class="px-2.5 py-0.5 rounded-md bg-sky-50 text-indigo-900 text-[10px] font-bold border border-indigo-200">
              💡 Community Requested Tracks
            </span>
            <h3 class="font-serif text-2xl font-bold text-navy-950">Can't find the skill you want to learn or teach?</h3>
            <p class="text-xs sm:text-sm text-warmgray-600 max-w-2xl">
              Propose a new skill or framework. Community-requested topics with 3+ votes are automatically indexed into the matching directory.
            </p>
          </div>

          ${requestSubmitted ? html`
            <div class="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold animate-fadeIn">
              ✓ Thank you! Your proposal for "${requestSkillName || 'your topic'}" has been submitted to the community index queue.
            </div>
          ` : html`
            <form onSubmit=${handleRequestTrackSubmit} class="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                required
                value=${requestSkillName}
                onChange=${e => setRequestSkillName(e.target.value)}
                placeholder="Enter skill name (e.g. Solidity, Elixir, Blender 3D, Japanese B2)..."
                class="w-full sm:flex-1 p-3.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-navy-600 font-semibold"
              />
              <select
                value=${requestCategory}
                onChange=${e => setRequestCategory(e.target.value)}
                class="w-full sm:w-48 p-3.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-navy-900 focus:outline-none"
              >
                <option value="Engineering">Software Engineering</option>
                <option value="Design">Design & Creative</option>
                <option value="AI">AI & Data Science</option>
                <option value="Languages">Languages & Culture</option>
                <option value="Product">Product & Business</option>
              </select>
              <button type="submit" class="w-full sm:w-auto px-6 py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0">
                Propose Topic
              </button>
            </form>
          `}

        </div>
      </div>
    `;
  }
  window.SkillSwap.SkillsDirectoryView = SkillsDirectoryView;

  // ----------------------------------------------------
  // Category Detail View
  // ----------------------------------------------------
  function CategoryDetailView({ categoryId, setActiveTab, onViewProfile, onProposeSwap }) {
    const [category, setCategory] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchVal, setSearchVal] = useState('');

    useEffect(() => {
      if (!categoryId) return;
      setLoading(true);
      api('/api/skills/directory').then(data => {
        const found = data.directory.find(c => c.id === Number(categoryId));
        if (found) {
          setCategory(found);
          api('/api/search?category=' + encodeURIComponent(found.name)).then(sData => {
            setMembers(sData.results || []);
          }).catch(console.error).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }).catch(console.error);
    }, [categoryId]);

    const filteredMembers = useMemo(() => {
      if (!searchVal.trim()) return members;
      const q = searchVal.toLowerCase();
      return members.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.headline.toLowerCase().includes(q) ||
        (m.teach_skills || []).some(s => s.skill_name.toLowerCase().includes(q))
      );
    }, [members, searchVal]);

    if (loading) {
      return html`<div class="p-20 text-center font-serif text-warmgray-500">Syncing category directory details...</div>`;
    }

    if (!category) {
      return html`
        <div class="p-20 text-center space-y-4">
          <h2 class="font-serif text-2xl font-bold text-navy-900">Category not found</h2>
          <button onClick=${() => setActiveTab('skills-dir')} class="px-4 py-2 bg-navy-700 text-white rounded-xl text-xs">Return to Directory</button>

        </div>
      `;
    }

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left animate-fadeIn">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cream-300 pb-6">
          <div class="space-y-1">
            <button onClick=${() => setActiveTab('skills-dir')} class="text-xs font-bold text-navy-700 hover:underline flex items-center gap-1.5">
              <${Icon} name="arrow-left" class="w-3.5 h-3.5" /> Back to skill directory
            </button>
            <h1 class="font-serif text-3xl font-bold text-navy-900 mt-2">${category.name}</h1>
            <p class="text-warmgray-600 text-xs sm:text-sm max-w-2xl">${category.description}</p>
          </div>

          <div class="w-full md:w-80 relative">
            <input
              type="text"
              value=${searchVal}
              onChange=${e => setSearchVal(e.target.value)}
              placeholder="Search members in this category..."
              class="w-full pl-10 pr-4 py-3 bg-white border border-cream-300 rounded-xl text-xs focus:outline-none"
            />
            <div class="absolute left-3.5 top-3 text-warmgray-400">
              <${Icon} name="search" class="w-4.5 h-4.5" />

            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="md:col-span-1 bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4.5 h-fit text-xs">
            <h3 class="font-bold text-navy-955 text-sm border-b border-cream-100 pb-2.5">Specific Skills under ${category.name}</h3>
            <div class="space-y-2">
              ${(category.skills || []).map(s => html`
                <div key=${s.id} class="p-3 bg-cream-50/50 border border-cream-200/50 rounded-xl flex justify-between items-center">
                  <span class="font-semibold text-navy-900">${s.name}</span>
                  <span class="px-2 py-0.5 rounded bg-cream-200 text-[9px] font-extrabold uppercase">${s.total_members || 0} active</span>

                </div>
              `)}
            </div>
          </div>

          <div class="md:col-span-2 space-y-6">
            <h3 class="font-serif text-xl font-bold text-navy-900">Active Teachers & Learners (${filteredMembers.length})</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              ${filteredMembers.map(m => html`
                <div key=${m.id} class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm flex flex-col justify-between space-y-4 hover:shadow transition-shadow">
                  <div class="space-y-3.5">
                    <div class="flex items-center gap-3">
                      <img src=${m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'} class="w-11 h-11 rounded-xl object-cover border border-cream-200 shadow-sm" />
                      <div>
                        <h4 class="font-bold text-navy-900 text-sm cursor-pointer hover:underline" onClick=${() => onViewProfile(m.username)}>${m.name}</h4>
                        <p class="text-[10px] text-warmgray-500 font-semibold">${m.location || 'Remote'} · ★ ${m.rating} (${m.reviews_count} reviews)</p>
                      </div>
                    </div>
                    <p class="text-[11px] font-semibold text-navy-950 line-clamp-1 border-t border-cream-100 pt-2">${m.headline || 'SkillSwapX Member'}</p>
                    
                    <div class="space-y-1.5 text-[10px]">
                      <div>
                        <span class="font-bold text-emerald-800 uppercase block tracking-wider">Teaches:</span>
                        <div class="flex flex-wrap gap-1 mt-0.5">
                          ${(m.teach_skills || []).map(s => html`<span key=${s.id} class="px-1.5 py-0.5 bg-cream-200 text-navy-900 font-medium rounded">${s.skill_name}</span>`)}
                        </div>
                      </div>
                      <div>
                        <span class="font-bold text-indigo-900 uppercase block tracking-wider">Wants to Learn:</span>
                        <div class="flex flex-wrap gap-1 mt-0.5">
                          ${(m.learn_skills || []).map(s => html`<span key=${s.id} class="px-1.5 py-0.5 bg-sky-50 text-indigo-950 border border-indigo-200 rounded font-medium">${s.skill_name}</span>`)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button onClick=${() => onProposeSwap({ user: m })} class="w-full py-2.5 bg-navy-700 hover:bg-navy-800 text-white rounded-xl font-bold text-xs shadow-sm transition-colors mt-2">
                    Propose Swap
                  </button>
                </div>
              `)}
              ${filteredMembers.length === 0 ? html`<p class="text-xs text-warmgray-500 py-6 text-center sm:col-span-2">No category members match your search.</p>` : null}

            </div>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.CategoryDetailView = CategoryDetailView;

  // ----------------------------------------------------
  // Safety Abuse Reporting Page
  // ----------------------------------------------------
  function ReportAbuseView({ reportedUserId, setActiveTab }) {
    const [reason, setReason] = useState('Inappropriate communication');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!reportedUserId) return;
      try {
        setSubmitting(true);
        await api('/api/reports', {
          method: 'POST',
          body: JSON.stringify({
            reported_user_id: reportedUserId,
            reason: reason,
            details: details.trim()
          })
        });
        setSubmitted(true);
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    if (submitted) {
      return html`
        <div class="max-w-md mx-auto my-20 p-8 bg-white border border-cream-300 rounded-3xl shadow-xl text-center space-y-4.5 animate-fadeIn">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center justify-center font-bold text-xl mx-auto">✓</div>
          <h2 class="font-serif text-2xl font-bold text-navy-900">Safety report submitted</h2>
          <p class="text-xs text-warmgray-600 leading-relaxed">Thank you for helping maintain SkillSwapX integrity. The administration team will inspect this profile and resolve actions within 24 hours.</p>
          <button onClick=${() => setActiveTab('dashboard')} class="px-5 py-2.5 bg-navy-700 text-white font-bold rounded-xl text-xs shadow-sm">Go to Dashboard</button>
        </div>
      `;
    }

    return html`
      <div class="max-w-lg mx-auto my-16 px-4 text-left animate-fadeIn">
        <div class="bg-white rounded-3xl p-8 border border-cream-300 shadow-xl space-y-6">
          <div>
            <h2 class="font-serif text-2xl font-bold text-rose-900">File Safety Report</h2>
            <p class="text-xs text-warmgray-500 mt-1">Submit a trust or safety violation query against member account #${reportedUserId}.</p>
          </div>

          <form onSubmit=${handleSubmit} class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-navy-950 mb-1.5">Reason for reporting</label>
              <select value=${reason} onChange=${e => setReason(e.target.value)} class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl font-semibold text-navy-950 focus:outline-none focus:border-navy-600">
                <option value="Inappropriate communication">Inappropriate communication / Harassment</option>
                <option value="Misleading credentials">Misleading skills / credentials</option>
                <option value="Commercial solicitation">Selling courses / solicitation</option>
                <option value="Unprofessional cancellation">Repeated missed meetings</option>
                <option value="Other">Other trust issues</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-navy-955 mb-1.5">Context & description</label>
              <textarea
                required
                rows="5"
                value=${details}
                onChange=${e => setDetails(e.target.value)}
                placeholder="Please describe exactly what happened. Administrative team will keep reports strictly confidential."
                class="w-full p-3.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 leading-relaxed text-navy-900"
              ></textarea>
            </div>

            <button type="submit" disabled=${submitting} class="w-full py-3.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow-md transition-colors text-sm">
              ${submitting ? 'Submitting Report...' : 'File Safety Report to Admin'}

            </button>
          </form>
        </div>
      </div>
    `;
  }
  window.SkillSwap.ReportAbuseView = ReportAbuseView;

  // ----------------------------------------------------
  // ----------------------------------------------------
  // Community Feed Page (Rich Multi-Media Posts, Images, Videos, Blogs & Code)
  // ----------------------------------------------------
  function CommunityFeedView({ currentUser, onProposeSwap, onOpenChat, setActiveTab, onViewProfile }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Post Composer State
    const [postType, setPostType] = useState('POST'); // 'POST', 'IMAGE', 'VIDEO', 'BLOG', 'CODE', 'SWAP_OFFER'
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [readTime, setReadTime] = useState('4 min read');
    const [codeLang, setCodeLang] = useState('javascript');
    const [tags, setTags] = useState('');
    const [teachSkillId, setTeachSkillId] = useState('');
    const [learnSkillId, setLearnSkillId] = useState('');
    const [composerOpen, setComposerOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Comments & Engagement State
    const [commentTexts, setCommentTexts] = useState({});
    const [commentSubmitting, setCommentSubmitting] = useState({});
    const [openComments, setOpenComments] = useState({});
    const [activeChannel, setActiveChannel] = useState('ALL'); // 'ALL', 'BLOG', 'VIDEO', 'IMAGE', 'CODE', 'SWAP_OFFER'
    const [selectedTag, setSelectedTag] = useState('ALL');
    const [readingArticle, setReadingArticle] = useState(null);
    const [viewingImageModal, setViewingImageModal] = useState(null);
    const [allSkills, setAllSkills] = useState([]);

    // Sample Image Presets
    const IMAGE_PRESETS = [
      { label: 'UPI Architecture', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop' },
      { label: 'React UI System', url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop' },
      { label: 'AI & Data Science', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop' },
      { label: 'Cloud Infrastructure', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop' }
    ];

    // Sample Video Presets
    const VIDEO_PRESETS = [
      { label: 'High-Scale Concurrency Tutorial', url: 'https://www.youtube.com/watch?v=yyUHQIec83I' },
      { label: 'React 19 Architecture Deep Dive', url: 'https://www.youtube.com/watch?v=8pDqJVdNa44' },
      { label: 'System Design Interview Blueprint', url: 'https://www.youtube.com/watch?v=SqcXvc3ZmRU' }
    ];

    // Trending Tags in India Tech Community
    const TRENDING_TAGS = [
      '#SystemDesign', '#ReactJS', '#PythonAI', '#UPI_Fintech', '#DSA_Algo', '#DevOps', '#GoLang', '#GATE_CS', '#Web3'
    ];

    useEffect(() => {
      loadPosts();
      api('/api/skills').then(d => setAllSkills(d.skills || [])).catch(console.error);
    }, []);

    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await api('/api/posts');
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleCreatePost = async (e) => {
      e.preventDefault();
      if (!title.trim() || !content.trim()) return;

      try {
        setSubmitting(true);
        await api('/api/posts', {
          method: 'POST',
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            post_type: postType,
            media_url: mediaUrl ? mediaUrl.trim() : null,
            cover_image: coverImage ? coverImage.trim() : (postType === 'BLOG' ? mediaUrl : null),
            read_time: readTime,
            tags: tags.trim() || (postType === 'BLOG' ? '#TechBlog, #Engineering' : postType === 'VIDEO' ? '#Tutorial, #Video' : postType === 'IMAGE' ? '#Showcase, #Design' : null),
            teach_skill_id: teachSkillId ? Number(teachSkillId) : null,
            learn_skill_id: learnSkillId ? Number(learnSkillId) : null
          })
        });

        // Reset form
        setTitle('');
        setContent('');
        setMediaUrl('');
        setCoverImage('');
        setTags('');
        setTeachSkillId('');
        setLearnSkillId('');
        setComposerOpen(false);
        await loadPosts();
      } catch (err) {
        alert(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    const handleToggleLike = async (postId) => {
      // Optimistic update so number toggle responds instantly
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const wasLiked = !!p.user_liked;
        const currentCount = Number(p.likes_count) || 0;
        return {
          ...p,
          user_liked: !wasLiked,
          likes_count: wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1
        };
      }));

      try {
        const res = await api('/api/posts', {
          method: 'POST',
          body: JSON.stringify({
            action: 'like',
            post_id: postId
          })
        });
        if (res.success) {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, user_liked: res.liked, likes_count: res.likes_count } : p));
        }
      } catch (err) {
        // Rollback on failure
        loadPosts();
        alert(err.message);
      }
    };

    const handlePostComment = async (e, postId) => {
      e.preventDefault();
      const txt = commentTexts[postId];
      if (!txt || !txt.trim()) return;

      try {
        setCommentSubmitting(prev => ({ ...prev, [postId]: true }));
        await api('/api/posts', {
          method: 'POST',
          body: JSON.stringify({
            action: 'comment',
            post_id: postId,
            content: txt.trim()
          })
        });
        setCommentTexts(prev => ({ ...prev, [postId]: '' }));
        await loadPosts();
      } catch (err) {
        alert(err.message);
      } finally {
        setCommentSubmitting(prev => ({ ...prev, [postId]: false }));
      }
    };

    const handleDeletePost = async (postId) => {
      if (!confirm('Are you sure you want to delete this post?')) return;
      try {
        await api('/api/posts', {
          method: 'POST',
          body: JSON.stringify({
            action: 'delete',
            post_id: postId
          })
        });
        setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (err) {
        alert(err.message);
      }
    };

    const copyPostLink = (post) => {
      const shareUrl = `${window.location.origin}/#community?post=${post.id}`;
      navigator.clipboard.writeText(shareUrl);
      alert('Post link copied to clipboard! 🔗');
    };

    const getVideoEmbedUrl = (url) => {
      if (!url) return null;
      try {
        if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
          let videoId = '';
          if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
          } else {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get('v');
          }
          return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
        }
        if (url.includes('vimeo.com/')) {
          const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
          return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
        }
        return url;
      } catch {
        return url;
      }
    };

    // Filter Posts by Channel and Tag
    const filteredPosts = useMemo(() => {
      let list = posts;

      if (activeChannel !== 'ALL') {
        if (activeChannel === 'SWAP_OFFER') {
          list = list.filter(p => p.post_type === 'SWAP_OFFER' || (!!p.teach_skill || !!p.learn_skill));
        } else {
          list = list.filter(p => (p.post_type || 'POST') === activeChannel);
        }
      }

      if (selectedTag !== 'ALL') {
        list = list.filter(p => (p.tags || '').toLowerCase().includes(selectedTag.toLowerCase()));
      }

      return list;
    }, [posts, activeChannel, selectedTag]);

    const studyCircles = [
      { name: "Bengaluru Web3 & Scalability", host: "Rahul Sharma", members: 84, icon: "🇮🇳", tag: "Architecture" },
      { name: "GATE CS & LeetCode Daily", host: "Priya Patel", members: 62, icon: "💻", tag: "Algorithms" },
      { name: "React 19 & Fullstack India", host: "Amit Verma", members: 48, icon: "⚛️", tag: "Fullstack" },
      { name: "Indic AI & LLM Builders", host: "Vikram Malhotra", members: 39, icon: "🤖", tag: "AI / ML" }
    ];

    const weeklyLeaderboard = [
      { rank: 1, name: "Priya Sharma", karma: "4.99★", swaps: 34, badge: "Staff Architect", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=PriyaSharma" },
      { rank: 2, name: "Rahul Sharma", karma: "4.98★", swaps: 28, badge: "Lead Fullstack", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=RahulSharma" },
      { rank: 3, name: "Vikram Malhotra", karma: "4.95★", swaps: 22, badge: "AI Researcher", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=VikramMalhotra" }
    ];

    return html`
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-fadeIn">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div class="space-y-2 z-10">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              <span>🇮🇳 India Knowledge & Multi-Media Feed</span>
            </div>
            <h1 class="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight">Community Feed & Tech Blog</h1>
            <p class="text-xs sm:text-sm text-cream-200 max-w-xl">
              Share posts, project images, video demos, technical blogs, and code snippets with fellow peer engineers across India.
            </p>
          </div>

          <div class="z-10 shrink-0">
            ${currentUser ? html`
              <button
                onClick=${() => setComposerOpen(!composerOpen)}
                class="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-900/40 text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <span>✍️</span> ${composerOpen ? 'Close Composer' : '+ Create New Post / Media'}
              </button>
            ` : html`
              <button onClick=${() => setActiveTab('signup')} class="px-6 py-3.5 bg-white hover:bg-cream-100 text-navy-950 font-bold rounded-2xl shadow-md text-xs sm:text-sm transition-all">
                Join Community Free →
              </button>
            `}
          </div>
        </div>

        <!-- Channel Filter Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-cream-300 text-xs font-bold scrollbar-none">
          <button
            onClick=${() => { setActiveChannel('ALL'); setSelectedTag('ALL'); }}
            class="px-4 py-2.5 rounded-xl transition-all shrink-0 ${activeChannel === 'ALL' && selectedTag === 'ALL' ? 'bg-navy-900 text-white shadow-sm' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            🌐 All Feed
          </button>
          <button
            onClick=${() => setActiveChannel('BLOG')}
            class="px-4 py-2.5 rounded-xl transition-all shrink-0 ${activeChannel === 'BLOG' ? 'bg-navy-900 text-white shadow-sm' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            📰 Tech Blogs & Articles
          </button>
          <button
            onClick=${() => setActiveChannel('VIDEO')}
            class="px-4 py-2.5 rounded-xl transition-all shrink-0 ${activeChannel === 'VIDEO' ? 'bg-navy-900 text-white shadow-sm' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            🎥 Video Tutorials & Demos
          </button>
          <button
            onClick=${() => setActiveChannel('IMAGE')}
            class="px-4 py-2.5 rounded-xl transition-all shrink-0 ${activeChannel === 'IMAGE' ? 'bg-navy-900 text-white shadow-sm' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            🖼️ Image & Design Showcases
          </button>
          <button
            onClick=${() => setActiveChannel('CODE')}
            class="px-4 py-2.5 rounded-xl transition-all shrink-0 ${activeChannel === 'CODE' ? 'bg-navy-900 text-white shadow-sm' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            💻 Code Snippets
          </button>
          <button
            onClick=${() => setActiveChannel('SWAP_OFFER')}
            class="px-4 py-2.5 rounded-xl transition-all shrink-0 ${activeChannel === 'SWAP_OFFER' ? 'bg-navy-900 text-white shadow-sm' : 'bg-white text-navy-800 hover:bg-cream-100 border border-cream-200'}"
          >
            🌱 Skill Swap Offers
          </button>
        </div>

        <!-- Tag Filter Pills Bar -->
        <div class="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 scrollbar-none">
          <span class="text-warmgray-500 font-bold text-xs mr-1">Trending Tags:</span>
          ${TRENDING_TAGS.map(t => html`
            <button
              key=${t}
              onClick=${() => setSelectedTag(selectedTag === t ? 'ALL' : t)}
              class="px-3 py-1 rounded-full border transition-all font-semibold shrink-0 ${selectedTag === t ? 'bg-navy-800 text-white border-navy-800 shadow-xs' : 'bg-white text-navy-900 border-cream-300 hover:bg-cream-50'}"
            >
              ${t}
            </button>
          `)}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <!-- Main Feed Column (2 Cols) -->
          <div class="lg:col-span-2 space-y-6">

            <!-- ---------------------------------------------------- -->
            <!-- MULTI-FORMAT POST COMPOSER MODAL / DRAWER -->
            <!-- ---------------------------------------------------- -->
            ${currentUser && composerOpen ? html`
              <div class="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-xl space-y-5 text-xs animate-fadeIn">
                <div class="flex items-center justify-between border-b border-cream-200 pb-3">
                  <h3 class="font-serif text-lg font-bold text-navy-950 flex items-center gap-2">
                    <span>✍️ Publish to Community Feed</span>
                  </h3>
                  <button onClick=${() => setComposerOpen(false)} class="p-1.5 text-warmgray-500 hover:bg-cream-100 rounded-xl">✕</button>
                </div>

                <!-- Post Format Selector -->
                <div class="grid grid-cols-3 sm:grid-cols-5 gap-2 p-1.5 bg-cream-50 rounded-2xl border border-cream-200 text-center font-bold text-[11px]">
                  <button
                    type="button"
                    onClick=${() => setPostType('POST')}
                    class="py-2 px-1 rounded-xl transition-all ${postType === 'POST' ? 'bg-navy-900 text-white shadow-xs' : 'text-navy-800 hover:bg-white'}"
                  >
                    📝 Discussion
                  </button>
                  <button
                    type="button"
                    onClick=${() => setPostType('IMAGE')}
                    class="py-2 px-1 rounded-xl transition-all ${postType === 'IMAGE' ? 'bg-navy-900 text-white shadow-xs' : 'text-navy-800 hover:bg-white'}"
                  >
                    🖼️ Image
                  </button>
                  <button
                    type="button"
                    onClick=${() => setPostType('VIDEO')}
                    class="py-2 px-1 rounded-xl transition-all ${postType === 'VIDEO' ? 'bg-navy-900 text-white shadow-xs' : 'text-navy-800 hover:bg-white'}"
                  >
                    🎥 Video
                  </button>
                  <button
                    type="button"
                    onClick=${() => setPostType('BLOG')}
                    class="py-2 px-1 rounded-xl transition-all ${postType === 'BLOG' ? 'bg-navy-900 text-white shadow-xs' : 'text-navy-800 hover:bg-white'}"
                  >
                    📰 Tech Blog
                  </button>
                  <button
                    type="button"
                    onClick=${() => setPostType('CODE')}
                    class="py-2 px-1 rounded-xl transition-all ${postType === 'CODE' ? 'bg-navy-900 text-white shadow-xs' : 'text-navy-800 hover:bg-white'}"
                  >
                    💻 Code
                  </button>
                </div>

                <form onSubmit=${handleCreatePost} class="space-y-4">
                  <!-- Title Input -->
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">
                      ${postType === 'BLOG' ? 'Article Title / Headline' : postType === 'VIDEO' ? 'Video Tutorial Title' : postType === 'IMAGE' ? 'Showcase / Project Title' : 'Post Title'}
                    </label>
                    <input
                      type="text"
                      required
                      value=${title}
                      onChange=${e => setTitle(e.target.value)}
                      placeholder=${postType === 'BLOG' ? 'e.g. Scaling UPI Webhook Engine to 50,000 req/sec with Go & Redis' : postType === 'VIDEO' ? 'e.g. React 19 State Management & Server Actions Walkthrough' : 'Enter a clear headline...'}
                      class="w-full p-3 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-semibold text-navy-900"
                    />
                  </div>

                  <!-- Media URL / Video Link / Image Preset Inputs -->
                  ${postType === 'IMAGE' && html`
                    <div class="space-y-2 p-3 bg-cream-50/70 rounded-2xl border border-cream-200">
                      <label class="block font-bold text-navy-950">Image URL (or select preset)</label>
                      <input
                        type="url"
                        value=${mediaUrl}
                        onChange=${e => setMediaUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or paste image direct URL"
                        class="w-full p-2.5 bg-white border border-cream-300 rounded-xl text-xs font-medium"
                      />
                      <div class="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                        <span class="text-warmgray-500 font-bold">Presets:</span>
                        ${IMAGE_PRESETS.map(p => html`
                          <button
                            type="button"
                            key=${p.label}
                            onClick=${() => setMediaUrl(p.url)}
                            class="px-2 py-0.5 bg-white hover:bg-cream-100 border border-cream-300 rounded text-navy-800 font-medium"
                          >
                            ${p.label}
                          </button>
                        `)}
                      </div>
                      ${mediaUrl ? html`
                        <div class="mt-2 rounded-xl overflow-hidden max-h-48 border border-cream-300">
                          <img src=${mediaUrl} alt="Preview" class="w-full h-48 object-cover" onError=${e => e.target.style.display = 'none'} />
                        </div>
                      ` : null}
                    </div>
                  `}

                  ${postType === 'VIDEO' && html`
                    <div class="space-y-2 p-3 bg-cream-50/70 rounded-2xl border border-cream-200">
                      <label class="block font-bold text-navy-950">Video URL (YouTube, Vimeo, MP4)</label>
                      <input
                        type="url"
                        value=${mediaUrl}
                        onChange=${e => setMediaUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or Loom/Vimeo link"
                        class="w-full p-2.5 bg-white border border-cream-300 rounded-xl text-xs font-medium"
                      />
                      <div class="flex items-center gap-1.5 flex-wrap pt-1 text-[10px]">
                        <span class="text-warmgray-500 font-bold">Presets:</span>
                        ${VIDEO_PRESETS.map(p => html`
                          <button
                            type="button"
                            key=${p.label}
                            onClick=${() => setMediaUrl(p.url)}
                            class="px-2 py-0.5 bg-white hover:bg-cream-100 border border-cream-300 rounded text-navy-800 font-medium"
                          >
                            ${p.label}
                          </button>
                        `)}
                      </div>
                    </div>
                  `}

                  ${postType === 'BLOG' && html`
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block font-bold text-navy-950 mb-1">Cover Image URL (Optional)</label>
                        <input
                          type="url"
                          value=${coverImage}
                          onChange=${e => setCoverImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label class="block font-bold text-navy-950 mb-1">Estimated Read Time</label>
                        <select value=${readTime} onChange=${e => setReadTime(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-semibold">
                          <option value="3 min read">3 min read</option>
                          <option value="5 min read">5 min read</option>
                          <option value="8 min read">8 min read</option>
                          <option value="12 min read">12 min read (Deep Dive)</option>
                        </select>
                      </div>
                    </div>
                  `}

                  <!-- Content / Description / Article Textarea -->
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">
                      ${postType === 'BLOG' ? 'Full Article Markdown Content' : postType === 'CODE' ? 'Code Snippet & Explanation' : 'Post Content / Description'}
                    </label>
                    <textarea
                      required
                      rows=${postType === 'BLOG' ? '8' : '4'}
                      value=${content}
                      onChange=${e => setContent(e.target.value)}
                      placeholder=${postType === 'BLOG' ? 'Write your complete technical guide, architectural breakdowns, code blocks, and takeaways using markdown...' : 'Share details, background context, or learning goals...'}
                      class="w-full p-3.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-medium text-navy-900 leading-relaxed font-sans"
                    ></textarea>
                  </div>

                  <!-- Tags Input -->
                  <div>
                    <label class="block font-bold text-navy-950 mb-1">Topic Tags (comma-separated)</label>
                    <input
                      type="text"
                      value=${tags}
                      onChange=${e => setTags(e.target.value)}
                      placeholder="#SystemDesign, #ReactJS, #UPI_Fintech, #GoLang"
                      class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl"
                    />
                  </div>

                  <!-- Optional Attached Skills -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label class="block font-bold text-emerald-800 text-[10px] uppercase mb-1">Attach Skill You Can Teach</label>
                      <select value=${teachSkillId} onChange=${e => setTeachSkillId(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-semibold text-navy-900">
                        <option value="">(Optional) Select teaching skill...</option>
                        ${allSkills.map(s => html`<option key=${s.id} value=${s.id}>🌱 ${s.name}</option>`)}
                      </select>
                    </div>

                    <div>
                      <label class="block font-bold text-indigo-900 text-[10px] uppercase mb-1">Attach Skill You Want to Learn</label>
                      <select value=${learnSkillId} onChange=${e => setLearnSkillId(e.target.value)} class="w-full p-2.5 bg-cream-50 border border-cream-300 rounded-xl font-semibold text-navy-900">
                        <option value="">(Optional) Select learning target...</option>
                        ${allSkills.map(s => html`<option key=${s.id} value=${s.id}>🎯 ${s.name}</option>`)}
                      </select>
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <div class="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick=${() => setComposerOpen(false)} class="px-5 py-2.5 bg-cream-100 hover:bg-cream-200 text-navy-900 font-bold rounded-xl">
                      Cancel
                    </button>
                    <button type="submit" disabled=${submitting} class="px-7 py-2.5 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl shadow-md transition-all">
                      ${submitting ? 'Publishing...' : 'Publish to Feed →'}
                    </button>
                  </div>
                </form>
              </div>
            ` : null}

            ${loading ? html`
              <div class="p-16 text-center space-y-3 bg-white rounded-3xl border border-cream-300">
                <div class="w-10 h-10 border-4 border-navy-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p class="text-xs font-semibold text-warmgray-600">Loading community feed...</p>
              </div>
            ` : null}

            ${!loading && filteredPosts.length === 0 ? html`
              <div class="p-14 bg-white rounded-3xl border border-cream-300 text-center space-y-4 shadow-sm">
                <div class="text-4xl">📬</div>
                <div class="space-y-1">
                  <h3 class="font-serif text-lg font-bold text-navy-950">No Posts Found in this Category</h3>
                  <p class="text-xs text-warmgray-600">Be the first to share an article, image, video tutorial, or swap offer!</p>
                </div>
                <button onClick=${() => { setActiveChannel('ALL'); setSelectedTag('ALL'); }} class="px-5 py-2 bg-navy-700 text-white font-bold rounded-xl text-xs">
                  Show All Posts
                </button>
              </div>
            ` : null}

            <!-- ---------------------------------------------------- -->
            <!-- POST CARDS STREAM -->
            <!-- ---------------------------------------------------- -->
            ${filteredPosts.map(p => {
              const pType = p.post_type || 'POST';
              const isAuthor = currentUser && currentUser.id === p.user_id;
              const isAdmin = currentUser && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(currentUser.role);
              const isCommentsOpen = openComments[p.id];
              const tagList = (p.tags || '').split(',').map(t => t.trim()).filter(Boolean);

              return html`
                <div key=${p.id} class="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-sm space-y-5 hover:border-navy-400/60 transition-all duration-200 animate-fadeIn">
                  
                  <!-- Post Header: Author & Meta -->
                  <div class="flex items-center justify-between gap-3 border-b border-cream-100 pb-4">
                    <div class="flex items-center gap-3 cursor-pointer" onClick=${() => onViewProfile && onViewProfile(p.username || p.user_id)}>
                      <img
                        src=${p.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.user_name}`}
                        class="w-11 h-11 rounded-2xl object-cover border border-cream-200 shadow-sm ring-2 ring-navy-600/10"
                      />
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="font-bold text-navy-950 text-sm hover:underline">${p.user_name}</h4>
                          <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                            pType === 'BLOG' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                            pType === 'VIDEO' ? 'bg-rose-50 text-rose-900 border border-rose-200' :
                            pType === 'IMAGE' ? 'bg-purple-50 text-purple-900 border border-purple-200' :
                            pType === 'CODE' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                            'bg-navy-50 text-navy-800 border border-navy-200'
                          }">
                            ${pType === 'BLOG' ? '📰 Tech Blog' : pType === 'VIDEO' ? '🎥 Video Tutorial' : pType === 'IMAGE' ? '🖼️ Showcase' : pType === 'CODE' ? '💻 Code' : '💬 Post'}
                          </span>
                        </div>
                        <p class="text-[10px] text-warmgray-500 font-semibold">${p.headline || 'Peer Learner'} · ${new Date(p.created_at).toLocaleDateString([], { dateStyle: 'medium' })}</p>
                      </div>
                    </div>

                    <!-- Author Action Button -->
                    <div class="flex items-center gap-2">
                      ${currentUser && !isAuthor ? html`
                        <button
                          onClick=${() => onProposeSwap && onProposeSwap({ user: { id: p.user_id, name: p.user_name } })}
                          class="px-3.5 py-1.5 bg-navy-800 hover:bg-navy-900 text-white rounded-xl font-bold text-xs shadow-sm hover:scale-105 transition-all"
                        >
                          Propose Swap →
                        </button>
                      ` : null}

                      ${(isAuthor || isAdmin) ? html`
                        <button
                          onClick=${() => handleDeletePost(p.id)}
                          class="p-2 text-warmgray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Post"
                        >
                          🗑️
                        </button>
                      ` : null}
                    </div>
                  </div>

                  <!-- Post Body / Content Rendering -->
                  <div class="space-y-3">
                    <h3 class="font-serif text-xl font-bold text-navy-950 leading-snug">
                      ${p.title}
                    </h3>

                    <!-- 1. IMAGE POST PRESENTATION -->
                    ${pType === 'IMAGE' && p.media_url ? html`
                      <div class="rounded-2xl overflow-hidden border border-cream-300 shadow-inner group relative cursor-pointer" onClick=${() => setViewingImageModal(p.media_url)}>
                        <img src=${p.media_url} alt=${p.title} class="w-full max-h-[420px] object-cover group-hover:scale-[1.01] transition-transform duration-300" />
                        <div class="absolute bottom-2 right-2 px-2.5 py-1 bg-navy-950/80 backdrop-blur-sm rounded-lg text-white font-bold text-[10px] flex items-center gap-1">
                          <span>🔍 Click to Zoom</span>
                        </div>
                      </div>
                    ` : null}

                    <!-- 2. VIDEO POST PRESENTATION -->
                    ${pType === 'VIDEO' && p.media_url ? html`
                      <div class="rounded-2xl overflow-hidden border border-cream-300 shadow-md aspect-video bg-black">
                        ${(p.media_url.includes('youtube.com') || p.media_url.includes('youtu.be') || p.media_url.includes('vimeo.com')) ? html`
                          <iframe
                            src=${getVideoEmbedUrl(p.media_url)}
                            class="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ` : html`
                          <video src=${p.media_url} controls class="w-full h-full object-cover"></video>
                        `}
                      </div>
                    ` : null}

                    <!-- 3. TECHNICAL BLOG PRESENTATION -->
                    ${pType === 'BLOG' ? html`
                      <div class="space-y-3">
                        ${p.cover_image ? html`
                          <div class="rounded-2xl overflow-hidden max-h-64 border border-cream-300 shadow-sm cursor-pointer" onClick=${() => setReadingArticle(p)}>
                            <img src=${p.cover_image} alt=${p.title} class="w-full h-64 object-cover hover:scale-105 transition-transform duration-300" />
                          </div>
                        ` : null}
                        <div class="flex items-center gap-3 text-[11px] text-warmgray-500 font-semibold">
                          <span>⏱️ ${p.read_time || '4 min read'}</span>
                          <span>•</span>
                          <span>Technical Deep Dive</span>
                        </div>
                        <p class="text-xs sm:text-sm text-warmgray-700 leading-relaxed line-clamp-3">
                          ${p.content}
                        </p>
                        <button
                          onClick=${() => setReadingArticle(p)}
                          class="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-navy-900 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                        >
                          <span>📖</span> Read Full Article →
                        </button>
                      </div>
                    ` : pType === 'CODE' ? html`
                      <!-- 4. CODE POST PRESENTATION -->
                      <div class="space-y-2">
                        <p class="text-xs sm:text-sm text-warmgray-700 leading-relaxed">${p.content}</p>
                        <div class="bg-navy-955 rounded-2xl p-4 border border-navy-800 text-white font-mono text-xs overflow-x-auto relative">
                          <button
                            onClick=${() => {
                              navigator.clipboard.writeText(p.content);
                              alert('Code copied to clipboard! 📋');
                            }}
                            class="absolute top-3 right-3 px-2.5 py-1 bg-navy-800 hover:bg-navy-700 text-cream-200 rounded-lg text-[10px] font-bold border border-navy-700"
                          >
                            📋 Copy
                          </button>
                          <pre class="text-emerald-300 whitespace-pre-wrap">${p.content}</pre>
                        </div>
                      </div>
                    ` : html`
                      <!-- 5. GENERAL POST -->
                      <p class="text-xs sm:text-sm text-warmgray-700 leading-relaxed whitespace-pre-wrap">${p.content}</p>
                    `}
                  </div>

                  <!-- Attached Reciprocal Skills -->
                  ${(p.teach_skill || p.learn_skill) ? html`
                    <div class="flex flex-wrap gap-2 text-xs pt-1">
                      ${p.teach_skill ? html`
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px]">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Offers to Teach: <strong>${p.teach_skill}</strong>
                        </span>
                      ` : null}
                      ${p.learn_skill ? html`
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 text-indigo-900 border border-indigo-200 font-semibold text-[10px]">
                          <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                          Wants to Learn: <strong>${p.learn_skill}</strong>
                        </span>
                      ` : null}
                    </div>
                  ` : null}

                  <!-- Tags -->
                  ${tagList.length > 0 ? html`
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      ${tagList.map(t => html`
                        <button
                          key=${t}
                          onClick=${() => setSelectedTag(t)}
                          class="px-2.5 py-0.5 rounded-md bg-cream-50 hover:bg-cream-100 text-navy-800 border border-cream-200 text-[10px] font-medium"
                        >
                          ${t}
                        </button>
                      `)}
                    </div>
                  ` : null}

                  <!-- Engagement Footer (Likes, Comments, Share) -->
                  <div class="flex items-center justify-between border-t border-cream-100 pt-3.5 text-xs text-warmgray-600">
                    <div class="flex items-center gap-3">
                      <!-- Like Button -->
                      <button
                        onClick=${() => handleToggleLike(p.id)}
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                          p.user_liked ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-cream-50 hover:bg-cream-100 text-warmgray-700 border border-cream-200'
                        }"
                      >
                        <span class="${p.user_liked ? 'scale-125' : ''} transition-transform">❤️</span>
                        <span>${p.likes_count || 0} Likes</span>
                      </button>

                      <!-- Comment Toggle Button -->
                      <button
                        onClick=${() => setOpenComments(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-cream-50 hover:bg-cream-100 text-warmgray-700 border border-cream-200 transition-colors"
                      >
                        <span>💬</span>
                        <span>${(p.comments || []).length} Comments</span>
                      </button>
                    </div>

                    <!-- Share Button -->
                    <button
                      onClick=${() => copyPostLink(p)}
                      class="flex items-center gap-1 font-bold text-navy-800 hover:text-navy-950 p-1.5 rounded-lg hover:bg-cream-50 text-[11px]"
                    >
                      <span>🔗</span> Share
                    </button>
                  </div>

                  <!-- Comments Section (Expandable) -->
                  ${isCommentsOpen ? html`
                    <div class="space-y-3 pt-2 border-t border-cream-100 text-xs animate-fadeIn">
                      <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        ${(p.comments || []).length === 0 ? html`
                          <p class="text-warmgray-400 italic text-[11px] py-2 text-center">No comments yet. Write the first response!</p>
                        ` : (p.comments || []).map(c => html`
                          <div key=${c.id} class="p-3 bg-cream-50/80 border border-cream-200 rounded-2xl flex items-start gap-2.5">
                            <img src=${c.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user_name}`} class="w-7 h-7 rounded-full object-cover border border-cream-200 shrink-0" />
                            <div class="flex-1 space-y-0.5">
                              <div class="flex justify-between items-center text-[10px]">
                                <span class="font-bold text-navy-950">${c.user_name}</span>
                                <span class="text-warmgray-400">${new Date(c.created_at).toLocaleDateString()}</span>
                              </div>
                              <p class="text-warmgray-700 text-xs leading-relaxed">${c.content}</p>
                            </div>
                          </div>
                        `)}
                      </div>

                      <!-- Comment Composer -->
                      ${currentUser ? html`
                        <form onSubmit=${e => handlePostComment(e, p.id)} class="flex gap-2 pt-1">
                          <input
                            type="text"
                            required
                            value=${commentTexts[p.id] || ''}
                            onChange=${e => setCommentTexts(prev => ({ ...prev, [p.id]: e.target.value }))}
                            placeholder="Write a comment or connect with author..."
                            class="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:border-navy-600 font-medium text-navy-900 text-xs"
                          />
                          <button
                            type="submit"
                            disabled=${commentSubmitting[p.id] || !commentTexts[p.id]?.trim()}
                            class="px-5 py-2.5 bg-navy-700 hover:bg-navy-800 disabled:opacity-50 text-white font-bold rounded-xl shrink-0 transition-all text-xs shadow-sm"
                          >
                            Comment
                          </button>
                        </form>
                      ` : null}
                    </div>
                  ` : null}

                </div>
              `;
            })}
          </div>

          <!-- Sidebar Column (1 Col) -->
          <div class="space-y-6">
            
            <!-- Quick Post Launcher Banner -->
            ${currentUser ? html`
              <div class="bg-gradient-to-br from-navy-900 to-navy-955 text-white p-6 rounded-3xl border border-navy-800 shadow-md space-y-3 text-xs">
                <h3 class="font-serif text-lg font-bold text-white flex items-center gap-2">
                  <span>🚀 Share Your Knowledge</span>
                </h3>
                <p class="text-cream-300 text-[11px] leading-relaxed">
                  Have a system design blueprint, a coding tutorial, an architecture diagram, or a tech blog? Share it on the public feed!
                </p>
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick=${() => { setPostType('BLOG'); setComposerOpen(true); }}
                    class="p-2.5 bg-navy-800 hover:bg-navy-700 text-cream-100 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <span>📰</span> Write Blog
                  </button>
                  <button
                    onClick=${() => { setPostType('IMAGE'); setComposerOpen(true); }}
                    class="p-2.5 bg-navy-800 hover:bg-navy-700 text-cream-100 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1"
                  >
                    <span>🖼️</span> Post Image
                  </button>
                </div>
              </div>
            ` : null}

            <!-- Active Study Circles Widget -->
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 text-xs">
              <div class="flex items-center justify-between border-b border-cream-100 pb-2.5">
                <h3 class="font-serif text-base font-bold text-navy-950 flex items-center gap-2">
                  <span>⚡ Active Skill Circles</span>
                </h3>
                <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-extrabold uppercase">Live 🇮🇳</span>
              </div>

              <div class="space-y-3">
                ${studyCircles.map((circle, cIdx) => html`
                  <div key=${cIdx} class="p-3 bg-cream-50/70 border border-cream-200/60 rounded-2xl space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-navy-950 flex items-center gap-1.5">
                        <span>${circle.icon}</span>
                        <span>${circle.name}</span>
                      </span>
                      <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cream-200 text-navy-800">${circle.tag}</span>
                    </div>
                    <div class="flex items-center justify-between text-[10px] text-warmgray-500 font-semibold">
                      <span>Host: ${circle.host}</span>
                      <span>👥 ${circle.members} swappers</span>
                    </div>
                  </div>
                `)}
              </div>
            </div>

            <!-- Weekly Knowledge Leaderboard -->
            <div class="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4 text-xs">
              <h3 class="font-serif text-base font-bold text-navy-950 border-b border-cream-100 pb-2.5 flex items-center gap-2">
                <span>🏆 Top Peer Mentors in India</span>
              </h3>

              <div class="space-y-3">
                ${weeklyLeaderboard.map(leader => html`
                  <div key=${leader.rank} class="flex items-center justify-between p-2.5 bg-cream-50/50 rounded-2xl border border-cream-200/60">
                    <div class="flex items-center gap-2.5">
                      <span class="font-serif font-black text-sm text-navy-700 w-4">${leader.rank}.</span>
                      <img src=${leader.avatar} class="w-8 h-8 rounded-full object-cover border border-cream-200" />
                      <div>
                        <h5 class="font-bold text-navy-950 leading-tight">${leader.name}</h5>
                        <span class="text-[9px] text-warmgray-500 font-semibold">${leader.badge}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="px-2 py-0.5 bg-sky-50 text-indigo-950 border border-indigo-200 rounded-md font-extrabold text-[10px] block">
                        ${leader.karma}
                      </span>
                      <span class="text-[9px] text-warmgray-500 font-bold block mt-0.5">${leader.swaps} swaps</span>
                    </div>
                  </div>
                `)}
              </div>
            </div>

            <!-- Community Guidelines & Barter Rules -->
            <div class="bg-cream-50 p-5 rounded-3xl border border-cream-200 space-y-2 text-xs">
              <h4 class="font-bold text-navy-950">🤝 Barter & Content Guidelines</h4>
              <ul class="space-y-1.5 text-warmgray-600 text-[11px] leading-relaxed">
                <li>• Pure peer knowledge exchange: zero paid promotions or spam.</li>
                <li>• Attribute original sources for technical images and diagrams.</li>
                <li>• Constructive, respectful feedback on peer code snippets.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- ---------------------------------------------------- -->
        <!-- FULL ARTICLE READING MODAL (FOR BLOGS) -->
        <!-- ---------------------------------------------------- -->
        ${readingArticle ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-955/70 backdrop-blur-md animate-fadeIn">
            <div class="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-cream-300 shadow-2xl space-y-6 text-left">
              <div class="flex items-center justify-between border-b border-cream-200 pb-4">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                    📰 Technical Article
                  </span>
                  <span class="text-xs text-warmgray-500 font-semibold">⏱️ ${readingArticle.read_time || '4 min read'}</span>
                </div>
                <button onClick=${() => setReadingArticle(null)} class="p-2 text-warmgray-500 hover:bg-cream-100 rounded-xl text-sm font-bold">✕ Close</button>
              </div>

              ${readingArticle.cover_image ? html`
                <div class="rounded-2xl overflow-hidden max-h-72 border border-cream-300 shadow-sm">
                  <img src=${readingArticle.cover_image} alt=${readingArticle.title} class="w-full h-72 object-cover" />
                </div>
              ` : null}

              <div class="space-y-3">
                <h1 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950 leading-tight">
                  ${readingArticle.title}
                </h1>
                
                <div class="flex items-center gap-3 py-2 border-y border-cream-100 text-xs text-warmgray-600">
                  <img src=${readingArticle.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${readingArticle.user_name}`} class="w-8 h-8 rounded-full border" />
                  <div>
                    <strong class="text-navy-950">${readingArticle.user_name}</strong> • ${readingArticle.headline || 'Peer Author'}
                  </div>
                </div>

                <div class="text-xs sm:text-sm text-navy-900 font-sans leading-relaxed whitespace-pre-wrap pt-2 space-y-4">
                  ${readingArticle.content}
                </div>
              </div>

              <div class="pt-4 border-t border-cream-200 flex justify-end gap-3">
                <button onClick=${() => copyPostLink(readingArticle)} class="px-4 py-2 bg-cream-100 hover:bg-cream-200 text-navy-900 font-bold rounded-xl text-xs">
                  🔗 Share Article
                </button>
                <button onClick=${() => setReadingArticle(null)} class="px-6 py-2 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs">
                  Done Reading
                </button>
              </div>
            </div>
          </div>
        ` : null}

        <!-- ---------------------------------------------------- -->
        <!-- IMAGE LIGHTBOX / ZOOM MODAL -->
        <!-- ---------------------------------------------------- -->
        ${viewingImageModal ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn" onClick=${() => setViewingImageModal(null)}>
            <div class="max-w-4xl max-h-[90vh] overflow-hidden relative">
              <button onClick=${() => setViewingImageModal(null)} class="absolute top-4 right-4 z-10 px-3 py-1.5 bg-black/70 hover:bg-black text-white font-bold rounded-xl text-xs">
                ✕ Close
              </button>
              <img src=${viewingImageModal} alt="Enlarged Showcase" class="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
            </div>
          </div>
        ` : null}

      </div>
    `;
  }
  window.SkillSwap.CommunityFeedView = CommunityFeedView;

  // ----------------------------------------------------
  // Terms & Swap Agreements Page
  // ----------------------------------------------------
  function TermsView() {
    return html`
      <div class="max-w-4xl mx-auto px-4 py-12 space-y-8 text-left animate-fadeIn">
        <div class="border-b border-cream-300 pb-5">
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-navy-900">Barter & Exchange Terms</h1>
          <p class="text-warmgray-600 text-sm mt-1">Understanding reciprocal peer agreements on SkillSwapX.</p>
        </div>

        <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-warmgray-700">
          <section class="space-y-2">
            <h2 class="font-serif text-lg font-bold text-navy-900">1. Pure Knowledge Barter</h2>
            <p>
              SkillSwapX is structured entirely around non-monetary peer exchange. No currency, token transactions, or credits are facilitated or permitted. Every exchange is a direct mutual swap of skills between two agreeing members.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-serif text-lg font-bold text-navy-900">2. Exchange Agreements</h2>
            <p>
              When two users accept a proposal, they enter a voluntary Exchange Agreement, establishing:
            </p>
            <ul class="list-disc pl-5 space-y-1 text-xs">
              <li>Expected weekly commitment hours (typically 1-2 hours).</li>
              <li>Expected length of cooperation (2, 4, 8, or 12 weeks).</li>
              <li>The topics each party agrees to teach.</li>
            </ul>
          </section>

          <section class="space-y-2">
            <h2 class="font-serif text-lg font-bold text-navy-900">3. Verification & Double-Blind Reviews</h2>
            <p>
              To maintain system trust, users agree to complete blind reviews at the end of their workspace cycles. Reviews measure communication, knowledge sharing, and reliability. Rating manipulation is strictly prohibited and results in account suspension.
            </p>
          </section>
        </div>
      </div>
    `;
  }
  window.SkillSwap.TermsView = TermsView;

  // ----------------------------------------------------
  // Privacy Policy View
  // ----------------------------------------------------
  function PrivacyView() {
    return html`
      <div class="max-w-4xl mx-auto px-4 py-12 space-y-8 text-left animate-fadeIn">
        <div class="border-b border-cream-300 pb-5">
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-navy-900">Privacy & Trust Policy</h1>
          <p class="text-warmgray-600 text-sm mt-1">Our commitment to protecting your identity and workspace data.</p>
        </div>

        <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-warmgray-700">
          <section class="space-y-2">
            <h2 class="font-serif text-lg font-bold text-navy-900">1. No Third-Party Tracking</h2>
            <p>
              We do not track you across the web. We use standard functional session identifiers (cookies) to maintain your secure logged-in state. No ad tags, trackers, or beacons are loaded on this platform.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-serif text-lg font-bold text-navy-900">2. Workspace Confidentiality</h2>
            <p>
              Collaborative workspaces, agendas, scheduled meeting links, and chat records are private to you and your exchange partner. They are not indexed by search engines or shared publicly.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-serif text-lg font-bold text-navy-900">3. Control Over Profile Visibility</h2>
            <p>
              You maintain complete control over who can send exchange proposals to you. In your settings, you can adjust matchmaking preferences or hide your profile from search matrices if you are currently at capacity.
            </p>
          </section>
        </div>
      </div>
    `;
  }
  window.SkillSwap.PrivacyView = PrivacyView;

  // ----------------------------------------------------
  // Swap Guidelines & Etiquette View
  // ----------------------------------------------------
  function GuidelinesView() {
    return html`
      <div class="max-w-4xl mx-auto px-4 py-12 space-y-8 text-left animate-fadeIn">
        <div class="border-b border-cream-300 pb-5">
          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-navy-900">Swap Etiquette Guidelines</h1>
          <p class="text-warmgray-600 text-sm mt-1">Honor codes and teaching frameworks to make swaps successful.</p>
        </div>

        <div class="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6 text-xs sm:text-sm leading-relaxed text-warmgray-700">
          <div class="p-4 bg-sky-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs font-semibold leading-relaxed">
            📢 Read our peer conduct expectations carefully. Community safety and reliability are our highest priorities.
          </div>

          <section class="space-y-2">
            <h2 class="font-serif text-lg font-bold text-navy-900">1. Honor Commitments</h2>
            <p>
              Peer learning depends entirely on reciprocity. If you schedule a workspace session or agree to a task, attend on time. If you need to reschedule, notify your partner at least 24 hours in advance via the workspace chat.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-serif text-lg font-bold text-navy-900">2. Structure Your Swaps</h2>
            <p>
              Do not go into sessions unstructured. We recommend dedicating the first 15 minutes of every workspace week to setting specific action items and verifying goals. Use the interactive checklist in your workspace.
            </p>
          </section>

          <section class="space-y-2">
            <h2 class="font-serif text-lg font-bold text-navy-900">3. Professional Integrity & Support</h2>
            <p>
              Always treat peer learners with respect. Harrasment, selling courses, or solicitation are strictly forbidden and trigger immediate bans. Utilize the "Report User" option on user profiles if you experience misconduct.
            </p>
          </section>
        </div>
      </div>
    `;
  }
  window.SkillSwap.GuidelinesView = GuidelinesView;

  // ----------------------------------------------------
  // Help Center / How It Works View (Comprehensive 4-Step Visual Journey & Velocity Calculator)
  // ----------------------------------------------------
  function HelpCenterView({ setActiveTab }) {
    const [calcHours, setCalcHours] = useState(3);
    const [calcDomain, setCalcDomain] = useState('coding');

    const domainMultipliers = {
      coding: { name: "Fullstack / AI Engineering", marketCost: 95, speed: "3.2x faster than solitary tutorials" },
      design: { name: "Product Design & Figma", marketCost: 85, speed: "2.8x faster with direct critique" },
      languages: { name: "Language Immersion", marketCost: 55, speed: "4.5x faster conversational fluency" },
      business: { name: "Growth & Product Management", marketCost: 110, speed: "2.5x faster through case studies" }
    };

    const monthlySaved = calcHours * 4 * (domainMultipliers[calcDomain]?.marketCost || 85);
    const annualSaved = monthlySaved * 12;

    const detailedSteps = [
      {
        number: "01",
        title: "Create Your Skill Matrix",
        tag: "Step 1 · 2 Minutes",
        description: "List what you can teach with your current proficiency level, and select the target skills you want to learn. Set your preferred timezone, language, and weekly hours.",
        features: ["1-click skill catalog selector", "Specify Beginner to Masterclass", "Set weekly hours commitment"]
      },
      {
        number: "02",
        title: "6-Factor Synergy Matching",
        tag: "Step 2 · Instant AI Ranking",
        description: "Our algorithm evaluates complementarity, schedule overlap, and trust ratings to suggest ideal bilateral partners where both learners benefit equally.",
        features: ["Explainable synergy match score %", "Timezone overlap radar", "Side-by-side peer comparison"]
      },
      {
        number: "03",
        title: "Launch Private Collaborative Workspace",
        tag: "Step 3 · Structured Execution",
        description: "Accepted proposals launch a shared workspace room equipped with 1:1 video call scheduling, milestone checklist, session notes, and task boards.",
        features: ["Integrated Zoom/Meet scheduler", "Interactive milestone checklist", "Shared note-taking board"]
      },
      {
        number: "04",
        title: "Double-Blind Reviews & Karma Growth",
        tag: "Step 4 · Reputation Accrual",
        description: "Conclude workspaces with blind reviews. Feedback remains hidden until both peers submit, building authentic reputation on your public profile.",
        features: ["Anti-ghosting escrow safeguards", "Verified mastery skill badges", "Unlock masterclass swap tiers"]
      }
    ];

    return html`
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 text-left animate-fadeIn">
        
        <!-- Header -->
        <div class="border-b border-cream-300 pb-8 text-center sm:text-left space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-[10px] font-bold border border-navy-200">
            <span>📖 Platform Blueprint</span>
          </div>
          <h1 class="font-serif text-3xl sm:text-5xl font-extrabold text-navy-950 tracking-tight">How SkillSwapX Works</h1>
          <p class="text-warmgray-600 text-sm sm:text-base max-w-2xl">
            A comprehensive visual guide to pure reciprocal peer knowledge exchange, bilateral accountability, and collaborative workspaces.
          </p>
        </div>

        <!-- 4-Step Interactive Visual Journey -->
        <div class="space-y-8">
          <div class="text-center sm:text-left space-y-1">
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950">The 4-Step Exchange Lifecycle</h2>
            <p class="text-xs sm:text-sm text-warmgray-600">From initial profile creation to verified peer mastery endorsements.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${detailedSteps.map((st, i) => html`
              <div key=${st.number} class="bg-white rounded-3xl p-7 border border-cream-300 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md hover:border-navy-300 transition-all duration-200">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="font-serif text-3xl font-black text-navy-700">${st.number}</span>
                    <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-navy-50 text-navy-800 border border-navy-200">
                      ${st.tag}
                    </span>
                  </div>

                  <div>
                    <h3 class="font-serif text-xl font-bold text-navy-950">${st.title}</h3>
                    <p class="text-xs sm:text-sm text-warmgray-600 mt-1.5 leading-relaxed">${st.description}</p>
                  </div>

                  <div class="space-y-1.5 pt-2 border-t border-cream-100">
                    ${st.features.map(f => html`
                      <div key=${f} class="flex items-center gap-2 text-xs font-semibold text-navy-900">
                        <span class="text-emerald-600 font-bold">✓</span>
                        <span>${f}</span>
                      </div>
                    `)}
                  </div>
                </div>
              </div>
            `)}
          </div>
        </div>

        <!-- Interactive Exchange Potential Calculator -->
        <div class="bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 rounded-3xl p-8 sm:p-12 text-white border border-navy-700/60 shadow-2xl space-y-8">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-6">
            <div>
              <span class="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-sky-300 text-[10px] font-bold border border-indigo-500/30">
                ⚡ Exchange Velocity Calculator
              </span>
              <h2 class="font-serif text-2xl sm:text-3xl font-bold mt-1">Calculate Your Value from Peer Barter</h2>
              <p class="text-xs sm:text-sm text-cream-200/80">Estimate how much money and time you save compared to private tutoring and paid academies.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="space-y-5 bg-navy-800/40 p-6 rounded-2xl border border-navy-700">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-cream-200 mb-2">
                  Select Domain of Study:
                </label>
                <select
                  value=${calcDomain}
                  onChange=${e => setCalcDomain(e.target.value)}
                  class="w-full p-3 bg-navy-900 border border-navy-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-navy-500"
                >
                  <option value="coding">Software Engineering ($95/hr market equivalent)</option>
                  <option value="design">Product Design & Figma ($85/hr market equivalent)</option>
                  <option value="languages">Language Immersion ($55/hr market equivalent)</option>
                  <option value="business">Growth & Product Strategy ($110/hr market equivalent)</option>
                </select>
              </div>

              <div>
                <div class="flex justify-between text-xs font-bold uppercase tracking-wider text-cream-200 mb-2">
                  <span>Weekly Commitment:</span>
                  <span class="text-sky-400">${calcHours} hours / week</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value=${calcHours}
                  onInput=${e => setCalcHours(Number(e.target.value))}
                  onChange=${e => setCalcHours(Number(e.target.value))}
                  class="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-navy-700"
                />
                <div class="flex justify-between text-[10px] text-cream-200/60 mt-1">
                  <span>1 hr (Casual)</span>
                  <span>5 hrs (Accelerated)</span>
                  <span>10 hrs (Sprint)</span>
                </div>
              </div>
            </div>

            <!-- Results Output Box -->
            <div class="bg-navy-950 p-6 rounded-2xl border border-navy-800 text-center space-y-4">
              <div class="space-y-1">
                <span class="text-[10px] uppercase font-bold text-cream-200/60 block">Equivalent Tutoring Value Earned For Free</span>
                <span class="font-serif text-4xl sm:text-5xl font-extrabold text-sky-400">$${annualSaved.toLocaleString()}</span>
                <span class="text-xs text-cream-200/80 block">per year ($${monthlySaved.toLocaleString()} / month)</span>
              </div>
              <div class="p-3 bg-navy-900 rounded-xl text-xs text-emerald-300 font-semibold border border-navy-800">
                🚀 Velocity: ${domainMultipliers[calcDomain]?.speed}
              </div>
            </div>
          </div>
        </div>

        <!-- Exchange Etiquette Playbook -->
        <div class="bg-white p-8 sm:p-10 rounded-3xl border border-cream-300 shadow-sm space-y-6">
          <div class="space-y-1 border-b border-cream-100 pb-4">
            <h3 class="font-serif text-2xl font-bold text-navy-950">🤝 The Swapper Code of Conduct</h3>
            <p class="text-xs text-warmgray-600">Core guidelines that ensure high reciprocity and zero-friction exchanges.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-warmgray-700 leading-relaxed">
            <div class="space-y-2 p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <h4 class="font-bold text-navy-950 text-sm">1. Bilateral Commitment</h4>
              <p>Allocate equal time to teaching and learning. If your partner teaches you for 1 hour, dedicate 1 hour to teaching them in return.</p>
            </div>
            <div class="space-y-2 p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <h4 class="font-bold text-navy-950 text-sm">2. 24-Hour Reschedule Notice</h4>
              <p>Life happens! If you cannot attend a scheduled session, notify your partner at least 24 hours in advance via the workspace.</p>
            </div>
            <div class="space-y-2 p-4 bg-cream-50 rounded-2xl border border-cream-200">
              <h4 class="font-bold text-navy-950 text-sm">3. Actionable Milestones</h4>
              <p>Use the workspace checklist to define tangible deliverables (e.g. build a landing page, debug an API, conduct a mock interview).</p>
            </div>
          </div>
        </div>

        <!-- CTA Box -->
        <div class="text-center bg-cream-50 border border-cream-300 rounded-3xl p-8 space-y-4">
          <h3 class="font-serif text-2xl font-bold text-navy-950">Ready to begin your first exchange?</h3>
          <p class="text-xs sm:text-sm text-warmgray-600 max-w-md mx-auto">Create your free profile in under 2 minutes and start matching with verified peers immediately.</p>
          <button onClick=${() => (setActiveTab ? setActiveTab('signup') : (window.location.hash = 'signup'))} class="px-7 py-3.5 bg-navy-700 hover:bg-navy-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-all">
            Get Started Free →
          </button>

        </div>
      </div>
    `;
  }
  window.SkillSwap.HelpCenterView = HelpCenterView;
  // ----------------------------------------------------
  // Features View (Deep-Dive 6-Factor Synergy, Workspaces & Comparison Table)
  // ----------------------------------------------------
  function FeaturesView() {
    const synergyFactors = [
      { name: "Complementary Skills Overlap", weight: "35%", icon: "sparkles", description: "Evaluates exact mirror reciprocity: you teach what they want, they teach what you need." },
      { name: "Proficiency Level Parity", weight: "25%", icon: "award", description: "Matches peer experience (Beginner, Intermediate, Masterclass) to ensure smooth pacing." },
      { name: "Timezone Overlap Hours", weight: "15%", icon: "globe", description: "Calculates synchronized active hours per day for frictionless video meetings." },
      { name: "Target Schedule Cadence", weight: "10%", icon: "calendar", description: "Aligns weekly availability limits (e.g. 2 hrs/week vs intensive 6 hrs/week)." },
      { name: "Goal & Milestone Compatibility", weight: "10%", icon: "check-circle", description: "Compares structured action plans, target deliverables, and timeline duration." },
      { name: "Community Trust & Karma Rating", weight: "5%", icon: "shield", description: "Factors verified reviews, punctuality history, and anti-ghosting track records." }
    ];

    const featureMatrix = [
      { capability: "1-on-1 Reciprocal Matching", free: "✅ Unlimited", pro: "✅ Priority Algorithm" },
      { capability: "Explainable Synergy Breakdown %", free: "✅ Included", pro: "✅ Deep Multi-Radar" },
      { capability: "Collaborative Workspaces", free: "✅ Up to 3 Active", pro: "✅ Unlimited Active" },
      { capability: "Integrated Video Scheduler", free: "✅ Zoom/Meet/Teams", pro: "✅ Zoom/Meet/Teams + Auto-Sync" },
      { capability: "Double-Blind Verified Reviews", free: "✅ Included", pro: "✅ Verified Credential Badge" },
      { capability: "Peer Comparison Matrix", free: "✅ Up to 3 Peers", pro: "✅ Unlimited Side-by-Side" },
      { capability: "Async Code / Design Review Mode", free: "✅ Included", pro: "✅ High-Priority Queue" },
      { capability: "Admin Mediation & Protection", free: "✅ 24-hr Response", pro: "✅ Priority Support" }
    ];

    return html`
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16 text-left animate-fadeIn">
        
        <!-- Header -->
        <div class="border-b border-cream-300 pb-8 text-center sm:text-left space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-[10px] font-bold border border-navy-200">
            <span>✨ Complete Architectural Overview</span>
          </div>
          <h1 class="font-serif text-3xl sm:text-5xl font-extrabold text-navy-950 tracking-tight">Platform Core Capabilities</h1>
          <p class="text-warmgray-600 text-sm sm:text-base max-w-2xl">
            Explore the proprietary systems engineered to facilitate secure, explainable, and structured peer knowledge exchanges.
          </p>
        </div>

        <!-- 6-Factor Synergy Engine Deep Dive -->
        <div class="space-y-8">
          <div class="text-center sm:text-left space-y-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-navy-600">The Proprietary Matchmaker</span>
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950">The 6-Factor Synergy Algorithm</h2>
            <p class="text-xs sm:text-sm text-warmgray-600">How SkillSwapX computes a mathematical compatibility score between two practitioners.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${synergyFactors.map((factor, idx) => html`
              <div key=${idx} class="bg-white rounded-3xl p-6 border border-cream-300 shadow-sm space-y-4 hover:border-navy-300 transition-all duration-200">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-1 rounded-md bg-navy-50 text-navy-800 text-xs font-black border border-navy-200">
                    ${factor.weight} Weight
                  </span>
                  <span class="text-xs font-bold text-warmgray-400">Factor 0${idx + 1}</span>
                </div>
                <h3 class="font-serif text-lg font-bold text-navy-950">${factor.name}</h3>
                <p class="text-xs text-warmgray-600 leading-relaxed">${factor.description}</p>
              </div>
            `)}
          </div>
        </div>

        <!-- Collaborative Exchange Workspaces Deep Dive -->
        <div class="bg-white rounded-3xl p-8 sm:p-12 border border-cream-300 shadow-lg space-y-8">
          <div class="space-y-2 border-b border-cream-100 pb-6">
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
              Workspace OS
            </span>
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950">Dedicated Collaborative Workspaces</h2>
            <p class="text-xs sm:text-sm text-warmgray-600 max-w-2xl">
              Every accepted match automatically provisions a secure private exchange workspace with built-in productivity tools.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <div class="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                <h4 class="font-bold text-navy-950 text-sm flex items-center gap-2">
                  <span>📅 1:1 Video Session Scheduler</span>
                </h4>
                <p class="text-xs text-warmgray-600 leading-relaxed">
                  Easily schedule practice sessions with embedded Zoom, Google Meet, or Microsoft Teams links. Log agenda topics before each call.
                </p>
              </div>

              <div class="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                <h4 class="font-bold text-navy-950 text-sm flex items-center gap-2">
                  <span>🎯 Interactive Milestone Tracker</span>
                </h4>
                <p class="text-xs text-warmgray-600 leading-relaxed">
                  Break exchanges into tangible milestones with real-time percentage progress bars to maintain clear momentum.
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div class="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                <h4 class="font-bold text-navy-950 text-sm flex items-center gap-2">
                  <span>📝 Shared Notes & Meeting Minutes</span>
                </h4>
                <p class="text-xs text-warmgray-600 leading-relaxed">
                  Collaborative scratchpad for recording code snippets, design references, homework assignments, and key takeaways.
                </p>
              </div>

              <div class="p-5 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                <h4 class="font-bold text-navy-950 text-sm flex items-center gap-2">
                  <span>🔒 Escrow & Anti-Ghosting Safeguards</span>
                </h4>
                <p class="text-xs text-warmgray-600 leading-relaxed">
                  Automated checks protect committed swappers and adjust community reputation if agreements are abandoned prematurely.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Comparison Matrix Table -->
        <div class="space-y-6">
          <div class="text-center sm:text-left space-y-1">
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-navy-950">Feature Capabilities Matrix</h2>
            <p class="text-xs sm:text-sm text-warmgray-600">Transparent comparison of platform capabilities across standard and verified swappers.</p>
          </div>

          <div class="bg-white rounded-3xl border border-cream-300 shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-cream-100 border-b border-cream-300 text-navy-950 font-bold uppercase tracking-wider text-[10px]">
                    <th class="p-4 sm:p-5">Platform Capability</th>
                    <th class="p-4 sm:p-5">Standard Swapper (Free)</th>
                    <th class="p-4 sm:p-5 bg-navy-50 text-navy-900 font-extrabold border-l border-r border-navy-200">Verified Swapper (Karma 4.8+)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-cream-100">
                  ${featureMatrix.map((row, idx) => html`
                    <tr key=${idx} class="hover:bg-cream-50/40 transition-colors">
                      <td class="p-4 sm:p-5 font-bold text-navy-950">${row.capability}</td>
                      <td class="p-4 sm:p-5 text-warmgray-600">${row.free}</td>
                      <td class="p-4 sm:p-5 bg-navy-50/60 font-bold text-navy-900 border-l border-r border-navy-200">${row.pro}</td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  window.SkillSwap.FeaturesView = FeaturesView;

  // ----------------------------------------------------
  // Collapsible FAQ View (Categorized Topic Pills & Real-Time Search)
  // ----------------------------------------------------
  function FaqView({ setActiveTab }) {
    const [faqOpen, setFaqOpen] = useState({});
    const [activeFaqCategory, setActiveFaqCategory] = useState('ALL');
    const [faqSearch, setFaqSearch] = useState('');

    const toggleFaq = (index) => {
      setFaqOpen(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    };

    const categories = [
      { id: 'ALL', label: 'All FAQs' },
      { id: 'GENERAL', label: 'General & Barter' },
      { id: 'MATCHING', label: 'Synergy Engine' },
      { id: 'WORKSPACES', label: 'Workspaces & Calls' },
      { id: 'TRUST', label: 'Trust & Karma' }
    ];

    const allFaqs = [
      {
        category: 'GENERAL',
        q: "Is SkillSwapX really 100% free? Are there tokens, credits, or hidden subscriptions?",
        a: "Yes, 100% free forever. SkillSwapX operates on pure reciprocal knowledge barter. You teach what you know in exchange for learning what you need. There are no tokens, coins, credits, subscription fees, or processing charges."
      },
      {
        category: 'GENERAL',
        q: "Do I need to be an expert to teach a skill on SkillSwapX?",
        a: "Not at all! Many swappers teach intermediate fundamentals to beginners while learning advanced topics from senior practitioners. As long as you have practical experience and communicate clearly, you can participate."
      },
      {
        category: 'MATCHING',
        q: "How does the 6-factor synergy calculation engine compute match scores?",
        a: "Our algorithm evaluates 6 key dimensions: 35% skill complementarity (you teach what they want, they teach what you want), 25% proficiency level matching, 15% timezone overlap, 10% target availability schedule, 10% milestone timeline compatibility, and 5% community trust ratings."
      },
      {
        category: 'MATCHING',
        q: "Can I swap skills asynchronously if our timezones don't align?",
        a: "Yes! Many practitioners engage in async swaps: detailed code reviews, Figma design critiques, pull request feedback, or recorded walkthroughs via Loom and shared workspace notes."
      },
      {
        category: 'WORKSPACES',
        q: "How are video calls and meetings structured in the workspace?",
        a: "Inside your active workspace, click 'Schedule Practice Session' to set meeting dates, times, agendas, and direct meeting URLs (Zoom, Google Meet, or Microsoft Teams) for instant access."
      },
      {
        category: 'WORKSPACES',
        q: "How many active workspaces can I have at one time?",
        a: "We recommend maintaining 1 to 3 concurrent workspaces to ensure you can dedicate sufficient weekly hours to each exchange partner without burnout."
      },
      {
        category: 'TRUST',
        q: "What happens if an exchange partner becomes unresponsive or cancels repeatedly?",
        a: "Every workspace contains anti-ghosting safeguards. If a partner misses sessions without 24-hour advance notice, you can close the workspace and log feedback. This adjusts their platform reliability rating and protects other swappers."
      },
      {
        category: 'TRUST',
        q: "How do double-blind reviews work?",
        a: "Once an exchange is concluded, both you and your partner write reviews. Reviews remain completely hidden (blind) until both parties submit them, or after 14 days, eliminating revenge ratings and ensuring authentic feedback."
      },
      {
        category: 'TRUST',
        q: "How do I report spam, solicitation, or inappropriate behavior?",
        a: "You can click the 'Report User' button on any member profile or inside a workspace. Select the violation reason and submit details directly to our 24/7 administrative moderation queue for investigation and ban enforcement."
      }
    ];

    const filteredFaqs = useMemo(() => {
      let list = allFaqs;
      if (activeFaqCategory !== 'ALL') {
        list = list.filter(f => f.category === activeFaqCategory);
      }
      if (faqSearch.trim()) {
        const q = faqSearch.toLowerCase();
        list = list.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
      }
      return list;
    }, [allFaqs, activeFaqCategory, faqSearch]);

    return html`
      <div class="max-w-4xl mx-auto px-4 py-14 space-y-10 text-left animate-fadeIn">
        
        <!-- Header -->
        <div class="border-b border-cream-300 pb-8 text-center sm:text-left space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-[10px] font-bold border border-navy-200">
            <span>❓ Knowledge Base</span>
          </div>
          <h1 class="font-serif text-3xl sm:text-5xl font-extrabold text-navy-950 tracking-tight">Frequently Asked Questions</h1>
          <p class="text-warmgray-600 text-sm sm:text-base">
            Detailed guides on peer barter matching, synergy score algorithms, workspaces, and trust standards.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="relative">
          <input
            type="text"
            value=${faqSearch}
            onChange=${e => setFaqSearch(e.target.value)}
            placeholder="Search questions or keywords (e.g. free, video calls, ghosting, synergy)..."
            class="w-full pl-11 pr-4 py-3.5 bg-white border border-cream-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-navy-600 shadow-sm"
          />
          <div class="absolute left-4 top-3.5 text-warmgray-400">
            <${Icon} name="search" class="w-4.5 h-4.5" />
          </div>
          ${faqSearch ? html`
            <button onClick=${() => setFaqSearch('')} class="absolute right-4 top-3.5 text-warmgray-400 hover:text-navy-900 text-xs font-bold">✕</button>
          ` : null}
        </div>

        <!-- Topic Category Pills -->
        <div class="flex flex-wrap items-center gap-2 border-b border-cream-200 pb-4">
          ${categories.map(cat => html`
            <button
              key=${cat.id}
              onClick=${() => setActiveFaqCategory(cat.id)}
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                activeFaqCategory === cat.id
                  ? 'bg-navy-700 text-white shadow-sm'
                  : 'bg-white text-warmgray-700 border border-cream-300 hover:bg-cream-100 hover:text-navy-950'
              }"
            >
              ${cat.label}
            </button>
          `)}
        </div>

        <!-- Accordion FAQ Items -->
        <div class="space-y-4">
          ${filteredFaqs.map((faq, idx) => {
            const isOpen = !!faqOpen[idx];
            return html`
              <div key=${idx} class="bg-white border border-cream-300 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
                <button
                  onClick=${() => toggleFaq(idx)}
                  class="w-full px-6 py-4.5 flex items-center justify-between font-bold text-navy-950 text-xs sm:text-sm hover:bg-cream-50/50 focus:outline-none text-left"
                >
                  <span class="pr-4">${faq.q}</span>
                  <span class="text-navy-600 text-base transition-transform duration-200 transform shrink-0 ${isOpen ? 'rotate-180' : ''}">▼</span>
                </button>
                ${isOpen ? html`
                  <div class="px-6 pb-5 pt-1 text-xs sm:text-sm text-warmgray-600 leading-relaxed border-t border-cream-100 bg-cream-50/30">
                    ${faq.a}
                  </div>
                ` : null}
              </div>
            `;
          })}

          ${filteredFaqs.length === 0 ? html`
            <div class="p-12 bg-white rounded-3xl border border-cream-300 text-center space-y-3 shadow-sm">
              <p class="text-sm font-semibold text-warmgray-600">No questions match "${faqSearch}".</p>
              <button onClick=${() => { setFaqSearch(''); setActiveFaqCategory('ALL'); }} class="px-4 py-2 bg-navy-700 text-white font-bold rounded-xl text-xs">
                Clear Search
              </button>
            </div>
          ` : null}
        </div>

        <!-- Still Have Questions Support Card -->
        <div class="bg-gradient-to-r from-cream-100 via-white to-navy-50 rounded-3xl p-8 border border-cream-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div class="space-y-1">
            <h3 class="font-serif text-xl font-bold text-navy-950">Still have questions?</h3>
            <p class="text-xs text-warmgray-600 max-w-md">Our community team and moderators are available around the clock to help you with your exchange setups.</p>
          </div>
          <button onClick=${() => (setActiveTab ? setActiveTab('help') : (window.location.hash = 'help'))} class="px-6 py-3 bg-navy-700 hover:bg-navy-800 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0">
            Contact Support →
          </button>
        </div>
      </div>
    `;
  }
  window.SkillSwap.FaqView = FaqView;

})();