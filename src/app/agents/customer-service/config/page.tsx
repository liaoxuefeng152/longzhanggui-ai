'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Headphones, 
  MessageSquare, 
  Shield, 
  FileText, 
  Save, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export default function CustomerServiceAgentConfigPage() {
  const [loading, setLoading] = useState(false);
  
  // 基本信息配置
  const [config, setConfig] = useState({
    name: 'AI客服智能体',
    enabled: true,
    model: 'doubao-mini',
  });

  // 回复配置
  const [replyConfig, setReplyConfig] = useState({
    responseTone: 'friendly',
    autoReply: true,
    replyDelay: 5,
    maxResponseLength: 500,
    includeEmoji: true,
    multiLanguage: true,
    defaultLanguage: 'zh',
  });

  // 知识库配置
  const [knowledgeConfig, setKnowledgeConfig] = useState({
    useKnowledgeBase: true,
    fallbackToAI: true,
    maxKnowledgeResults: 5,
    confidenceThreshold: 0.7,
    allowManualOverride: true,
  });

  // 工单配置
  const [ticketConfig, setTicketConfig] = useState({
    autoCreateTicket: false,
    escalationKeywords: '退款,投诉,骗子,差评,退货,假货',
    urgentKeywords: '着火,爆炸,过敏,危险,投诉',
    autoPriority: true,
    notifyOnEscalation: true,
  });

  // 风控配置
  const [riskConfig, setRiskConfig] = useState({
    sensitiveWordsCheck: true,
    blockSensitiveWords: false,
    requireHumanReview: false,
    reviewThreshold: 0.5,
    autoRefundThreshold: 50,
    allowRefund: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('AI客服智能体配置已保存');
    } catch {
      toast.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="h-6 w-6" />
            AI客服智能体配置
          </h1>
          <p className="text-muted-foreground mt-1">
            配置客服回复、纠纷处理和工单管理的默认参数
          </p>
        </div>
        <Badge variant={config.enabled ? 'default' : 'secondary'} className="px-3 py-1">
          {config.enabled ? (
            <>
              <CheckCircle2 className="h-3 w-3 mr-1" />
              已启用
            </>
          ) : '已禁用'}
        </Badge>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-fit">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="reply">回复配置</TabsTrigger>
          <TabsTrigger value="knowledge">知识库配置</TabsTrigger>
          <TabsTrigger value="ticket">工单配置</TabsTrigger>
          <TabsTrigger value="risk">风控配置</TabsTrigger>
        </TabsList>

        {/* 基本信息 */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>设置智能体的基本信息和运行参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">智能体名称</Label>
                  <Input 
                    id="name" 
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">绑定模型</Label>
                  <Select value={config.model} onValueChange={(v) => setConfig({...config, model: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doubao-mini">豆包Mini (推荐客服)</SelectItem>
                      <SelectItem value="doubao-pro-4-250115">豆包Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>启用状态</Label>
                  <p className="text-sm text-muted-foreground">
                    控制智能体是否自动处理客服消息
                  </p>
                </div>
                <Switch 
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 回复配置 */}
        <TabsContent value="reply">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                回复配置
              </CardTitle>
              <CardDescription>配置客服回复的语气和行为</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="responseTone">回复语气</Label>
                <Select value={replyConfig.responseTone} onValueChange={(v) => setReplyConfig({...replyConfig, responseTone: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">友好亲切</SelectItem>
                    <SelectItem value="professional">专业正式</SelectItem>
                    <SelectItem value="casual">轻松随意</SelectItem>
                    <SelectItem value="empathetic">共情理解</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="replyDelay">回复延迟（秒）</Label>
                  <Input 
                    id="replyDelay" 
                    type="number"
                    value={replyConfig.replyDelay}
                    onChange={(e) => setReplyConfig({...replyConfig, replyDelay: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    模拟人工回复的延迟时间
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxResponseLength">最大回复长度</Label>
                  <Input 
                    id="maxResponseLength" 
                    type="number"
                    value={replyConfig.maxResponseLength}
                    onChange={(e) => setReplyConfig({...replyConfig, maxResponseLength: parseInt(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    字符数限制
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动回复</Label>
                  <p className="text-sm text-muted-foreground">有新消息时自动回复</p>
                </div>
                <Switch 
                  checked={replyConfig.autoReply}
                  onCheckedChange={(checked) => setReplyConfig({...replyConfig, autoReply: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>使用表情</Label>
                  <p className="text-sm text-muted-foreground">在回复中添加适当的表情</p>
                </div>
                <Switch 
                  checked={replyConfig.includeEmoji}
                  onCheckedChange={(checked) => setReplyConfig({...replyConfig, includeEmoji: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>多语言支持</Label>
                  <p className="text-sm text-muted-foreground">根据买家语言自动切换</p>
                </div>
                <Switch 
                  checked={replyConfig.multiLanguage}
                  onCheckedChange={(checked) => setReplyConfig({...replyConfig, multiLanguage: checked})}
                />
              </div>

              {replyConfig.multiLanguage && (
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">默认语言</Label>
                  <Select value={replyConfig.defaultLanguage} onValueChange={(v) => setReplyConfig({...replyConfig, defaultLanguage: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="en">英文</SelectItem>
                      <SelectItem value="id">印尼语</SelectItem>
                      <SelectItem value="th">泰语</SelectItem>
                      <SelectItem value="vi">越南语</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 知识库配置 */}
        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                知识库配置
              </CardTitle>
              <CardDescription>配置知识库的检索和行为规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>使用知识库</Label>
                  <p className="text-sm text-muted-foreground">优先从知识库检索答案</p>
                </div>
                <Switch 
                  checked={knowledgeConfig.useKnowledgeBase}
                  onCheckedChange={(checked) => setKnowledgeConfig({...knowledgeConfig, useKnowledgeBase: checked})}
                />
              </div>

              {knowledgeConfig.useKnowledgeBase && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxKnowledgeResults">最大检索结果数</Label>
                      <Input 
                        id="maxKnowledgeResults" 
                        type="number"
                        value={knowledgeConfig.maxKnowledgeResults}
                        onChange={(e) => setKnowledgeConfig({...knowledgeConfig, maxKnowledgeResults: parseInt(e.target.value)})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confidenceThreshold">置信度阈值</Label>
                      <Input 
                        id="confidenceThreshold" 
                        type="number"
                        step="0.1"
                        value={knowledgeConfig.confidenceThreshold}
                        onChange={(e) => setKnowledgeConfig({...knowledgeConfig, confidenceThreshold: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>知识库无法回答时使用AI</Label>
                      <p className="text-sm text-muted-foreground">知识库置信度不足时调用AI</p>
                    </div>
                    <Switch 
                      checked={knowledgeConfig.fallbackToAI}
                      onCheckedChange={(checked) => setKnowledgeConfig({...knowledgeConfig, fallbackToAI: checked})}
                    />
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>允许人工干预</Label>
                  <p className="text-sm text-muted-foreground">客服人员可手动修改AI回复</p>
                </div>
                <Switch 
                  checked={knowledgeConfig.allowManualOverride}
                  onCheckedChange={(checked) => setKnowledgeConfig({...knowledgeConfig, allowManualOverride: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 工单配置 */}
        <TabsContent value="ticket">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                工单配置
              </CardTitle>
              <CardDescription>配置工单创建和升级规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>自动创建工单</Label>
                  <p className="text-sm text-muted-foreground">AI无法处理时自动创建工单</p>
                </div>
                <Switch 
                  checked={ticketConfig.autoCreateTicket}
                  onCheckedChange={(checked) => setTicketConfig({...ticketConfig, autoCreateTicket: checked})}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="escalationKeywords">升级关键词</Label>
                <Textarea 
                  id="escalationKeywords" 
                  placeholder="多个关键词用逗号分隔"
                  value={ticketConfig.escalationKeywords}
                  onChange={(e) => setTicketConfig({...ticketConfig, escalationKeywords: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  包含这些关键词的消息将自动升级为工单
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgentKeywords">紧急关键词</Label>
                <Textarea 
                  id="urgentKeywords" 
                  placeholder="多个关键词用逗号分隔"
                  value={ticketConfig.urgentKeywords}
                  onChange={(e) => setTicketConfig({...ticketConfig, urgentKeywords: e.target.value})}
                />
                <p className="text-xs text-muted-foreground">
                  包含这些关键词的消息将标记为紧急
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>自动设置优先级</Label>
                  <p className="text-sm text-muted-foreground">根据关键词自动设置工单优先级</p>
                </div>
                <Switch 
                  checked={ticketConfig.autoPriority}
                  onCheckedChange={(checked) => setTicketConfig({...ticketConfig, autoPriority: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>升级时通知</Label>
                  <p className="text-sm text-muted-foreground">工单升级时发送通知</p>
                </div>
                <Switch 
                  checked={ticketConfig.notifyOnEscalation}
                  onCheckedChange={(checked) => setTicketConfig({...ticketConfig, notifyOnEscalation: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 风控配置 */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                风控配置
              </CardTitle>
              <CardDescription>配置敏感词检测和退款规则</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>敏感词检测</Label>
                  <p className="text-sm text-muted-foreground">检测并过滤敏感词</p>
                </div>
                <Switch 
                  checked={riskConfig.sensitiveWordsCheck}
                  onCheckedChange={(checked) => setRiskConfig({...riskConfig, sensitiveWordsCheck: checked})}
                />
              </div>

              {riskConfig.sensitiveWordsCheck && (
                <div className="flex items-center justify-between">
                  <div>
                    <Label>屏蔽敏感词</Label>
                    <p className="text-sm text-muted-foreground">自动屏蔽包含敏感词的内容</p>
                  </div>
                  <Switch 
                    checked={riskConfig.blockSensitiveWords}
                    onCheckedChange={(checked) => setRiskConfig({...riskConfig, blockSensitiveWords: checked})}
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>需要人工审核</Label>
                  <p className="text-sm text-muted-foreground">高风险回复需人工确认</p>
                </div>
                <Switch 
                  checked={riskConfig.requireHumanReview}
                  onCheckedChange={(checked) => setRiskConfig({...riskConfig, requireHumanReview: checked})}
                />
              </div>

              {riskConfig.requireHumanReview && (
                <div className="space-y-2">
                  <Label htmlFor="reviewThreshold">审核风险阈值</Label>
                  <Input 
                    id="reviewThreshold" 
                    type="number"
                    step="0.1"
                    value={riskConfig.reviewThreshold}
                    onChange={(e) => setRiskConfig({...riskConfig, reviewThreshold: parseFloat(e.target.value)})}
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>允许自动退款</Label>
                  <p className="text-sm text-muted-foreground">AI可自动处理小额退款</p>
                </div>
                <Switch 
                  checked={riskConfig.allowRefund}
                  onCheckedChange={(checked) => setRiskConfig({...riskConfig, allowRefund: checked})}
                />
              </div>

              {riskConfig.allowRefund && (
                <div className="space-y-2">
                  <Label htmlFor="autoRefundThreshold">自动退款上限</Label>
                  <div className="flex items-center">
                    <span className="text-muted-foreground mr-2">$</span>
                    <Input 
                      id="autoRefundThreshold" 
                      type="number"
                      className="w-32"
                      value={riskConfig.autoRefundThreshold}
                      onChange={(e) => setRiskConfig({...riskConfig, autoRefundThreshold: parseFloat(e.target.value)})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    超过此金额的退款需人工审批
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 保存按钮 */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          重置
        </Button>
        <Button onClick={handleSave} disabled={loading}>
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
    </MainLayout>
  );
}
