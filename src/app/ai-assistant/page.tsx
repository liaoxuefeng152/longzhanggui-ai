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
  Package,
  Store,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  ShoppingCart,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'action' | 'report' | 'suggestion' | 'daily-report' | 'alerts';
}

interface DailyReport {
  date: string;
  summary: {
    orders: number;
    ordersTrend: number;
    sales: number;
    salesTrend: number;
    visitors: number;
    visitorsTrend: number;
    conversionRate: number;
    conversionTrend: number;
  };
  topProducts: Array<{ id: string; name: string; sales: number; revenue: number }>;
  alerts: Array<{ type: string; product: string; message: string; level: string }>;
}

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  level: string;
  action?: string;
  createdAt: string;
}

export default function AIAssistantPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 快捷指令
  const quickActions = [
    {
      icon: FileText,
      label: '运营日报',
      placeholder: '今天的运营情况怎么样？',
      color: 'bg-blue-500/10 text-blue-500',
      action: 'getDailyReport',
    },
    {
      icon: AlertTriangle,
      label: '异常告警',
      placeholder: '有什么异常需要处理？',
      color: 'bg-red-500/10 text-red-500',
      action: 'getAlerts',
    },
    {
      icon: Lightbulb,
      label: '选品建议',
      placeholder: '帮我推荐几个有潜力的品类',
      color: 'bg-orange-500/10 text-orange-500',
      action: 'selection',
    },
    {
      icon: TrendingUp,
      label: '定价建议',
      placeholder: '给我一些定价优化建议',
      color: 'bg-green-500/10 text-green-500',
      action: 'pricing',
    },
  ];

  // 获取运营日报
  const getDailyReport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assistant/daily-report');
      const data = await response.json();
      setDailyReport(data);
      
      const reportMessage: Message = {
        id: `report-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        type: 'daily-report',
      };
      setMessages(prev => [...prev, reportMessage]);
    } catch (error) {
      toast.error('获取日报失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取异常告警
  const getAlertsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assistant/alerts');
      const data = await response.json();
      setAlerts(data.alerts || []);
      
      const alertMessage: Message = {
        id: `alerts-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        type: 'alerts',
      };
      setMessages(prev => [...prev, alertMessage]);
    } catch (error) {
      toast.error('获取告警失败');
    } finally {
      setIsLoading(false);
    }
  };

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
        content: '您好！我是龙掌柜的智能助理，可以帮您：\n\n📊 运营日报 - 了解今日销售概况\n⚠️ 异常告警 - 发现并处理运营问题\n💡 选品建议 - 发现潜在爆款\n💰 定价建议 - 优化利润空间\n\n有什么可以帮您的？',
        timestamp: new Date().toISOString(),
        type: 'text',
      },
    ]);
  }, [router]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, dailyReport, alerts]);

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
        content: data.response || '抱歉，我暂时无法回答这个问题。',
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI 响应失败:', error);
      toast.error('AI 响应失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 快捷指令点击
  const handleQuickAction = async (action: string, placeholder: string) => {
    setInput(placeholder);
    
    if (action === 'getDailyReport') {
      await getDailyReport();
    } else if (action === 'getAlerts') {
      await getAlertsData();
    } else if (action === 'selection' || action === 'pricing') {
      // 发送消息获取建议
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: placeholder,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/assistant/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: placeholder }),
        });
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          type: 'suggestion',
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        toast.error('获取建议失败');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 清空对话
  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: '您好！我是龙掌柜的智能助理，可以帮您：\n\n📊 运营日报 - 了解今日销售概况\n⚠️ 异常告警 - 发现并处理运营问题\n💡 选品建议 - 发现潜在爆款\n💰 定价建议 - 优化利润空间\n\n有什么可以帮您的？',
        timestamp: new Date().toISOString(),
        type: 'text',
      },
    ]);
    setDailyReport(null);
    setAlerts([]);
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
                    onClick={() => handleQuickAction(action.action, action.placeholder)}
                    disabled={isLoading}
                  >
                    <action.icon className="h-4 w-4 mr-3" />
                    <span className="text-[13px]">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* 今日概览 */}
            {dailyReport && (
              <div>
                <h2 className="text-[14px] font-medium mb-4">今日概览</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-green-500" />
                      <span className="text-[13px]">订单</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[14px] font-medium">{dailyReport.summary.orders}</span>
                      <span className={`text-[11px] ml-1 ${dailyReport.summary.ordersTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {dailyReport.summary.ordersTrend >= 0 ? '+' : ''}{dailyReport.summary.ordersTrend}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="text-[13px]">销售额</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[14px] font-medium">${dailyReport.summary.sales}</span>
                      <span className={`text-[11px] ml-1 ${dailyReport.summary.salesTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {dailyReport.summary.salesTrend >= 0 ? '+' : ''}{dailyReport.summary.salesTrend}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 异常告警 */}
            {alerts.length > 0 && (
              <div>
                <h2 className="text-[14px] font-medium mb-4">异常告警</h2>
                <div className="space-y-2">
                  {alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.level === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                        alert.level === 'warning' ? 'bg-orange-500/10 border-orange-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`h-3 w-3 ${
                          alert.level === 'critical' ? 'text-red-500' :
                          alert.level === 'warning' ? 'text-orange-500' :
                          'text-blue-500'
                        }`} />
                        <span className="text-[12px] font-medium">{alert.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-[14px] font-medium mb-4">使用说明</h2>
              <div className="space-y-2 text-[12px] text-muted-foreground">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">快捷指令</p>
                  <p>点击左侧按钮快速获取日报、告警、建议等信息。</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground mb-1">自然语言</p>
                  <p>输入您的问题，如"今天卖了多少？"或"帮我选品"。</p>
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
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-[14px] font-medium">智能助理</h1>
                <p className="text-[11px] text-muted-foreground">AI驱动的跨境电商运营助手</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-8">
                清空对话
              </Button>
            </div>
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
                  {/* 日报卡片 */}
                  {msg.type === 'daily-report' && dailyReport && (
                    <div className="bg-card rounded-lg border p-4 text-left">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-[14px] font-medium">运营日报</span>
                        <span className="text-[12px] text-muted-foreground">{dailyReport.date}</span>
                      </div>
                      
                      {/* 统计卡片 */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-[11px] text-muted-foreground">订单数</p>
                          <p className="text-[18px] font-semibold">{dailyReport.summary.orders}</p>
                          <p className={`text-[11px] ${dailyReport.summary.ordersTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {dailyReport.summary.ordersTrend >= 0 ? '+' : ''}{dailyReport.summary.ordersTrend}%
                          </p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-[11px] text-muted-foreground">销售额</p>
                          <p className="text-[18px] font-semibold">${dailyReport.summary.sales}</p>
                          <p className={`text-[11px] ${dailyReport.summary.salesTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {dailyReport.summary.salesTrend >= 0 ? '+' : ''}{dailyReport.summary.salesTrend}%
                          </p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-[11px] text-muted-foreground">转化率</p>
                          <p className="text-[18px] font-semibold">{dailyReport.summary.conversionRate}%</p>
                          <p className="text-[11px] text-green-500">+{dailyReport.summary.conversionTrend}%</p>
                        </div>
                      </div>

                      {/* TOP商品 */}
                      <div className="mb-4">
                        <p className="text-[12px] font-medium mb-2">TOP商品</p>
                        <div className="space-y-2">
                          {dailyReport.topProducts.map((product, idx) => (
                            <div key={product.id} className="flex items-center justify-between text-[12px]">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                                  idx === 0 ? 'bg-yellow-500 text-white' :
                                  idx === 1 ? 'bg-gray-400 text-white' :
                                  'bg-orange-400 text-white'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span>{product.name}</span>
                              </div>
                              <span className="text-muted-foreground">{product.sales}单 / ${product.revenue}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 告警 */}
                      {dailyReport.alerts.length > 0 && (
                        <div>
                          <p className="text-[12px] font-medium mb-2">待处理</p>
                          <div className="space-y-1">
                            {dailyReport.alerts.map((alert, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-[12px] text-orange-500">
                                <AlertTriangle className="h-3 w-3" />
                                <span>{alert.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 告警卡片 */}
                  {msg.type === 'alerts' && alerts.length > 0 && (
                    <div className="bg-card rounded-lg border p-4 text-left">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-[14px] font-medium">异常告警</span>
                        <Badge variant="outline" className="text-[10px]">{alerts.length}条</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-lg border ${
                              alert.level === 'critical' ? 'border-red-500/30 bg-red-500/5' :
                              alert.level === 'warning' ? 'border-orange-500/30 bg-orange-500/5' :
                              'border-blue-500/30 bg-blue-500/5'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] ${
                                    alert.level === 'critical' ? 'border-red-500 text-red-500' :
                                    alert.level === 'warning' ? 'border-orange-500 text-orange-500' :
                                    'border-blue-500 text-blue-500'
                                  }`}
                                >
                                  {alert.type}
                                </Badge>
                                <span className="text-[13px] font-medium">{alert.title}</span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {new Date(alert.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-[12px] text-muted-foreground mt-2">{alert.message}</p>
                            {alert.action && (
                              <Button size="sm" variant="ghost" className="mt-2 h-7 text-[11px]">
                                {alert.action}
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 普通文本消息 */}
                  {msg.type !== 'daily-report' && msg.type !== 'alerts' && (
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      <div className="text-[14px] whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  )}
                  
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
