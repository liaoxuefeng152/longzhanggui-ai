'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bot,
  FileText,
  MessageSquare,
  Megaphone,
  Users,
  ShoppingCart,
  Settings,
  ChevronRight,
} from 'lucide-react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: {
    title: string;
    href: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    title: '控制台',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '模型路由',
    href: '/models',
    icon: Bot,
  },
  {
    title: 'Prompt中心',
    href: '/prompts',
    icon: FileText,
  },
  {
    title: '智能体工厂',
    href: '/agents',
    icon: MessageSquare,
    submenu: [
      { title: '客服智能体', href: '/agents/customer-service' },
      { title: '自推广智能体', href: '/agents/marketing' },
    ],
  },
  {
    title: '用户管理',
    href: '/users',
    icon: Users,
  },
  {
    title: '订单套餐',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    title: '系统设置',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[220px] bg-white border-r border-[#E8E8E8] fixed left-0 top-[60px] bottom-0 overflow-y-auto">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-[14px] font-medium text-[#717C89] mb-2">功能菜单</h3>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200',
                    active
                      ? 'bg-[#E6F7FF] text-[#1677FF] font-medium'
                      : 'text-[#4E5969] hover:bg-[#F5F7FA]'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-[14px]">{item.title}</span>
                  {item.submenu && (
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 ml-auto transition-transform',
                        active && 'rotate-90'
                      )}
                    />
                  )}
                </Link>

                {item.submenu && active && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'block px-3 py-2 text-[13px] rounded-md transition-all duration-200',
                          pathname === subItem.href
                            ? 'bg-[#E6F7FF] text-[#1677FF] font-medium'
                            : 'text-[#4E5969] hover:bg-[#F5F7FA]'
                        )}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
