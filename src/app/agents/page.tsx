'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Image,
  Video,
  Upload,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle,
  Clock,
  BarChart3,
  Bot,
} from 'lucide-react';

interface AgentCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  href: string;
  features: string[];
  stats?: {
    label: string;
    value: string;
  };
}

export default function AIAgentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // 4大核心AI智能体
  const coreAgents: AgentCard[] = [
    {
      id: 'selection',
      title: '智能选品',
      description: 'AI分析市场趋势、竞品数据、利润空间，智能推荐潜力爆款',
      icon: Search,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      href: '/agents/product-selection',
      features: [
        '市场趋势分析',
        '竞品数据分析',
        '利润空间测算',
        '合规风险评估',
      ],
      stats: {
        label: '已分析商品',
        value: '1,234',
      },
    },
    {
      id: 'image',
      title: '图片处理',
      description: 'AI智能翻译图片文字、生成主图、背景替换、白底处理',
      icon: Image,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/agents/image-design',
      features: [
        '图片文字翻译',
        'AI主图生成',
        '背景智能替换',
        '白底一键处理',
      ],
      stats: {
        label: '已处理图片',
        value: '5,678',
      },
    },
    {
      id: 'video',
      title: '视频生成',
      description: 'AI生成TikTok带货短视频，自动生成脚本、配音、字幕',
      icon: Video,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      href: '/agents/video-generation',
      features: [
        '智能脚本生成',
        'AI配音合成',
        '自动字幕添加',
        '多尺寸适配',
      ],
      stats: {
        label: '已生成视频',
        value: '892',
      },
    },
    {
      id: 'publish',
      title: '一键采集上架',
      description: '采集→优化→定价→发布全流程自动化，一键铺货到多平台',
      icon: Upload,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: '/erp/collection',
      features: [
        '1688一键采集',
        '标题描述优化',
        '智能定价策略',
        '多平台同步发布',
      ],
      stats: {
        label: '已上架商品',
        value: '3,456',
      },
    },
  ];

  // 最近任务
  const recentTasks = [
    { id: 'T001', agent: '智能选品', status: 'completed', time: '10分钟前' },
    { id: 'T002', agent: '图片处理', status: 'processing', time: '5分钟前' },
    { id: 'T003', agent: '视频生成', status: 'completed', time: '15分钟前' },
    { id: 'T004', agent: '一键上架', status: 'completed', time: '30分钟前' },
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI智能体中心
            </h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              4大核心AI能力，助力跨境电商高效运营
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push('/ai-assistant')}>
            <Bot className="h-4 w-4 mr-2" />
            智能助理
          </Button>
        </div>

        {/* 核心智能体卡片 */}
        <div className="grid grid-cols-2 gap-6">
          {coreAgents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${agent.bgColor} flex items-center justify-center`}>
                      <agent.icon className={`h-7 w-7 ${agent.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-[16px]">{agent.title}</CardTitle>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 功能特点 */}
                <div className="grid grid-cols-2 gap-2">
                  {agent.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* 统计和操作 */}
                <div className="flex items-center justify-between pt-4 border-t">
                  {agent.stats && (
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-[12px] text-muted-foreground">
                        {agent.stats.label}：<span className="font-medium text-foreground">{agent.stats.value}</span>
                      </span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => router.push(agent.href)}
                    className="gap-1"
                  >
                    立即使用
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 工作流程展示 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[14px]">AI赋能全链路运营</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {[
                  { icon: Search, label: '智能选品', desc: '3-5分钟' },
                  { icon: Image, label: '图片处理', desc: '1-2分钟/张' },
                  { icon: Video, label: '视频生成', desc: '5-10分钟' },
                  { icon: Upload, label: '一键上架', desc: '30秒/商品' },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-[12px] font-medium mt-2">{step.label}</p>
                      <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                    </div>
                    {idx < 3 && (
                      <div className="flex-1 h-[2px] bg-border mx-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最近任务 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[14px]">最近任务</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-[12px]">
                查看全部
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      task.status === 'completed' ? 'bg-green-500/10' : 'bg-orange-500/10'
                    }`}>
                      {task.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{task.agent}</p>
                      <p className="text-[11px] text-muted-foreground">任务ID: {task.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        task.status === 'completed'
                          ? 'border-green-500/30 text-green-500'
                          : 'border-orange-500/30 text-orange-500'
                      }`}
                    >
                      {task.status === 'completed' ? '已完成' : '处理中'}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{task.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
