import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

/**
 * 查看全局存储中的商品
 * GET /api/debug/store/products
 */
export async function GET(request: NextRequest) {
  try {
    const products = store.getProducts();

    return NextResponse.json({
      success: true,
      data: {
        total: products.length,
        products: products.map(p => ({
          id: p.id,
          internal_sku: p.internal_sku,
          name_zh: p.name_zh,
          category: p.category,
          status: p.status,
          created_at: p.created_at,
        }))
      }
    });
  } catch (error) {
    console.error('获取商品失败:', error);
    return NextResponse.json(
      { success: false, error: '获取商品失败' },
      { status: 500 }
    );
  }
}
