'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [shopName, setShopName] = useState('龙掌柜跨境');
  const [contactEmail, setContactEmail] = useState('');
  const [defaultMarket, setDefaultMarket] = useState('shopee_sg');
  const [defaultProfit, setDefaultProfit] = useState('30');
  const [defaultLang, setDefaultLang] = useState('en');

  const [platforms, setPlatforms] = useState([
    { id: 'shopee_sg', name: 'Shopee 新加坡', bound: true },
    { id: 'shopee_my', name: 'Shopee 马来西亚', bound: true },
    { id: 'lazada_sg', name: 'Lazada 新加坡', bound: false },
    { id: 'tiktok', name: 'TikTok Shop', bound: false },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  const handleSave = () => {
    toast.success('设置已保存');
  };

  const handleBindPlatform = (platformId: string) => {
    toast.info(`去绑定 ${platforms.find(p => p.id === platformId)?.name}`);
  };

  const handleUnbindPlatform = (platformId: string) => {
    setPlatforms(prev => 
      prev.map(p => p.id === platformId ? { ...p, bound: false } : p)
    );
    toast.success('已解绑');
  };

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">⚙️ 设置</h1>
          </div>
          <Button onClick={handleSave}>
            <RefreshCw className="h-4 w-4 mr-2" />
            保存设置
          </Button>
        </div>

        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="platforms">平台绑定</TabsTrigger>
            <TabsTrigger value="defaults">默认配置</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>店铺名称</Label>
                  <Input 
                    value={shopName} 
                    onChange={(e) => setShopName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>联系邮箱</Label>
                  <Input 
                    value={contactEmail} 
                    onChange={(e) => setContactEmail(e.target.value)} 
                    placeholder="xxx@xxx.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platforms" className="pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">平台绑定</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platforms.map((platform) => (
                    <div 
                      key={platform.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {platform.bound ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                        <div>
                          <div className="text-[14px]">{platform.name}</div>
                          {platform.bound && (
                            <div className="text-[12px] text-muted-foreground">已绑定</div>
                          )}
                        </div>
                      </div>
                      {platform.bound ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUnbindPlatform(platform.id)}
                        >
                          解绑
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleBindPlatform(platform.id)}
                        >
                          去绑定
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="defaults" className="pt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[14px]">默认配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>默认目标市场</Label>
                  <Select value={defaultMarket} onValueChange={setDefaultMarket}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shopee_sg">Shopee 新加坡</SelectItem>
                      <SelectItem value="shopee_my">Shopee 马来西亚</SelectItem>
                      <SelectItem value="shopee_th">Shopee 泰国</SelectItem>
                      <SelectItem value="lazada_sg">Lazada 新加坡</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>默认利润率</Label>
                  <Select value={defaultProfit} onValueChange={setDefaultProfit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="30">30%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>默认语言</Label>
                  <Select value={defaultLang} onValueChange={setDefaultLang}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">英文</SelectItem>
                      <SelectItem value="id">印尼语</SelectItem>
                      <SelectItem value="th">泰语</SelectItem>
                      <SelectItem value="vi">越南语</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
