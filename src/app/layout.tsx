import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '阿峰｜跨境AI中台',
    template: '%s | 阿峰｜跨境AI中台',
  },
  description: '专为TK东南亚跨境场景设计的AI能力中台，提供智能体、模型调用、Prompt管理等核心能力',
  keywords: [
    '阿峰',
    '跨境AI',
    'AI中台',
    'TK东南亚',
    '智能体',
    'Prompt管理',
    '模型路由',
    'AI客服',
    '自推广',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
