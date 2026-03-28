import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const orderId = body.order_id || '';
    const buyerMessage = body.buyer_message || '';
    const disputeType = body.dispute_type || 'refund';
    const amount = body.amount || 0;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prompt = `Handle an e-commerce dispute.

Order ID: ${orderId}
Dispute type: ${disputeType}
Amount: ${amount}
Buyer message: "${buyerMessage}"

Return a JSON with this structure:
{
  "resolution": "Proposed resolution",
  "refund_amount": 0,
  "actions": [
    "Action 1",
    "Action 2"
  ],
  "template": "Professional response template"
}

Return only valid JSON.`;

    const response = await client.invoke([
      { role: 'system', content: 'You are a dispute resolution expert for e-commerce. Always return valid JSON.' },
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
        resolution: '建议与买家协商解决',
        refund_amount: amount * 0.5,
        actions: ['联系买家确认问题', '提供部分退款或换货'],
        template: '尊敬的客户，我们已收到您的投诉，正在积极处理中...',
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Handle dispute error:', error);
    return NextResponse.json({ success: false, error: '处理纠纷失败' }, { status: 500 });
  }
}
