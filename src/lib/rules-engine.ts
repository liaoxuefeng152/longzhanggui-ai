/**
 * 规则引擎
 * 用于风控、合规、定价等规则判断
 */

export interface Rule {
  id: string;
  name: string;
  description: string;
  category: 'risk' | 'compliance' | 'pricing' | 'inventory';
  enabled: boolean;
  priority: number;
  condition: (data: any) => boolean;
  action: (data: any) => void;
}

export interface RuleEvaluation {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  data: any;
  timestamp: string;
  actionTaken?: string;
}

class RuleEngine {
  private rules: Map<string, Rule> = new Map();
  private evaluationHistory: RuleEvaluation[] = [];

  /**
   * 添加规则
   */
  addRule(rule: Rule): void {
    this.rules.set(rule.id, rule);
    console.log(`规则已添加: ${rule.name}`);
  }

  /**
   * 移除规则
   */
  removeRule(id: string): void {
    this.rules.delete(id);
  }

  /**
   * 启用/禁用规则
   */
  toggleRule(id: string, enabled: boolean): void {
    const rule = this.rules.get(id);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * 评估规则
   */
  evaluateRules(data: any, category?: Rule['category']): RuleEvaluation[] {
    const evaluations: RuleEvaluation[] = [];

    // 按优先级排序
    const sortedRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled && (!category || rule.category === category))
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      try {
        const triggered = rule.condition(data);

        const evaluation: RuleEvaluation = {
          ruleId: rule.id,
          ruleName: rule.name,
          triggered,
          data: JSON.parse(JSON.stringify(data)), // 深拷贝
          timestamp: new Date().toISOString(),
        };

        if (triggered) {
          rule.action(data);
          evaluation.actionTaken = '规则触发，已执行动作';
        }

        evaluations.push(evaluation);
        this.evaluationHistory.push(evaluation);
      } catch (error) {
        console.error(`规则评估失败: ${rule.name}`, error);
      }
    }

    return evaluations;
  }

  /**
   * 获取所有规则
   */
  getRules(): Rule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 获取规则评估历史
   */
  getEvaluationHistory(): RuleEvaluation[] {
    return this.evaluationHistory;
  }

  /**
   * 初始化默认规则
   */
  initializeDefaultRules(): void {
    // 风控规则
    this.addRule({
      id: 'ad_spend_limit',
      name: '广告消耗限制',
      description: '当广告消耗超过阈值时暂停广告',
      category: 'risk',
      enabled: true,
      priority: 100,
      condition: (data) => {
        return data.type === 'ad_spend' && data.amount > data.limit;
      },
      action: (data) => {
        console.warn(`广告消耗超限: ${data.amount} > ${data.limit}，暂停广告`);
        // TODO: 调用API暂停广告
      },
    });

    this.addRule({
      id: 'low_roi_warning',
      name: '低ROI警告',
      description: '当广告ROI低于阈值时发出警告',
      category: 'risk',
      enabled: true,
      priority: 80,
      condition: (data) => {
        return data.type === 'ad_performance' && data.roi < data.threshold;
      },
      action: (data) => {
        console.warn(`广告ROI过低: ${data.roi} < ${data.threshold}，发出警告`);
        // TODO: 发送飞书通知
      },
    });

    // 合规规则
    this.addRule({
      id: 'sensitive_word_check',
      name: '敏感词检查',
      description: '检测到敏感词时阻止发布',
      category: 'compliance',
      enabled: true,
      priority: 100,
      condition: (data) => {
        return data.type === 'listing_check' && data.sensitiveWords?.length > 0;
      },
      action: (data) => {
        console.error(`检测到敏感词: ${data.sensitiveWords.join(', ')}，阻止发布`);
        // TODO: 阻止发布流程
      },
    });

    this.addRule({
      id: 'restricted_category_check',
      name: '限制类目检查',
      description: '检测到限制类目时阻止发布',
      category: 'compliance',
      enabled: true,
      priority: 100,
      condition: (data) => {
        return data.type === 'listing_check' && data.isRestrictedCategory;
      },
      action: (data) => {
        console.error(`检测到限制类目: ${data.category}，阻止发布`);
        // TODO: 阻止发布流程
      },
    });

    // 定价规则
    this.addRule({
      id: 'minimum_profit_margin',
      name: '最低利润率检查',
      description: '当利润率低于最低要求时发出警告',
      category: 'pricing',
      enabled: true,
      priority: 90,
      condition: (data) => {
        return data.type === 'pricing_check' && data.profitMargin < data.minMargin;
      },
      action: (data) => {
        console.warn(`利润率过低: ${data.profitMargin} < ${data.minMargin}，发出警告`);
        // TODO: 发送警告
      },
    });

    this.addRule({
      id: 'price_competitiveness',
      name: '价格竞争力检查',
      description: '当价格显著高于竞品时发出建议',
      category: 'pricing',
      enabled: true,
      priority: 70,
      condition: (data) => {
        return data.type === 'pricing_check' && data.priceRatio > 1.3;
      },
      action: (data) => {
        console.warn(`价格高于竞品: ${data.priceRatio}倍，建议调整`);
        // TODO: 发送建议
      },
    });

    // 库存规则
    this.addRule({
      id: 'low_stock_warning',
      name: '低库存预警',
      description: '当库存低于阈值时发出预警',
      category: 'inventory',
      enabled: true,
      priority: 90,
      condition: (data) => {
        return data.type === 'inventory_check' && data.stock < data.threshold;
      },
      action: (data) => {
        console.warn(`库存不足: ${data.stock} < ${data.threshold}，发出预警`);
        // TODO: 发送飞书通知
      },
    });

    this.addRule({
      id: 'out_of_stock',
      name: '缺货处理',
      description: '当库存为0时下架商品',
      category: 'inventory',
      enabled: true,
      priority: 100,
      condition: (data) => {
        return data.type === 'inventory_check' && data.stock === 0;
      },
      action: (data) => {
        console.error(`商品缺货: ${data.productId}，下架商品`);
        // TODO: 下架商品
      },
    });

    console.log('默认规则已初始化');
  }
}

// 导出单例
export const ruleEngine = new RuleEngine();
