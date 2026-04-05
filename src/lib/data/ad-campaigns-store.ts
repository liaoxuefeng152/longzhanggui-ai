/**
 * 广告活动数据存储
 * 用于在API路由之间共享数据
 */

export interface AdCampaign {
  id: string;
  campaign_name: string;
  platform: string;
  marketplace: string;
  ad_type: 'sponsored_products' | 'sponsored_brands' | 'sponsored_display' | 'search_ads' | 'social_ads';
  products: Array<{
    product_id: string;
    product_name: string;
  }>;
  budget: {
    daily: number;
    total: number;
    spent: number;
  };
  bidding: {
    strategy: string;
    max_bid: number;
    average_bid: number;
  };
  targeting: {
    type: 'keywords' | 'products' | 'audiences' | 'categories';
    targets: string[];
  };
  status: 'active' | 'paused' | 'ended' | 'draft';
  start_date: string;
  end_date: string | null;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
    cpm: number;
    spend: number;
    revenue: number;
    roas: number;
    acos: number;
  };
  created_at: string;
  updated_at: string;
}

// 初始化广告活动数据
const initialAdCampaigns: AdCampaign[] = [
  {
    id: 'AD-001',
    campaign_name: '智能手表 - 自动广告',
    platform: 'Amazon',
    marketplace: 'US',
    ad_type: 'sponsored_products',
    products: [
      {
        product_id: 'PROD-001',
        product_name: '智能手表 S5',
      },
    ],
    budget: {
      daily: 10.00,
      total: 300.00,
      spent: 25.00,
    },
    bidding: {
      strategy: 'dynamic_down_only',
      max_bid: 1.50,
      average_bid: 0.85,
    },
    targeting: {
      type: 'keywords',
      targets: ['smart watch', 'fitness tracker', 'GPS watch', 'waterproof watch'],
    },
    status: 'active',
    start_date: new Date(Date.now() - 10 * 86400000).toISOString(),
    end_date: null,
    metrics: {
      impressions: 15234,
      clicks: 312,
      conversions: 18,
      ctr: 2.05,
      cpc: 0.08,
      cpm: 1.64,
      spend: 25.00,
      revenue: 1619.82,
      roas: 64.79,
      acos: 1.54,
    },
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'AD-002',
    campaign_name: '蓝牙耳机 - 关键词广告',
    platform: 'eBay',
    marketplace: 'UK',
    ad_type: 'search_ads',
    products: [
      {
        product_id: 'PROD-002',
        product_name: '无线蓝牙耳机',
      },
    ],
    budget: {
      daily: 5.00,
      total: 150.00,
      spent: 45.00,
    },
    bidding: {
      strategy: 'manual',
      max_bid: 0.80,
      average_bid: 0.65,
    },
    targeting: {
      type: 'keywords',
      targets: ['wireless earbuds', 'noise cancelling headphones', 'bluetooth earphones'],
    },
    status: 'active',
    start_date: new Date(Date.now() - 8 * 86400000).toISOString(),
    end_date: null,
    metrics: {
      impressions: 8923,
      clicks: 178,
      conversions: 12,
      ctr: 1.99,
      cpc: 0.25,
      cpm: 5.04,
      spend: 45.00,
      revenue: 659.88,
      roas: 14.66,
      acos: 6.82,
    },
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'AD-003',
    campaign_name: '充电宝 - 品牌广告',
    platform: 'Shopify',
    marketplace: 'CA',
    ad_type: 'sponsored_brands',
    products: [
      {
        product_id: 'PROD-003',
        product_name: '便携式充电宝',
      },
    ],
    budget: {
      daily: 15.00,
      total: 450.00,
      spent: 120.00,
    },
    bidding: {
      strategy: 'dynamic',
      max_bid: 2.00,
      average_bid: 1.20,
    },
    targeting: {
      type: 'keywords',
      targets: ['power bank', 'portable charger', '20000mAh power bank', 'fast charger'],
    },
    status: 'active',
    start_date: new Date(Date.now() - 5 * 86400000).toISOString(),
    end_date: null,
    metrics: {
      impressions: 5678,
      clicks: 95,
      conversions: 5,
      ctr: 1.67,
      cpc: 1.26,
      cpm: 21.13,
      spend: 120.00,
      revenue: 254.25,
      roas: 2.12,
      acos: 47.20,
    },
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// 全局广告活动数据存储
const globalForAdCampaigns = globalThis as unknown as {
  adCampaigns: AdCampaign[] | undefined;
};

export const adCampaignsStore = globalForAdCampaigns.adCampaigns || initialAdCampaigns;

if (process.env.NODE_ENV !== 'production') {
  globalForAdCampaigns.adCampaigns = adCampaignsStore;
}

// 辅助函数
export function getAllAdCampaigns(): AdCampaign[] {
  return adCampaignsStore;
}

export function getAdCampaignById(id: string): AdCampaign | undefined {
  return adCampaignsStore.find(c => c.id === id);
}

export function addAdCampaign(campaign: AdCampaign): void {
  adCampaignsStore.push(campaign);
}

export function updateAdCampaign(id: string, updates: Partial<AdCampaign>): AdCampaign | undefined {
  const index = adCampaignsStore.findIndex(c => c.id === id);
  if (index !== -1) {
    adCampaignsStore[index] = {
      ...adCampaignsStore[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return adCampaignsStore[index];
  }
  return undefined;
}

export function deleteAdCampaign(id: string): boolean {
  const index = adCampaignsStore.findIndex(c => c.id === id);
  if (index !== -1) {
    adCampaignsStore.splice(index, 1);
    return true;
  }
  return false;
}
