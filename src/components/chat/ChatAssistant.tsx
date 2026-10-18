import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  User as UserIcon,
  ShoppingBag,
  Printer,
  Compass,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiApi } from '../../services/api';
import { AiChatMessage, StoreItem } from '../../types';

interface ChatAssistantProps {
  onNavigate: (path: string, replace?: boolean) => void;
  currentPath?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onNavigate, currentPath }) => {
  const { user, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // 1. Strict Privacy & Account Isolation:
  // When user identity changes or user logs out, wipe conversation completely
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setMessages([]);
      setIsOpen(false);
      setInputMessage('');
      setErrorBanner(null);
      currentUserIdRef.current = null;
      return;
    }

    if (currentUserIdRef.current && currentUserIdRef.current !== user.id) {
      // Switched account: wipe previous session
      setMessages([]);
      setInputMessage('');
      setErrorBanner(null);
    }
    currentUserIdRef.current = user.id;
  }, [user, isAuthenticated]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Role-specific suggested prompts
  const suggestedPrompts =
    user?.role === 'staff'
      ? [
          { text: 'Check incoming print queue status', icon: Compass },
          { text: 'Search pending orders awaiting review', icon: Clock },
          { text: 'Find lab apparel and stationery stock', icon: ShoppingBag },
          { text: 'Explain pickup counter workflows', icon: Printer },
        ]
      : [
          { text: 'Track my active print orders', icon: Clock },
          { text: 'Find engineering notebooks & stick files', icon: ShoppingBag },
          { text: 'I need to print 35 pages B&W double-sided', icon: Printer },
          { text: 'Explain print options and counter locations', icon: Compass },
        ];

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content || isLoading) return;

    setErrorBanner(null);
    setInputMessage('');

    const userMessage: AiChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build lightweight history (max 8 previous turns)
      const conversationHistory = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await aiApi.sendMessage(content, conversationHistory);

      const assistantMessage: AiChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp || new Date().toISOString(),
        status: 'sent',
        data: response.data,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error('[ChatAssistant] Error sending message:', err);
      const isRateLimit = err.message?.toLowerCase().includes('traffic') || err.message?.toLowerCase().includes('rate limit');
      setErrorBanner(
        isRateLimit
          ? 'SkipQ AI is experiencing high traffic. Please try again in a few moments.'
          : err.message || 'Unable to connect to SkipQ AI. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setErrorBanner(null);
  };

  // Render formatted markdown text safely
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed text-[#F9FAFB]">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Bullet points
          if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const bulletText = line.trim().slice(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#00D4FF] font-bold mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(bulletText) }} />
              </div>
            );
          }

          // Numbered lists
          const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#00D4FF] font-mono font-bold">{numMatch[1]}.</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(numMatch[2]) }} />
              </div>
            );
          }

          // Heading
          if (line.trim().startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-white text-sm pt-1">
                {line.trim().slice(4)}
              </h4>
            );
          }

          return <p key={idx} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
        })}
      </div>
    );
  };

  const formatInline = (str: string) => {
    // Bold: **text**
    let formatted = str.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
    // Inline code: `code`
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 bg-[#1A2232] border border-[#273244] text-[#00D4FF] rounded text-[11px] font-mono">$1</code>'
    );
    return formatted;
  };

  // Do not render anything if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* 1. Floating Circular AI Assistant Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open SkipQ AI Assistant"
          className="fixed bottom-[4.75rem] right-3 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 group flex items-center gap-2 p-2.5 sm:px-4 sm:py-3.5 rounded-full bg-[#111827]/95 backdrop-blur-xl border border-[#00D4FF]/60 text-[#F9FAFB] shadow-[0_8px_30px_rgba(0,212,255,0.25)] hover:shadow-[0_10px_40px_rgba(0,212,255,0.4)] hover:border-[#00D4FF] hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <div className="relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center text-[#080B12] shadow-inner">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#080B12] animate-pulse" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#00D4FF] text-[#080B12] text-[10px] font-black flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              SkipQ AI <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-ping" />
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#9CA3AF] hidden xs:inline">
              {user.role === 'staff' ? 'Operator Assistant' : 'Campus Print Guide'}
            </span>
          </div>
        </button>
      )}

      {/* 2. Expanded Chat Assistant Panel */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-20 top-4 sm:inset-auto sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 w-auto sm:w-[420px] sm:h-[620px] max-h-[calc(100vh-2rem)] flex flex-col bg-[#111827] border border-[#273244] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 sm:px-5 sm:py-3.5 bg-[#0D111B] border-b border-[#273244] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center text-[#080B12] shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                <Bot className="w-5 h-5 text-[#080B12]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-[#F9FAFB] tracking-tight">SkipQ AI</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25 text-[9px] font-black uppercase tracking-wider font-mono">
                    {user.role === 'staff' ? 'Staff Terminal' : 'Student Hub'}
                  </span>
                </div>
                <p className="text-[10px] text-[#9CA3AF] flex items-center gap-1.5 mt-0.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                  Gemini 3.8 Flash • Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-2 text-[#9CA3AF] hover:text-[#FB7185] hover:bg-[#1A2232] rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant (Esc)"
                aria-label="Close Assistant"
                className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#1A2232] rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation History Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Initial Welcome Greeting / Empty State */}
            {messages.length === 0 && (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-[#0D111B] border border-[#273244] space-y-2">
                  <div className="flex items-center gap-2 text-[#00D4FF] font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                    <span>Welcome, {user.name?.split(' ')[0] || 'Friend'}!</span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    {user.role === 'staff'
                      ? "Hi Operator! I'm SkipQ AI. I can inspect live queue depths, look up customer orders, check stationery inventory levels, and guide counter desk workflows."
                      : "Hi! I'm SkipQ AI, your campus printing and stationery assistant. I can help you track your orders, find stationery, understand printing options, and navigate SkipQ. What would you like to do?"}
                  </p>
                </div>

                {/* Suggested Action Prompts */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider font-mono">
                    Suggested Actions
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedPrompts.map((prompt, i) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(prompt.text)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0D111B] hover:bg-[#1A2232] border border-[#273244] hover:border-[#00D4FF]/40 text-left text-xs text-[#F9FAFB] transition-all group"
                        >
                          <Icon className="w-3.5 h-3.5 text-[#00D4FF] shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="flex-1 truncate">{prompt.text}</span>
                          <ArrowRight className="w-3 h-3 text-[#6B7280] group-hover:text-[#00D4FF] transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Message Bubble List */}
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2 max-w-full`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280] font-mono px-1">
                    {isUser ? (
                      <>
                        <span>You</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-[#00D4FF]" />
                        <span className="text-[#00D4FF] font-bold">SkipQ AI</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </>
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl max-w-[92%] sm:max-w-[88%] shadow-md ${
                      isUser
                        ? 'bg-[#1A2232] border border-[#273244] text-[#F9FAFB] rounded-tr-xs'
                        : 'bg-[#0D111B] border border-[#273244] text-[#F9FAFB] rounded-tl-xs'
                    }`}
                  >
                    {renderMessageContent(msg.content)}

                    {/* Structured Artifacts: Print Job Estimate Card */}
                    {msg.data?.printEstimate && (
                      <div className="mt-3.5 pt-3 border-t border-[#273244] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#00D4FF] flex items-center gap-1.5 font-mono">
                            <Printer className="w-3.5 h-3.5" /> Print Job Estimate
                          </span>
                          <span className="text-sm font-black text-[#00D4FF] font-mono">
                            ₹{msg.data.printEstimate.estimatedTotal}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-[#9CA3AF]">
                          <div className="p-1.5 rounded-lg bg-[#111827] border border-[#273244]">
                            Pages: <strong className="text-white">{msg.data.printEstimate.pages}</strong> ({msg.data.printEstimate.totalSheets} sheets)
                          </div>
                          <div className="p-1.5 rounded-lg bg-[#111827] border border-[#273244]">
                            Mode: <strong className="text-white">{msg.data.printEstimate.color}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-[#111827] border border-[#273244]">
                            Sides: <strong className="text-white">{msg.data.printEstimate.sides}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-[#111827] border border-[#273244]">
                            Binding: <strong className="text-white">{msg.data.printEstimate.finishing}</strong>
                          </div>
                        </div>

                        {user.role === 'student' && (
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onNavigate('/student/orders/new');
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#080B12] font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,212,255,0.25)] transition-all"
                          >
                            <span>Open New Order Workflow</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Structured Artifacts: Stationery Products */}
                    {msg.data?.products && msg.data.products.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-[#273244] space-y-2">
                        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase font-mono">
                          Campus Catalog Matches ({msg.data.products.length})
                        </p>
                        <div className="space-y-2">
                          {msg.data.products.slice(0, 3).map((item: StoreItem) => (
                            <div
                              key={item.id}
                              className="p-2.5 rounded-xl bg-[#111827] border border-[#273244] flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0 flex-1">
                                <h5 className="font-bold text-white text-xs truncate">{item.name}</h5>
                                <p className="text-[10px] text-[#9CA3AF] truncate">{item.category}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-black text-[#00D4FF] font-mono">₹{item.price}</div>
                                <span
                                  className={`text-[9px] font-mono font-bold ${
                                    item.isAvailable && item.stock > 0 ? 'text-[#34D399]' : 'text-[#FB7185]'
                                  }`}
                                >
                                  {item.isAvailable && item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onNavigate(user.role === 'staff' ? '/staff/store' : '/student/store');
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-[#1A2232] hover:bg-[#202B3D] border border-[#273244] text-[#00D4FF] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>View Full Stationery Store</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Structured Artifacts: Orders List */}
                    {msg.data?.orders && msg.data.orders.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-[#273244] space-y-2">
                        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase font-mono">
                          Found Orders ({msg.data.orders.length})
                        </p>
                        <div className="space-y-1.5">
                          {msg.data.orders.slice(0, 3).map((order: any, idx: number) => (
                            <div
                              key={order.id || idx}
                              className="p-2.5 rounded-xl bg-[#111827] border border-[#273244] flex items-center justify-between gap-2"
                            >
                              <div>
                                <span className="font-mono font-bold text-white text-xs">{order.token}</span>
                                <p className="text-[10px] text-[#9CA3AF] truncate max-w-[180px]">
                                  {order.itemsSummary || order.pickupCounter}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-[#1A2232] text-[#00D4FF] border border-[#273244]">
                                  {order.status}
                                </span>
                                <div className="text-[11px] font-mono font-bold text-white mt-0.5">
                                  ₹{order.totalAmount || order.pricing?.total || 0}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onNavigate(user.role === 'staff' ? '/staff/orders' : '/student/history');
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-[#1A2232] hover:bg-[#202B3D] border border-[#273244] text-[#00D4FF] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Open Order Management</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Structured Artifacts: Direct Page Navigation */}
                    {msg.data?.navigationTarget && (
                      <div className="mt-3 pt-2.5 border-t border-[#273244]">
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onNavigate(msg.data!.navigationTarget!.path);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#080B12] font-black text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,212,255,0.25)] transition-all"
                        >
                          <span>{msg.data.navigationTarget.label || 'Go to Page'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Typing State */}
            {isLoading && (
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="p-3.5 rounded-2xl rounded-tl-xs bg-[#0D111B] border border-[#273244] text-[#9CA3AF] flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-mono text-[#00D4FF]">SkipQ AI is thinking...</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorBanner && (
              <div className="p-3 rounded-2xl bg-[#FB7185]/10 border border-[#FB7185]/30 text-[#FB7185] text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#FB7185]" />
                  <span>{errorBanner}</span>
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  className="px-2 py-1 rounded-lg bg-[#FB7185]/20 hover:bg-[#FB7185]/30 text-[#FB7185] font-bold text-[10px] shrink-0 font-mono transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Controls Bar */}
          <div className="p-3 sm:p-4 bg-[#0D111B] border-t border-[#273244] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center gap-2"
            >
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={user.role === 'staff' ? 'Ask SkipQ AI (orders, queue, items)...' : 'Ask SkipQ AI (track orders, stationery, print)...'}
                rows={1}
                maxLength={1000}
                className="w-full py-2.5 pl-3.5 pr-10 rounded-2xl bg-[#080B12] border border-[#273244] text-xs text-[#F9FAFB] placeholder-[#6B7280] focus:outline-hidden focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/30 resize-none max-h-24 font-medium transition-all"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-[#00D4FF] hover:bg-[#00D4FF]/90 disabled:opacity-40 disabled:hover:bg-[#00D4FF] text-[#080B12] transition-all shadow-[0_2px_10px_rgba(0,212,255,0.2)]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-[#6B7280] px-1 mt-2 font-mono">
              <span>Press Enter to send • Shift+Enter for new line</span>
              <span>Obsidian • Gemini</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
