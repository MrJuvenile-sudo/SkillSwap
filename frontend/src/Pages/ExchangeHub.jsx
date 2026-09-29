// frontend/src/Pages/ExchangeHub.jsx - Exchange Requests, Active Swaps & Reviews
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon } from '../Components/Icon.jsx';

export function ExchangeHub({ setCurrentView }) {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming');
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, feedback: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getSwapRequests();
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.respondSwapRequest(id, status);
      showToast(`Request marked as ${status.toLowerCase()}`, 'success');
      fetchRequests();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;
    try {
      await api.submitReview({
        reviewee_id: reviewTarget.id,
        rating: reviewForm.rating,
        feedback: reviewForm.feedback
      });
      showToast('Review submitted and karma granted! ⭐', 'success');
      setReviewModal(false);
      setReviewForm({ rating: 5, feedback: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36]">Exchange Hub</h1>
          <p className="text-xs sm:text-sm text-[#5C6F84]">Manage incoming proposals, track mutual sessions, and leave peer reviews.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-navy-200 shadow-sm">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'incoming' ? 'bg-[#0066EE] text-white shadow-sm' : 'text-[#5C6F84] hover:text-[#0B1E36]'
            }`}
          >
            Incoming ({requests.incoming.length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'outgoing' ? 'bg-[#0066EE] text-white shadow-sm' : 'text-[#5C6F84] hover:text-[#0B1E36]'
            }`}
          >
            Outgoing ({requests.outgoing.length})
          </button>
        </div>
      </div>

      {/* Requests Listing */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-navy-200 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#5C6F84]">Loading exchange records...</div>
        ) : (activeTab === 'incoming' ? requests.incoming : requests.outgoing).length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="text-3xl">🤝</div>
            <h3 className="text-base font-bold text-[#0B1E36]">No {activeTab} requests</h3>
            <p className="text-xs text-[#5C6F84]">Explore the directory to propose your first reciprocal skill trade!</p>
            <button
              onClick={() => setCurrentView('skills')}
              className="mt-2 px-5 py-2.5 bg-[#0066EE] hover:bg-[#0052CC] text-white text-xs font-bold rounded-xl"
            >
              Browse Skills
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {(activeTab === 'incoming' ? requests.incoming : requests.outgoing).map((req, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-cream-50 border border-cream-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={req.sender_avatar || req.receiver_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=user`}
                    alt=""
                    className="w-12 h-12 rounded-2xl object-cover bg-blue-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#0B1E36]">
                        {activeTab === 'incoming' ? req.sender_name : req.receiver_name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#5C6F84] mt-1">{req.message || 'Proposing a reciprocal skill exchange.'}</p>
                    <span className="text-[10px] text-navy-400 mt-1 block">
                      Submitted: {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  {activeTab === 'incoming' && req.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'ACCEPTED')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                        className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-[#0B1E36] text-xs font-semibold rounded-xl"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {req.status === 'ACCEPTED' && (
                    <>
                      <button
                        onClick={() => setCurrentView('chat')}
                        className="px-4 py-2 bg-[#0066EE] hover:bg-[#0052CC] text-white text-xs font-bold rounded-xl"
                      >
                        Open Chat
                      </button>
                      <button
                        onClick={() => {
                          setReviewTarget({ id: activeTab === 'incoming' ? req.sender_id : req.receiver_id });
                          setReviewModal(true);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl"
                      >
                        Leave Review
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-navy-100 shadow-2xl animate-dropdown">
            <h3 className="text-lg font-bold text-[#0B1E36] mb-2">Leave Peer Review</h3>
            <p className="text-xs text-[#5C6F84] mb-4">Rate your peer's session quality and award karma points.</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1E36] mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-2xl ${star <= reviewForm.rating ? 'text-amber-500' : 'text-navy-200'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#0B1E36] ml-2">{reviewForm.rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1E36] mb-1">Feedback & Recommendation</label>
                <textarea
                  rows={3}
                  placeholder="Share how helpful this peer was during your exchange..."
                  value={reviewForm.feedback}
                  onChange={e => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setReviewModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5C6F84] hover:text-[#0B1E36]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0066EE] hover:bg-[#0052CC] rounded-xl"
                >
                  Submit & Grant Karma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
