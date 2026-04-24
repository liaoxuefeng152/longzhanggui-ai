import { NextRequest, NextResponse } from 'next/server';

// 获取单个商品的辅助函数（复用主列表的数据）
// 注意：在实际的API服务中应该使用数据库，这里只是前端的模拟实现

// GET - 获取单个商品
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 模拟数据库查询
    const { default: store } = await import('@/lib/store');
    const product = store.getProduct(id);

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json(
      { error: '获取商品详情失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新商品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 更新store中的商品
    const { default: store } = await import('@/lib/store');
    const product = store.getProduct(id);

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    // 更新商品
    store.updateProduct(id, {
      ...body,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });

    const updated = store.getProduct(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json(
      { error: '更新商品失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除商品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 从store中删除
    const { default: store } = await import('@/lib/store');
    const product = store.getProduct(id);

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 404 }
      );
    }

    store.deleteProduct(id);

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json(
      { error: '删除商品失败' },
      { status: 500 }
    );
  }
}
