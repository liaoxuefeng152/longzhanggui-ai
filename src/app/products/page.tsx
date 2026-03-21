'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Download,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Image,
  FileText,
  TrendingUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  platform: string;
  status: 'draft' | 'pending' | 'active' | 'inactive';
  complianceStatus: 'passed' | 'pending' | 'failed';
  stock: number;
  price: number;
  sales: number;
  createdAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  const [products, setProducts] = useState<Product[]>([
    {
      id: 'PRD001',
      name: '印尼穆斯林头巾-新款印花',
      image: '',
      category: '服装配饰',
      platform: 'TK印尼',
      status: 'active',
      complianceStatus: 'passed',
      stock: 580,
      price: 15.99,
      sales: 1256,
      createdAt: '2024-02-15',
    },
    {
      id: 'PRD002',
      name: '泰国佛教护身符项链',
      image: '',
      category: '珠宝首饰',
      platform: 'TK泰国',
      status: 'active',
      complianceStatus: 'passed',
      stock: 230,
      price: 8.99,
      sales: 892,
      createdAt: '2024-02-12',
    },
    {
      id: 'PRD003',
      name: '越南咖啡滤泡壶套装',
      image: '',
      category: '厨房用品',
      platform: 'TK越南',
      status: 'pending',
      complianceStatus: 'pending',
      stock: 0,
      price: 12.5,
      sales: 0,
      createdAt: '2024-02-18',
    },
    {
      id: 'PRD004',
      name: '美国户外露营帐篷3人',
      image: '',
      category: '户外用品',
      platform: '亚马逊美国',
      status: 'active',
      complianceStatus: 'passed',
      stock: 45,
      price: 89.99,
      sales: 234,
      createdAt: '2024-02-10',
    },
    {
      id: 'PRD005',
      name: '美白面霜套装',
      image: '',
      category: '美妆护肤',
      platform: 'TK印尼',
      status: 'inactive',
      complianceStatus: 'failed',
      stock: 120,
      price: 25.99,
      sales: 56,
      createdAt: '2024-02-08',
    },
    {
      id: 'PRD006',
      name: '智能手表运动版',
      image: '',
      category: '电子产品',
      platform: '亚马逊美国',
      status: 'draft',
      complianceStatus: 'pending',
      stock: 0,
      price: 49.99,
      sales: 0,
      createdAt: '2024-02-20',
    },
  ]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchPlatform = filterPlatform === 'all' || p.platform === filterPlatform;
    return matchSearch && matchStatus && matchPlatform;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      draft: { label: '草稿', className: 'bg-muted text-muted-foreground' },
      pending: { label: '待上架', className: 'bg-warning/10 text-warning' },
      active: { label: '在售', className: 'bg-success text-white' },
      inactive: { label: '已下架', className: 'bg-destructive text-white' },
    };
    const c = config[status];
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getComplianceBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      passed: { label: '合规', className: 'bg-success/10 text-success' },
      pending: { label: '待校验', className: 'bg-muted text-muted-foreground' },
      failed: { label: '不合规', className: 'bg-destructive/10 text-destructive' },
    };
    const c = config[status];
    return <Badge variant="outline" className={`${c.className} border-0 text-[11px]`}>{c.label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-foreground">商品库管理</h1>
            <p className="text-[14px] text-muted-foreground mt-1">
              商品信息 · 合规状态 · 库存管理
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出商品
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加商品
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">商品总数</div>
              <div className="text-[24px] font-semibold text-foreground">512</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">在售商品</div>
              <div className="text-[24px] font-semibold text-success">386</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">待上架</div>
              <div className="text-[24px] font-semibold text-warning">45</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">合规通过</div>
              <div className="text-[24px] font-semibold text-success">498</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="text-[13px] text-muted-foreground mb-1">库存预警</div>
              <div className="text-[24px] font-semibold text-destructive">23</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选区 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索商品名称/ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="商品状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="pending">待上架</SelectItem>
                  <SelectItem value="active">在售</SelectItem>
                  <SelectItem value="inactive">已下架</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部平台</SelectItem>
                  <SelectItem value="TK印尼">TK印尼</SelectItem>
                  <SelectItem value="TK泰国">TK泰国</SelectItem>
                  <SelectItem value="TK越南">TK越南</SelectItem>
                  <SelectItem value="亚马逊美国">亚马逊美国</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterPlatform('all'); }}>
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30">
                  <TableHead className="text-[12px] font-medium text-muted-foreground px-6">商品信息</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">类目</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">平台</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">状态</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">合规</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">库存</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">价格</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground">销量</TableHead>
                  <TableHead className="text-[12px] font-medium text-muted-foreground text-right px-6">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="border-border hover:bg-muted/30">
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-[13px] font-medium text-foreground line-clamp-1">{product.name}</div>
                          <div className="text-[11px] text-muted-foreground">{product.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-muted-foreground">{product.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px]">{product.platform}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>{getComplianceBadge(product.complianceStatus)}</TableCell>
                    <TableCell className="text-[13px] text-foreground">
                      <span className={product.stock < 50 ? 'text-destructive font-medium' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-[13px] text-foreground">${product.price}</TableCell>
                    <TableCell className="text-[13px] text-foreground">{product.sales}</TableCell>
                    <TableCell className="text-right px-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Image className="h-4 w-4 mr-2" />
                            生成图片
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            优化Listing
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            创建广告
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
