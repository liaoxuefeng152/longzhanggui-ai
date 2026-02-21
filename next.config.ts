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
    NEXT_PUBLIC_APP_NAME: '阿峰｜跨境AI中台',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },

  // 实验性功能
  experimental: {
    // 优化构建
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // 压缩
  compress: true,

  // 生产环境优化
  swcMinify: true,

  // 路径别名（已在 tsconfig.json 中配置）
  // typescript 配置
};

export default nextConfig;
