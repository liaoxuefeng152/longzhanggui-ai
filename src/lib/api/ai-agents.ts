/**
 * AI智能体服务 API
 * 包含选品、图片处理、Listing优化、智能定价、广告、客服、数据复盘
 */
import { apiClient } from './client';

// ============ 选品智能体 ============

export interface SelectProductsRequest {
  platform?: string;
  site?: string;
  category?: string;
  count?: number;
  min_profit_rate?: number;
}

export interface SelectedProduct {
  id: string;
  name: string;
  category: string;
  platform: string;
  sales_trend: number;
  profit_margin: number;
  compliance_status: string;
  supply_chain: string;
  purchase_cycle: number;
  stock_cost_ratio: number;
  predicted_profit: number;
  source_url?: string;
  supplier_name?: string;
  cost_price?: number;
}

export interface CompetitionAnalysis {
  product_name: string;
  platform: string;
  competitors: Array<{
    name: string;
    price: number;
    sales: number;
    rating: number;
  }>;
  market_trend: string;
  recommendation: string;
}

export async function selectProducts(request: SelectProductsRequest): Promise<{
  success: boolean;
  data: SelectedProduct[];
}> {
  return apiClient.post('/api/v1/ai/select-products', request);
}

export async function analyzeCompetition(productName: string, platform?: string): Promise<{
  success: boolean;
  data: CompetitionAnalysis;
}> {
  const params = new URLSearchParams({ product_name: productName });
  if (platform) params.set('platform', platform);
  return apiClient.get(`/api/v1/ai/analyze-competition?${params.toString()}`);
}

// ============ 图片智能体 ============

export type ImageProcessMode = 'translate' | 'optimize' | 'remove_watermark' | 'white_background';

export interface ProcessImageRequest {
  image_url: string;
  mode: ImageProcessMode;
  source_language?: string;
  target_language?: string;
  options?: Record<string, unknown>;
}

export interface BatchProcessImageRequest {
  image_urls: string[];
  mode: ImageProcessMode;
  source_language?: string;
  target_language?: string;
}

export interface ImageProcessResult {
  task_id: string;
  status: string;
  original_url: string;
  processed_url?: string;
  mode?: string;
  mode_label?: string;
  analysis?: Record<string, any>;
  ai_response?: string;
  target_language?: string;
  error?: string;
}

export async function processImage(request: ProcessImageRequest): Promise<{
  success: boolean;
  data: ImageProcessResult;
}> {
  return apiClient.post('/api/v1/ai/process-image', request);
}

export async function batchProcessImages(request: BatchProcessImageRequest): Promise<{
  success: boolean;
  data: ImageProcessResult[];
}> {
  return apiClient.post('/api/v1/ai/process-image/batch', request);
}

export async function getImageTaskStatus(taskId: string): Promise<{
  success: boolean;
  data: ImageProcessResult;
}> {
  return apiClient.get(`/api/v1/ai/process-image/task/${taskId}`);
}

// ============ Listing优化智能体 ============

export interface OptimizeListingRequest {
  product_info: Record<string, unknown>;
  platform?: string;
  language?: string;
  keywords?: string[];
}

export interface ListingResult {
  title: string;
  description: string;
  bullet_points: string[];
  keywords: string[];
  seo_score: number;
  seo_details?: {
    title_score: number;
    description_score: number;
    keywords_score: number;
  };
  platform?: string;
  language?: string;
  generated_at?: string;
}

export async function optimizeListing(request: OptimizeListingRequest): Promise<{
  success: boolean;
  data: ListingResult;
}> {
  return apiClient.post('/api/v1/ai/optimize-listing', request);
}

export async function suggestKeywords(productName: string, platform?: string): Promise<{
  success: boolean;
  data: { keywords: Array<{ keyword: string; relevance: number; volume: string }> };
}> {
  const params = new URLSearchParams({ product_name: productName });
  if (platform) params.set('platform', platform);
  return apiClient.get(`/api/v1/ai/suggest-keywords?${params.toString()}`);
}

// ============ 智能定价工具 ============

export interface CalculatePriceRequest {
  cost_price: number;
  domestic_shipping?: number;
  first_mile_shipping?: number;
  platform_commission_rate?: number;
  ad_cost_rate?: number;
  target_profit_rate?: number;
  competitor_prices?: number[];
}

export interface PricingResult {
  total_cost: number;
  target_price: number;
  suggested_price: number;
  profit_margin: number;
  cost_breakdown: Record<string, number>;
  pricing_basis: string;
}

export async function calculatePrice(request: CalculatePriceRequest): Promise<{
  success: boolean;
  data: PricingResult;
}> {
  return apiClient.post('/api/v1/ai/calculate-price', request);
}

// ============ 广告投放智能体 ============

export interface CreateAdRequest {
  product_id: string;
  product_name?: string;
  platform?: string;
  daily_budget?: number;
  target_acos?: number;
  keywords?: string[];
  category?: string;
}

export interface AdCampaign {
  campaign_id: string;
  product_id: string;
  platform: string;
  daily_budget: number;
  target_acos: number;
  keywords: string[];
  status: string;
  recommendations: string[];
}

export async function createAdCampaign(request: CreateAdRequest): Promise<{
  success: boolean;
  data: AdCampaign;
}> {
  return apiClient.post('/api/v1/ai/create-ad', request);
}

export async function optimizeAdCampaign(campaignId: string): Promise<{
  success: boolean;
  data: {
    campaign_id: string;
    adjustments: Array<{
      type: string;
      before: unknown;
      after: unknown;
      reason: string;
    }>;
    expected_improvement: string;
  };
}> {
  return apiClient.post(`/api/v1/ai/optimize-ad/${campaignId}`);
}

// ============ AI客服智能体 ============

export interface CustomerReplyRequest {
  message: string;
  language?: string;
  context?: Record<string, unknown>;
}

export interface DisputeInfo {
  order_id: string;
  buyer_message: string;
  dispute_type: string;
  amount: number;
}

export async function generateCustomerReply(request: CustomerReplyRequest): Promise<{
  success: boolean;
  data: {
    reply: string;
    tone: string;
    suggested_actions: string[];
  };
}> {
  return apiClient.post('/api/v1/ai/customer-reply', request);
}

export async function handleDispute(disputeInfo: DisputeInfo): Promise<{
  success: boolean;
  data: {
    resolution: string;
    refund_amount?: number;
    actions: string[];
    template: string;
  };
}> {
  return apiClient.post('/api/v1/ai/handle-dispute', disputeInfo);
}

// ============ 数据复盘智能体 ============

export interface DataReportRequest {
  start_date: string;
  end_date: string;
  platform?: string;
}

export interface DataReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_sales: number;
    total_orders: number;
    total_profit: number;
    profit_rate: number;
  };
  trends: {
    sales_trend: Array<{ date: string; value: number }>;
    order_trend: Array<{ date: string; value: number }>;
    profit_trend: Array<{ date: string; value: number }>;
  };
  top_products: Array<{
    product_id: string;
    product_name: string;
    sales: number;
    profit: number;
  }>;
  issues: string[];
  recommendations: string[];
}

export interface ActionItem {
  id: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  affected_products: string[];
  expected_impact: string;
}

export async function generateDataReport(request: DataReportRequest): Promise<{
  success: boolean;
  data: DataReport;
}> {
  return apiClient.post('/api/v1/ai/data-report', request);
}

export async function generateActionItems(report: Record<string, unknown>): Promise<{
  success: boolean;
  data: ActionItem[];
}> {
  return apiClient.post('/api/v1/ai/action-items', report);
}

// ============ 视频生成智能体 ============

export interface GenerateVideoRequest {
  product_name: string;
  product_description?: string;
  product_images?: string[];
  video_type?: 'script' | 'voiceover' | 'slideshow' | 'full' | 'product_showcase';
  duration?: number;
  platform?: string;
  style?: string;
  language?: string;
}

export interface VideoScene {
  description: string;
  duration: number;
}

export interface VideoGenerationResult {
  task_id: string;
  status: string;
  video_type: string;
  script?: string;
  scenes?: VideoScene[];
  video_url?: string;
  last_frame?: string;
  duration?: number;
  resolution?: string;
  ratio?: string;
  fps?: number;
  model?: string;
  thumbnail_url?: string;
  error?: string;
  created_at: string;
}

export async function generateVideo(request: GenerateVideoRequest): Promise<{
  success: boolean;
  data: VideoGenerationResult;
}> {
  return apiClient.post('/api/v1/ai/generate-video', request);
}

// ============ 智能体列表 ============

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
}

export async function getAIAgents(): Promise<{
  agents: AgentInfo[];
}> {
  return apiClient.get('/api/v1/ai/agents');
}
