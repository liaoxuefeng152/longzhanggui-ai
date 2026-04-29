import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 调用store中的测试连接方法
    const result = await store.testMiaoshouConnection(body);
    
    if (result.success) {
      // 更新配置状态
      store.saveMiaoshouConfig({
        ...body,
        status: 'connected',
        lastSync: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '测试连接失败' },
      { status: 500 }
    );
  }
}
