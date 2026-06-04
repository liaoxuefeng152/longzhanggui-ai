/**
 * Generated Videos API - Persist AI-generated videos to S3
 * GET  /api/v1/storage/videos          - List videos
 * POST /api/v1/storage/videos          - Save video (transfer from temp URL to S3)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createGeneratedVideo, listGeneratedVideos } from '@/lib/storage/database';
import { transferFromUrl, getFileUrl } from '@/lib/storage/s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoType = searchParams.get('video_type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    const videos = await listGeneratedVideos({ videoType, limit });

    const videosWithUrls = await Promise.all(
      videos.map(async (vid) => {
        if (vid.storage_key) {
          try {
            const url = await getFileUrl(vid.storage_key);
            return { ...vid, access_url: url };
          } catch {
            return { ...vid, access_url: null };
          }
        }
        return { ...vid, access_url: vid.original_url };
      })
    );

    return NextResponse.json({ success: true, videos: videosWithUrls });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { original_url, video_type, prompt, params, duration, product_id, task_id } = body;

    if (!original_url) {
      return NextResponse.json({ error: '缺少视频URL' }, { status: 400 });
    }

    // Transfer from temporary URL to S3
    let storageKey = '';
    try {
      storageKey = await transferFromUrl(original_url, 60000);
    } catch {
      // If transfer fails, still save the record
    }

    const video = await createGeneratedVideo({
      taskId: task_id,
      originalUrl: original_url,
      storageKey: storageKey || undefined,
      videoType: video_type,
      prompt,
      params,
      duration,
      productId: product_id,
    });

    let accessUrl = original_url;
    if (storageKey) {
      try {
        accessUrl = await getFileUrl(storageKey);
      } catch {
        // fallback
      }
    }

    return NextResponse.json({ success: true, video, access_url: accessUrl }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '保存失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
