import { NextResponse } from 'next/server';
import { MiaoshouDAL } from '@/lib/db/dal';

// 初始化数据库连接
import '@/lib/db';

export async function GET() {
  try {
    const config = MiaoshouDAL.get();
    return NextResponse.json({ 
      success: true, 
      data: config || { phone: '', password: '', status: 'not_configured' }
    });
  } catch (error) {
    console.error('[API] GET /api/v1/miaoshou/config error:', error);
    return NextResponse.json({ success: false, error: '获取配置失败' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { phone, password, cookies, appKey, appSecret } = body;

    // appKey和appSecret至少要有一个
    if (!appKey && !appSecret && !phone && !password) {
      return NextResponse.json({ 
        success: false, 
        error: '请至少填写AppKey/AppSecret或手机号/密码' 
      }, { status: 400 });
    }

    const config = {
      phone: phone || '',
      password: password || '',
      cookies: cookies || '',
      appKey: appKey || '',
      appSecret: appSecret || '',
      status: 'disconnected' as const,
      updated_at: new Date().toISOString(),
    };

    const success = MiaoshouDAL.save(config);

    if (success) {
      return NextResponse.json({ success: true, message: '配置保存成功' });
    } else {
      return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] PUT /api/v1/miaoshou/config error:', error);
    return NextResponse.json({ success: false, error: '保存配置失败' }, { status: 500 });
  }
}
