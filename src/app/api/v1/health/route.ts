import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: '龙掌柜智能运营系统',
    version: '1.0.0',
    mode: 'frontend-only'
  });
}
