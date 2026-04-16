'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Bell, Settings, MessageSquare, Menu, X } from 'lucide-react';

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
      <header className="fixed top-0 left-0 right-0 h-[60px] bg-[#1D2129] z-50 flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">龙掌柜</span>
        </div>

        {/* 右侧操作 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-[#22C97A]" />
            <span className="text-white/80">飞书已绑定</span>
          </div>
          <button className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* 主布局 */}
      <div className="pt-[60px] flex">
        {/* 左侧菜单（MVP可简化） */}
        <aside className="w-[200px] bg-white border-r h-[calc(100vh-60px)] fixed left-0 top-[60px] hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] transition-all',
                  pathname === item.href
                    ? 'bg-[#22C97A]/10 text-[#22C97A] font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* 右侧内容区 */}
        <main className={cn('flex-1', 'md:ml-[200px]')}>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
