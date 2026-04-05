/**
 * 选品智能体
 * 功能：市场分析、竞品分析、利润核算、合规校验
 */

import { BaseAgent, AgentInput, AgentOutput, AgentConfig } from './base';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

interface ProductSelectionInput extends AgentInput {
  product_name?: string;
  category?: string;
  source_url?: string;
  competitor_urls?: string[];
  cost_price?: number;
  target_market?: 'tk_id' | 'tk_th' | 'tk_vn' | 'amazon_us' | 'amazon_eu';
}

interface ProductSelectionOutput {
  market_potential: {
    score: number; // 0-100
    rating: 'high' | 'medium' | 'low';
    analysis: string;
  };
  competition: {
    level: 'high' | 'medium' | 'low';
    top_competitors: Array<{
      name: string;
      price: number;
      sales: number;
      rating: number;
    }>;
  };
  profitability: {
    cost_price: number;
    suggested_price: number;
    profit_margin: number;
    monthly_profit_estimate: number;
    roi: number;
  };
  compliance: {
    status: 'passed' | 'warning' | 'failed';
    issues: string[];
    restrictions: string[];
  };
  recommendation: {
    action: 'recommended' | 'cautious' | 'not_recommended';
    reason: string;
    next_steps: string[];
  };
}

export class ProductSelectionAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(config: Partial<AgentConfig>) {
    const fullConfig: AgentConfig = {
      name: '选品智能体',
      description: '市场分析、竞品分析、利润核算、合规校验',
      model: 'doubao-seed-2-0-lite-260215',
      enabled: true,
      maxRetries: 3,
      timeout: 30000,
      ...config,
    };
    super(fullConfig);

    const llmConfig = new Config();
    this.llmClient = new LLMClient(llmConfig, {});
  }

  async execute(input: ProductSelectionInput): Promise<AgentOutput> {
    const startTime = Date.now();

    try {
      // 并行执行多项分析
      const [marketPotential, competition, profitability, compliance] = await Promise.all([
        this.analyzeMarketPotential(input),
        this.analyzeCompetition(input),
        this.calculateProfitability(input),
        this.checkCompliance(input),
      ]);

      // 生成推荐建议
      const recommendation = this.generateRecommendation({
        marketPotential,
        competition,
        profitability,
        compliance,
      });

      const output: AgentOutput = {
        success: true,
        data: {
          market_potential: marketPotential,
          competition,
          profitability,
          compliance,
          recommendation,
        },
        executionTime: Date.now() - startTime,
      };

      this.recordExecution(input, output);
      return output;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '选品分析失败',
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 市场潜力分析
   */
  private async analyzeMarketPotential(input: ProductSelectionInput): Promise<ProductSelectionOutput['market_potential']> {
    const prompt = `
你是一位跨境电商选品专家。请分析以下商品的市场潜力：

商品名称：${input.product_name || '未知'}
类目：${input.category || '未知'}
目标市场：${input.target_market || 'TK印尼'}

请从以下维度进行分析：
1. 市场需求规模
2. 增长趋势
3. 目标用户画像
4. 痛点解决能力
5. 差异化优势

请给出：
- 市场潜力评分（0-100）
- 评级（high/medium/low）
- 详细分析报告（100-200字）
`;

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: '你是跨境电商选品专家，擅长市场分析。' },
        { role: 'user', content: prompt },
      ], { model: this.config.model });

      // 解析AI响应
      const analysisText = response.content;
      const score = this.extractScore(analysisText) || 70;
      const rating = this.getRating(score);

      return {
        score,
        rating,
        analysis: analysisText,
      };
    } catch {
      // 失败时返回默认值
      return {
        score: 70,
        rating: 'medium',
        analysis: '市场潜力中等，建议进一步调研。',
      };
    }
  }

  /**
   * 竞品分析
   */
  private async analyzeCompetition(input: ProductSelectionInput): Promise<ProductSelectionOutput['competition']> {
    // 模拟竞品数据（实际应从API获取）
    const competitionLevel: 'high' | 'medium' | 'low' = 'medium';
    const topCompetitors = [
      {
        name: '竞品A',
        price: input.cost_price ? Math.ceil(input.cost_price * 1.5) : 150,
        sales: Math.floor(Math.random() * 5000) + 1000,
        rating: 4.2 + Math.random() * 0.8,
      },
      {
        name: '竞品B',
        price: input.cost_price ? Math.ceil(input.cost_price * 1.3) : 130,
        sales: Math.floor(Math.random() * 3000) + 500,
        rating: 4.0 + Math.random() * 0.7,
      },
      {
        name: '竞品C',
        price: input.cost_price ? Math.ceil(input.cost_price * 1.7) : 170,
        sales: Math.floor(Math.random() * 2000) + 300,
        rating: 3.8 + Math.random() * 0.6,
      },
    ];

    return {
      level: competitionLevel,
      top_competitors: topCompetitors,
    };
  }

  /**
   * 利润核算
   */
  private async calculateProfitability(input: ProductSelectionInput): Promise<ProductSelectionOutput['profitability']> {
    const costPrice = input.cost_price || 100;
    const margin = 0.3; // 30%利润率
    const suggestedPrice = Math.ceil(costPrice / (1 - margin));
    const monthlyProfitEstimate = suggestedPrice * margin * 100; // 假设月销100单

    return {
      cost_price: costPrice,
      suggested_price: suggestedPrice,
      profit_margin: margin,
      monthly_profit_estimate: monthlyProfitEstimate,
      roi: monthlyProfitEstimate / costPrice,
    };
  }

  /**
   * 合规校验
   */
  private async checkCompliance(input: ProductSelectionInput): Promise<ProductSelectionOutput['compliance']> {
    const productName = input.product_name || '';
    const issues: string[] = [];
    const restrictions: string[] = [];

    // 检查敏感词
    const sensitiveWords = ['医疗', '治疗', '治愈', '减肥', '增高', '丰胸'];
    for (const word of sensitiveWords) {
      if (productName.includes(word)) {
        issues.push(`商品名称包含敏感词：${word}`);
        restrictions.push('医疗功效类商品');
      }
    }

    // 检查类目限制
    const restrictedCategories = ['药品', '保健品', '医疗器械', '武器', '管制刀具'];
    if (input.category && restrictedCategories.includes(input.category)) {
      issues.push('商品属于限制类目');
      restrictions.push(input.category);
    }

    const status = issues.length === 0 ? 'passed' : issues.length <= 2 ? 'warning' : 'failed';

    return {
      status,
      issues,
      restrictions,
    };
  }

  /**
   * 生成推荐建议
   */
  private generateRecommendation(data: {
    marketPotential: ProductSelectionOutput['market_potential'];
    competition: ProductSelectionOutput['competition'];
    profitability: ProductSelectionOutput['profitability'];
    compliance: ProductSelectionOutput['compliance'];
  }): ProductSelectionOutput['recommendation'] {
    const { marketPotential, competition, profitability, compliance } = data;

    // 评分计算
    let score = 0;
    score += marketPotential.score * 0.3; // 市场潜力30%
    score += competition.level === 'low' ? 30 : competition.level === 'medium' ? 20 : 10; // 竞争30%
    score += profitability.profit_margin >= 0.3 ? 20 : profitability.profit_margin >= 0.2 ? 15 : 10; // 利润20%
    score += compliance.status === 'passed' ? 20 : compliance.status === 'warning' ? 10 : 0; // 合规20%

    let action: 'recommended' | 'cautious' | 'not_recommended';
    let reason: string;
    let nextSteps: string[];

    if (score >= 70 && compliance.status !== 'failed') {
      action = 'recommended';
      reason = '市场潜力大，竞争适中，利润可观，合规风险低。';
      nextSteps = [
        '启动图片处理流程',
        '优化Listing',
        '准备上架',
        '创建广告计划',
      ];
    } else if (score >= 50) {
      action = 'cautious';
      reason = '市场潜力一般，存在一定风险，建议谨慎推进。';
      nextSteps = [
        '深入调研市场',
        '优化成本结构',
        '关注竞品动态',
        '小规模试销',
      ];
    } else {
      action = 'not_recommended';
      reason = '市场潜力不足或风险过高，不建议选品。';
      nextSteps = [
        '寻找其他商品',
        '重新评估市场',
        '优化选品策略',
      ];
    }

    return {
      action,
      reason,
      next_steps: nextSteps,
    };
  }

  /**
   * 从文本中提取评分
   */
  private extractScore(text: string): number | null {
    const match = text.match(/(\d{2,3})分|评分[：:]\s*(\d{2,3})|潜力[：:]\s*(\d{2,3})/);
    if (match) {
      const score = parseInt(match[1] || match[2] || match[3]);
      if (score >= 0 && score <= 100) {
        return score;
      }
    }
    return null;
  }

  /**
   * 根据评分获取评级
   */
  private getRating(score: number): 'high' | 'medium' | 'low' {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }
}
