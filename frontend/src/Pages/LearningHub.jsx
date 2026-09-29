// frontend/src/Pages/LearningHub.jsx - Learning Circles & Shared Knowledge
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon } from '../Components/Icon.jsx';

export function LearningHub({ openAuthModal }) {
  const { isAuthenticated, showToast } = useAuth();
  const [circles, setCircles] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      const [circlesData, resData] = await Promise.all([
        api.getCircles().catch(() => ({ circles: [] })),
        api.getResources().catch(() => ({ resources: [] }))
      ]);
      setCircles(circlesData.circles || []);
      setResources(resData.resources || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCircle = async (circleId) => {
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    try {
      await api.joinCircle(circleId);
      showToast('Successfully joined learning circle! 🚀', 'success');
      fetchHubData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-[#0B1E36]">Learning Hub & Circles</h1>
        <p className="text-sm text-[#5C6F84]">
          Collaborate in peer-driven study groups, practice interview questions together, and access shared resource notes.
        </p>
      </div>

      {/* Learning Circles Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#0B1E36]">Active Learning Circles</h2>
            <p className="text-xs text-[#5C6F84]">Join weekly collaborative study and practice sessions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(circles.length > 0 ? circles : [
            { id: 'c1', name: 'React & Next.js Full Stack Circle', description: 'Weekly architecture critiques, SSR optimization, and mock technical interviews.', member_count: 84, focus: 'Technology' },
            { id: 'c2', name: 'UI/UX Portfolio & Figma Circle', description: 'Real-time design system reviews, accessibility testing, and user feedback exchange.', member_count: 62, focus: 'Design' },
            { id: 'c3', name: 'AI & LLM Fine-tuning Cohort', description: 'Hands-on practice with LangChain, Llama models, and Vector DB pipelines.', member_count: 95, focus: 'AI' }
          ]).map((circle, idx) => (
            <div key={circle.id || idx} className="bg-white rounded-3xl p-6 border border-navy-200/80 shadow-sm hover:shadow-lg transition-all card-hover-effect flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066EE] bg-blue-50 px-2.5 py-1 rounded-full">
                    {circle.focus || 'Cohort'}
                  </span>
                  <span className="text-xs font-semibold text-[#5C6F84]">
                    👥 {circle.member_count || 40} members
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0B1E36] mb-2">{circle.name}</h3>
                <p className="text-xs text-[#5C6F84] leading-relaxed mb-6">{circle.description}</p>
              </div>

              <button
                onClick={() => handleJoinCircle(circle.id)}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#0066EE] hover:bg-[#0052CC] rounded-xl shadow-sm transition-all"
              >
                Join Study Circle &rarr;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Shared Resource Guides */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-[#0B1E36]">Community Curated Guides</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'The Complete Roadmap: Zero to Production React', author: 'Aarav Sharma', reads: '1.4k reads', tag: 'Web Dev' },
            { title: 'Figma to Code: Auto-Layout Mastery for Developers', author: 'Priya Patel', reads: '920 reads', tag: 'UI/UX' },
            { title: 'Bilateral Reciprocal Swapping: Best Practices Guide', author: 'SkillSwap Team', reads: '2.8k reads', tag: 'Community' },
            { title: 'Mastering System Design: Real-time Chat Architecture', author: 'Vikram Singh', reads: '1.1k reads', tag: 'Engineering' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-navy-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
                <h4 className="text-sm font-bold text-[#0B1E36] mt-1.5">{item.title}</h4>
                <div className="text-[11px] text-[#5C6F84] mt-1">By {item.author} • {item.reads}</div>
              </div>
              <button className="px-3.5 py-1.5 text-xs font-bold text-[#0066EE] bg-blue-50 hover:bg-blue-100 rounded-lg">
                Read Guide
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
