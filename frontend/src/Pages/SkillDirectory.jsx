// frontend/src/Pages/SkillDirectory.jsx - Explore Skills & Mentor Directory
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Icon } from '../Components/Icon.jsx';

export function SkillDirectory({ onProposeSwap, selectedCategory = 'ALL' }) {
  const [activeTab, setActiveTab] = useState(selectedCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'ALL', name: 'All Skills' },
    { id: 'Technology', name: 'Software & Web' },
    { id: 'Design', name: 'UI/UX & Design' },
    { id: 'Language', name: 'Languages' },
    { id: 'Music', name: 'Music & Audio' },
    { id: 'Business', name: 'Business & Finance' },
    { id: 'AI', name: 'AI & Data Science' }
  ];

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers(searchQuery ? `search=${encodeURIComponent(searchQuery)}` : '');
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-[#0B1E36]">Explore Skill Directory</h1>
        <p className="text-sm text-[#5C6F84]">
          Find peers across India offering skills you want to learn, or connect to trade reciprocal knowledge.
        </p>

        {/* Directory Search Box */}
        <div className="relative max-w-lg mx-auto mt-4">
          <input
            type="text"
            placeholder="Search mentors by name, skill, or location (e.g. React, Bengaluru)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3.5 text-xs sm:text-sm rounded-2xl border border-navy-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === cat.id
                ? 'bg-[#0066EE] text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-[#5C6F84] border border-navy-200 hover:text-[#0B1E36] hover:bg-cream-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-navy-200 animate-pulse h-64" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-navy-200 space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="text-base font-bold text-[#0B1E36]">No peers found</h3>
          <p className="text-xs text-[#5C6F84]">Try searching for another skill or clearing your search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map(u => (
            <div
              key={u.id}
              className="bg-white rounded-3xl p-6 border border-navy-200/90 shadow-sm hover:shadow-lg transition-all card-hover-effect flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                    alt={u.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-50 bg-blue-100"
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#0B1E36]">{u.name}</h3>
                    <p className="text-xs text-[#0066EE] font-semibold">{u.headline || 'Skill Contributor'}</p>
                    <p className="text-[11px] text-[#5C6F84]">{u.location || 'India'}</p>
                  </div>
                </div>

                <div className="space-y-2.5 my-4">
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Expertise / Teaches</span>
                    <p className="text-xs font-semibold text-[#0B1E36] mt-0.5">{u.headline || 'Web Development, System Design'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-navy-100 flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1E36]">
                  <Icon name="star" className="w-4 h-4 text-amber-500" />
                  <span>4.9</span>
                  <span className="text-[11px] font-normal text-[#5C6F84]">Karma {u.karma_score || 100}</span>
                </div>

                <button
                  onClick={() => onProposeSwap && onProposeSwap(u)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0066EE] hover:bg-[#0052CC] rounded-xl shadow-sm transition-all"
                >
                  Propose Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
