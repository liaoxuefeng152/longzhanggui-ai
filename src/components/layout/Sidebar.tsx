'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Cpu,
  FileText,
  Bot,
  Users,
  CreditCard,
  ClipboardList,
  Link2,
  Package,
  ShoppingCart,
  Headphones,
  BarChart3,
  Settings,
  ChevronRight,
  Warehouse,
  DollarSign,
  Receipt,
  Truck,
  Sparkles,
  Zap,
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

// 根据PRD文档的14个核心页面配置导航菜单
const menuItems: MenuItem[] = [
  {
    title: '控制台',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '工作流编排',
    href: '/workflows',
    icon: Zap,
  },
  {
    title: '模型路由',
    href: '/models',
    icon: Cpu,
  },
  {
    title: 'Prompt中心',
    href: '/prompts',
    icon: FileText,
  },
  {
    title: '智能体调度',
    href: '/agents',
    icon: Bot,
    submenu: [
      { title: '选品智能体', href: '/agents/product-selection' },
      { title: '图片设计智能体', href: '/agents/image-design' },
      { title: '视频生成智能体', href: '/agents/video-generation' },
      { title: 'Listing优化', href: '/agents/listing-optimization' },
      { title: '广告投放智能体', href: '/agents/advertising' },
      { title: 'AI客服智能体', href: '/agents/customer-service' },
      { title: '数据复盘智能体', href: '/agents/data-review' },
    ],
  },
  {
    title: 'AI智能体中心',
    href: '/ai-agents',
    icon: Sparkles,
  },
  {
    title: 'ERP系统',
    href: '/erp',
    icon: Package,
    submenu: [
      { title: '1688采集', href: '/erp/collection' },
      { title: '商品管理', href: '/erp/products' },
      { title: '库存管理', href: '/erp/inventory' },
      { title: '采购管理', href: '/erp/purchase' },
      { title: '订单管理', href: '/erp/orders' },
      { title: '物流管理', href: '/erp/logistics' },
      { title: '财务管理', href: '/erp/finance' },
    ],
  },
  {
    title: '用户管理',
    href: '/users',
    icon: Users,
  },
  {
    title: '套餐管理',
    href: '/packages',
    icon: CreditCard,
  },
  {
    title: '任务日志',
    href: '/task-logs',
    icon: ClipboardList,
  },
  {
    title: '平台绑定',
    href: '/platform-bindings',
    icon: Link2,
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
    <aside className="w-[220px] bg-sidebar fixed left-0 top-[60px] bottom-0 overflow-y-auto">
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
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
                  <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border/30 pl-3">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'block px-3 py-2 text-[13px] rounded-md transition-all duration-200',
                          pathname === subItem.href
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
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
