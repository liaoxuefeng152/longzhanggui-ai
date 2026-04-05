import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings } from '@/lib/data/settings-store';

interface BackupInfo {
  last_backup: string;
  backup_size: string;
  backup_path: string;
}

/**
 * GET /api/v1/settings/backup - 获取备份信息
 */
export async function GET(request: NextRequest) {
  try {
    const backupInfo: BackupInfo = {
      last_backup: new Date().toISOString(),
      backup_size: '0KB',
      backup_path: '/backups/settings.json',
    };

    return NextResponse.json(backupInfo);
  } catch (error) {
    console.error('获取备份信息失败:', error);
    return NextResponse.json(
      { error: '获取备份信息失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/settings/backup - 创建备份
 */
export async function POST(request: NextRequest) {
  try {
    // 获取所有设置
    const settings = getAllSettings();

    // 模拟创建备份（实际应保存到文件系统或对象存储）
    const timestamp = new Date().toISOString();
    const backupSize = JSON.stringify(settings).length;

    return NextResponse.json({
      success: true,
      message: '备份创建成功',
      timestamp,
      size: `${(backupSize / 1024).toFixed(2)}KB`,
    });
  } catch (error) {
    console.error('创建备份失败:', error);
    return NextResponse.json(
      { error: '创建备份失败' },
      { status: 500 }
    );
  }
}
