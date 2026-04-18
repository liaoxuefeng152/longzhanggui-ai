'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import AIAssistant from '@/components/ai-assistant';

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
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header user={user} onLogout={onLogout} />
      <Sidebar />
      <main className="pt-[60px] pl-[220px]">
        <div className="p-6">{children}</div>
      </main>
      {/* AI助手组件 */}
      <AIAssistant />
    </div>
  );
}
