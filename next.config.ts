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
};

export default nextConfig;
