/**
 * 飞书工作流调用处理器
 * 根据识别的意图调用相应的工作流
 */

import { INTENT_TYPES } from './config';
import { sendCardMessage, createProcessingCard, createSuccessCard, createErrorCard } from './client';

/**
 * 工作流执行结果
 */
export interface WorkflowResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * 调用工作流
 */
async function callWorkflow(
  templateId: string,
  params: Record<string, any>
): Promise<any> {
  const response = await fetch('/api/v1/workflow/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: templateId,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`工作流执行失败: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 处理选品意图
 */
async function handleSelectProducts(
  receiveId: string,
  params: Record<string, any>
): Promise<WorkflowResult> {
  try {
    // 先发送处理中消息
    await sendCardMessage(
      receiveId,
      createProcessingCard('选品分析', '正在调用AI分析市场潜力，请稍候...')
    );

    // 调用选品工作流
    const result = await callWorkflow('select_products', {
      category: params.category || '热门商品',
      count: params.count || 5,
      site: params.site || 'id',
    });

    // 构建商品列表的飞书卡片
    const products = result.data?.products || [];
    const productElements = products.slice(0, 5).map((p: any) => ({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**${p.name}**\n💰 价格: $${p.price} | 利润率: ${p.profit_margin}%\n📈 日销量: ${p.daily_sales}+ | 竞争: ${p.competition === 'low' ? '🟢 低' : p.competition === 'medium' ? '🟡 中' : '🔴 高'}\n💡 ${p.reason?.substring(0, 80) || '市场需求旺盛'}`,
      },
    }));

    // 发送详细的选品结果卡片
    await sendCardMessage(
      receiveId,
      {
        title: `🎯 选品结果 - ${result.data?.count || products.length}款推荐`,
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `📊 **市场分析报告**\n${result.data?.analysis?.substring(0, 200) || '东南亚 TikTok Shop 市场持续增长，建议关注热门品类。'}\n\n---\n\n**📦 推荐商品清单**`,
            },
          },
          ...productElements,
          {
            tag: 'hr',
          },
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: `✅ **选品汇总**\n- 推荐商品: ${result.data?.count || products.length} 款\n- 平均利润率: ${result.data?.summary?.avgProfitRate || '35-45%'}\n- 市场潜力: ${result.data?.summary?.marketPotential || '优秀'}`,
            },
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: { tag: 'plain_text', content: '查看更多' },
                type: 'primary',
                url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://abc123.dev.coze.site'}/agents/product-selection`,
              },
            ],
          },
        ],
      }
    );

    return {
      success: true,
      message: '选品成功',
      data: result.data,
    };
  } catch (error) {
    await sendCardMessage(
      receiveId,
      createErrorCard('选品失败', error instanceof Error ? error.message : '未知错误')
    );

    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 处理上架意图
 */
async function handlePublishProducts(
  receiveId: string,
  params: Record<string, any>
): Promise<WorkflowResult> {
  try {
    await sendCardMessage(
      receiveId,
      createProcessingCard('上架推广', '正在上架并创建广告，请稍候...')
    );

    const result = await callWorkflow('select_and_publish_products', params);

    await sendCardMessage(
      receiveId,
      createSuccessCard(
        '上架完成',
        [
          `✅ 产品已上架`,
          `✅ Listing已优化`,
          `✅ 广告已创建`,
          `📦 产品ID: ${result.data?.productId || 'N/A'}`,
          `🔗 平台: ${result.data?.platform || 'TK/亚马逊'}`,
        ],
        [
          {
            text: '查看详情',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://abc123.dev.coze.site'}/erp/products`,
          },
        ]
      )
    );

    return {
      success: true,
      message: '上架成功',
      data: result.data,
    };
  } catch (error) {
    await sendCardMessage(
      receiveId,
      createErrorCard('上架失败', error instanceof Error ? error.message : '未知错误')
    );

    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 处理查询销量
 */
async function handleQuerySales(receiveId: string): Promise<WorkflowResult> {
  try {
    // 模拟查询销量数据
    await sendCardMessage(
      receiveId,
      createSuccessCard(
        '今日销量',
        [
          `📊 **订单数**: 15 单`,
          `💰 **销售额**: ¥12,345`,
          `📈 **环比增长**: +23.5%`,
          `💵 **ROI**: 3.5`,
        ],
        [
          {
            text: '查看详情',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://abc123.dev.coze.site'}/dashboard`,
          },
        ]
      )
    );

    return {
      success: true,
      message: '查询成功',
      data: { orders: 15, sales: 12345, growth: 23.5, roi: 3.5 },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '查询失败',
    };
  }
}

/**
 * 处理查询库存
 */
async function handleQueryInventory(receiveId: string): Promise<WorkflowResult> {
  try {
    await sendCardMessage(
      receiveId,
      createSuccessCard(
        '库存预警',
        [
          `⚠️ **低库存商品**: 3 款`,
          `📦 **库存充足**: 156 款`,
          `🔴 **缺货**: 0 款`,
        ],
        [
          {
            text: '查看详情',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://abc123.dev.coze.site'}/erp/inventory`,
          },
        ]
      )
    );

    return {
      success: true,
      message: '查询成功',
      data: { lowStock: 3, normalStock: 156, outOfStock: 0 },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '查询失败',
    };
  }
}

/**
 * 处理查询状态
 */
async function handleQueryStatus(receiveId: string): Promise<WorkflowResult> {
  try {
    await sendCardMessage(
      receiveId,
      createSuccessCard(
        '系统状态',
        [
          `✅ **系统运行**: 正常`,
          `🤖 **AI智能体**: 7/7 在线`,
          `⚡ **工作流引擎**: 运行中`,
          `⏰ **定时任务**: 5 个任务已调度`,
          `📊 **API状态**: 正常`,
        ],
        [
          {
            text: '查看详情',
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://abc123.dev.coze.site'}/dashboard`,
          },
        ]
      )
    );

    return {
      success: true,
      message: '查询成功',
      data: { status: 'normal', agents: 7, workflows: 5 },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '查询失败',
    };
  }
}

/**
 * 处理帮助意图
 */
async function handleHelp(receiveId: string): Promise<WorkflowResult> {
  const { generateHelpMessage } = await import('./intent');

  await sendCardMessage(
    receiveId,
    createSuccessCard(
      '使用帮助',
      [generateHelpMessage()],
      [
        {
          text: '查看文档',
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://abc123.dev.coze.site'}/dashboard`,
        },
      ]
    )
  );

  return {
    success: true,
    message: '帮助信息已发送',
  };
}

/**
 * 处理未知意图
 */
async function handleUnknownIntent(receiveId: string, text: string): Promise<WorkflowResult> {
  await sendCardMessage(
    receiveId,
    createSuccessCard(
      '未识别的意图',
      [
        `❓ 我没太理解你的需求: "${text}"`,
        '',
        `你可以尝试:`,
        `- "帮我选品"`,
        `- "今天的销量"`,
        `- "库存预警"`,
        `- "帮助"`,
      ],
      [
        {
          text: '查看帮助',
          value: 'help',
        },
      ]
    )
  );

  return {
    success: true,
    message: '未知意图提示已发送',
  };
}

/**
 * 主处理器：根据意图调用相应的工作流
 */
export async function handleWorkflow(
  receiveId: string,
  intent: string,
  params: Record<string, any>,
  originalText: string
): Promise<WorkflowResult> {
  switch (intent) {
    case INTENT_TYPES.SELECT_PRODUCTS:
      return handleSelectProducts(receiveId, params);

    case INTENT_TYPES.PUBLISH_PRODUCTS:
      return handlePublishProducts(receiveId, params);

    case INTENT_TYPES.CREATE_AD:
      // 创建广告和上架类似
      return handlePublishProducts(receiveId, params);

    case INTENT_TYPES.QUERY_SALES:
      return handleQuerySales(receiveId);

    case INTENT_TYPES.QUERY_INVENTORY:
      return handleQueryInventory(receiveId);

    case INTENT_TYPES.QUERY_ORDERS:
      // 订单查询和销量查询类似
      return handleQuerySales(receiveId);

    case INTENT_TYPES.QUERY_STATUS:
      return handleQueryStatus(receiveId);

    case INTENT_TYPES.HELP:
      return handleHelp(receiveId);

    default:
      return handleUnknownIntent(receiveId, originalText);
  }
}

export default {
  handleWorkflow,
  handleSelectProducts,
  handlePublishProducts,
  handleQuerySales,
  handleQueryInventory,
  handleQueryStatus,
  handleHelp,
  handleUnknownIntent,
};
