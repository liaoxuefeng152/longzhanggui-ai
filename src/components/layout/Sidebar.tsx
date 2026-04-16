'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User } from '@/lib/auth/permissions';
import {
  LayoutDashboard,
  Cpu,
  FileText,
  Bot,
  Users,
  CreditCard,
  ClipboardList,
  Package,
  Headphones,
  BarChart3,
  Settings,
  ChevronRight,
  Clock,
  MessageSquare,
  Shield,
  Store,
  Warehouse,
  ShoppingBag,
} from 'lucide-react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: {
    title: string;
    href: string;
    highlight?: boolean;
  }[];
  roles?: ('admin' | 'user')[];
}

// 管理端菜单
const adminMenuItems: MenuItem[] = [
  {
    title: '控制台',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'user'],
  },
  {
    title: '平台配置',
    href: '/platform',
    icon: Settings,
    roles: ['admin'],
    submenu: [
      { title: '数据源配置', href: '/platform/datasources' },
      { title: '店铺管理', href: '/shops' },
      { title: '平台凭证', href: '/shops/platforms' },
    ],
  },
  {
    title: '模型路由',
    href: '/models',
    icon: Cpu,
    roles: ['admin'],
  },
  {
    title: 'Prompt中心',
    href: '/prompts',
    icon: FileText,
    roles: ['admin'],
  },
  {
    title: '工作流编排',
    href: '/workflows',
    icon: MessageSquare,
    roles: ['admin'],
  },
  {
    title: 'AI智能体中心',
    href: '/ai-agents',
    icon: Bot,
    roles: ['admin', 'user'],
    submenu: [
      { title: '选品智能体', href: '/agents/product-selection' },
      { title: '图片智能体', href: '/agents/image-design' },
      { title: '视频生成智能体', href: '/agents/video-generation' },
      { title: 'Listing优化', href: '/agents/listing-optimization' },
      { title: 'AI客服智能体', href: '/agents/customer-service' },
      { title: '数据复盘智能体', href: '/agents/data-review' },
    ],
  },
  {
    title: 'ERP系统',
    href: '/erp',
    icon: Warehouse,
    roles: ['admin', 'user'],
    submenu: [
      { title: '一键发布', href: '/erp/one-click-publish', highlight: true },
      { title: '批量处理', href: '/erp/batch-process' },
      { title: '采集中心', href: '/erp/collection' },
      { title: '商品管理', href: '/erp/products' },
      { title: '库存管理', href: '/erp/inventory' },
      { title: '采购管理', href: '/erp/purchase' },
      { title: '订单管理', href: '/erp/orders' },
      { title: '物流管理', href: '/erp/logistics' },
      { title: '财务管理', href: '/erp/finance' },
    ],
  },
  {
    title: '我的店铺',
    href: '/shops',
    icon: Store,
    roles: ['admin', 'user'],
  },
  {
    title: '广告投放',
    href: '/ads',
    icon: ShoppingBag,
    roles: ['admin', 'user'],
  },
  {
    title: '用户管理',
    href: '/users',
    icon: Users,
    roles: ['admin'],
    submenu: [
      { title: '用户列表', href: '/users' },
      { title: '角色权限', href: '/roles' },
    ],
  },
  {
    title: '套餐管理',
    href: '/packages',
    icon: CreditCard,
    roles: ['admin', 'user'],
  },
  {
    title: '客服工单',
    href: '/customer-tickets',
    icon: Headphones,
    roles: ['admin', 'user'],
  },
  {
    title: '数据报表',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'user'],
  },
  {
    title: '任务日志',
    href: '/task-logs',
    icon: ClipboardList,
    roles: ['admin'],
  },
  {
    title: '定时任务',
    href: '/scheduler',
    icon: Clock,
    roles: ['admin'],
  },
  {
    title: '系统设置',
    href: '/settings',
    icon: Settings,
    roles: ['admin'],
  },
];

// 客户端菜单（普通用户可见）
const clientMenuItems: MenuItem[] = [
  {
    title: '控制台',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '我的店铺',
    href: '/shops',
    icon: Store,
  },
  {
    title: 'AI智能体',
    href: '/ai-agents',
    icon: Bot,
    submenu: [
      { title: '选品智能体', href: '/agents/product-selection' },
      { title: '图片智能体', href: '/agents/image-design' },
      { title: '视频生成智能体', href: '/agents/video-generation' },
      { title: 'Listing优化', href: '/agents/listing-optimization' },
      { title: 'AI客服智能体', href: '/agents/customer-service' },
      { title: '数据复盘智能体', href: '/agents/data-review' },
    ],
  },
  {
    title: 'ERP系统',
    href: '/erp',
    icon: Warehouse,
    submenu: [
      { title: '一键发布', href: '/erp/one-click-publish', highlight: true },
      { title: '批量处理', href: '/erp/batch-process' },
      { title: '采集中心', href: '/erp/collection' },
      { title: '商品管理', href: '/erp/products' },
      { title: '库存管理', href: '/erp/inventory' },
      { title: '采购管理', href: '/erp/purchase' },
      { title: '订单管理', href: '/erp/orders' },
      { title: '物流管理', href: '/erp/logistics' },
      { title: '财务管理', href: '/erp/finance' },
    ],
  },
  {
    title: '广告投放',
    href: '/ads',
    icon: ShoppingBag,
  },
  {
    title: '套餐管理',
    href: '/packages',
    icon: CreditCard,
  },
  {
    title: '客服工单',
    href: '/customer-tickets',
    icon: Headphones,
  },
  {
    title: '数据报表',
    href: '/reports',
    icon: BarChart3,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, [pathname]);

  // 根据用户角色选择菜单
  const menuItems = user?.role === 'admin' ? adminMenuItems : clientMenuItems;

  // 过滤符合角色的菜单
  const filteredMenuItems = menuItems.filter(
    item => !item.roles || item.roles.includes(user?.role || 'user')
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "w-[220px] sidebar-gradient fixed left-0 top-[60px] bottom-0 overflow-y-auto",
      "border-r border-white/5",
      "transition-all duration-300 ease-out"
    )}>
      {/* 角色标识 */}
      {user && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            {user.role === 'admin' ? (
              <Shield className="w-4 h-4 text-[#FF7D00]" />
            ) : (
              <Store className="w-4 h-4 text-[#00B42A]" />
            )}
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded",
              user.role === 'admin' 
                ? "bg-[#FF7D00]/20 text-[#FF7D00]" 
                : "bg-[#00B42A]/20 text-[#00B42A]"
            )}>
              {user.role === 'admin' ? '管理员' : '普通用户'}
            </span>
          </div>
        </div>
      )}

      <div className="p-4">
        <nav className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200',
                    'group relative',
                    active
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-white shadow-lg shadow-primary/20'
                      : 'text-sidebar-foreground hover:bg-white/5 hover:text-white hover:translate-x-1'
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    active ? "scale-110" : "group-hover:scale-105"
                  )} />
                  <span className="text-sm font-medium">{item.title}</span>
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary to-blue-400 rounded-r-full animate-pulse" />
                  )}
                  {item.submenu && (
                    <ChevronRight className={cn(
                      "h-3.5 w-3.5 ml-auto transition-transform duration-200",
                      active ? "rotate-90" : "group-hover:translate-x-0.5"
                    )} />
                  )}
                </Link>

                {/* 子菜单 */}
                {item.submenu && (
                  <div className={cn(
                    "ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                    active ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-200",
                          "hover:bg-white/5 hover:text-white",
                          pathname === subItem.href
                            ? "bg-white/10 text-white font-medium"
                            : "text-sidebar-foreground/70"
                        )}
                      >
                        <div className="w-1 h-1 rounded-full bg-primary/50" />
                        {subItem.title}
                        {subItem.highlight && (
                          <span className="ml-auto text-[10px] bg-[#FF7D00] text-white px-1.5 py-0.5 rounded">
                            NEW
                          </span>
                        )}
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
