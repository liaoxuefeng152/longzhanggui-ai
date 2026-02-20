import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, code, role } = await request.json();

    // 验证参数
    if (!phone || !code) {
      return NextResponse.json(
        { error: '请提供手机号和验证码' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: '手机号格式不正确' },
        { status: 400 }
      );
    }

    // 模拟验证码验证（实际应该从缓存或数据库验证）
    if (code !== '123456') {
      return NextResponse.json(
        { error: '验证码错误' },
        { status: 401 }
      );
    }

    // 模拟用户登录/注册
    const user = {
      id: `U${Date.now()}`,
      phone,
      nickname: role === 'admin' ? '阿峰' : `用户${phone.slice(-4)}`,
      role: role || 'user',
      avatar: '',
      trialDays: 3,
      isPaid: false,
      createdAt: new Date().toISOString(),
    };

    // 返回用户信息和token（实际应该生成JWT）
    return NextResponse.json({
      success: true,
      data: {
        user,
        token: 'mock-jwt-token-' + Date.now(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
