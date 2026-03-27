import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 登出只需要返回成功，客户端会清除本地存储的token
  return NextResponse.json({
    success: true,
    message: '已退出登录',
  });
}
