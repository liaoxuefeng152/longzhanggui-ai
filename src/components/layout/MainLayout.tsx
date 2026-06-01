'use client';

import { ReactNode, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import AIAssistant from '@/components/ai-assistant';
import { DemoLimitDialog } from '@/components/demo-limit-dialog';
import { setupDemoGuard, isDemoMode } from '@/lib/demo';

interface MainLayoutProps {
  children: ReactNode;
  user?: {
    nickname: string;
    avatar?: string;
    role: 'user' | 'admin';
  };
  onLogout?: () => void;
}

export default function MainLayout({ children, user, onLogout }: MainLayoutProps) {
  // 注册全局演示模式点击拦截器
  useEffect(() => {
    const cleanup = setupDemoGuard();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Header user={user} onLogout={onLogout} />
      <Sidebar />
      <main className="pt-[60px] pl-[220px]">
        <div className="p-6">{children}</div>
      </main>
      {/* 全局AI助手悬浮图标 */}
      <AIAssistant />
      {/* 演示模式写操作限制弹窗 */}
      <DemoLimitDialog />
    </div>
  );
}
