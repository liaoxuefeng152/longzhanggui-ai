import { NextRequest, NextResponse } from 'next/server';

// 模拟用户数据库
const MOCK_USERS = [
  {
    id: 'U001',
    phone: 'admin',
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
    nickname: '测试用户',
    role: 'user',
    avatar: '',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    // 从header获取token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    if (!token || !token.startsWith('token_')) {
      return NextResponse.json(
        { error: 'token无效' },
        { status: 401 }
      );
    }

    // 从token中解析用户ID
    const parts = token.split('_');
    const userId = parts[1];
    
    // 查找用户
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
