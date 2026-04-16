'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Settings, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

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
  const router = useRouter();

  const navItems = [
    { label: '数据', href: '/', icon: '📊' },
    { label: '选品', href: '/select', icon: '🔍' },
    { label: '上新', href: '/publish', icon: '🚀' },
    { label: '广告', href: '/ads', icon: '📈' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    if (onLogout) {
      onLogout();
    }
    router.push('/login');
  };

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
            
            {/* 用户菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.nickname || '用户'}</p>
                  <p className="text-xs text-muted-foreground">{user?.role === 'admin' ? '管理员' : '普通用户'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    设置
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
