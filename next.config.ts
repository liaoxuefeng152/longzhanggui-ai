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
};

export default nextConfig;
