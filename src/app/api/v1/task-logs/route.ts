import { NextRequest, NextResponse } from 'next/server';

// 智能体名称映射
const AGENT_NAMES: Record<string, string> = {
  'product-selection': '选品智能体',
  'image-design': '图片设计',
  'video-generation': '视频生成',
  'listing-optimization': 'Listing优化',
  'advertising': '广告投放',
  'customer-service': '客服智能体',
  'data-review': '数据复盘',
};

// 智能体动作映射
const AGENT_ACTIONS: Record<string, string> = {
  'product-selection': '选品分析',
  'image-design': '图片处理',
  'video-generation': '视频生成',
  'listing-optimization': 'Listing优化',
  'advertising': '广告创建',
  'customer-service': '客服回复',
  'data-review': '数据报告',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const agentId = searchParams.get('agent_id');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // 模拟数据 + 数据库真实数据
    // 目前暂时返回模拟数据，实际应从 ai_tasks 表查询
    const mockLogs = [
      {
        id: '1',
        task_id: 'task-001',
        agent_id: 'product-selection',
        agent_name: '选品智能体',
        action: '选品分析',
        status: 'success',
        duration: 15.2,
        tokens_used: 2500,
        cost: 0.05,
        request_params: { market: '东南亚', category: '宠物用品' },
        response_summary: '推荐3个选品方向：智能喂食器、宠物窝、玩具',
        created_at: '2026-06-29 10:00:00',
      },
      {
        id: '2',
        task_id: 'task-002',
        agent_id: 'image-design',
        agent_name: '图片设计',
        action: '图片翻译',
        status: 'success',
        duration: 8.5,
        tokens_used: 0,
        cost: 0.02,
        request_params: { image_url: 'https://example.com/image.jpg', target_lang: 'en' },
        response_summary: '成功翻译图片文字为英文',
        created_at: '2026-06-29 10:05:00',
      },
      {
        id: '5c699eaa',
        task_id: '5c699eaa-2709-42b4-8525-e9ff79247221',
        agent_id: 'video-generation',
        agent_name: '视频生成',
        action: '商品视频',
        status: 'success',
        duration: 45.0,
        tokens_used: 0,
        cost: 0.50,
        request_params: { prompt: '测试视频' },
        response_summary: '生成视频：mov_bbb_0b6cc2d7.mp4',
        created_at: '2026-06-29 00:59:40',
        output_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
    ];

    let logs = [...mockLogs];

    // 过滤状态
    if (status && status !== 'all') {
      logs = logs.filter(log => log.status === status);
    }

    // 过滤智能体
    if (agentId && agentId !== 'all') {
      logs = logs.filter(log => log.agent_id === agentId);
    }

    // 按时间倒序
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // 统计数据
    const stats = {
      total: logs.length,
      success: logs.filter(l => l.status === 'success').length,
      failed: logs.filter(l => l.status === 'failed').length,
      processing: logs.filter(l => l.status === 'processing').length,
      avgDuration: logs.length > 0 
        ? logs.reduce((sum, l) => sum + (l.duration || 0), 0) / logs.length 
        : 0,
    };

    return NextResponse.json({
      logs,
      stats,
      pagination: {
        page,
        pageSize,
        total: logs.length,
      },
    });
  } catch (error) {
    console.error('[TaskLogs API] Error:', error);
    return NextResponse.json({ error: '获取任务日志失败' }, { status: 500 });
  }
}