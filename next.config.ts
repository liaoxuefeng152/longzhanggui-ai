import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Docker 部署必需：standalone 输出模式
  output: 'standalone',

  // 允许的开发域名
  allowedDevOrigins: ['*.dev.coze.site'],

  // 图片配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_APP_NAME: '龙掌柜智能运营系统',
    NEXT_PUBLIC_APP_VERSION: '3.0.0',
  },

  // 实验性功能
  experimental: {
    // 优化构建
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // 压缩
  compress: true,

  // 生产环境优化 - swcMinify 已在 Next.js 16 中移除

  // 服务端外部包 - 防止客户端打包包含 Node.js 模块的包
  serverExternalPackages: [
    'coze-coding-dev-sdk',
    'pg',
    'pg-connection-string',
    'dotenv',
    '@langchain/openai',
    '@langchain/core',
  ],

  // TypeScript 配置
  typescript: {
    // 开发时忽略类型错误以加快构建
    ignoreBuildErrors: false,
  },

  // API 代理 - 将需要后端处理的请求转发到FastAPI后端
  // ERP模块API - 后端处理（数据库持久化）
  // 前端自己处理的API：customer-tickets, task-logs, packages, 1688
  // 后端处理的API：erp, workflow, ai, tiktok, feishu, agents, auth, models, prompts等
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    return [
      // ERP模块API - 后端处理
      {
        source: '/api/v1/erp/:path*',
        destination: `${backendUrl}/api/v1/erp/:path*`,
      },
      // 工作流编排API - 后端处理
      {
        source: '/api/v1/workflow/:path*',
        destination: `${backendUrl}/api/v1/workflow/:path*`,
      },
      // AI智能体API - 后端处理（需要调用AI模型）
      {
        source: '/api/v1/ai/:path*',
        destination: `${backendUrl}/api/v1/ai/:path*`,
      },
      // AI智能体扩展API - 后端处理（选品、Listing、定价等）
      {
        source: '/api/v1/ai-agents/:path*',
        destination: `${backendUrl}/api/v1/ai-agents/:path*`,
      },
      // AI智能体API（无v1前缀）- 后端处理
      {
        source: '/api/ai/:path*',
        destination: `${backendUrl}/api/v1/ai/:path*`,
      },
      // TikTok Shop API - 后端处理
      {
        source: '/api/v1/tiktok/:path*',
        destination: `${backendUrl}/api/v1/tiktok/:path*`,
      },
      // 飞书API - 后端处理
      {
        source: '/api/v1/feishu/:path*',
        destination: `${backendUrl}/api/v1/feishu/:path*`,
      },
      // 智能体管理API - 后端处理
      {
        source: '/api/v1/agents/:path*',
        destination: `${backendUrl}/api/v1/agents/:path*`,
      },
      // 认证API - 后端处理（添加无v1前缀的映射）
      {
        source: '/api/v1/auth/:path*',
        destination: `${backendUrl}/api/v1/auth/:path*`,
      },
      // 认证API（无v1前缀） - 映射到后端v1版本
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/v1/auth/:path*`,
      },
      // 模型管理API - 前端处理（本地存储，开发模式）
      // {
      //   source: '/api/v1/models/:path*',
      //   destination: `${backendUrl}/api/v1/models/:path*`,
      // },
      // Prompt管理API - 后端处理
      {
        source: '/api/v1/prompts/:path*',
        destination: `${backendUrl}/api/v1/prompts/:path*`,
      },
      // 报表API - 后端处理
      {
        source: '/api/v1/reports/:path*',
        destination: `${backendUrl}/api/v1/reports/:path*`,
      },
      // 用户管理API - 后端处理
      {
        source: '/api/v1/users/:path*',
        destination: `${backendUrl}/api/v1/users/:path*`,
      },
      // 飞书用户API - 后端处理
      {
        source: '/api/v1/feishu-users/:path*',
        destination: `${backendUrl}/api/v1/feishu-users/:path*`,
      },
      // 平台绑定API - 后端处理
      {
        source: '/api/v1/platform-bindings/:path*',
        destination: `${backendUrl}/api/v1/platform-bindings/:path*`,
      },
      // 设置API - 后端处理
      {
        source: '/api/v1/settings/:path*',
        destination: `${backendUrl}/api/v1/settings/:path*`,
      },
      // 仪表盘API - 后端处理
      {
        source: '/api/v1/dashboard/:path*',
        destination: `${backendUrl}/api/v1/dashboard/:path*`,
      },
      // 订单中心API - 后端处理
      {
        source: '/api/v1/orders/:path*',
        destination: `${backendUrl}/api/v1/orders/:path*`,
      },
      // 商品库API - 后端处理
      {
        source: '/api/v1/products/:path*',
        destination: `${backendUrl}/api/v1/products/:path*`,
      },
      // 1688采集API - 后端处理
      {
        source: '/api/v1/1688/:path*',
        destination: `${backendUrl}/api/v1/1688/:path*`,
      },
      // 店铺管理API - 后端处理
      {
        source: '/api/v1/shops/:path*',
        destination: `${backendUrl}/api/v1/shops/:path*`,
      },
      // 平台配置API - 后端处理
      {
        source: '/api/v1/platforms/:path*',
        destination: `${backendUrl}/api/v1/platforms/:path*`,
      },
      // 定时任务API - 后端处理
      {
        source: '/api/v1/scheduler/:path*',
        destination: `${backendUrl}/api/v1/scheduler/:path*`,
      },
      // 角色权限API - 后端处理
      {
        source: '/api/v1/roles/:path*',
        destination: `${backendUrl}/api/v1/roles/:path*`,
      },
      // 任务日志API - 后端处理
      {
        source: '/api/v1/task-logs/:path*',
        destination: `${backendUrl}/api/v1/task-logs/:path*`,
      },
      // 套餐管理API - 后端处理
      {
        source: '/api/v1/packages/:path*',
        destination: `${backendUrl}/api/v1/packages/:path*`,
      },
      // 客服工单API - 后端处理
      {
        source: '/api/v1/customer-tickets/:path*',
        destination: `${backendUrl}/api/v1/customer-tickets/:path*`,
      },
      // 系统初始化API - 后端处理
      {
        source: '/api/v1/system/:path*',
        destination: `${backendUrl}/api/v1/system/:path*`,
      },
      // 认证API（无v1前缀）- 后端处理
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/api/v1/auth/:path*`,
      },
      // 模型管理API（无v1前缀）- 后端处理
      {
        source: '/api/models/:path*',
        destination: `${backendUrl}/api/v1/models/:path*`,
      },
      // Prompt管理API（无v1前缀）- 后端处理
      {
        source: '/api/prompts/:path*',
        destination: `${backendUrl}/api/v1/prompts/:path*`,
      },
      // 控制台API（无v1前缀）- 后端处理
      {
        source: '/api/dashboard/:path*',
        destination: `${backendUrl}/api/v1/dashboard/:path*`,
      },
      // 飞书用户API（无v1前缀）- 后端处理
      {
        source: '/api/feishu-users/:path*',
        destination: `${backendUrl}/api/v1/feishu-users/:path*`,
      },
    ];
  },
};

export default nextConfig;
