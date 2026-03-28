import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // 返回智能体列表
  const agents = [
    {
      id: 'product-selection',
      name: '选品智能体',
      description: '基于数据驱动的商品筛选，识别高潜力商品',
      priority: 'high',
      status: 'online',
    },
    {
      id: 'image-design',
      name: '图片设计智能体',
      description: '主图生成、背景替换、图片翻译、合规校验',
      priority: 'high',
      status: 'online',
    },
    {
      id: 'listing-optimization',
      name: 'Listing优化智能体',
      description: '标题优化、五点描述、关键词挖掘、多语言支持',
      priority: 'high',
      status: 'online',
    },
    {
      id: 'advertising',
      name: '广告投放智能体',
      description: '广告创建、预算优化、ROI监控、风控预警',
      priority: 'medium',
      status: 'online',
    },
    {
      id: 'customer-service',
      name: '客服智能体',
      description: '多语言客服回复、纠纷处理、自动工单',
      priority: 'medium',
      status: 'online',
    },
    {
      id: 'data-review',
      name: '数据复盘智能体',
      description: '数据分析、问题诊断、优化建议、行动项生成',
      priority: 'medium',
      status: 'online',
    },
    {
      id: 'video-generation',
      name: '视频生成智能体',
      description: '视频脚本、配音生成、幻灯片制作',
      priority: 'low',
      status: 'online',
    },
  ];

  return NextResponse.json({ agents });
}
