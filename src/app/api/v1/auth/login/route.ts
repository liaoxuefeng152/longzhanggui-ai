import { NextRequest, NextResponse } from 'next/server';

/**
 * 登录接口 - /api/v1/auth/login
 */

// 简单的用户存储（内存中）
const users: Record<string, { phone: string; password: string; nickname: string; role: string; id: string }> = {
  'admin': {
    id: 'admin-001',
    phone: 'admin',
    password: 'admin123',
    nickname: '管理员',
    role: 'admin'
  },
  '13800138000': {
    id: 'user-001',
    phone: '13800138000',
    password: 'admin123',
    nickname: '阿峰',
    role: 'admin'
  }
};

// JWT简单的token生成（仅用于演示）
function createToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ 
    sub: userId, 
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 
  })).toString('base64url');
  const signature = Buffer.from(`${header}.${payload}.secret`).toString('base64url');
  return `${header}.${payload}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { detail: '请输入账号和密码' },
        { status: 400 }
      );
    }

    // 查找用户（支持 username 或 phone）
    const user = users[username] || Object.values(users).find(u => u.phone === username);
    
    if (!user || user.password !== password) {
      return NextResponse.json(
        { detail: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成token
    const token = createToken(user.id);

    // 返回登录成功响应
    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        role: user.role,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: '服务器内部错误' },
      { status: 500 }
    );
  }
}
