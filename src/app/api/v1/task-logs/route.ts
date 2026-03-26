import { NextRequest, NextResponse } from 'next/server';

// 模拟任务日志数据
const taskLogs: any[] = [
  {
    id: 'TL-001',
    task_id: 'TASK-202603270001-A1B2C3D4',
    agent_id: 'AGENT-001',
    user_id: 'USR-001',
    action: '选品分析',
    status: 'completed',
    input: { category: '家居用品', market: 'TikTok东南亚' },
    output: { recommended_products: 15, score: 92 },
    duration: 12.5,
    tokens_used: 3500,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'TL-002',
    task_id: 'TASK-202603270002-E5F6G7H8',
    agent_id: 'AGENT-002',
    user_id: 'USR-001',
    action: '图片处理',
    status: 'completed',
    input: { product_id: 'PROD-001', style: '白底图' },
    output: { images_generated: 3, processing_time: 8.2 },
    duration: 8.2,
    tokens_used: 1200,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'TL-003',
    task_id: 'TASK-202603270003-I9J0K1L2',
    agent_id: 'AGENT-003',
    user_id: 'USR-002',
    action: 'Listing优化',
    status: 'failed',
    input: { product_id: 'PROD-002', platform: 'Amazon' },
    error: 'API限流：请求过于频繁，请稍后重试',
    duration: 5.1,
    tokens_used: 800,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 'TL-004',
    task_id: 'TASK-202603270004-M3N4O5P6',
    agent_id: 'AGENT-004',
    user_id: 'USR-001',
    action: '广告投放',
    status: 'completed',
    input: { campaign_type: 'auto', budget: 50 },
    output: { campaigns_created: 3, estimated_reach: 15000 },
    duration: 15.8,
    tokens_used: 4200,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'TL-005',
    task_id: 'TASK-202603270005-Q7R8S9T0',
    agent_id: 'AGENT-005',
    user_id: 'USR-003',
    action: '客服回复',
    status: 'blocked',
    input: { ticket_id: 'TK-2026-0001', language: 'id' },
    error: '风控拦截：检测到敏感词"好评返现"',
    duration: 0.5,
    tokens_used: 150,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'TL-006',
    task_id: 'TASK-202603270006-U1V2W3X4',
    agent_id: 'AGENT-006',
    user_id: 'USR-001',
    action: '数据复盘',
    status: 'running',
    input: { date_range: '2026-03-01~2026-03-27' },
    duration: 0,
    tokens_used: 0,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'TL-007',
    task_id: 'TASK-202603270007-Y5Z6A7B8',
    agent_id: 'AGENT-001',
    user_id: 'USR-002',
    action: '选品分析',
    status: 'completed',
    input: { category: '电子产品', market: 'Amazon美国' },
    output: { recommended_products: 20, score: 88 },
    duration: 18.3,
    tokens_used: 4800,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'TL-008',
    task_id: 'TASK-202603270008-C9D0E1F2',
    agent_id: 'AGENT-005',
    user_id: 'USR-001',
    action: '客服回复',
    status: 'completed',
    input: { ticket_id: 'TK-2026-0002', language: 'en' },
    output: { reply_generated: true, compliance_checked: true },
    duration: 3.2,
    tokens_used: 650,
    created_at: new Date(Date.now() - 7 * 3600000).toISOString(),
  },
];

/**
 * 获取任务日志列表
 * GET /api/v1/task-logs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const agentId = searchParams.get('agent_id') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '20');

    let filtered = [...taskLogs];

    if (status) {
      filtered = filtered.filter(log => log.status === status);
    }

    if (agentId) {
      filtered = filtered.filter(log => log.agent_id === agentId);
    }

    const startIndex = (page - 1) * pageSize;
    const paginatedLogs = filtered.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      logs: paginatedLogs,
      total: filtered.length,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('获取任务日志失败:', error);
    return NextResponse.json(
      { error: '获取任务日志失败' },
      { status: 500 }
    );
  }
}
