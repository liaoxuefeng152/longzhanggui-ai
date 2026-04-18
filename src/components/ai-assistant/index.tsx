'use client';

import React, { useState } from 'react';
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
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          intent
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
          fullContent += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullContent, isStreaming: false }
              : msg
          ));
        }
      } else {
        const data = await response.json();
        fullContent = data.content || 'Sorry, I cannot answer your question right now. Please try again later.';
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: fullContent, isStreaming: false }
            : msg
        ));
      }
    } catch (error) {
      console.error('AI chat failed:', error);
      const mockResponses: Record<IntentType, string> = {
        product_selection: 'Good! I can help you with product selection. I will analyze market trends and competitors to recommend the best products.',
        image_design: 'I can help you process images. I support image translation, background removal, and image optimization.',
        listing_optimize: 'I can help you optimize your listing. I will generate titles, descriptions, and keywords to improve your product visibility.',
        ad_creation: 'I can help you create ad campaigns. I will set up budgets, targeting, and ad creatives.',
        customer_service: 'I can help you with customer service. I can generate reply templates and handle disputes.',
        data_analysis: 'I can help you analyze sales data. I will generate daily reports and identify trends.',
        price_calculate: 'I can help you calculate optimal pricing. I will consider costs, logistics, and competitor prices.',
        order_query: 'I can help you query orders. Please provide the order number or date range.',
        inventory_check: 'I can help you check inventory. I will identify low stock items and suggest restocking.',
        general_chat: 'Hello! I am your AI assistant. How can I help you today?',
        help: 'I can help you with:\n- Product selection and analysis\n- Image processing and translation\n- Listing optimization\n- Ad campaign management\n- Customer service\n- Data analysis\n- Order and inventory management\n\nPlease describe your needs in natural language!'
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: mockResponses[intent], isStreaming: false }
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
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 z-50"
        size="icon"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[420px] h-[600px] bg-background border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6" />
          </div>
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
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-blue-500" />
                      </div>
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
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-blue-500" />
                  </div>
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
