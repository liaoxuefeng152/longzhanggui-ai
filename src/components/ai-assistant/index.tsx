'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  X, 
  Bot, 
  User, 
  Sparkles,
  ShoppingCart,
  Image,
  TrendingUp,
  Package,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  GripHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

// Intent types
type IntentType = 
  | 'product_selection'
  | 'image_design'
  | 'listing_optimize'
  | 'ad_creation'
  | 'customer_service'
  | 'data_analysis'
  | 'price_calculate'
  | 'order_query'
  | 'inventory_check'
  | 'general_chat'
  | 'help';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: IntentType;
  timestamp: Date;
  isStreaming?: boolean;
}

// Intent recognition
const recognizeIntent = (text: string): IntentType => {
  const lowerText = text.toLowerCase();
  
  if (/选品|选个|选那|哪款|哪类|产品推荐|爆款|热门|热卖|趋势/.test(lowerText)) {
    return 'product_selection';
  }
  if (/图片|图片设计|主图|主图优化|图片处理|翻译|抠图|白底|去背景|背景/.test(lowerText)) {
    return 'image_design';
  }
  if (/listing|标题|描述|关键词|五点|优化|文案/.test(lowerText)) {
    return 'listing_optimize';
  }
  if (/广告|投放|推广|campaign|roi|ctr|cpc|预算/.test(lowerText)) {
    return 'ad_creation';
  }
  if (/客服|回复|消息|差评|纠纷|退款|退货|评价/.test(lowerText)) {
    return 'customer_service';
  }
  if (/数据|报表|分析|日报|周报|复盘|统计|汇总/.test(lowerText)) {
    return 'data_analysis';
  }
  if (/定价|价格|利润|成本|利润计算|售价|多少钱/.test(lowerText)) {
    return 'price_calculate';
  }
  if (/订单|订单查询|发货|物流|追踪|签收/.test(lowerText)) {
    return 'order_query';
  }
  if (/库存|盘点|库存预警|补货|采购/.test(lowerText)) {
    return 'inventory_check';
  }
  if (/帮助|help|怎么用|如何使用|功能|命令/.test(lowerText)) {
    return 'help';
  }
  return 'general_chat';
};

// Intent labels
const intentLabels: Record<IntentType, string> = {
  product_selection: '选品分析',
  image_design: '图片设计',
  listing_optimize: 'Listing优化',
  ad_creation: '广告投放',
  customer_service: '客服',
  data_analysis: '数据分析',
  price_calculate: '定价计算',
  order_query: '订单查询',
  inventory_check: '库存查询',
  general_chat: '闲聊',
  help: '帮助'
};

const intentIcons: Record<IntentType, React.ReactNode> = {
  product_selection: <TrendingUp className="h-3 w-3" />,
  image_design: <Image className="h-3 w-3" />,
  listing_optimize: <Sparkles className="h-3 w-3" />,
  ad_creation: <TrendingUp className="h-3 w-3" />,
  customer_service: <MessageSquare className="h-3 w-3" />,
  data_analysis: <TrendingUp className="h-3 w-3" />,
  price_calculate: <Sparkles className="h-3 w-3" />,
  order_query: <Package className="h-3 w-3" />,
  inventory_check: <Package className="h-3 w-3" />,
  general_chat: <MessageSquare className="h-3 w-3" />,
  help: <HelpCircle className="h-3 w-3" />
};

interface AIAssistantProps {
  onNavigate?: (path: string) => void;
}

export default function AIAssistant({ onNavigate }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // 拖拽状态 - 使用百分比位置
  const [isDragging, setIsDragging] = useState(false);
  const [isMoved, setIsMoved] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);

  // 拖拽开始
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
    };
  }, []);

  // 拖拽中
  useEffect(() => {
    if (!isDragging || !dragRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      
      // 计算相对偏移
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      // 获取元素当前位置
      const element = document.getElementById('ai-assistant-float');
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      let newRight = window.innerWidth - rect.right - deltaX;
      let newBottom = window.innerHeight - rect.bottom - deltaY;
      
      // 限制范围
      newRight = Math.max(24, Math.min(window.innerWidth - rect.width - 24, newRight));
      newBottom = Math.max(24, Math.min(window.innerHeight - rect.height - 24, newBottom));
      
      element.style.right = `${newRight}px`;
      element.style.bottom = `${newBottom}px`;
      element.style.left = 'auto';
      element.style.top = 'auto';
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsMoved(true);
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Listen for external toggle events
  React.useEffect(() => {
    const handleToggle = () => setIsOpen(true);
    window.addEventListener('toggle-ai-assistant', handleToggle);
    return () => window.removeEventListener('toggle-ai-assistant', handleToggle);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const intent = recognizeIntent(userMessage.content);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      intent,
      timestamp: new Date(),
      isStreaming: true
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // 调用后端AI接口（scene='agent' 会调用云端跨境智能体）
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          // 所有智能体场景都使用 'agent'，触发云端跨境AI运营智能体
          scene: 'agent',
          stream: true,
        }),
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          
          // 解析SSE格式数据
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: fullContent, isStreaming: false }
                      : msg
                  ));
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
        
        if (!fullContent) {
          fullContent = '抱歉，我暂时无法回答这个问题。请稍后再试。';
        }
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullContent, isStreaming: false }
            : msg
        ));
      } else {
        const data = await response.json();
        fullContent = data.content || '抱歉，我暂时无法回答这个问题。请稍后再试。';
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullContent, isStreaming: false }
            : msg
        ));
      }
    } catch (error) {
      console.error('AI chat failed:', error);
      
      // 检查是否是登录问题
      const token = localStorage.getItem('token');
      const errorMessage = !token 
        ? '请先登录后再使用AI助手功能。\n\n点击右上角登录按钮进行登录。'
        : 'AI服务暂时不可用，请稍后重试。\n\n如果问题持续，请尝试重新登录。';
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: errorMessage, isStreaming: false }
          : msg
      ));
    }

    setIsLoading(false);
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div 
        id="ai-assistant-float"
        className={`fixed z-50 flex items-center gap-3 ${isDragging ? '' : 'transition-all duration-300'} ${isMoved ? '' : 'right-6 bottom-6'}`}
      >
        {/* 拖拽手柄 */}
        <div 
          className="cursor-move p-1 hover:bg-slate-100 rounded-lg transition-colors"
          onMouseDown={handleDragStart}
        >
          <GripHorizontal className="h-5 w-5 text-slate-400" />
        </div>
        {/* 文字提示 */}
        <div className="bg-white text-slate-700 text-sm px-4 py-2.5 rounded-xl shadow-lg border border-slate-100 whitespace-nowrap">
          <span className="font-medium">试试龙掌柜跨境AI全能助手</span>
          <span className="text-slate-400 ml-2">点击咨询</span>
        </div>
        {/* 悬浮按钮 */}
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 relative shrink-0"
          size="icon"
        >
          <MessageSquare className="h-6 w-6 text-white" />
          {/* 在线状态指示 */}
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-background border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf" 
            alt="AI助手" 
            className="h-10 w-10 rounded-full bg-white/20 object-cover"
          />
          <div>
            <h3 className="font-semibold">龙掌柜AI助手</h3>
            <p className="text-xs text-white/80">智能运营助理</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.intent && message.role === 'assistant' && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs gap-1">
                        {intentIcons[message.intent]}
                        {intentLabels[message.intent]}
                      </Badge>
                    </div>
                  )}
                  
                  <div className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf" 
                        alt="AI助手" 
                        className="h-8 w-8 rounded-full shrink-0"
                      />
                    )}
                    
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-muted'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block h-4 w-2 bg-blue-500 ml-1 animate-pulse" />
                        )}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-purple-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf" 
                    alt="AI助手" 
                    className="h-8 w-8 rounded-full shrink-0"
                  />
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4 shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="输入您的需求，如：帮我选3款宠物用品"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Quick actions */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={() => setInput('帮我选品分析')}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                选品
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={() => setInput('翻译图片')}
              >
                <Image className="h-3 w-3 mr-1" />
                图片
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={() => setInput('生成今日日报')}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                日报
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={() => setInput('查看库存预警')}
              >
                <Package className="h-3 w-3 mr-1" />
                库存
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
