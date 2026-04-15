import { NextRequest, NextResponse } from 'next/server';

// 模拟 AI 对话处理
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '消息不能为空' },
        { status: 400 }
      );
    }

    // 简单的意图识别
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('选品') || lowerMessage.includes('市场') || lowerMessage.includes('爆款')) {
      response = `好的，我来帮您分析选品！

📊 选品分析报告

**目标市场**：${extractMarket(message)}

**热门类目推荐**：
1. 🐱 宠物用品 - 近30天搜索量上涨 45%
2. 👗 快时尚服装 - 复购率高，利润空间大
3. 🏠 家居装饰 - 物流成本低，客单价高
4. 💄 美妆工具 - 女性用户占比 78%

**选品建议**：
• 避开红海类目，选择细分赛道
• 关注季节性产品，提前布局
• 考虑物流便捷性，重量轻体积小为佳

需要我深入分析某个类目吗？`;
    } else if (lowerMessage.includes('上架') || lowerMessage.includes('发布')) {
      response = `好的，我来帮您准备上架！

📋 上架流程：

1️⃣ **采集商品信息**
   - 商品标题、主图、描述
   - 价格和库存

2️⃣ **选择目标平台**
   - TikTok Shop
   - Amazon
   - Shopee
   - Lazada

3️⃣ **填写平台专属信息**
   - 类目属性
   - 销售属性
   - 物流模板

4️⃣ **提交发布**
   - 审核通过后自动上架

请告诉我您要上架的商品，或者让我帮您从采集箱中选择？`;
    } else if (lowerMessage.includes('分析') || lowerMessage.includes('数据') || lowerMessage.includes('日报')) {
      response = `📊 运营数据分析

**今日概况**：
• 订单数：23单
• 销售额：$687.50
• 访客数：456
• 转化率：5.04%

**对比昨日**：
• 订单数 ↑ 15%
• 销售额 ↑ 12%
• 访客数 ↓ 3%（广告投放减少）

**异常提醒**：
⚠️ 商品 SKU-2024-001 库存不足（剩余 3 件）
⚠️ 广告 ACOS 偏高（32%）

**优化建议**：
💡 建议补货 SKU-2024-001
💡 调整广告竞价策略

需要我帮您处理这些问题吗？`;
    } else if (lowerMessage.includes('listing') || lowerMessage.includes('标题') || lowerMessage.includes('描述') || lowerMessage.includes('优化')) {
      response = `好的，我来帮您优化 Listing！

**优化维度**：

📝 **标题优化**
• 核心关键词前置
• 品牌 + 型号 + 特性
• 控制在 200 字符内

📋 **五点描述**
• 痛点 + 解决方案
• 产品特点逐条列出
• 使用场景描述

🔑 **关键词**
• 搜索关键词
• 长尾词
• 竞品词

💰 **定价建议**
• 参考竞品价格
• 计算成本 + 利润
• 考虑活动折扣

请提供您的商品信息，我来帮您生成优化后的内容！`;
    } else if (lowerMessage.includes('库存')) {
      response = `📦 库存预警报告

**库存不足（<10件）**：
1. SKU-2024-001 - 宠物饮水机 - 剩余 3 件
2. SKU-2024-015 - 手机支架 - 剩余 5 件
3. SKU-2024-022 - 折叠伞 - 剩余 8 件

**建议采购**：
• 立即补货：SKU-2024-001
• 本周补货：SKU-2024-015
• 关注观察：SKU-2024-022

需要我帮您生成采购单吗？`;
    } else if (lowerMessage.includes('广告') || lowerMessage.includes('acos') || lowerMessage.includes('roi')) {
      response = `📈 广告优化建议

**今日广告数据**：
• 总花费：$89.50
• 总订单：12单
• ACOS：28.5%
• ROAS：3.5x

**单品分析**：
1. 宠物饮水机 - ACOS 32%（偏高）
2. 手机支架 - ACOS 22%（正常）
3. 折叠伞 - ACOS 35%（偏高）

**优化建议**：
💡 提高宠物饮水机出价，提高竞争力
💡 降低折叠伞竞价，节省预算
💡 添加否定关键词，减少无效点击

需要我帮您调整广告策略吗？`;
    } else if (lowerMessage.includes('订单') || lowerMessage.includes('物流')) {
      response = `📦 订单物流概览

**待处理订单**：
• 待发货：5单
• 待揽收：3单
• 物流异常：1单

**异常订单**：
⚠️ 订单 #TK-2024-0890 物流停滞
   原因：地址不详
   建议：联系买家确认

**物流推荐**：
• 小件：云途、燕文
• 大件：递四方、顺丰
• 特货：出口易

需要我帮您处理这些订单吗？`;
    } else if (lowerMessage.includes('利润') || lowerMessage.includes('成本')) {
      response = `💰 利润分析

**单品利润排行 TOP 5**：

1. 手机支架 - 利润率 35%
2. 折叠伞 - 利润率 32%
3. 宠物饮水机 - 利润率 28%
4. 美妆收纳盒 - 利润率 25%
5. 厨房小工具 - 利润率 22%

**利润优化建议**：
💡 优化物流渠道，降低物流成本
💡 批量采购，降低采购成本
💡 调整定价策略，提升利润空间

需要我帮您详细分析某个商品的利润构成吗？`;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('你好') || lowerMessage.includes('hi')) {
      response = `您好！我是龙掌柜的智能运营助理 👋

我可以帮您：

🛒 **运营管理**
• 选品分析、市场调研
• 商品上架、订单处理
• 库存管理、采购建议

📊 **数据分析**
• 运营日报、周报生成
• 异常预警、问题诊断
• 利润分析、竞品对比

🎯 **智能优化**
• Listing 优化
• 广告策略调整
• 关键词挖掘

有什么我可以帮您的吗？`;
    } else {
      response = `收到您的消息：${message}

作为您的智能运营助理，我可以帮您：

🛒 **商品管理**
• 选品分析
• 图片处理
• Listing 优化
• 一键上架

📊 **运营分析**
• 数据日报
• 异常预警
• 利润分析

⚙️ **系统设置**
• 店铺管理
• 平台配置
• 飞书集成

请告诉我您需要什么帮助？`;
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: '处理失败' },
      { status: 500 }
    );
  }
}

// 提取市场信息
function extractMarket(message: string): string {
  const markets = ['东南亚', '北美', '欧洲', '英国', '印尼', '泰国', '越南', '马来西亚'];
  for (const market of markets) {
    if (message.includes(market)) return market;
  }
  return '东南亚（默认）';
}
