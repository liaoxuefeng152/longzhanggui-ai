import { NextRequest, NextResponse } from 'next/server';
import {
  getSetting,
  updateSetting,
} from '@/lib/data/settings-store';

interface FeishuConfig {
  app_id: string;
  app_secret?: string;
  bot_id?: string;
  encrypt_key?: string;
  verification_token?: string;
}

/**
 * GET /api/v1/settings/feishu - 获取飞书配置
 */
export async function GET(request: NextRequest) {
  try {
    const config: FeishuConfig = {
      app_id: getSetting('feishu_app_id')?.value as string || '',
      app_secret: getSetting('feishu_app_secret')?.value as string,
      bot_id: getSetting('feishu_bot_id')?.value as string,
      encrypt_key: getSetting('feishu_encrypt_key')?.value as string,
      verification_token: getSetting('feishu_verification_token')?.value as string,
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('获取飞书配置失败:', error);
    return NextResponse.json(
      { error: '获取飞书配置失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/settings/feishu - 更新飞书配置
 */
export async function PUT(request: NextRequest) {
  try {
    const body: Partial<FeishuConfig> = await request.json();

    // 验证app_id必填
    if (!body.app_id) {
      return NextResponse.json(
        { error: 'app_id必填' },
        { status: 400 }
      );
    }

    // 更新配置
    if (body.app_id !== undefined) {
      updateSetting('feishu_app_id', body.app_id);
    }
    if (body.app_secret !== undefined) {
      updateSetting('feishu_app_secret', body.app_secret);
    }
    if (body.bot_id !== undefined) {
      updateSetting('feishu_bot_id', body.bot_id);
    }
    if (body.encrypt_key !== undefined) {
      updateSetting('feishu_encrypt_key', body.encrypt_key);
    }
    if (body.verification_token !== undefined) {
      updateSetting('feishu_verification_token', body.verification_token);
    }

    return NextResponse.json({
      success: true,
      message: '飞书配置已更新',
    });
  } catch (error) {
    console.error('更新飞书配置失败:', error);
    return NextResponse.json(
      { error: '更新飞书配置失败' },
      { status: 500 }
    );
  }
}
