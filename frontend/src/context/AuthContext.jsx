// frontend/src/context/AuthContext.jsx - Global User Session State
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const refreshSession = async () => {
    try {
      const data = await api.getSession();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const res = await api.login({ email, password, rememberMe });
    if (res.token) {
      localStorage.setItem('skillswap_token', res.token);
    }
    if (res.user) {
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
    }
    return res;
  };

  const signup = async (formData) => {
    const res = await api.signup(formData);
    if (res.token) {
      localStorage.setItem('skillswap_token', res.token);
    }
    if (res.user) {
      setUser(res.user);
      showToast(`Welcome to SkillSwapX, ${res.user.name}!`, 'success');
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    localStorage.removeItem('skillswap_token');
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      refreshSession,
      showToast,
      toastMessage
    }}>
      {children}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#0B1E36] text-white rounded-xl shadow-2xl border border-navy-700 animate-bounce-short">
          <span className="text-xl">
            {toastMessage.type === 'success' ? '✨' : toastMessage.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="text-sm font-semibold">{toastMessage.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
