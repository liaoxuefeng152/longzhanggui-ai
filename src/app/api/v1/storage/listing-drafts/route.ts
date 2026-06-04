/**
 * Listing Drafts API - Persist AI-generated listing content
 * GET    /api/v1/storage/listing-drafts          - List drafts
 * POST   /api/v1/storage/listing-drafts          - Create draft
 * PUT    /api/v1/storage/listing-drafts?id=xxx   - Update draft
 */
import { NextRequest, NextResponse } from 'next/server';
import { createListingDraft, updateListingDraft, listListingDrafts } from '@/lib/storage/database';
import { uploadTextContent } from '@/lib/storage/s3';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    const drafts = await listListingDrafts({ productId, platform, limit });
    return NextResponse.json({ success: true, drafts });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, platform, market, title, bullet_points, description, keywords, language, task_id } = body;

    // Upload listing content to S3 as backup
    let storageKey: string | undefined;
    if (description || title) {
      try {
        const content = `# ${title || 'Untitled Listing'}\n\n${bullet_points ? '## Bullet Points\n' + (bullet_points as string[]).map((b, i) => `${i + 1}. ${b}`).join('\n') + '\n\n' : ''}${description || ''}${keywords ? '\n\n## Keywords\n' + (keywords as string[]).join(', ') : ''}`;
        const fileName = `ai-outputs/listing/${new Date().toISOString().split('T')[0]}/listing_${Date.now()}.md`;
        storageKey = await uploadTextContent(content, fileName);
      } catch {
        // S3 upload failed, continue without it
      }
    }

    const draft = await createListingDraft({
      taskId: task_id,
      productId: product_id,
      platform,
      market,
      title,
      bulletPoints: bullet_points,
      description,
      keywords,
      language,
      storageKey,
    });

    return NextResponse.json({ success: true, draft }, { status: 201 });
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
      return NextResponse.json({ error: '缺少草稿ID' }, { status: 400 });
    }

    const body = await request.json();
    const draft = await updateListingDraft(id, body);
    return NextResponse.json({ success: true, draft });
  } catch (err) {
    const message = err instanceof Error ? err.message : '更新失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
