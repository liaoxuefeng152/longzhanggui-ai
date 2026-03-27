import { NextRequest, NextResponse } from 'next/server';

// 模拟用户数据库
const MOCK_USERS = [
  {
    id: 'U001',
    phone: 'admin',
    password: 'admin123',
    nickname: '阿峰',
    role: 'admin',
    avatar: '',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'U002',
    phone: '13800138000',
    password: '123456',
    nickname: '测试用户',
    role: 'user',
    avatar: '',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    // 验证参数
    if (!phone || !password) {
      return NextResponse.json(
        { error: '请输入账号和密码' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = MOCK_USERS.find(
      u => (u.phone === phone || u.id === phone) && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: '账号或密码错误' },
        { status: 401 }
      );
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return NextResponse.json(
        { error: '账号已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    // 生成token
    const token = `token_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
