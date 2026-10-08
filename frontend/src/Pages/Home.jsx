// frontend/src/Pages/Home.jsx - Hero with Slow Falling Dots & Dynamic Peers on Refresh
import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../Components/Icon.jsx';

const PEER_POOL = [
  { name: 'Aarav Sharma', role: 'Full Stack Engineer', location: 'Bengaluru, KA', teach: 'React, Node.js & Docker', learn: 'UI/UX Design & Figma', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', rating: 4.9, swaps: 28 },
  { name: 'Priya Patel', role: 'Product Designer', location: 'Mumbai, MH', teach: 'Figma, Design Systems & Wireframing', learn: 'Frontend Development & Tailwind', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', rating: 5.0, swaps: 34 },
  { name: 'Rohan Mehta', role: 'Data Scientist', location: 'Hyderabad, TS', teach: 'Python, Pandas & Machine Learning', learn: 'Cloud DevOps & AWS', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', rating: 4.8, swaps: 19 },
  { name: 'Ananya Iyer', role: 'Mobile App Developer', location: 'Chennai, TN', teach: 'Flutter, Dart & Cross-Platform', learn: 'Backend APIs & PostgreSQL', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', rating: 4.9, swaps: 22 },
  { name: 'Vikram Singh', role: 'Cloud Architect', location: 'Pune, MH', teach: 'Kubernetes, CI/CD & Terraform', learn: 'Golang & Microservices', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', rating: 4.9, swaps: 41 },
  { name: 'Sneha Rao', role: 'Content Strategist', location: 'New Delhi, DL', teach: 'SEO, Technical Writing & Copywriting', learn: 'Prompt Engineering & Generative AI', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', rating: 5.0, swaps: 16 },
  { name: 'Dev Verma', role: 'Financial Analyst', location: 'Gurugram, HR', teach: 'Financial Modeling & Valuation', learn: 'Python for Finance & Quant', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', rating: 4.7, swaps: 12 },
  { name: 'Meera Nambiar', role: 'Vocal Coach & Musician', location: 'Kochi, KL', teach: 'Classical Music & Voice Culture', learn: 'Digital Music Production (Logic Pro)', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', rating: 5.0, swaps: 27 }
];

export function Home({ setCurrentView, openAuthModal, onProposeSwap }) {
  const canvasRef = useRef(null);
  const [featuredPeers, setFeaturedPeers] = useState([]);
  const [searchVal, setSearchVal] = useState('');

  // Hero Heading Typewriter Animation State
  const TYPEWRITER_PHRASES = [
    'Master What You Need Next.',
    'Trade React for Python AI.',
    'Swap UI/UX for System Design.',
    'Learn Spanish, Teach Guitar.',
    '100% Free Peer Barter Economy.'
  ];

  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = TYPEWRITER_PHRASES[typewriterIndex];
    let timer;

    if (!isDeleting) {
      if (typedText.length < fullText.length) {
        timer = setTimeout(() => {
          setTypedText(fullText.slice(0, typedText.length + 1));
        }, 70);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typedText.length > 0) {
        timer = setTimeout(() => {
          setTypedText(fullText.slice(0, typedText.length - 1));
        }, 35);
      } else {
        setIsDeleting(false);
        setTypewriterIndex(prev => (prev + 1) % TYPEWRITER_PHRASES.length);
        timer = setTimeout(() => {}, 250);
      }
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, typewriterIndex]);

  // Randomize peer cards on every page refresh / mount
  useEffect(() => {
    const shuffled = [...PEER_POOL].sort(() => 0.5 - Math.random());
    setFeaturedPeers(shuffled.slice(0, 3));
  }, []);

  // Background dots canvas: slow top-to-bottom motion
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const particleCount = Math.floor(Math.min(canvas.width, 1400) / 24);
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        // Very slow vertical velocity (top to bottom)
        speedY: Math.random() * 0.25 + 0.15,
        // Subtle drift
        driftX: (Math.random() - 0.5) * 0.05,
        opacity: Math.random() * 0.35 + 0.15
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 102, 238, ${p.opacity})`;
        ctx.fill();

        // Move top to bottom slowly
        p.y += p.speedY;
        p.x += p.driftX;

        // Wrap around when passing bottom
        if (p.y > canvas.height) {
          p.y = -5;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-[#FAF6EF]">
        {/* Background Animated Dots */}
        <canvas ref={canvasRef} className="hero-particle-canvas" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 shadow-sm text-xs font-bold text-[#0066EE]">
              <span>✨ 100% Free Peer-to-Peer Knowledge Economy</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0B1E36] leading-[1.12]">
              Teach What You Know, <br />
              <span className="text-[#0066EE] font-serif italic min-h-[1.25em] inline-block">
                {typedText}<span className="inline-block w-[3px] h-[0.8em] ml-1.5 bg-[#0066EE] animate-pulse align-middle" />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#5C6F84] leading-relaxed max-w-2xl mx-auto">
              SkillSwapX connects ambitious learners and mentors across India. Trade software engineering for design, music for languages, and level up with zero money involved.
            </p>

            {/* Hero Search Bar */}
            <form onSubmit={(e) => { e.preventDefault(); setCurrentView('skills'); }} className="max-w-2xl mx-auto pt-2">
              <div className="flex items-center bg-white p-2.5 rounded-2xl border border-cream-300 shadow-xl focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <div className="pl-3.5 text-gray-400">
                  <Icon name="search" className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="What do you want to learn? (e.g. Python, UI/UX, Rust, Spanish)..."
                  className="w-full px-3.5 py-3 text-sm sm:text-base text-[#0B1E36] placeholder-gray-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#0066EE] to-[#007FFF] hover:from-[#0052CC] hover:to-[#0066EE] text-white font-bold text-sm rounded-xl shadow-md transition-all shrink-0"
                >
                  Find Matches
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-[#0066EE] to-[#007FFF] hover:from-[#0052CC] hover:to-[#0066EE] rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Join SkillSwapX Free &rarr;
              </button>
              <button
                onClick={() => setCurrentView('skills')}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-[#0B1E36] bg-white hover:bg-cream-100 rounded-2xl border border-navy-200 shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Explore Skills Directory
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-center">
              <div>
                <div className="text-2xl font-black text-[#0B1E36]">12,500+</div>
                <div className="text-xs font-semibold text-[#5C6F84]">Swaps Completed</div>
              </div>
              <div className="h-8 w-[1px] bg-navy-200 hidden sm:block" />
              <div>
                <div className="text-2xl font-black text-[#0B1E36]">500+</div>
                <div className="text-xs font-semibold text-[#5C6F84]">Skills Cataloged</div>
              </div>
              <div className="h-8 w-[1px] bg-navy-200 hidden sm:block" />
              <div>
                <div className="text-2xl font-black text-[#0066EE]">4.9 / 5.0</div>
                <div className="text-xs font-semibold text-[#5C6F84]">Reciprocal Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Dynamic Peer Showcase (Updated on Every Refresh) */}
          <div className="mt-16 sm:mt-24">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-[#0B1E36]">Featured Mentors Available Now</h3>
                <p className="text-xs text-[#5C6F84]">Refreshing the page rotates active peers looking to swap skills right now.</p>
              </div>
              <button
                onClick={() => setCurrentView('skills')}
                className="text-xs font-bold text-[#0066EE] hover:underline"
              >
                View all mentors &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPeers.map((peer, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-navy-200/80 shadow-md hover:shadow-xl transition-all duration-300 card-hover-effect flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={peer.avatar} 
                        alt={peer.name} 
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-100" 
                      />
                      <div>
                        <h4 className="text-base font-bold text-[#0B1E36]">{peer.name}</h4>
                        <div className="text-xs text-[#0066EE] font-semibold">{peer.role}</div>
                        <div className="text-[11px] text-[#5C6F84]">{peer.location}</div>
                      </div>
                    </div>

                    <div className="space-y-3 my-4">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Teaches</div>
                        <div className="text-xs font-bold text-[#0B1E36] mt-0.5">{peer.teach}</div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#0066EE]">Wants to Learn</div>
                        <div className="text-xs font-bold text-[#0B1E36] mt-0.5">{peer.learn}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-navy-100 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B1E36]">
                      <Icon name="star" className="w-4 h-4 text-amber-500" />
                      <span>{peer.rating}</span>
                      <span className="text-[11px] font-normal text-[#5C6F84]">({peer.swaps} swaps)</span>
                    </div>

                    <button
                      onClick={() => onProposeSwap ? onProposeSwap(peer) : openAuthModal('signup')}
                      className="px-4 py-2 text-xs font-bold text-[#0066EE] bg-blue-50 hover:bg-[#0066EE] hover:text-white rounded-xl transition-colors"
                    >
                      Propose Swap &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-y border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-[#0B1E36]">How SkillSwapX Works</h2>
            <p className="mt-3 text-sm text-[#5C6F84]">
              Three simple steps to unlock free reciprocal 1-on-1 mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-cream-50 border border-cream-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0066EE] flex items-center justify-center font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-[#0B1E36] mb-2">List Skills & Goals</h3>
              <p className="text-sm text-[#5C6F84] leading-relaxed">
                Add skills you can comfortably teach others, and specify what you want to master in return.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-cream-50 border border-cream-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0066EE] flex items-center justify-center font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-[#0B1E36] mb-2">AI Reciprocal Matching</h3>
              <p className="text-sm text-[#5C6F84] leading-relaxed">
                Our algorithm scores mutual compatibility so both users gain equal value from the swap.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-cream-50 border border-cream-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0066EE] flex items-center justify-center font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-[#0B1E36] mb-2">Connect & Exchange</h3>
              <p className="text-sm text-[#5C6F84] leading-relaxed">
                Chat, schedule 1-on-1 sessions, complete your exchange, and earn verified community karma.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
