'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X, Bot, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { isUsageExceeded, incrementUsage, getRemainingCount, getMaxFreeMessages } from '@/lib/chat-usage';
import { WechatGuideOverlay } from './wechat-guide-overlay';

/* ─── 类型 ─── */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  isStreaming?: boolean;
}

/* ─── 推荐指令 ─── */
const SUGGESTED_PROMPTS = [
  { label: '选品分析', text: '帮我分析一下东南亚宠物用品市场趋势' },
  { label: 'Listing优化', text: '帮我优化一个蓝牙耳机的Listing标题' },
  { label: '智能定价', text: '采购价30元的手机壳，Shopee马来站怎么定价？' },
  { label: '运营日报', text: '帮我生成一份今日运营日报' },
];

/* ─── 主组件 ─── */
interface LandingChatWidgetProps {
  open?: boolean;
  onClose?: () => void;
  initialQuery?: string;
  onQueryConsumed?: () => void;
}

export default function LandingChatWidget({ open: externalOpen, onClose: externalOnClose, initialQuery = '', onQueryConsumed }: LandingChatWidgetProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnClose ? (v: boolean) => { if (!v) externalOnClose(); } : setInternalOpen;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWechatGuide, setShowWechatGuide] = useState(false);
  const [remaining, setRemaining] = useState<number>(getMaxFreeMessages());
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(`landing_${Date.now()}`);
  const initialQueryConsumedRef = useRef(false);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // 消费 initialQuery：打开时自动发送预填问题
  useEffect(() => {
    if (open && initialQuery && !initialQueryConsumedRef.current) {
      initialQueryConsumedRef.current = true;
      setTimeout(() => {
        sendMessage(initialQuery);
        onQueryConsumed?.();
      }, 300);
    }
  }, [open, initialQuery]);

  // 发送消息（流式SSE）
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    // 检查使用次数限制
    if (isUsageExceeded()) {
      setShowWechatGuide(true);
      return;
    }

    // 计数 +1 并更新剩余次数
    incrementUsage();
    setRemaining(getRemainingCount());

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
    };

    const assistantId = `asst_${Date.now()}`;
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
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '你好！我是龙掌柜跨境AI助手 🤖\n\n我可以帮你进行选品分析、Listing优化、智能定价、运营数据查询等。试试下面的快捷指令，或者直接输入你的问题！',
      }]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // 是否由外部控制开关（落地页模式）
  const isControlled = externalOpen !== undefined;

  return (
    <>
      {/* ─── 浮窗触发按钮（仅非受控模式显示） ─── */}
      {!isControlled && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed z-50 group flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:scale-105 animate-bounce-subtle"
          style={{ bottom: '1.5rem', right: '1.5rem' }}
          aria-label="打开AI助手"
        >
          <div className="relative">
            <Sparkles size={18} />
            {remaining > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[9px] font-bold text-white">
                {remaining}
              </span>
            )}
          </div>
          <span className="text-sm">和AI助手聊聊</span>
        </button>
      )}

      {/* ─── 聊天面板 ─── */}
      {open && (
        <div className="fixed z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl bg-[#111118] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden relative" style={{ bottom: '1.5rem', right: '1.5rem' }}>
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-gradient-to-r from-violet-600/10 to-purple-600/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">跨境AI助手</div>
                <div className="text-[10px] text-white/30">
                  {remaining > 0 ? `剩余 ${remaining} 次免费对话` : '免费次数已用完'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 transition"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
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
                </div>
              </div>
            ))}
          </div>

          {/* 快捷指令（仅首次对话前显示） */}
          {messages.length <= 1 && (
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
          </div>

          {/* 微信引导弹窗 */}
          {showWechatGuide && (
            <WechatGuideOverlay onClose={() => setShowWechatGuide(false)} />
          )}
        </div>
      )}
    </>
  );
}
