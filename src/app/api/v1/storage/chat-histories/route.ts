/**
 * Chat Histories API - Persist AI chat conversations
 * GET  /api/v1/storage/chat-histories                    - Get messages by session
 * POST /api/v1/storage/chat-histories                    - Save a message
 * GET  /api/v1/storage/chat-histories?recent=true        - Get recent session IDs
 */
import { NextRequest, NextResponse } from 'next/server';
import { saveChatMessage, getChatHistory, getRecentSessions } from '@/lib/storage/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const recent = searchParams.get('recent');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (recent === 'true') {
      const sessions = await getRecentSessions(limit);
      return NextResponse.json({ success: true, sessions });
    }

    if (!sessionId) {
      return NextResponse.json({ error: '缺少session_id参数' }, { status: 400 });
    }

    const messages = await getChatHistory(sessionId, limit);
    return NextResponse.json({ success: true, messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, role, content, intent_type, metadata } = body;

    if (!session_id || !role || !content) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const msg = await saveChatMessage({
      sessionId: session_id,
      role,
      content,
      intentType: intent_type,
      metadata,
    });

    return NextResponse.json({ success: true, message: msg }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '保存失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
