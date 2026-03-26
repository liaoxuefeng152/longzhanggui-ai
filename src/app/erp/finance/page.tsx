'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DollarSign,
  Search,
  Filter,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  FileText,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

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
  record_type: string;
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
  const [typeFilter, setTypeFilter] = useState('');

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
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (dateRange.start) params.set('start_date', dateRange.start);
      if (dateRange.end) params.set('end_date', dateRange.end);
      if (typeFilter) params.set('record_type', typeFilter);
      
      const [summaryRes, recordsRes] = await Promise.all([
        fetch(`/api/v1/erp/finance/summary?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/v1/erp/finance/records?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
      ]);
      
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummaries(data.items || []);
      }
      if (recordsRes.ok) {
        const data = await recordsRes.json();
        setRecords(data.items || []);
      }
    } catch (error) {
      console.error('获取财务数据失败:', error);
      toast.error('获取财务数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, { label: string; className: string }> = {
      income: { label: '收入', className: 'bg-success/10 text-success' },
      expense: { label: '支出', className: 'bg-destructive/10 text-destructive' },
      refund: { label: '退款', className: 'bg-warning/10 text-warning' },
      adjustment: { label: '调整', className: 'bg-purple-500/10 text-purple-500' },
    };
    const { label, className } = config[type] || { label: type, className: 'bg-muted text-muted-foreground' };
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  // 统计数据
  const totalSales = summaries.reduce((sum, s) => sum + s.total_sales, 0);
  const totalCost = summaries.reduce((sum, s) => sum + s.total_cost, 0);
  const totalProfit = summaries.reduce((sum, s) => sum + s.gross_profit, 0);
  const avgProfitRate = summaries.length > 0 
    ? (summaries.reduce((sum, s) => sum + s.profit_rate, 0) / summaries.length) 
    : 0;
  const totalOrders = summaries.reduce((sum, s) => sum + s.order_count, 0);

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">ERP财务管理</h1>
              <p className="text-[14px] text-muted-foreground">收支统计 · 利润分析 · 成本核算 · 财务报表</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={async () => {
              try {
                const params = new URLSearchParams();
                params.set('type', 'summary');
                if (dateRange.start) params.set('start_date', dateRange.start);
                if (dateRange.end) params.set('end_date', dateRange.end);
                
                const response = await fetch(`/api/v1/erp/finance/export?${params.toString()}`);
                if (!response.ok) throw new Error('导出失败');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `财务汇总报表_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success('财务汇总报表导出成功');
              } catch (error) {
                toast.error('导出失败，请重试');
              }
            }}>
              <FileText className="h-4 w-4 mr-2" />
              导出报表
            </Button>
            <Button variant="outline" onClick={async () => {
              try {
                const params = new URLSearchParams();
                params.set('type', 'detail');
                if (dateRange.start) params.set('start_date', dateRange.start);
                if (dateRange.end) params.set('end_date', dateRange.end);
                if (typeFilter) params.set('record_type', typeFilter);
                
                const response = await fetch(`/api/v1/erp/finance/export?${params.toString()}`);
                if (!response.ok) throw new Error('导出失败');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `财务明细报表_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success('财务明细报表导出成功');
              } catch (error) {
                toast.error('导出失败，请重试');
              }
            }}>
              <Download className="h-4 w-4 mr-2" />
              导出明细
            </Button>
          </div>
        </div>

        {/* 核心能力标签 */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Calculator className="h-3 w-3 mr-1" />
            成本核算
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <PieChart className="h-3 w-3 mr-1" />
            利润分析
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <LineChart className="h-3 w-3 mr-1" />
            趋势分析
          </Badge>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Wallet className="h-3 w-3 mr-1" />
            资金流水
          </Badge>
        </div>

        {/* 核心指标 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-muted-foreground">总销售额</span>
                <ArrowUpRight className="h-4 w-4 text-success" />
              </div>
              <div className="text-[24px] font-semibold text-foreground">${totalSales.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{totalOrders} 笔订单</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-muted-foreground">总成本</span>
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              </div>
              <div className="text-[24px] font-semibold text-destructive">${totalCost.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">采购+物流+费用</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-muted-foreground">毛利润</span>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div className="text-[24px] font-semibold text-success">${totalProfit.toFixed(2)}</div>
              <div className="text-[11px] text-muted-foreground mt-1">销售额 - 总成本</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-muted-foreground">平均利润率</span>
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <div className="text-[24px] font-semibold text-foreground">{(avgProfitRate * 100).toFixed(1)}%</div>
              <div className="text-[11px] text-muted-foreground mt-1">毛利/销售额</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-muted-foreground">退款金额</span>
                <TrendingDown className="h-4 w-4 text-warning" />
              </div>
              <div className="text-[24px] font-semibold text-warning">
                ${summaries.reduce((sum, s) => sum + s.refund_amount, 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">累计退款</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选条件 */}
        <Card className="bg-white border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-muted-foreground">日期范围:</span>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-40"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-40"
                />
              </div>
              <select 
                className="px-4 py-2 border border-border rounded-md text-[14px]"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">全部类型</option>
                <option value="income">收入</option>
                <option value="expense">支出</option>
                <option value="refund">退款</option>
                <option value="adjustment">调整</option>
              </select>
              <Button variant="outline" onClick={fetchData}>
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* 每日汇总 */}
          <Card className="bg-white border-border shadow-sm col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px]">每日财务汇总</CardTitle>
              <CardDescription>按日期统计销售额、成本、利润</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : summaries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无财务数据</div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-6 text-[12px] text-muted-foreground border-b pb-2">
                    <div>日期</div>
                    <div>销售额</div>
                    <div>成本</div>
                    <div>广告费</div>
                    <div>毛利润</div>
                    <div>利润率</div>
                  </div>
                  {summaries.slice(0, 10).map((summary) => (
                    <div key={summary.id} className="grid grid-cols-6 text-[13px] py-2 border-b border-border/50">
                      <div className="font-mono">{summary.date}</div>
                      <div className="text-success">${summary.total_sales.toFixed(2)}</div>
                      <div className="text-destructive">${summary.total_cost.toFixed(2)}</div>
                      <div className="text-warning">${summary.ad_cost.toFixed(2)}</div>
                      <div className={summary.gross_profit > 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                        ${summary.gross_profit.toFixed(2)}
                      </div>
                      <div>
                        <span className={summary.profit_rate > 0.2 ? 'text-success' : summary.profit_rate > 0.1 ? 'text-warning' : 'text-destructive'}>
                          {(summary.profit_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 财务明细 */}
          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px]">财务明细</CardTitle>
              <CardDescription>最近收支记录</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">加载中...</div>
              ) : records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暂无记录</div>
              ) : (
                <div className="space-y-3">
                  {records.slice(0, 8).map((record) => (
                    <div key={record.id} className="flex items-center justify-between py-2 border-b border-border/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(record.record_type)}
                          <span className="text-[12px] text-muted-foreground">{record.category}</span>
                        </div>
                        {record.description && (
                          <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                            {record.description}
                          </div>
                        )}
                      </div>
                      <div className={`text-[14px] font-medium ${record.record_type === 'income' ? 'text-success' : 'text-destructive'}`}>
                        {record.record_type === 'income' ? '+' : '-'}${record.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
