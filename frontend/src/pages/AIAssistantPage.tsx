import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { assistantApi } from '../services/api';
import {
  Bot, Send, Trash2, RefreshCw, AlertCircle, ChevronRight,
  Sparkles, MessageSquare, ExternalLink, PanelLeftClose, PanelLeft,
  Lightbulb, ChevronDown,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; url?: string }>;
  suggestions?: string[];
}

interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; url?: string }>;
  suggestions?: string[];
}

type ContextOption = 'general' | 'sampling' | 'national_accounts' | 'price_statistics';

const CONTEXT_LABELS: Record<ContextOption, string> = {
  general: 'General',
  sampling: 'Sampling Design',
  national_accounts: 'National Accounts',
  price_statistics: 'Price Statistics',
};

const SUGGESTED_TOPICS = [
  'Explain Sampling Design concepts',
  'What is the CPI calculation methodology?',
  'How do National Accounts work in India?',
  'Compare SQL vs R for statistical analysis',
  'What are SDG Indicators?',
  'Explain Labour Force Survey methodology',
];

// ─── Component ──────────────────────────────────────────────────────
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

  // ── Fetch history ───────────────────────────────────────────────
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        const res = await assistantApi.getHistory();
        const history: HistoryItem[] = Array.isArray(res.data) ? res.data : [];
        setMessages(
          history.map((h) => ({
            role: h.role,
            content: h.content,
            timestamp: h.timestamp,
            sources: h.sources,
            suggestions: h.suggestions,
          }))
        );
      } catch {
        setHistoryError('Could not load chat history.');
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user]);

  // ── Auto-scroll to bottom ──────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // ── Close context dropdown on outside click ────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextDropdownRef.current && !contextDropdownRef.current.contains(e.target as Node)) {
        setContextDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Auto-resize textarea ──────────────────────────────────────
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // ── Send message ──────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await assistantApi.chat({ message: trimmed, context });
      const { response, sources, suggestions } = res.data;

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        sources,
        suggestions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [input, sending, context]);

  // ── Keyboard handler ──────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Clear chat ────────────────────────────────────────────────
  const handleClearChat = () => {
    setMessages([]);
  };

  // ── Quick topic click ─────────────────────────────────────────
  const handleTopicClick = (topic: string) => {
    setInput(topic);
    textareaRef.current?.focus();
  };

  // ── Suggestion click ──────────────────────────────────────────
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  };

  // ── Format timestamp ──────────────────────────────────────────
  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title={sidebarOpen ? 'Collapse topics' : 'Expand topics'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-gov-blue" />
            <h1 className="text-lg font-bold text-navy-900">AI Learning Assistant</h1>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded font-semibold border border-emerald-300 bg-emerald-50 text-emerald-700">
            Grounded
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Context Selector */}
          <div className="relative" ref={contextDropdownRef}>
            <button
              onClick={() => setContextDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <span className="text-slate-400 text-xs">Context:</span>
              <span className="font-medium">{CONTEXT_LABELS[context]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {contextDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-20 py-1">
                {(Object.entries(CONTEXT_LABELS) as [ContextOption, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setContext(key);
                      setContextDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${
                      context === key
                        ? 'text-gov-blue font-semibold bg-blue-50'
                        : 'text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-500 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* ── Body: sidebar + chat ─────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="w-72 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Suggested Topics
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {SUGGESTED_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicClick(topic)}
                  className="w-full text-left px-3 py-2.5 text-sm text-slate-700 rounded-lg border border-slate-200 bg-white hover:border-gov-blue hover:bg-blue-50 hover:text-gov-blue transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-slate-300 group-hover:text-gov-blue transition-colors" />
                    <span>{topic}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Chat Area ──────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Messages ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
                  <p className="text-sm font-medium text-slate-500">Loading conversation history...</p>
                </div>
              </div>
            ) : historyError ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                  <p className="text-sm text-red-600">{historyError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-sm text-gov-blue hover:underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : messages.length === 0 && !sending ? (
              /* ── Empty state ───────────────────────────────── */
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-gov-blue" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">
                    Welcome to the AI Learning Assistant
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Ask questions about statistical concepts, methodologies, survey design, or your
                    competency gaps. I'm grounded in official statistical knowledge to provide
                    accurate, context-aware responses.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTED_TOPICS.slice(0, 4).map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleTopicClick(topic)}
                        className="text-left px-3 py-2.5 text-sm text-slate-600 rounded-lg border border-slate-200 bg-white hover:border-gov-blue hover:bg-blue-50 hover:text-gov-blue transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                          <span className="line-clamp-2">{topic}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── Message list ──────────────────────────────── */
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-gov-blue text-white rounded-2xl rounded-br-md px-4 py-3'
                          : 'bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-xs'
                      }`}
                    >
                      {/* Avatar + role label */}
                      <div className="flex items-center gap-2 mb-1.5">
                        {msg.role === 'assistant' && (
                          <Bot className="w-4 h-4 text-gov-blue shrink-0" />
                        )}
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide ${
                            msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {msg.role === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <span
                          className={`text-[10px] ${
                            msg.role === 'user' ? 'text-blue-200' : 'text-slate-300'
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      {/* Content */}
                      <div
                        className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user' ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                            Sources
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-gov-blue hover:bg-blue-50 hover:border-blue-200 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {src.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                            Follow-up questions
                          </p>
                          <div className="space-y-1">
                            {msg.suggestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => handleSuggestionClick(sug)}
                                className="block w-full text-left text-[12px] px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-gov-blue transition-colors"
                              >
                                <div className="flex items-center gap-1.5">
                                  <MessageSquare className="w-3 h-3 shrink-0" />
                                  {sug}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* ── Typing indicator ─────────────────────────── */}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4 text-gov-blue" />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Assistant
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 py-1">
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-xs text-slate-400 ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input Area ───────────────────────────────────── */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about statistical concepts, methodologies, or your competency gaps..."
                    rows={1}
                    disabled={sending}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-blue focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="shrink-0 w-11 h-11 rounded-xl bg-gov-blue text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Send message (Enter)"
                >
                  {sending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 font-mono">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 font-mono">Shift + Enter</kbd> for new line · Responses are grounded in official statistical knowledge
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
