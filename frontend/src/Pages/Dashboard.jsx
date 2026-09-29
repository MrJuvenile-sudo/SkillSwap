// frontend/src/Pages/Dashboard.jsx - Post-login Dashboard (No "Find Match" button)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Icon } from '../Components/Icon.jsx';

export function Dashboard({ setCurrentView, onProposeSwap }) {
  const { user, refreshSession, showToast } = useAuth();
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSkillModal, setNewSkillModal] = useState(false);
  const [skillForm, setSkillForm] = useState({ skill_name: '', skill_type: 'OFFERED', proficiency_level: 'INTERMEDIATE' });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [reqData, matchData] = await Promise.all([
        api.getSwapRequests().catch(() => ({ incoming: [], outgoing: [] })),
        api.getMatchHistory().catch(() => ({ matches: [] }))
      ]);
      setRequests(reqData);
      setMatches(matchData.matches || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await api.respondSwapRequest(requestId, status);
      showToast(`Request ${status.toLowerCase()}!`, 'success');
      loadDashboardData();
      refreshSession();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillForm.skill_name.trim()) return;
    try {
      await api.addUserSkill(skillForm);
      showToast('Skill added successfully!', 'success');
      setNewSkillModal(false);
      setSkillForm({ skill_name: '', skill_type: 'OFFERED', proficiency_level: 'INTERMEDIATE' });
      refreshSession();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img 
            src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`} 
            alt={user.name} 
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50 bg-blue-100" 
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-[#0B1E36]">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0066EE] border border-blue-200">
                {user.role}
              </span>
            </div>
            <p className="text-sm text-[#5C6F84] mt-1">{user.headline || 'SkillSwap Member'}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-[#5C6F84]">
              <span className="font-semibold text-emerald-600">✨ Karma Score: {user.karma_score || 100}</span>
              <span>•</span>
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setNewSkillModal(true)}
            className="flex-1 md:flex-none px-5 py-2.5 bg-[#0066EE] hover:bg-[#0052CC] text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            + Add New Skill
          </button>
          <button
            onClick={() => setCurrentView('skills')}
            className="flex-1 md:flex-none px-5 py-2.5 bg-cream-100 hover:bg-cream-200 text-[#0B1E36] text-xs font-bold rounded-xl border border-navy-200 transition-all"
          >
            Explore Directory
          </button>
        </div>
      </div>

      {/* Grid: Skills Teaching & Learning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Skills Offered */}
        <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#0B1E36] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Skills You Can Teach
            </h3>
            <button
              onClick={() => { setSkillForm(s => ({ ...s, skill_type: 'OFFERED' })); setNewSkillModal(true); }}
              className="text-xs font-bold text-[#0066EE] hover:underline"
            >
              + Add
            </button>
          </div>
          
          <div className="space-y-2">
            {(user.skills || []).filter(s => s.skill_type === 'OFFERED').length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5C6F84] bg-cream-50 rounded-2xl">
                No teaching skills listed yet. Add what you excel at to get discovered by peers!
              </div>
            ) : (
              (user.skills || []).filter(s => s.skill_type === 'OFFERED').map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-[#0B1E36]">{s.skill_name || s.name}</span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {s.proficiency_level || 'Proficient'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="bg-white rounded-3xl p-6 border border-navy-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#0B1E36] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Skills You Want to Learn
            </h3>
            <button
              onClick={() => { setSkillForm(s => ({ ...s, skill_type: 'WANTED' })); setNewSkillModal(true); }}
              className="text-xs font-bold text-[#0066EE] hover:underline"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2">
            {(user.skills || []).filter(s => s.skill_type === 'WANTED').length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5C6F84] bg-cream-50 rounded-2xl">
                No learning goals added yet. Add what you want to learn so mentors can find you!
              </div>
            ) : (
              (user.skills || []).filter(s => s.skill_type === 'WANTED').map((s, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-[#0B1E36]">{s.skill_name || s.name}</span>
                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Goal
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Incoming Requests */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-sm">
        <h3 className="text-lg font-bold text-[#0B1E36] mb-4">Incoming Swap Requests</h3>
        
        {requests.incoming.filter(r => r.status === 'PENDING').length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5C6F84] bg-cream-50 rounded-2xl">
            No pending incoming swap proposals right now.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.incoming.filter(r => r.status === 'PENDING').map((req, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <div className="flex items-center gap-3">
                  <img src={req.sender_avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + req.sender_name} alt="" className="w-10 h-10 rounded-xl bg-blue-100" />
                  <div>
                    <h4 className="text-sm font-bold text-[#0B1E36]">{req.sender_name}</h4>
                    <p className="text-xs text-[#5C6F84]">{req.message || 'Proposed a reciprocal skill swap with you.'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleRespondRequest(req.id, 'ACCEPTED')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    Accept Swap
                  </button>
                  <button
                    onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-cream-200 hover:bg-cream-300 text-[#0B1E36] text-xs font-semibold rounded-xl"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Adding Skill */}
      {newSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-navy-100 shadow-2xl animate-dropdown">
            <h3 className="text-lg font-bold text-[#0B1E36] mb-4">Add a Skill</h3>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1E36] mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. React, UI Design, Conversational Spanish"
                  value={skillForm.skill_name}
                  onChange={e => setSkillForm({ ...skillForm, skill_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1E36] mb-1">Skill Type</label>
                <select
                  value={skillForm.skill_type}
                  onChange={e => setSkillForm({ ...skillForm, skill_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
                >
                  <option value="OFFERED">I can teach this (Offered)</option>
                  <option value="WANTED">I want to learn this (Wanted)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setNewSkillModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5C6F84] hover:text-[#0B1E36]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0066EE] hover:bg-[#0052CC] rounded-xl"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
