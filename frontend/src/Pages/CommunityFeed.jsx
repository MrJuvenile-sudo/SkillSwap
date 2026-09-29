// frontend/src/Pages/CommunityFeed.jsx - Community Q&A & Skill Discussions
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon } from '../Components/Icon.jsx';

export function CommunityFeed({ openAuthModal }) {
  const { user, isAuthenticated, showToast } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', content: '', category: 'GENERAL', tags: '' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await api.getCommunityPosts();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.content.trim()) return;
    try {
      await api.createCommunityPost(postForm);
      showToast('Post published to community!', 'success');
      setShowPostModal(false);
      setPostForm({ title: '', content: '', category: 'GENERAL', tags: '' });
      fetchPosts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36]">Community Feed</h1>
          <p className="text-xs sm:text-sm text-[#5C6F84]">Ask questions, share milestones, and discuss skill acquisition.</p>
        </div>

        <button
          onClick={() => isAuthenticated ? setShowPostModal(true) : openAuthModal('signup')}
          className="px-5 py-2.5 bg-[#0066EE] hover:bg-[#0052CC] text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          + New Discussion
        </button>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#5C6F84]">Loading community feed...</div>
        ) : (posts.length > 0 ? posts : [
          {
            id: 'p1',
            author_name: 'Rohan Mehta',
            author_headline: 'Data Scientist',
            author_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
            title: 'Tips for learning Machine Learning without getting bogged down in pure calculus?',
            content: 'I have been programming in Python for 3 years. When learning ML, what is the ideal balance between understanding cost functions mathematically and applying scikit-learn / PyTorch in projects?',
            category: 'AI',
            upvotes: 24,
            created_at: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            id: 'p2',
            author_name: 'Priya Patel',
            author_headline: 'Product Designer',
            author_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            title: 'How our reciprocal swap transformed my frontend understanding in 3 weeks',
            content: 'Shoutout to Aarav! We did a 3-week swap: 1 hour of React component composition for 1 hour of Figma design system auditing every Tuesday & Thursday. The reciprocity accountability makes all the difference!',
            category: 'COMMUNITY',
            upvotes: 42,
            created_at: new Date(Date.now() - 3600000 * 12).toISOString()
          }
        ]).map((p, idx) => (
          <div key={p.id || idx} className="bg-white rounded-3xl p-6 border border-navy-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={p.author_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.author_name}`}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover bg-blue-100"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#0B1E36]">{p.author_name}</h4>
                  <p className="text-[11px] text-[#5C6F84]">{p.author_headline || 'Community Member'}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066EE] bg-blue-50 px-2.5 py-1 rounded-full">
                {p.category || 'General'}
              </span>
            </div>

            <div>
              {p.title && <h3 className="text-base font-bold text-[#0B1E36] mb-1.5">{p.title}</h3>}
              <p className="text-xs text-[#0B1E36]/90 leading-relaxed">{p.content}</p>
            </div>

            <div className="pt-3 border-t border-navy-100 flex items-center justify-between text-xs text-[#5C6F84]">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 hover:text-[#0066EE] font-semibold">
                  <span>▲</span> {p.upvotes || 0} Upvotes
                </button>
                <span>•</span>
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-navy-100 shadow-2xl animate-dropdown">
            <h3 className="text-lg font-bold text-[#0B1E36] mb-4">Start a Discussion</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1E36] mb-1">Title (Optional)</label>
                <input
                  type="text"
                  placeholder="What is your topic or question?"
                  value={postForm.title}
                  onChange={e => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1E36] mb-1">Category</label>
                <select
                  value={postForm.category}
                  onChange={e => setPostForm({ ...postForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
                >
                  <option value="GENERAL">General Discussion</option>
                  <option value="TECH">Technology & Code</option>
                  <option value="DESIGN">Design & UX</option>
                  <option value="AI">AI & Machine Learning</option>
                  <option value="SUCCESS">Swap Success Story</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1E36] mb-1">Message Content</label>
                <textarea
                  rows={4}
                  placeholder="Share details, context or what help you're looking for..."
                  value={postForm.content}
                  onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5C6F84] hover:text-[#0B1E36]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0066EE] hover:bg-[#0052CC] rounded-xl"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
