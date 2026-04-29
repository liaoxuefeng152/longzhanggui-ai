import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    
    const config = db.prepare('SELECT * FROM feishu_config WHERE id = 1').get();
    
    if (!config) {
      return NextResponse.json({
        success: true,
        data: {
          appId: '',
          appSecret: '',
          botName: '龙掌柜跨境AI全能助手',
          enabled: false,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('获取飞书配置失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取配置失败',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, appSecret, botName, enabled } = body;
    
    if (!appId || !appSecret) {
      return NextResponse.json({
        success: false,
        error: 'AppID和AppSecret不能为空',
      }, { status: 400 });
    }
    
    const db = getDb();
    
    // 使用REPLACE INTO确保存在则更新，不存在则插入
    db.prepare(`
      INSERT OR REPLACE INTO feishu_config (id, app_id, app_secret, bot_name, enabled, updated_at)
      VALUES (
        1,
        ?,
        ?,
        ?,
        ?,
        datetime('now')
      )
    `).run(appId, appSecret, botName || '龙掌柜跨境AI全能助手', enabled ? 1 : 0);
    
    return NextResponse.json({
      success: true,
      message: '配置保存成功',
    });
  } catch (error) {
    console.error('保存飞书配置失败:', error);
    return NextResponse.json({
      success: false,
      error: '保存配置失败',
    }, { status: 500 });
  }
}
