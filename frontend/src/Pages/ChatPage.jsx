// frontend/src/Pages/ChatPage.jsx - Real-time Peer Messaging
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon } from '../Components/Icon.jsx';

export function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activePeer) {
      loadMessages(activePeer.id);
      const interval = setInterval(() => {
        loadMessages(activePeer.id, true);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activePeer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await api.getConversations();
      const convs = data.conversations || [];
      setConversations(convs);
      if (convs.length > 0 && !activePeer) {
        setActivePeer(convs[0].peer);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (peerId, silent = false) => {
    try {
      const data = await api.getMessages(peerId);
      setMessages(data.messages || []);
    } catch (e) {
      if (!silent) console.error(e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activePeer) return;
    const text = inputText.trim();
    setInputText('');

    try {
      const res = await api.sendMessage({
        receiver_id: activePeer.id,
        content: text
      });
      if (res.message) {
        setMessages(prev => [...prev, res.message]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-6rem)]">
      <div className="bg-white rounded-3xl border border-navy-200 shadow-sm h-full flex overflow-hidden">
        
        {/* Left Sidebar: Conversations */}
        <div className="w-80 border-r border-navy-100 flex flex-col h-full bg-cream-50/40">
          <div className="p-4 border-b border-navy-100 bg-white">
            <h2 className="text-base font-bold text-[#0B1E36]">Direct Messages</h2>
            <p className="text-[11px] text-[#5C6F84]">Active exchange discussions</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-4 text-center text-xs text-[#5C6F84]">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5C6F84]">
                No active conversations yet. Propose a skill swap to start chatting!
              </div>
            ) : (
              conversations.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePeer(c.peer)}
                  className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-colors ${
                    activePeer?.id === c.peer.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-cream-100'
                  }`}
                >
                  <img
                    src={c.peer.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.peer.name}`}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover bg-blue-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#0B1E36] truncate">{c.peer.name}</h4>
                      {c.unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#0066EE]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#5C6F84] truncate">
                      {c.lastMessage ? c.lastMessage.content : 'Started an exchange'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Chat Window */}
        <div className="flex-1 flex flex-col h-full bg-white">
          {activePeer ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-navy-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activePeer.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${activePeer.name}`}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover bg-blue-100"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1E36]">{activePeer.name}</h3>
                    <p className="text-[11px] text-[#0066EE] font-semibold">{activePeer.headline || 'SkillSwap Peer'}</p>
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FAF6EF]/50">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#5C6F84]">
                    Say hello to {activePeer.name} to plan your skill exchange session!
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-[#0066EE] text-white rounded-br-none shadow-md shadow-blue-500/10'
                              : 'bg-white text-[#0B1E36] border border-navy-200/80 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[10px] text-navy-400 mt-1 px-1">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form onSubmit={handleSend} className="p-4 border-t border-navy-100 flex items-center gap-3 bg-white">
                <input
                  type="text"
                  placeholder={`Message ${activePeer.name}...`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-[#0066EE]"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-6 py-3 bg-[#0066EE] hover:bg-[#0052CC] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#5C6F84]">
              Select a peer to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
