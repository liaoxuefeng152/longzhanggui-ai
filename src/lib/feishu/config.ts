/**
 * 飞书机器人配置
 * 飞书开放平台：https://open.feishu.cn/
 */

export const FEISHU_CONFIG = {
  // 飞书应用信息
  appId: 'cli_a925102a8179dbd6',
  appSecret: 'ig2gFSC1KU3wE00sdZOgX3aYalqtAZ2K',
  verificationToken: '4johe0bj1fCG9V2bAhvTne8Fmz7RCo07',

  // API 端点
  apiBaseUrl: 'https://open.feishu.cn/open-apis',
  webhookUrl: '/api/v1/feishu/webhook',

  // 加密密钥（如果启用了加密）
  encryptKey: '', // 飞书提供的 Encrypt Key（可选）

  // 消息类型
  messageType: {
    TEXT: 'text', // 文本消息
    INTERACTIVE: 'interactive', // 交互式卡片
    POST: 'post', // 富文本
    CARD: 'card', // 卡片
  },
} as const;

// 飞书 API 路径
export const FEISHU_API_PATHS = {
  // 获取 Tenant Access Token
  TENANT_ACCESS_TOKEN: '/auth/v3/tenant_access_token/internal',

  // 发送消息
  SEND_MESSAGE: '/im/v1/messages',

  // 获取用户信息
  GET_USER_INFO: '/contact/v3/users/:user_id',

  // 获取群信息
  GET_GROUP_INFO: '/im/v1/chats/:chat_id',
} as const;

// 意图类型定义
export const INTENT_TYPES = {
  // 选品相关
  SELECT_PRODUCTS: 'select_products', // 选品

  // 上架相关
  PUBLISH_PRODUCTS: 'publish_products', // 上架

  // 广告相关
  CREATE_AD: 'create_ad', // 创建广告
  OPTIMIZE_AD: 'optimize_ad', // 优化广告

  // 客服相关
  CUSTOMER_SERVICE: 'customer_service', // 客服

  // 查询相关
  QUERY_SALES: 'query_sales', // 查询销量
  QUERY_INVENTORY: 'query_inventory', // 查询库存
  QUERY_ORDERS: 'query_orders', // 查询订单
  QUERY_STATUS: 'query_status', // 查询状态

  // 智能助理 - 日常问询
  DAILY_REPORT: 'daily_report', // 运营日报
  TOP_PRODUCTS: 'top_products', // TOP商品
  AD_SUMMARY: 'ad_summary', // 广告汇总
  SERVICE_QUALITY: 'service_quality', // 服务质量
  COMPARISON: 'comparison', // 对比分析
  TREND: 'trend', // 环比分析

  // 智能助理 - 分析建议
  PRICING_ADVICE: 'pricing_advice', // 定价建议
  COMPETITOR_ANALYSIS: 'competitor_analysis', // 竞品分析
  ROI_ANALYSIS: 'roi_analysis', // ROI分析
  SLOW_SELLING: 'slow_selling', // 滞销分析

  // 智能助理 - 文案生成
  COPYWRITING: 'copywriting', // 文案生成
  REVIEW_REPLY: 'review_reply', // 好评催评
  BAD_REVIEW_REPLY: 'bad_review_reply', // 差评回复

  // 智能助理 - 报表生成
  REPORT_GENERATION: 'report_generation', // 报表生成
  EXPORT_DATA: 'export_data', // 导出数据

  // 系统相关
  HELP: 'help', // 帮助
  UNKNOWN: 'unknown', // 未知意图
} as const;

// 意图模板
export const INTENT_TEMPLATES = {
  // 选品
  SELECT_PRODUCTS: [
    /选品/i,
    /推荐.*产品/i,
    /帮我选/i,
    /爆款/i,
  ],

  // 上架
  PUBLISH_PRODUCTS: [
    /上架/i,
    /发布/i,
    /推广/i,
  ],

  // 广告
  CREATE_AD: [
    /创建广告/i,
    /投放广告/i,
    /新建广告/i,
  ],
  OPTIMIZE_AD: [
    /优化广告/i,
    /调整广告/i,
  ],

  // 客服
  CUSTOMER_SERVICE: [
    /客服/i,
    /回复/i,
    /纠纷/i,
    /退款/i,
  ],

  // 查询销量
  QUERY_SALES: [
    /销量/i,
    /销售/i,
    /业绩/i,
    /订单量/i,
  ],

  // 查询库存
  QUERY_INVENTORY: [
    /库存/i,
    /库存预警/i,
    /缺货/i,
  ],

  // 查询订单
  QUERY_ORDERS: [
    /订单/i,
    /订单状态/i,
    /物流/i,
  ],

  // 查询状态
  QUERY_STATUS: [
    /状态/i,
    /运行情况/i,
    /系统状态/i,
  ],

  // 智能助理 - 日常问询
  DAILY_REPORT: [
    /今日运营/i,
    /今天运营/i,
    /运营情况/i,
    /运营日报/i,
  ],
  TOP_PRODUCTS: [
    /卖得最好/i,
    /top.*产品/i,
    /爆款/i,
    /热销/i,
  ],
  AD_SUMMARY: [
    /广告.*花.*钱/i,
    /广告.*消耗/i,
    /广告.*花费/i,
  ],
  SERVICE_QUALITY: [
    /好评率/i,
    /服务.*质量/i,
    /客户.*满意度/i,
  ],
  COMPARISON: [
    /.*比.*少了/i,
    /.*比.*下降/i,
    /.*下降.*原因/i,
    /为什么.*下降/i,
  ],
  TREND: [
    /和.*对比/i,
    /环比/i,
    /增长.*多少/i,
    /.*增长/i,
  ],

  // 智能助理 - 分析建议
  PRICING_ADVICE: [
    /定.*价格/i,
    /定价/i,
    /售价/i,
    /应该卖.*钱/i,
  ],
  COMPETITOR_ANALYSIS: [
    /竞品/i,
    /竞争对手/i,
    /.*降价/i,
  ],
  ROI_ANALYSIS: [
    /roi/i,
    /投入产出/i,
    /广告.*效果/i,
  ],
  SLOW_SELLING: [
    /滞销/i,
    /不好卖/i,
    /销量.*差/i,
  ],

  // 智能助理 - 文案生成
  COPYWRITING: [
    /写.*消息/i,
    /生成.*文案/i,
    /文案/i,
  ],
  REVIEW_REPLY: [
    /催好评/i,
    /好评.*消息/i,
    /请求.*好评/i,
  ],
  BAD_REVIEW_REPLY: [
    /差评.*回复/i,
    /回复.*差评/i,
    /差评.*话术/i,
  ],

  // 智能助理 - 报表生成
  REPORT_GENERATION: [
    /生成日报/i,
    /生成.*报告/i,
    /报表/i,
  ],
  EXPORT_DATA: [
    /导出/i,
    /下载.*数据/i,
    /数据.*导出/i,
  ],

  // 帮助
  HELP: [
    /帮助/i,
    /怎么用/i,
    /能做什么/i,
    /指令/i,
  ],
} as const;
