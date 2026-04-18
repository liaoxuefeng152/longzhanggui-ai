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
  Package,
  Headphones,
  BarChart3,
  Settings,
  ChevronRight,
  Zap,
  MessageSquare,
  Clock,
  Store,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: {
    title: string;
    href: string;
  }[];
}

// 客户端菜单（运营人员使用）
const clientMenuItems: MenuItem[] = [
  {
    title: '工作台',
    href: '/workflows',
    icon: Zap,
  },
  {
    title: '智能体中心',
    href: '/agents/product-selection',
    icon: Bot,
    submenu: [
      { title: '选品智能体', href: '/agents/product-selection' },
      { title: '图片智能体', href: '/agents/image-design' },
      { title: '视频生成智能体', href: '/agents/video-generation' },
      { title: 'Listing优化', href: '/agents/listing-optimization' },
      { title: '广告投放智能体', href: '/agents/advertising' },
      { title: 'AI客服智能体', href: '/agents/customer-service' },
      { title: '数据复盘智能体', href: '/agents/data-review' },
    ],
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
    title: '店铺管理',
    href: '/shops',
    icon: Store,
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
    title: '订购套餐',
    href: '/packages',
    icon: CreditCard,
  },
];

// 管理端菜单（管理员使用）
const adminMenuItems: MenuItem[] = [
  {
    title: '控制台',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '智能体配置',
    href: '/agents/product-selection/config',
    icon: Bot,
    submenu: [
      { title: '选品智能体', href: '/agents/product-selection/config' },
      { title: '图片智能体', href: '/agents/image-design/config' },
      { title: '视频生成智能体', href: '/agents/video-generation/config' },
      { title: 'Listing优化', href: '/agents/listing-optimization/config' },
      { title: '广告投放智能体', href: '/agents/advertising/config' },
      { title: 'AI客服智能体', href: '/agents/customer-service/config' },
      { title: '数据复盘智能体', href: '/agents/data-review/config' },
    ],
  },
  {
    title: 'Prompt中心',
    href: '/prompts',
    icon: FileText,
  },
  {
    title: '模型路由',
    href: '/models',
    icon: Cpu,
  },
  {
    title: '平台配置',
    href: '/platform',
    icon: Settings,
    submenu: [
      { title: '数据源配置', href: '/platform/datasources' },
      { title: '平台凭证', href: '/shops/platforms' },
      { title: '店铺管理', href: '/shops' },
    ],
  },
  {
    title: '飞书机器人',
    href: '/feishu',
    icon: MessageSquare,
    submenu: [
      { title: '机器人管理', href: '/feishu' },
      { title: '配置管理', href: '/feishu/settings' },
      { title: '推送日志', href: '/feishu/logs' },
      { title: 'Webhook测试', href: '/feishu/test' },
    ],
  },
  {
    title: '定时任务',
    href: '/scheduler',
    icon: Clock,
  },
  {
    title: '任务日志',
    href: '/task-logs',
    icon: ClipboardList,
  },
  {
    title: '用户管理',
    href: '/users',
    icon: Users,
    submenu: [
      { title: '用户列表', href: '/users' },
      { title: '角色权限', href: '/roles' },
    ],
  },
  {
    title: '套餐管理',
    href: '/packages',
    icon: CreditCard,
  },
  {
    title: '系统设置',
    href: '/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<'client' | 'admin' | null>(null);
  const [isClientView, setIsClientView] = useState(false);

  useEffect(() => {
    // 从 localStorage 获取用户角色
    const savedRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    if (savedRole) {
      // 使用保存的角色
      setUserRole(savedRole as 'client' | 'admin');
      setIsClientView(savedRole === 'client');
    } else if (token) {
      // 如果有 token 但没有保存角色，根据 token 类型判断
      if (token === 'demo-token') {
        // 演示模式默认显示客户端视图
        setUserRole('client');
        setIsClientView(true);
        localStorage.setItem('userRole', 'client');
      }
    }
  }, []);

  // 切换视图模式
  const toggleView = () => {
    const newRole = isClientView ? 'admin' : 'client';
    setIsClientView(!isClientView);
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
    // 切换到对应的首页
    if (!isClientView) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/agents/product-selection';
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // 根据角色选择菜单
  const menuItems = isClientView ? clientMenuItems : adminMenuItems;

  // 获取当前视图名称
  const currentViewName = isClientView ? '运营工作台' : '系统管理';

  return (
    <aside className={cn(
      "w-[220px] sidebar-gradient fixed left-0 top-[60px] bottom-0 overflow-y-auto",
      "border-r border-white/5",
      "transition-all duration-300 ease-out"
    )}>
      <div className="p-4">
        {/* 视图切换提示 */}
        <div className="mb-4 px-3 py-2 rounded-md bg-white/5 border border-white/10">
          <p className="text-[11px] text-muted-foreground mb-1">当前视图</p>
          <p className="text-sm font-medium text-white">{currentViewName}</p>
          <button
            onClick={toggleView}
            className="mt-2 text-[11px] text-primary hover:text-primary/80 transition-colors"
          >
            切换到{isClientView ? '管理端' : '客户端'}
          </button>
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
                      active && "rotate-90"
                    )} />
                  )}
                </Link>

                {/* 子菜单 */}
                {item.submenu && active && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                    {item.submenu.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          'block py-1.5 px-2 text-[13px] rounded transition-colors',
                          pathname === sub.href
                            ? 'text-primary font-medium bg-primary/10'
                            : 'text-sidebar-foreground/70 hover:text-white hover:bg-white/5'
                        )}
                      >
                        {sub.title}
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
