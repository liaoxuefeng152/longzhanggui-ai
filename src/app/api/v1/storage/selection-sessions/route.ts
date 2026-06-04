/**
 * Selection Sessions API - CRUD for selection session persistence
 * GET  /api/v1/storage/selection-sessions          - List sessions
 * POST /api/v1/storage/selection-sessions          - Create session
 * GET  /api/v1/storage/selection-sessions?id=xxx   - Get single session
 * PUT  /api/v1/storage/selection-sessions?id=xxx   - Update session
 * DELETE /api/v1/storage/selection-sessions?id=xxx - Delete session
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  createSelectionSession,
  updateSelectionSession,
  getSelectionSession,
  listSelectionSessions,
  deleteSelectionSession,
} from '@/lib/storage/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (id) {
      const session = await getSelectionSession(id);
      if (!session) {
        return NextResponse.json({ error: '会话不存在' }, { status: 404 });
      }
      return NextResponse.json({ success: true, session });
    }

    const sessions = await listSelectionSessions({ status, limit, offset });
    return NextResponse.json({ success: true, sessions });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await createSelectionSession({
      market: body.market,
      platform: body.platform,
      category: body.category,
      budget: body.budget,
      coreAppeal: body.coreAppeal,
    });
    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '创建失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少会话ID' }, { status: 400 });
    }

    const body = await request.json();
    const session = await updateSelectionSession(id, body);
    return NextResponse.json({ success: true, session });
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少会话ID' }, { status: 400 });
    }

    await deleteSelectionSession(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '删除失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
