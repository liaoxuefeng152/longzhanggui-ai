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

  // 帮助
  HELP: [
    /帮助/i,
    /怎么用/i,
    /能做什么/i,
    /指令/i,
  ],
} as const;
