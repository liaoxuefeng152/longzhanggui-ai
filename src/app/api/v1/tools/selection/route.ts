import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

/**
 * 选品分析工具 API - 优化版
 * 
 * 功能：
 * - 市场趋势分析
 * - 竞品研究
 * - 蓝海类目挖掘
 * - 结构化商品推荐（用于爆款挖掘阶段）
 * - 选品报告生成
 */

// 选品分析系统提示词 - 要求结构化输出
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

## 目标市场
- 泰国 (TH)
- 越南 (VN)
- 马来西亚 (MY)
- 印尼 (ID)
- 菲律宾 (PH)

## 输出格式要求

请在分析报告的最后，用以下格式输出推荐商品列表（必须包含此部分）：

---PRODUCTS_START---
[
  {
    "name": "商品名称",
    "category": "商品类目",
    "core卖点": "核心卖点描述",
    "price": 9.99,
    "monthlySales": 5000,
    "competition": "蓝海|中等|红海",
    "recommendIndex": 5,
    "trend": 68,
    "searchKeywords": "1688搜索关键词"
  }
]
---PRODUCTS_END---

字段说明：
- name: 商品中文名称
- category: 商品所属类目
- core卖点: 10-20字的核心卖点
- price: 建议零售价（美元）
- monthlySales: 预估月销量
- competition: 竞争程度
- recommendIndex: 推荐指数1-5
- trend: 增长趋势百分比
- searchKeywords: 用于1688搜索的关键词

重要：
1. 请先输出详细的Markdown分析报告
2. 报告末尾必须包含 ---PRODUCTS_START--- 和 ---PRODUCTS_END--- 标记之间的JSON数组
3. 推荐至少3-5个商品
4. 商品信息必须基于分析内容，不要凭空编造数据`;

interface SelectionRequest {
  category?: string;
  targetMarket?: string;
  budget?: string;
  budgetLabel?: string;
  keywords?: string[];
  specificRequest?: string;
  platform?: string;
  site?: string;
  directionNames?: string[]; // 用户选中的方向名
}

export async function POST(request: NextRequest) {
  try {
    const body: SelectionRequest = await request.json();
    const { category, targetMarket, budget, budgetLabel, keywords, specificRequest, platform, site, directionNames } = body;

    // 构建分析请求
    const userMessage = `
请进行选品分析：

${platform ? `**目标平台**: ${platform}` : '目标平台：TikTok Shop'}
${site || targetMarket ? `**目标市场**: ${site || targetMarket}` : '目标市场：泰国、越南、马来西亚、印尼、菲律宾（全市场）'}
${category ? `**类目**: ${category}` : ''}
${budget ? `**预算范围**: ${budget}` : ''}
${budgetLabel ? `**预算说明**: ${budgetLabel}` : ''}
${keywords?.length ? `**关键词**: ${keywords.join(', ')}` : ''}
${directionNames?.length ? `**选品方向**: ${directionNames.join('、')}` : ''}
${specificRequest ? `**具体需求**: ${specificRequest}` : ''}

请提供：
1. 市场趋势分析
2. 推荐3-5个具体商品
3. 每个商品的竞品分析
4. 利润空间评估
5. 风险提示
6. 行动建议

注意：报告末尾必须用 ---PRODUCTS_START--- 和 ---PRODUCTS_END--- 标记输出推荐商品JSON数组。
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
          
          try {
            for await (const chunk of llmStream) {
              if (chunk.content) {
                const text = chunk.content.toString();
                fullResponse += text;
                try {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content: text })}\n\n`));
                } catch (enqueueErr) {
                  // Controller已关闭（客户端断开），停止发送但继续收集数据
                  console.warn('Stream controller closed, client likely disconnected');
                  break;
                }
              }
            }
          } catch (streamErr) {
            console.error('LLM stream error:', streamErr);
          }

          // 发送完成信号 - 包含解析后的商品数据
          const products = parseProductsFromResponse(fullResponse);
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', fullResponse, products })}\n\n`));
          } catch (_e) {
            // Controller已关闭，忽略
          }
          try {
            controller.close();
          } catch (_e) {
            // Controller已关闭，忽略
          }
        } catch (error) {
          console.error('Selection analysis error:', error);
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: '分析失败，请重试' })}\n\n`));
          } catch (_e) {
            // Controller已关闭，忽略
          }
          try {
            controller.close();
          } catch (_e) {
            // Controller已关闭，忽略
          }
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

/**
 * 从AI响应中解析推荐商品
 */
function parseProductsFromResponse(response: string): any[] {
  try {
    // 尝试从 ---PRODUCTS_START--- 和 ---PRODUCTS_END--- 之间提取JSON
    const productsMatch = response.match(/---PRODUCTS_START---\s*\n?([\s\S]*?)\n?\s*---PRODUCTS_END---/);
    
    if (productsMatch) {
      let jsonStr = productsMatch[1].trim();
      // 去掉代码块包裹
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      
      const products = JSON.parse(jsonStr);
      if (Array.isArray(products) && products.length > 0) {
        return products.map((p: any, i: number) => ({
          id: `HOT-${Date.now()}-${i}`,
          name: p.name || `推荐商品${i + 1}`,
          category: p.category || '综合品类',
          core卖点: p['core卖点'] || p.core卖点 || '市场分析推荐',
          price: Number(p.price) || 9.99,
          monthlySales: Number(p.monthlySales) || 3000,
          competition: validateCompetition(p.competition),
          recommendIndex: Math.min(5, Math.max(1, Number(p.recommendIndex) || 4)),
          trend: Number(p.trend) || 50,
          searchKeywords: p.searchKeywords || p.name || '',
        }));
      }
    }
  } catch (e) {
    console.warn('结构化商品解析失败:', (e as Error).message);
  }

  // 降级：尝试从Markdown表格中提取
  try {
    const tableMatches = response.match(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*\$?([^|]+)\s*\|\s*([^|]+)\s*\|/g);
    if (tableMatches && tableMatches.length > 1) {
      // 跳过表头
      const rows = tableMatches.slice(1);
      return rows.slice(0, 5).map((row, i) => {
        const parts = row.split('|').filter(p => p.trim());
        return {
          id: `HOT-${Date.now()}-${i}`,
          name: parts[0]?.trim() || `推荐商品${i + 1}`,
          category: parts[1]?.trim() || '综合品类',
          core卖点: '市场分析推荐',
          price: parseFloat(parts[2]?.replace(/[$,]/g, '')) || 9.99,
          monthlySales: parseInt(parts[3]?.replace(/[,+]/g, '')) || 3000,
          competition: '中等' as const,
          recommendIndex: 4,
          trend: 50,
          searchKeywords: parts[0]?.trim() || '',
        };
      });
    }
  } catch (e2) {
    console.warn('表格商品解析也失败:', (e2 as Error).message);
  }

  return [];
}

function validateCompetition(val: any): '蓝海' | '中等' | '红海' {
  if (val === '蓝海' || val === '红海' || val === '中等') return val;
  return '中等';
}
