import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/storage/database/supabase-client';

// 安全解析JSON字符串
function safeParseJSON(str: any): any {
  if (!str) return [];
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

// GET - 获取商品列表（从数据库查询）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '100');

    // 优先从Python后端获取真实数据
    try {
      const authHeader = request.headers.get('authorization') || '';
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
      const backendResponse = await fetch(
        `${backendUrl}/api/v1/erp/products?keyword=${encodeURIComponent(keyword)}&status=${encodeURIComponent(status)}&page=${page}&page_size=${pageSize}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { 'Authorization': authHeader } : {}),
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        if (backendData.items && Array.isArray(backendData.items)) {
          // 解析images字段（后端存储为JSON字符串）
          const items = backendData.items.map((p: any) => ({
            ...p,
            images: typeof p.images === 'string' ? safeParseJSON(p.images) : (p.images || []),
            processed_images: typeof p.processed_images === 'string' ? safeParseJSON(p.processed_images) : (p.processed_images || []),
            skus: typeof p.skus === 'string' ? safeParseJSON(p.skus) : (p.skus || []),
            category: p.category_name || p.category,
          }));
          return NextResponse.json({
            items,
            total: backendData.total || items.length,
            page: backendData.page || page,
            page_size: backendData.page_size || pageSize,
          });
        }
      }
    } catch (backendError) {
      console.warn('[ERP商品API] 后端不可用，从数据库查询:', (backendError as Error).message);
    }

    // Fallback: 从Supabase数据库查询
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // 筛选
    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,sku.ilike.%${keyword}%,category.ilike.%${keyword}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[ERP商品API] 数据库查询失败:', error);
      // 返回空数据而不是模拟数据
      return NextResponse.json({
        items: [],
        total: 0,
        page,
        page_size: pageSize,
      });
    }

    // 转换数据格式
    const items = (data || []).map(p => ({
      ...p,
      internal_sku: p.sku,
      name_zh: p.name,
      name_en: p.name_en || p.name,
      category: p.category,
      cost_price: p.purchase_price,
      total_cost: p.purchase_price,
      images: safeParseJSON(p.images),
      status: p.status || 'draft',
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return NextResponse.json({
      items,
      total: count || 0,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json(
      { items: [], total: 0, page: 1, page_size: 100 },
      { status: 200 }  // 返回空数据而不是错误
    );
  }
}

// POST - 创建商品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 优先代理到后端API
    try {
      const token = request.headers.get('Authorization') || '';
      const backendResp = await fetch('http://localhost:8000/api/v1/erp/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': token } : {}),
        },
        body: JSON.stringify(body),
      });

      if (backendResp.ok) {
        const backendData = await backendResp.json();
        // 解析JSON字符串字段
        const parsed = { ...backendData };
        if (typeof parsed.images === 'string') {
          try { parsed.images = JSON.parse(parsed.images); } catch {}
        }
        if (typeof parsed.processed_images === 'string') {
          try { parsed.processed_images = JSON.parse(parsed.processed_images); } catch {}
        }
        return NextResponse.json(parsed, { status: 201 });
      }
    } catch (backendErr) {
      console.warn('[ERP Products POST] 后端不可用，存入数据库');
    }

    // Fallback: 存入Supabase数据库
    const newProduct = {
      sku: body.internal_sku || `SKU-${Date.now()}`,
      name: body.name_zh,
      name_en: body.name_en || '',
      category: body.category_name || body.category || '',
      platform: body.platform || 'shopee',
      purchase_price: body.cost_price || 0,
      sell_price: body.sell_price || 0,
      currency: body.currency || 'SGD',
      stock: body.stock || 0,
      status: body.status || 'selected',
      images: JSON.stringify(body.images || []),
      source_url: body.source_url || '',
      supplier_name: body.supplier_name || '',
    };

    const { data, error } = await supabase
      .from('products')
      .insert(newProduct)
      .select()
      .single();

    if (error) {
      console.error('[ERP Products POST] 数据库插入失败:', error);
      return NextResponse.json({ error: '创建商品失败' }, { status: 500 });
    }

    // 转换返回格式
    const result = {
      ...data,
      internal_sku: data?.sku,
      name_zh: data?.name,
      cost_price: data?.purchase_price,
      total_cost: data?.purchase_price,
      images: safeParseJSON(data?.images),
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { error: '创建商品失败' },
      { status: 500 }
    );
  }
}