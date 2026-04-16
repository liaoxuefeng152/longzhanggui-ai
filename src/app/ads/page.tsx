'use client';

import { useState } from 'react';
import { TrendingUp, DollarSign, Target, BarChart3, AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from 'sonner';

// 模拟广告数据
const mockCampaigns = [
  {
    id: 1,
    name: '宠物喂食器-US',
    platform: 'TikTok',
    status: 'active',
    budget: 500,
    spent: 320,
    sales: 1280,
    orders: 32,
    roi: 4.0,
    trend: 'up',
  },
  {
    id: 2,
    name: 'LED灯串-美区',
    platform: 'Shopee',
    status: 'active',
    budget: 300,
    spent: 280,
    sales: 560,
    orders: 28,
    roi: 2.0,
    trend: 'down',
  },
  {
    id: 3,
    name: '手机支架-测试',
    platform: 'TikTok',
    status: 'paused',
    budget: 100,
    spent: 50,
    sales: 75,
    orders: 5,
    roi: 1.5,
    trend: 'stable',
  },
];

const mockOptimizationSuggestions = [
  {
    id: 1,
    type: 'budget',
    title: '增加高ROI计划预算',
    desc: '宠物喂食器计划ROI高达4.0，建议增加预算以获取更多销量',
    priority: 'high',
    impact: '预计可增加30%销量',
  },
  {
    id: 2,
    type: 'optimize',
    title: '优化低ROI计划',
    desc: 'LED灯串计划ROI仅2.0，建议优化关键词和出价',
    priority: 'medium',
    impact: '预计可提升ROI至3.0+',
  },
  {
    id: 3,
    type: 'pause',
    title: '暂停低效计划',
    desc: '手机支架测试计划ROI过低，建议暂停',
    priority: 'low',
    impact: '可节省广告预算',
  },
];

export default function AdsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleAutoOptimize = async () => {
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsOptimizing(false);
    toast.success('广告优化完成！');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-[#E8FFEA] text-[#00B42A]">投放中</Badge>;
      case 'paused':
        return <Badge className="bg-[#F2F3F5] text-[#86909C]">已暂停</Badge>;
      default:
        return null;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-[#F53F3F] bg-[#FFECE8]/30';
      case 'medium':
        return 'border-l-[#FF7D00] bg-[#FFF7E8]/30';
      case 'low':
        return 'border-l-[#86909C] bg-[#F2F3F5]/30';
      default:
        return '';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1D2129]">广告优化</h1>
            <p className="text-[#86909C] mt-1">AI智能优化广告投放，提升ROI</p>
          </div>
          <Button className="btn-primary" onClick={handleAutoOptimize} disabled={isOptimizing}>
            {isOptimizing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                优化中...
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                一键优化
              </>
            )}
          </Button>
        </div>

        {/* 顶部统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-minimal p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#86909C] text-sm mb-1">今日广告花费</p>
                <p className="text-2xl font-bold text-[#1D2129]">¥650</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-[#FF7D00] flex items-center">
                    <ArrowUp className="w-4 h-4 mr-0.5" />
                    12%
                  </span>
                  <span className="text-[#86909C] text-sm">较昨日</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FFF7E8] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#FF7D00]" />
              </div>
            </div>
          </Card>

          <Card className="card-minimal p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#86909C] text-sm mb-1">广告销售额</p>
                <p className="text-2xl font-bold text-[#1D2129]">¥1,915</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-[#00B42A] flex items-center">
                    <ArrowUp className="w-4 h-4 mr-0.5" />
                    25%
                  </span>
                  <span className="text-[#86909C] text-sm">较昨日</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#E8FFEA] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#00B42A]" />
              </div>
            </div>
          </Card>

          <Card className="card-minimal p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#86909C] text-sm mb-1">整体ROI</p>
                <p className="text-2xl font-bold text-[#1D2129]">2.95</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-[#00B42A] flex items-center">
                    <ArrowUp className="w-4 h-4 mr-0.5" />
                    0.3
                  </span>
                  <span className="text-[#86909C] text-sm">较昨日</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#E8F3FF] flex items-center justify-center">
                <Target className="w-5 h-5 text-[#165DFF]" />
              </div>
            </div>
          </Card>

          <Card className="card-minimal p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#86909C] text-sm mb-1">广告订单</p>
                <p className="text-2xl font-bold text-[#1D2129]">65</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-[#00B42A] flex items-center">
                    <ArrowUp className="w-4 h-4 mr-0.5" />
                    18%
                  </span>
                  <span className="text-[#86909C] text-sm">较昨日</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#FFF7E8] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#FF7D00]" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md bg-[#F2F3F5]">
            <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              广告概览
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-[#165DFF]">
              优化建议
            </TabsTrigger>
          </TabsList>

          {/* 广告概览 */}
          <TabsContent value="overview" className="mt-6">
            <Card className="card-minimal">
              <div className="p-5 border-b border-[#E5E6EB]">
                <h3 className="text-lg font-semibold text-[#1D2129]">广告计划列表</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {mockCampaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 bg-[#F7F8FA] rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold text-[#1D2129]">{campaign.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className="bg-[#F2F3F5] text-[#4E5969]">{campaign.platform}</Badge>
                              {getStatusBadge(campaign.status)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${campaign.roi >= 3 ? 'text-[#00B42A]' : campaign.roi >= 2 ? 'text-[#FF7D00]' : 'text-[#F53F3F]'}`}>
                            ROI {campaign.roi.toFixed(1)}
                          </div>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            {campaign.trend === 'up' ? (
                              <ArrowUp className="w-4 h-4 text-[#00B42A]" />
                            ) : campaign.trend === 'down' ? (
                              <ArrowDown className="w-4 h-4 text-[#F53F3F]" />
                            ) : (
                              <span className="w-4 h-4" />
                            )}
                            <span className={`text-sm ${campaign.trend === 'up' ? 'text-[#00B42A]' : campaign.trend === 'down' ? 'text-[#F53F3F]' : 'text-[#86909C]'}`}>
                              {campaign.trend === 'up' ? '上升' : campaign.trend === 'down' ? '下降' : '稳定'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-[#86909C]">预算</p>
                          <p className="text-[#1D2129] font-medium">${campaign.budget}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#86909C]">已花费</p>
                          <p className="text-[#1D2129] font-medium">${campaign.spent}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#86909C]">销售额</p>
                          <p className="text-[#00B42A] font-medium">${campaign.sales}</p>
                        </div>
                        <div>
                          <p className="text-sm text-[#86909C]">订单数</p>
                          <p className="text-[#1D2129] font-medium">{campaign.orders}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2 flex-1 mr-4" />
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-[#4E5969]">
                            <Settings className="w-4 h-4 mr-1" />
                            编辑
                          </Button>
                          {campaign.status === 'active' ? (
                            <Button variant="ghost" size="sm" className="text-[#F53F3F]">
                              暂停
                            </Button>
                          ) : (
                            <Button size="sm" className="btn-primary">
                              启动
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* 优化建议 */}
          <TabsContent value="suggestions" className="mt-6">
            <Card className="card-minimal">
              <div className="p-5 border-b border-[#E5E6EB]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#1D2129]">AI优化建议</h3>
                  <Badge className="bg-[#E8F3FF] text-[#165DFF]">{mockOptimizationSuggestions.length}条建议</Badge>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {mockOptimizationSuggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id} 
                      className={`p-5 rounded-lg border-l-4 ${getPriorityClass(suggestion.priority)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-[#1D2129]">{suggestion.title}</h4>
                            <Badge className={
                              suggestion.priority === 'high' 
                                ? 'bg-[#FFECE8] text-[#F53F3F]' 
                                : suggestion.priority === 'medium' 
                                  ? 'bg-[#FFF7E8] text-[#FF7D00]' 
                                  : 'bg-[#F2F3F5] text-[#86909C]'
                            }>
                              {suggestion.priority === 'high' ? '高优先级' : suggestion.priority === 'medium' ? '中优先级' : '低优先级'}
                            </Badge>
                          </div>
                          <p className="text-[#4E5969] mb-3">{suggestion.desc}</p>
                          <p className="text-sm text-[#00B42A] flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {suggestion.impact}
                          </p>
                        </div>
                        <Button className="btn-primary">
                          执行
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
