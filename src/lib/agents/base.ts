/**
 * AI智能体基础接口
 * 所有智能体必须实现此接口
 */

export interface AgentConfig {
  name: string;
  description: string;
  model: string;
  enabled: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface AgentInput {
  [key: string]: any;
}

export interface AgentOutput {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected executionHistory: Array<{
    input: AgentInput;
    output: AgentOutput;
    timestamp: string;
  }> = [];

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * 执行智能体任务
   */
  abstract execute(input: AgentInput): Promise<AgentOutput>;

  /**
   * 获取智能体配置
   */
  getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(): Array<{
    input: AgentInput;
    output: AgentOutput;
    timestamp: string;
  }> {
    return this.executionHistory;
  }

  /**
   * 记录执行
   */
  protected recordExecution(input: AgentInput, output: AgentOutput): void {
    this.executionHistory.push({
      input,
      output,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 带重试的执行
   */
  async executeWithRetry(input: AgentInput): Promise<AgentOutput> {
    const maxRetries = this.config.maxRetries || 3;
    let lastError: Error | undefined;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const output = await this.execute(input);
        this.recordExecution(input, output);
        return output;
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries) {
          console.warn(`Agent ${this.config.name} retry ${i + 1}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }

    throw lastError;
  }
}

/**
 * AI智能体类型
 */
export enum AgentType {
  PRODUCT_SELECTION = 'product-selection',      // 选品智能体
  IMAGE_DESIGN = 'image-design',                // 图片设计智能体
  VIDEO_GENERATION = 'video-generation',        // 视频生成智能体
  LISTING_OPTIMIZATION = 'listing-optimization',// Listing优化智能体
  ADVERTISING = 'advertising',                  // 广告投放智能体
  CUSTOMER_SERVICE = 'customer-service',        // 客服智能体
  DATA_REVIEW = 'data-review',                  // 数据复盘智能体
}
