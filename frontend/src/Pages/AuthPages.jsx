// frontend/src/Pages/AuthPages.jsx - Authentication Modal & Forms
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../Components/Modal.jsx';

export function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, signup, showToast } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    headline: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form);
      }
      onClose();
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (email, password) => {
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      showToast(err.message || 'Demo login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Welcome Back to SkillSwapX' : 'Create Your SkillSwapX Account'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold text-[#0B1E36] mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rohan Mehta"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#0B1E36] mb-1">Email or Username</label>
          <input
            type="text"
            placeholder="you@domain.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0B1E36] mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
            required
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold text-[#0B1E36] mb-1">Headline or Bio Tag</label>
            <input
              type="text"
              placeholder="e.g. React Developer looking to learn UI/UX"
              value={form.headline}
              onChange={e => setForm({ ...form, headline: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0066EE] hover:bg-[#0052CC] text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-60"
        >
          {loading ? 'Processing...' : (mode === 'login' ? 'Sign In & Continue' : 'Create Free Account')}
        </button>

        {/* Demo Fast-Login Options */}
        <div className="pt-3 border-t border-navy-100">
          <div className="text-[10px] uppercase font-bold text-[#5C6F84] text-center mb-2">
            Instant 1-Click Demo Logins
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('aarav.sharma@skillswap.io', 'Admin123!')}
              className="px-2.5 py-2 text-[11px] font-semibold bg-cream-50 hover:bg-cream-100 text-[#0B1E36] rounded-xl border border-cream-200 text-center"
            >
              💻 Aarav (Dev)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('priya.patel@skillswap.io', 'Admin123!')}
              className="px-2.5 py-2 text-[11px] font-semibold bg-cream-50 hover:bg-cream-100 text-[#0B1E36] rounded-xl border border-cream-200 text-center"
            >
              🎨 Priya (Design)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@skillswap.io', 'Admin123!')}
              className="col-span-2 px-2.5 py-2 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 text-center"
            >
              🛡️ Master Administrator
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          {mode === 'login' ? (
            <p className="text-xs text-[#5C6F84]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#0066EE] hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#5C6F84]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-[#0066EE] hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
