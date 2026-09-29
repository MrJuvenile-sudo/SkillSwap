// frontend/src/services/api.js - Unified API Service
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('skillswap_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Authentication
  login: (credentials) => request('/account/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData) => request('/account/signup', { method: 'POST', body: JSON.stringify(userData) }),
  logout: () => request('/account/logout', { method: 'POST' }),
  getSession: () => request('/account/session'),

  // Users & Profiles
  getProfile: (id) => request(`/users/profile/${id}`),
  updateProfile: (profile) => request('/users/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  getUsers: (params = '') => request(`/users${params ? `?${params}` : ''}`),
  addUserSkill: (skill) => request('/users/skills', { method: 'POST', body: JSON.stringify(skill) }),
  removeUserSkill: (id) => request(`/users/skills/${id}`, { method: 'DELETE' }),

  // Matches & AI
  getAiMatches: () => request('/matches/ai'),
  getPeerRecommendations: () => request('/matches/recommendations'),
  getMatchHistory: () => request('/matches/history'),

  // Swaps & Sessions
  sendSwapRequest: (data) => request('/swaps/request', { method: 'POST', body: JSON.stringify(data) }),
  getSwapRequests: () => request('/swaps/requests'),
  respondSwapRequest: (id, status) => request(`/swaps/request/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  submitReview: (review) => request('/swaps/review', { method: 'POST', body: JSON.stringify(review) }),

  // Chat & Messaging
  getConversations: () => request('/chat/conversations'),
  getMessages: (peerId) => request(`/chat/messages/${peerId}`),
  sendMessage: (payload) => request('/chat/messages', { method: 'POST', body: JSON.stringify(payload) }),

  // Community Hub
  getCircles: () => request('/hub/circles'),
  joinCircle: (circleId) => request(`/hub/circles/${circleId}/join`, { method: 'POST' }),
  getResources: () => request('/hub/resources'),
  getCommunityPosts: () => request('/hub/posts'),
  createCommunityPost: (post) => request('/hub/posts', { method: 'POST', body: JSON.stringify(post) }),

  // Admin
  getAdminAnalytics: () => request('/admin/analytics'),
  getAllUsersAdmin: () => request('/admin/users'),
  updateUserStatus: (id, payload) => request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
  getReports: () => request('/admin/reports'),
  resolveReport: (id, payload) => request(`/admin/reports/${id}/resolve`, { method: 'PUT', body: JSON.stringify(payload) })
};
