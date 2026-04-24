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
      { source: '/api/v1/ai-agents/:path*', destination: BASE + '/api/v1/ai-agents/:path*' },
      { source: '/api/v1/tiktok/:path*', destination: BASE + '/api/v1/tiktok/:path*' },
      { source: '/api/v1/feishu/:path*', destination: BASE + '/api/v1/feishu/:path*' },
      { source: '/api/v1/agents/:path*', destination: BASE + '/api/v1/agents/:path*' },
      { source: '/api/v1/prompts/:path*', destination: BASE + '/api/v1/prompts/:path*' },
      { source: '/api/v1/reports/:path*', destination: BASE + '/api/v1/reports/:path*' },
      { source: '/api/v1/users/:path*', destination: BASE + '/api/v1/users/:path*' },
      { source: '/api/v1/feishu-users/:path*', destination: BASE + '/api/v1/feishu-users/:path*' },
      { source: '/api/v1/platform-bindings/:path*', destination: BASE + '/api/v1/platform-bindings/:path*' },
      { source: '/api/v1/settings/:path*', destination: BASE + '/api/v1/settings/:path*' },
      { source: '/api/v1/dashboard/:path*', destination: BASE + '/api/v1/dashboard/:path*' },
      { source: '/api/v1/orders/:path*', destination: BASE + '/api/v1/orders/:path*' },
      { source: '/api/v1/products/:path*', destination: BASE + '/api/v1/products/:path*' },
      { source: '/api/v1/1688/:path*', destination: BASE + '/api/v1/1688/:path*' },
      { source: '/api/v1/shops/:path*', destination: BASE + '/api/v1/shops/:path*' },
      { source: '/api/v1/platforms/:path*', destination: BASE + '/api/v1/platforms/:path*' },
      { source: '/api/v1/scheduler/:path*', destination: BASE + '/api/v1/scheduler/:path*' },
      { source: '/api/v1/roles/:path*', destination: BASE + '/api/v1/roles/:path*' },
      { source: '/api/v1/task-logs/:path*', destination: BASE + '/api/v1/task-logs/:path*' },
      { source: '/api/v1/packages/:path*', destination: BASE + '/api/v1/packages/:path*' },
      { source: '/api/v1/customer-tickets/:path*', destination: BASE + '/api/v1/customer-tickets/:path*' },
      { source: '/api/v1/system/:path*', destination: BASE + '/api/v1/system/:path*' },
      { source: '/api/auth/:path*', destination: BASE + '/api/v1/auth/:path*' },
      { source: '/api/v1/auth/:path*', destination: BASE + '/api/v1/auth/:path*' },
      { source: '/api/models/:path*', destination: BASE + '/api/v1/models/:path*' },
      { source: '/api/prompts/:path*', destination: BASE + '/api/v1/prompts/:path*' },
      { source: '/api/dashboard/:path*', destination: BASE + '/api/v1/dashboard/:path*' },
      { source: '/api/feishu-users/:path*', destination: BASE + '/api/v1/feishu-users/:path*' },
    ];
  },
};

export default nextConfig;
