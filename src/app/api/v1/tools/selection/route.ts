import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * 选品分析工具 API
 * 
 * 功能：
 * - 市场趋势分析
 * - 竞品研究
 * - 蓝海类目挖掘
 * - 选品报告生成
 */

// 选品分析系统提示词
const SELECTION_SYSTEM_PROMPT = `你是龙掌柜选品分析专家，专注于东南亚跨境电商市场。

## 分析框架

### 1. 市场趋势分析
- TikTok Shop、Shopee、Lazada 热门趋势
- 季节性产品机会
- 新兴类目机会

### 2. 竞品分析维度
- 价格区间分析
- 销量预估
- 评价分析
- 差异化机会

### 3. 蓝海类目识别
- 低竞争高需求
- 供应链优势
- 利润空间评估

### 4. 风险评估
- 合规风险
- 物流风险
- 库存风险

## 输出格式
使用Markdown格式，包含表格、列表、数据对比。

## 目标市场
- 泰国 (TH)
- 越南 (VN)
- 马来西亚 (MY)
- 印尼 (ID)
- 菲律宾 (PH)

请基于用户需求，提供专业的选品分析报告。`;

interface SelectionRequest {
  category?: string;        // 类目
  targetMarket?: string;    // 目标市场
  budget?: number;          // 预算
  keywords?: string[];      // 关键词
  specificRequest?: string; // 具体需求
}

export async function POST(request: NextRequest) {
  try {
    const body: SelectionRequest = await request.json();
    const { category, targetMarket, budget, keywords, specificRequest } = body;

    // 构建分析请求
    const userMessage = `
请进行选品分析：

${category ? `**类目**: ${category}` : ''}
${targetMarket ? `**目标市场**: ${targetMarket}` : '目标市场：泰国、越南、马来西亚、印尼、菲律宾（全市场）'}
${budget ? `**预算范围**: ${budget}元` : ''}
${keywords?.length ? `**关键词**: ${keywords.join(', ')}` : ''}
${specificRequest ? `**具体需求**: ${specificRequest}` : ''}

请提供：
1. 市场趋势分析
2. 推荐3-5个选品方向
3. 每个方向的竞品分析
4. 利润空间评估
5. 风险提示
6. 行动建议
`;

    // 初始化 LLM 客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages = [
            { role: 'system' as const, content: SELECTION_SYSTEM_PROMPT },
            { role: 'user' as const, content: userMessage }
          ];

          // 发送开始信号
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', message: '开始选品分析...' })}\n\n`));

          // 流式调用大模型
          const llmStream = client.stream(messages, {
            model: 'doubao-seed-1-8-251228',
            temperature: 0.7,
          });

          let fullResponse = '';
          
          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: text })}\n\n`));
            }
          }

          // 发送完成信号
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Selection analysis error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: '分析失败，请重试' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Selection API error:', error);
    return new Response(
      JSON.stringify({ detail: '服务器内部错误' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
