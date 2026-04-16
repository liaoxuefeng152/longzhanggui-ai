'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bot,
  Settings,
  Package,
  Link2,
  ChevronRight,
  Sparkles,
  BarChart3,
  ShoppingCart,
  Truck,
  Search,
  Image,
  Video,
  Upload,
} from 'lucide-react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: {
    title: string;
    href: string;
    badge?: string;
    icon?: React.ElementType;
  }[];
}

// V1.0 精简菜单 - 4大核心AI功能
const menuItems: MenuItem[] = [
  {
    title: '首页',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'AI智能体',
    href: '/agents/product-selection',
    icon: Sparkles,
    submenu: [
      { title: '智能选品', href: '/agents/product-selection', icon: Search },
      { title: '图片处理', href: '/agents/image-design', icon: Image },
      { title: '视频生成', href: '/agents/video-generation', icon: Video },
      { title: '一键采集上架', href: '/erp/collection', icon: Upload },
    ],
  },
  {
    title: '商品',
    href: '/erp/products',
    icon: Package,
    submenu: [
      { title: '商品列表', href: '/erp/products' },
      // 预留：{ title: '批量处理', href: '/erp/batch', badge: 'V1.1' },
      // 预留：{ title: '库存管理', href: '/erp/inventory', badge: 'V1.1' },
    ],
  },
  {
    title: '智能助理',
    href: '/ai-assistant',
    icon: Bot,
    submenu: [
      { title: '对话咨询', href: '/ai-assistant' },
      { title: '运营日报', href: '/ai-assistant' },
    ],
  },
  {
    title: '设置',
    href: '/shops',
    icon: Settings,
    submenu: [
      { title: '店铺管理', href: '/shops' },
      { title: '平台配置', href: '/shops/platforms' },
    ],
  },
];

// 预留菜单（V1.x 暂不显示）
const reservedMenuItems: MenuItem[] = [
  {
    title: '订单管理',
    href: '/erp/orders',
    icon: ShoppingCart,
    submenu: [
      { title: '订单列表', href: '/erp/orders', badge: 'V1.2' },
      { title: '物流跟踪', href: '/erp/logistics', badge: 'V1.2' },
    ],
  },
  {
    title: '数据报表',
    href: '/reports',
    icon: BarChart3,
    submenu: [
      { title: '销售分析', href: '/reports', badge: 'V1.3' },
      { title: '利润统计', href: '/reports/profit', badge: 'V1.3' },
      { title: '广告报表', href: '/reports/ads', badge: 'V2.1' },
    ],
  },
  {
    title: '系统管理',
    href: '/users',
    icon: Settings,
    submenu: [
      { title: '用户管理', href: '/users', badge: 'V1.x' },
      { title: '角色权限', href: '/roles', badge: 'V1.x' },
      { title: '操作日志', href: '/task-logs', badge: 'V1.x' },
      { title: '飞书集成', href: '/feishu', badge: 'V2.2' },
    ],
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
    <aside className={cn(
      "w-[220px] sidebar-gradient fixed left-0 top-[60px] bottom-0 overflow-y-auto",
      "border-r border-white/5",
      "transition-all duration-300 ease-out"
    )}>
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
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
                    {item.submenu.map((subItem, idx) => {
                      const SubIcon = subItem.icon;
                      return (
                        <Link
                          key={`${subItem.title}-${idx}`}
                          href={subItem.href}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-200",
                            "hover:bg-white/5 hover:text-white",
                            pathname === subItem.href
                              ? "bg-white/10 text-white font-medium"
                              : "text-sidebar-foreground/70"
                          )}
                        >
                          {SubIcon ? (
                            <SubIcon className="h-3.5 w-3.5 text-primary/70" />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-primary/50" />
                          )}
                          <span className="flex-1">{subItem.title}</span>
                          {subItem.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary/70">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
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
