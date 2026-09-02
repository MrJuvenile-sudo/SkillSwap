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
    ChatView,
    CommunityFeedView,
    AdminConsoleView,
    TermsView,
    PrivacyView,
    GuidelinesView,
    CategoryDetailView,
    ReportAbuseView,
    OnboardingSkillsWizardView,
    FeaturesView,
    FaqView,
    LearningHubBrowseView,
    LearningHubUploadView,
    LearningHubDetailView,
    LearningHubSavedView,
    LearningHubMyView,
    LearningHubRequestsView,
    ExamModeView,
    SkillSwapAIWidget

  } = window.SkillSwap;

  function App() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [proposalModalMatch, setProposalModalMatch] = useState(null);
    const [compareModalPeers, setCompareModalPeers] = useState(null);
    const [viewingUsername, setViewingUsername] = useState('alice');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [reportedUserId, setReportedUserId] = useState(null);
    const [hubResourceId, setHubResourceId] = useState(null);


    const checkSession = async () => {
      try {
        const data = await api('/api/session');
        if (data.authenticated && data.user) {
          setUser(data.user);
          if (activeTab === 'home' || activeTab === 'login' || activeTab === 'signup') {
            setActiveTab(data.user.role === 'ADMIN' ? 'admin' : 'dashboard');

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

    const handleViewCategory = (catId) => {
      setSelectedCategoryId(catId);
      setActiveTab('category-detail');
    };

    const handleOpenReportAbuse = (userId) => {
      setReportedUserId(userId);
      setActiveTab('report-abuse');
    };

    const handleViewResource = (resource) => {
      const id = typeof resource === 'object' ? resource.id : resource;
      setHubResourceId(id);
      setActiveTab('hub-detail');
    };

    return html`
      <div class="min-h-screen flex flex-col bg-cream-100 text-warmgray-900 font-sans bg-dots-pattern">
        ${activeTab !== 'admin' ? html`
          <${Header}
            user=${user}
            activeTab=${activeTab}
            setActiveTab=${setActiveTab}
            pendingRequestsCount=${(user && user.unread_notifications) || 0}
            onLogout=${handleLogout}
            onViewProfile=${handleViewProfile}
          />
        ` : null}

        <main class="flex-1">
          ${activeTab === 'home' && html`<${HomeLandingView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'signup' && html`<${SignupView} setActiveTab=${setActiveTab} onAuthSuccess=${async (u) => { await checkSession(); setActiveTab('onboarding'); }} />`}
          ${activeTab === 'login' && html`<${LoginView} setActiveTab=${setActiveTab} onAuthSuccess=${async (u) => { await checkSession(); setActiveTab(u.role && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(u.role) ? 'admin' : 'dashboard'); }} />`}
          ${activeTab === 'onboarding' && html`<${OnboardingWizardView} user=${user} setActiveTab=${setActiveTab} onComplete=${checkSession} />`}
          ${activeTab === 'onboarding-skills' && user && html`<${OnboardingSkillsWizardView} user=${user} setActiveTab=${setActiveTab} onComplete=${checkSession} />`}
          
          ${activeTab === 'skills-dir' && html`<${SkillsDirectoryView} setActiveTab=${setActiveTab} onViewCategory=${handleViewCategory} />`}
          ${activeTab === 'category-detail' && html`<${CategoryDetailView} categoryId=${selectedCategoryId} setActiveTab=${setActiveTab} onViewProfile=${handleViewProfile} onProposeSwap=${handleOpenProposal} />`}
          ${activeTab === 'report-abuse' && user && html`<${ReportAbuseView} reportedUserId=${reportedUserId} setActiveTab=${setActiveTab} />`}
          
          ${activeTab === 'community' && html`<${CommunityFeedView} currentUser=${user} onProposeSwap=${handleOpenProposal} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'public-profile' && html`<${PublicProfileView} username=${viewingUsername} currentUser=${user} onProposeSwap=${handleOpenProposal} setActiveTab=${setActiveTab} onOpenReport=${handleOpenReportAbuse} />`}
          ${activeTab === 'dashboard' && user && html`<${DashboardView} user=${user} setActiveTab=${setActiveTab} onProposeSwap=${handleOpenProposal} onViewProfile=${handleViewProfile} />`}

          ${activeTab === 'matches' && html`<${MatchesView} currentUser=${user} onProposeSwap=${handleOpenProposal} onComparePeers=${handleOpenCompare} onViewProfile=${handleViewProfile} />`}
          ${activeTab === 'skills' && user && html`<${MySkillsView} user=${user} onRefresh=${checkSession} />`}
          ${activeTab === 'requests' && user && html`<${RequestsView} onAcceptRequest=${() => setActiveTab('workspaces')} />`}
          ${activeTab === 'workspaces' && user && html`<${WorkspaceView} currentUser=${user} />`}
          ${activeTab === 'chat' && user && html`<${ChatView} currentUser=${user} />`}
          ${activeTab === 'settings' && user && html`<${SettingsView} user=${user} onUserUpdated=${checkSession} />`}
          ${activeTab === 'admin' && user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(user.role) && html`<${AdminConsoleView} currentUser=${user} setActiveTab=${setActiveTab} onViewProfile=${handleViewProfile} onLogout=${handleLogout} />`}
          ${activeTab === 'features' && html`<${FeaturesView} />`}
          ${activeTab === 'faq' && html`<${FaqView} />`}
          ${activeTab === 'help' && html`<${HelpCenterView} />`}
          ${activeTab === 'terms' && html`<${TermsView} />`}
          ${activeTab === 'privacy' && html`<${PrivacyView} />`}
          ${activeTab === 'guidelines' && html`<${GuidelinesView} />`}

          <!-- Learning Hub Views -->
          ${activeTab === 'hub-browse' && html`<${LearningHubBrowseView} setActiveTab=${setActiveTab} currentUser=${user} onViewResource=${handleViewResource} />`}
          ${activeTab === 'hub-upload' && html`<${LearningHubUploadView} setActiveTab=${setActiveTab} currentUser=${user} />`}
          ${activeTab === 'hub-detail' && html`<${LearningHubDetailView} resourceId=${hubResourceId || (window._hubDetailResourceId)} setActiveTab=${setActiveTab} currentUser=${user} onProposeSwap=${handleOpenProposal} />`}
          ${activeTab === 'hub-saved' && html`<${LearningHubSavedView} setActiveTab=${setActiveTab} currentUser=${user} onViewResource=${handleViewResource} />`}
          ${activeTab === 'hub-my' && html`<${LearningHubMyView} setActiveTab=${setActiveTab} currentUser=${user} onViewResource=${handleViewResource} />`}
          ${activeTab === 'hub-requests' && html`<${LearningHubRequestsView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'exam-mode' && html`<${ExamModeView} setActiveTab=${setActiveTab} />`}
        </main>

        ${activeTab !== 'admin' ? html`
          <${Footer}
            setActiveTab=${setActiveTab}
            onOpenRegister=${() => setActiveTab(user ? 'matches' : 'signup')}
            user=${user}
          />
        ` : null}


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
        <${SkillSwapAIWidget}
          currentUser=${user}
          activeTab=${activeTab}
          setActiveTab=${setActiveTab}
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