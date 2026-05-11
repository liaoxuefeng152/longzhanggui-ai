import { NextRequest, NextResponse } from 'next/server';

/**
 * 图片处理API
 * 支持：翻译、优化、白底、去水印
 * 
 * 调用后端 Python 图片处理服务
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      image_url,
      mode = 'translate',
      target_language = 'en',
      product_description,
    } = body;

    if (!image_url) {
      return NextResponse.json(
        { success: false, error: '请提供图片URL' },
        { status: 400 }
      );
    }

    // 调用后端API
    const response = await fetch(`${BACKEND_URL}/api/v1/ai/process-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url,
        mode,
        target_language,
        product_description,
      }),
    });

    const result = await response.json();

    if (result.status === 'success' || result.success) {
      return NextResponse.json({
        success: true,
        data: {
          processed_url: result.result_url || result.processed_url,
          original_url: image_url,
          translations: result.translated_text ? [{
            original: result.ocr_text || '',
            translated: result.translated_text,
            position: 'unknown',
          }] : [],
          target_language_name: getLanguageName(target_language),
          analysis: result.analysis,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || '图片处理失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image process error:', error);
    const errorMessage = error instanceof Error ? error.message : '图片处理失败';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English (英语)',
    zh: '中文',
    id: 'Indonesian (印尼语)',
    th: 'Thai (泰语)',
    vi: 'Vietnamese (越南语)',
    ms: 'Malay (马来语)',
    ja: 'Japanese (日语)',
    ko: 'Korean (韩语)',
  };
  return names[code] || code;
}
