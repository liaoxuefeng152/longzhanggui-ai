'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Clock,
  Bell,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  Send,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// 推送类型
const PUSH_TYPES = [
  { id: 'daily_report', name: '运营日报', icon: '📊', description: '每日发送运营数据汇总' },
  { id: 'weekly_report', name: '周报', icon: '📈', description: '每周发送周度数据分析' },
  { id: 'inventory_alert', name: '库存预警', icon: '📦', description: '库存低于阈值时告警' },
  { id: 'order_exception', name: '订单异常', icon: '⚠️', description: '订单处理异常时告警' },
  { id: 'ad_roi_low', name: '广告ROI低', icon: '💰', description: '广告ROI低于预期时告警' },
  { id: 'competitor_alert', name: '竞品动态', icon: '🔍', description: '竞品价格变动时通知' },
  { id: 'customer_review', name: '差评预警', icon: '⭐', description: '收到差评时立即通知' },
  { id: 'logistics_exception', name: '物流异常', icon: '🚚', description: '物流异常时告警' },
];

// 推送配置
interface PushConfig {
  id: string;
  type: string;
  enabled: boolean;
  schedule_time: string;
  threshold?: number;
  channels: string[];
}

export default function SchedulerPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [configs, setConfigs] = useState<PushConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testConfigId, setTestConfigId] = useState<string | null>(null);

  // 新增/编辑配置
  const [editConfig, setEditConfig] = useState<Partial<PushConfig>>({
    type: '',
    enabled: true,
    schedule_time: '09:00',
    threshold: 10,
    channels: ['feishu'],
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadConfigs();
  }, [router]);

  // 加载配置
  const loadConfigs = () => {
    setLoading(true);
    // 模拟数据
    setTimeout(() => {
      setConfigs([
        {
          id: '1',
          type: 'daily_report',
          enabled: true,
          schedule_time: '09:00',
          channels: ['feishu'],
        },
        {
          id: '2',
          type: 'weekly_report',
          enabled: true,
          schedule_time: '09:00',
          channels: ['feishu'],
        },
        {
          id: '3',
          type: 'inventory_alert',
          enabled: true,
          schedule_time: '08:00',
          threshold: 20,
          channels: ['feishu', 'sms'],
        },
        {
          id: '4',
          type: 'order_exception',
          enabled: false,
          schedule_time: '00:00',
          channels: ['feishu'],
        },
        {
          id: '5',
          type: 'ad_roi_low',
          enabled: true,
          schedule_time: '10:00',
          threshold: 15,
          channels: ['feishu'],
        },
      ]);
      setLoading(false);
    }, 300);
  };

  // 获取推送类型信息
  const getPushTypeInfo = (typeId: string) => {
    return PUSH_TYPES.find((t) => t.id === typeId);
  };

  // 切换启用状态
  const toggleEnabled = (id: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
    toast.success('状态已更新');
  };

  // 删除配置
  const handleDelete = (id: string) => {
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    toast.success('推送配置已删除');
  };

  // 保存配置
  const handleSave = () => {
    if (!editConfig.type) {
      toast.error('请选择推送类型');
      return;
    }

    if (editConfig.id) {
      // 编辑
      setConfigs((prev) =>
        prev.map((c) => (c.id === editConfig.id ? { ...c, ...editConfig } as PushConfig : c))
      );
      toast.success('配置已更新');
    } else {
      // 新增
      const newConfig: PushConfig = {
        id: Date.now().toString(),
        type: editConfig.type!,
        enabled: true,
        schedule_time: editConfig.schedule_time || '09:00',
        threshold: editConfig.threshold,
        channels: editConfig.channels || ['feishu'],
      };
      setConfigs((prev) => [...prev, newConfig]);
      toast.success('推送配置已添加');
    }

    setShowAddDialog(false);
    setEditConfig({
      type: '',
      enabled: true,
      schedule_time: '09:00',
      threshold: 10,
      channels: ['feishu'],
    });
  };

  // 测试推送
  const handleTestPush = async (configId: string) => {
    setIsTesting(true);
    setTestConfigId(configId);
    
    try {
      // 模拟发送
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('测试推送已发送，请查收');
    } catch (error) {
      toast.error('测试推送失败');
    } finally {
      setIsTesting(false);
      setTestConfigId(null);
    }
  };

  // 立即推送
  const handleImmediatePush = async (configId: string) => {
    toast.success('推送任务已提交');
  };

  // 打开编辑弹窗
  const handleEdit = (config: PushConfig) => {
    setEditConfig({ ...config });
    setShowAddDialog(true);
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="container py-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#FF7D00]500" />
              主动推送配置
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              配置定时推送和阈值触发推送规则，系统自动执行
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadConfigs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加推送
            </Button>
          </div>
        </div>

        {/* 推送类型说明 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">支持推送类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {PUSH_TYPES.map((type) => (
                <div key={type.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-xl">{type.icon}</span>
                  <div>
                    <div className="text-[13px] font-medium">{type.name}</div>
                    <div className="text-[11px] text-muted-foreground">{type.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 推送配置列表 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[14px]">推送配置</CardTitle>
                <CardDescription>
                  共 {configs.length} 个推送规则，{configs.filter((c) => c.enabled).length} 个已启用
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : configs.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-30" />
                <p className="text-muted-foreground">暂无推送配置</p>
                <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个推送配置
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {configs.map((config) => {
                  const typeInfo = getPushTypeInfo(config.type);
                  return (
                    <div
                      key={config.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        config.enabled ? 'bg-white' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={() => toggleEnabled(config.id)}
                        />
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{typeInfo?.icon}</span>
                          <div>
                            <div className="text-[14px] font-medium">{typeInfo?.name}</div>
                            <div className="text-[12px] text-muted-foreground">
                              {typeInfo?.description}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* 推送时间 */}
                        <div className="text-right">
                          <div className="text-[13px] text-muted-foreground">推送时间</div>
                          <div className="text-[14px] font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {config.schedule_time}
                          </div>
                        </div>

                        {/* 阈值 */}
                        {config.threshold !== undefined && (
                          <div className="text-right">
                            <div className="text-[13px] text-muted-foreground">阈值</div>
                            <div className="text-[14px] font-medium">
                              {config.threshold}
                              {config.type === 'inventory_alert' ? '件' : '%'}
                            </div>
                          </div>
                        )}

                        {/* 渠道 */}
                        <div className="text-right">
                          <div className="text-[13px] text-muted-foreground">推送渠道</div>
                          <div className="flex gap-1 mt-1">
                            {config.channels.map((ch) => (
                              <Badge key={ch} variant="outline" className="text-xs">
                                {ch === 'feishu' ? '飞书' : ch === 'sms' ? '短信' : ch}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* 状态 */}
                        <Badge
                          className={
                            config.enabled
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {config.enabled ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              已启用
                            </>
                          ) : (
                            '已禁用'
                          )}
                        </Badge>

                        {/* 操作 */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestPush(config.id)}
                            disabled={isTesting || !config.enabled}
                          >
                            {isTesting && testConfigId === config.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(config)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(config.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 添加/编辑弹窗 */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editConfig.id ? '编辑推送配置' : '添加推送配置'}</DialogTitle>
              <DialogDescription>配置推送规则和触发条件</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* 推送类型 */}
              <div className="space-y-2">
                <Label>推送类型</Label>
                <Select
                  value={editConfig.type}
                  onValueChange={(value) => setEditConfig({ ...editConfig, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择推送类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {PUSH_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 推送时间 */}
              <div className="space-y-2">
                <Label>推送时间</Label>
                <Input
                  type="time"
                  value={editConfig.schedule_time}
                  onChange={(e) =>
                    setEditConfig({ ...editConfig, schedule_time: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  定时任务将在每天该时间自动执行
                </p>
              </div>

              {/* 阈值（部分类型需要） */}
              {['inventory_alert', 'ad_roi_low'].includes(editConfig.type || '') && (
                <div className="space-y-2">
                  <Label>
                    {editConfig.type === 'inventory_alert' ? '库存预警阈值' : 'ROI告警阈值'}
                  </Label>
                  <Input
                    type="number"
                    value={editConfig.threshold || 10}
                    onChange={(e) =>
                      setEditConfig({ ...editConfig, threshold: Number(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {editConfig.type === 'inventory_alert'
                      ? '库存低于此数量时触发预警'
                      : 'ROI低于此百分比时触发告警'}
                  </p>
                </div>
              )}

              {/* 推送渠道 */}
              <div className="space-y-2">
                <Label>推送渠道</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editConfig.channels?.includes('feishu')}
                      onCheckedChange={(checked) => {
                        const channels = checked
                          ? [...(editConfig.channels || []), 'feishu']
                          : (editConfig.channels || []).filter((c) => c !== 'feishu');
                        setEditConfig({ ...editConfig, channels });
                      }}
                    />
                    <Label>飞书机器人</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editConfig.channels?.includes('sms')}
                      onCheckedChange={(checked) => {
                        const channels = checked
                          ? [...(editConfig.channels || []), 'sms']
                          : (editConfig.channels || []).filter((c) => c !== 'sms');
                        setEditConfig({ ...editConfig, channels });
                      }}
                    />
                    <Label>短信通知</Label>
                  </div>
                </div>
              </div>

              {/* 启用状态 */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={editConfig.enabled}
                  onCheckedChange={(checked) =>
                    setEditConfig({ ...editConfig, enabled: checked })
                  }
                />
                <Label>立即启用</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                取消
              </Button>
              <Button onClick={handleSave}>保存配置</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
