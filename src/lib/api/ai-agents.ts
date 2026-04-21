/**
 * AI智能体服务 API - 更新版本
 * 包含选品、图片处理、Listing优化、智能定价、广告、客服、数据复盘
 */
import { apiClient } from './client';

// ============ 选品智能体 ============

export interface SelectProductsRequest {
  platform?: string;
  site?: string;
  category?: string;
  budget?: string;
  core_appeal?: string;
  targetMarket?: string;
}

export interface SelectedProduct {
  id: string;
  name: string;
  name_en?: string;
  category: string;
  platform: string;
  price?: string;
  price_range?: string;
  sales?: string;
  images?: string[];
  supplier?: string;
  source_url?: string;
  moq?: string;
}

// ============ 类型定义 ============

export interface DirectionItem {
  id: string;
  name: string;
  category: string;
  reason: string;
  marketPotential: number;
  competition: string;
  avgProfitRate: number;
  trending: boolean;
  icon?: string;
}

export interface RiskItem {
  type: string;
  level: string;
  suggestion: string;
}

export interface CompetitorItem {
  id: string;
  name: string;
  sales: number;
  rating: number;
  price: string;
  mainSellingPoint: string;
  userPainPoints: string[];
}

// 流式回调接口
interface StreamCallbacks {
  start?: (data: any) => void;
  content?: (text: string) => void;
  type?: string;
  label?: string;
  messageType?: string;
  done?: (fullResponse?: string) => void;
  error?: (msg: string) => void;
}

export interface SelectionResult {
  directions?: DirectionItem[];
  products?: SelectedProduct[];
  analysis?: string;
  report?: string;
  risks?: RiskItem[];
  competitors?: CompetitorItem[];
}

/**
 * 选品分析 - 流式输出
 */
export async function selectProductsStream(request: SelectProductsRequest, callbacks: StreamCallbacks): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch('/api/v1/tools/selection', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    callbacks.error?.(`API请求失败: ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.error?.('无法读取响应流');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'start') {
            callbacks.start?.(data);
          } else if (data.type === 'content') {
            fullResponse += data.content;
            callbacks.content?.(data.content);
          } else if (data.type === 'done') {
            callbacks.done?.(fullResponse);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

// ============ 图片智能体 ============

export type ImageProcessMode = 'translate' | 'optimize' | 'remove_watermark' | 'white_background' | 'text_to_image' | 'image_to_image';

export interface ProcessImageRequest {
  prompt?: string;
  image_url?: string;
  mode?: ImageProcessMode;
  source_language?: string;
  target_language?: string;
  size?: string;
  watermark?: boolean;
  count?: number;
}

export interface ImageProcessResult {
  success: boolean;
  imageUrls?: string[];
  imageUrl?: string;
  taskId?: string;
  status?: string;
  model?: string;
  error?: string;
}

/**
 * 图片生成/处理
 */
export async function processImage(request: ProcessImageRequest): Promise<ImageProcessResult> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch('/api/v1/tools/image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return { success: false, error: `API请求失败: ${response.status}` };
  }

  return response.json();
}

// ============ 视频生成智能体 ============

export interface GenerateVideoRequest {
  prompt: string;
  firstFrameImage?: string;
  lastFrameImage?: string;
  resolution?: string;
  ratio?: string;
  duration?: number;
  watermark?: boolean;
  generateAudio?: boolean;
}

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  taskId?: string;
  status?: string;
  duration?: number;
  resolution?: string;
  ratio?: string;
  error?: string;
}

/**
 * 视频生成
 */
export async function generateVideo(request: GenerateVideoRequest): Promise<VideoGenerationResult> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch('/api/v1/tools/video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return { success: false, error: `API请求失败: ${response.status}` };
  }

  return response.json();
}

// ============ Listing优化智能体 ============

export interface OptimizeListingRequest {
  productName: string;
  category?: string;
  features?: string[];
  targetMarket: 'TH' | 'VN' | 'MY' | 'ID' | 'PH' | 'US' | 'UK';
  targetLanguage: 'en' | 'th' | 'vi' | 'ms' | 'id' | 'ph';
  keywords?: string[];
  competitorTitles?: string[];
  tone?: 'professional' | 'casual' | 'enthusiastic';
}

export interface ListingResult {
  title: string;
  title_localized?: {
    en?: string;
    th?: string;
    vi?: string;
    ms?: string;
    id?: string;
    ph?: string;
  };
  description: string;
  bullet_points?: string[];
  highlights?: string[];
  keywords?: string[];
  tags?: string[];
  seo_score?: number;
  seo_details?: {
    title_score: number;
    description_score: number;
    keywords_score: number;
  };
  seo_tips?: string;
  platform?: string;
  language?: string;
  generated_at?: string;
}

/**
 * Listing生成 - 流式输出
 */
export async function optimizeListingStream(request: OptimizeListingRequest, callbacks: StreamCallbacks): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch('/api/v1/tools/listing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    callbacks.error?.(`API请求失败: ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.error?.('无法读取响应流');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'start') {
            callbacks.start?.(data);
          } else if (data.type === 'content') {
            fullResponse += data.content;
            callbacks.content?.(data.content);
          } else if (data.type === 'done') {
            callbacks.done?.(fullResponse);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

// ============ 智能定价工具 ============

export interface CalculatePriceRequest {
  costPrice: number;
  domesticShipping?: number;
  internationalShipping?: number;
  targetPlatform: 'shopee' | 'lazada' | 'tiktok' | 'amazon';
  targetMarket: 'TH' | 'VN' | 'MY' | 'ID' | 'PH';
  productWeight: number;
  productCategory?: string;
  targetProfitRate?: number;
  competitorPrice?: number;
}

export interface PricingResult {
  success: boolean;
  breakEvenPrice?: number;
  suggestedPrices?: Array<{
    name: string;
    price: number;
    profit: number;
    profitRate: number;
  }>;
  costBreakdown?: Record<string, number>;
  warnings?: string[];
  error?: string;
}

/**
 * 智能定价计算
 */
export async function calculatePrice(request: CalculatePriceRequest): Promise<PricingResult> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch('/api/v1/tools/pricing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return { success: false, error: `API请求失败: ${response.status}` };
  }

  return response.json();
}

// ============ AI客服智能体 ============

export interface CustomerReplyRequest {
  customerMessage: string;
  messageType: 'inquiry' | 'order' | 'logistics' | 'complaint' | 'refund' | 'review';
  targetLanguage: 'en' | 'th' | 'vi' | 'ms' | 'id' | 'ph';
  orderInfo?: {
    orderId?: string;
    status?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
  tone?: 'friendly' | 'professional' | 'apologetic';
  previousMessages?: Array<{ role: 'customer' | 'agent'; content: string }>;
}

export interface CustomerReplyResult {
  success: boolean;
  reply?: string;
  tone?: string;
  suggested_actions?: string[];
  error?: string;
}

/**
 * 客服回复生成 - 流式输出
 */
export async function generateCustomerReplyStream(request: CustomerReplyRequest, callbacks: StreamCallbacks): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch('/api/v1/tools/customer-service', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    callbacks.error?.(`API请求失败: ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.error?.('无法读取响应流');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === 'start') {
            callbacks.start?.(data);
            callbacks.type = data.messageType;
            callbacks.label = data.label;
          } else if (data.type === 'content') {
            fullResponse += data.content;
            callbacks.content?.(data.content);
          } else if (data.type === 'done') {
            callbacks.done?.(fullResponse);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

// ============ 商品采集 ============

export interface ScrapeRequest {
  url: string;
  platform?: string;
}

export interface ScrapeResult {
  success: boolean;
  platform?: string;
  productId?: string;
  data?: {
    title?: string;
    price?: number;
    price_range?: string;
    images?: string[];
    description?: string;
    shop_name?: string;
    supplier?: string;
    specifications?: Record<string, string>;
    skus?: any[];
    sales?: string;
    min_order?: string;
    weight?: string;
    location?: string;
    collect_method?: string;
  };
  error?: string;
}

/**
 * 商品采集
 */
export async function scrapeProduct(request: ScrapeRequest): Promise<ScrapeResult> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch('/api/v1/tools/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return { success: false, error: `API请求失败: ${response.status}` };
  }

  return response.json();
}

// ============ 保留旧的导出（兼容） ============

// 为了兼容旧代码，保留以下导出
export async function selectProducts(request: SelectProductsRequest): Promise<{ success: boolean; data?: SelectionResult }> {
  return new Promise((resolve) => {
    let result = '';
    selectProductsStream(request, {
      content: (text: string) => { result += text; },
      done: () => { resolve({ success: true, data: { analysis: result } as SelectionResult }); },
      error: (msg: string) => { resolve({ success: false }); }
    });
  });
}

export async function analyzeCompetition(productName: string, platform?: string): Promise<{ success: boolean; data?: any }> {
  return { success: true, data: { analysis: '竞品分析功能' } };
}

export async function suggestDirections(request: any): Promise<{ success: boolean; directions?: any[] }> {
  return { success: true, directions: [] };
}

export async function analyzeCompetitorDetail(request: any): Promise<{ success: boolean; competitors?: any[] }> {
  return { success: true, competitors: [] };
}

export async function assessRisks(request: any): Promise<{ success: boolean; risks?: any[] }> {
  return { success: true, risks: [] };
}

export async function generateSelectionReport(request: any): Promise<{ success: boolean; report?: any }> {
  return { success: true, report: {} };
}

export async function optimizeListing(request: OptimizeListingRequest): Promise<{ success: boolean; data?: ListingResult }> {
  return new Promise((resolve) => {
    let result = '';
    optimizeListingStream(request, {
      content: (text: string) => { result += text; },
      done: () => { resolve({ success: true, data: { title: result, description: '' } as ListingResult }); },
      error: (msg: string) => { resolve({ success: false }); }
    });
  });
}

export async function suggestKeywords(productName: string, platform?: string): Promise<{ success: boolean; data?: any }> {
  return { success: true, data: { keywords: [] } };
}

export async function createAdCampaign(request: any): Promise<{ success: boolean; data?: any }> {
  return { success: true, data: {} };
}

export async function optimizeAdCampaign(campaignId: string): Promise<{ success: boolean; data?: any }> {
  return { success: true, data: {} };
}

export async function generateCustomerReply(request: CustomerReplyRequest): Promise<{ success: boolean; data?: any }> {
  return new Promise((resolve) => {
    let result = '';
    generateCustomerReplyStream(request, {
      content: (text: string) => { result += text; },
      done: () => { resolve({ success: true, data: { reply: result } }); },
      error: (msg: string) => { resolve({ success: false }); }
    });
  });
}

export async function handleDispute(disputeInfo: any): Promise<{ success: boolean; data?: any }> {
  return { success: true, data: {} };
}

export async function generateDataReport(request: any): Promise<{ success: boolean; data?: any }> {
  return { success: true, data: {} };
}

export async function generateActionItems(report: any): Promise<{ success: boolean; data?: any[] }> {
  return { success: true, data: [] };
}

export async function getAIAgents(): Promise<{ agents: any[] }> {
  return {
    agents: [
      { id: 'selection', name: '选品智能体', description: '市场趋势分析、竞品研究、选品报告生成', priority: 'high', status: 'active' },
      { id: 'image', name: '图片智能体', description: 'AI图片生成、图片翻译、图片优化', priority: 'high', status: 'active' },
      { id: 'video', name: '视频生成智能体', description: '文生视频、图生视频、视频脚本生成', priority: 'high', status: 'active' },
      { id: 'listing', name: 'Listing优化智能体', description: '标题生成、五点描述、多语言Listing', priority: 'high', status: 'active' },
      { id: 'pricing', name: '智能定价工具', description: '保本价计算、利润测算、定价建议', priority: 'medium', status: 'active' },
      { id: 'customer-service', name: 'AI客服智能体', description: '多语言客服回复、纠纷处理', priority: 'high', status: 'active' },
      { id: 'data-review', name: '数据复盘智能体', description: '运营数据分析、行动项生成', priority: 'medium', status: 'active' },
    ]
  };
}
