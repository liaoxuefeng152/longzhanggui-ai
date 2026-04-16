import { NextRequest, NextResponse } from 'next/server';

// 意图识别和响应生成
const generateResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // 运营日报类
  if (lowerMessage.includes('运营') || lowerMessage.includes('日报') || lowerMessage.includes('今天怎么样')) {
    return `今日运营概览：

📊 核心数据
• 销售额: ¥52,860 (+13.1%)
• 订单量: 86单 (+19.4%)
• 广告花费: ¥12,580 (+12.3%)

⚠️ 需要关注
• 5个商品库存不足
• US站广告ROI降至2.1

💡 AI建议
1. 尽快补货，避免断货损失
2. 检查US站广告投放策略
3. 考虑优化Listing提升转化率

需要我帮您生成完整的运营日报吗？`;
  }
  
  // 选品分析类
  if (lowerMessage.includes('选品') || lowerMessage.includes('新品') || lowerMessage.includes('要不要上')) {
    return `关于选品分析，我可以帮您：

🔍 AI选品流程
1. 需求分析 - 告诉我您的目标市场、预算、类目偏好
2. 选品方向 - AI推荐3-5个潜力方向
3. 爆款挖掘 - 分析市场热销商品
4. 可行性分析 - 利润/合规/风险评估
5. 供应商匹配 - 1688优质供应商推荐

🚀 建议操作
点击左侧菜单「选品智能体」，进入完整的AI选品流程

或者直接告诉我您的需求，例如：
• "帮我选3款宠物用品，目标印尼市场"
• "分析一下家居品类的爆款"`;
  }
  
  // 催好评类
  if (lowerMessage.includes('催好评') || lowerMessage.includes('评价') || lowerMessage.includes('好评')) {
    return `催好评模板已为您生成：

---
亲爱的[客户姓名]，

感谢您购买我们的产品！希望它能带给您满意的体验~

如果您在使用过程中有任何问题，请随时联系我们，我们会第一时间为您解决。

如果您对本次购物满意，期待您的好评支持！您的认可是我们最大的动力🌟

祝好！
[店铺名称]团队
---

💡 温馨提示
• 签收后5-7天催评效果最佳
• 避免在休息时间发送
• 可针对高价值订单重点催评

需要我帮您优化文案吗？`;
  }
  
  // 广告优化类
  if (lowerMessage.includes('广告') || lowerMessage.includes('ROI') || lowerMessage.includes('投放')) {
    return `广告优化分析：

📈 当前状态
• US站ROI: 2.1 (下降)
• 建议优化方向: 关键词调整、出价优化

🎯 AI优化建议
1. 关键词策略
   • 清理无效关键词
   • 添加长尾词增加曝光
   • 参考竞品投放词

2. 出价调整
   • 高转化词提高出价
   • 低转化词降低出价或暂停

3. 素材优化
   • 测试新创意
   • 优化缩略图提升点击率

🚀 建议操作
点击左侧菜单「广告智能体」，获取更详细的广告优化方案`;
  }
  
  // 库存查询类
  if (lowerMessage.includes('库存') || lowerMessage.includes('补货')) {
    return `库存预警汇总：

🔴 紧急补货
• SKU-2024001: 仅剩5件
• SKU-2024005: 仅剩8件

🟡 即将断货
• SKU-2024003: 仅剩15件
• SKU-2024008: 仅剩20件

📦 建议
1. 优先处理紧急补货商品
2. 预估日销量，计算补货周期
3. 考虑备货到海外仓

需要我帮您生成补货清单吗？`;
  }
  
  // 报表生成类
  if (lowerMessage.includes('报表') || lowerMessage.includes('报告') || lowerMessage.includes('生成')) {
    return `我可以帮您生成以下报表：

📋 可生成的报表
1. 运营日报 - 每日数据汇总
2. 周报 - 本周运营分析
3. 月报 - 月度总结与趋势
4. 商品分析 - TOP商品/滞销品
5. 广告报告 - ROI/花费分析

🎯 建议操作
点击左侧菜单「数据复盘」，选择您需要的报表类型

或者直接告诉我：
• "生成今日日报"
• "生成本周周报"`;
  }
  
  // 默认回复
  return `您好！我是龙掌柜AI助手，可以帮您：

📦 商品运营
• 选品分析和建议
• Listing优化
• 库存管理

📊 数据分析
• 运营日报生成
• 数据复盘建议
• 异常预警

📣 智能客服
• 催好评文案
• 客户回复模板
• 纠纷处理建议

🎯 广告投放
• 广告优化建议
• ROI分析

请告诉我您的具体需求，例如：
• "今天的运营情况怎么样？"
• "帮我分析一下这个新品要不要上？"
• "帮我写一个催好评的消息"`;
};

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '消息不能为空' },
        { status: 400 }
      );
    }
    
    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const response = generateResponse(message.trim());
    
    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
