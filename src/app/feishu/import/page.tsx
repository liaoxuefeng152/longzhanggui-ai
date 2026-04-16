'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Database,
  Upload,
  FileSpreadsheet,
  Package,
  ShoppingCart,
  DollarSign,
  History,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Eye,
  Copy,
} from 'lucide-react';

// 导入历史记录
interface ImportHistory {
  id: string;
  time: string;
  type: string;
  filename: string;
  success: number;
  failed: number;
  status: 'completed' | 'failed' | 'processing';
}

// 导入配置
interface ImportConfig {
  type: string;
  conflictHandling: 'overwrite' | 'skip' | 'confirm';
  validateOnly: boolean;
  notifyOnComplete: boolean;
}

export default function DataImportPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // 导入配置
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    type: 'products',
    conflictHandling: 'skip',
    validateOnly: false,
    notifyOnComplete: true,
  });
  
  // 文件状态
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  
  // 预览数据
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  
  // 导入历史
  const [importHistory] = useState<ImportHistory[]>([
    {
      id: 'IMP-20240220-001',
      time: '2024-02-20 14:30:25',
      type: '商品数据',
      filename: 'products_2024.xlsx',
      success: 156,
      failed: 3,
      status: 'completed',
    },
    {
      id: 'IMP-20240219-001',
      time: '2024-02-19 10:15:30',
      type: '订单数据',
      filename: 'orders_feb.xlsx',
      success: 458,
      failed: 12,
      status: 'completed',
    },
    {
      id: 'IMP-20240218-001',
      time: '2024-02-18 16:45:00',
      type: '财务数据',
      filename: 'finance_jan.xlsx',
      success: 234,
      failed: 0,
      status: 'completed',
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

  const handleLogout = () => {
    router.push('/login');
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 校验文件格式
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(extension)) {
      toast.error('只支持 .xlsx、.xls、.csv 格式的文件');
      return;
    }

    // 校验文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小不能超过 10MB');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    // 模拟上传进度
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // 模拟预览数据
    setTimeout(() => {
      setPreviewData([
        { sku: 'SKU-001', name: '商品A', price: 99.00, stock: 100 },
        { sku: 'SKU-002', name: '商品B', price: 149.00, stock: 80 },
        { sku: 'SKU-003', name: '商品C', price: 199.00, stock: 50 },
        { sku: 'SKU-004', name: '商品D', price: 299.00, stock: 30 },
        { sku: 'SKU-005', name: '商品E', price: 399.00, stock: 20 },
      ]);
      setFieldMappings({
        sku: 'internal_sku',
        name: 'name_zh',
        price: 'cost_price',
        stock: 'qty_available',
      });
      toast.success('文件上传成功');
    }, 2500);
  };

  // 执行导入
  const handleImport = async () => {
    if (!uploadedFile) {
      toast.error('请先上传文件');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    // 模拟导入进度
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          toast.success('导入完成！成功 156 条，失败 3 条');
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  // 下载导入模板
  const handleDownloadTemplate = (type: string) => {
    const templates: Record<string, string> = {
      products: '商品导入模板.xlsx',
      orders: '订单导入模板.xlsx',
      finance: '财务导入模板.xlsx',
    };
    
    toast.info(`正在下载 ${templates[type]}...`);
    // 实际应该调用API下载模板
    setTimeout(() => {
      toast.success('模板下载成功');
    }, 1000);
  };

  // 删除历史记录
  const handleDeleteHistory = (id: string) => {
    toast.success('历史记录已删除');
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
              <Database className="h-7 w-7 text-[#00B42A]500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">数据导入管理</h1>
              <p className="text-sm text-muted-foreground">
                Excel/CSV批量导入商品、订单、财务数据
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-green-500/10 to-green-500/5 text-[#00B42A]600 border-green-500/30 px-3 py-1.5">
            支持 xlsx/csv
          </Badge>
        </div>

        {/* 主配置区域 */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 gap-2 p-1 bg-muted/50 rounded-lg h-auto">
            <TabsTrigger value="products" className="flex items-center gap-2 py-2.5">
              <Package className="h-4 w-4" />
              商品导入
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 py-2.5">
              <ShoppingCart className="h-4 w-4" />
              订单导入
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2 py-2.5">
              <DollarSign className="h-4 w-4" />
              财务导入
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 py-2.5">
              <History className="h-4 w-4" />
              导入历史
            </TabsTrigger>
          </TabsList>

          {/* Tab1: 商品数据导入 */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  商品数据导入
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* 导入说明 */}
                <div className="p-4 bg-[#165DFF]50/50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#165DFF]100 flex items-center justify-center shrink-0">
                      <Upload className="h-4 w-4 text-[#165DFF]600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#165DFF]700 mb-1">导入说明</p>
                      <div className="text-xs text-[#165DFF]600/80 space-y-1">
                        <p>• 支持 .xlsx、.xls、.csv 格式文件</p>
                        <p>• 文件大小不能超过 10MB</p>
                        <p>• 请确保表头包含必要字段：SKU、商品名称、成本价、库存数量</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 下载模板 */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">点击下载商品导入模板</p>
                  <Button variant="outline" onClick={() => handleDownloadTemplate('products')}>
                    <Download className="h-4 w-4 mr-2" />
                    下载模板
                  </Button>
                </div>

                {/* 文件上传 */}
                <div className="space-y-2">
                  <Label>上传文件</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                      uploadedFile
                        ? "border-green-500 bg-[#00B42A]50/50"
                        : "border-gray-200 hover:border-primary/50 hover:bg-muted/30"
                    )}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    
                    {isUploading ? (
                      <div className="space-y-3">
                        <RefreshCw className="h-10 w-10 text-primary mx-auto animate-spin" />
                        <p className="text-sm text-muted-foreground">上传中... {uploadProgress}%</p>
                        <Progress value={uploadProgress} className="w-48 mx-auto" />
                      </div>
                    ) : uploadedFile ? (
                      <div className="space-y-3">
                        <CheckCircle className="h-10 w-10 text-[#00B42A]600 mx-auto" />
                        <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            点击或拖拽文件到此处上传
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            支持 .xlsx、.xls、.csv 格式
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 预览数据 */}
                {previewData.length > 0 && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>导入预览（前10行）</Label>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          查看全部
                        </Button>
                      </div>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50">
                            <tr>
                              {Object.keys(previewData[0] || {}).map((key) => (
                                <th key={key} className="px-4 py-2 text-left font-medium text-muted-foreground">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.map((row, index) => (
                              <tr key={index} className="border-t border-border">
                                {Object.values(row).map((value, i) => (
                                  <td key={i} className="px-4 py-2 text-foreground">
                                    {String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 字段映射 */}
                    <div className="space-y-2">
                      <Label>字段映射</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(fieldMappings).map(([source, target]) => (
                          <div key={source} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                            <Badge variant="outline" className="font-mono">
                              {source}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="secondary" className="font-mono">
                              {target}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 导入配置 */}
                    <div className="space-y-4">
                      <Label>导入配置</Label>
                      
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">冲突处理</p>
                          <p className="text-xs text-muted-foreground">当数据重复时的处理方式</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={importConfig.conflictHandling === 'skip' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setImportConfig({ ...importConfig, conflictHandling: 'skip' })}
                          >
                            跳过
                          </Button>
                          <Button
                            variant={importConfig.conflictHandling === 'overwrite' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setImportConfig({ ...importConfig, conflictHandling: 'overwrite' })}
                          >
                            覆盖
                          </Button>
                          <Button
                            variant={importConfig.conflictHandling === 'confirm' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setImportConfig({ ...importConfig, conflictHandling: 'confirm' })}
                          >
                            确认
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">仅验证</p>
                          <p className="text-xs text-muted-foreground">仅检查数据格式，不实际导入</p>
                        </div>
                        <Switch
                          checked={importConfig.validateOnly}
                          onCheckedChange={(checked) => setImportConfig({ ...importConfig, validateOnly: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">完成后通知</p>
                          <p className="text-xs text-muted-foreground">导入完成后发送飞书通知</p>
                        </div>
                        <Switch
                          checked={importConfig.notifyOnComplete}
                          onCheckedChange={(checked) => setImportConfig({ ...importConfig, notifyOnComplete: checked })}
                        />
                      </div>
                    </div>

                    {/* 导入进度 */}
                    {isImporting && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">导入进度</span>
                          <span className="text-sm text-muted-foreground">{importProgress}%</span>
                        </div>
                        <Progress value={importProgress} className="h-2" />
                      </div>
                    )}

                    {/* 执行导入 */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadedFile(null);
                          setPreviewData([]);
                          setFieldMappings({});
                        }}
                        disabled={isImporting}
                      >
                        取消
                      </Button>
                      <Button onClick={handleImport} disabled={isImporting}>
                        {isImporting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            导入中...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            开始导入
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab2: 订单数据导入 */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  订单数据导入
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* 导入说明 */}
                <div className="p-4 bg-[#165DFF]50/50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#165DFF]100 flex items-center justify-center shrink-0">
                      <Upload className="h-4 w-4 text-[#165DFF]600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#165DFF]700 mb-1">导入说明</p>
                      <div className="text-xs text-[#165DFF]600/80 space-y-1">
                        <p>• 支持批量导入历史订单数据</p>
                        <p>• 必要字段：订单号、商品SKU、数量、售价、订单状态</p>
                        <p>• 可选字段：买家信息、物流信息、付款时间</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 下载模板 */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">点击下载订单导入模板</p>
                  <Button variant="outline" onClick={() => handleDownloadTemplate('orders')}>
                    <Download className="h-4 w-4 mr-2" />
                    下载模板
                  </Button>
                </div>

                {/* 文件上传 - 与商品导入相同 */}
                <div className="space-y-2">
                  <Label>上传文件</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                      uploadedFile
                        ? "border-green-500 bg-[#00B42A]50/50"
                        : "border-gray-200 hover:border-primary/50 hover:bg-muted/30"
                    )}
                    onClick={() => document.getElementById('orders-file-upload')?.click()}
                  >
                    <input
                      id="orders-file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-foreground mt-3">
                      点击或拖拽文件到此处上传
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持 .xlsx、.xls、.csv 格式
                    </p>
                  </div>
                </div>

                {/* 其他内容与商品导入相同 */}
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>订单导入功能开发中...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab3: 财务数据导入 */}
          <TabsContent value="finance" className="space-y-6">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  财务数据导入
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* 导入说明 */}
                <div className="p-4 bg-[#165DFF]50/50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#165DFF]100 flex items-center justify-center shrink-0">
                      <Upload className="h-4 w-4 text-[#165DFF]600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#165DFF]700 mb-1">导入说明</p>
                      <div className="text-xs text-[#165DFF]600/80 space-y-1">
                        <p>• 支持导入第三方财务数据</p>
                        <p>• 必要字段：日期、类型（收入/支出）、金额、备注</p>
                        <p>• 可选字段：关联订单、关联商品、关联供应商</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 下载模板 */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">点击下载财务导入模板</p>
                  <Button variant="outline" onClick={() => handleDownloadTemplate('finance')}>
                    <Download className="h-4 w-4 mr-2" />
                    下载模板
                  </Button>
                </div>

                {/* 文件上传 */}
                <div className="space-y-2">
                  <Label>上传文件</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                      uploadedFile
                        ? "border-green-500 bg-[#00B42A]50/50"
                        : "border-gray-200 hover:border-primary/50 hover:bg-muted/30"
                    )}
                    onClick={() => document.getElementById('finance-file-upload')?.click()}
                  >
                    <input
                      id="finance-file-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-foreground mt-3">
                      点击或拖拽文件到此处上传
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持 .xlsx、.xls、.csv 格式
                    </p>
                  </div>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>财务导入功能开发中...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab4: 导入历史 */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="px-6 py-4 border-b border-border">
                <CardTitle className="text-[15px] font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  导入历史
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {importHistory.length > 0 ? (
                  <div className="space-y-4">
                    {importHistory.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            record.type === '商品数据' ? "bg-[#FF7D00]100" :
                            record.type === '订单数据' ? "bg-[#165DFF]100" :
                            "bg-[#00B42A]100"
                          )}>
                            {record.type === '商品数据' && <Package className="h-5 w-5 text-[#FF7D00]600" />}
                            {record.type === '订单数据' && <ShoppingCart className="h-5 w-5 text-[#165DFF]600" />}
                            {record.type === '财务数据' && <DollarSign className="h-5 w-5 text-[#00B42A]600" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{record.type}</p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  record.status === 'completed' && "text-[#00B42A]600 border-green-600",
                                  record.status === 'failed' && "text-[#F53F3F]600 border-red-600",
                                  record.status === 'processing' && "text-[#165DFF]600 border-blue-600"
                                )}
                              >
                                {record.status === 'completed' && '已完成'}
                                {record.status === 'failed' && '失败'}
                                {record.status === 'processing' && '处理中'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {record.filename} · {record.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm">
                              <span className="text-[#00B42A]600 font-medium">{record.success}</span>
                              <span className="text-muted-foreground"> 成功</span>
                            </p>
                            {record.failed > 0 && (
                              <p className="text-xs text-[#F53F3F]600">
                                {record.failed} 失败
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteHistory(record.id)}
                            >
                              <Trash2 className="h-4 w-4 text-[#F53F3F]600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>暂无导入记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
