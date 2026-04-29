import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const config = store.getMiaoshouConfig();
    return NextResponse.json({
      success: true,
      data: config || {
        phone: '',
        password: '',
        cookies: '',
        status: 'disconnected',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '获取配置失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config = store.saveMiaoshouConfig(body);
    return NextResponse.json({
      success: true,
      data: config,
      message: '配置保存成功',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '保存配置失败' },
      { status: 500 }
    );
  }
}
