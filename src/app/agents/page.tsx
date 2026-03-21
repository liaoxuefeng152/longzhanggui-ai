'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  ShoppingCart,
  Image,
  Video,
  FileText,
  Megaphone,
  Headphones,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  icon: any;
  description: string;
  status: 'online' | 'offline' | 'error';
  model: string;
  platform: string;
  calls: number;
  successRate: number;
  features: string[];
  compliance: boolean;
  riskControl: boolean;
}

const agents: Agent[] = [
  {
    id: 'selection',
    name: '选品智能体',
    icon: ShoppingCart,
    description: '爆款挖掘、竞品分析、利润核算、合规+供应链校验',
    status: 'online',
    model: '豆包-Seed-1.8',
    platform: 'TK/亚马逊',
    calls: 1850,
    successRate: 98.5,
    features: ['爆款挖掘', '竞品分析', '利润核算', '供应链匹配'],
    compliance: true,
    riskControl: false,
  },
  {
    id: 'image',
    name: '图片设计智能体',
    icon: Image,
    description: '主图生成、背景替换、A+页面设计、图片合规校验',
    status: 'online',
    model: '豆包-Seed-1.8',
    platform: 'TK/亚马逊',
    calls: 1620,
    successRate: 97.2,
    features: ['主图生成', '背景替换', 'A+页面设计', '合规校验'],
    compliance: true,
    riskControl: false,
  },
  {
    id: 'video',
    name: '视频生成智能体',
    icon: Video,
    description: '脚本生成、AI配音、字幕、图文轮播视频、合规预检',
    status: 'online',
    model: '豆包-Seed-1.8',
    platform: 'TK东南亚',
    calls: 980,
    successRate: 95.8,
    features: ['脚本生成', 'AI配音', '图文轮播', '合规预检'],
    compliance: true,
    riskControl: false,
  },
  {
    id: 'listing',
    name: 'Listing优化智能体',
    icon: FileText,
    description: '标题/五点/A+优化、关键词挖掘、平台差异化合规校验',
    status: 'online',
    model: 'DeepSeek-V3',
    platform: 'TK/亚马逊',
    calls: 1420,
    successRate: 96.5,
    features: ['标题优化', '五点描述', '关键词挖掘', '合规校验'],
    compliance: true,
    riskControl: false,
  },
  {
    id: 'advertising',
    name: '广告投放智能体',
    icon: Megaphone,
    description: '预算分配、出价建议、关键词挖掘、广告风控引擎',
    status: 'online',
    model: 'DeepSeek-V3',
    platform: 'TK Ads/亚马逊PPC',
    calls: 890,
    successRate: 94.2,
    features: ['预算分配', '出价建议', '关键词挖掘', '风控引擎'],
    compliance: false,
    riskControl: true,
  },
  {
    id: 'customer',
    name: 'AI客服智能体',
    icon: Headphones,
    description: '多语种回复、纠纷处理、话术合规、物流轨迹查询',
    status: 'online',
    model: '豆包-Seed-1.8',
    platform: 'TK/亚马逊',
    calls: 2100,
    successRate: 99.1,
    features: ['多语种回复', '纠纷处理', '话术合规', '物流查询'],
    compliance: true,
    riskControl: false,
  },
  {
    id: 'review',
    name: '数据复盘智能体',
    icon: BarChart3,
    description: '销售分析、流量分析、ROI计算、自动化任务转化',
    status: 'online',
    model: 'DeepSeek-V3',
    platform: '全平台',
    calls: 560,
    successRate: 97.8,
    features: ['销售分析', '流量分析', 'ROI计算', '任务转化'],
    compliance: false,
    riskControl: false,
  },
];

export default function AgentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      online: { label: '在线', className: 'bg-success text-white' },
      offline: { label: '离线', className: 'bg-muted text-muted-foreground' },
      error: { label: '异常', className: 'bg-destructive text-white' },
    };
    const config = statusMap[status] || statusMap.offline;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">智能体调度配置</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              AI智能体工厂 · 7大核心智能体 · 合规+风控
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索智能体"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-md text-[14px] w-[200px] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新状态
            </Button>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">在线智能体</div>
              <div className="text-[24px] font-semibold text-success">7/7</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">今日总调用</div>
              <div className="text-[24px] font-semibold text-foreground">9,420</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">平均成功率</div>
              <div className="text-[24px] font-semibold text-foreground">97.3%</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">合规校验通过率</div>
              <div className="text-[24px] font-semibold text-success">99.8%</div>
            </CardContent>
          </Card>
        </div>

        {/* 智能体卡片列表 */}
        <div className="grid grid-cols-2 gap-6">
          {filteredAgents.map((agent) => {
            const Icon = agent.icon;
            return (
              <Card key={agent.id} className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-[16px] font-semibold">{agent.name}</CardTitle>
                        <CardDescription className="text-[12px]">{agent.platform}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.compliance && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          <Shield className="h-3 w-3 mr-1" />
                          合规
                        </Badge>
                      )}
                      {agent.riskControl && (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          风控
                        </Badge>
                      )}
                      {getStatusBadge(agent.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[13px] text-muted-foreground">{agent.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {agent.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-[11px]">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                    <div>
                      <div className="text-[12px] text-muted-foreground">调用模型</div>
                      <div className="text-[13px] font-medium text-foreground">{agent.model}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-muted-foreground">今日调用</div>
                      <div className="text-[13px] font-medium text-foreground">{agent.calls.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[12px] text-muted-foreground">成功率</div>
                      <div className="flex items-center gap-1">
                        <Progress value={agent.successRate} className="h-1.5 flex-1" />
                        <span className="text-[13px] font-medium text-success">{agent.successRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Link href={`/agents/${agent.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        配置详情
                      </Button>
                    </Link>
                    <Button variant="outline" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
