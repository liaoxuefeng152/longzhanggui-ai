/**
 * Report API - Upload and download selection reports
 * POST /api/v1/storage/report          - Upload report to S3 + save key to session
 * GET  /api/v1/storage/report?key=xxx  - Get presigned URL for report download
 */
import { NextRequest, NextResponse } from 'next/server';
import { uploadTextContent, getFileUrl } from '@/lib/storage/s3';
import { updateSelectionSession } from '@/lib/storage/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: '缺少报告key' }, { status: 400 });
    }

    const url = await getFileUrl(key, 3600); // 1 hour access
    return NextResponse.json({ success: true, download_url: url });
  } catch (err) {
    const message = err instanceof Error ? err.message : '获取下载链接失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, session_id, file_name } = body;

    if (!content) {
      return NextResponse.json({ error: '缺少报告内容' }, { status: 400 });
    }

    // Upload report to S3
    const fileName = file_name || `ai-outputs/selection/${new Date().toISOString().split('T')[0]}/report_${Date.now()}.md`;
    const storageKey = await uploadTextContent(content, fileName);

    // Update session with report storage key
    if (session_id) {
      try {
        await updateSelectionSession(session_id, {
          report_storage_key: storageKey,
          report_content: content,
          status: 'completed',
        });
      } catch {
        // Session update failed, but report is still saved to S3
      }
    }

    // Generate download URL
    const downloadUrl = await getFileUrl(storageKey, 86400);

    return NextResponse.json({
      success: true,
      storage_key: storageKey,
      download_url: downloadUrl,
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '上传报告失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
