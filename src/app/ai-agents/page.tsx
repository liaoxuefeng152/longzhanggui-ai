'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Bot,
  Search,
  Sparkles,
  Package,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Megaphone,
  Headphones,
  BarChart3,
  ArrowRight,
  Play,
  Settings,
  Zap,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  description: string;
  priority: string;
  status: string;
}

export default function AIAgentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchAgents();
  }, [router]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/ai/agents', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('获取智能体列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAgentIcon = (id: string) => {
    const icons: Record<string, any> = {
      product_selection: Package,
      image: ImageIcon,
      listing_optimization: FileText,
      pricing: DollarSign,
      advertising: Megaphone,
      customer_service: Headphones,
      data_review: BarChart3,
    };
    return icons[id] || Bot;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'P0') {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">P0 核心</Badge>;
    }
    return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">P1 重要</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">AI智能体中心</h1>
              <p className="text-[14px] text-muted-foreground">7大AI智能体，助力跨境电商全链路运营</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              全部在线
            </Badge>
          </div>
        </div>

        {/* 核心能力 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-[12px] text-blue-500 font-medium">智能选品</span>
              </div>
              <div className="text-[20px] font-semibold text-foreground">AI驱动</div>
              <div className="text-[11px] text-muted-foreground">爆款挖掘+竞品分析</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-purple-500" />
                <span className="text-[12px] text-purple-500 font-medium">图片处理</span>
              </div>
              <div className="text-[20px] font-semibold text-foreground">双模式</div>
              <div className="text-[11px] text-muted-foreground">翻译模式+优化模式</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-[12px] text-green-500 font-medium">智能定价</span>
              </div>
              <div className="text-[20px] font-semibold text-foreground">公式计算</div>
              <div className="text-[11px] text-muted-foreground">成本+利润+竞品</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Headphones className="h-4 w-4 text-orange-500" />
                <span className="text-[12px] text-orange-500 font-medium">AI客服</span>
              </div>
              <div className="text-[20px] font-semibold text-foreground">多语种</div>
              <div className="text-[11px] text-muted-foreground">自动回复+纠纷处理</div>
            </CardContent>
          </Card>
        </div>

        {/* 智能体列表 */}
        <div className="grid grid-cols-2 gap-4">
          {agents.map((agent) => {
            const Icon = getAgentIcon(agent.id);
            return (
              <Card key={agent.id} className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-[15px]">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getPriorityBadge(agent.priority)}
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            {agent.status === 'active' ? '运行中' : '离线'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      执行
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-[13px] text-muted-foreground">{agent.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 快捷入口 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px]">快捷功能</CardTitle>
            <CardDescription>常用AI功能快捷入口</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="text-[13px]">智能选品</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                <span className="text-[13px]">图片翻译</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-[13px]">Listing优化</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-[13px]">智能定价</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
