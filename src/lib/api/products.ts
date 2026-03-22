/**
 * 商品库管理API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 商品类型
export interface Product {
  id: string;
  name: string;
  image?: string;
  category: string;
  platform: string;
  status: 'draft' | 'pending' | 'active' | 'inactive';
  compliance_status: 'passed' | 'pending' | 'failed';
  stock: number;
  price: number;
  sales: number;
  created_at: string;
  updated_at: string;
}

// 商品列表响应
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
}

// 商品统计
export interface ProductStats {
  total: number;
  active: number;
  pending: number;
  compliance_passed: number;
  stock_warning: number;
}

// 创建商品请求
export interface CreateProductRequest {
  name: string;
  category: string;
  platform: string;
  price: number;
  stock?: number;
  image?: string;
}

// 批量操作请求
export interface BatchProductRequest {
  product_ids: string[];
  action: 'activate' | 'deactivate' | 'delete';
}

// 商品类目
export interface ProductCategory {
  id: string;
  name: string;
  count: number;
}

/**
 * 获取商品列表
 */
export async function getProducts(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  platform?: string;
  category?: string;
  search?: string;
}): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.page_size) searchParams.set('page_size', String(params.page_size));
  if (params?.status) searchParams.set('status', params.status);
  if (params?.platform) searchParams.set('platform', params.platform);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);

  const endpoint = `${API_ENDPOINTS.products.list}?${searchParams.toString()}`;
  return apiClient.get<ProductListResponse>(endpoint);
}

/**
 * 获取商品详情
 */
export async function getProduct(id: string): Promise<Product> {
  return apiClient.get<Product>(API_ENDPOINTS.products.detail(id));
}

/**
 * 创建商品
 */
export async function createProduct(data: CreateProductRequest): Promise<Product> {
  return apiClient.post<Product>(API_ENDPOINTS.products.list, data);
}

/**
 * 更新商品
 */
export async function updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<Product> {
  return apiClient.put<Product>(API_ENDPOINTS.products.detail(id), data);
}

/**
 * 删除商品
 */
export async function deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.delete<{ success: boolean; message: string }>(
    API_ENDPOINTS.products.detail(id)
  );
}

/**
 * 批量操作商品
 */
export async function batchProductOperation(
  data: BatchProductRequest
): Promise<{ success: boolean; affected: number }> {
  return apiClient.post<{ success: boolean; affected: number }>(
    API_ENDPOINTS.products.batch,
    data
  );
}

/**
 * 获取商品类目列表
 */
export async function getProductCategories(): Promise<ProductCategory[]> {
  return apiClient.get<ProductCategory[]>(API_ENDPOINTS.products.categories);
}

/**
 * 获取商品统计
 */
export async function getProductStats(): Promise<ProductStats> {
  const response = await getProducts({ page_size: 1000 });
  const products = response.products;

  return {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    pending: products.filter((p) => p.status === 'pending').length,
    compliance_passed: products.filter((p) => p.compliance_status === 'passed').length,
    stock_warning: products.filter((p) => p.stock < 50).length,
  };
}
