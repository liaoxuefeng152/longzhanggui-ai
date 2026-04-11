/**
 * 店铺数据同步 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { store as globalStore } from '@/lib/store';

// 触发店铺数据同步
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sync_type = 'all' } = body;

    const shops = globalStore.shops || [];
    const shopIndex = shops.findIndex((s: any) => s.id === id);

    if (shopIndex === -1) {
      return NextResponse.json(
        { success: false, error: '店铺不存在' },
        { status: 404 }
      );
    }

    const shop = shops[shopIndex];

    // 记录同步任务
    if (!globalStore.syncTasks) {
      globalStore.syncTasks = [];
    }

    const syncTask = {
      id: `sync_${Date.now()}`,
      shop_id: id,
      shop_name: shop.name,
      shop_platform: shop.platform,
      sync_type,
      status: 'running',
      progress: 0,
      details: {
        orders: { total: 0, synced: 0 },
        products: { total: 0, synced: 0 },
        inventory: { total: 0, synced: 0 },
      },
      started_at: new Date().toISOString(),
      logs: [`[${new Date().toISOString()}] 开始同步 ${shop.name}`],
    };

    globalStore.syncTasks.push(syncTask);

    // 模拟异步同步过程
    simulateSync(id, sync_type);

    return NextResponse.json({
      success: true,
      data: {
        task_id: syncTask.id,
        message: '同步任务已启动',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '同步启动失败' },
      { status: 500 }
    );
  }
}

// 模拟同步过程
async function simulateSync(shopId: string, syncType: string) {
  const steps = [
    { delay: 1000, progress: 20, log: '正在连接平台API...' },
    { delay: 2000, progress: 40, log: '正在获取订单数据...' },
    { delay: 3000, progress: 60, log: '正在同步商品信息...' },
    { delay: 4000, progress: 80, log: '正在更新库存数据...' },
    { delay: 5000, progress: 100, log: '同步完成' },
  ];

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, step.delay));
    
    const tasks = globalStore.syncTasks;
    if (tasks) {
      const task = tasks.find((t: any) => t.shop_id === shopId && t.status === 'running');
      if (task) {
        task.progress = step.progress;
        task.logs.push(`[${new Date().toISOString()}] ${step.log}`);
        
        if (step.progress === 100) {
          task.status = 'completed';
          task.completed_at = new Date().toISOString();
          
          // 更新店铺统计
          const shops = globalStore.shops;
          if (shops) {
            const shopIndex = shops.findIndex((s: any) => s.id === shopId);
            if (shopIndex !== -1) {
              shops[shopIndex].stats.last_sync = new Date().toISOString();
              shops[shopIndex].stats.total_orders = Math.floor(Math.random() * 100) + 50;
              shops[shopIndex].stats.total_sales = Math.floor(Math.random() * 10000) + 5000;
              shops[shopIndex].stats.total_products = Math.floor(Math.random() * 200) + 100;
              globalStore.shops = shops;
            }
          }
        }
      }
    }
  }
}

// 获取同步状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tasks = globalStore.syncTasks || [];
    
    const shopTasks = tasks
      .filter((t: any) => t.shop_id === id)
      .sort((a: any, b: any) => 
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );

    return NextResponse.json({
      success: true,
      data: {
        tasks: shopTasks,
        current: shopTasks.find((t: any) => t.status === 'running'),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取同步状态失败' },
      { status: 500 }
    );
  }
}
