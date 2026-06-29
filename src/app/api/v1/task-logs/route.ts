import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/storage/database/supabase-client';

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

    // 从数据库查询 ai_tasks 表
    let query = supabase
      .from('ai_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    // 过滤状态
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 过滤智能体
    if (agentId && agentId !== 'all') {
      query = query.eq('agent_id', agentId);
    }

    // 分页
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: tasks, error, count } = await query;

    if (error) {
      console.error('[TaskLogs API] 查询失败:', error);
      // 返回空数据而不是模拟数据
      return NextResponse.json({
        logs: [],
        stats: { total: 0, success: 0, failed: 0, processing: 0, avgDuration: 0 },
        pagination: { page, pageSize, total: 0 },
      });
    }

    // 转换为前端需要的格式
    const logs = (tasks || []).map(task => ({
      id: task.id,
      task_id: task.task_id || task.id,
      agent_id: task.agent_id,
      agent_name: AGENT_NAMES[task.agent_id] || task.agent_id,
      action: AGENT_ACTIONS[task.agent_id] || '未知操作',
      status: task.status,
      duration: task.duration || 0,
      tokens_used: task.tokens_used || 0,
      cost: task.cost || 0,
      request_params: task.request_params || {},
      response_summary: task.response_summary || '',
      created_at: task.created_at,
      output_url: task.output_url,
    }));

    // 获取统计数据（不带分页）
    const { data: allTasks } = await supabase
      .from('ai_tasks')
      .select('status, duration');

    const stats = {
      total: allTasks?.length || 0,
      success: allTasks?.filter(t => t.status === 'success' || t.status === 'completed').length || 0,
      failed: allTasks?.filter(t => t.status === 'failed' || t.status === 'error').length || 0,
      processing: allTasks?.filter(t => t.status === 'processing' || t.status === 'running').length || 0,
      avgDuration: allTasks && allTasks.length > 0 
        ? allTasks.reduce((sum, t) => sum + (t.duration || 0), 0) / allTasks.length 
        : 0,
    };

    return NextResponse.json({
      logs,
      stats,
      pagination: {
        page,
        pageSize,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('[TaskLogs API] Error:', error);
    return NextResponse.json({
      logs: [],
      stats: { total: 0, success: 0, failed: 0, processing: 0, avgDuration: 0 },
      pagination: { page: 1, pageSize: 20, total: 0 },
    });
  }
}