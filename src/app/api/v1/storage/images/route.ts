/**
 * Generated Images API - Persist AI-generated images to S3
 * GET  /api/v1/storage/images          - List images
 * POST /api/v1/storage/images          - Save image (transfer from temp URL to S3)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createGeneratedImage, listGeneratedImages } from '@/lib/storage/database';
import { transferFromUrl, getFileUrl, generateStorageKey } from '@/lib/storage/s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageType = searchParams.get('image_type') || undefined;
    const productId = searchParams.get('product_id') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    const images = await listGeneratedImages({ imageType, productId, limit });

    // Generate presigned URLs for images with storage keys
    const imagesWithUrls = await Promise.all(
      images.map(async (img) => {
        if (img.storage_key) {
          try {
            const url = await getFileUrl(img.storage_key);
            return { ...img, access_url: url };
          } catch {
            return { ...img, access_url: null };
          }
        }
        return { ...img, access_url: img.original_url };
      })
    );

    return NextResponse.json({ success: true, images: imagesWithUrls });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { original_url, image_type, prompt, params, product_id, task_id } = body;

    if (!original_url) {
      return NextResponse.json({ error: '缺少图片URL' }, { status: 400 });
    }

    // Transfer from temporary URL to S3
    const fileName = generateStorageKey(image_type || 'image', `img_${Date.now()}.png`);
    let storageKey: string;
    try {
      storageKey = await transferFromUrl(original_url, 30000);
    } catch {
      // If transfer fails, still save the record with original URL
      storageKey = '';
    }

    // Save record to database
    const image = await createGeneratedImage({
      taskId: task_id,
      originalUrl: original_url,
      storageKey: storageKey || undefined,
      imageType: image_type,
      prompt,
      params,
      productId: product_id,
    });

    // Generate access URL
    let accessUrl = original_url;
    if (storageKey) {
      try {
        accessUrl = await getFileUrl(storageKey);
      } catch {
        // fallback to original URL
      }
    }

    return NextResponse.json({ success: true, image, access_url: accessUrl }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '保存失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
