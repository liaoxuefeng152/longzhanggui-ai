/**
 * 图片设计智能体
 * 功能：AI生成商品图片、背景替换、图片翻译、图片合规检查
 */

import { BaseAgent, AgentInput, AgentOutput, AgentConfig } from './base';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

interface ImageDesignInput extends AgentInput {
  product_name: string;
  product_description?: string;
  type: 'main' | 'gallery' | 'a_plus' | 'cover';
  style?: 'professional' | 'lifestyle' | 'minimalist' | 'vibrant';
  background_color?: string;
  platform?: 'tiktok' | 'amazon' | 'shopee';
  language?: 'en' | 'id' | 'th' | 'vi' | 'zh';
  text_overlays?: Array<{
    text: string;
    position: 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    color?: string;
    font_size?: number;
  }>;
}

interface ImageDesignOutput {
  image_id: string;
  type: ImageDesignInput['type'];
  url: string;
  thumbnail_url?: string;
  dimensions: {
    width: number;
    height: number;
  };
  file_size: number;
  format: 'jpg' | 'png' | 'webp';
  platform_requirements?: {
    min_width: number;
    min_height: number;
    max_size: number;
    allowed_formats: string[];
    passed: boolean;
  };
  compliance_check?: {
    status: 'passed' | 'warning' | 'failed';
    issues: string[];
  };
  metadata: {
    style: string;
    generated_at: string;
    model_used: string;
  };
}

export class ImageDesignAgent extends BaseAgent {
  private llmClient: LLMClient;

  constructor(config: Partial<AgentConfig>) {
    const fullConfig: AgentConfig = {
      name: '图片设计智能体',
      description: 'AI生成商品图片、背景替换、图片翻译、图片合规检查',
      model: 'doubao-seed-2-0-lite-260215',
      enabled: true,
      maxRetries: 3,
      timeout: 60000,
      ...config,
    };
    super(fullConfig);

    const llmConfig = new Config();
    this.llmClient = new LLMClient(llmConfig, {});
  }

  async execute(input: ImageDesignInput): Promise<AgentOutput> {
    const startTime = Date.now();

    try {
      // 生成图片提示词
      const prompt = await this.generateImagePrompt(input);

      // 调用图片生成API（这里使用模拟数据，实际需要接入真实的图片生成服务）
      const imageData = await this.generateImage(prompt, input);

      // 平台合规检查
      const platformRequirements = this.checkPlatformRequirements(input, imageData);

      // 图片内容合规检查
      const complianceCheck = await this.checkCompliance(imageData, input);

      const output: AgentOutput = {
        success: true,
        data: {
          ...imageData,
          platform_requirements: platformRequirements,
          compliance_check: complianceCheck,
        },
        executionTime: Date.now() - startTime,
      };

      this.recordExecution(input, output);
      return output;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '图片生成失败',
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 生成图片提示词
   */
  private async generateImagePrompt(input: ImageDesignInput): Promise<string> {
    const stylePrompt = {
      professional: 'professional product photography, studio lighting, white background, high detail, commercial quality',
      lifestyle: 'lifestyle photography, natural lighting, real-world setting, lifestyle context, warm tones',
      minimalist: 'minimalist design, clean composition, plenty of negative space, simple background, modern aesthetic',
      vibrant: 'vibrant colors, dynamic composition, eye-catching, bold colors, energetic feel',
    }[input.style || 'professional'];

    const platformPrompt = {
      tiktok: 'mobile-optimized, vertical orientation, 1:1 or 9:16 aspect ratio, eye-catching',
      amazon: 'product photography, white background, high resolution, 1:1 aspect ratio, professional',
      shopee: 'clean product shot, bright colors, mobile-friendly, 1:1 aspect ratio, clear visibility',
    }[input.platform || 'tiktok'];

    const typePrompt = {
      main: 'main product image, product clearly visible, hero shot, front-facing, no text overlays',
      gallery: 'product lifestyle image, showing product in use, context, lifestyle, natural setting',
      a_plus: 'infographic style, multiple angles, feature highlights, detailed view, professional',
      cover: 'eye-catching hero image, strong visual impact, brand-aligned, striking composition',
    }[input.type];

    const basePrompt = `A high-quality ${input.product_name} product image. ${stylePrompt}. ${platformPrompt}. ${typePrompt}`;

    // 添加文本覆盖需求
    let textPrompt = '';
    if (input.text_overlays && input.text_overlays.length > 0) {
      textPrompt = ` Text overlays: ${input.text_overlays.map(t => `"${t.text}" at ${t.position}`).join(', ')}`;
    }

    return basePrompt + textPrompt;
  }

  /**
   * 生成图片（模拟）
   * 实际应该调用DALL-E、Midjourney或Stable Diffusion API
   */
  private async generateImage(
    prompt: string,
    input: ImageDesignInput
  ): Promise<Omit<ImageDesignOutput, 'platform_requirements' | 'compliance_check'>> {
    // 模拟图片生成延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    const imageId = `IMG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 根据类型和平台确定尺寸
    const dimensions = this.getImageDimensions(input.type, input.platform);

    // 模拟图片URL（实际应该从图片生成服务获取）
    const encodedName = encodeURIComponent(input.product_name.substring(0, 20));
    const url = `https://placehold.co/${dimensions.width}x${dimensions.height}/f0f0f0/333333?text=${encodedName}`;
    const thumbnailUrl = `https://placehold.co/200x200/f0f0f0/333333?text=${encodedName}`;

    return {
      image_id: imageId,
      type: input.type,
      url,
      thumbnail_url: thumbnailUrl,
      dimensions,
      file_size: Math.floor(Math.random() * 500000) + 100000, // 100KB-600KB
      format: 'jpg',
      metadata: {
        style: input.style || 'professional',
        generated_at: new Date().toISOString(),
        model_used: 'dall-e-3',
      },
    };
  }

  /**
   * 获取图片尺寸
   */
  private getImageDimensions(
    type: ImageDesignInput['type'],
    platform?: ImageDesignInput['platform']
  ): { width: number; height: number } {
    const typeDimensions = {
      main: { width: 1200, height: 1200 },
      gallery: { width: 1200, height: 1600 },
      a_plus: { width: 1200, height: 1800 },
      cover: { width: 1080, height: 1920 },
    };

    const platformAdjustments = {
      tiktok: { width: 1080, height: 1920 },
      amazon: { width: 1000, height: 1000 },
      shopee: { width: 800, height: 800 },
    };

    const baseDimensions = typeDimensions[type];
    if (platform && platformAdjustments[platform]) {
      return platformAdjustments[platform];
    }

    return baseDimensions;
  }

  /**
   * 检查平台要求
   */
  private checkPlatformRequirements(
    input: ImageDesignInput,
    imageData: any
  ): ImageDesignOutput['platform_requirements'] {
    const requirements = {
      tiktok: { min_width: 800, min_height: 800, max_size: 10000000, allowed_formats: ['jpg', 'png', 'webp'] },
      amazon: { min_width: 1000, min_height: 1000, max_size: 10000000, allowed_formats: ['jpg', 'png'] },
      shopee: { min_width: 800, min_height: 800, max_size: 5000000, allowed_formats: ['jpg', 'png'] },
    };

    const req = requirements[input.platform || 'tiktok'];

    const widthCheck = imageData.dimensions.width >= req.min_width;
    const heightCheck = imageData.dimensions.height >= req.min_height;
    const sizeCheck = imageData.file_size <= req.max_size;
    const formatCheck = req.allowed_formats.includes(imageData.format);

    const passed = widthCheck && heightCheck && sizeCheck && formatCheck;

    return {
      ...req,
      passed,
    };
  }

  /**
   * 合规检查
   */
  private async checkCompliance(
    imageData: any,
    input: ImageDesignInput
  ): Promise<ImageDesignOutput['compliance_check']> {
    const issues: string[] = [];

    // 检查敏感内容（使用AI分析）
    if (input.text_overlays) {
      const sensitiveWords = ['免费', '赠品', '折扣', '特价', '限时', '最佳', '第一', '最好', '医疗', '治疗'];
      for (const overlay of input.text_overlays) {
        for (const word of sensitiveWords) {
          if (overlay.text.includes(word)) {
            issues.push(`文字覆盖包含敏感词：${word}`);
          }
        }
      }
    }

    // 检查水印
    if (imageData.url.includes('watermark')) {
      issues.push('图片包含水印');
    }

    let status: 'passed' | 'warning' | 'failed';
    if (issues.length === 0) {
      status = 'passed';
    } else if (issues.length <= 2) {
      status = 'warning';
    } else {
      status = 'failed';
    }

    return {
      status,
      issues,
    };
  }

  /**
   * 批量生成图片
   */
  async batchGenerate(inputs: ImageDesignInput[]): Promise<AgentOutput> {
    const results = await Promise.allSettled(
      inputs.map(input => this.execute(input))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return {
      success: true,
      data: {
        total: results.length,
        successful,
        failed,
        images: results.map((r, i) => ({
          input: inputs[i],
          output: r.status === 'fulfilled' ? r.value : null,
          status: r.status,
        })),
      },
    };
  }
}
