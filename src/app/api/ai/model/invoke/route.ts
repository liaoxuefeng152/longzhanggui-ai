import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { scene, prompt, messages, model } = await request.json();

    if (!prompt && !messages) {
      return NextResponse.json(
        { error: '请提供prompt或messages参数' },
        { status: 400 }
      );
    }

    // 提取请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化配置
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 根据场景选择模型
    let selectedModel = model;
    if (!selectedModel) {
      switch (scene) {
        case 'customer_service':
          selectedModel = 'doubao-seed-1-8-251228';
          break;
        case 'marketing':
          selectedModel = 'doubao-seed-2-0-lite-260215';
          break;
        case 'content':
          selectedModel = 'doubao-seed-2-0-pro-260215';
          break;
        default:
          selectedModel = 'doubao-seed-1-8-251228';
      }
    }

    // 构建消息
    const chatMessages = messages || [
      { role: 'user', content: prompt },
    ];

    // 调用流式输出
    const stream = client.stream(chatMessages, {
      model: selectedModel,
      temperature: 0.7,
    });

    // 返回流式响应
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Model invoke error:', error);
    return NextResponse.json(
      { error: '模型调用失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
