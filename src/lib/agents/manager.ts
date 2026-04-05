/**
 * AI智能体管理器
 * 统一管理所有AI智能体的实例和调用
 */

import { BaseAgent, AgentType } from './base';
import { ProductSelectionAgent } from './product-selection';
import { ImageDesignAgent } from './image-design';
import { ListingOptimizationAgent } from './listing-optimization';
// import { VideoGenerationAgent } from './video-generation';
// import { AdvertisingAgent } from './advertising';
// import { CustomerServiceAgent } from './customer-service';
// import { DataReviewAgent } from './data-review';

export class AgentManager {
  private agents: Map<AgentType, BaseAgent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  /**
   * 初始化所有智能体
   */
  private initializeAgents(): void {
    // 选品智能体
    this.agents.set(AgentType.PRODUCT_SELECTION, new ProductSelectionAgent({
      name: '选品智能体',
      description: '市场分析、竞品分析、利润核算、合规校验',
      model: 'doubao-seed-2-0-lite-260215',
      enabled: true,
    }));

    // 图片设计智能体
    this.agents.set(AgentType.IMAGE_DESIGN, new ImageDesignAgent({
      name: '图片设计智能体',
      description: 'AI生成商品图片、背景替换、图片翻译、图片合规检查',
      model: 'doubao-seed-2-0-lite-260215',
      enabled: true,
    }));

    // Listing优化智能体
    this.agents.set(AgentType.LISTING_OPTIMIZATION, new ListingOptimizationAgent({
      name: 'Listing优化智能体',
      description: '生成标题、描述、五点描述、关键词、SEO优化',
      model: 'doubao-seed-2-0-lite-260215',
      enabled: true,
    }));

    // TODO: 添加其他智能体
    // this.agents.set(AgentType.VIDEO_GENERATION, new VideoGenerationAgent(...));
    // this.agents.set(AgentType.ADVERTISING, new AdvertisingAgent(...));
    // this.agents.set(AgentType.CUSTOMER_SERVICE, new CustomerServiceAgent(...));
    // this.agents.set(AgentType.DATA_REVIEW, new DataReviewAgent(...));
  }

  /**
   * 获取智能体实例
   */
  getAgent(type: AgentType): BaseAgent | undefined {
    return this.agents.get(type);
  }

  /**
   * 执行智能体任务
   */
  async executeAgent(type: AgentType, input: any): Promise<any> {
    const agent = this.getAgent(type);
    if (!agent) {
      throw new Error(`智能体 ${type} 不存在或未启用`);
    }

    if (!agent.getConfig().enabled) {
      throw new Error(`智能体 ${agent.getConfig().name} 未启用`);
    }

    return await agent.executeWithRetry(input);
  }

  /**
   * 获取所有智能体配置
   */
  getAllAgentConfigs(): Array<{ type: AgentType; config: any }> {
    return Array.from(this.agents.entries()).map(([type, agent]) => ({
      type,
      config: agent.getConfig(),
    }));
  }

  /**
   * 更新智能体配置
   */
  updateAgentConfig(type: AgentType, updates: any): void {
    const agent = this.getAgent(type);
    if (agent) {
      agent.updateConfig(updates);
    }
  }

  /**
   * 启用/禁用智能体
   */
  toggleAgent(type: AgentType, enabled: boolean): void {
    this.updateAgentConfig(type, { enabled });
  }

  /**
   * 获取智能体执行历史
   */
  getAgentExecutionHistory(type: AgentType): any[] | undefined {
    const agent = this.getAgent(type);
    if (agent) {
      return agent.getExecutionHistory();
    }
    return undefined;
  }

  /**
   * 清空执行历史
   */
  clearExecutionHistory(type: AgentType): void {
    const agent = this.getAgent(type);
    if (agent) {
      // Agent内部没有clear方法，这里只是标记
      console.log(`智能体 ${type} 的执行历史无法清空`);
    }
  }

  /**
   * 批量执行智能体
   */
  async executeAgentsBatch(
    tasks: Array<{ type: AgentType; input: any }>
  ): Promise<Array<{ type: AgentType; result: any }>> {
    const results = await Promise.allSettled(
      tasks.map(task => this.executeAgent(task.type, task.input))
    );

    return tasks.map((task, index) => ({
      type: task.type,
      result: results[index].status === 'fulfilled' ? results[index].value : null,
    }));
  }
}

// 导出单例
export const agentManager = new AgentManager();
