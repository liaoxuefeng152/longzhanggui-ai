'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Cpu,
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
  Store,
  DollarSign,
  Shield,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// 不需要登录的页面
const PUBLIC_PATHS = ['/', '/landing', '/login', '/register', '/forgot-password', '/reset-password'];

// AISKILL彩虹配色映射
const agentColors = {
  'product-selection': { primary: 'blue', gradient: 'from-blue-500 to-cyan-400', bg: 'bg-blue-500', text: 'text-blue-400', hover: 'hover:bg-blue-500/20' },
  'image-design': { primary: 'purple', gradient: 'from-purple-500 to-pink-400', bg: 'bg-purple-500', text: 'text-purple-400', hover: 'hover:bg-purple-500/20' },
  'video-generation': { primary: 'pink', gradient: 'from-pink-500 to-rose-400', bg: 'bg-pink-500', text: 'text-pink-400', hover: 'hover:bg-pink-500/20' },
  'listing-optimization': { primary: 'green', gradient: 'from-green-500 to-emerald-400', bg: 'bg-green-500', text: 'text-green-400', hover: 'hover:bg-green-500/20' },
  'advertising': { primary: 'orange', gradient: 'from-orange-500 to-amber-400', bg: 'bg-orange-500', text: 'text-orange-400', hover: 'hover:bg-orange-500/20' },
  'customer-service': { primary: 'cyan', gradient: 'from-cyan-500 to-teal-400', bg: 'bg-cyan-500', text: 'text-cyan-400', hover: 'hover:bg-cyan-500/20' },
  'data-review': { primary: 'indigo', gradient: 'from-indigo-500 to-violet-400', bg: 'bg-indigo-500', text: 'text-indigo-400', hover: 'hover:bg-indigo-500/20' },
  'pricing': { primary: 'emerald', gradient: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-500', text: 'text-emerald-400', hover: 'hover:bg-emerald-500/20' },
};

interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: {
    title: string;
    href: string;
    agentKey?: string;
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
    title: 'SKILL中心',
    href: '/agents/product-selection',
    icon: Bot,
    submenu: [
      { title: '选品SKILL', href: '/agents/product-selection', agentKey: 'product-selection' },
      { title: '图片SKILL', href: '/agents/image-design', agentKey: 'image-design' },
      { title: '视频生成SKILL', href: '/agents/video-generation', agentKey: 'video-generation' },
      { title: 'Listing优化', href: '/agents/listing-optimization', agentKey: 'listing-optimization' },
      { title: '广告投放SKILL', href: '/agents/advertising', agentKey: 'advertising' },
      { title: 'AI客服SKILL', href: '/agents/customer-service', agentKey: 'customer-service' },
      { title: '数据复盘SKILL', href: '/agents/data-review', agentKey: 'data-review' },
      { title: '定价SKILL', href: '/agents/pricing', agentKey: 'pricing' },
    ],
  },
  {
    title: 'ERP系统',
    href: '/erp',
    icon: Package,
    submenu: [
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
    title: 'SKILL配置',
    href: '/agents/config',
    icon: Bot,
    submenu: [
      { title: '配置总览', href: '/agents/config' },
      { title: '选品SKILL', href: '/agents/product-selection/config', agentKey: 'product-selection' },
      { title: '图片设计', href: '/agents/image-design/config', agentKey: 'image-design' },
      { title: '视频生成', href: '/agents/video-generation/config', agentKey: 'video-generation' },
      { title: 'Listing优化', href: '/agents/listing-optimization/config', agentKey: 'listing-optimization' },
      { title: '广告投放', href: '/agents/advertising/config', agentKey: 'advertising' },
      { title: 'AI客服', href: '/agents/customer-service/config', agentKey: 'customer-service' },
      { title: '数据复盘', href: '/agents/data-review/config', agentKey: 'data-review' },
      { title: '定价SKILL', href: '/agents/pricing/config', agentKey: 'pricing' },
    ],
  },
  {
    title: '模型配置',
    href: '/models',
    icon: Cpu,
  },
  {
    title: '平台配置',
    href: '/platform',
    icon: Settings,
    submenu: [
      { title: '配置总览', href: '/platform' },
      { title: '平台凭证', href: '/shops/platforms' },
      { title: '数据源配置', href: '/platform/datasources' },
      { title: '妙手ERP', href: '/platform/miaoshou' },
    ],
  },
  {
    title: '飞书机器人',
    href: '/feishu',
    icon: MessageSquare,
    submenu: [
      { title: '机器人管理', href: '/feishu' },
      { title: '数据导入', href: '/feishu/import' },
    ],
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
  
  // 从用户数据获取管理员状态
  const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userData ? JSON.parse(userData) : null;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // 从 localStorage 获取用户角色
    const savedRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    if (savedRole) {
      // 使用保存的角色
      setUserRole(savedRole as 'client' | 'admin');
      setIsClientView(savedRole === 'client');
    } else if (token) {
      // 如果有 token 但没有保存角色，根据用户角色决定默认视图
      if (isAdmin) {
        // 管理员默认进入管理端
        setUserRole('admin');
        setIsClientView(false);
        localStorage.setItem('userRole', 'admin');
      } else {
        // 非管理员默认进入运营端
        setUserRole('client');
        setIsClientView(true);
        localStorage.setItem('userRole', 'client');
      }
    } else if (!PUBLIC_PATHS.includes(window.location.pathname)) {
      // 未登录且不在公开页面，跳转到登录页
      window.location.href = '/login';
    }
  }, [isAdmin]);

  // 切换视图模式 - 只有管理员才能切换到管理端
  const toggleView = () => {
    // 如果当前是运营端，且用户不是管理员，禁止切换到管理端
    if (isClientView && !isAdmin) {
      toast.error('只有管理员才能访问管理端');
      return;
    }

    const newRole = isClientView ? 'admin' : 'client';
    setIsClientView(!isClientView);
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
    // 切换到对应的首页
    if (!isClientView) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/workflows';
    }
  };

  // 显示切换按钮的条件
  const showSwitchButton = !isClientView || (isClientView && isAdmin);

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
      "w-[220px] fixed left-0 top-[60px] bottom-0 overflow-y-auto",
      "bg-[#0E42D2]",
      "border-r border-[#0A36B0]",
      "transition-all duration-300 ease-out"
    )}>
      <div className="p-4">
        {/* 视图切换提示 - 非管理员在运营端时只显示当前视图，不显示切换按钮 */}
        <div className="mb-4 px-3 py-2 rounded-md bg-white/10 border border-white/15">
          <p className="text-[11px] text-blue-200 mb-1">当前视图</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white">{currentViewName}</p>
            {isClientView && !isAdmin && (
              <Shield className="h-3 w-3 text-muted-foreground" aria-label="运营人员" />
            )}
          </div>
          {showSwitchButton && (
            <button
              onClick={toggleView}
              className="mt-2 text-[11px] text-blue-200 hover:text-white transition-colors"
            >
              切换到{isClientView ? '管理端' : '客户端'}
            </button>
          )}
          {!isClientView && (
            <p className="mt-2 text-[10px] text-blue-200/70">
              管理员可切换到运营端
            </p>
          )}
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            // 判断是否为SKILL相关路径
  const isAgentPath = pathname.startsWith('/agents/') && pathname !== '/agents';
  
  // SKILL中心主菜单：根据当前选中的SKILL显示对应颜色
  const isAgentMenu = item.href === '/agents/product-selection' || item.href === '/agents/config';
  const currentAgentKey = isAgentPath ? (
    pathname.includes('product-selection') ? 'product-selection'
    : pathname.includes('image-design') ? 'image-design'
    : pathname.includes('video-generation') ? 'video-generation'
    : pathname.includes('listing-optimization') ? 'listing-optimization'
    : pathname.includes('advertising') ? 'advertising'
    : pathname.includes('customer-service') ? 'customer-service'
    : pathname.includes('data-review') ? 'data-review'
    : 'product-selection' // 默认选品
  ) : null;
  const menuColors = isAgentMenu && currentAgentKey ? agentColors[currentAgentKey as keyof typeof agentColors] : null;
  
  // SKILL中心菜单：在任何SKILL子页面都显示为 active
  const isActiveAgentMenu = isAgentMenu && isAgentPath;
  
  return (
    <div key={item.href}>
      <Link
        href={item.href}
        className={cn(
          'sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200',
          'group relative',
          (active || isActiveAgentMenu)
            ? menuColors
              ? `bg-white/20 text-white shadow-lg`
              : 'bg-white/20 text-white shadow-lg'
            : menuColors
              ? `${menuColors.hover} hover:text-white`
              : 'text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1'
        )}
      >
        <Icon className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          (active || isActiveAgentMenu) ? "scale-110" : "group-hover:scale-105"
        )} />
        <span className="text-sm font-medium">{item.title}</span>
        {(active || isActiveAgentMenu) && (
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-[2px] rounded-r-full animate-pulse",
            menuColors
              ? `bg-gradient-to-b ${menuColors.gradient}`
              : 'bg-white'
          )} />
        )}
        {item.submenu && (
          <ChevronRight className={cn(
            "h-3.5 w-3.5 ml-auto transition-transform duration-200",
            (active || isActiveAgentMenu) && "rotate-90"
          )} />
        )}
      </Link>

                {/* 子菜单 */}
                {item.submenu && (active || isActiveAgentMenu) && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-white/20 pl-3">
                    {item.submenu.map((sub) => {
                      const colors = sub.agentKey ? agentColors[sub.agentKey as keyof typeof agentColors] : null;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={cn(
                            'block py-1.5 px-2 text-[13px] rounded transition-colors group flex items-center gap-2',
                            pathname === sub.href
                              ? colors
                                ? `bg-white/15 text-white font-medium`
                                : 'text-white font-medium bg-white/15'
                              : colors
                                ? `text-blue-200/70 ${colors.hover} hover:text-white`
                                : 'text-blue-200/70 hover:text-white hover:bg-white/10'
                          )}
                        >
                          {colors && (
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full bg-gradient-to-r",
                              colors.gradient
                            )} />
                          )}
                          {sub.title}
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
