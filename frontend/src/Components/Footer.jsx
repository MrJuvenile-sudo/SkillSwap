// frontend/src/Components/Footer.jsx - Platform Footer
import React from 'react';

export function Footer({ setCurrentView }) {
  return (
    <footer className="bg-[#0B1E36] text-white pt-16 pb-12 border-t border-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-800">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0066EE] to-[#007FFF] flex items-center justify-center font-bold text-lg text-white">
                SX
              </div>
              <span className="text-xl font-bold tracking-tight">
                SkillSwap<span className="text-[#007FFF]">X</span>
              </span>
            </div>
            <p className="text-sm text-navy-200/70 leading-relaxed">
              India's premier peer-to-peer reciprocal skill exchange platform. Trade expertise, collaborate directly, and level up without monetary barriers.
            </p>
            <div className="text-xs text-navy-200/50">
              MCA Minor Project — Production Ready
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-200 mb-4">Explore Platform</h4>
            <ul className="space-y-2.5 text-sm text-navy-200/70">
              <li><button onClick={() => setCurrentView('skills')} className="hover:text-white transition-colors">Skill Directory</button></li>
              <li><button onClick={() => setCurrentView('learning')} className="hover:text-white transition-colors">Learning Circles</button></li>
              <li><button onClick={() => setCurrentView('community')} className="hover:text-white transition-colors">Community Feed</button></li>
              <li><button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">Reciprocal AI Engine</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-200 mb-4">Popular Disciplines</h4>
            <ul className="space-y-2.5 text-sm text-navy-200/70">
              <li>Full Stack Web Development</li>
              <li>UI/UX & Product Design</li>
              <li>Hindi & English Fluency</li>
              <li>Vocal Training & Guitar</li>
              <li>Prompt Engineering & LLMs</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-200 mb-4">Trust & Verification</h4>
            <div className="bg-navy-950/60 p-4 rounded-xl border border-navy-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span>🛡️ Verified Karma System</span>
              </div>
              <p className="text-xs text-navy-200/60 leading-normal">
                Every swap is reviewed with bilateral feedback to safeguard community credibility and quality exchanges.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-200/50 gap-4">
          <div>
            © {new Date().getFullYear()} SkillSwapX. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>Security & Integrity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
