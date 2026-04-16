'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Bell, Settings, MessageSquare } from 'lucide-react';

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
  const pathname = usePathname();

  const navItems = [
    { label: '数据', href: '/', icon: '📊' },
    { label: '选品', href: '/select', icon: '🔍' },
    { label: '上新', href: '/publish', icon: '🚀' },
    { label: '广告', href: '/ads', icon: '📈' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* 顶部导航栏 - 深绿 #1D2129 */}
      <header className="fixed top-0 left-0 right-0 h-[60px] bg-[#1D2129] z-50">
        <div className="h-full flex items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">龙掌柜</span>
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
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 右侧操作 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-[#22C97A]" />
              <span className="text-white/80">飞书已绑定</span>
            </div>
            <Link
              href="/settings"
              className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 内容区 */}
      <main className="pt-[60px]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
