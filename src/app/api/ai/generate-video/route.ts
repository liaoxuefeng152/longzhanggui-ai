import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const productName = body.product_name || '';
    const productImages = body.product_images || [];
    const videoType = body.video_type || 'script';
    const duration = body.duration || 30;
    const style = body.style || 'professional';
    const language = body.language || 'id';

    if (!productName) {
      return NextResponse.json({ success: false, error: '请提供商品名称' }, { status: 400 });
    }

    const taskId = `VID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 如果只是生成脚本
    if (videoType === 'script') {
      const prompt = `Generate a ${duration}-second video script for product: "${productName}"

Style: ${style}
Language: ${language}

Return a JSON with this structure:
{
  "task_id": "${taskId}",
  "status": "completed",
  "video_type": "script",
  "script": "Scene-by-scene script in ${language}",
  "duration": ${duration},
  "created_at": "${new Date().toISOString()}"
}

The script must be in ${language} language. Return only valid JSON.`;

      const response = await client.invoke([
        { role: 'system', content: 'You are a video script writer for e-commerce. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ], { model: 'doubao-seed-1-6-251015', temperature: 0.8 });

      let data;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        }
      } catch {
        data = {
          task_id: taskId,
          status: 'completed',
          video_type: 'script',
          script: `场景1: 产品展示\n场景2: 功能演示\n场景3: 用户好评\n场景4: 购买引导`,
          duration,
          created_at: new Date().toISOString(),
        };
      }

      return NextResponse.json({ success: true, data });
    }

    // 其他类型返回处理中状态
    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        status: 'processing',
        video_type: videoType,
        duration,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Generate video error:', error);
    return NextResponse.json({ success: false, error: '视频生成失败' }, { status: 500 });
  }
}
