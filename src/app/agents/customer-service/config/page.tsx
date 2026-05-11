'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Headphones,
  MessageSquare,
  Shield,
  FileText,
  Save,
  RefreshCw,
  CheckCircle2,
  Power,
  Settings,
} from 'lucide-react';

export default function CustomerServiceAgentConfigPage() {
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    name: 'AI客服SKILL',
    enabled: true,
    model: 'doubao-mini',
  });

  const [replyConfig, setReplyConfig] = useState({
    responseTone: 'friendly',
    autoReply: true,
    replyDelay: 5,
    maxResponseLength: 500,
    includeEmoji: true,
  });

  const [knowledgeConfig, setKnowledgeConfig] = useState({
    useKnowledgeBase: true,
    fallbackToAI: true,
    confidenceThreshold: 0.7,
    allowManualOverride: true,
  });

  const [riskConfig, setRiskConfig] = useState({
    sensitiveWordsCheck: true,
    requireHumanReview: false,
    allowRefund: true,
    autoRefundThreshold: 50,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('配置已保存');
    } catch {
      toast.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">AI客服SKILL配置</h1>
              <p className="text-sm text-muted-foreground">配置客服回复和纠纷处理的规则</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={config.enabled ? 'default' : 'secondary'} className="px-3 py-1">
              {config.enabled ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  已启用
                </>
              ) : (
                '已禁用'
              )}
            </Badge>
            <Button
              variant={config.enabled ? 'outline' : 'default'}
              size="sm"
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            >
              <Power className="h-4 w-4 mr-1" />
              {config.enabled ? '禁用' : '启用'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* 基本信息 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKILL名称</Label>
                    <Input value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>绑定模型</Label>
                    <Select value={config.model} onValueChange={(v) => setConfig({ ...config, model: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doubao-mini">豆包Mini (推荐)</SelectItem>
                        <SelectItem value="doubao-pro-4-250115">豆包Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 回复配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  回复配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>回复语气</Label>
                    <Select
                      value={replyConfig.responseTone}
                      onValueChange={(v) => setReplyConfig({ ...replyConfig, responseTone: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">友好亲切</SelectItem>
                        <SelectItem value="professional">专业正式</SelectItem>
                        <SelectItem value="casual">轻松随意</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>回复延迟 (秒)</Label>
                    <Input
                      type="number"
                      value={replyConfig.replyDelay}
                      onChange={(e) => setReplyConfig({ ...replyConfig, replyDelay: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最大回复长度</Label>
                    <Input
                      type="number"
                      value={replyConfig.maxResponseLength}
                      onChange={(e) => setReplyConfig({ ...replyConfig, maxResponseLength: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">自动回复</p>
                    <p className="text-xs text-muted-foreground">有新消息时自动回复</p>
                  </div>
                  <Switch
                    checked={replyConfig.autoReply}
                    onCheckedChange={(checked) => setReplyConfig({ ...replyConfig, autoReply: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">使用表情</p>
                    <p className="text-xs text-muted-foreground">在回复中添加表情</p>
                  </div>
                  <Switch
                    checked={replyConfig.includeEmoji}
                    onCheckedChange={(checked) => setReplyConfig({ ...replyConfig, includeEmoji: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 知识库配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  知识库配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>置信度阈值</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={knowledgeConfig.confidenceThreshold}
                    onChange={(e) => setKnowledgeConfig({ ...knowledgeConfig, confidenceThreshold: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">使用知识库</p>
                    <p className="text-xs text-muted-foreground">优先从知识库检索</p>
                  </div>
                  <Switch
                    checked={knowledgeConfig.useKnowledgeBase}
                    onCheckedChange={(checked) => setKnowledgeConfig({ ...knowledgeConfig, useKnowledgeBase: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">允许人工干预</p>
                    <p className="text-xs text-muted-foreground">客服可手动修改AI回复</p>
                  </div>
                  <Switch
                    checked={knowledgeConfig.allowManualOverride}
                    onCheckedChange={(checked) => setKnowledgeConfig({ ...knowledgeConfig, allowManualOverride: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 风控配置 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  风控配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>自动退款上限 ($)</Label>
                  <Input
                    type="number"
                    value={riskConfig.autoRefundThreshold}
                    onChange={(e) => setRiskConfig({ ...riskConfig, autoRefundThreshold: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">敏感词检测</p>
                    <p className="text-xs text-muted-foreground">检测并过滤敏感词</p>
                  </div>
                  <Switch
                    checked={riskConfig.sensitiveWordsCheck}
                    onCheckedChange={(checked) => setRiskConfig({ ...riskConfig, sensitiveWordsCheck: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">需要人工审核</p>
                    <p className="text-xs text-muted-foreground">高风险回复需人工确认</p>
                  </div>
                  <Switch
                    checked={riskConfig.requireHumanReview}
                    onCheckedChange={(checked) => setRiskConfig({ ...riskConfig, requireHumanReview: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">允许自动退款</p>
                    <p className="text-xs text-muted-foreground">AI可自动处理小额退款</p>
                  </div>
                  <Switch
                    checked={riskConfig.allowRefund}
                    onCheckedChange={(checked) => setRiskConfig({ ...riskConfig, allowRefund: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">运行状态</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">SKILL状态</span>
                  <Badge variant={config.enabled ? 'default' : 'secondary'}>
                    {config.enabled ? '运行中' : '已停止'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存配置
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
