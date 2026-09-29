// frontend/src/App.jsx - Main Application Controller & View Router
import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { Header } from './Components/Header.jsx';
import { Footer } from './Components/Footer.jsx';
import { Modal } from './Components/Modal.jsx';
import { Home } from './Pages/Home.jsx';
import { Dashboard } from './Pages/Dashboard.jsx';
import { SkillDirectory } from './Pages/SkillDirectory.jsx';
import { ExchangeHub } from './Pages/ExchangeHub.jsx';
import { LearningHub } from './Pages/LearningHub.jsx';
import { CommunityFeed } from './Pages/CommunityFeed.jsx';
import { AdminPanel } from './Pages/AdminPanel.jsx';
import { ChatPage } from './Pages/ChatPage.jsx';
import { AuthModal } from './Pages/AuthPages.jsx';
import { api } from './services/api.js';

export default function App() {
  const { user, isAuthenticated, showToast } = useAuth();
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [swapModal, setSwapModal] = useState({ isOpen: false, targetUser: null, message: '' });

  // If user logs in while on home, seamlessly switch to dashboard
  useEffect(() => {
    if (isAuthenticated && currentView === 'home') {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated]);

  // Hook global category selector from explore dropdown
  useEffect(() => {
    window.onCategorySelect = (category) => {
      setSelectedCategory(category);
    };
  }, []);

  const openAuthModal = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const handleProposeSwap = (targetUser) => {
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    setSwapModal({ isOpen: true, targetUser, message: '' });
  };

  const submitSwapProposal = async (e) => {
    e.preventDefault();
    if (!swapModal.targetUser) return;
    try {
      await api.sendSwapRequest({
        receiver_id: swapModal.targetUser.id,
        message: swapModal.message || `Hi ${swapModal.targetUser.name}, I would love to arrange a reciprocal skill swap with you!`
      });
      showToast('Skill swap request proposed successfully! 🤝', 'success');
      setSwapModal({ isOpen: false, targetUser: null, message: '' });
    } catch (err) {
      showToast(err.message || 'Failed to submit proposal', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF] text-[#0B1E36]">
      {/* Dynamic Header Navbar */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={openAuthModal}
      />

      {/* Main Page View Switcher */}
      <main className="flex-1">
        {currentView === 'home' && (
          <Home
            setCurrentView={setCurrentView}
            openAuthModal={openAuthModal}
            onProposeSwap={handleProposeSwap}
          />
        )}
        {currentView === 'dashboard' && (
          <Dashboard
            setCurrentView={setCurrentView}
            onProposeSwap={handleProposeSwap}
          />
        )}
        {currentView === 'skills' && (
          <SkillDirectory
            selectedCategory={selectedCategory}
            onProposeSwap={handleProposeSwap}
          />
        )}
        {currentView === 'exchange' && (
          <ExchangeHub
            setCurrentView={setCurrentView}
          />
        )}
        {currentView === 'learning' && (
          <LearningHub
            openAuthModal={openAuthModal}
          />
        )}
        {currentView === 'community' && (
          <CommunityFeed
            openAuthModal={openAuthModal}
          />
        )}
        {currentView === 'admin' && (
          <AdminPanel />
        )}
        {currentView === 'chat' && (
          <ChatPage />
        )}
      </main>

      {/* Footer */}
      <Footer setCurrentView={setCurrentView} />

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
      />

      {/* Propose Swap Modal */}
      {swapModal.isOpen && (
        <Modal
          isOpen={swapModal.isOpen}
          onClose={() => setSwapModal({ isOpen: false, targetUser: null, message: '' })}
          title={`Propose Skill Swap with ${swapModal.targetUser?.name}`}
        >
          <form onSubmit={submitSwapProposal} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-2xl border border-cream-200">
              <img
                src={swapModal.targetUser?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${swapModal.targetUser?.name}`}
                alt=""
                className="w-12 h-12 rounded-xl object-cover bg-blue-100"
              />
              <div>
                <h4 className="text-xs font-bold text-[#0B1E36]">{swapModal.targetUser?.name}</h4>
                <p className="text-[11px] text-[#0066EE] font-semibold">{swapModal.targetUser?.headline}</p>
                <p className="text-[10px] text-[#5C6F84]">Karma: {swapModal.targetUser?.karma_score || 100}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1E36] mb-1">
                Proposal Message / Introduction
              </label>
              <textarea
                rows={3}
                placeholder="Describe what you can offer to teach and what you are hoping to learn in return..."
                value={swapModal.message}
                onChange={e => setSwapModal({ ...swapModal, message: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setSwapModal({ isOpen: false, targetUser: null, message: '' })}
                className="px-4 py-2 text-xs font-bold text-[#5C6F84] hover:text-[#0B1E36]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#0066EE] hover:bg-[#0052CC] rounded-xl shadow-md"
              >
                Send Proposal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
