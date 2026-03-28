import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const message = body.message || '';
    const language = body.language || 'id';
    const context = body.context || {};

    if (!message) {
      return NextResponse.json({ success: false, error: '请提供客户消息' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prompt = `Generate a professional customer service reply in ${language} language.

Customer message: "${message}"
Context: ${JSON.stringify(context)}

Return a JSON with this structure:
{
  "reply": "Your professional reply in ${language}",
  "tone": "friendly/professional/empathetic",
  "suggested_actions": [
    "Action 1",
    "Action 2"
  ]
}

The reply must be in ${language} language, not Chinese. Return only valid JSON.`;

    const response = await client.invoke([
      { role: 'system', content: 'You are a professional customer service expert for e-commerce. Always return valid JSON. Reply in the target language, never in Chinese.' },
      { role: 'user', content: prompt }
    ], { model: 'doubao-seed-1-6-251015', temperature: 0.7 });

    let data;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      }
    } catch {
      data = {
        reply: 'Thank you for your message. We will assist you shortly.',
        tone: 'professional',
        suggested_actions: ['Review order details', 'Check shipping status'],
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Customer reply error:', error);
    return NextResponse.json({ success: false, error: '生成客服回复失败' }, { status: 500 });
  }
}
