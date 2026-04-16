// 合规检查工具库
// 基于AGENTS.md文档中的合规规则库

// 禁售品类列表
export const FORBIDDEN_CATEGORIES = [
  '武器弹药',
  '药品食品',
  '医疗器械',
  '仿真枪',
  '濒危物种',
  '赌博用品',
  '色情用品',
  '仿牌侵权',
  '烟酒',
  '毒品',
  '管制刀具',
  '易燃易爆物品',
  '间谍器材',
  '窃听设备',
  '人体器官',
  '处方药',
  '精神药品',
  '麻醉药品',
  '疫苗',
  '血液制品',
  '警用装备',
  '军用装备',
  '核材料',
  '化学武器',
  '生物武器'
];

// 禁售关键词（用于商品名称和描述检测）
export const FORBIDDEN_KEYWORDS = [
  '枪', '武器', '弹药', '爆炸', '火药', '雷管',
  '药品', '处方药', '疫苗', '医疗', '器械', '手术',
  '仿真', '刀', '管制', '警', '军', '窃听', '偷拍',
  '濒危', '野生', '保护动物', '象牙', '犀牛角', '虎骨',
  '赌博', '博彩', '彩票', '赌场', '老虎机',
  '色情', '成人', '情色', '裸体', '性用品',
  '仿牌', '高仿', 'A货', '精仿', '复刻', '盗版',
  '烟', '酒', '香烟', '白酒', '红酒',
  '毒', '毒品', '麻醉', '精神', '兴奋剂',
  '易燃易爆', '汽油', '炸药', '烟花', '爆竹'
];

// 平台认证要求
export interface PlatformCertRequirement {
  region: string;
  certifications: string[];
  description: string;
}

export const PLATFORM_CERT_REQUIREMENTS: PlatformCertRequirement[] = [
  {
    region: '美区',
    certifications: ['FDA注册', 'CPC证书', 'FCC认证'],
    description: '美国市场需要FDA食品药品认证、CPC儿童产品证书、FCC无线认证'
  },
  {
    region: '欧区',
    certifications: ['UKCA认证', 'CE认证', '英代信息'],
    description: '欧洲市场需要UKCA英国认证、CE欧盟认证、英国代表信息'
  },
  {
    region: '印尼',
    certifications: ['BPOM注册', 'HALAL认证'],
    description: '印尼市场需要BPOM药品食品认证、HALAL清真认证'
  },
  {
    region: '泰国',
    certifications: ['Thai FDA注册', 'TIS标准'],
    description: '泰国市场需要Thai FDA认证、TIS工业标准'
  },
  {
    region: '越南',
    certifications: ['越南FDA注册', 'COA'],
    description: '越南市场需要越南FDA认证、COA分析证书'
  },
  {
    region: '马来',
    certifications: ['MAL注册', 'HALAL认证'],
    description: '马来西亚市场需要MAL注册、HALAL清真认证'
  }
];

// 各站点单品最高价格限额（单位：美元）
export const PRICE_LIMITS: Record<string, number> = {
  'shopee_us': 500,
  'shopee_eu': 800,
  'shopee_id': 300,
  'shopee_th': 400,
  'shopee_vn': 350,
  'shopee_my': 450,
  'lazada_us': 600,
  'lazada_eu': 900,
  'lazada_id': 350,
  'lazada_th': 450,
  'lazada_vn': 400,
  'lazada_my': 500,
  'tiktok_us': 700,
  'tiktok_eu': 1000,
  'tiktok_id': 400,
  'tiktok_th': 500,
  'tiktok_vn': 450,
  'tiktok_my': 550
};

// 合规检查结果接口
export interface ComplianceCheckResult {
  passed: boolean;
  forbiddenCategory?: string;
  forbiddenKeyword?: string;
  certRequirements?: PlatformCertRequirement[];
  priceLimit?: { max: number; current: number; platform: string } | null;
  warnings: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// 商品信息接口
export interface ProductInfo {
  name: string;
  description?: string;
  category?: string;
  price?: number;
  targetRegion?: string;
  targetPlatform?: string;
}

/**
 * 检查商品是否属于禁售品类
 */
export function checkForbiddenCategory(productName: string, category?: string): string | null {
  // 检查品类名称
  if (category) {
    for (const forbidden of FORBIDDEN_CATEGORIES) {
      if (category.includes(forbidden) || forbidden.includes(category)) {
        return forbidden;
      }
    }
  }
  
  // 检查商品名称中的关键词
  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (productName.includes(keyword)) {
      return keyword;
    }
  }
  
  return null;
}

/**
 * 检查商品描述中的禁售关键词
 */
export function checkForbiddenKeywords(text: string): string[] {
  const found: string[] = [];
  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (text.includes(keyword)) {
      found.push(keyword);
    }
  }
  return found;
}

/**
 * 获取目标地区的认证要求
 */
export function getCertRequirements(region?: string): PlatformCertRequirement[] {
  if (!region) {
    return PLATFORM_CERT_REQUIREMENTS;
  }
  return PLATFORM_CERT_REQUIREMENTS.filter(req => req.region === region);
}

/**
 * 检查价格是否超过平台限制
 */
export function checkPriceLimit(price: number, platform: string, region?: string): { max: number; current: number; platform: string } | null {
  const key = `${platform}_${region || 'us'}`.toLowerCase();
  const limit = PRICE_LIMITS[key];
  
  if (limit && price > limit) {
    return { max: limit, current: price, platform: key };
  }
  
  return null;
}

/**
 * 完整的合规检查函数
 */
export function checkProductCompliance(product: ProductInfo): ComplianceCheckResult {
  const warnings: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  // 1. 检查禁售品类
  const forbiddenCategory = checkForbiddenCategory(product.name, product.category);
  if (forbiddenCategory) {
    return {
      passed: false,
      forbiddenCategory,
      warnings: [],
      riskLevel: 'critical'
    };
  }
  
  // 2. 检查商品描述中的禁售关键词
  if (product.description) {
    const forbiddenKeywords = checkForbiddenKeywords(product.description);
    if (forbiddenKeywords.length > 0) {
      return {
        passed: false,
        forbiddenKeyword: forbiddenKeywords[0],
        warnings: [],
        riskLevel: 'critical'
      };
    }
  }
  
  // 3. 获取认证要求（仅作为提示，不阻止上架）
  const certRequirements = getCertRequirements(product.targetRegion);
  if (certRequirements.length > 0) {
    warnings.push(`请注意：${product.targetRegion}市场可能需要以下认证：${certRequirements[0].certifications.join('、')}`);
    riskLevel = 'medium';
  }
  
  // 4. 检查价格限制
  let priceLimit = null;
  if (product.price && product.targetPlatform) {
    priceLimit = checkPriceLimit(product.price, product.targetPlatform, product.targetRegion);
    if (priceLimit) {
      warnings.push(`价格超过${product.targetPlatform}平台限制，建议降低至$${priceLimit.max}以下`);
      riskLevel = 'high';
    }
  }
  
  return {
    passed: true,
    certRequirements,
    priceLimit,
    warnings,
    riskLevel
  };
}

/**
 * 获取风险等级对应的徽章样式
 */
export function getRiskLevelBadgeClass(riskLevel: string): string {
  switch (riskLevel) {
    case 'low':
      return 'bg-[#E8FFEA] text-[#00B42A]';
    case 'medium':
      return 'bg-[#FFF7E8] text-[#FF7D00]';
    case 'high':
      return 'bg-[#FFECE8] text-[#F53F3F]';
    case 'critical':
      return 'bg-[#F53F3F] text-white';
    default:
      return 'bg-[#F2F3F5] text-[#86909C]';
  }
}

/**
 * 获取风险等级对应的文字
 */
export function getRiskLevelText(riskLevel: string): string {
  switch (riskLevel) {
    case 'low':
      return '低风险';
    case 'medium':
      return '中风险';
    case 'high':
      return '高风险';
    case 'critical':
      return '禁售';
    default:
      return '未知';
  }
}
