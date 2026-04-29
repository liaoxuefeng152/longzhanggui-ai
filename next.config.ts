import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'coze-coding-project.tos.coze.site',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: '龙掌柜智能运营系统',
    NEXT_PUBLIC_APP_VERSION: '3.0.0',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  compress: true,
  serverExternalPackages: [
    'coze-coding-dev-sdk',
    'pg',
    'pg-connection-string',
    'dotenv',
    '@langchain/openai',
    '@langchain/core',
  ],
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    // 后端服务端口 (8000)
    const BASE = 'http://localhost:8000';
    return [
      // ===== 飞书Webhook回调 - 代理到Python后端 =====
      { source: '/api/webhook/event', destination: BASE + '/feishu/callback' },
      
      // ===== AI智能体API - 代理到Python后端 =====
      
      // 选品智能体
      { source: '/api/v1/tools/selection', destination: BASE + '/api/v1/ai/select-products' },
      
      // 图片智能体
      { source: '/api/v1/tools/image', destination: BASE + '/api/v1/ai/process-image' },
      
      // 视频智能体
      { source: '/api/v1/tools/video', destination: BASE + '/api/v1/ai/generate-video' },
      
      // Listing优化智能体
      { source: '/api/v1/tools/listing', destination: BASE + '/api/v1/ai/optimize-listing' },
      
      // 定价智能体
      { source: '/api/v1/tools/pricing', destination: BASE + '/api/v1/ai/calculate-price' },
      
      // 客服智能体
      { source: '/api/v1/tools/customer-service', destination: BASE + '/api/v1/ai/customer-reply' },
      
      // 采集1688商品
      { source: '/api/v1/tools/scrape', destination: BASE + '/api/v1/ai/collect-1688' },
      { source: '/api/v1/tools/scrape/batch', destination: BASE + '/api/v1/ai/collect-1688/batch' },
      
      // 广告投放
      { source: '/api/v1/tools/ads/create', destination: BASE + '/api/v1/ai/create-ad' },
      
      // ===== 通用AI API =====
      { source: '/api/ai/:path*', destination: BASE + '/api/v1/ai/:path*' },
      { source: '/api/v1/ai/:path*', destination: BASE + '/api/v1/ai/:path*' },
      
      // ===== ERP系统API - 前端本地处理，不代理到后端 =====
      // ERP 前端已有完整的 API 路由实现 (src/app/api/v1/erp/)
      // 无需代理到后端
      
      // ===== 认证API - 使用前端路由（已实现） =====
      { source: '/api/v1/auth/:path*', destination: '/api/v1/auth/:path*' },
      { source: '/api/auth/:path*', destination: '/api/auth/:path*' },
      
      // ===== 妙手ERP API - 代理到Python后端 =====
      { source: '/api/miaoshou/:path*', destination: BASE + '/api/v1/miaoshou/:path*' },
    ];
  },
};

export default nextConfig;
