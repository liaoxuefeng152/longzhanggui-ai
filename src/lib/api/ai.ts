/**
 * AI调用API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// AI调用请求
export interface AIInvokeRequest {
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  model?: string;
  scene?: 'customer_service' | 'marketing' | 'content';
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// AI调用响应
export interface AIInvokeResponse {
  content: string;
  model: string;
  tokens_used: number;
}

/**
 * 调用AI模型（非流式）
 */
export async function invokeAI(request: AIInvokeRequest): Promise<AIInvokeResponse> {
  return apiClient.post<AIInvokeResponse>(API_ENDPOINTS.ai.invoke, {
    ...request,
    stream: false,
  });
}

/**
 * 调用AI模型（流式）
 */
export async function invokeAIStream(
  request: AIInvokeRequest,
  onChunk: (content: string) => void,
  signal?: AbortSignal
): Promise<void> {
  return apiClient.stream(
    API_ENDPOINTS.ai.invoke,
    {
      ...request,
      stream: true,
    },
    onChunk,
    { signal }
  );
}
