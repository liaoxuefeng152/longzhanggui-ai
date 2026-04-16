'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  Search,
  RefreshCw,
  Star,
  DollarSign,
  Package,
  CheckCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SelectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // 表单状态
  const [market, setMarket] = useState('shopee_sg');
  const [category, setCategory] = useState('pet');
  const [budget, setBudget] = useState('100-500');
  const [profitMargin, setProfitMargin] = useState('30');

  // 分析状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // 选品报告弹窗
  const [showReport, setShowReport] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return null;

  // 推荐品类
  const recommendedCategories = [
    { name: '宠物饮水机', score: 4, profit: 35 },
    { name: '宠物喂食器', score: 3, profit: 30 },
    { name: '宠物玩具', score: 5, profit: 40 },
  ];

  // 商品列表
  const productList = [
    { id: 1, name: '宠物自动饮水机 3.5L', cost: 45, competitorPrice: 19.99 },
    { id: 2, name: '无线蓝牙耳机 降噪款', cost: 68, competitorPrice: 29.99 },
    { id: 3, name: '便携式榨汁杯 USB充电', cost: 35, competitorPrice: 15.99 },
  ];

  // 1688供应商
  const suppliers = [
    {
      name: '义乌市某某宠物用品厂',
      rating: 4.9,
      responseTime: '2小时内',
      moq: 10,
      priceRange: '¥42-¥48',
    },
    {
      name: '深圳市某某电子有限公司',
      rating: 4.7,
      responseTime: '4小时内',
      moq: 50,
      priceRange: '¥65-¥72',
    },
    {
      name: '永康市某某五金制品厂',
      rating: 4.8,
      responseTime: '1小时内',
      moq: 20,
      priceRange: '¥32-¥38',
    },
  ];

  // 开始分析
  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      toast.success('分析完成！');
    }, 2000);
  };

  // 查看选品报告
  const handleViewReport = (product: any) => {
    setSelectedProduct(product);
    setShowReport(true);
  };

  // 加入上新队列
  const handleAddToPublish = () => {
    setShowReport(false);
    toast.success('已加入上新队列');
    router.push('/publish');
  };

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-[#22C97A]" />
            智能选品
          </h1>
        </div>

        {/* 第一步：输入需求 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-[14px]">第一步：输入需求</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>目标市场</Label>
                <Select value={market} onValueChange={setMarket}>
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
                <Label>类目</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pet">宠物用品</SelectItem>
                    <SelectItem value="electronics">3C电子</SelectItem>
                    <SelectItem value="home">家居用品</SelectItem>
                    <SelectItem value="beauty">美妆个护</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>预算范围</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-100">0-100元</SelectItem>
                    <SelectItem value="100-500">100-500元</SelectItem>
                    <SelectItem value="500-1000">500-1000元</SelectItem>
                    <SelectItem value="1000+">1000元以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>目标利润</Label>
                <Select value={profitMargin} onValueChange={setProfitMargin}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20%以上</SelectItem>
                    <SelectItem value="30">30%以上</SelectItem>
                    <SelectItem value="40">40%以上</SelectItem>
                    <SelectItem value="50">50%以上</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                size="lg"
                className="bg-[#22C97A] hover:bg-[#1EAF6A] min-w-[200px]"
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    开始分析
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 第二步：分析结果 */}
        {hasAnalyzed && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-[14px]">第二步：分析结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                <p className="text-[14px] text-blue-800">
                  📊 市场分析结论：宠物饮水机市场规模大，竞争适中，利润空间好
                </p>
              </div>

              <p className="text-[13px] text-muted-foreground mb-3">推荐品类（3个）：</p>
              <div className="grid grid-cols-3 gap-4">
                {recommendedCategories.map((cat, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 border rounded-lg hover:border-[#165DFF] hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="text-[15px] font-medium mb-2">{cat.name}</div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < cat.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        利润：{cat.profit}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 第三步：选择商品 */}
        {hasAnalyzed && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[14px]">第三步：选择商品进行分析</CardTitle>
                  <CardDescription>选择一个商品查看详细选品报告</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="输入商品名称或链接..." 
                    className="w-64" 
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    搜索
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-16">图片</th>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground">商品名</th>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-28">成本</th>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-32">竞品价格</th>
                      <th className="text-left px-4 py-3 text-[12px] font-medium text-muted-foreground w-28">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map((product) => (
                      <tr key={product.id} className="border-t hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground opacity-30" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[14px]">{product.name}</td>
                        <td className="px-4 py-3 text-[14px] text-orange-600 font-medium">¥{product.cost}</td>
                        <td className="px-4 py-3 text-[14px]">${product.competitorPrice}</td>
                        <td className="px-4 py-3">
                          <Button 
                            size="sm" 
                            onClick={() => handleViewReport(product)}
                          >
                            分析
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 选品报告弹窗 */}
        <Dialog open={showReport} onOpenChange={setShowReport}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#165DFF]" />
                选品分析报告 - {selectedProduct?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* 市场分析 */}
              <div>
                <h4 className="text-[14px] font-medium mb-3">市场分析</h4>
                <div className="space-y-2 text-[14px]">
                  <p>• 市场规模：每月搜索量 10万+，销量稳定增长</p>
                  <p>• 竞争度：中等，头部商品评分 4.5+</p>
                  <p>• 利润空间：成本¥{selectedProduct?.cost}，建议售价$19.99，利润率 38%</p>
                </div>
              </div>

              {/* 利润测算 */}
              <div>
                <h4 className="text-[14px] font-medium mb-3">利润测算</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-2">成本</th>
                        <th className="text-left px-4 py-2">物流</th>
                        <th className="text-left px-4 py-2">佣金</th>
                        <th className="text-left px-4 py-2">广告</th>
                        <th className="text-left px-4 py-2">税费</th>
                        <th className="text-left px-4 py-2">利润</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="px-4 py-2">¥{selectedProduct?.cost}</td>
                        <td className="px-4 py-2">¥20</td>
                        <td className="px-4 py-2">$3</td>
                        <td className="px-4 py-2">$2</td>
                        <td className="px-4 py-2">$1</td>
                        <td className="px-4 py-2 text-green-600 font-medium">$12</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 1688供应商 */}
              <div>
                <h4 className="text-[14px] font-medium mb-3">1688供应商匹配（3个）</h4>
                <div className="space-y-3">
                  {suppliers.map((supplier, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[14px] font-medium">{supplier.name}</div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < Math.floor(supplier.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="text-[12px] ml-1">{supplier.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-[13px] text-muted-foreground">
                        <span>响应：{supplier.responseTime}</span>
                        <span>起订量：{supplier.moq}件</span>
                        <span>价格区间：{supplier.priceRange}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          去1688查看
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={handleAddToPublish}
                        >
                          加入上新
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI建议 */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-[14px] text-green-800">
                  ✅ AI建议：推荐上架，市场需求稳定，利润空间好
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReport(false)}>
                关闭
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleAddToPublish}>
                加入上新队列
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
