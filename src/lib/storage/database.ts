/**
 * Database utility for AI output persistence
 * Uses Supabase SDK via the shared client
 */
import { getSupabaseClient } from '@/storage/database/supabase-client';

// ==================== AI Tasks ====================

export interface AiTask {
  id: string;
  agent_type: string;
  action: string;
  status: string;
  input_params: Record<string, unknown> | null;
  result_summary: Record<string, unknown> | null;
  error_message: string | null;
  tokens_used: number | null;
  cost: string | null;
  duration_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export async function createAiTask(params: {
  agentType: string;
  action: string;
  inputParams?: Record<string, unknown>;
}): Promise<AiTask> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('ai_tasks')
    .insert({
      agent_type: params.agentType,
      action: params.action,
      input_params: params.inputParams || null,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw new Error(`创建AI任务失败: ${error.message}`);
  return data as AiTask;
}

export async function updateAiTask(
  id: string,
  updates: Partial<Pick<AiTask, 'status' | 'result_summary' | 'error_message' | 'tokens_used' | 'cost' | 'duration_ms' | 'completed_at'>>
): Promise<AiTask> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('ai_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`更新AI任务失败: ${error.message}`);
  return data as AiTask;
}

export async function getAiTask(id: string): Promise<AiTask | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('ai_tasks')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`查询AI任务失败: ${error.message}`);
  return data as AiTask | null;
}

export async function listAiTasks(params: {
  agentType?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<AiTask[]> {
  const client = getSupabaseClient();
  let query = client
    .from('ai_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit || 20);

  if (params.agentType) query = query.eq('agent_type', params.agentType);
  if (params.status) query = query.eq('status', params.status);
  if (params.offset) query = query.range(params.offset, params.offset + (params.limit || 20) - 1);

  const { data, error } = await query;
  if (error) throw new Error(`查询AI任务列表失败: ${error.message}`);
  return (data as AiTask[]) || [];
}

// ==================== AI Task Outputs ====================

export interface AiTaskOutput {
  id: string;
  task_id: string;
  output_type: string;
  storage_key: string | null;
  content: Record<string, unknown> | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export async function createTaskOutput(params: {
  taskId: string;
  outputType: string;
  storageKey?: string;
  content?: Record<string, unknown>;
  fileSize?: number;
  mimeType?: string;
}): Promise<AiTaskOutput> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('ai_task_outputs')
    .insert({
      task_id: params.taskId,
      output_type: params.outputType,
      storage_key: params.storageKey || null,
      content: params.content || null,
      file_size: params.fileSize || null,
      mime_type: params.mimeType || null,
    })
    .select()
    .single();
  if (error) throw new Error(`创建任务产出失败: ${error.message}`);
  return data as AiTaskOutput;
}

export async function getTaskOutputs(taskId: string): Promise<AiTaskOutput[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('ai_task_outputs')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`查询任务产出失败: ${error.message}`);
  return (data as AiTaskOutput[]) || [];
}

// ==================== Selection Sessions ====================

export interface SelectionSession {
  id: string;
  market: string | null;
  platform: string | null;
  category: string | null;
  budget: string | null;
  core_appeal: string | null;
  directions: unknown[] | null;
  selected_direction_ids: string[] | null;
  hot_products: unknown[] | null;
  selected_product_ids: string[] | null;
  product_profit_params: Record<string, unknown> | null;
  feasibility_results: unknown[] | null;
  competitors: unknown[] | null;
  report_storage_key: string | null;
  report_content: string | null;
  current_step: number | null;
  status: string;
  data_sources: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export async function createSelectionSession(params: {
  market?: string;
  platform?: string;
  category?: string;
  budget?: string;
  coreAppeal?: string;
}): Promise<SelectionSession> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('selection_sessions')
    .insert({
      market: params.market || null,
      platform: params.platform || null,
      category: params.category || null,
      budget: params.budget || null,
      core_appeal: params.coreAppeal || null,
      status: 'draft',
    })
    .select()
    .single();
  if (error) throw new Error(`创建选品会话失败: ${error.message}`);
  return data as SelectionSession;
}

export async function updateSelectionSession(
  id: string,
  updates: Partial<Omit<SelectionSession, 'id' | 'created_at'>>
): Promise<SelectionSession> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('selection_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`更新选品会话失败: ${error.message}`);
  return data as SelectionSession;
}

export async function getSelectionSession(id: string): Promise<SelectionSession | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('selection_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`查询选品会话失败: ${error.message}`);
  return data as SelectionSession | null;
}

export async function listSelectionSessions(params: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<SelectionSession[]> {
  const client = getSupabaseClient();
  let query = client
    .from('selection_sessions')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(params.limit || 20);

  if (params.status) query = query.eq('status', params.status);
  if (params.offset) query = query.range(params.offset, params.offset + (params.limit || 20) - 1);

  const { data, error } = await query;
  if (error) throw new Error(`查询选品会话列表失败: ${error.message}`);
  return (data as SelectionSession[]) || [];
}

export async function deleteSelectionSession(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  const { error } = await client
    .from('selection_sessions')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`删除选品会话失败: ${error.message}`);
  return true;
}

// ==================== Generated Images ====================

export interface GeneratedImage {
  id: string;
  task_id: string | null;
  original_url: string | null;
  storage_key: string | null;
  image_type: string | null;
  prompt: string | null;
  params: Record<string, unknown> | null;
  width: number | null;
  height: number | null;
  product_id: string | null;
  created_at: string;
}

export async function createGeneratedImage(params: {
  taskId?: string;
  originalUrl?: string;
  storageKey?: string;
  imageType?: string;
  prompt?: string;
  params?: Record<string, unknown>;
  width?: number;
  height?: number;
  productId?: string;
}): Promise<GeneratedImage> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('generated_images')
    .insert({
      task_id: params.taskId || null,
      original_url: params.originalUrl || null,
      storage_key: params.storageKey || null,
      image_type: params.imageType || null,
      prompt: params.prompt || null,
      params: params.params || null,
      width: params.width || null,
      height: params.height || null,
      product_id: params.productId || null,
    })
    .select()
    .single();
  if (error) throw new Error(`创建生成图片记录失败: ${error.message}`);
  return data as GeneratedImage;
}

export async function listGeneratedImages(params: {
  imageType?: string;
  productId?: string;
  limit?: number;
}): Promise<GeneratedImage[]> {
  const client = getSupabaseClient();
  let query = client
    .from('generated_images')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit || 20);

  if (params.imageType) query = query.eq('image_type', params.imageType);
  if (params.productId) query = query.eq('product_id', params.productId);

  const { data, error } = await query;
  if (error) throw new Error(`查询生成图片列表失败: ${error.message}`);
  return (data as GeneratedImage[]) || [];
}

// ==================== Generated Videos ====================

export interface GeneratedVideo {
  id: string;
  task_id: string | null;
  original_url: string | null;
  storage_key: string | null;
  video_type: string | null;
  prompt: string | null;
  params: Record<string, unknown> | null;
  duration: string | null;
  product_id: string | null;
  created_at: string;
}

export async function createGeneratedVideo(params: {
  taskId?: string;
  originalUrl?: string;
  storageKey?: string;
  videoType?: string;
  prompt?: string;
  params?: Record<string, unknown>;
  duration?: string;
  productId?: string;
}): Promise<GeneratedVideo> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('generated_videos')
    .insert({
      task_id: params.taskId || null,
      original_url: params.originalUrl || null,
      storage_key: params.storageKey || null,
      video_type: params.videoType || null,
      prompt: params.prompt || null,
      params: params.params || null,
      duration: params.duration || null,
      product_id: params.productId || null,
    })
    .select()
    .single();
  if (error) throw new Error(`创建生成视频记录失败: ${error.message}`);
  return data as GeneratedVideo;
}

export async function listGeneratedVideos(params: {
  videoType?: string;
  limit?: number;
}): Promise<GeneratedVideo[]> {
  const client = getSupabaseClient();
  let query = client
    .from('generated_videos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit || 20);

  if (params.videoType) query = query.eq('video_type', params.videoType);

  const { data, error } = await query;
  if (error) throw new Error(`查询生成视频列表失败: ${error.message}`);
  return (data as GeneratedVideo[]) || [];
}

// ==================== Listing Drafts ====================

export interface ListingDraft {
  id: string;
  task_id: string | null;
  product_id: string | null;
  platform: string | null;
  market: string | null;
  title: string | null;
  bullet_points: string[] | null;
  description: string | null;
  keywords: string[] | null;
  language: string | null;
  storage_key: string | null;
  created_at: string;
  updated_at: string;
}

export async function createListingDraft(params: {
  taskId?: string;
  productId?: string;
  platform?: string;
  market?: string;
  title?: string;
  bulletPoints?: string[];
  description?: string;
  keywords?: string[];
  language?: string;
  storageKey?: string;
}): Promise<ListingDraft> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('listing_drafts')
    .insert({
      task_id: params.taskId || null,
      product_id: params.productId || null,
      platform: params.platform || null,
      market: params.market || null,
      title: params.title || null,
      bullet_points: params.bulletPoints || null,
      description: params.description || null,
      keywords: params.keywords || null,
      language: params.language || 'en',
      storage_key: params.storageKey || null,
    })
    .select()
    .single();
  if (error) throw new Error(`创建Listing草稿失败: ${error.message}`);
  return data as ListingDraft;
}

export async function updateListingDraft(
  id: string,
  updates: Partial<Omit<ListingDraft, 'id' | 'created_at'>>
): Promise<ListingDraft> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('listing_drafts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`更新Listing草稿失败: ${error.message}`);
  return data as ListingDraft;
}

export async function listListingDrafts(params: {
  productId?: string;
  platform?: string;
  limit?: number;
}): Promise<ListingDraft[]> {
  const client = getSupabaseClient();
  let query = client
    .from('listing_drafts')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(params.limit || 20);

  if (params.productId) query = query.eq('product_id', params.productId);
  if (params.platform) query = query.eq('platform', params.platform);

  const { data, error } = await query;
  if (error) throw new Error(`查询Listing草稿列表失败: ${error.message}`);
  return (data as ListingDraft[]) || [];
}

// ==================== Chat Histories ====================

export interface ChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  intent_type: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export async function saveChatMessage(params: {
  sessionId: string;
  role: string;
  content: string;
  intentType?: string;
  metadata?: Record<string, unknown>;
}): Promise<ChatMessage> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('chat_histories')
    .insert({
      session_id: params.sessionId,
      role: params.role,
      content: params.content,
      intent_type: params.intentType || null,
      metadata: params.metadata || null,
    })
    .select()
    .single();
  if (error) throw new Error(`保存聊天消息失败: ${error.message}`);
  return data as ChatMessage;
}

export async function getChatHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('chat_histories')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw new Error(`查询聊天历史失败: ${error.message}`);
  return (data as ChatMessage[]) || [];
}

export async function getRecentSessions(limit: number = 10): Promise<string[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('chat_histories')
    .select('session_id')
    .order('created_at', { ascending: false })
    .limit(limit * 5);
  if (error) throw new Error(`查询最近会话失败: ${error.message}`);
  const uniqueIds = [...new Set((data as { session_id: string }[])?.map(d => d.session_id) || [])];
  return uniqueIds.slice(0, limit);
}

// ==================== Platforms (Shopee/TikTok/Lazada) ====================

export interface Platform {
  id: string;
  platform_code: string;          // 'shopee_sg', 'shopee_my', etc.
  platform_name: string;          // 'Shopee Singapore'
  partner_id?: string;            // Shopee Partner ID
  partner_key?: string;           // Shopee Partner Key (encrypted)
  region?: string;                // SG/MY/TH/ID/VN/PH
  shop_id?: string;               // Shop ID from Shopee
  shop_name?: string;             // Shop name
  access_token?: string;          // Access token (encrypted)
  refresh_token?: string;         // Refresh token (encrypted)
  token_expires_at?: string;      // Token expiration time
  refresh_expires_at?: string;    // Refresh token expiration
  authorized_at?: string;         // When authorized
  auth_status: string;            // pending/authorized/expired/error
  currency?: string;              // SGD/MYR/THB/IDR/VND/PHP
  last_auth_error?: string;       // Last authorization error
  sync_enabled?: boolean;         // Auto sync enabled
  sync_interval?: number;         // Sync interval in minutes
  last_product_sync?: string;     // Last product sync time
  last_order_sync?: string;       // Last order sync time
  last_inventory_sync?: string;   // Last inventory sync time
  total_products?: number;        // Total products synced
  total_orders?: number;          // Total orders synced
  last_error?: string;            // Last sync error
  error_count?: number;           // Error count
  is_active?: boolean;            // Platform active
  created_at: string;
  updated_at: string;
}

export async function getPlatforms(): Promise<Platform[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('platforms')
    .select('*')
    .order('platform_name', { ascending: true });
  if (error) throw new Error(`查询平台列表失败: ${error.message}`);
  return (data as Platform[]) || [];
}

export async function getPlatformByCode(platformCode: string): Promise<Platform | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('platforms')
    .select('*')
    .eq('platform_code', platformCode)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`查询平台失败: ${error.message}`);
  }
  return data as Platform;
}

// Get platform by ID (UUID)
export async function getPlatform(id: string): Promise<Platform | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('platforms')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`查询平台失败: ${error.message}`);
  }
  return data as Platform;
}

/**
 * Update a platform by ID
 */
export async function updatePlatform(
  id: string,
  updates: Partial<Platform>
): Promise<Platform> {
  const client = getSupabaseClient();
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await client
    .from('platforms')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    throw new Error(`更新平台失败: ${error.message}`);
  }
  return data as Platform;
}

export async function updatePlatformCredentials(
  platformCode: string,
  credentials: {
    partner_id?: string;
    partner_key?: string;
    shop_id?: string;
    shop_name?: string;
  }
): Promise<Platform> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('platforms')
    .update({
      ...credentials,
      updated_at: new Date().toISOString(),
    })
    .eq('platform_code', platformCode)
    .select()
    .single();
  if (error) throw new Error(`更新平台凭证失败: ${error.message}`);
  return data as Platform;
}

export async function updatePlatformTokens(
  platformCode: string,
  tokens: {
    access_token: string;
    refresh_token: string;
    token_expires_at: string;
    refresh_expires_at: string;
    authorized_at: string;
  }
): Promise<Platform> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('platforms')
    .update({
      ...tokens,
      auth_status: 'authorized',
      updated_at: new Date().toISOString(),
    })
    .eq('platform_code', platformCode)
    .select()
    .single();
  if (error) throw new Error(`更新平台Token失败: ${error.message}`);
  return data as Platform;
}

export async function updatePlatformAuthStatus(
  platformCode: string,
  status: 'pending' | 'authorized' | 'expired' | 'error',
  errorMessage?: string
): Promise<Platform> {
  const client = getSupabaseClient();
  const updateData: Record<string, unknown> = {
    auth_status: status,
    updated_at: new Date().toISOString(),
  };
  if (errorMessage) {
    updateData.last_auth_error = errorMessage;
  }
  const { data, error } = await client
    .from('platforms')
    .update(updateData)
    .eq('platform_code', platformCode)
    .select()
    .single();
  if (error) throw new Error(`更新平台状态失败: ${error.message}`);
  return data as Platform;
}

// ==================== Shops ====================

export interface Shop {
  id: string;
  shop_id: string;                // Platform shop ID
  shop_name: string;              // Shop display name
  platform: string;               // 'shopee', 'tiktok', 'lazada'
  region: string;                 // SG/MY/TH/ID/VN/PH
  platform_config_id?: string;    // Reference to platforms table
  status: string;                 // active/inactive/banned
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

// Generic update platform by code
export async function updatePlatformByCode(
  platformCode: string,
  updateData: Partial<Platform>
): Promise<Platform> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('platforms')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('platform_code', platformCode)
    .select()
    .single();
  if (error) throw new Error(`更新平台配置失败: ${error.message}`);
  return data as Platform;
}

export async function getShops(): Promise<Shop[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`查询店铺列表失败: ${error.message}`);
  return (data as Shop[]) || [];
}

export async function createShop(params: {
  shop_id: string;
  shop_name: string;
  platform: string;
  region: string;
  platform_config_id?: string;
}): Promise<Shop> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('shops')
    .insert({
      shop_id: params.shop_id,
      shop_name: params.shop_name,
      platform: params.platform,
      region: params.region,
      platform_config_id: params.platform_config_id || null,
      status: 'active',
    })
    .select()
    .single();
  if (error) throw new Error(`创建店铺失败: ${error.message}`);
  return data as Shop;
}

export async function updateShopSyncTime(shopId: string): Promise<Shop> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('shops')
    .update({
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', shopId)
    .select()
    .single();
  if (error) throw new Error(`更新店铺同步时间失败: ${error.message}`);
  return data as Shop;
}
