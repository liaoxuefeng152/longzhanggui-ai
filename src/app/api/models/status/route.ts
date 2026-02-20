import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 返回模型状态（模拟数据）
    const models = [
      {
        id: 'doubao-api',
        name: '豆包API',
        status: 'active',
        modelId: 'doubao-seed-1-8-251228',
        totalTokens: 1258000,
        dailyLimit: 1000000,
        todayUsed: 12580,
      },
      {
        id: 'openai-api',
        name: 'OpenAI API',
        status: 'active',
        modelId: 'gpt-4',
        totalTokens: 856000,
        dailyLimit: 500000,
        todayUsed: 5680,
      },
    ];

    return NextResponse.json({
      success: true,
      data: { models },
    });
  } catch (error) {
    console.error('Get models status error:', error);
    return NextResponse.json(
      { error: '获取模型状态失败' },
      { status: 500 }
    );
  }
}
