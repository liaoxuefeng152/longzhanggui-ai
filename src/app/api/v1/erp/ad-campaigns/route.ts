import { NextRequest, NextResponse } from 'next/server';
import store from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const productId = searchParams.get('product_id');

    let campaigns = Array.from(store.adCampaigns.values());

    // 过滤
    if (status) {
      campaigns = campaigns.filter(c => c.status === status);
    }
    if (productId) {
      campaigns = campaigns.filter(c => c.product_id === productId);
    }

    // 排序：按创建时间倒序
    campaigns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error('Get ad campaigns error:', error);
    return NextResponse.json({ success: false, error: '获取广告失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证商品存在
    if (body.product_id) {
      const product = store.getProduct(body.product_id);
      if (!product) {
        return NextResponse.json({ success: false, error: '关联商品不存在' }, { status: 400 });
      }
    }
    
    const campaign = store.createAdCampaign({
      ...body,
      status: body.status || 'draft',
    });

    return NextResponse.json({ success: true, data: campaign });
  } catch (error) {
    console.error('Create ad campaign error:', error);
    return NextResponse.json({ success: false, error: '创建广告失败' }, { status: 500 });
  }
}
