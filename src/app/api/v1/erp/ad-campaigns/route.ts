import { NextRequest, NextResponse } from 'next/server';
import { getAllAdCampaigns, addAdCampaign, AdCampaign } from '@/lib/data/ad-campaigns-store';

/**
 * 获取广告活动列表
 * GET /api/v1/erp/ad-campaigns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let campaigns = getAllAdCampaigns();

    if (status) {
      campaigns = campaigns.filter(c => c.status === status);
    }

    if (platform) {
      campaigns = campaigns.filter(c => c.platform.toLowerCase() === platform.toLowerCase());
    }

    // 排序：按创建时间倒序
    campaigns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 分页
    const paginatedCampaigns = campaigns.slice(offset, offset + limit);

    return NextResponse.json({
      campaigns: paginatedCampaigns,
      total: campaigns.length,
      summary: {
        total_campaigns: campaigns.length,
        active_campaigns: campaigns.filter(c => c.status === 'active').length,
        total_budget: campaigns.reduce((sum, c) => sum + c.budget.total, 0),
        total_spent: campaigns.reduce((sum, c) => sum + c.budget.spent, 0),
        total_impressions: campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0),
        total_clicks: campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0),
        total_conversions: campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0),
        average_roas: campaigns.length > 0 
          ? (campaigns.reduce((sum, c) => sum + c.metrics.roas, 0) / campaigns.length).toFixed(2)
          : 0,
      },
    });
  } catch (error) {
    console.error('获取广告活动列表失败:', error);
    return NextResponse.json(
      { error: '获取广告活动列表失败' },
      { status: 500 }
    );
  }
}

/**
 * 创建广告活动
 * POST /api/v1/erp/ad-campaigns
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      campaign_name,
      platform,
      marketplace,
      ad_type,
      products,
      budget,
      bidding,
      targeting,
      start_date,
      end_date,
    } = body;

    if (!campaign_name || !platform || !ad_type) {
      return NextResponse.json(
        { error: '请填写必填字段' },
        { status: 400 }
      );
    }

    const newCampaign: AdCampaign = {
      id: `AD-${Date.now()}`,
      campaign_name,
      platform,
      marketplace: marketplace || 'US',
      ad_type,
      products: products || [],
      budget: budget || {
        daily: 10,
        total: 300,
        spent: 0,
      },
      bidding: bidding || {
        strategy: 'manual',
        max_bid: 1.0,
        average_bid: 0.8,
      },
      targeting: targeting || {
        type: 'keywords',
        targets: [],
      },
      status: 'draft',
      start_date: start_date || new Date().toISOString(),
      end_date: end_date || null,
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        cpm: 0,
        spend: 0,
        revenue: 0,
        roas: 0,
        acos: 0,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addAdCampaign(newCampaign);

    return NextResponse.json({
      success: true,
      message: '广告活动创建成功',
      data: newCampaign,
    });
  } catch (error) {
    console.error('创建广告活动失败:', error);
    return NextResponse.json(
      { error: '创建广告活动失败' },
      { status: 500 }
    );
  }
}
