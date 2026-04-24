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
    const BASE = 'http://localhost:8000';
    return [
      // AI智能体API - 代理到Python后端
      { source: '/api/ai/:path*', destination: BASE + '/api/v1/ai/:path*' },
      { source: '/api/v1/ai/:path*', destination: BASE + '/api/v1/ai/:path*' },
      // 认证API - 使用前端路由（已实现）
      { source: '/api/v1/auth/:path*', destination: '/api/v1/auth/:path*' },
    ];
  },
};

export default nextConfig;
