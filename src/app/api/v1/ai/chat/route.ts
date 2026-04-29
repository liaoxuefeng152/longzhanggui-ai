import { NextRequest, NextResponse } from 'next/server';

// AI聊天API - 简化版，返回预设响应
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { detail: '消息不能为空' },
        { status: 400 }
      );
    }

    // 简单的意图识别和响应
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('选品') || lowerMessage.includes('选') || lowerMessage.includes('产品')) {
      response = `针对您的选品需求，我为您推荐以下建议：

### 🔍 选品分析

基于您的需求，我建议关注以下几个方向：

1. **便携式充电设备** - TikTok东南亚市场热门，体积小、物流成本低
2. **手机配件** - 泰国、越南市场需求旺盛，利润空间可观
3. **家居小物件** - 创意类产品容易在短视频平台爆火

### 📊 建议操作
- 点击右侧「选品SKILL」获取详细分析
- 查看「商品库」了解已有选品
- 使用「竞品分析」功能深入研究

如需更详细的分析，请提供：
- 目标站点（泰国/越南/马来西亚等）
- 预算范围
- 擅长类目`;
    } else if (lowerMessage.includes('库存') || lowerMessage.includes('补货')) {
      response = `📦 **库存查询**

目前系统支持以下库存相关功能：

1. **库存总览** - 查看所有商品库存状态
2. **库存预警** - 低库存自动提醒
3. **补货建议** - 基于销售数据的智能补货

请前往「ERP系统 > 库存管理」查看详细信息。`;
    } else if (lowerMessage.includes('订单') || lowerMessage.includes('发货')) {
      response = `📋 **订单管理**

您可以在「ERP系统 > 订单中心」进行以下操作：

- 查看所有订单状态
- 处理待发货订单
- 追踪物流信息
- 处理售后问题`;
    } else if (lowerMessage.includes('帮助') || lowerMessage.includes('怎么用')) {
      response = `🦞 **龙掌柜AI助手使用指南**

我是您的智能运营助理，可以帮助您：

| 功能 | 说明 |
|------|------|
| 🔍 选品分析 | 市场趋势、竞品分析、蓝海类目 |
| 📸 素材制作 | 图片/视频建议、Listing优化 |
| 💰 定价计算 | 成本核算、利润分析 |
| 📊 数据分析 | 运营日报、周报、数据复盘 |

直接告诉我您的需求，我会尽力帮助您！`;
    } else {
      response = `您好！我是龙掌柜AI运营助手 🦞

我可以帮助您处理跨境电商运营相关的各种问题：

- **选品分析** - 市场趋势、竞品研究
- **库存查询** - 库存状态、补货建议  
- **订单管理** - 订单处理、物流追踪
- **数据分析** - 运营报表、销售数据

请告诉我您需要什么帮助？`;
    }

    return NextResponse.json({
      content: response,
      model: 'assistant'
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { detail: 'AI服务暂时不可用' },
      { status: 500 }
    );
  }
}
