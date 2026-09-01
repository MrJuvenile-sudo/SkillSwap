// public/views_ai.js - SkillSwap AI Floating Widget
(function() {
  window.SkillSwap = window.SkillSwap || {};
  const React = window.React;
  const htm = window.htm || self.htm;
  if (!React || !htm) return;
  const { useState, useEffect, useRef } = React;
  const html = htm.bind(React.createElement);
  const { api } = window.SkillSwap;

  const INTENT_PAGE_CHIPS = {
    'dashboard': [
      { label: 'How do match scores work?', msg: 'How are match scores calculated?' },
      { label: 'Browse Learning Hub', msg: 'Show me study resources in Learning Hub' },
      { label: 'How do I add skills?', msg: 'How do I add skills to my profile?' }
    ],
    'hub-browse': [
      { label: 'How do I share notes?', msg: 'How do I share a resource in Learning Hub?' },
      { label: 'What is Exam Mode?', msg: 'What is Exam Mode and how does it work?' },
      { label: 'Resource guidelines', msg: 'What are the rules for sharing resources?' }
    ],
    'matches': [
      { label: 'Explain my top match', msg: 'Why is my top match recommended for me?' },
      { label: 'How to propose a swap?', msg: 'How do I send a swap request?' },
      { label: 'Filter by skill level', msg: 'How do I filter matches by level?' }
    ],
    'admin': [
      { label: 'Moderate resources', msg: 'How do I review pending resources in Admin Panel?' },
      { label: 'User roles summary', msg: 'What are the staff roles in SkillSwapX?' },
      { label: 'Platform health', msg: 'Show me platform activity overview' }
    ]
  };

  const DEFAULT_CHIPS = [
    { label: 'Share notes in Learning Hub', msg: 'How do I upload notes?' },
    { label: 'How matching works', msg: 'How does the skill matching engine work?' },
    { label: 'Propose a skill swap', msg: 'How do I propose a swap to someone?' },
    { label: 'Exam Mode help', msg: 'Where do I find exam preparation notes?' }
  ];

  function SkillSwapAIWidget({ currentUser, activeTab, setActiveTab }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
      {
        id: 'welcome',
        role: 'ASSISTANT',
        content: `Hi ${currentUser ? currentUser.name.split(' ')[0] : 'there'}! 👋 I'm **SkillSwap AI**, your platform assistant. Ask me anything about matching, Learning Hub resources, swap requests, or app features.`,
        intent: 'GENERAL',
        suggestions: ['How do I upload notes?', 'How does matching work?', 'Browse Learning Hub']
      }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [feedbackMap, setFeedbackMap] = useState({});
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
      if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const chips = INTENT_PAGE_CHIPS[activeTab] || DEFAULT_CHIPS;

    const sendMessage = async (textToSend) => {
      const msg = textToSend || input;
      if (!msg || !msg.trim() || loading) return;

      const userMsg = { id: Date.now(), role: 'USER', content: msg.trim() };
      setMessages(prev => [...prev, userMsg]);
      if (!textToSend) setInput('');
      setLoading(true);

      try {
        const data = await api('/api/ai/chat', {
          method: 'POST',
          body: JSON.stringify({ message: msg.trim(), page: activeTab, conversationId })
        });

        if (data.conversationId) setConversationId(data.conversationId);

        const asstMsg = {
          id: data.messageId || (Date.now() + 1),
          role: 'ASSISTANT',
          content: data.reply,
          intent: data.intent,
          suggestions: data.suggestions || []
        };
        setMessages(prev => [...prev, asstMsg]);
      } catch (err) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            role: 'ASSISTANT',
            content: 'Sorry, I ran into an issue connecting. Please try again or check support.',
            suggestions: ['Try again', 'Contact Support']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    const handleFeedback = async (msgId, rating) => {
      if (feedbackMap[msgId] === rating) return;
      try {
        await api('/api/ai/feedback', {
          method: 'POST',
          body: JSON.stringify({ message_id: msgId, rating })
        });
        setFeedbackMap(prev => ({ ...prev, [msgId]: rating }));
      } catch (e) {
        console.error('Feedback failed', e);
      }
    };

    const handleSuggestionClick = (sug) => {
      if (sug === 'Browse Learning Hub' || sug === 'Browse All Resources') setActiveTab('hub-browse');
      else if (sug === 'Share a Resource' || sug === 'Share Your Notes') setActiveTab('hub-upload');
      else if (sug === 'Open Exam Mode') setActiveTab('exam-mode');
      else if (sug === 'View My Matches' || sug === 'Browse Matches') setActiveTab('matches');
      else if (sug === 'Manage My Skills' || sug === 'Add Skills') setActiveTab('skills');
      else if (sug === 'Open Chat') setActiveTab('chat');
      else if (sug === 'Open Community Feed') setActiveTab('community');
      else if (sug === 'Open Admin Panel') setActiveTab('admin');
      else sendMessage(sug);
    };

    if (!currentUser) return null;

    return html`
      <div class="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans">
        ${isOpen ? html`
          <div class="w-96 max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-white border border-cream-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn mb-4">
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-navy-900 to-indigo-900 text-white px-5 py-4 flex items-center justify-between shadow-sm shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-indigo-600/50 border border-indigo-400/40 flex items-center justify-center text-base">
                  🤖
                </div>
                <div>
                  <h3 class="font-serif font-bold text-sm leading-tight flex items-center gap-1.5">
                    SkillSwap AI
                    <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold uppercase border border-emerald-400/30">Assistant</span>
                  </h3>
                  <p class="text-[10px] text-navy-200">Context-aware platform guide</p>
                </div>
              </div>
              <button onClick=${() => setIsOpen(false)} class="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-bold">
                ✕
              </button>
            </div>

            <!-- Messages Container -->
            <div class="flex-1 p-4 overflow-y-auto space-y-4 bg-cream-50/50">
              ${messages.map(m => html`
                <div key=${m.id} class="flex flex-col ${m.role === 'USER' ? 'items-end' : 'items-start'} gap-1 space-y-1">
                  <div class="max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    m.role === 'USER' 
                      ? 'bg-navy-700 text-white rounded-br-none' 
                      : 'bg-white text-navy-950 border border-cream-200 rounded-bl-none'
                  }">
                    <div class="whitespace-pre-line">${m.content}</div>
                  </div>

                  ${m.role === 'ASSISTANT' && m.id !== 'welcome' ? html`
                    <div class="flex items-center gap-2 px-1 text-[10px] text-warmgray-400 font-semibold">
                      <span>Helpful?</span>
                      <button onClick=${() => handleFeedback(m.id, 'UP')} 
                        class="hover:text-indigo-600 transition-colors ${feedbackMap[m.id] === 'UP' ? 'text-indigo-600 font-bold' : ''}">
                        👍
                      </button>
                      <button onClick=${() => handleFeedback(m.id, 'DOWN')} 
                        class="hover:text-rose-600 transition-colors ${feedbackMap[m.id] === 'DOWN' ? 'text-rose-600 font-bold' : ''}">
                        👎
                      </button>
                    </div>
                  ` : null}

                  ${m.suggestions && m.suggestions.length > 0 ? html`
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      ${m.suggestions.map((s, idx) => html`
                        <button key=${idx} onClick=${() => handleSuggestionClick(s)}
                          class="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-cream-300 hover:border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-lg transition-all shadow-2xs">
                          ${s} →
                        </button>
                      `)}
                    </div>
                  ` : null}
                </div>
              `)}

              ${loading ? html`
                <div class="flex items-center gap-2 bg-white border border-cream-200 rounded-2xl rounded-bl-none px-4 py-3 w-max text-xs text-warmgray-500">
                  <span class="animate-spin text-base">🌀</span> SkillSwap AI is thinking...
                </div>
              ` : null}
              
              <div ref=${messagesEndRef}></div>
            </div>

            <!-- Page Context Quick Chips -->
            <div class="px-3 py-2 bg-white border-t border-cream-200 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
              <span class="text-[9px] font-bold text-warmgray-400 uppercase tracking-wider shrink-0 mr-1">Quick:</span>
              ${chips.map((chip, idx) => html`
                <button key=${idx} onClick=${() => sendMessage(chip.msg)}
                  class="px-2.5 py-1 bg-cream-100 hover:bg-cream-200 text-navy-800 text-[10px] font-semibold rounded-full whitespace-nowrap transition-colors border border-cream-200">
                  ${chip.label}
                </button>
              `)}
            </div>

            <!-- Input Bar -->
            <div class="p-3 bg-white border-t border-cream-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Ask SkillSwap AI..."
                value=${input}
                onInput=${e => setInput(e.target.value)}
                onKeyDown=${e => e.key === 'Enter' && sendMessage()}
                class="flex-1 px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium focus:outline-none focus:border-navy-500 focus:bg-white transition-all"
              />
              <button onClick=${() => sendMessage()} disabled=${!input.trim() || loading}
                class="p-2.5 bg-navy-700 hover:bg-navy-800 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all text-xs font-bold shrink-0">
                ➔
              </button>
            </div>

          </div>
        ` : null}

        <!-- Trigger Button -->
        <button
          onClick=${() => setIsOpen(!isOpen)}
          class="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-navy-900 to-indigo-900 hover:from-navy-800 hover:to-indigo-800 text-white font-bold text-xs rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 scale-100 hover:scale-105 active:scale-95 border border-indigo-500/30"
        >
          <span class="text-base leading-none">🤖</span>
          <span>SkillSwap AI</span>
        </button>
      </div>
    `;
  }

  window.SkillSwap.SkillSwapAIWidget = SkillSwapAIWidget;
})();
