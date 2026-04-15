'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Package,
  Store,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'action' | 'report' | 'suggestion';
}

export default function AIAssistantPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 快捷指令
  const quickActions = [
    {
      icon: Package,
      label: '帮我选品',
      placeholder: '我想做宠物用品，目标市场东南亚',
      color: 'bg-orange-500/10 text-orange-500',
    },
    {
      icon: Store,
      label: '上架商品',
      placeholder: '帮我把商品A上架到TikTok',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      icon: TrendingUp,
      label: '数据分析',
      placeholder: '分析一下本周的运营情况',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: Lightbulb,
      label: '优化Listing',
      placeholder: '帮我优化这个商品的标题和描述',
      color: 'bg-purple-500/10 text-purple-500',
    },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    // 欢迎消息
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '您好！我是龙掌柜的智能助理，可以帮您：\n\n• 智能选品：分析市场趋势，找到爆款\n• Listing优化：生成标题、描述、关键词\n• 数据分析：诊断问题，提供建议\n• 商品上架：一键发布到多个平台\n\n有什么可以帮您的？',
        timestamp: new Date().toISOString(),
        type: 'text',
      },
    ]);
  }, [router]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 调用 AI 接口
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || data.content || '抱歉，我暂时无法回答这个问题。',
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI 响应失败:', error);
      
      // 模拟 AI 响应
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponses = [
        {
          content: '好的，我来帮您处理。\n\n根据您的需求，我建议：\n1. 先进行市场调研\n2. 分析竞品数据\n3. 制定定价策略\n\n需要我帮您执行哪个步骤？',
          type: 'text',
        },
        {
          content: '分析完成！\n\n📊 数据概览：\n• 本周订单：156单\n• 销售额：$4,280\n• 利润率：22%\n\n⚠️ 异常提醒：\n• 商品A库存不足（剩余5件）\n• 商品B广告ROI下降15%\n\n需要我帮您处理吗？',
          type: 'report',
        },
        {
          content: '已完成 Listing 优化！\n\n✅ 英文标题已生成\n✅ 五点描述已生成\n✅ 关键词已提取\n\n建议售价：$24.99\n预计利润率：25%\n\n需要我帮您上架吗？',
          type: 'action',
        },
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: randomResponse.content,
        timestamp: new Date().toISOString(),
        type: randomResponse.type as any,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 快捷指令点击
  const handleQuickAction = (placeholder: string) => {
    setInput(placeholder);
  };

  // 清空对话
  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '您好！我是龙掌柜的智能助理，可以帮您：\n\n• 智能选品：分析市场趋势，找到爆款\n• Listing优化：生成标题、描述、关键词\n• 数据分析：诊断问题，提供建议\n• 商品上架：一键发布到多个平台\n\n有什么可以帮您的？',
        timestamp: new Date().toISOString(),
        type: 'text',
      },
    ]);
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="flex h-[calc(100vh-60px)]">
        {/* 左侧 - 快捷指令 */}
        <div className="w-80 border-r bg-muted/20 p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-[14px] font-medium mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                快捷指令
              </h2>
              <div className="space-y-2">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className={`w-full justify-start h-auto py-3 ${action.color}`}
                    onClick={() => handleQuickAction(action.placeholder)}
                  >
                    <action.icon className="h-4 w-4 mr-3" />
                    <span className="text-[13px]">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[14px] font-medium mb-4">常见问题</h2>
              <div className="space-y-2 text-[12px] text-muted-foreground">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">如何选品？</p>
                  <p>告诉我要做的类目和市场，AI会分析竞品并给出建议。</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">如何上架商品？</p>
                  <p>发送"帮我上架商品"，AI会引导你完成整个流程。</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">如何优化Listing？</p>
                  <p>提供商品信息，AI会生成优化的标题、描述和关键词。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧 - 对话区域 */}
        <div className="flex-1 flex flex-col">
          {/* 头部 */}
          <div className="h-14 border-b px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-[14px] font-medium">智能助理</h1>
                <p className="text-[11px] text-muted-foreground">AI驱动的跨境电商运营助手</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              清空对话
            </Button>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* 头像 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-primary/10' 
                    : 'bg-primary'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* 消息内容 */}
                <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                  }`}>
                    <div className="text-[14px] whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {/* 加载中 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI 思考中...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="border-t p-4">
            <div className="flex gap-3">
              <Input
                placeholder="输入您的问题..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 text-center">
              AI 辅助决策，最终决定权在您手中
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
