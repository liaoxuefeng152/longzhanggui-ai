/**
 * Listing优化智能体
 * 功能：生成标题、描述、五点描述、关键词、SEO优化
 */

import { BaseAgent, AgentInput, AgentOutput, AgentConfig } from './base';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

interface ListingOptimizationInput extends AgentInput {
  product_name: string;
  product_description?: string;
  features?: string[];
  target_market?: 'tk_id' | 'tk_th' | 'tk_vn' | 'amazon_us' | 'amazon_eu';
  language?: 'en' | 'id' | 'th' | 'vi' | 'zh';
  platform?: 'tiktok' | 'amazon' | 'shopee';
  keywords?: string[];
  competitor_listings?: Array<{
    title: string;
    description?: string;
  }>;
}

interface ListingOptimizationOutput {
  product_info: {
    name_en: string;
    name_local?: string;
    category?: string;
  };
  title: {
    optimized: string;
    alternatives: string[];
    length: number;
    seo_score: number;
    explanation: string;
  };
  description: {
    optimized: string;
    word_count: number;
    readability_score: number;
    cta_included: boolean;
  };
  bullet_points: {
    points: string[];
    count: number;
    highlights_features: string[];
  };
  keywords: {
    primary: string[];
    secondary: string[];
    long_tail: string[];
    total_count: number;
    competition_level: 'high' | 'medium' | 'low';
  };
  seo_analysis: {
    title_score: number;
    description_score: number;
    keyword_density: number;
    overall_score: number;
    recommendations: string[];
  };
  metadata: {
    generated_at: string;
    model_used: string;
    language: string;
  };
}

export class ListingOptimizationAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(config: Partial<AgentConfig>) {
    const fullConfig: AgentConfig = {
      name: 'Listing优化智能体',
      description: '生成标题、描述、五点描述、关键词、SEO优化',
      model: 'doubao-seed-2-0-lite-260215',
      enabled: true,
      maxRetries: 3,
      timeout: 45000,
      ...config,
    };
    super(fullConfig);

    const llmConfig = new Config();
    this.llmClient = new LLMClient(llmConfig, {});
  }

  async execute(input: ListingOptimizationInput): Promise<AgentOutput> {
    const startTime = Date.now();

    try {
      // 并行生成多个部分
      const [titleResult, descriptionResult, bulletPointsResult, keywordsResult] = await Promise.all([
        this.generateTitle(input),
        this.generateDescription(input),
        this.generateBulletPoints(input),
        this.generateKeywords(input),
      ]);

      // SEO分析
      const seoAnalysis = this.performSEOAnalysis({
        title: titleResult.optimized,
        description: descriptionResult.optimized,
        keywords: keywordsResult,
      });

      // 生成本地化名称
      const nameLocal = input.language && input.language !== 'en'
        ? await this.translateToLanguage(input.product_name, input.language)
        : undefined;

      const output: AgentOutput = {
        success: true,
        data: {
          product_info: {
            name_en: input.product_name,
            name_local: nameLocal,
            category: this.inferCategory(input.product_name),
          },
          title: titleResult,
          description: descriptionResult,
          bullet_points: bulletPointsResult,
          keywords: keywordsResult,
          seo_analysis: seoAnalysis,
          metadata: {
            generated_at: new Date().toISOString(),
            model_used: this.config.model,
            language: input.language || 'en',
          },
        },
        executionTime: Date.now() - startTime,
      };

      this.recordExecution(input, output);
      return output;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Listing优化失败',
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 生成标题
   */
  private async generateTitle(
    input: ListingOptimizationInput
  ): Promise<ListingOptimizationOutput['title']> {
    const platformRules = {
      tiktok: { maxLength: 100, style: 'catchy, emoji-friendly, short', focus: 'trending' },
      amazon: { maxLength: 200, style: 'descriptive, keyword-rich, professional', focus: 'searchability' },
      shopee: { maxLength: 120, style: 'concise, benefit-oriented, local', focus: 'conversion' },
    };

    const rule = platformRules[input.platform || 'tiktok'];

    const prompt = `
请为以下商品生成3个优化标题：

商品名称：${input.product_name}
商品描述：${input.product_description || '无'}
目标市场：${input.target_market || 'TK印尼'}
语言：${input.language || '英语'}

要求：
1. 标题长度不超过${rule.maxLength}字符
2. 风格：${rule.style}
3. 侧重：${rule.focus}
4. 包含核心关键词
5. 吸引目标用户

输出格式：
标题1：[优化标题]
标题2：[备选标题1]
标题3：[备选标题2]

选择最佳标题并说明理由。
`;

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: '你是跨境电商Listing优化专家，擅长生成高转化率标题。' },
        { role: 'user', content: prompt },
      ], { model: this.config.model });

      const text = response.content;
      const titles = this.extractTitles(text);
      const selected = titles[0] || input.product_name;
      const seoScore = this.calculateTitleSEOScore(selected, input.keywords || []);

      return {
        optimized: selected,
        alternatives: titles.slice(1),
        length: selected.length,
        seo_score: seoScore,
        explanation: this.extractExplanation(text),
      };
    } catch {
      // 失败时返回默认值
      return {
        optimized: input.product_name,
        alternatives: [],
        length: input.product_name.length,
        seo_score: 70,
        explanation: '使用默认标题',
      };
    }
  }

  /**
   * 生成描述
   */
  private async generateDescription(
    input: ListingOptimizationInput
  ): Promise<ListingOptimizationOutput['description']> {
    const prompt = `
请为以下商品撰写产品描述：

商品名称：${input.product_name}
商品描述：${input.product_description || '无'}
产品特点：${input.features?.join(', ') || '无'}
目标市场：${input.target_market || 'TK印尼'}
语言：${input.language || '英语'}

要求：
1. 100-200字
2. 突出产品价值和优势
3. 使用情感化语言
4. 包含行动号召
5. 易于阅读和理解

输出格式：
[产品描述]
`;

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: '你是跨境电商文案专家，擅长撰写高转化率产品描述。' },
        { role: 'user', content: prompt },
      ], { model: this.config.model });

      const description = response.content.trim();
      const wordCount = description.split(/\s+/).length;
      const readabilityScore = this.calculateReadabilityScore(description);
      const ctaIncluded = this.checkCTA(description);

      return {
        optimized: description,
        word_count: wordCount,
        readability_score: readabilityScore,
        cta_included: ctaIncluded,
      };
    } catch {
      return {
        optimized: `Experience the quality of ${input.product_name}. Perfect for your daily needs. Order now!`,
        word_count: 15,
        readability_score: 80,
        cta_included: true,
      };
    }
  }

  /**
   * 生成五点描述
   */
  private async generateBulletPoints(
    input: ListingOptimizationInput
  ): Promise<ListingOptimizationOutput['bullet_points']> {
    const prompt = `
请为以下商品生成5个产品特点：

商品名称：${input.product_name}
商品描述：${input.product_description || '无'}
产品特点：${input.features?.join(', ') || '无'}
语言：${input.language || '英语'}

要求：
1. 每点30-50字
2. 以大写关键词开头
3. 突出核心卖点
4. 使用数字和具体数据
5. 说服力强

输出格式：
1. [特点1]
2. [特点2]
3. [特点3]
4. [特点4]
5. [特点5]
`;

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: '你是跨境电商文案专家，擅长提炼产品核心卖点。' },
        { role: 'user', content: prompt },
      ], { model: this.config.model });

      const points = this.extractBulletPoints(response.content);
      const highlights = this.extractHighlightFeatures(points);

      return {
        points,
        count: points.length,
        highlights_features: highlights,
      };
    } catch {
      return {
        points: [
          'PREMIUM QUALITY - Made with high-quality materials for durability',
          'MULTI-PURPOSE - Perfect for various daily uses',
          'EASY TO USE - Simple and intuitive design',
          'COMPACT SIZE - Portable and convenient',
          'GREAT VALUE - Excellent price-performance ratio',
        ],
        count: 5,
        highlights_features: ['PREMIUM QUALITY', 'MULTI-PURPOSE', 'EASY TO USE'],
      };
    }
  }

  /**
   * 生成关键词
   */
  private async generateKeywords(
    input: ListingOptimizationInput
  ): Promise<ListingOptimizationOutput['keywords']> {
    const prompt = `
请为以下商品生成关键词：

商品名称：${input.product_name}
目标市场：${input.target_market || 'TK印尼'}
语言：${input.language || '英语'}

输出：
- 5个主要关键词（高搜索量，高竞争）
- 10个次要关键词（中等搜索量）
- 10个长尾关键词（低竞争，高转化）

格式：
主要关键词：[关键词1, 关键词2, ...]
次要关键词：[关键词1, 关键词2, ...]
长尾关键词：[关键词1, 关键词2, ...]
`;

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: '你是跨境电商SEO专家，擅长关键词挖掘和分析。' },
        { role: 'user', content: prompt },
      ], { model: this.config.model });

      const keywords = this.extractKeywords(response.content);

      return {
        primary: keywords.primary,
        secondary: keywords.secondary,
        long_tail: keywords.long_tail,
        total_count: keywords.primary.length + keywords.secondary.length + keywords.long_tail.length,
        competition_level: 'medium',
      };
    } catch {
      return {
        primary: ['best', 'quality', 'sale', 'hot', 'new'],
        secondary: ['cheap', 'good', 'fast', 'free', 'top', 'buy', 'online', 'shop', 'store', 'deal'],
        long_tail: [
          'best quality for you',
          'hot sale online',
          'good price product',
          'fast shipping worldwide',
          'top rated items',
          'buy now save money',
          'online shopping store',
          'deal of the day',
        ],
        total_count: 23,
        competition_level: 'medium',
      };
    }
  }

  /**
   * SEO分析
   */
  private performSEOAnalysis(data: {
    title: string;
    description: string;
    keywords: ListingOptimizationOutput['keywords'];
  }): ListingOptimizationOutput['seo_analysis'] {
    const titleScore = this.calculateTitleSEOScore(data.title, [
      ...data.keywords.primary,
      ...data.keywords.secondary,
    ]);

    const descriptionScore = this.calculateDescriptionSEOScore(data.description, data.keywords.primary);

    const keywordDensity = this.calculateKeywordDensity(
      data.title + ' ' + data.description,
      data.keywords.primary
    );

    const overallScore = Math.round((titleScore + descriptionScore) / 2);

    const recommendations: string[] = [];
    if (titleScore < 70) recommendations.push('标题SEO得分较低，建议优化关键词分布');
    if (descriptionScore < 70) recommendations.push('描述SEO得分较低，建议增加关键词密度');
    if (keywordDensity < 1.5) recommendations.push('关键词密度偏低，建议增加主要关键词出现频率');
    if (keywordDensity > 3) recommendations.push('关键词密度过高，建议降低避免关键词堆砌');

    return {
      title_score: titleScore,
      description_score: descriptionScore,
      keyword_density: keywordDensity,
      overall_score: overallScore,
      recommendations,
    };
  }

  /**
   * 翻译到目标语言
   */
  private async translateToLanguage(text: string, language: string): Promise<string> {
    const languageMap: Record<string, string> = {
      id: 'Indonesian',
      th: 'Thai',
      vi: 'Vietnamese',
      zh: 'Chinese',
    };

    const targetLanguage = languageMap[language] || 'English';

    const prompt = `将以下文本翻译成${targetLanguage}：${text}`;

    try {
      const response = await this.llmClient.invoke([
        { role: 'system', content: '你是专业翻译专家。' },
        { role: 'user', content: prompt },
      ], { model: this.config.model });

      return response.content.trim();
    } catch {
      return text;
    }
  }

  /**
   * 辅助方法：提取标题
   */
  private extractTitles(text: string): string[] {
    const titles: string[] = [];
    const matches = text.match(/标题[123]：(.+)/g);
    if (matches) {
      for (const match of matches) {
        const title = match.replace(/标题[123]：/, '').trim();
        if (title) titles.push(title);
      }
    }
    return titles.length > 0 ? titles : [text.substring(0, 100)];
  }

  /**
   * 辅助方法：提取说明
   */
  private extractExplanation(text: string): string {
    const match = text.match(/理由[：:](.+)/);
    return match ? match[1].trim() : '基于AI优化';
  }

  /**
   * 辅助方法：提取五点描述
   */
  private extractBulletPoints(text: string): string[] {
    const points: string[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)/);
      if (match) {
        points.push(match[1].trim());
      }
    }
    return points.length >= 5 ? points.slice(0, 5) : points;
  }

  /**
   * 辅助方法：提取关键词
   */
  private extractKeywords(text: string): {
    primary: string[];
    secondary: string[];
    long_tail: string[];
  } {
    const primary: string[] = [];
    const secondary: string[] = [];
    const long_tail: string[] = [];

    const primaryMatch = text.match(/主要关键词[：:]\[([^\]]+)\]/);
    if (primaryMatch) {
      primary.push(...primaryMatch[1].split(',').map(k => k.trim()));
    }

    const secondaryMatch = text.match(/次要关键词[：:]\[([^\]]+)\]/);
    if (secondaryMatch) {
      secondary.push(...secondaryMatch[1].split(',').map(k => k.trim()));
    }

    const longTailMatch = text.match(/长尾关键词[：:]\[([^\]]+)\]/);
    if (longTailMatch) {
      long_tail.push(...longTailMatch[1].split(',').map(k => k.trim()));
    }

    return {
      primary: primary.length > 0 ? primary : ['best', 'quality', 'sale', 'hot', 'new'],
      secondary: secondary.length > 0 ? secondary : ['cheap', 'good', 'fast', 'free', 'top', 'buy', 'online', 'shop', 'store', 'deal'],
      long_tail: long_tail.length > 0 ? long_tail : ['best quality for you', 'hot sale online', 'good price product'],
    };
  }

  /**
   * 辅助方法：计算标题SEO分数
   */
  private calculateTitleSEOScore(title: string, keywords: string[]): number {
    let score = 50;

    // 检查关键词包含
    for (const keyword of keywords) {
      if (title.toLowerCase().includes(keyword.toLowerCase())) {
        score += 5;
      }
    }

    // 检查长度
    if (title.length >= 50 && title.length <= 100) {
      score += 10;
    } else if (title.length < 50) {
      score -= 5;
    }

    // 检查数字和特殊字符
    if (/\d/.test(title)) score += 5;
    if (/[-|()]/.test(title)) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 辅助方法：计算描述SEO分数
   */
  private calculateDescriptionSEOScore(description: string, keywords: string[]): number {
    let score = 50;

    // 检查关键词包含
    for (const keyword of keywords) {
      if (description.toLowerCase().includes(keyword.toLowerCase())) {
        score += 3;
      }
    }

    // 检查长度
    if (description.length >= 100 && description.length <= 200) {
      score += 10;
    }

    // 检查行动号召
    if (this.checkCTA(description)) {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 辅助方法：计算关键词密度
   */
  private calculateKeywordDensity(text: string, keywords: string[]): number {
    if (!keywords.length) return 0;

    const totalWords = text.split(/\s+/).length;
    if (totalWords === 0) return 0;

    let keywordCount = 0;
    for (const keyword of keywords) {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      if (matches) {
        keywordCount += matches.length;
      }
    }

    return (keywordCount / totalWords) * 100;
  }

  /**
   * 辅助方法：计算可读性分数
   */
  private calculateReadabilityScore(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;

    if (sentences === 0) return 50;

    const avgWordsPerSentence = words / sentences;

    // 理想的每句词数是15-20
    let score = 100 - Math.abs(avgWordsPerSentence - 17.5) * 3;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * 辅助方法：检查是否包含行动号召
   */
  private checkCTA(text: string): boolean {
    const ctaKeywords = ['buy now', 'order now', 'shop now', 'get yours', 'limited time', 'sale', 'discount'];
    return ctaKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * 辅助方法：提取高亮特性
   */
  private extractHighlightFeatures(points: string[]): string[] {
    const features: string[] = [];
    for (const point of points) {
      const match = point.match(/^([A-Z\s]+)/);
      if (match) {
        features.push(match[1].trim());
      }
    }
    return features;
  }

  /**
   * 辅助方法：推断类目
   */
  private inferCategory(productName: string): string {
    const categoryMap: Record<string, string> = {
      'phone': 'Electronics',
      'watch': 'Watches',
      'bag': 'Bags',
      'shoes': 'Shoes',
      'clothing': 'Clothing',
      'beauty': 'Beauty',
      'home': 'Home',
      'kitchen': 'Kitchen',
    };

    const lowerName = productName.toLowerCase();
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }

    return 'General';
  }
}
