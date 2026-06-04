/**
 * Frontend API client for AI output storage
 */
import { get, post, put, del } from './client';

// ==================== Selection Sessions ====================

export interface SelectionSessionData {
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
}): Promise<SelectionSessionData> {
  const res = await post('/api/v1/storage/selection-sessions', params);
  return res.session;
}

export async function getSelectionSession(id: string): Promise<SelectionSessionData | null> {
  try {
    const res = await get(`/api/v1/storage/selection-sessions?id=${id}`);
    return res.session;
  } catch {
    return null;
  }
}

export async function listSelectionSessions(params?: {
  status?: string;
  limit?: number;
}): Promise<SelectionSessionData[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.limit) query.set('limit', String(params.limit));
  const res = await get(`/api/v1/storage/selection-sessions?${query.toString()}`);
  return res.sessions || [];
}

export async function updateSelectionSession(
  id: string,
  updates: Partial<SelectionSessionData>
): Promise<SelectionSessionData> {
  const res = await put(`/api/v1/storage/selection-sessions?id=${id}`, updates);
  return res.session;
}

export async function deleteSelectionSession(id: string): Promise<void> {
  await del(`/api/v1/storage/selection-sessions?id=${id}`);
}

// ==================== AI Tasks ====================

export interface AiTaskData {
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
  agent_type: string;
  action: string;
  input_params?: Record<string, unknown>;
}): Promise<AiTaskData> {
  const res = await post('/api/v1/storage/ai-tasks', params);
  return res.task;
}

export async function updateAiTask(
  id: string,
  updates: Partial<AiTaskData>
): Promise<AiTaskData> {
  const res = await put(`/api/v1/storage/ai-tasks?id=${id}`, updates);
  return res.task;
}

export async function listAiTasks(params?: {
  agent_type?: string;
  status?: string;
  limit?: number;
}): Promise<AiTaskData[]> {
  const query = new URLSearchParams();
  if (params?.agent_type) query.set('agent_type', params.agent_type);
  if (params?.status) query.set('status', params.status);
  if (params?.limit) query.set('limit', String(params.limit));
  const res = await get(`/api/v1/storage/ai-tasks?${query.toString()}`);
  return res.tasks || [];
}

// ==================== Generated Images ====================

export interface GeneratedImageData {
  id: string;
  task_id: string | null;
  original_url: string | null;
  storage_key: string | null;
  access_url: string | null;
  image_type: string | null;
  prompt: string | null;
  params: Record<string, unknown> | null;
  width: number | null;
  height: number | null;
  product_id: string | null;
  created_at: string;
}

export async function saveGeneratedImage(params: {
  original_url: string;
  image_type?: string;
  prompt?: string;
  params?: Record<string, unknown>;
  product_id?: string;
  task_id?: string;
}): Promise<GeneratedImageData> {
  const res = await post('/api/v1/storage/images', params);
  return res.image;
}

export async function listGeneratedImages(params?: {
  image_type?: string;
  product_id?: string;
  limit?: number;
}): Promise<GeneratedImageData[]> {
  const query = new URLSearchParams();
  if (params?.image_type) query.set('image_type', params.image_type);
  if (params?.product_id) query.set('product_id', params.product_id);
  if (params?.limit) query.set('limit', String(params.limit));
  const res = await get(`/api/v1/storage/images?${query.toString()}`);
  return res.images || [];
}

// ==================== Generated Videos ====================

export interface GeneratedVideoData {
  id: string;
  task_id: string | null;
  original_url: string | null;
  storage_key: string | null;
  access_url: string | null;
  video_type: string | null;
  prompt: string | null;
  params: Record<string, unknown> | null;
  duration: string | null;
  product_id: string | null;
  created_at: string;
}

export async function saveGeneratedVideo(params: {
  original_url: string;
  video_type?: string;
  prompt?: string;
  params?: Record<string, unknown>;
  duration?: string;
  product_id?: string;
  task_id?: string;
}): Promise<GeneratedVideoData> {
  const res = await post('/api/v1/storage/videos', params);
  return res.video;
}

export async function listGeneratedVideos(params?: {
  video_type?: string;
  limit?: number;
}): Promise<GeneratedVideoData[]> {
  const query = new URLSearchParams();
  if (params?.video_type) query.set('video_type', params.video_type);
  if (params?.limit) query.set('limit', String(params.limit));
  const res = await get(`/api/v1/storage/videos?${query.toString()}`);
  return res.videos || [];
}

// ==================== Listing Drafts ====================

export interface ListingDraftData {
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

export async function saveListingDraft(params: {
  product_id?: string;
  platform?: string;
  market?: string;
  title?: string;
  bullet_points?: string[];
  description?: string;
  keywords?: string[];
  language?: string;
  task_id?: string;
}): Promise<ListingDraftData> {
  const res = await post('/api/v1/storage/listing-drafts', params);
  return res.draft;
}

export async function updateListingDraft(
  id: string,
  updates: Partial<ListingDraftData>
): Promise<ListingDraftData> {
  const res = await put(`/api/v1/storage/listing-drafts?id=${id}`, updates);
  return res.draft;
}

export async function listListingDrafts(params?: {
  product_id?: string;
  platform?: string;
  limit?: number;
}): Promise<ListingDraftData[]> {
  const query = new URLSearchParams();
  if (params?.product_id) query.set('product_id', params.product_id);
  if (params?.platform) query.set('platform', params.platform);
  if (params?.limit) query.set('limit', String(params.limit));
  const res = await get(`/api/v1/storage/listing-drafts?${query.toString()}`);
  return res.drafts || [];
}

// ==================== Chat Histories ====================

export interface ChatMessageData {
  id: string;
  session_id: string;
  role: string;
  content: string;
  intent_type: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export async function saveChatMessage(params: {
  session_id: string;
  role: string;
  content: string;
  intent_type?: string;
  metadata?: Record<string, unknown>;
}): Promise<ChatMessageData> {
  const res = await post('/api/v1/storage/chat-histories', params);
  return res.message;
}

export async function getChatHistory(
  sessionId: string,
  limit?: number
): Promise<ChatMessageData[]> {
  const query = new URLSearchParams({ session_id: sessionId });
  if (limit) query.set('limit', String(limit));
  const res = await get(`/api/v1/storage/chat-histories?${query.toString()}`);
  return res.messages || [];
}

export async function getRecentSessions(limit?: number): Promise<string[]> {
  const query = new URLSearchParams({ recent: 'true' });
  if (limit) query.set('limit', String(limit));
  const res = await get(`/api/v1/storage/chat-histories?${query.toString()}`);
  return res.sessions || [];
}

// ==================== Report ====================

export async function uploadReport(params: {
  content: string;
  session_id?: string;
  file_name?: string;
}): Promise<{ storage_key: string; download_url: string }> {
  const res = await post('/api/v1/storage/report', params);
  return { storage_key: res.storage_key, download_url: res.download_url };
}

export async function getReportDownloadUrl(key: string): Promise<string> {
  const res = await get(`/api/v1/storage/report?key=${encodeURIComponent(key)}`);
  return res.download_url;
}
