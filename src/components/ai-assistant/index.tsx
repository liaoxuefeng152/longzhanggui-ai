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
  Maximize2,
  Minimize2,
  Video,
  ImageIcon,
  Download,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

// Intent types
type IntentType = 
  | 'product_selection'
  | 'image_design'
  | 'image_generation'
  | 'video_generation'
  | 'listing_optimize'
  | 'ad_creation'
  | 'customer_service'
  | 'data_analysis'
  | 'price_calculate'
  | 'order_query'
  | 'inventory_check'
  | 'general_chat'
  | 'help';

interface GeneratedContent {
  type: 'image' | 'video';
  urls: string[];
  isLoading?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: IntentType;
  timestamp: Date;
  isStreaming?: boolean;
  generatedContent?: GeneratedContent;
}

// Intent recognition
const recognizeIntent = (text: string): IntentType => {
  const lowerText = text.toLowerCase();
  
  // 图片生成（优先级最高）
  if (/生成图片|生成一张|画一张|创作.*图|设计.*图|帮我画|制作图片|ai.*图|生图|画个|绘制/.test(lowerText)) {
    return 'image_generation';
  }
  // 视频生成
  if (/生成视频|制作视频|创作.*视频|生成.*视频|视频.*生成|ai.*视频|生视频|做视频|制作.*短片/.test(lowerText)) {
    return 'video_generation';
  }
  // 选品相关（优先级最高，避免被"预算"等关键词干扰）
  if (/选品|选\d+款|选个|选那|哪款|哪类|产品推荐|爆款|热门|热卖|趋势|帮我选|推荐产品|选产品/.test(lowerText)) {
    return 'product_selection';
  }
  if (/图片|图片设计|主图|主图优化|图片处理|翻译|抠图|白底|去背景|背景/.test(lowerText)) {
    return 'image_design';
  }
  if (/listing|标题|描述|关键词|五点|优化|文案/.test(lowerText)) {
    return 'listing_optimize';
  }
  // 广告投放（排除"预算"在选品场景下的干扰）
  if (/广告|投放|推广|campaign|roi|ctr|cpc/.test(lowerText) && !/选品|选\d+款|产品/.test(lowerText)) {
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
  image_generation: '图片生成',
  video_generation: '视频生成',
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
  image_generation: <ImageIcon className="h-3 w-3" />,
  video_generation: <Video className="h-3 w-3" />,
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
  const [isExpanded, setIsExpanded] = useState(false); // 放大状态
  
  // 拖拽状态 - 使用百分比位置
  const [isDragging, setIsDragging] = useState(false);
  const [isMoved, setIsMoved] = useState(false);
  const [position, setPosition] = useState({ right: 24, bottom: 24 });
  const dragRef = useRef<{ startX: number; startY: number; startRight: number; startBottom: number } | null>(null);

  // 拖拽开始
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: position.right,
      startBottom: position.bottom,
    };
  }, [position]);

  // 拖拽中
  useEffect(() => {
    if (!isDragging || !dragRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      
      // 计算相对偏移
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      
      // 计算新位置
      let newRight = dragRef.current.startRight - deltaX;
      let newBottom = dragRef.current.startBottom - deltaY;
      
      // 限制范围
      const maxRight = window.innerWidth - 420 - 24; // 默认宽度420
      const maxBottom = window.innerHeight - 600 - 24; // 默认高度600
      
      newRight = Math.max(24, Math.min(maxRight, newRight));
      newBottom = Math.max(24, Math.min(maxBottom, newBottom));
      
      setPosition({ right: newRight, bottom: newBottom });
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
      // 检查是否已登录
      const token = localStorage.getItem('token');
      if (!token) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: '请先登录后再使用AI助手功能。\n\n请点击右上角登录按钮进行登录。', isStreaming: false }
            : msg
        ));
        setIsLoading(false);
        return;
      }

      // 处理图片生成意图
      if (intent === 'image_generation') {
        await handleImageGeneration(userMessage.content, assistantMessageId, token);
        return;
      }

      // 处理视频生成意图
      if (intent === 'video_generation') {
        await handleVideoGeneration(userMessage.content, assistantMessageId, token);
        return;
      }

      // 使用流式API
      const response = await fetch('/api/v1/ai/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: 'default',
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('登录已过期，请重新登录');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `请求失败 (${response.status})`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'intent') {
                // 更新意图
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, intent: data.intent as IntentType }
                    : msg
                ));
              } else if (data.type === 'content') {
                // 追加内容
                fullContent += data.content;
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent }
                    : msg
                ));
              } else if (data.type === 'done') {
                // 完成
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, content: fullContent, isStreaming: false }
                    : msg
                ));
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
              // 忽略JSON解析错误
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

    } catch (error) {
      console.error('AI chat failed:', error);
      
      // 根据错误类型提供更具体的提示
      let errorMessage = 'AI服务暂时不可用，请稍后重试。';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '请求超时，请检查网络连接后重试。';
        } else if (error.message.includes('过期') || error.message.includes('401')) {
          errorMessage = '登录已过期，请重新登录后再试。\n\n点击右上角头像，选择"退出登录"后重新登录。';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = '网络连接失败，请检查网络后重试。';
        } else {
          errorMessage = `请求失败：${error.message}\n\n如果问题持续，请尝试刷新页面或重新登录。`;
        }
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: errorMessage, isStreaming: false }
          : msg
      ));
    }

    setIsLoading(false);
  };

  // 处理图片生成
  const handleImageGeneration = async (prompt: string, messageId: string, token: string) => {
    try {
      // 更新状态为生成中
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              content: '🎨 正在为您生成图片，请稍候...',
              generatedContent: { type: 'image', urls: [], isLoading: true }
            }
          : msg
      ));

      const response = await fetch('/api/v1/tools/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, size: '2K' }),
      });

      const data = await response.json();

      if (data.success && data.imageUrls?.length > 0) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                content: `✨ 图片已生成！共 ${data.imageUrls.length} 张`,
                isStreaming: false,
                generatedContent: { type: 'image', urls: data.imageUrls, isLoading: false }
              }
            : msg
        ));
      } else {
        throw new Error(data.error || '图片生成失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '图片生成失败';
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: `❌ ${errorMessage}`, isStreaming: false }
          : msg
      ));
    }
    setIsLoading(false);
  };

  // 处理视频生成
  const handleVideoGeneration = async (prompt: string, messageId: string, token: string) => {
    try {
      // 更新状态为生成中
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              content: '🎬 正在为您生成视频，这可能需要1-2分钟，请耐心等待...',
              generatedContent: { type: 'video', urls: [], isLoading: true }
            }
          : msg
      ));

      const response = await fetch('/api/v1/tools/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, duration: 5, resolution: '720p' }),
      });

      const data = await response.json();

      if (data.success && data.videoUrl) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                content: `✨ 视频已生成！时长 ${data.duration || 5} 秒`,
                isStreaming: false,
                generatedContent: { type: 'video', urls: [data.videoUrl], isLoading: false }
              }
            : msg
        ));
      } else {
        throw new Error(data.error || '视频生成失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '视频生成失败';
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: `❌ ${errorMessage}`, isStreaming: false }
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
        className={`fixed z-50 flex items-center gap-3 cursor-move select-none ${isDragging ? '' : 'transition-all duration-300'}`}
        style={{ 
          right: position.right, 
          bottom: position.bottom 
        }}
        onMouseDown={handleDragStart}
      >
        {/* 文字提示 */}
        <div className="bg-white text-slate-700 text-sm px-4 py-2.5 rounded-xl shadow-lg border border-slate-100 whitespace-nowrap">
          <span className="font-medium">试试龙掌柜跨境AI全能助手</span>
          <span className="text-slate-400 ml-2">点击咨询</span>
        </div>
        {/* 悬浮按钮 */}
        <Button
          onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
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
    <div 
      className={`fixed z-50 flex flex-col overflow-hidden transition-all duration-300 bg-background border rounded-2xl shadow-2xl ${
        isDragging ? '' : 'transition-all duration-300'
      }`}
      style={{ 
        right: position.right, 
        bottom: position.bottom,
        width: isExpanded ? '800px' : '420px',
        height: isExpanded ? '700px' : '600px',
      }}
    >
      {/* Header - 整个头部作为拖拽区域 */}
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between shrink-0 cursor-move select-none rounded-t-2xl"
        onMouseDown={handleDragStart}
        onDoubleClick={() => setIsExpanded(!isExpanded)}
      >
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
          {/* 拖拽提示 */}
          <span className="text-xs text-white/60 mr-2">拖动移动</span>
          {/* 放大/缩小按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            title={isExpanded ? '缩小窗口' : '放大窗口'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
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
                      
                      {/* 显示生成的图片 */}
                      {message.generatedContent?.type === 'image' && message.generatedContent.urls.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {message.generatedContent.urls.map((url, idx) => (
                              <div key={idx} className="relative group">
                                <img 
                                  src={url} 
                                  alt={`生成的图片 ${idx + 1}`}
                                  className="rounded-lg w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(url, '_blank')}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <ExternalLink className="h-5 w-5 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                message.generatedContent?.urls.forEach((url, idx) => {
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `image-${idx + 1}.png`;
                                  a.target = '_blank';
                                  a.click();
                                });
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              下载全部
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* 显示生成的视频 */}
                      {message.generatedContent?.type === 'video' && message.generatedContent.urls.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <video 
                            src={message.generatedContent.urls[0]}
                            controls
                            className="rounded-lg w-full h-auto"
                            style={{ maxHeight: '300px' }}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = message.generatedContent?.urls[0] || '';
                                a.download = 'video.mp4';
                                a.target = '_blank';
                                a.click();
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              下载视频
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => window.open(message.generatedContent?.urls[0], '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              新窗口打开
                            </Button>
                          </div>
                        </div>
                      )}
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
                onClick={() => setInput('生成一张产品主图')}
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                生图
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs shrink-0"
                onClick={() => setInput('生成一个产品展示视频')}
              >
                <Video className="h-3 w-3 mr-1" />
                生视频
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
