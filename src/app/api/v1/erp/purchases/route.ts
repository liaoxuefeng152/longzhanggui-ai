import { NextRequest, NextResponse } from 'next/server';

// GET - 获取采购单列表（返回空数据，等待数据库表创建）
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    purchases: [],
    total: 0,
    message: '暂无采购单数据，请在数据库中创建采购单表',
  });
}

// POST - 创建采购单（返回错误提示）
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: false,
      error: '采购单功能暂未实现，需要先创建采购单数据库表',
    }, { status: 501 });
  } catch (error) {
    console.error('创建采购单失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建采购单失败',
    }, { status: 500 });
  }
}