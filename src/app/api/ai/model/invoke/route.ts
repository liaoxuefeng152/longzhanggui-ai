import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const prompt = body.prompt || body.message || '';
    const model = body.model || 'doubao-pro-256k';
    
    // 模拟AI响应
    const responses = [
      '根据您的要求，我已经分析了相关数据。以下是我的建议：\n\n1. **市场分析**：当前该类目在目标市场有较高需求，竞争度中等。\n\n2. **选品建议**：建议关注以下几个方向的产品：\n   - 高性价比产品\n   - 差异化功能产品\n   - 季节性爆款\n\n3. **定价策略**：建议采用中高端定价策略，利润空间更大。',
      '好的，我来帮您处理这个任务。\n\n经过分析，我有以下几点建议：\n\n- 首先，需要关注产品的合规性\n- 其次，建议优化产品图片\n- 最后，建议完善产品描述\n\n请问您需要我详细解释哪个方面？',
      '我理解您的需求。基于当前数据，这是一个很好的机会。\n\n**关键发现：**\n- 市场需求旺盛\n- 竞争相对较小\n- 利润空间可观\n\n**行动建议：**\n1. 尽快上架产品\n2. 优化关键词\n3. 投放精准广告',
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    return NextResponse.json({
      success: true,
      data: {
        content: response,
        model,
        usage: {
          prompt_tokens: prompt.length,
          completion_tokens: response.length,
          total_tokens: prompt.length + response.length,
        },
      },
    });
  } catch (error) {
    console.error('Model invoke error:', error);
    return NextResponse.json(
      { success: false, error: '模型调用失败' },
      { status: 500 }
    );
  }
}
