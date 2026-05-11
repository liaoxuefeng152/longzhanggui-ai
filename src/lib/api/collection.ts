/**
 * 采集中心 API
 */
import { apiClient } from './client';

// 采集结果
export interface CollectionResult {
  success: boolean;
  product_id?: string;
  source_url: string;
  source_id?: string;
  name?: string;
  price?: number;
  images?: string[];
  supplier?: string;
  error?: string;
}

// 采集历史记录
export interface CollectionHistory {
  id: string;
  source_url: string;
  source_id?: string;
  product_id?: string;
  status: string;
  created_at: string;
}

// 商品预览数据
export interface ProductPreview {
  id: string;
  name: string;
  price: number;
  images: string[];
  supplier: string;
  supplier_url: string;
  sku_info: Array<{
    sku_id: string;
    name: string;
    price: number;
    stock: number;
  }>;
  attributes: Record<string, string>;
}

/**
 * 采集单个1688商品
 */
export async function collectProduct(url: string): Promise<{
  success: boolean;
  message: string;
  product_id?: string;
}> {
  return apiClient.post('/1688/collect', { url });
}

/**
 * 预览采集商品（不保存）
 */
export async function previewProduct(url: string): Promise<{
  success: boolean;
  data: ProductPreview;
}> {
  return apiClient.post('/1688/collect/preview', { url });
}

/**
 * 批量采集商品
 */
export async function batchCollectProducts(urls: string[]): Promise<{
  success: boolean;
  total: number;
  items: CollectionResult[];
}> {
  return apiClient.post('/1688/collect/batch', { urls });
}

/**
 * 搜索1688商品
 */
export async function searchProducts(keyword: string, page?: number, pageSize?: number): Promise<{
  success: boolean;
  data: {
    items: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
      supplier: string;
      url: string;
    }>;
    total: number;
    page: number;
  };
}> {
  const params = new URLSearchParams({ keyword });
  if (page) params.set('page', String(page));
  if (pageSize) params.set('page_size', String(pageSize));
  return apiClient.post(`/1688/search?${params.toString()}`);
}

/**
 * 获取采集历史
 */
export async function getCollectionHistory(page?: number, pageSize?: number): Promise<{
  success: boolean;
  total: number;
  page: number;
  page_size: number;
  items: CollectionHistory[];
}> {
  const params = new URLSearchParams();
  if (page) params.set('page', String(page));
  if (pageSize) params.set('page_size', String(pageSize));
  return apiClient.get(`/1688/history?${params.toString()}`);
}
