'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Bell, Settings, MessageSquare } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  user?: {
    nickname: string;
    avatar?: string;
    role: 'user' | 'admin';
  };
  onLogout?: () => void;
  useNewNavigation?: boolean;
}

export default function MainLayout({ 
  children, 
  user, 
  onLogout, 
  useNewNavigation = false 
}: MainLayoutProps) {
  const pathname = usePathname();

  if (!useNewNavigation) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
        <Header user={user} onLogout={onLogout} />
        <Sidebar />
        <main className="pt-[60px] pl-[220px]">
          <div className="p-6">{children}</div>
        </main>
      </div>
    );
  }

  const navItems = [
    { label: '数据', href: '/', icon: '📊' },
    { label: '选品', href: '/select', icon: '🔍' },
    { label: '上新', href: '/publish', icon: '🚀' },
    { label: '广告', href: '/ads', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 h-[60px] bg-white border-b z-50">
        <div className="h-full flex items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#22C97A]">龙掌柜</span>
          </div>

          {/* 主导航 */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-5 py-2 text-[14px] rounded-full transition-all',
                  pathname === item.href
                    ? 'bg-[#22C97A] text-white font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 右侧操作 */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
              <MessageSquare className="h-5 w-5" />
            </button>
            <Link
              href="/settings"
              className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="pt-[60px]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
