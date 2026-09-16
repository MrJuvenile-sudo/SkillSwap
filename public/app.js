// public/app.js - Root Application Controller & SPA Hash Router for SkillSwap
(function() {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const htm = window.htm || self.htm;

  if (!React || !ReactDOM || !htm) {
    console.error('SkillSwap initialization error: React or HTM failed to load.');
    return;
  }

  const { useState, useEffect, useCallback, useRef } = React;
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
    ForgotPasswordView,
    ResetPasswordView,
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
    ExchangeHubView,
    ProblemsView,
    SkillCirclesView,
    SkillSwapAIWidget
  } = window.SkillSwap;

  // Helper: Parse active tab and query params from window.location.hash
  function parseRouteFromHash() {
    const raw = (window.location.hash || '').replace(/^#/, '').trim();
    if (!raw) return { tab: 'home', params: {} };
    const [tabPart, queryPart] = raw.split('?');
    const params = {};
    if (queryPart) {
      try {
        const sp = new URLSearchParams(queryPart);
        for (const [k, v] of sp.entries()) {
          params[k] = v;
        }
      } catch (e) {
        // ignore
      }
    }
    return { tab: tabPart || 'home', params };
  }

  function App() {
    const initialRoute = parseRouteFromHash();

    const [user, setUser] = useState(null);
    const [activeTab, setActiveTabState] = useState(initialRoute.tab || 'home');
    const [proposalModalMatch, setProposalModalMatch] = useState(null);
    const [compareModalPeers, setCompareModalPeers] = useState(null);
    const [viewingUsername, setViewingUsername] = useState(initialRoute.params.user || null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(initialRoute.params.catId ? Number(initialRoute.params.catId) : null);
    const [reportedUserId, setReportedUserId] = useState(initialRoute.params.reportUser || null);
    const [hubResourceId, setHubResourceId] = useState(initialRoute.params.resourceId ? Number(initialRoute.params.resourceId) : null);
    const [targetChatConnectionId, setTargetChatConnectionId] = useState(initialRoute.params.conn || null);
    const [targetChatUserId, setTargetChatUserId] = useState(initialRoute.params.chatUser || null);
    const [targetWorkspaceId, setTargetWorkspaceId] = useState(initialRoute.params.wsId ? Number(initialRoute.params.wsId) : null);

    // Centralized Navigation that keeps window in-place, synchronizes hash, and enables browser back/forward
    const navigateToTab = useCallback((tab, params = {}, replace = false) => {
      setActiveTabState(tab);
      if (params.user) setViewingUsername(params.user);
      if (params.catId !== undefined) setSelectedCategoryId(params.catId);
      if (params.reportUser) setReportedUserId(params.reportUser);
      if (params.resourceId !== undefined) setHubResourceId(params.resourceId);
      if (params.conn !== undefined) setTargetChatConnectionId(params.conn);
      if (params.chatUser !== undefined) setTargetChatUserId(params.chatUser);
      if (params.wsId !== undefined) setTargetWorkspaceId(params.wsId ? Number(params.wsId) : null);

      let hash = '#' + tab;
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== null && v !== undefined && v !== '') {
          q.set(k, String(v));
        }
      }
      const qs = q.toString();
      if (qs) hash += '?' + qs;

      if (window.location.hash !== hash) {
        if (replace) {
          window.history.replaceState({ tab, params }, '', hash);
        } else {
          window.history.pushState({ tab, params }, '', hash);
        }
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Primary setter passed to child views
    const setActiveTab = useCallback((tab, params = {}) => {
      navigateToTab(tab, params, false);
    }, [navigateToTab]);

    // Handle Browser Back / Forward shortcut keys (Alt+Left, Alt+Right, browser buttons)
    useEffect(() => {
      const handlePopState = () => {
        const route = parseRouteFromHash();
        setActiveTabState(route.tab || 'home');
        if (route.params.user) setViewingUsername(route.params.user);
        if (route.params.catId) setSelectedCategoryId(Number(route.params.catId));
        if (route.params.reportUser) setReportedUserId(route.params.reportUser);
        if (route.params.resourceId) setHubResourceId(Number(route.params.resourceId));
        if (route.params.conn) setTargetChatConnectionId(route.params.conn);
        if (route.params.chatUser) setTargetChatUserId(route.params.chatUser);
        if (route.params.wsId) setTargetWorkspaceId(Number(route.params.wsId));
      };

      window.addEventListener('popstate', handlePopState);
      window.addEventListener('hashchange', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
        window.removeEventListener('hashchange', handlePopState);
      };
    }, []);

    // Intercept internal link clicks so window NEVER reloads or leaves the application
    useEffect(() => {
      const handleGlobalClick = (e) => {
        const a = e.target.closest('a');
        if (!a) return;

        // Allow users to open in new tab if they explicitly held Ctrl / Meta / Shift / Alt
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

        const href = a.getAttribute('href');
        if (!href) return;

        // Mailto links redirect to help tab in-app
        if (href.startsWith('mailto:')) {
          e.preventDefault();
          navigateToTab('help');
          return;
        }

        // Hash anchors like #matches or #skills-dir
        if (href.startsWith('#')) {
          e.preventDefault();
          const clean = href.slice(1);
          const [tab, qs] = clean.split('?');
          const p = {};
          if (qs) {
            new URLSearchParams(qs).forEach((v, k) => { p[k] = v; });
          }
          navigateToTab(tab || 'home', p);
          return;
        }

        // Relative in-app paths
        if (href.startsWith('/') && !href.startsWith('/api') && !href.startsWith('/theme') && !href.startsWith('/vendor') && !href.startsWith('/favicon') && !href.startsWith('/logo')) {
          e.preventDefault();
          const tab = href.replace(/^\//, '').trim() || 'home';
          navigateToTab(tab);
          return;
        }
      };

      document.addEventListener('click', handleGlobalClick);
      return () => document.removeEventListener('click', handleGlobalClick);
    }, [navigateToTab]);

    // Keyboard Shortcuts Listener
    // - Protects ALL native browser shortcut keys (Ctrl+R, Ctrl+F, Ctrl+T, Ctrl+W, Ctrl+Shift+I, Alt+Left, Alt+Right)
    // - Adds in-app productivity shortcuts (Alt+1..6, Escape to close modals)
    useEffect(() => {
      const handleKeyDown = (e) => {
        // Never interfere when user is typing in form controls
        const tag = e.target.tagName;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || e.target.isContentEditable) {
          if (e.key === 'Escape') e.target.blur();
          return;
        }

        // Escape closes active modal dialogs without altering window
        if (e.key === 'Escape') {
          if (proposalModalMatch) {
            e.preventDefault();
            setProposalModalMatch(null);
            return;
          }
          if (compareModalPeers) {
            e.preventDefault();
            setCompareModalPeers(null);
            return;
          }
          return;
        }

        // Let browser handle native Ctrl / Cmd shortcuts untouched
        if (e.ctrlKey || e.metaKey) {
          return;
        }

        // Quick Tab Switch Shortcuts (Alt + 1..6 or Alt + Letter)
        if (e.altKey && !e.shiftKey) {
          switch (e.key) {
            case '1':
              e.preventDefault();
              navigateToTab(user ? 'dashboard' : 'home');
              break;
            case '2':
              e.preventDefault();
              navigateToTab('exchange');
              break;
            case '3':
              e.preventDefault();
              navigateToTab('hub-browse');
              break;
            case '4':
              e.preventDefault();
              navigateToTab(user ? 'matches' : 'skills-dir');
              break;
            case '5':
              e.preventDefault();
              navigateToTab(user ? 'chat' : 'community');
              break;
            case '6':
              e.preventDefault();
              navigateToTab('community');
              break;
            case 'h':
            case 'H':
              e.preventDefault();
              navigateToTab(user ? 'dashboard' : 'home');
              break;
            case 'm':
            case 'M':
              if (user) { e.preventDefault(); navigateToTab('matches'); }
              break;
            case 'c':
            case 'C':
              if (user) { e.preventDefault(); navigateToTab('chat'); }
              break;
            case 's':
            case 'S':
              e.preventDefault();
              navigateToTab('skills-dir');
              break;
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [user, proposalModalMatch, compareModalPeers, navigateToTab]);

    const checkSession = async () => {
      try {
        const data = await api('/api/session');
        if (data.authenticated && data.user) {
          setUser(data.user);
          const current = parseRouteFromHash();
          // Only auto-redirect to dashboard if user landed on home/login/signup without a deep-link hash
          if (!window.location.hash || window.location.hash === '#' || current.tab === 'home' || current.tab === 'login' || current.tab === 'signup') {
            const isAdmin = data.user.role && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(data.user.role);
            navigateToTab(isAdmin ? 'admin' : 'dashboard', {}, true);
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
      navigateToTab('home');
    };

    const handleOpenProposal = (match) => {
      if (!user) {
        navigateToTab('login');
        return;
      }
      setProposalModalMatch(match);
    };

    const handleOpenChat = (target) => {
      if (!user) {
        navigateToTab('login');
        return;
      }
      if (typeof target === 'object' && target) {
        if (target.connection_id || (target.id && String(target.id).startsWith('conn_'))) {
          setTargetChatConnectionId(target.connection_id || target.id);
          setTargetChatUserId(target.partner_id || (target.partner && target.partner.id));
          navigateToTab('chat', { conn: target.connection_id || target.id, chatUser: target.partner_id || (target.partner && target.partner.id) });
        } else {
          setTargetChatUserId(target.id);
          setTargetChatConnectionId(null);
          navigateToTab('chat', { chatUser: target.id });
        }
      } else if (typeof target === 'number') {
        setTargetChatConnectionId(target);
        setTargetChatUserId(null);
        navigateToTab('chat', { conn: target });
      } else {
        setTargetChatUserId(target);
        setTargetChatConnectionId(null);
        navigateToTab('chat', { chatUser: target });
      }
    };

    const handleOpenCompare = (p1, p2) => {
      setCompareModalPeers({ p1, p2 });
    };

    const handleViewProfile = (username) => {
      setViewingUsername(username);
      navigateToTab('public-profile', { user: username });
    };

    const handleViewCategory = (catId) => {
      setSelectedCategoryId(catId);
      navigateToTab('category-detail', { catId });
    };

    const handleOpenReportAbuse = (userId) => {
      setReportedUserId(userId);
      navigateToTab('report-abuse', { reportUser: userId });
    };

    const handleViewResource = (resource) => {
      const id = typeof resource === 'object' ? resource.id : resource;
      setHubResourceId(id);
      navigateToTab('hub-detail', { resourceId: id });
    };

    return html`
      <div class="min-h-screen flex flex-col bg-cream-100 text-warmgray-900 font-sans bg-dots-pattern">
        ${activeTab !== 'admin' ? html`
          <${Header}
            user=${user}
            activeTab=${activeTab}
            setActiveTab=${setActiveTab}
            pendingRequestsCount=${(user && user.pending_requests) || 0}
            onLogout=${handleLogout}
            onViewProfile=${handleViewProfile}
          />
        ` : null}

        <main class="flex-1 pb-20 lg:pb-0">
          ${activeTab === 'home' && html`<${HomeLandingView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'signup' && html`<${SignupView} setActiveTab=${setActiveTab} onAuthSuccess=${async (u) => { await checkSession(); setActiveTab('onboarding'); }} />`}
          ${activeTab === 'login' && html`<${LoginView} setActiveTab=${setActiveTab} onAuthSuccess=${async (u) => { await checkSession(); setActiveTab(u.role && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(u.role) ? 'admin' : 'dashboard'); }} />`}
          ${activeTab === 'forgot-password' && html`<${ForgotPasswordView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'reset-password' && html`<${ResetPasswordView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'onboarding' && html`<${OnboardingWizardView} user=${user} setActiveTab=${setActiveTab} onComplete=${checkSession} />`}
          ${activeTab === 'onboarding-skills' && user && html`<${OnboardingSkillsWizardView} user=${user} setActiveTab=${setActiveTab} onComplete=${checkSession} />`}
          
          ${activeTab === 'skills-dir' && html`<${SkillsDirectoryView} setActiveTab=${setActiveTab} onViewCategory=${handleViewCategory} />`}
          ${activeTab === 'category-detail' && html`<${CategoryDetailView} categoryId=${selectedCategoryId} setActiveTab=${setActiveTab} onViewProfile=${handleViewProfile} onProposeSwap=${handleOpenProposal} />`}
          ${activeTab === 'report-abuse' && user && html`<${ReportAbuseView} reportedUserId=${reportedUserId} setActiveTab=${setActiveTab} />`}
          
          ${activeTab === 'community' && html`<${CommunityFeedView} currentUser=${user} onProposeSwap=${handleOpenProposal} onOpenChat=${handleOpenChat} setActiveTab=${setActiveTab} onViewProfile=${handleViewProfile} />`}
          ${activeTab === 'public-profile' && html`<${PublicProfileView} username=${viewingUsername} currentUser=${user} onProposeSwap=${handleOpenProposal} onOpenChat=${handleOpenChat} setActiveTab=${setActiveTab} onOpenReport=${handleOpenReportAbuse} />`}
          ${activeTab === 'dashboard' && user && html`<${DashboardView} user=${user} setActiveTab=${setActiveTab} onProposeSwap=${handleOpenProposal} onOpenChat=${handleOpenChat} onViewProfile=${handleViewProfile} />`}
          ${activeTab === 'exchange' && html`<${ExchangeHubView} user=${user} setActiveTab=${setActiveTab} onProposeSwap=${handleOpenProposal} onOpenChat=${handleOpenChat} onViewProfile=${handleViewProfile} />`}
          ${activeTab === 'problems' && html`<${ProblemsView} user=${user} setActiveTab=${setActiveTab} onProposeSwap=${handleOpenProposal} onOpenChat=${handleOpenChat} onViewProfile=${handleViewProfile} />`}
          ${activeTab === 'circles' && html`<${SkillCirclesView} user=${user} setActiveTab=${setActiveTab} onOpenChat=${handleOpenChat} />`}

          ${activeTab === 'matches' && html`<${MatchesView} currentUser=${user} onProposeSwap=${handleOpenProposal} onOpenChat=${handleOpenChat} onComparePeers=${handleOpenCompare} onViewProfile=${handleViewProfile} />`}
          ${activeTab === 'skills' && user && html`<${MySkillsView} user=${user} onRefresh=${checkSession} />`}
          ${activeTab === 'requests' && user && html`<${RequestsView} onAcceptRequest=${(wsId) => setActiveTab('workspaces', wsId ? { wsId } : {})} />`}
          ${activeTab === 'workspaces' && user && html`<${WorkspaceView} currentUser=${user} onOpenChat=${handleOpenChat} setActiveTab=${setActiveTab} onViewProfile=${handleViewProfile} targetWorkspaceId=${targetWorkspaceId} />`}
          ${activeTab === 'chat' && user && html`<${ChatView} currentUser=${user} targetConnectionId=${targetChatConnectionId} targetUserId=${targetChatUserId} onViewProfile=${handleViewProfile} onProposeSwap=${handleOpenProposal} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'settings' && user && html`<${SettingsView} user=${user} onUserUpdated=${checkSession} />`}
          ${activeTab === 'admin' && user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'].includes(user.role) && html`<${AdminConsoleView} currentUser=${user} setActiveTab=${setActiveTab} onViewProfile=${handleViewProfile} onLogout=${handleLogout} />`}
          ${activeTab === 'features' && html`<${FeaturesView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'faq' && html`<${FaqView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'help' && html`<${HelpCenterView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'terms' && html`<${TermsView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'privacy' && html`<${PrivacyView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'guidelines' && html`<${GuidelinesView} setActiveTab=${setActiveTab} />`}

          <!-- Learning Hub Views (Authenticated Only) -->
          ${(activeTab.startsWith('hub') || activeTab === 'exam-mode') && !user && html`
            <${LoginView} setActiveTab=${setActiveTab} onAuthSuccess=${async (u) => { await checkSession(); setActiveTab('hub-browse'); }} />
          `}
          ${activeTab === 'hub-browse' && user && html`<${LearningHubBrowseView} setActiveTab=${setActiveTab} currentUser=${user} onViewResource=${handleViewResource} />`}
          ${activeTab === 'hub-upload' && user && html`<${LearningHubUploadView} setActiveTab=${setActiveTab} currentUser=${user} />`}
          ${activeTab === 'hub-detail' && user && html`<${LearningHubDetailView} resourceId=${hubResourceId || (window._hubDetailResourceId)} setActiveTab=${setActiveTab} currentUser=${user} onProposeSwap=${handleOpenProposal} />`}
          ${activeTab === 'hub-saved' && user && html`<${LearningHubSavedView} setActiveTab=${setActiveTab} currentUser=${user} onViewResource=${handleViewResource} />`}
          ${activeTab === 'hub-my' && user && html`<${LearningHubMyView} setActiveTab=${setActiveTab} currentUser=${user} onViewResource=${handleViewResource} />`}
          ${activeTab === 'hub-requests' && user && html`<${LearningHubRequestsView} setActiveTab=${setActiveTab} />`}
          ${activeTab === 'exam-mode' && user && html`<${ExamModeView} setActiveTab=${setActiveTab} />`}
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