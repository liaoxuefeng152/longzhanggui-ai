import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, VideoGenerationClient } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const productName = body.product_name || '';
    const productDescription = body.product_description || '';
    const productImages = body.product_images || [];
    const videoType = body.video_type || 'script';
    const duration = body.duration || 30;
    const platform = body.platform || 'tiktok';
    const style = body.style || 'professional';
    const language = body.language || 'id';

    if (!productName) {
      return NextResponse.json({ success: false, error: '请提供商品名称' }, { status: 400 });
    }

    const taskId = `VID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);
    const videoClient = new VideoGenerationClient();

    // 平台规格映射
    const platformSpecs: Record<string, { resolution: string; ratio: string }> = {
      tiktok: { resolution: '720p', ratio: '9:16' },
      instagram: { resolution: '720p', ratio: '4:5' },
      youtube: { resolution: '720p', ratio: '16:9' },
      shopee: { resolution: '720p', ratio: '1:1' },
    };

    const spec = platformSpecs[platform] || platformSpecs.tiktok;

    // 如果只是生成脚本
    if (videoType === 'script') {
      const prompt = `Generate a ${duration}-second video script for product: "${productName}"

Product Description: ${productDescription}
Style: ${style}
Language: ${language}

Return a JSON with this structure:
{
  "task_id": "${taskId}",
  "status": "completed",
  "video_type": "script",
  "script": "Scene-by-scene script in ${language}",
  "scenes": [{"description": "scene description", "duration": 3}],
  "duration": ${duration},
  "created_at": "${new Date().toISOString()}"
}

The script must be in ${language} language. Return only valid JSON.`;

      const response = await llmClient.invoke([
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
          scenes: [
            { description: '产品展示', duration: 5 },
            { description: '功能演示', duration: 8 },
            { description: '用户好评', duration: 5 },
            { description: '购买引导', duration: 2 }
          ],
          duration,
          created_at: new Date().toISOString(),
        };
      }

      return NextResponse.json({ success: true, data });
    }

    // 生成完整视频（脚本 + 视频）
    if (videoType === 'product_showcase' || videoType === 'full') {
      // 1. 先生成视频脚本
      const scriptPrompt = `Create a compelling ${duration}-second video script for this product:

Product Name: ${productName}
Product Description: ${productDescription}
Platform: ${platform}
Target Audience: Online shoppers

Generate:
1. An engaging opening hook (3 seconds)
2. Product showcase scenes
3. Key feature highlights
4. Call-to-action

Return ONLY a valid JSON:
{
  "script": "Full video script narrative",
  "scenes": [{"description": "detailed scene for video generation", "duration": 3}],
  "keywords": ["keyword1", "keyword2"]
}`;

      const scriptResponse = await llmClient.invoke([
        { role: 'system', content: 'You are a professional video content creator. Always return valid JSON.' },
        { role: 'user', content: scriptPrompt }
      ], { model: 'doubao-seed-1-6-251015', temperature: 0.7 });

      let scriptData;
      try {
        const jsonMatch = scriptResponse.content.match(/\{[\s\S]*\}/);
        scriptData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch {
        scriptData = {
          script: `${productName}产品展示视频。高品质，多功能，值得拥有！`,
          scenes: [{ description: `${productName}产品特写展示`, duration: duration }],
        };
      }

      // 2. 调用视频生成API
      try {
        const videoPrompt = `${scriptData.script}\n\nProduct: ${productName}\n${productDescription}`;
        
        // 使用VideoGenerationClient生成视频
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const videoOptions: any = {
          duration: Math.min(duration, 12), // API最大支持12秒
          resolution: spec.resolution,
          ratio: spec.ratio,
          generate_audio: true,
          watermark: false,
        };
        
        const result = await videoClient.videoGeneration(
          [{ type: 'text', text: videoPrompt }],
          videoOptions
        );

        // SDK返回的是对象，包含videoUrl、response、lastFrameUrl
        if (result.videoUrl) {
          return NextResponse.json({
            success: true,
            data: {
              task_id: taskId,
              status: 'completed',
              video_type: videoType,
              script: scriptData.script,
              scenes: scriptData.scenes,
              video_url: result.videoUrl,
              last_frame: result.lastFrameUrl || '',
              duration: result.response?.duration || duration,
              resolution: result.response?.resolution,
              ratio: result.response?.ratio,
              fps: result.response?.framespersecond,
              model: result.response?.model,
              created_at: new Date().toISOString(),
            },
          });
        } else {
          // 视频生成失败，返回脚本
          return NextResponse.json({
            success: true,
            data: {
              task_id: taskId,
              status: 'script_only',
              video_type: videoType,
              script: scriptData.script,
              scenes: scriptData.scenes,
              error: '视频生成服务暂时不可用',
              duration,
              created_at: new Date().toISOString(),
            },
          });
        }
      } catch (videoError) {
        console.error('Video generation error:', videoError);
        // 视频生成出错，返回脚本
        return NextResponse.json({
          success: true,
          data: {
            task_id: taskId,
            status: 'script_only',
            video_type: videoType,
            script: scriptData.script,
            scenes: scriptData.scenes,
            error: `视频生成失败: ${videoError instanceof Error ? videoError.message : 'Unknown error'}`,
            duration,
            created_at: new Date().toISOString(),
          },
        });
      }
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
