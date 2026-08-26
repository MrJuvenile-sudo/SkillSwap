// public/app.js - Root Application Controller & Router for SkillSwap
(function() {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const htm = window.htm || self.htm;

  if (!React || !ReactDOM || !htm) {
    console.error('SkillSwap initialization error: React or HTM failed to load.');
    return;
  }

  const { useState, useEffect } = React;
  const html = htm.bind(React.createElement);
  const {
    api,
    Header,
    Footer,
    ProposalModal,
    CompareModal,
    HomeLandingView,
    SignupView,
    LoginView,
    OnboardingWizardView,
    SkillsDirectoryView,
    PublicProfileView,
    SettingsView,
    HelpCenterView,
    DashboardView,
    MatchesView,
    MySkillsView,
    RequestsView,
    WorkspaceView,
    ChatView
  } = window.SkillSwap;

  function App() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [proposalModalMatch, setProposalModalMatch] = useState(null);
    const [compareModalPeers, setCompareModalPeers] = useState(null);
    const [viewingUsername, setViewingUsername] = useState('alice');

    const checkSession = async () => {
      try {
        const data = await api('/api/session');
        if (data.authenticated && data.user) {
          setUser(data.user);
          if (activeTab === 'home' || activeTab === 'login' || activeTab === 'signup') {
            setActiveTab('dashboard');
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };

    useEffect(() => {
      checkSession();
    }, []);

    const handleLogout = async () => {
      await api('/api/account/logout', { method: 'POST' }).catch(() => {});
      setUser(null);
      setActiveTab('home');
    };

    const handleOpenProposal = (match) => {
      if (!user) {
        setActiveTab('login');
        return;
      }
      setProposalModalMatch(match);
    };

    const handleOpenCompare = (p1, p2) => {
      setCompareModalPeers({ p1, p2 });
    };

    const handleViewProfile = (username) => {
      setViewingUsername(username);
      setActiveTab('public-profile');
    };

    return html`
      <div class="min-h-screen flex flex-col bg-cream-100 text-warmgray-900 font-sans">
        <${Header}
          user=${user}
          activeTab=${activeTab}
          setActiveTab=${setActiveTab}
          pendingRequestsCount=${(user && user.pending_requests) || 0}
          onLogout=${handleLogout}
        />

        <main class="flex-1">
          ${activeTab === 'home' && html`<${HomeLandingView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'signup' && html`<${SignupView} setActiveTab=${setActiveTab} onAuthSuccess=${(u) => { setUser(u); setActiveTab('onboarding'); }} />`}
          ${activeTab === 'login' && html`<${LoginView} setActiveTab=${setActiveTab} onAuthSuccess=${(u) => { setUser(u); setActiveTab('dashboard'); }} />`}
          ${activeTab === 'onboarding' && html`<${OnboardingWizardView} user=${user} setActiveTab=${setActiveTab} onComplete=${checkSession} />`}
          ${activeTab === 'skills-dir' && html`<${SkillsDirectoryView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'public-profile' && html`<${PublicProfileView} username=${viewingUsername} currentUser=${user} onProposeSwap=${handleOpenProposal} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'dashboard' && user && html`<${DashboardView} user=${user} setActiveTab=${setActiveTab} onProposeSwap=${handleOpenProposal} />`}
          ${activeTab === 'matches' && html`<${MatchesView} currentUser=${user} onProposeSwap=${handleOpenProposal} onComparePeers=${handleOpenCompare} onViewProfile=${handleViewProfile} />`}
          ${activeTab === 'skills' && user && html`<${MySkillsView} user=${user} onRefresh=${checkSession} />`}
          ${activeTab === 'requests' && user && html`<${RequestsView} onAcceptRequest=${() => setActiveTab('workspaces')} />`}
          ${activeTab === 'workspaces' && user && html`<${WorkspaceView} currentUser=${user} />`}
          ${activeTab === 'chat' && user && html`<${ChatView} currentUser=${user} />`}
          ${activeTab === 'settings' && user && html`<${SettingsView} user=${user} onUserUpdated=${checkSession} />`}
          ${activeTab === 'help' && html`<${HelpCenterView} />`}
          ${(activeTab === 'terms' || activeTab === 'privacy' || activeTab === 'guidelines') && html`<${HelpCenterView} />`}
        </main>

        <${Footer}
          setActiveTab=${setActiveTab}
          onOpenRegister=${() => setActiveTab(user ? 'matches' : 'signup')}
        />

        <${ProposalModal}
          isOpen=${!!proposalModalMatch}
          onClose=${() => setProposalModalMatch(null)}
          targetMatch=${proposalModalMatch}
          onSubmitted=${() => { setProposalModalMatch(null); setActiveTab('requests'); }}
        />

        <${CompareModal}
          isOpen=${!!compareModalPeers}
          onClose=${() => setCompareModalPeers(null)}
          peer1=${compareModalPeers && compareModalPeers.p1}
          peer2=${compareModalPeers && compareModalPeers.p2}
          onProposeSwap=${handleOpenProposal}
        />
      </div>
    `;
  }

  // Mount React Root
  const rootEl = document.getElementById('root');
  if (rootEl) {
    ReactDOM.createRoot(rootEl).render(html`<${App} />`);
  }
})();