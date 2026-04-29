import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '龙掌柜智能运营系统',
    template: '%s | 龙掌柜智能运营系统',
  },
  description: '专为TK东南亚跨境场景设计的智能运营平台，提供智能体、模型调用、Prompt管理等核心能力',
  keywords: [
    '老板',
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
