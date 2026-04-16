import { NextRequest, NextResponse } from 'next/server';

/**
 * 前端登录API - 不依赖后端
 * 使用本地验证，支持演示账号登录
 */

// 演示用户数据
const DEMO_USERS = [
  {
    id: 'user-001',
    phone: '13800138000',
    nickname: '管理员',
    role: 'admin',
    avatar: undefined,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    phone: '13900139000',
    nickname: '运营专员',
    role: 'operator',
    avatar: undefined,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    // 验证必填字段
    if (!phone || !password) {
      return NextResponse.json(
        { error: '请输入账号和密码' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = DEMO_USERS.find(u => u.phone === phone);

    // 演示环境：任意密码都能登录（只要账号存在）
    if (!user) {
      // 对于不存在的用户，也允许登录（演示用）
      const newUser = {
        id: `user-${Date.now()}`,
        phone,
        nickname: `用户${phone.slice(-4)}`,
        role: 'operator',
        avatar: undefined,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 生成token（演示用）
      const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString('base64');

      return NextResponse.json({
        access_token: token,
        token_type: 'Bearer',
        user: newUser,
      });
    }

    // 生成token（演示用）
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      access_token: token,
      token_type: 'Bearer',
      user,
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
