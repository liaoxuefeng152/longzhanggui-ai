import { NextRequest, NextResponse } from 'next/server';

// 模拟任务日志数据
const taskLogs: Record<string, any> = {
  'TL-001': {
    id: 'TL-001',
    task_id: 'TASK-202603270001-A1B2C3D4',
    agent_id: 'AGENT-001',
    user_id: 'USR-001',
    action: '选品分析',
    status: 'completed',
    input: { category: '家居用品', market: 'TikTok东南亚', filters: { price_range: '10-50', rating: '>4.0' } },
    output: { 
      recommended_products: 15, 
      score: 92,
      details: [
        { name: '创意收纳盒', score: 95, trend: 'up' },
        { name: '多功能置物架', score: 91, trend: 'stable' },
        { name: '简约花瓶', score: 89, trend: 'up' },
      ]
    },
    duration: 12.5,
    tokens_used: 3500,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  'TL-002': {
    id: 'TL-002',
    task_id: 'TASK-202603270002-E5F6G7H8',
    agent_id: 'AGENT-002',
    user_id: 'USR-001',
    action: '图片处理',
    status: 'completed',
    input: { product_id: 'PROD-001', style: '白底图', remove_background: true },
    output: { images_generated: 3, processing_time: 8.2, format: 'PNG' },
    duration: 8.2,
    tokens_used: 1200,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  'TL-003': {
    id: 'TL-003',
    task_id: 'TASK-202603270003-I9J0K1L2',
    agent_id: 'AGENT-003',
    user_id: 'USR-002',
    action: 'Listing优化',
    status: 'failed',
    input: { product_id: 'PROD-002', platform: 'Amazon', target_market: 'US' },
    error: 'API限流：请求过于频繁，请稍后重试',
    duration: 5.1,
    tokens_used: 800,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
};

/**
 * 获取任务日志详情
 * GET /api/v1/task-logs/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const log = taskLogs[id];

    if (!log) {
      return NextResponse.json(
        { error: '任务日志不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error('获取任务日志详情失败:', error);
    return NextResponse.json(
      { error: '获取任务日志详情失败' },
      { status: 500 }
    );
  }
}
