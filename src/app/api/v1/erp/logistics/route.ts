import { NextRequest, NextResponse } from 'next/server';
import { getAllLogistics, addLogistics, Logistics } from '@/lib/data/logistics-store';

/**
 * 获取物流列表
 * GET /api/v1/erp/logistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const carrier = searchParams.get('carrier');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let logistics = getAllLogistics();

    if (status) {
      logistics = logistics.filter(l => l.status === status);
    }

    if (carrier) {
      logistics = logistics.filter(l => l.carrier.toLowerCase() === carrier.toLowerCase());
    }

    // 排序：按创建时间倒序
    logistics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 分页
    const paginatedLogistics = logistics.slice(offset, offset + limit);

    return NextResponse.json({
      logistics: paginatedLogistics,
      total: logistics.length,
      summary: {
        total_shipments: logistics.length,
        in_transit_count: logistics.filter(l => l.status === 'in_transit').length,
        delivered_count: logistics.filter(l => l.status === 'delivered').length,
        exception_count: logistics.filter(l => l.status === 'exception').length,
      },
    });
  } catch (error) {
    console.error('获取物流列表失败:', error);
    return NextResponse.json(
      { error: '获取物流列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建物流记录
 * POST /api/v1/erp/logistics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      order_no,
      carrier,
      service_type,
      shipping_method,
      origin,
      destination,
      weight,
      dimensions,
      shipping_cost,
      currency,
    } = body;

    if (!order_id || !carrier) {
      return NextResponse.json(
        { error: '请填写必填字段' },
        { status: 400 }
      );
    }

    const newLogistics: Logistics = {
      id: `LOG-${Date.now()}`,
      order_id,
      order_no: order_no || '',
      tracking_number: body.tracking_number || '',
      carrier,
      service_type: service_type || '',
      shipping_method: shipping_method || 'air',
      origin: origin || {
        name: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
      },
      destination: destination || {
        name: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
      },
      weight: weight || 0,
      dimensions: dimensions || { length: 0, width: 0, height: 0 },
      shipping_cost: shipping_cost || 0,
      currency: currency || 'USD',
      status: 'created',
      estimated_delivery: body.estimated_delivery || null,
      actual_delivery: null,
      tracking_events: [],
      notes: body.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addLogistics(newLogistics);

    return NextResponse.json({
      success: true,
      message: '物流记录创建成功',
      data: newLogistics,
    });
  } catch (error) {
    console.error('创建物流记录失败:', error);
    return NextResponse.json(
      { error: '创建物流记录失败' },
      { status: 500 }
    );
  }
}
