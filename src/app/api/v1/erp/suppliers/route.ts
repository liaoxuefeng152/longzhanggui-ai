import { NextRequest, NextResponse } from 'next/server';
import { getAllSuppliers, addSupplier, Supplier } from '@/lib/data/suppliers-store';

/**
 * 获取供应商列表
 * GET /api/v1/erp/suppliers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let suppliers = getAllSuppliers();

    if (status) {
      suppliers = suppliers.filter(s => s.status === status);
    }

    // 排序：按评分倒序
    suppliers.sort((a, b) => b.rating - a.rating);

    // 分页
    const paginatedSuppliers = suppliers.slice(offset, offset + limit);

    return NextResponse.json({
      suppliers: paginatedSuppliers,
      total: suppliers.length,
      summary: {
        total_suppliers: suppliers.length,
        active_suppliers: suppliers.filter(s => s.status === 'active').length,
        average_rating: suppliers.length > 0 
          ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)
          : 0,
      },
    });
  } catch (error) {
    console.error('获取供应商列表失败:', error);
    return NextResponse.json(
      { error: '获取供应商列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建供应商
 * POST /api/v1/erp/suppliers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      company_name,
      contact_person,
      phone,
      email,
      address,
      business_license,
      products,
      payment_terms,
      delivery_terms,
    } = body;

    if (!name || !company_name || !contact_person || !phone) {
      return NextResponse.json(
        { error: '请填写必填字段' },
        { status: 400 }
      );
    }

    const newSupplier: Supplier = {
      id: `SUP-${Date.now()}`,
      name,
      company_name,
      contact_person,
      phone,
      email: email || '',
      address: address || {
        country: '',
        province: '',
        city: '',
        street: '',
        postal_code: '',
      },
      business_license: business_license || '',
      products: products || [],
      rating: 0,
      total_orders: 0,
      total_amount: 0,
      payment_terms: payment_terms || '',
      delivery_terms: delivery_terms || '',
      notes: body.notes || '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addSupplier(newSupplier);

    return NextResponse.json({
      success: true,
      message: '供应商创建成功',
      data: newSupplier,
    });
  } catch (error) {
    console.error('创建供应商失败:', error);
    return NextResponse.json(
      { error: '创建供应商失败' },
      { status: 500 }
    );
  }
}
