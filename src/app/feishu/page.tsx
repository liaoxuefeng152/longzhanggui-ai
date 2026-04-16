'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  RefreshCw,
  Send,
  Bell,
  FileText,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FeishuPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // 推送配置
  const [dailyReport, setDailyReport] = useState(true);
  const [dailyReportTime, setDailyReportTime] = useState('09:00');
  const [inventoryAlert, setInventoryAlert] = useState(true);
  const [inventoryThreshold, setInventoryThreshold] = useState('20');
  const [adAlert, setAdAlert] = useState(true);
  const [reviewAlert, setReviewAlert] = useState(true);
  const [competitorAlert, setCompetitorAlert] = useState(false);

  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  // 保存配置
  const handleSave = () => {
    toast.success('配置已保存');
  };

  // 测试推送
  const handleTestPush = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      toast.success('测试推送已发送，请查收');
    }, 1500);
  };

  // 推送历史（模拟）
  const pushHistory = [
    { time: '10:30', text: '广告告警：宠物饮水机ACOS 45%，建议优化', type: 'ad' },
    { time: '09:00', text: '运营日报：昨日销售额 $4,280，上新8个', type: 'daily' },
    { time: '昨天', text: '库存预警：宠物饮水机库存 15件，需补货', type: 'inventory' },
  ];

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#165DFF]" />
              飞书助手
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSave}>
              <RefreshCw className="h-4 w-4 mr-2" />
              保存配置
            </Button>
          </div>
        </div>

        {/* 绑定状态 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">绑定状态</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-[14px] font-medium">已绑定飞书机器人（@龙掌柜）</div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              重新绑定
            </Button>
          </CardContent>
        </Card>

        {/* 推送配置 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">推送配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 每日运营日报 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch 
                  id="dailyReport" 
                  checked={dailyReport} 
                  onCheckedChange={setDailyReport} 
                />
                <div>
                  <Label htmlFor="dailyReport" className="text-[14px] font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    每日运营日报
                  </Label>
                  {dailyReport && (
                    <div className="text-[12px] text-muted-foreground mt-1">
                      {dailyReportTime} 推送
                    </div>
                  )}
                </div>
              </div>
              {dailyReport && (
                <Input
                  type="time"
                  value={dailyReportTime}
                  onChange={(e) => setDailyReportTime(e.target.value)}
                  className="w-32"
                />
              )}
            </div>

            {/* 库存预警 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch 
                  id="inventoryAlert" 
                  checked={inventoryAlert} 
                  onCheckedChange={setInventoryAlert} 
                />
                <div>
                  <Label htmlFor="inventoryAlert" className="text-[14px] font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    库存预警
                  </Label>
                  {inventoryAlert && (
                    <div className="text-[12px] text-muted-foreground mt-1">
                      库存 &lt; {inventoryThreshold} 件时立即推送
                    </div>
                  )}
                </div>
              </div>
              {inventoryAlert && (
                <Input
                  type="number"
                  value={inventoryThreshold}
                  onChange={(e) => setInventoryThreshold(e.target.value)}
                  className="w-24"
                  suffix="件"
                />
              )}
            </div>

            {/* 广告告警 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch 
                  id="adAlert" 
                  checked={adAlert} 
                  onCheckedChange={setAdAlert} 
                />
                <div>
                  <Label htmlFor="adAlert" className="text-[14px] font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    广告告警
                  </Label>
                  <div className="text-[12px] text-muted-foreground mt-1">
                    ACOS &gt; 40% 或花费暴增50%时推送
                  </div>
                </div>
              </div>
            </div>

            {/* 差评预警 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch 
                  id="reviewAlert" 
                  checked={reviewAlert} 
                  onCheckedChange={setReviewAlert} 
                />
                <div>
                  <Label htmlFor="reviewAlert" className="text-[14px] font-medium">
                    差评预警
                  </Label>
                  <div className="text-[12px] text-muted-foreground mt-1">
                    收到差评时立即推送
                  </div>
                </div>
              </div>
            </div>

            {/* 竞品价格变动 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch 
                  id="competitorAlert" 
                  checked={competitorAlert} 
                  onCheckedChange={setCompetitorAlert} 
                />
                <div>
                  <Label htmlFor="competitorAlert" className="text-[14px] font-medium">
                    竞品价格变动
                  </Label>
                  <div className="text-[12px] text-muted-foreground mt-1">
                    监控竞品价格变化
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 测试推送 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">测试推送</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTestPush} disabled={isTesting}>
              {isTesting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  发送中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  发送测试消息
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 推送历史 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">推送历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pushHistory.map((item, idx) => (
                <div key={idx} className="text-sm">
                  <span className="text-muted-foreground w-16 inline-block">[{item.time}]</span>
                  {item.text}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
