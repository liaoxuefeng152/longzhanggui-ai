'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Sparkles, Send, X, Loader2, ChevronRight, MessageCircle, Lock } from 'lucide-react';

const MAX_FREE_MESSAGES = 10;
const STORAGE_KEY = 'longzg_ai_usage';

function getUsage(): { count: number; resetDate: string } {
  if (typeof window === 'undefined') return { count: 0, resetDate: '' };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { count: 0, resetDate: '' };
}

function setUsage(count: number) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, resetDate: today }));
}

function getRemaining(): number {
  const usage = getUsage();
  // 每月重置
  const today = new Date().toISOString().slice(0, 10);
  if (usage.resetDate && usage.resetDate.slice(0, 7) !== today.slice(0, 7)) {
    setUsage(0);
    return MAX_FREE_MESSAGES;
  }
  return Math.max(0, MAX_FREE_MESSAGES - usage.count);
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  isStreaming?: boolean;
}

interface LandingChatWidgetProps {
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialQuery?: string;
  onQueryConsumed?: () => void;
}

const SUGGESTED_PROMPTS = [
  { label: '帮我选品', text: '帮我分析一下宠物用品的市场趋势' },
  { label: '优化Listing', text: '帮我优化一个TikTok商品标题' },
  { label: '运营日报', text: '生成今日运营日报' },
  { label: '智能定价', text: '帮我计算一款商品的最优售价' },
];

export default function LandingChatWidget({ externalOpen, onOpenChange, initialQuery, onQueryConsumed }: LandingChatWidgetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (v: boolean) => {
    setInternalOpen(v);
    onOpenChange?.(v);
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState(MAX_FREE_MESSAGES);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const initialQueryConsumed = useRef(false);

  // 初始化时读取剩余次数
  useEffect(() => {
    setRemaining(getRemaining());
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // 处理外部传入的初始查询
  useEffect(() => {
    if (open && initialQuery && !initialQueryConsumed.current) {
      initialQueryConsumed.current = true;
      setTimeout(() => {
        sendMessage(initialQuery);
        onQueryConsumed?.();
      }, 300);
    }
  }, [open, initialQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    // 检查次数限制
    const left = getRemaining();
    if (left <= 0) {
      const limitMsg: Message = {
        id: `limit_${Date.now()}`,
        role: 'assistant',
        content: '',
        isStreaming: false,
      };
      setMessages(prev => [
        ...prev,
        { id: `user_${Date.now()}`, role: 'user', content: text.trim() },
        limitMsg,
      ]);
      setInput('');
      return;
    }

    const userId = `user_${Date.now()}`;
    const assistantId = `asst_${Date.now()}`;
    const userMsg: Message = { id: userId, role: 'user', content: text.trim() };
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/ai/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          session_id: sessionIdRef.current,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'intent') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, intent: data.label } : m
                )
              );
            } else if (data.type === 'content') {
              fullContent += data.content;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: fullContent, isStreaming: true }
                    : m
                )
              );
            } else if (data.type === 'done') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: data.fullResponse || fullContent, isStreaming: false }
                    : m
                )
              );
              // 消耗次数
              const currentUsage = getUsage();
              const newCount = currentUsage.count + 1;
              setUsage(newCount);
              setRemaining(Math.max(0, MAX_FREE_MESSAGES - newCount));
            } else if (data.type === 'error') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: data.message || 'AI服务暂时不可用，请稍后重试', isStreaming: false }
                    : m
                )
              );
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: '网络异常，请稍后重试', isStreaming: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // 初始欢迎消息
  useEffect(() => {
    if (open && messages.length === 0) {
      const left = getRemaining();
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `你好！我是龙掌柜跨境AI助手 🤖\n\n我可以帮你进行选品分析、Listing优化、智能定价、运营数据查询等。试试下面的快捷指令，或者直接输入你的问题！`,
      }]);
      setRemaining(left);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // 是否由外部控制开关（落地页模式）
  const isControlled = externalOpen !== undefined;
  const isLimitReached = remaining <= 0 && messages.some(m => m.id.startsWith('limit_'));

  // 联系我们链接
  const contactUrl = 'https://liaoxuefeng152.github.io/contact.html';

  return (
    <>
      {/* ─── 浮窗触发按钮（仅非受控模式显示） ─── */}
      {!isControlled && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 animate-bounce-subtle"
          aria-label="打开AI助手"
        >
          <Sparkles size={18} />
          <span className="text-sm">和AI助手聊聊</span>
        </button>
      )}

      {/* ─── 聊天面板 ─── */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl bg-[#111118] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-gradient-to-r from-violet-600/10 to-purple-600/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">跨境AI助手</div>
                <div className="text-[10px] text-white/30">龙掌柜智能运营</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 剩余次数指示 */}
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                remaining <= 0
                  ? 'bg-red-500/20 text-red-400'
                  : remaining <= 3
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-white/5 text-white/40'
              }`}>
                {remaining <= 0 ? (
                  <Lock size={9} />
                ) : (
                  <Sparkles size={9} />
                )}
                {remaining <= 0 ? '已用完' : `${remaining}/${MAX_FREE_MESSAGES}`}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 transition"
                aria-label="关闭"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* 消息列表 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Bot size={11} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                  {msg.intent && (
                    <div className="text-[10px] text-violet-400/70 mb-1 flex items-center gap-1">
                      <Sparkles size={9} /> {msg.intent}
                    </div>
                  )}
                  {/* 次数用完的特殊消息 */}
                  {msg.id.startsWith('limit_') ? (
                    <div className="px-4 py-3.5 rounded-2xl rounded-tl-md bg-gradient-to-br from-violet-500/10 to-purple-500/5 border border-violet-500/20">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Lock size={14} className="text-orange-400" />
                        <span className="text-sm font-medium text-orange-400">免费体验次数已用完</span>
                      </div>
                      <p className="text-[12px] text-white/50 leading-relaxed mb-3">
                        您已使用完 {MAX_FREE_MESSAGES} 次免费体验额度。联系我们可以获取完整使用权限，解锁全部AI智能体能力。
                      </p>
                      <a
                        href={contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium hover:from-violet-400 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20"
                      >
                        <MessageCircle size={12} />
                        联系我们获取完整权限
                      </a>
                    </div>
                  ) : (
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-violet-500/20 text-violet-200 rounded-tr-md'
                          : 'bg-white/[0.04] text-white/75 rounded-tl-md border border-white/5'
                      }`}
                    >
                      {msg.content || (
                        <span className="flex items-center gap-1.5 text-white/40">
                          <Loader2 size={12} className="animate-spin" /> 思考中...
                        </span>
                      )}
                      {msg.isStreaming && msg.content && (
                        <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 快捷指令（仅首次对话前且还有次数时显示） */}
          {messages.length <= 1 && remaining > 0 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p.text)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-white/50 hover:text-white/80 hover:border-white/10 hover:bg-white/[0.06] transition-all group"
                  >
                    <ChevronRight size={10} className="text-violet-400/50 group-hover:text-violet-400" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入区 */}
          <div className="px-4 py-3 border-t border-white/5">
            {remaining <= 0 ? (
              /* 次数用完 - 显示锁定状态 */
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-[12px] text-white/30">
                  <Lock size={12} />
                  <span>体验次数已用完</span>
                </div>
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-medium transition"
                >
                  联系我们 →
                </a>
              </div>
            ) : (
              /* 正常输入 */
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5 focus-within:border-violet-500/30 transition">
                <MessageCircle size={14} className="text-white/20 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题..."
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-7 h-7 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center shrink-0 disabled:opacity-30 hover:opacity-90 transition"
                  aria-label="发送"
                >
                  <Send size={12} className="text-white" />
                </button>
              </div>
            )}
            {/* 次数提示条 */}
            {remaining > 0 && remaining <= 5 && (
              <div className="mt-1.5 text-center text-[10px] text-orange-400/60">
                剩余 {remaining} 次免费体验 · 用完可联系我们获取完整权限
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
