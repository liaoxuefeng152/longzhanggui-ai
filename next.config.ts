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
    NEXT_PUBLIC_APP_NAME: '龙虾AI跨境无人店系统',
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
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8001';
    
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
      // 认证API - 后端处理
      {
        source: '/api/v1/auth/:path*',
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
    ];
  },
};

export default nextConfig;
