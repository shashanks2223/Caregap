import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User, ArrowRight } from 'lucide-react';
import api from '../services/api';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; text: string; actions?: string[] }>>([
    {
      role: 'model',
      text: "Hello! I am **CareGap AI Assistant**. How can I help protect your caregiving income today?",
      actions: ["Explain Option A", "Explain Option B", "How Claims Work", "Calculate My Premium"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai-assistant/chat', { message: text });
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: res.data.reply,
          actions: res.data.suggested_actions
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: "I am temporarily using offline knowledge base mode. You can explore **Option A** (Illness/Injury Protection) and **Option B** (Involuntary Employment Continuity) in your dashboard.",
          actions: ["Option A Details", "Option B Details"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-navy-800 hover:bg-navy-900 text-white rounded-full shadow-lg shadow-navy-800/25 transition-all transform hover:scale-105 border border-navy-700"
        >
          <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">CareGap AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-navy-800 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  CareGap AI Assistant
                  <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-teal-500/20 text-teal-300">Active</span>
                </h3>
                <p className="text-[10px] text-slate-300">Underwriting & Claims Guide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs ${
                    m.role === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                  
                  {/* Action suggestions */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => sendMessage(act)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-teal-50 text-[10px] font-medium text-slate-700 hover:text-teal-700 border border-slate-200 transition-colors"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs py-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[10px] text-slate-500 ml-1">Analyzing coverage rules...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Option A, Option B, or claims..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

