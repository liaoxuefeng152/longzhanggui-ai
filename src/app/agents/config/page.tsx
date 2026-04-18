'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Search,
  Image,
  Video,
  FileText,
  Megaphone,
  Headphones,
  BarChart3,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  configPath: string;
  status: 'configured' | 'pending';
  stats: {
    label: string;
    value: string;
  }[];
}

const agentConfigs: AgentConfig[] = [
  {
    id: 'product-selection',
    name: '选品智能体',
    description: 'AI驱动选品分析，支持爆款挖掘、竞品分析、合规校验和供应商匹配',
    icon: <Search className="h-6 w-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    configPath: '/agents/product-selection/config',
    status: 'configured',
    stats: [
      { label: '选品模型', value: 'Doubao-Lite' },
      { label: '数据源', value: '已配置' },
    ],
  },
  {
    id: 'image-design',
    name: '图片设计',
    description: '智能图片处理，支持图片翻译、白底优化、AI主图生成和背景替换',
    icon: <Image className="h-6 w-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    configPath: '/agents/image-design/config',
    status: 'configured',
    stats: [
      { label: '视觉模型', value: 'Doubao-Vision' },
      { label: '处理模式', value: '翻译+优化' },
    ],
  },
  {
    id: 'video-generation',
    name: '视频生成',
    description: 'AI视频创作，支持商品展示视频、营销视频和字幕生成',
    icon: <Video className="h-6 w-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    configPath: '/agents/video-generation/config',
    status: 'pending',
    stats: [
      { label: '视频模型', value: '未配置' },
      { label: '生成模式', value: '待配置' },
    ],
  },
  {
    id: 'listing-optimization',
    name: 'Listing优化',
    description: '智能标题和描述优化，支持关键词挖掘、五点描述和合规检查',
    icon: <FileText className="h-6 w-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    configPath: '/agents/listing-optimization/config',
    status: 'configured',
    stats: [
      { label: '语言模型', value: 'Doubao-Lite' },
      { label: '优化策略', value: '已配置' },
    ],
  },
  {
    id: 'advertising',
    name: '广告投放',
    description: '智能广告优化，支持广告创建、预算分配、ROI监控和关键词策略',
    icon: <Megaphone className="h-6 w-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    configPath: '/agents/advertising/config',
    status: 'pending',
    stats: [
      { label: '分析模型', value: '未配置' },
      { label: '投放平台', value: '待配置' },
    ],
  },
  {
    id: 'customer-service',
    name: '客服智能体',
    description: 'AI客服处理，支持智能回复、差评预防、纠纷处理和工单管理',
    icon: <Headphones className="h-6 w-6" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    configPath: '/agents/customer-service/config',
    status: 'configured',
    stats: [
      { label: '语言模型', value: 'Doubao-Mini' },
      { label: '响应模式', value: '智能+人工' },
    ],
  },
  {
    id: 'data-review',
    name: '数据复盘',
    description: '智能数据分析，支持日报周报生成、异常诊断和行动项建议',
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    configPath: '/agents/data-review/config',
    status: 'pending',
    stats: [
      { label: '分析模型', value: '未配置' },
      { label: '报告模板', value: '待配置' },
    ],
  },
];

export default function AgentConfigPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  const configuredCount = agentConfigs.filter(a => a.status === 'configured').length;
  const pendingCount = agentConfigs.filter(a => a.status === 'pending').length;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/5 flex items-center justify-center">
              <Bot className="h-7 w-7 text-purple-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold">智能体配置</h1>
              <p className="text-[14px] text-muted-foreground">
                统一管理7大AI智能体的模型参数和功能配置
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              已配置 {configuredCount} 个
            </Badge>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              待配置 {pendingCount} 个
            </Badge>
          </div>
        </div>

        {/* 配置模块卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agentConfigs.map((agent) => (
            <Card
              key={agent.id}
              className="bg-white border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(agent.configPath)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg ${agent.bgColor} flex items-center justify-center`}>
                    <span className={agent.color}>{agent.icon}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      agent.status === 'configured'
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-warning/10 text-warning border-warning/20'
                    }
                  >
                    {agent.status === 'configured' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        已配置
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        待配置
                      </>
                    )}
                  </Badge>
                </div>
                <CardTitle className="text-[16px] mt-4">{agent.name}</CardTitle>
                <CardDescription className="text-[13px]">
                  {agent.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {agent.stats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between text-[13px]">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className={`font-medium ${stat.value === '未配置' || stat.value === '待配置' ? 'text-warning' : ''}`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  配置
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 模型分配策略说明 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-[15px]">模型分配策略</CardTitle>
            <CardDescription className="text-[13px]">
              根据不同智能体的任务特点，分配最适合的AI模型以达到最佳效果和成本平衡
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-[11px]">Lite/Agent</Badge>
                </div>
                <p className="text-[13px] text-muted-foreground">选品 · Listing · 视频</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 text-[11px]">Pro</Badge>
                </div>
                <p className="text-[13px] text-muted-foreground">广告 · 数据复盘</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-100">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-cyan-100 text-cyan-700 border-cyan-200 text-[11px]">Mini</Badge>
                </div>
                <p className="text-[13px] text-muted-foreground">客服 · 翻译</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-[11px]">Vision</Badge>
                </div>
                <p className="text-[13px] text-muted-foreground">图片处理</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 快速链接 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-[15px]">快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => router.push('/models')}>
                <Bot className="h-4 w-4 mr-2" />
                模型配置
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/agents')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                查看智能体
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/task-logs')}>
                <Settings className="h-4 w-4 mr-2" />
                执行日志
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
