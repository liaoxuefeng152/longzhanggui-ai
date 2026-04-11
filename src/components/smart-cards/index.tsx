'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Package,
  DollarSign,
  ShoppingCart,
  ThumbsUp,
  Clock,
  Zap,
  BarChart3,
} from 'lucide-react';

// ========== 卡片类型定义 ==========

// 运营日报卡片
export interface DailyReportCardProps {
  title?: string;
  date: string;
  metrics: Array<{
    label: string;
    value: string;
    trend?: string;
    trendDirection?: 'up' | 'down';
  }>;
  highlights?: Array<{
    type: 'success' | 'warning' | 'danger';
    icon: string;
    text: string;
  }>;
  actions?: Array<{
    text: string;
    onClick?: () => void;
  }>;
}

// 异常预警卡片
export interface AlertCardProps {
  title?: string;
  time?: string;
  items: Array<{
    type: 'danger' | 'warning' | 'info';
    priority?: number;
    text: string;
    actionText?: string;
    onAction?: () => void;
  }>;
  actions?: Array<{
    text: string;
    onClick?: () => void;
  }>;
}

// 决策建议卡片
export interface DecisionCardProps {
  title?: string;
  situation?: string;
  suggestions: Array<{
    action: string;
    reason: string;
    evidence: string;
    confidence: string;
    potentialImpact: string;
    onAccept?: () => void;
    onReject?: () => void;
  }>;
  actions?: Array<{
    text: string;
    onClick?: () => void;
  }>;
}

// 数据对比卡片
export interface ComparisonCardProps {
  title?: string;
  periodA: string;
  periodB: string;
  metrics: Array<{
    label: string;
    valueA: string;
    valueB: string;
    change: string;
  }>;
  insights?: Array<{
    type: 'warning' | 'info' | 'success';
    text: string;
  }>;
  actions?: Array<{
    text: string;
    onClick?: () => void;
  }>;
}

// 选品建议卡片
export interface ProductSelectionCardProps {
  title?: string;
  products: Array<{
    rank: number;
    name: string;
    category: string;
    market: string;
    estimatedSales: string;
    estimatedProfit: string;
    competition: string;
    confidence: string;
    riskFactors?: string[];
    onView?: () => void;
    onCollect?: () => void;
  }>;
  actions?: Array<{
    text: string;
    onClick?: () => void;
  }>;
}

// ========== 卡片组件实现 ==========

// 1. 运营日报卡片
export function DailyReportCard({
  title = '今日运营日报',
  date,
  metrics,
  highlights = [],
  actions = [],
}: DailyReportCardProps) {
  return (
    <Card className="bg-white border-border shadow-sm overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50/50 to-violet-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            {title}
          </CardTitle>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* 指标卡片 */}
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              {metric.trend && metric.trendDirection && (
                <div className="flex items-center gap-1 mt-2">
                  {metric.trendDirection === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'text-xs font-medium',
                      metric.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {metric.trend}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 关注点 */}
        {highlights.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">⚠️ 需要关注</p>
            <div className="space-y-2">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-2 p-3 rounded-lg text-sm',
                    item.type === 'success' && 'bg-green-50/50 border border-green-100',
                    item.type === 'warning' && 'bg-yellow-50/50 border border-yellow-100',
                    item.type === 'danger' && 'bg-red-50/50 border border-red-100'
                  )}
                >
                  <span>{item.icon}</span>
                  <span
                    className={cn(
                      item.type === 'success' && 'text-green-700',
                      item.type === 'warning' && 'text-yellow-700',
                      item.type === 'danger' && 'text-red-700'
                    )}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {actions.length > 0 && (
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            {actions.map((action, index) => (
              <Button key={index} variant="outline" size="sm" onClick={action.onClick}>
                {action.text}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 2. 异常预警卡片
export function AlertCard({
  title = '需要关注的异常',
  time,
  items,
  actions = [],
}: AlertCardProps) {
  const getTypeStyles = (type: 'danger' | 'warning' | 'info') => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50/50',
          border: 'border-red-100',
          icon: '🔴',
          text: 'text-red-700',
          iconBg: 'bg-red-100',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50/50',
          border: 'border-yellow-100',
          icon: '⚠️',
          text: 'text-yellow-700',
          iconBg: 'bg-yellow-100',
        };
      case 'info':
        return {
          bg: 'bg-blue-50/50',
          border: 'border-blue-100',
          icon: 'ℹ️',
          text: 'text-blue-700',
          iconBg: 'bg-blue-100',
        };
    }
  };

  return (
    <Card className="bg-white border-border shadow-sm overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-red-50/50 to-orange-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            {title}
          </CardTitle>
          {time && <span className="text-xs text-muted-foreground">{time}</span>}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {items.map((item, index) => {
          const styles = getTypeStyles(item.type);
          return (
            <div
              key={index}
              className={cn(
                'flex items-start justify-between p-4 rounded-lg border transition-colors hover:shadow-sm',
                styles.bg,
                styles.border
              )}
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', styles.iconBg)}>
                  <span className="text-sm">{styles.icon}</span>
                </div>
                <div className="flex-1">
                  <p className={cn('text-sm font-medium', styles.text)}>{item.text}</p>
                  {item.priority && (
                    <p className="text-xs text-muted-foreground mt-1">优先级: {item.priority}</p>
                  )}
                </div>
              </div>
              {item.actionText && (
                <Button variant="ghost" size="sm" className="text-primary">
                  {item.actionText}
                </Button>
              )}
            </div>
          );
        })}

        {actions.length > 0 && (
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            {actions.map((action, index) => (
              <Button key={index} variant="outline" size="sm" onClick={action.onClick}>
                {action.text}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 3. 决策建议卡片
export function DecisionCard({
  title = '运营建议',
  situation,
  suggestions,
  actions = [],
}: DecisionCardProps) {
  return (
    <Card className="bg-white border-border shadow-sm overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-violet-50/50 to-purple-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-600" />
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {situation && (
          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            {situation}
          </p>
        )}

        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-4 bg-violet-50/30 border border-violet-100 rounded-lg space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-violet-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-violet-700">{suggestion.action}</p>
                <p className="text-xs text-violet-600/80 mt-1">原因：{suggestion.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">证据：{suggestion.evidence}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-violet-100/50">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-xs">
                  置信度: {suggestion.confidence}
                </Badge>
                <Badge variant="outline" className="text-xs text-green-600">
                  预期: {suggestion.potentialImpact}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  查看详情
                </Button>
                <Button size="sm" className="h-7 text-xs bg-violet-600 hover:bg-violet-700">
                  采纳
                </Button>
              </div>
            </div>
          </div>
        ))}

        {actions.length > 0 && (
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            {actions.map((action, index) => (
              <Button key={index} variant="outline" size="sm" onClick={action.onClick}>
                {action.text}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 4. 数据对比卡片
export function ComparisonCard({
  title = '数据对比分析',
  periodA,
  periodB,
  metrics,
  insights = [],
  actions = [],
}: ComparisonCardProps) {
  return (
    <Card className="bg-white border-border shadow-sm overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-green-50/50 to-teal-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-600" />
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* 对比表格 */}
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">指标</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{periodA}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">{periodB}</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">变化</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => {
                const isPositive = metric.change.startsWith('+');
                return (
                  <tr key={index} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{metric.label}</td>
                    <td className="px-4 py-3 text-center">{metric.valueA}</td>
                    <td className="px-4 py-3 text-center">{metric.valueB}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded',
                          isPositive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {metric.change}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分析结论 */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">💡 分析结论</p>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    insight.type === 'warning' && 'bg-yellow-50/50 text-yellow-700 border border-yellow-100',
                    insight.type === 'info' && 'bg-blue-50/50 text-blue-700 border border-blue-100',
                    insight.type === 'success' && 'bg-green-50/50 text-green-700 border border-green-100'
                  )}
                >
                  {insight.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {actions.length > 0 && (
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            {actions.map((action, index) => (
              <Button key={index} variant="outline" size="sm" onClick={action.onClick}>
                {action.text}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 5. 选品建议卡片
export function ProductSelectionCard({
  title = '智能选品建议',
  products,
  actions = [],
}: ProductSelectionCardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  return (
    <Card className="bg-white border-border shadow-sm overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-orange-50/50 to-yellow-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-orange-600" />
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {products.map((product) => (
          <div
            key={product.rank}
            className="p-4 bg-orange-50/30 border border-orange-100 rounded-lg space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-sm">{getRankIcon(product.rank)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-orange-700">{product.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">市场：{product.market}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-2 bg-white/50 rounded">
                <p className="text-xs text-muted-foreground">预估月销量</p>
                <p className="text-sm font-bold text-foreground">{product.estimatedSales}</p>
              </div>
              <div className="text-center p-2 bg-white/50 rounded">
                <p className="text-xs text-muted-foreground">预估利润率</p>
                <p className="text-sm font-bold text-green-600">{product.estimatedProfit}</p>
              </div>
              <div className="text-center p-2 bg-white/50 rounded">
                <p className="text-xs text-muted-foreground">竞争程度</p>
                <p className="text-sm font-bold text-foreground">{product.competition}</p>
              </div>
              <div className="text-center p-2 bg-white/50 rounded">
                <p className="text-xs text-muted-foreground">置信度</p>
                <p className="text-sm font-bold text-violet-600">{product.confidence}</p>
              </div>
            </div>

            {product.riskFactors && product.riskFactors.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-yellow-700">
                  风险提示：{product.riskFactors.join('、')}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-orange-100/50">
              <Button size="sm" variant="outline" className="h-7 text-xs">
                查看详情
              </Button>
              <Button size="sm" className="h-7 text-xs bg-orange-600 hover:bg-orange-700">
                开始采集
              </Button>
            </div>
          </div>
        ))}

        {actions.length > 0 && (
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            {actions.map((action, index) => (
              <Button key={index} variant="outline" size="sm" onClick={action.onClick}>
                {action.text}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ========== 导出所有卡片组件 ==========
export const SmartCards = {
  DailyReport: DailyReportCard,
  Alert: AlertCard,
  Decision: DecisionCard,
  Comparison: ComparisonCard,
  ProductSelection: ProductSelectionCard,
};

export default SmartCards;
