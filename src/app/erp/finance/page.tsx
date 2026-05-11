'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  FileText,
  Wallet,
  RefreshCw,
  Loader2,
  CreditCard,
  Receipt,
  Banknote,
  Truck,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuthHeaders } from '@/lib/hooks/useAuthFetch';

interface DailySummary {
  id: string;
  date: string;
  total_sales: number;
  total_cost: number;
  shipping_fee: number;
  platform_fee: number;
  ad_cost: number;
  other_cost: number;
  gross_profit: number;
  profit_rate: number;
  order_count: number;
  refund_amount: number;
}

interface FinancialRecord {
  id: string;
  record_date: string;
  record_type: 'income' | 'expense' | 'refund' | 'fee';
  category: string;
  amount: number;
  currency: string;
  description?: string;
  platform?: string;
  source?: string;
  created_at: string;
}

export default function ERPFinancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [keyword, setKeyword] = useState('');
  
  // 对话框状态
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FinancialRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 导入相关状态
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      
      // 并行获取汇总和记录
      const [summaryRes, recordsRes] = await Promise.all([
        fetch('/api/v1/erp/finance/summary', { headers }),
        fetch('/api/v1/erp/finance/records', { headers }),
      ]);
      
      const summaryData = await summaryRes.json();
      const recordsData = await recordsRes.json();
      
      // 兼容两种返回格式
      if (summaryData.daily_summaries !== undefined) {
        setSummaries(summaryData.daily_summaries || []);
      } else if (summaryData.success && summaryData.data) {
        setSummaries(summaryData.data.summaries || []);
      }
      
      if (recordsData.items !== undefined) {
        setRecords(recordsData.items || []);
      } else if (recordsData.success && recordsData.data) {
        setRecords(recordsData.data.records || []);
      }
    } catch (error) {
      console.error('获取财务数据失败:', error);
      toast.error('获取财务数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出财务报表
  const handleExportReport = async () => {
    setIsProcessing(true);
    try {
      const headers = ['日期', '销售额', '成本', '运费', '平台费', '广告费', '其他费用', '毛利润', '利润率', '订单数'];
      const rows = summaries.map(s => [
        s.date,
        s.total_sales.toFixed(2),
        s.total_cost.toFixed(2),
        s.shipping_fee.toFixed(2),
        s.platform_fee.toFixed(2),
        s.ad_cost.toFixed(2),
        s.other_cost.toFixed(2),
        s.gross_profit.toFixed(2),
        `${s.profit_rate.toFixed(1)}%`,
        s.order_count,
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    } finally {
      setIsProcessing(false);
    }
  };

  // 查看详情
  const handleViewRecord = (record: FinancialRecord) => {
    setSelectedRecord(record);
    setIsDetailOpen(true);
  };

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    setImportFile(file);
    
    // 读取文件进行预览
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast.warning('文件数据为空或格式不正确');
          return;
        }
        
        // 解析CSV/表格数据
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const previewData: any[] = [];
        
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};
          
          headers.forEach((h, idx) => {
            // 智能匹配列名
            if (h.includes('日期') || h.includes('date') || h.includes('time')) {
              row.record_date = values[idx];
            } else if (h.includes('类型') || h.includes('type')) {
              const typeVal = values[idx].toLowerCase();
              if (typeVal.includes('收入') || typeVal.includes('income') || typeVal.includes('收入') || typeVal.includes('+')) {
                row.record_type = 'income';
              } else if (typeVal.includes('支出') || typeVal.includes('expense') || typeVal.includes('成本')) {
                row.record_type = 'expense';
              } else if (typeVal.includes('退款') || typeVal.includes('refund')) {
                row.record_type = 'refund';
              } else {
                row.record_type = 'fee';
              }
            } else if (h.includes('类别') || h.includes('category') || h.includes('项目')) {
              row.category = values[idx];
            } else if (h.includes('金额') || h.includes('amount') || h.includes('money') || h.includes('金额')) {
              row.amount = parseFloat(values[idx].replace(/[^0-9.-]/g, '')) || 0;
            } else if (h.includes('描述') || h.includes('description') || h.includes('备注')) {
              row.description = values[idx];
            } else if (h.includes('平台') || h.includes('platform')) {
              row.platform = values[idx];
            }
          });
          
          // 默认值
          if (!row.record_date) row.record_date = new Date().toISOString().split('T')[0];
          if (!row.category) row.category = '其他';
          if (!row.amount) row.amount = 0;
          if (!row.record_type) row.record_type = 'income';
          
          previewData.push(row);
        }
        
        setImportPreview(previewData);
        toast.success(`已读取 ${lines.length - 1} 条记录`);
      } catch (error) {
        toast.error('文件解析失败');
      }
    };
    reader.readAsText(file);
  };

  // 执行导入
  const handleImport = async () => {
    if (!importFile) return;
    
    setIsImporting(true);
    try {
      // 读取完整文件
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('文件数据为空');
        return;
      }
      
      // 解析所有数据
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const recordsData: any[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((h, idx) => {
          if (h.includes('日期') || h.includes('date') || h.includes('time')) {
            row.record_date = values[idx];
          } else if (h.includes('类型') || h.includes('type')) {
            const typeVal = values[idx].toLowerCase();
            if (typeVal.includes('收入') || typeVal.includes('income') || typeVal.includes('+')) {
              row.record_type = 'income';
            } else if (typeVal.includes('支出') || typeVal.includes('expense') || typeVal.includes('成本')) {
              row.record_type = 'expense';
            } else if (typeVal.includes('退款') || typeVal.includes('refund')) {
              row.record_type = 'refund';
            } else {
              row.record_type = 'fee';
            }
          } else if (h.includes('类别') || h.includes('category') || h.includes('项目')) {
            row.category = values[idx];
          } else if (h.includes('金额') || h.includes('amount') || h.includes('money')) {
            row.amount = parseFloat(values[idx].replace(/[^0-9.-]/g, '')) || 0;
          } else if (h.includes('描述') || h.includes('description') || h.includes('备注')) {
            row.description = values[idx];
          } else if (h.includes('平台') || h.includes('platform')) {
            row.platform = values[idx];
          } else if (h.includes('来源') || h.includes('source')) {
            row.source = values[idx];
          }
        });
        
        if (row.amount !== undefined) {
          if (!row.record_date) row.record_date = new Date().toISOString().split('T')[0];
          if (!row.category) row.category = '其他';
          if (!row.record_type) row.record_type = 'income';
          if (!row.currency) row.currency = 'USD';
          
          recordsData.push(row);
        }
      }
      
      // 逐条导入
      let successCount = 0;
      for (const recordData of recordsData) {
        const response = await fetch('/api/v1/erp/finance/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recordData),
        });
        
        if (response.ok) {
          successCount++;
        }
      }
      
      toast.success(`成功导入 ${successCount} 条记录`);
      setIsImportOpen(false);
      setImportFile(null);
      setImportPreview([]);
      fetchData();
    } catch (error) {
      toast.error('导入失败，请检查文件格式');
    } finally {
      setIsImporting(false);
    }
  };

  // 计算汇总数据
  const totalSales = summaries.reduce((sum, s) => sum + s.total_sales, 0);
  const totalCost = summaries.reduce((sum, s) => sum + s.total_cost, 0);
  const totalAdCost = summaries.reduce((sum, s) => sum + s.ad_cost, 0);
  const totalPlatformFee = summaries.reduce((sum, s) => sum + s.platform_fee, 0);
  const totalShipping = summaries.reduce((sum, s) => sum + s.shipping_fee, 0);
  const totalProfit = summaries.reduce((sum, s) => sum + s.gross_profit, 0);
  const avgProfitRate = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;
  const totalOrders = summaries.reduce((sum, s) => sum + s.order_count, 0);
  const totalRefund = summaries.reduce((sum, s) => sum + s.refund_amount, 0);

  const getRecordTypeBadge = (type: string) => {
    const config: Record<string, { label: string; className: string }> = {
      income: { label: '收入', className: 'bg-success/10 text-success' },
      expense: { label: '支出', className: 'bg-destructive/10 text-destructive' },
      refund: { label: '退款', className: 'bg-warning/10 text-warning' },
      fee: { label: '费用', className: 'bg-muted text-muted-foreground' },
    };
    const { label, className } = config[type] || config.fee;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/5 flex items-center justify-center">
              <DollarSign className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <h1 className="text-[24px] font-semibold text-foreground">ERP财务管理</h1>
              <p className="text-[14px] text-muted-foreground">利润核算 · 成本分析 · 财务报表 · 资金流水</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExportReport} disabled={isProcessing}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              导出报表
            </Button>
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              导入财务数据
            </Button>
          </div>
        </div>

        {/* 核心财务指标 - 工作台风格 */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">总销售额</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${totalSales.toFixed(2)}</p>
                  <p className="text-[11px] text-green-600">本期累计</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">总成本</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">${totalCost.toFixed(2)}</p>
                  <p className="text-[11px] text-muted-foreground">商品成本</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">毛利润</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">${totalProfit.toFixed(2)}</p>
                  <p className="text-[11px] text-emerald-600">利润率 {avgProfitRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">广告花费</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">${totalAdCost.toFixed(2)}</p>
                  <p className="text-[11px] text-muted-foreground">占比 {totalSales > 0 ? (totalAdCost / totalSales * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[12px] text-muted-foreground">订单数</p>
                  <p className="text-[26px] font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{totalOrders}</p>
                  <p className="text-[11px] text-muted-foreground">退款 ${totalRefund.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 费用明细卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">运费</div>
                  <div className="text-[18px] font-semibold">${totalShipping.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">平台费用</div>
                  <div className="text-[18px] font-semibold">${totalPlatformFee.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">广告费用</div>
                  <div className="text-[18px] font-semibold">${totalAdCost.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">退款金额</div>
                  <div className="text-[18px] font-semibold text-destructive">${totalRefund.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 利润构成 */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-[15px]">利润构成</CardTitle>
              <CardDescription>销售额 - 各项成本 = 毛利润</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                  <span className="text-[13px] text-muted-foreground">销售额</span>
                  <span className="text-[16px] font-semibold text-success">${totalSales.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-[13px] text-muted-foreground">商品成本</span>
                  <span className="text-[16px] font-semibold">-${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-[13px] text-muted-foreground">运费</span>
                  <span className="text-[16px] font-semibold">-${totalShipping.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-[13px] text-muted-foreground">平台费</span>
                  <span className="text-[16px] font-semibold">-${totalPlatformFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-[13px] text-muted-foreground">广告费</span>
                  <span className="text-[16px] font-semibold">-${totalAdCost.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-[13px] font-medium">毛利润</span>
                  <span className="text-[20px] font-bold text-success">${totalProfit.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-[15px]">每日汇总</CardTitle>
              <CardDescription>按日期查看财务数据</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : summaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无数据</div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {summaries.map((summary) => (
                    <div key={summary.id} className="p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] font-medium">{summary.date}</span>
                        <span className="text-[12px] text-muted-foreground">{summary.order_count} 单</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-[12px]">
                          <span>销售: <span className="text-success font-medium">${summary.total_sales.toFixed(2)}</span></span>
                          <span>成本: <span className="text-foreground">${summary.total_cost.toFixed(2)}</span></span>
                        </div>
                        <div className="text-right">
                          <div className="text-[14px] font-semibold text-success">${summary.gross_profit.toFixed(2)}</div>
                          <div className="text-[11px] text-muted-foreground">{summary.profit_rate.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 财务流水记录 */}
        <Card className="bg-white border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[15px]">财务流水</CardTitle>
                <CardDescription>收支明细记录</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-10 w-48"
                  />
                </div>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-36"
                />
                <span className="text-muted-foreground">至</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-36"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无流水记录</div>
            ) : (
              <div className="space-y-2">
                {records.slice(0, 10).map((record) => (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleViewRecord(record)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        record.record_type === 'income' ? 'bg-success/10' :
                        record.record_type === 'expense' ? 'bg-destructive/10' :
                        record.record_type === 'refund' ? 'bg-warning/10' : 'bg-muted'
                      }`}>
                        {record.record_type === 'income' ? (
                          <ArrowUpRight className="h-5 w-5 text-success" />
                        ) : record.record_type === 'expense' ? (
                          <ArrowDownRight className="h-5 w-5 text-destructive" />
                        ) : record.record_type === 'refund' ? (
                          <RefreshCw className="h-5 w-5 text-warning" />
                        ) : (
                          <Receipt className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium">{record.category}</div>
                        <div className="text-[12px] text-muted-foreground">
                          {record.description || '无描述'} {record.platform && `· ${record.platform}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getRecordTypeBadge(record.record_type)}
                      <div className="text-right">
                        <div className={`text-[16px] font-semibold ${
                          record.record_type === 'income' ? 'text-success' : 
                          record.record_type === 'expense' || record.record_type === 'refund' ? 'text-destructive' : 'text-foreground'
                        }`}>
                          {record.record_type === 'income' ? '+' : '-'}${record.amount.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{record.record_date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 记录详情对话框 */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>流水详情</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">类型</div>
                    <div>{getRecordTypeBadge(selectedRecord.record_type)}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">金额</div>
                    <div className={`text-[18px] font-semibold ${
                      selectedRecord.record_type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {selectedRecord.record_type === 'income' ? '+' : '-'}${selectedRecord.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">类别</div>
                  <div className="text-[14px] font-medium">{selectedRecord.category}</div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">描述</div>
                  <div className="text-[14px]">{selectedRecord.description || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[12px] text-muted-foreground">平台</div>
                    <div className="text-[14px]">{selectedRecord.platform || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground">来源</div>
                    <div className="text-[14px]">{selectedRecord.source || '-'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-muted-foreground">时间</div>
                  <div className="text-[14px]">{selectedRecord.record_date} {selectedRecord.created_at}</div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 导入财务数据对话框 */}
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>导入财务数据</DialogTitle>
              <DialogDescription>
                支持导入第三方财务数据，支持 Excel (.xlsx, .xls) 和 CSV 格式
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* 文件上传区域 */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  importFile ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
                    handleFileSelect(file);
                  }
                }}
              >
                <input
                  type="file"
                  id="finance-file-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                <label htmlFor="finance-file-upload" className="cursor-pointer">
                  {importFile ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
                      <div className="text-[14px] font-medium">{importFile.name}</div>
                      <div className="text-[12px] text-muted-foreground">
                        {(importFile.size / 1024).toFixed(1)} KB
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setImportFile(null);
                        setImportPreview([]);
                      }}>
                        重新选择
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div className="text-[14px] text-muted-foreground">
                        拖拽文件到此处，或<span className="text-primary">点击选择文件</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        支持 .xlsx, .xls, .csv 格式，单文件不超过 10MB
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* 导入预览 */}
              {importPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[13px] font-medium">数据预览（前5条）</div>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-[12px]">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">日期</th>
                          <th className="px-3 py-2 text-left font-medium">类型</th>
                          <th className="px-3 py-2 text-left font-medium">类别</th>
                          <th className="px-3 py-2 text-left font-medium">金额</th>
                          <th className="px-3 py-2 text-left font-medium">描述</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {importPreview.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2">{row.record_date || '-'}</td>
                            <td className="px-3 py-2">
                              <Badge variant="outline" className="text-[10px]">
                                {row.record_type === 'income' ? '收入' : row.record_type === 'expense' ? '支出' : row.record_type || '未知'}
                              </Badge>
                            </td>
                            <td className="px-3 py-2">{row.category || '-'}</td>
                            <td className="px-3 py-2">${(row.amount || 0).toFixed(2)}</td>
                            <td className="px-3 py-2 truncate max-w-[150px]">{row.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    共 {importPreview.length} 条记录待导入
                  </div>
                </div>
              )}

              {/* 导入说明 */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="text-[12px] font-medium text-muted-foreground mb-2">导入说明</div>
                <div className="text-[12px] text-muted-foreground">• 支持的列：日期、类型（收入/支出）、类别、金额、描述、平台等</div>
                <div className="text-[12px] text-muted-foreground">• 系统会自动识别列名，无需手动匹配</div>
                <div className="text-[12px] text-muted-foreground">• 类型列支持：收入、支出、退款、费用</div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsImportOpen(false);
                setImportFile(null);
                setImportPreview([]);
              }}>
                取消
              </Button>
              <Button onClick={handleImport} disabled={!importFile || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    开始导入
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
