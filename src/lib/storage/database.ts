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

// ==================== Users ====================

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  role: string; // 'admin', 'client', 'operator'
  status: string; // 'active', 'inactive', 'suspended', 'deleted'
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (error) throw new Error(`查询用户失败: ${error.message}`);
  return data as User | null;
}

export async function getUserById(id: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`查询用户失败: ${error.message}`);
  return data as User | null;
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
  name?: string;
  role?: string;
}): Promise<User> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .insert({
      email: params.email,
      password_hash: params.passwordHash,
      name: params.name || null,
      role: params.role || 'client',
      status: 'active',
    })
    .select()
    .single();
  if (error) throw new Error(`创建用户失败: ${error.message}`);
  return data as User;
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client
    .from('users')
    .update({
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (error) throw new Error(`更新登录时间失败: ${error.message}`);
}

export async function listUsers(params: {
  role?: string;
  status?: string;
  limit?: number;
}): Promise<User[]> {
  const client = getSupabaseClient();
  let query = client
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit || 50);
  
  if (params.role) query = query.eq('role', params.role);
  if (params.status) query = query.eq('status', params.status);
  
  const { data, error } = await query;
  if (error) throw new Error(`查询用户列表失败: ${error.message}`);
  return (data as User[]) || [];
}

// ==================== Audit Logs ====================

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<AuditLog> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('audit_logs')
    .insert({
      user_id: params.userId || null,
      action: params.action,
      resource_type: params.resourceType || null,
      resource_id: params.resourceId || null,
      details: params.details || null,
      ip_address: params.ipAddress || null,
    })
    .select()
    .single();
  if (error) throw new Error(`创建审计日志失败: ${error.message}`);
  return data as AuditLog;
}

// ==================== Products ====================

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  source_url: string | null;
  source_platform: string | null;
  cost_price: string | null;
  sale_price: string | null;
  market_price: string | null;
  weight: string | null;
  dimensions: string | null;
  supplier_id: string | null;
  images: unknown[] | null;
  videos: unknown[] | null;
  listing_status: string;
  published_shop_id: string | null;
  published_product_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function createProduct(params: {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  sourceUrl?: string;
  sourcePlatform?: string;
  costPrice?: string;
  salePrice?: string;
  supplierId?: string;
  images?: unknown[];
}): Promise<Product> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('products')
    .insert({
      sku: params.sku,
      name: params.name,
      description: params.description || null,
      category: params.category || null,
      source_url: params.sourceUrl || null,
      source_platform: params.sourcePlatform || null,
      cost_price: params.costPrice || null,
      sale_price: params.salePrice || null,
      supplier_id: params.supplierId || null,
      images: params.images || null,
      listing_status: 'draft',
    })
    .select()
    .single();
  if (error) throw new Error(`创建商品失败: ${error.message}`);
  return data as Product;
}

export async function getProduct(id: string): Promise<Product | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`查询商品失败: ${error.message}`);
  return data as Product | null;
}

export async function getProductBySku(sku: string): Promise<Product | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('sku', sku)
    .maybeSingle();
  if (error) throw new Error(`查询商品失败: ${error.message}`);
  return data as Product | null;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<Product> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`更新商品失败: ${error.message}`);
  return data as Product;
}

export async function listProducts(params: {
  listingStatus?: string;
  category?: string;
  supplierId?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  const client = getSupabaseClient();
  let query = client
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit || 50);
  
  if (params.listingStatus) query = query.eq('listing_status', params.listingStatus);
  if (params.category) query = query.eq('category', params.category);
  if (params.supplierId) query = query.eq('supplier_id', params.supplierId);
  if (params.offset) query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
  
  const { data, error } = await query;
  if (error) throw new Error(`查询商品列表失败: ${error.message}`);
  return (data as Product[]) || [];
}

// ==================== Orders ====================

export interface Order {
  id: string;
  order_number: string;
  platform_order_id: string | null;
  shop_id: string | null;
  product_id: string | null;
  sku: string | null;
  quantity: number;
  unit_price: string;
  total_amount: string;
  currency: string | null;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  tracking_number: string | null;
  logistics_company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function createOrder(params: {
  orderNumber: string;
  platformOrderId?: string;
  shopId?: string;
  productId?: string;
  sku?: string;
  quantity: number;
  unitPrice: string;
  totalAmount: string;
  currency?: string;
  customerName?: string;
  shippingAddress?: string;
}): Promise<Order> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('orders')
    .insert({
      order_number: params.orderNumber,
      platform_order_id: params.platformOrderId || null,
      shop_id: params.shopId || null,
      product_id: params.productId || null,
      sku: params.sku || null,
      quantity: params.quantity,
      unit_price: params.unitPrice,
      total_amount: params.totalAmount,
      currency: params.currency || null,
      customer_name: params.customerName || null,
      shipping_address: params.shippingAddress || null,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw new Error(`创建订单失败: ${error.message}`);
  return data as Order;
}

export async function listOrders(params: {
  shopId?: string;
  status?: string;
  limit?: number;
}): Promise<Order[]> {
  const client = getSupabaseClient();
  let query = client
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(params.limit || 50);
  
  if (params.shopId) query = query.eq('shop_id', params.shopId);
  if (params.status) query = query.eq('status', params.status);
  
  const { data, error } = await query;
  if (error) throw new Error(`查询订单列表失败: ${error.message}`);
  return (data as Order[]) || [];
}

// ==================== Inventory ====================

export interface Inventory {
  id: string;
  product_id: string;
  sku: string | null;
  warehouse: string | null;
  quantity: number;
  reserved_qty: number | null;
  available_qty: number | null;
  reorder_point: number | null;
  status: string;
  last_restocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getInventory(productId: string): Promise<Inventory | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('inventory')
    .select('*')
    .eq('product_id', productId)
    .maybeSingle();
  if (error) throw new Error(`查询库存失败: ${error.message}`);
  return data as Inventory | null;
}

export async function updateInventory(
  productId: string,
  updates: Partial<Omit<Inventory, 'id' | 'product_id' | 'created_at'>>
): Promise<Inventory> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('inventory')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('product_id', productId)
    .select()
    .single();
  if (error) throw new Error(`更新库存失败: ${error.message}`);
  return data as Inventory;
}

export async function listLowStockInventory(threshold: number = 10): Promise<Inventory[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('inventory')
    .select('*')
    .lt('quantity', threshold)
    .order('quantity', { ascending: true });
  if (error) throw new Error(`查询低库存失败: ${error.message}`);
  return (data as Inventory[]) || [];
}

// ==================== Suppliers ====================

export interface Supplier {
  id: string;
  name: string;
  platform: string;
  url: string | null;
  contact: string | null;
  phone: string | null;
  address: string | null;
  moq: number | null;
  lead_time: number | null;
  quality_rating: string | null;
  response_rating: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function createSupplier(params: {
  name: string;
  platform: string;
  url?: string;
  contact?: string;
  moq?: number;
  leadTime?: number;
}): Promise<Supplier> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('suppliers')
    .insert({
      name: params.name,
      platform: params.platform,
      url: params.url || null,
      contact: params.contact || null,
      moq: params.moq || 1,
      lead_time: params.leadTime || 7,
      status: 'active',
    })
    .select()
    .single();
  if (error) throw new Error(`创建供应商失败: ${error.message}`);
  return data as Supplier;
}

export async function listSuppliers(params: {
  platform?: string;
  status?: string;
}): Promise<Supplier[]> {
  const client = getSupabaseClient();
  let query = client
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (params.platform) query = query.eq('platform', params.platform);
  if (params.status) query = query.eq('status', params.status);
  
  const { data, error } = await query;
  if (error) throw new Error(`查询供应商列表失败: ${error.message}`);
  return (data as Supplier[]) || [];
}

// ==================== Ad Campaigns ====================

export interface AdCampaign {
  id: string;
  name: string;
  shop_id: string | null;
  product_id: string | null;
  platform: string;
  campaign_id: string | null;
  budget: string;
  daily_budget: string | null;
  spent: string | null;
  impressions: number | null;
  clicks: number | null;
  orders: number | null;
  roas: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function createAdCampaign(params: {
  name: string;
  shopId?: string;
  productId?: string;
  platform: string;
  budget: string;
  dailyBudget?: string;
  startDate?: string;
}): Promise<AdCampaign> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('ad_campaigns')
    .insert({
      name: params.name,
      shop_id: params.shopId || null,
      product_id: params.productId || null,
      platform: params.platform,
      budget: params.budget,
      daily_budget: params.dailyBudget || null,
      start_date: params.startDate || null,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw new Error(`创建广告计划失败: ${error.message}`);
  return data as AdCampaign;
}

export async function listAdCampaigns(params: {
  shopId?: string;
  status?: string;
}): Promise<AdCampaign[]> {
  const client = getSupabaseClient();
  let query = client
    .from('ad_campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (params.shopId) query = query.eq('shop_id', params.shopId);
  if (params.status) query = query.eq('status', params.status);
  
  const { data, error } = await query;
  if (error) throw new Error(`查询广告计划列表失败: ${error.message}`);
  return (data as AdCampaign[]) || [];
}
