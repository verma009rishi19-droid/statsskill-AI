import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { assistantApi } from '../services/api';
import {
  Bot, Send, Trash2, RefreshCw, AlertCircle, ChevronRight,
  Sparkles, MessageSquare, ExternalLink, PanelLeftClose, PanelLeft,
  Lightbulb, ChevronDown, CheckCircle2, User, ShieldCheck,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; source?: string; snippet?: string; url?: string }>;
  suggestions?: string[];
}

type ContextOption = 'general' | 'sampling' | 'national_accounts' | 'price_statistics';

const CONTEXT_LABELS: Record<ContextOption, string> = {
  general: 'General Statistical Framework',
  sampling: 'Sampling Design (NSSO / PLFS)',
  national_accounts: 'National Accounts (SNA 2008)',
  price_statistics: 'Price Statistics & CPI Compilation',
};

const SUGGESTED_TOPICS = [
  'What is the CPI calculation methodology using Jevons index?',
  'Explain Sampling Design and NSSO rounds',
  'How do National Accounts work in India?',
  'What are my current competency skill gaps?',
  'How to do automated data validation in Python for official surveys?',
  'What is the Data Quality Assurance Framework (DQAF)?',
];

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState<ContextOption>('general');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextDropdownOpen, setContextDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contextDropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load chat history from backend
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const res = await assistantApi.getHistory();
        const rawHistory = Array.isArray(res.data) ? res.data : [];
        
        // Backend returns [{ id, query, response, context_type, language, created_at }]
        // Map to conversation pairs
        const loaded: ChatMessage[] = [];
        // chronological order
        const sorted = [...rawHistory].reverse();
        for (const item of sorted) {
          if (item.query) {
            loaded.push({
              role: 'user',
              content: item.query,
              timestamp: item.created_at || new Date().toISOString(),
            });
          }
          if (item.response) {
            loaded.push({
              role: 'assistant',
              content: item.response,
              timestamp: item.created_at || new Date().toISOString(),
            });
          }
        }

        // If no prior history, show welcoming message
        if (loaded.length === 0) {
          loaded.push({
            role: 'assistant',
            content: `Namaste ${user?.full_name || 'Official'}! I am your AI Learning Assistant grounded in official statistical guidelines (MoSPI, NSSTA, SNA 2008, DQAF). Ask me about statistical concepts, CPI compilation, sampling design, Python for data validation, or your personal competency gaps.`,
            timestamp: new Date().toISOString(),
            suggestions: [
              'What is the CPI calculation methodology using Jevons index?',
              'What are my current competency skill gaps?',
              'Explain NSSO two-stage stratified sampling design',
            ],
          });
        }

        setMessages(loaded);
      } catch (err) {
        console.error('Failed to load history', err);
        setHistoryError('Could not load chat history.');
        // Fallback default message
        setMessages([{
          role: 'assistant',
          content: `Welcome to StatSkill AI Assistant. Grounded in MoSPI and NSSTA official standards. How can I assist your statistical learning today?`,
          timestamp: new Date().toISOString(),
        }]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [user]);

  // Close context dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextDropdownRef.current && !contextDropdownRef.current.contains(e.target as Node)) {
        setContextDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Send message
  const handleSend = useCallback(async (msgText?: string) => {
    const query = (msgText ?? input).trim();
    if (!query || sending) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      // Backend expects: { query: str, context_type?: str, language?: str }
      const res = await assistantApi.chat({
        query: query,
        context_type: context,
        language: 'en',
      });
      const data = res.data;

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.response || 'No response generated.',
        timestamp: data.created_at || new Date().toISOString(),
        sources: data.sources || [],
        suggestions: data.suggested_followups || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI Assistant chat error', err);
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error connecting to the AI Assistant service. Please try asking again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [input, sending, context]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-6 bg-slate-50 overflow-hidden">
      {/* ── Left Sidebar: Recommended Topics & Context ── */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-200 ease-in-out border-r border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gov-blue/10 text-gov-blue flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Grounded Context
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Active Context Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Domain Context
            </label>
            <div className="space-y-1">
              {(Object.keys(CONTEXT_LABELS) as ContextOption[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setContext(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    context === key
                      ? 'bg-gov-blue text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="truncate">{CONTEXT_LABELS[key]}</span>
                  {context === key && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Statistical Queries */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Suggested Official Queries
            </label>
            <div className="space-y-1.5">
              {SUGGESTED_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(topic)}
                  disabled={sending}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-xs text-slate-700 hover:text-gov-blue transition group flex items-start gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-gov-blue mt-0.5 shrink-0" />
                  <span className="line-clamp-2 leading-relaxed">{topic}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500">
          <p className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Verified Citations
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            All AI answers are verified against MoSPI manuals &amp; official guidelines.
          </p>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                title="Open Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gov-blue text-white flex items-center justify-center font-bold shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-navy-900">Statistical Learning Assistant</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Online &amp; Grounded
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Domain Context: <span className="font-semibold text-slate-700">{CONTEXT_LABELS[context]}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([])}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition"
              title="Clear View"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-6 h-6 text-gov-blue animate-spin" />
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                      isUser
                        ? 'bg-gov-blue text-white'
                        : 'bg-white border border-slate-200 text-gov-blue'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-xs ${
                      isUser
                        ? 'bg-gov-blue text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line text-[13px]">{msg.content}</p>

                    {/* Verified Citations */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Verified Official Sources &amp; Citations:
                        </span>
                        <div className="space-y-1">
                          {msg.sources.map((src, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-700"
                            >
                              <strong className="text-slate-900 block font-semibold">
                                {src.title}
                              </strong>
                              {src.snippet && (
                                <p className="text-slate-600 mt-0.5 italic">"{src.snippet}"</p>
                              )}
                              {src.source && (
                                <span className="text-[10px] text-gov-blue font-medium mt-0.5 block">
                                  Source: {src.source}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Followups */}
                    {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSend(sug)}
                            className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-gov-blue hover:bg-blue-100 text-[11px] font-semibold transition flex items-center gap-1"
                          >
                            <span>{sug}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    <span
                      className={`text-[10px] block text-right ${
                        isUser ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-gov-blue flex items-center justify-center shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 shadow-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gov-blue animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gov-blue animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-gov-blue animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-500 ml-1">Analyzing official statistical literature…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="relative rounded-xl border border-slate-300 focus-within:border-gov-blue focus-within:ring-2 focus-within:ring-gov-blue/20 bg-white transition shadow-xs">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about official statistics concepts, CPI, NSS rounds, or your skill gaps (Enter to send)..."
                rows={2}
                disabled={sending}
                className="w-full p-3 pr-24 text-xs resize-none border-none bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800 disabled:opacity-50"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || sending}
                  className="px-3.5 py-1.5 rounded-lg bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <span>Ask AI</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Shift + Enter for new line</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Safe &amp; Grounded in MoSPI Statistical Guidelines
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
