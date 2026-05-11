import { NextResponse } from 'next/server';
import { PlatformDAL } from '@/lib/db/dal';

// 初始化数据库连接
import '@/lib/db';

export async function GET() {
  try {
    const platforms = PlatformDAL.getAll();
    return NextResponse.json({ 
      success: true, 
      data: platforms.map(p => ({
        ...p,
        credentials: JSON.parse(p.credentials || '{}')
      }))
    });
  } catch (error) {
    console.error('[API] GET /api/v1/platforms error:', error);
    return NextResponse.json({ success: false, error: '获取平台配置失败' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, name, credentials } = body;

    if (!platform || !credentials) {
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要参数：platform, credentials' 
      }, { status: 400 });
    }

    const success = PlatformDAL.upsert({
      id: platform,
      name: name || platform,
      platform,
      credentials: JSON.stringify(credentials)
    });

    if (success) {
      return NextResponse.json({ success: true, message: '保存成功' });
    } else {
      return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('[API] POST /api/v1/platforms error:', error);
    return NextResponse.json({ success: false, error: '保存平台配置失败' }, { status: 500 });
  }
}
