'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plug,
  ExternalLink,
  Copy,
  Plus,
  Trash2,
  TestTube,
} from 'lucide-react';
import { toast } from 'sonner';

// 数据源配置类型
interface DataSource {
  id: string;
  name: string;
  type: 'chanmm' | 'junglescout' | 'helium10' | 'tktrends' | 'googletrends' | '1688';
  description: string;
  icon: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error';
  apiKey?: string;
  apiSecret?: string;
  lastSync?: string;
  config?: Record<string, string>;
}

// 选品策略配置
interface SelectionStrategy {
  minMonthlySales: number;
  minProfitMargin: number;
  maxCompetition: '蓝海' | '中等' | '红海';
  trendThreshold: number;
  resultLimit: number;
  sortBy: 'sales' | 'profit' | 'trend';
}

// 默认数据源
const defaultDataSources: DataSource[] = [
  {
    id: 'chanmm',
    name: '蝉妈妈TK版',
    type: 'chanmm',
    description: 'TK热门商品数据、销量趋势、达人分析',
    icon: '🐞',
    enabled: true,
    status: 'connected',
    lastSync: new Date().toISOString(),
    config: {
      workspaceId: 'demo_workspace',
    },
  },
  {
    id: 'junglescout',
    name: 'Jungle Scout',
    type: 'junglescout',
    description: '亚马逊竞品分析、市场洞察、关键词研究',
    icon: '🔍',
    enabled: false,
    status: 'disconnected',
  },
  {
    id: 'helium10',
    name: 'Helium 10',
    type: 'helium10',
    description: '关键词研究、产品调研、趋势分析',
    icon: '💎',
    enabled: false,
    status: 'disconnected',
  },
  {
    id: 'tktrends',
    name: 'TK Trends',
    type: 'tktrends',
    description: 'TK平台热门话题、标签趋势、热门视频',
    icon: '📈',
    enabled: false,
    status: 'disconnected',
  },
  {
    id: 'googletrends',
    name: 'Google Trends',
    type: 'googletrends',
    description: '品类搜索趋势、Google搜索热度分析',
    icon: '🌐',
    enabled: false,
    status: 'disconnected',
  },
  {
    id: '1688',
    name: '1688采购平台',
    type: '1688',
    description: '1688货源搜索、供应商匹配、采购链接',
    icon: '🛒',
    enabled: false,
    status: 'disconnected',
  },
];

export default function DataSourcesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dataSources, setDataSources] = useState<DataSource[]>(defaultDataSources);
  const [strategy, setStrategy] = useState<SelectionStrategy>({
    minMonthlySales: 1000,
    minProfitMargin: 15,
    maxCompetition: '中等',
    trendThreshold: 20,
    resultLimit: 10,
    sortBy: 'sales',
  });
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // 测试数据源连接
  const testConnection = async (source: DataSource) => {
    if (!source.apiKey) {
      toast.error('请先配置API凭证');
      return;
    }

    // 模拟测试连接
    toast.promise(
      new Promise((resolve) => setTimeout(() => resolve('success'), 1500)),
      {
        loading: `正在测试${source.name}连接...`,
        success: () => {
          setDataSources(prev =>
            prev.map(s =>
              s.id === source.id
                ? { ...s, status: 'connected' as const, lastSync: new Date().toISOString() }
                : s
            )
          );
          return `${source.name} 连接成功！`;
        },
        error: () => {
          setDataSources(prev =>
            prev.map(s =>
              s.id === source.id ? { ...s, status: 'error' as const } : s
            )
          );
          return `${source.name} 连接失败`;
        },
      }
    );
  };

  // 同步数据
  const syncData = async (source: DataSource) => {
    if (source.status !== 'connected') {
      toast.error('请先连接数据源');
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(() => resolve('success'), 2000)),
      {
        loading: `正在同步${source.name}数据...`,
        success: () => {
          setDataSources(prev =>
            prev.map(s =>
              s.id === source.id
                ? { ...s, lastSync: new Date().toISOString() }
                : s
            )
          );
          return `${source.name} 数据同步完成`;
        },
        error: '数据同步失败',
      }
    );
  };

  // 保存数据源配置
  const saveDataSource = (source: DataSource) => {
    setDataSources(prev =>
      prev.map(s => (s.id === source.id ? source : s))
    );
    setEditingSource(null);
    toast.success(`${source.name} 配置已保存`);
  };

  // 获取状态颜色
  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-success/10 text-success border-success/20';
      case 'error':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // 获取状态文本
  const getStatusText = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return '已连接';
      case 'error':
        return '连接错误';
      default:
        return '未连接';
    }
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold">数据源配置</h1>
              <p className="text-[14px] text-muted-foreground">
                配置选品数据来源，支持第三方选品工具API对接
              </p>
            </div>
          </div>
        </div>

        {/* 数据源状态概览 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground">已配置数据源</p>
                  <p className="text-2xl font-bold">{dataSources.filter(s => s.enabled).length}</p>
                </div>
                <Plug className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground">已连接</p>
                  <p className="text-2xl font-bold text-success">
                    {dataSources.filter(s => s.status === 'connected').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-success/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground">待配置</p>
                  <p className="text-2xl font-bold text-warning">
                    {dataSources.filter(s => s.enabled && s.status === 'disconnected').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground">最后同步</p>
                  <p className="text-[14px] font-medium">
                    {dataSources.find(s => s.lastSync)?.lastSync
                      ? new Date(dataSources.find(s => s.lastSync)!.lastSync!).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="datasources">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="datasources">📊 数据源管理</TabsTrigger>
            <TabsTrigger value="strategy">🎯 选品策略</TabsTrigger>
          </TabsList>

          {/* 数据源管理 */}
          <TabsContent value="datasources" className="space-y-4">
            <div className="grid gap-4">
              {dataSources.map((source) => (
                <Card key={source.id} className="bg-white border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                          {source.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-[16px] font-medium">{source.name}</h3>
                            <Badge variant="outline" className={getStatusColor(source.status)}>
                              {source.status === 'connected' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : source.status === 'error' ? (
                                <XCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {getStatusText(source.status)}
                            </Badge>
                            <label className="flex items-center gap-2 text-[13px]">
                              <input
                                type="checkbox"
                                checked={source.enabled}
                                onChange={(e) => {
                                  setDataSources(prev =>
                                    prev.map(s =>
                                      s.id === source.id
                                        ? { ...s, enabled: e.target.checked }
                                        : s
                                    )
                                  );
                                }}
                                className="w-4 h-4"
                              />
                              启用
                            </label>
                          </div>
                          <p className="text-[13px] text-muted-foreground mb-2">
                            {source.description}
                          </p>
                          {source.status === 'connected' && source.lastSync && (
                            <p className="text-[12px] text-muted-foreground">
                              最后同步: {new Date(source.lastSync).toLocaleString('zh-CN')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {source.enabled && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSource(source)}
                            >
                              <Settings className="h-3 w-3 mr-1" />
                              配置
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncData(source)}
                              disabled={source.status !== 'connected'}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              同步
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => testConnection(source)}
                            >
                              <TestTube className="h-3 w-3 mr-1" />
                              测试
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* 选品策略 */}
          <TabsContent value="strategy" className="space-y-4">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-[15px]">选品策略配置</CardTitle>
                <CardDescription>
                  设置选品筛选条件，系统将根据这些条件自动过滤低质量商品
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">最低月销量</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={strategy.minMonthlySales}
                        onChange={(e) =>
                          setStrategy((prev) => ({
                            ...prev,
                            minMonthlySales: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="h-10"
                      />
                      <span className="text-[13px] text-muted-foreground">件/月</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      只推荐月销量 ≥ 此值的商品
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">最低利润率</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={strategy.minProfitMargin}
                        onChange={(e) =>
                          setStrategy((prev) => ({
                            ...prev,
                            minProfitMargin: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="h-10"
                      />
                      <span className="text-[13px] text-muted-foreground">%</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      只推荐利润率 ≥ 此值的商品
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">最高竞争度</label>
                    <select
                      className="w-full h-10 px-3 border rounded-md"
                      value={strategy.maxCompetition}
                      onChange={(e) =>
                        setStrategy((prev) => ({
                          ...prev,
                          maxCompetition: e.target.value as SelectionStrategy['maxCompetition'],
                        }))
                      }
                    >
                      <option value="蓝海">蓝海（竞争少）</option>
                      <option value="中等">中等（竞争适中）</option>
                      <option value="红海">红海（竞争激烈）</option>
                    </select>
                    <p className="text-[12px] text-muted-foreground">
                      过滤高竞争度商品
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">增长趋势阈值</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={strategy.trendThreshold}
                        onChange={(e) =>
                          setStrategy((prev) => ({
                            ...prev,
                            trendThreshold: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="h-10"
                      />
                      <span className="text-[13px] text-muted-foreground">%</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      只推荐增长趋势 ≥ 此值的商品
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">结果数量限制</label>
                    <Input
                      type="number"
                      value={strategy.resultLimit}
                      onChange={(e) =>
                        setStrategy((prev) => ({
                          ...prev,
                          resultLimit: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="h-10"
                    />
                    <p className="text-[12px] text-muted-foreground">
                      每次选品最多返回结果数
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">排序方式</label>
                    <select
                      className="w-full h-10 px-3 border rounded-md"
                      value={strategy.sortBy}
                      onChange={(e) =>
                        setStrategy((prev) => ({
                          ...prev,
                          sortBy: e.target.value as SelectionStrategy['sortBy'],
                        }))
                      }
                    >
                      <option value="sales">按月销量</option>
                      <option value="profit">按利润率</option>
                      <option value="trend">按增长趋势</option>
                    </select>
                    <p className="text-[12px] text-muted-foreground">
                      结果按此维度降序排列
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      toast.success('选品策略已保存');
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    保存策略
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStrategy({
                        minMonthlySales: 1000,
                        minProfitMargin: 15,
                        maxCompetition: '中等',
                        trendThreshold: 20,
                        resultLimit: 10,
                        sortBy: 'sales',
                      });
                      toast.success('已恢复默认策略');
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    恢复默认
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 配置编辑对话框 */}
      {editingSource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] bg-white">
            <CardHeader>
              <CardTitle className="text-[16px]">配置 {editingSource.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-[13px] font-medium">API Key</label>
                <Input
                  type="password"
                  placeholder="输入API Key"
                  value={editingSource.apiKey || ''}
                  onChange={(e) =>
                    setEditingSource((prev) =>
                      prev ? { ...prev, apiKey: e.target.value } : null
                    )
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-medium">API Secret</label>
                <Input
                  type="password"
                  placeholder="输入API Secret"
                  value={editingSource.apiSecret || ''}
                  onChange={(e) =>
                    setEditingSource((prev) =>
                      prev ? { ...prev, apiSecret: e.target.value } : null
                    )
                  }
                  className="h-10"
                />
              </div>
              {editingSource.config && Object.keys(editingSource.config).length > 0 && (
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">其他配置</label>
                  {Object.entries(editingSource.config).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[13px] text-muted-foreground w-24">{key}:</span>
                      <Input
                        value={value}
                        onChange={(e) =>
                          setEditingSource((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  config: { ...prev.config, [key]: e.target.value },
                                }
                              : null
                          )
                        }
                        className="h-9 text-[13px]"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditingSource(null)}>
                  取消
                </Button>
                <Button
                  onClick={() => {
                    saveDataSource(editingSource);
                  }}
                >
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  );
}
