'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: '您好！我是龙掌柜AI助手。有什么可以帮您的？\n\n您可以问我：\n• 今天的运营情况怎么样？\n• 帮我分析一下这个新品要不要上？\n• 帮我写一个催好评的消息\n• 生成今日日报' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response || '抱歉，我现在无法回答您的问题。' }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: '抱歉，发生了错误，请稍后再试。' }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '抱歉，网络连接失败，请检查网络后重试。' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      
      {/* 对话框 */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-[500px] max-h-[70vh] flex flex-col mx-4">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-[#E5E6EB] flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#165DFF] to-[#4080FF] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[#1D2129]">AI助手</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded hover:bg-[#F2F3F5] transition-colors"
          >
            <X className="w-5 h-5 text-[#86909C]" />
          </button>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#165DFF] to-[#4080FF] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[#165DFF] text-white'
                    : 'bg-[#F2F3F5] text-[#1D2129]'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#00B42A] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">我</span>
                </div>
              )}
            </div>
          ))}
          {isChatLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#165DFF] to-[#4080FF] flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-[#F2F3F5] rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#86909C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#86909C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#86909C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* 输入框 */}
        <div className="p-4 border-t border-[#E5E6EB]">
          <div className="flex gap-2">
            <Input
              placeholder="输入您的问题..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isChatLoading}
              className="flex-1"
            />
            <Button
              className="btn-primary"
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isChatLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
