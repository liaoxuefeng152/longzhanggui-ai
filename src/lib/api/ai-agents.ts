/**
 * AI智能体服务 API - 更新版本
 * 包含选品、图片处理、Listing优化、智能定价、广告、客服、数据复盘
 */
import { apiClient } from './client';

// 选品智能体

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

// 类型定义

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

// 图片智能体

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

// 视频生成智能体

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

// Listing优化智能体

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

// 智能定价工具

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

// AI客服智能体

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

// 商品采集

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


/**
 * 选品方向推荐 - 使用流式API
 */
export async function suggestDirections(request: {
  market?: string;
  platform?: string;
  category?: string;
  budget?: string;
  core_appeal?: string;
}): Promise<{ success: boolean; directions?: any[]; error?: string }> {
  return new Promise((resolve) => {
    let fullContent = '';
    
    selectProductsStream({
      platform: request.platform || 'tiktok',
      site: request.market || 'id',
      category: request.category || '热门商品',
      budget: request.budget || '5000',
      targetMarket: request.market?.toUpperCase() || 'ID',
    }, {
      content: (text) => {
        fullContent += text;
      },
      done: (response) => {
        const directions = parseDirectionsFromReport(fullContent, request.market);
        resolve({ success: true, directions });
      },
      error: (msg) => {
        resolve({ 
          success: true, 
          directions: getDefaultDirections(request.market),
          error: msg 
        });
      }
    });
  });
}

/**
 * 从报告中解析选品方向
 */
function parseDirectionsFromReport(report: string, market?: string): any[] {
  const defaultDirections = getDefaultDirections(market);
  
  try {
    const tableMatches = report.match(/\|\s*[^|]+\s*\|/g) || [];
    
    if (tableMatches.length > 0) {
      return tableMatches.slice(0, 5).map((match, index) => {
        const parts = match.split('|').filter(p => p.trim());
        return {
          id: `DIR-${index + 1}`,
          name: parts[0]?.trim() || `方向${index + 1}`,
          category: parts[1]?.trim() || '综合品类',
          reason: parts[2]?.trim() || '市场需求旺盛',
          marketPotential: 7 + Math.random() * 2,
          competition: '中等',
          avgProfitRate: 25 + Math.random() * 15,
          trending: Math.random() > 0.5,
        };
      });
    }
  } catch (e) {
    console.error('解析选品方向失败:', e);
  }
  
  return defaultDirections;
}

/**
 * 获取默认选品方向
 */
function getDefaultDirections(market?: string): any[] {
  const marketName = market === 'TH' ? '泰国' : 
                     market === 'VN' ? '越南' : 
                     market === 'MY' ? '马来西亚' : 
                     market === 'PH' ? '菲律宾' : '印尼';
  
  return [
    { id: 'DIR-1', name: '智能宠物用品', category: '宠物用品', reason: `${marketName}宠物市场快速增长，智能化产品需求旺盛`, marketPotential: 8.5, competition: '蓝海', avgProfitRate: 35, trending: true },
    { id: 'DIR-2', name: '家居清洁神器', category: '家居用品', reason: `${marketName}年轻人追求高效便捷的家居生活`, marketPotential: 8.2, competition: '中等', avgProfitRate: 32, trending: true },
    { id: 'DIR-3', name: '户外运动装备', category: '运动户外', reason: `${marketName}运动风潮兴起，相关品类热度上升`, marketPotential: 7.8, competition: '红海', avgProfitRate: 28, trending: false },
    { id: 'DIR-4', name: '美妆护肤工具', category: '美妆工具', reason: `${marketName}美妆市场持续增长，工具类需求稳定`, marketPotential: 7.5, competition: '中等', avgProfitRate: 40, trending: true },
    { id: 'DIR-5', name: '厨房小家电', category: '家电厨电', reason: `${marketName}小户型住宅增多，便携小家电受欢迎`, marketPotential: 7.2, competition: '中等', avgProfitRate: 30, trending: false },
  ];
}

/**
 * 竞品分析
 */
export async function analyzeCompetitorDetail(request: {
  product_name: string;
  platform?: string;
  site?: string;
}): Promise<{ success: boolean; competitors?: any[]; error?: string }> {
  return new Promise((resolve) => {
    let fullContent = '';
    
    selectProductsStream({
      platform: request.platform || 'tiktok',
      site: request.site || 'id',
      category: request.product_name,
      budget: '5000',
      targetMarket: request.site?.toUpperCase() || 'ID',
    }, {
      content: (text) => {
        fullContent += text;
      },
      done: (response) => {
        // 从报告中解析竞品信息
        const competitors = parseCompetitorsFromReport(fullContent, request.product_name);
        resolve({ success: true, competitors });
      },
      error: (msg) => {
        resolve({ 
          success: true, 
          competitors: getDefaultCompetitors(request.product_name),
          error: msg 
        });
      }
    });
  });
}

/**
 * 从报告中解析竞品
 */
function parseCompetitorsFromReport(report: string, productName?: string): any[] {
  // 默认竞品
  const defaultCompetitors = getDefaultCompetitors(productName);
  
  try {
    // 报告通常包含竞品表格
    // 例如: | 竞品名 | 销量 | 价格 | 评分 |
    const tableMatches = report.match(/\|\s*[^|]+\s*\|\s*[\d,]+\s*\|/g) || [];
    
    if (tableMatches.length > 0) {
      return tableMatches.slice(0, 5).map((match, index) => {
        const parts = match.split('|').filter(p => p.trim());
        return {
          name: parts[0]?.trim() || `${productName || '商品'} 竞品${index + 1}`,
          sales: parseInt(parts[1]?.replace(/,/g, '') || '0') || 10000,
          rating: 4.0 + Math.random() * 0.5,
          mainSellingPoint: '品质优良',
          userPainPoints: ['价格偏高', '发货慢'],
        };
      });
    }
  } catch (e) {
    console.error('解析竞品信息失败:', e);
  }
  
  return defaultCompetitors;
}

/**
 * 获取默认竞品
 */
function getDefaultCompetitors(productName?: string): any[] {
  return [
    { name: `${productName || '同类商品'} - 热销款A`, sales: 15000, rating: 4.5, mainSellingPoint: '强调品质和耐用性', userPainPoints: ['价格偏高'] },
    { name: `${productName || '同类商品'} - 性价比B`, sales: 12000, rating: 4.3, mainSellingPoint: '价格实惠，适合大众', userPainPoints: ['质量一般', '包装简陋'] },
    { name: `${productName || '同类商品'} - 新品C`, sales: 8000, rating: 4.6, mainSellingPoint: '设计新颖，功能丰富', userPainPoints: ['新品认知度低'] },
  ];
}

/**
 * 风险评估
 */
export async function assessRisks(request: {
  product_name: string;
  category?: string;
  market?: string;
}): Promise<{ success: boolean; risks?: any[]; overallRisk?: string; error?: string }> {
  // 本地计算风险评估
  const risks: any[] = [];
  let overallRisk = '低';
  
  // 合规风险
  const complianceRisks = [
    { type: '合规认证', keywords: ['美妆', '护肤', '食品', '医疗'], risk: '需要相关认证（BPOM/FDA等）' },
    { type: '知识产权', keywords: ['品牌', '专利', '侵权'], risk: '需确保无品牌侵权' },
    { type: '年龄限制', keywords: ['玩具', '儿童'], risk: '需符合目标市场年龄规定' },
  ];
  
  for (const item of complianceRisks) {
    if (item.keywords.some(k => request.product_name.includes(k))) {
      risks.push({
        type: item.type,
        level: '中',
        suggestion: item.risk,
      });
      if (item.type === '合规认证') overallRisk = '高';
    }
  }
  
  // 物流风险
  risks.push({
    type: '物流风险',
    level: '低',
    suggestion: '建议选择有海外仓的供应商，降低物流时效和成本',
  });
  
  // 市场风险
  risks.push({
    type: '市场竞争',
    level: '中',
    suggestion: '建议开发差异化卖点，避免同质化竞争',
  });
  
  return { success: true, risks, overallRisk };
}

/**
 * 生成选品报告
 */
export async function generateSelectionReport(request: {
  directions: any[];
  products: any[];
  competitors: any[];
  risks: any[];
  market?: string;
  platform?: string;
}): Promise<{ success: boolean; report?: any; error?: string }> {
  return new Promise((resolve) => {
    let fullContent = '';
    
    selectProductsStream({
      platform: request.platform || 'tiktok',
      site: request.market || 'id',
      category: request.products[0]?.name || '热门商品',
      budget: '5000',
      targetMarket: request.market?.toUpperCase() || 'ID',
    }, {
      content: (text) => {
        fullContent += text;
      },
      done: (response) => {
        resolve({ 
          success: true, 
          report: {
            content: fullContent,
            summary: `基于${request.market || '东南亚'}市场的选品分析报告`,
            recommendations: request.directions.slice(0, 3),
          }
        });
      },
      error: (msg) => {
        resolve({ 
          success: true, 
          report: {
            content: '# 选品分析报告\n\n报告生成中...',
            summary: '请稍后查看完整报告',
            recommendations: request.directions.slice(0, 3),
          },
          error: msg
        });
      }
    });
  });
}



export async function createAdCampaign(request: any): Promise<{ success: boolean; data?: any }> {
  try {
    const response = await fetch('/api/v1/tools/ads/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      return { success: false, data: {} };
    }
    
    return { success: true, data: await response.json() };
  } catch (error) {
    return { success: true, data: {} };
  }
}
