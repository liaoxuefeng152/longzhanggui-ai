"""
AI智能体服务集合
包含选品、Listing优化、智能定价、广告投放、客服、数据复盘智能体
"""
import json
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum

import httpx
from loguru import logger
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import settings
from app.services.llm_service import LLMService


# ============ 选品智能体 ============

class ProductSelectionAgent:
    """选品智能体 - 使用豆包大模型"""
    
    SYSTEM_PROMPT = """你是一位专业的跨境电商选品专家，精通TikTok Shop、Amazon、Shopee等平台的选品策略。

你的任务是根据用户提供的信息，从多个维度分析并推荐最有潜力的爆款商品。

分析维度包括：
1. 市场需求分析 - 搜索量、趋势、竞争度
2. 利润空间分析 - 成本、售价、毛利率
3. 物流可行性 - 重量、体积、清关难度
4. 季节性因素 - 销售周期、库存风险
5. 平台政策 - 合规性、禁售品检查

请用专业、客观的语言进行分析，并给出明确的选品建议。

请以JSON格式输出推荐结果，格式如下：
{
  "analysis": "市场分析报告...",
  "recommendations": [
    {
      "name": "商品名称",
      "source_price": "1688参考价",
      "suggested_price": "建议售价",
      "profit_rate": "预估利润率",
      "monthly_sales": "预估月销量",
      "trend": "销售趋势",
      "competition_level": "竞争程度",
      "selling_points": ["卖点1", "卖点2"],
      "risks": ["风险1", "风险2"],
      "1688_links": ["1688链接"],
      "reason": "推荐理由"
    }
  ],
  "summary": {
    "avg_profit_rate": "平均利润率",
    "avg_monthly_sales": "平均月销量",
    "recommendation": "综合建议"
  }
}"""
    
    def __init__(self):
        self.name = "选品智能体"
        self.description = "基于市场数据和竞争分析，挖掘爆款商品"
        self.llm = LLMService.for_agent("product_selection", temperature=0.7)
    
    async def select_products(
        self,
        platform: str = "tiktok",
        site: str = "id",
        category: str = None,
        count: int = 5,
        min_profit_rate: float = 0.3,
        criteria: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        选品 - 调用豆包大模型进行智能选品分析
        
        Args:
            platform: 平台（tiktok/amazon/shopee）
            site: 站点
            category: 品类
            count: 数量
            min_profit_rate: 最低利润率
            criteria: 其他筛选条件
            
        Returns:
            选品结果
        """
        logger.info(f"开始AI选品: {platform}/{site}/{category}, 数量{count}")
        
        # 构建提示词
        prompt = f"""请为跨境电商平台分析并推荐{count}款热门商品。

平台: {platform.upper()}
站点: {site}
商品类目: {category or '不限'}

筛选条件:
- 最低利润率要求: {min_profit_rate * 100}%

请从市场需求、竞争程度、利润空间、物流可行性等多维度进行分析，推荐最适合的商品。
"""
        
        try:
            # 调用豆包大模型
            messages = [
                SystemMessage(content=self.SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.chat(messages)
            logger.info(f"LLM选品响应: {response[:200]}...")
            
            # 尝试解析JSON响应
            try:
                # 清理响应内容
                cleaned_response = response.strip()
                
                # 提取JSON（可能在代码块中）
                json_str = cleaned_response
                if "```json" in cleaned_response:
                    json_start = cleaned_response.find("```json") + 7
                    json_end = cleaned_response.rfind("```")  # 使用rfind找最后一个
                    json_str = cleaned_response[json_start:json_end].strip()
                elif "```" in cleaned_response:
                    json_start = cleaned_response.find("```") + 3
                    json_end = cleaned_response.rfind("```")
                    json_str = cleaned_response[json_start:json_end].strip()
                
                # 使用strict=False允许控制字符
                result = json.loads(json_str, strict=False)
                
                # 标准化返回格式
                return {
                    "platform": platform,
                    "site": site,
                    "category": category,
                    "total": len(result.get("recommendations", [])),
                    "analysis": result.get("analysis", ""),
                    "products": result.get("recommendations", []),
                    "summary": result.get("summary", {})
                }
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON解析失败: {e}")
                # 返回LLM原始响应
                return {
                    "platform": platform,
                    "site": site,
                    "category": category,
                    "total": count,
                    "analysis": response,
                    "products": [],
                    "summary": {
                        "recommendation": "AI分析完成，请查看分析报告"
                    }
                }
                
        except Exception as e:
            logger.error(f"选品失败: {e}")
            # 如果LLM调用失败，返回友好的错误信息
            return {
                "platform": platform,
                "site": site,
                "category": category,
                "total": 0,
                "analysis": f"选品分析遇到问题: {str(e)}",
                "products": [],
                "summary": {
                    "recommendation": "请检查AI服务配置"
                }
            }
    
    async def analyze_competition(
        self,
        product_name: str,
        platform: str = "tiktok"
    ) -> Dict[str, Any]:
        """竞品分析"""
        return {
            "product_name": product_name,
            "platform": platform,
            "competitors": [
                {
                    "name": f"竞品{i+1}",
                    "price": 25.99 + i * 3,
                    "sales": 1000 + i * 200,
                    "rating": 4.5 + i * 0.1,
                    "reviews": 500 + i * 100
                }
                for i in range(5)
            ],
            "market_analysis": {
                "avg_price": 28.5,
                "price_range": [19.99, 39.99],
                "avg_rating": 4.6,
                "market_share": "分散"
            },
            "opportunities": [
                "价格竞争空间大",
                "产品差异化机会",
                "服务升级空间"
            ]
        }


# ============ Listing优化智能体 ============

class ListingOptimizationAgent:
    """Listing优化智能体 - 使用豆包大模型"""
    
    SYSTEM_PROMPT = """你是一位专业的跨境电商Listing优化专家，精通TikTok Shop、Amazon、Shopee等平台的商品Listing优化。

你的任务是根据商品信息，生成高质量的Listing内容，包括：
1. 吸引人的标题 - 包含关键词、卖点、情感元素
2. 详细的产品描述 - 突出卖点、解决客户痛点
3. 五点描述/Highlights - 简洁有力的产品亮点
4. 标签 - TikTok风格的hashtag标签
5. 关键词优化建议

输出格式要求：
{
  "title": "主标题（英文）",
  "title_localized": {
    "en": "英文标题",
    "id": "印尼语标题", 
    "th": "泰语标题"
  },
  "description": "详细描述（英文）",
  "highlights": ["亮点1", "亮点2", "亮点3", "亮点4", "亮点5"],
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"],
  "seo_tips": "SEO优化建议"
}"""
    
    def __init__(self):
        self.name = "Listing优化智能体"
        self.description = "优化商品标题、描述、关键词等"
        self.llm = LLMService.for_agent("listing_optimization", temperature=0.7)
    
    async def optimize_listing(
        self,
        product_info: Dict[str, Any],
        platform: str = "tiktok",
        language: str = "en",
        keywords: List[str] = None
    ) -> Dict[str, Any]:
        """
        优化Listing - 调用豆包大模型
        
        Args:
            product_info: 商品信息
            platform: 平台
            language: 语言
            keywords: 目标关键词
            
        Returns:
            优化后的Listing
        """
        logger.info(f"开始AI Listing优化: {platform}/{product_info.get('name', '商品')}")
        
        # 构建商品信息描述
        product_name = product_info.get("name", "商品")
        category = product_info.get("category", "")
        price = product_info.get("price", "")
        features = product_info.get("features", [])
        target_audience = product_info.get("target_audience", "")
        
        # 构建提示词
        prompt = f"""请为以下商品优化Listing内容：

商品名称: {product_name}
商品类目: {category}
售价: {price}
目标受众: {target_audience or '年轻消费者'}
目标平台: {platform.upper()}
目标语言: {language}

商品特点:
{chr(10).join([f"- {f}" for f in features]) if features else "- 高性价比\n- 质量优良\n- 实用性强"}

目标关键词: {', '.join(keywords) if keywords else 'trending, popular, quality, affordable'}

请生成一套完整的、高质量的Listing内容，包括标题、描述、卖点、标签等。确保内容：
1. 符合平台风格（TikTok偏向短视频种草风格）
2. 包含情感营销元素
3. SEO友好，包含搜索关键词
4. 突出产品核心卖点
"""
        
        try:
            # 调用豆包大模型
            messages = [
                SystemMessage(content=self.SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.chat(messages)
            logger.info(f"LLM Listing优化响应: {response[:200]}...")
            
            # 解析JSON响应
            try:
                if "```json" in response:
                    json_start = response.find("```json") + 7
                    json_end = response.find("```", json_start)
                    result = json.loads(response[json_start:json_end].strip())
                elif "```" in response:
                    json_start = response.find("```") + 3
                    json_end = response.find("```", json_start)
                    result = json.loads(response[json_start:json_end].strip())
                else:
                    result = json.loads(response)
                
                # 添加SEO评分
                seo_score = self._calculate_seo_score(result, keywords or [])
                result["seo_score"] = seo_score
                
                return result
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON解析失败: {e}")
                # 返回原始响应作为描述
                return {
                    "title": product_name,
                    "title_localized": {"en": product_name},
                    "description": response,
                    "highlights": ["Premium Quality", "Fast Delivery", "Best Seller"],
                    "tags": ["#trending", "#viral", "#quality"],
                    "seo_score": 70
                }
                
        except Exception as e:
            logger.error(f"Listing优化失败: {e}")
            return {
                "title": product_name,
                "title_localized": {"en": product_name},
                "description": f"Product optimization failed: {str(e)}",
                "highlights": [],
                "tags": [],
                "seo_score": 0,
                "error": str(e)
            }
    
    def _calculate_seo_score(self, listing: Dict, keywords: List[str]) -> int:
        """计算SEO评分"""
        score = 50  # 基础分
        
        # 标题长度适中 (30-80字符)
        title = listing.get("title", "")
        if 30 <= len(title) <= 80:
            score += 15
        
        # 包含关键词
        title_lower = title.lower()
        for kw in keywords:
            if kw.lower() in title_lower:
                score += 5
        
        # 描述完整
        if len(listing.get("description", "")) > 200:
            score += 15
        
        # 有标签
        if len(listing.get("tags", [])) >= 5:
            score += 10
        
        return min(score, 100)
    
    async def suggest_keywords(
        self,
        product_name: str,
        platform: str = "tiktok",
        category: str = None
    ) -> List[Dict[str, Any]]:
        """
        关键词建议 - 调用豆包大模型
        
        Args:
            product_name: 商品名称
            platform: 平台
            category: 商品类目
            
        Returns:
            关键词列表
        """
        logger.info(f"开始AI关键词建议: {product_name}/{platform}")
        
        prompt = f"""请为以下商品推荐搜索关键词：

商品名称: {product_name}
目标平台: {platform.upper()}
商品类目: {category or '通用'}

请分析该商品的目标受众和搜索习惯，推荐适合的关键词/标签。

输出格式（JSON数组）：
[
  {{"keyword": "关键词", "search_volume": 搜索量估算, "competition": "竞争程度(low/medium/high)", "reason": "推荐理由"}}
]

请提供8-12个关键词，覆盖：
- 核心词（产品名称）
- 长尾词（产品+特性）
- 趋势词（当前热门）
- 场景词（使用场景）

搜索量估算请使用相对数值（1-100），不要使用具体数字。
"""
        
        try:
            messages = [
                SystemMessage(content="你是一位专业的跨境电商关键词研究专家，精通TikTok Shop、Amazon等平台的搜索算法和用户行为分析。"),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.chat(messages)
            logger.info(f"LLM关键词建议响应: {response[:200]}...")
            
            # 解析JSON响应
            try:
                if "```json" in response:
                    json_start = response.find("```json") + 7
                    json_end = response.find("```", json_start)
                    keywords = json.loads(response[json_start:json_end].strip())
                elif "```" in response:
                    json_start = response.find("```") + 3
                    json_end = response.find("```", json_start)
                    keywords = json.loads(response[json_start:json_end].strip())
                else:
                    keywords = json.loads(response)
                
                # 确保返回的是列表
                if isinstance(keywords, dict):
                    keywords = keywords.get("keywords", [keywords])
                
                return keywords
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON解析失败: {e}")
                # 返回基础关键词
                return [
                    {"keyword": product_name, "search_volume": 80, "competition": "medium", "reason": "核心词"},
                    {"keyword": f"{product_name} trending", "search_volume": 60, "competition": "low", "reason": "趋势词"},
                    {"keyword": f"best {product_name}", "search_volume": 50, "competition": "high", "reason": "热门词"},
                ]
                
        except Exception as e:
            logger.error(f"关键词建议失败: {e}")
            return []


# ============ 智能定价工具 ============

class PricingTool:
    """智能定价工具"""
    
    def __init__(self):
        self.name = "智能定价工具"
        self.description = "基于成本+利润+竞品计算建议售价"
    
    def calculate_price(
        self,
        cost_price: float,
        domestic_shipping: float = 0,
        first_mile_shipping: float = 0,
        platform_commission_rate: float = 0.05,
        ad_cost_rate: float = 0.10,
        target_profit_rate: float = 0.30,
        competitor_prices: List[float] = None
    ) -> Dict[str, Any]:
        """
        计算建议售价
        
        Args:
            cost_price: 采购价
            domestic_shipping: 国内运费
            first_mile_shipping: 头程运费
            platform_commission_rate: 平台佣金率
            ad_cost_rate: 广告成本占比
            target_profit_rate: 目标利润率
            competitor_prices: 竞品价格列表
            
        Returns:
            定价建议
        """
        # 计算总成本
        total_cost = cost_price + domestic_shipping + first_mile_shipping
        
        # 计算目标售价（基于成本+利润）
        target_price = total_cost / (1 - platform_commission_rate - ad_cost_rate - target_profit_rate)
        
        # 竞品参考
        competitor_reference = None
        if competitor_prices:
            avg_competitor_price = sum(competitor_prices) / len(competitor_prices)
            min_competitor_price = min(competitor_prices)
            max_competitor_price = max(competitor_prices)
            competitor_reference = {
                "avg_price": avg_competitor_price,
                "min_price": min_competitor_price,
                "max_price": max_competitor_price,
                "suggested_max": avg_competitor_price * 1.1  # 不超过市场价10%
            }
        
        # 最终建议售价
        if competitor_reference:
            final_price = min(target_price, competitor_reference["suggested_max"])
        else:
            final_price = target_price
        
        # 计算实际利润
        actual_profit = final_price - total_cost - final_price * (platform_commission_rate + ad_cost_rate)
        actual_profit_rate = actual_profit / final_price
        
        return {
            "cost_breakdown": {
                "purchase_price": cost_price,
                "domestic_shipping": domestic_shipping,
                "first_mile_shipping": first_mile_shipping,
                "total_cost": total_cost
            },
            "price_calculation": {
                "platform_commission": final_price * platform_commission_rate,
                "ad_cost": final_price * ad_cost_rate,
                "target_profit": final_price * target_profit_rate,
            },
            "suggested_price": round(final_price, 2),
            "target_price": round(target_price, 2),
            "competitor_reference": competitor_reference,
            "profit_analysis": {
                "gross_profit": round(actual_profit, 2),
                "profit_rate": round(actual_profit_rate * 100, 2),
                "meets_target": actual_profit_rate >= target_profit_rate
            },
            "recommendations": self._generate_recommendations(
                actual_profit_rate,
                target_profit_rate,
                competitor_reference
            )
        }
    
    def _generate_recommendations(
        self,
        actual_profit_rate: float,
        target_profit_rate: float,
        competitor_reference: Dict
    ) -> List[str]:
        """生成定价建议"""
        recommendations = []
        
        if actual_profit_rate < target_profit_rate:
            recommendations.append(f"当前利润率{actual_profit_rate:.1%}低于目标{target_profit_rate:.0%}，建议优化成本或调整定价策略")
        
        if competitor_reference:
            recommendations.append(f"市场均价${competitor_reference['avg_price']:.2f}，建议定价不高于${competitor_reference['suggested_max']:.2f}")
        
        recommendations.append("建议定期监控竞品价格，及时调整定价")
        recommendations.append("可考虑设置优惠券或促销活动吸引买家")
        
        return recommendations


# ============ 广告投放智能体 ============

class AdvertisingAgent:
    """广告投放智能体 - 使用豆包大模型"""
    
    SYSTEM_PROMPT = """你是一位专业的跨境电商广告投放专家，精通TikTok Shop、Amazon等平台的广告投放策略。

你的任务是根据商品信息，设计完整的广告投放方案，包括：
1. 广告文案 - 吸引眼球的标题和描述
2. 关键词策略 - 搜索关键词和出价策略
3. 受众定向 - 目标人群画像
4. 投放策略 - 预算分配、时间安排
5. 风控策略 - 预算上限、暂停条件

输出格式：
{
  "ad_copy": {
    "headline": "广告标题",
    "description": "广告描述",
    "call_to_action": "行动号召按钮文案"
  },
  "keywords": [
    {"keyword": "关键词", "match_type": "匹配方式", "suggested_bid": 出价}
  ],
  "targeting": {
    "age_range": "年龄段",
    "gender": "性别",
    "interests": ["兴趣标签"],
    "locations": ["投放地区"]
  },
  "budget_strategy": {
    "daily_budget": 建议日预算,
    "bidding_strategy": "出价策略",
    "schedule": "投放时段建议"
  },
  "optimization_tips": ["优化建议1", "优化建议2"]
}"""
    
    def __init__(self):
        self.name = "广告投放智能体"
        self.description = "创建和优化广告投放计划"
        self.llm = LLMService.for_agent("advertising", temperature=0.7)
    
    async def create_ad_campaign(
        self,
        product_id: str,
        product_name: str = None,
        platform: str = "tiktok",
        daily_budget: float = 100,
        target_acos: float = 0.20,
        keywords: List[str] = None,
        category: str = None
    ) -> Dict[str, Any]:
        """
        创建广告计划 - 调用豆包大模型
        
        Args:
            product_id: 商品ID
            product_name: 商品名称
            platform: 平台
            daily_budget: 日预算
            target_acos: 目标ACOS
            keywords: 关键词
            category: 商品类目
            
        Returns:
            广告计划详情
        """
        logger.info(f"开始AI广告计划创建: {product_name or product_id}/{platform}")
        
        prompt = f"""请为以下商品设计完整的广告投放方案：

商品ID: {product_id}
商品名称: {product_name or '未知商品'}
商品类目: {category or '通用'}
目标平台: {platform.upper()}
日预算: ${daily_budget}
目标ACOS: {target_acos * 100}%

已有关键词: {', '.join(keywords) if keywords else '无'}

请设计一套完整的广告方案，包括：
1. 吸引人的广告文案（符合平台风格）
2. 关键词和出价策略
3. 目标人群定向
4. 预算分配策略
5. 优化建议

确保方案具有可执行性，预算分配合理。
"""
        
        try:
            messages = [
                SystemMessage(content=self.SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.chat(messages)
            logger.info(f"LLM广告计划响应: {response[:200]}...")
            
            # 解析JSON响应
            try:
                if "```json" in response:
                    json_start = response.find("```json") + 7
                    json_end = response.find("```", json_start)
                    ad_plan = json.loads(response[json_start:json_end].strip())
                elif "```" in response:
                    json_start = response.find("```") + 3
                    json_end = response.find("```", json_start)
                    ad_plan = json.loads(response[json_start:json_end].strip())
                else:
                    ad_plan = json.loads(response)
                
                # 构建返回格式
                campaign_id = f"CMP{int(datetime.now().timestamp())}"
                
                return {
                    "campaign_id": campaign_id,
                    "product_id": product_id,
                    "product_name": product_name,
                    "platform": platform,
                    "daily_budget": daily_budget,
                    "target_acos": target_acos,
                    "campaign_name": ad_plan.get("ad_copy", {}).get("headline", f"Campaign - {product_name or product_id}"),
                    "ad_copy": ad_plan.get("ad_copy", {
                        "headline": f"Shop {product_name or 'Our Products'} Now!",
                        "description": "High quality, fast delivery",
                        "call_to_action": "Buy Now"
                    }),
                    "keywords": ad_plan.get("keywords", [
                        {"keyword": "product", "match_type": "broad", "suggested_bid": daily_budget * 0.02},
                        {"keyword": "trending", "match_type": "phrase", "suggested_bid": daily_budget * 0.03}
                    ]),
                    "targeting": ad_plan.get("targeting", {
                        "age_range": "18-44",
                        "gender": "all",
                        "interests": ["shopping", "online shopping"],
                        "locations": ["Indonesia", "Thailand"]
                    }),
                    "budget_strategy": ad_plan.get("budget_strategy", {
                        "daily_budget": daily_budget,
                        "bidding_strategy": "target_acos",
                        "schedule": "Full day"
                    }),
                    "optimization_tips": ad_plan.get("optimization_tips", []),
                    "schedule": {
                        "start_date": datetime.now().strftime("%Y-%m-%d"),
                        "end_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
                    },
                    "risk_controls": {
                        "max_daily_spend": daily_budget * 1.2,
                        "min_roi": target_acos * 3,
                        "pause_on_low_performance": True
                    }
                }
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON解析失败: {e}")
                # 返回基础结构
                return {
                    "campaign_id": f"CMP{int(datetime.now().timestamp())}",
                    "product_id": product_id,
                    "platform": platform,
                    "daily_budget": daily_budget,
                    "ad_copy": {"headline": response[:100], "description": ""},
                    "error": "广告方案生成失败"
                }
                
        except Exception as e:
            logger.error(f"广告计划创建失败: {e}")
            return {
                "campaign_id": f"CMP{int(datetime.now().timestamp())}",
                "product_id": product_id,
                "error": str(e)
            }
    
    async def optimize_campaign(
        self,
        campaign_id: str,
        performance_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        优化广告计划 - 调用豆包大模型
        
        Args:
            campaign_id: 广告计划ID
            performance_data: 投放数据
            
        Returns:
            优化建议
        """
        logger.info(f"开始AI广告优化: {campaign_id}")
        
        prompt = f"""请分析以下广告的投放数据，并给出优化建议：

广告计划ID: {campaign_id}

投放数据：
- 花费: ${performance_data.get('spend', 0)}
- 销售额: ${performance_data.get('revenue', 0)}
- 订单数: {performance_data.get('orders', 0)}
- 点击数: {performance_data.get('clicks', 0)}
- 展示数: {performance_data.get('impressions', 0)}
- ACOS: {performance_data.get('acos', 0):.2f}%
- CTR: {performance_data.get('ctr', 0):.2f}%

请分析问题并给出具体优化建议：

输出格式（JSON）：
{{
  "analysis": "数据分析报告",
  "optimizations": [
    {{"type": "优化类型", "action": "具体动作", "target": "目标", "reason": "理由"}}
  ],
  "budget_recommendation": {{
    "action": "调整动作", 
    "reason": "理由"
  }}
}}"""
        
        try:
            messages = [
                SystemMessage(content=self.SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.chat(messages)
            
            # 解析JSON响应
            try:
                if "```json" in response:
                    json_start = response.find("```json") + 7
                    json_end = response.find("```", json_start)
                    result = json.loads(response[json_start:json_end].strip())
                else:
                    result = json.loads(response)
                
                return {
                    "campaign_id": campaign_id,
                    "analysis": result.get("analysis", ""),
                    "optimizations": result.get("optimizations", []),
                    "budget_recommendation": result.get("budget_recommendation", {
                        "action": "maintain",
                        "reason": "数据不足"
                    })
                }
                
            except json.JSONDecodeError:
                return {
                    "campaign_id": campaign_id,
                    "optimizations": [
                        {"type": "bid", "action": "adjust", "reason": "建议根据ACOS调整出价"}
                    ]
                }
                
        except Exception as e:
            logger.error(f"广告优化失败: {e}")
            return {
                "campaign_id": campaign_id,
                "optimizations": [],
                "error": str(e)
            }


# ============ AI客服智能体 ============

class CustomerServiceAgent:
    """AI客服智能体 - 使用豆包大模型"""
    
    SYSTEM_PROMPT = """你是一位专业、友好的跨境电商客服代表，服务于TikTok Shop等电商平台的买家。

你的特点：
1. 专业 - 熟悉产品、物流、售后等各环节
2. 友好 - 使用温暖、亲切的语气
3. 高效 - 简洁明了地回答问题
4. 灵活 - 根据买家需求调整回复风格

支持的语言：
- 英语 (en) - 官方语言
- 印尼语 (id) - 印尼站点买家
- 泰语 (th) - 泰国站点买家

回复要求：
1. 根据买家的语言使用对应语言回复
2. 如果不确定信息，诚实告知并承诺跟进
3. 对于投诉，保持耐心和同理心
4. 适时使用表情符号增加亲切感（但不要过度）

输出格式（JSON）：
{
  "intent": "买家意图分类(shipping/return/product/discount/complaint/inquiry)",
  "sentiment": "买家情绪(positive/neutral/negative)",
  "reply": "回复内容（使用买家语言）",
  "suggestions": ["后续建议1", "后续建议2"],
  "need_escalation": false
}"""
    
    def __init__(self):
        self.name = "AI客服智能体"
        self.description = "多语种智能客服，自动回复买家咨询"
        self.llm = LLMService.for_agent("customer_service", temperature=0.7)
    
    async def generate_reply(
        self,
        message: str,
        language: str = "en",
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        生成客服回复 - 调用豆包大模型
        
        Args:
            message: 买家消息
            language: 目标语言
            context: 上下文信息（订单信息、产品信息等）
            
        Returns:
            AI回复
        """
        logger.info(f"开始AI客服回复: [{language}] {message[:50]}...")
        
        # 构建上下文描述
        context_info = ""
        if context:
            order_id = context.get("order_id", "")
            product_name = context.get("product_name", "")
            order_status = context.get("order_status", "")
            context_info = f"""
买家上下文：
- 订单号: {order_id}
- 商品: {product_name}
- 订单状态: {order_status}
"""
        
        prompt = f"""{context_info}
买家消息: "{message}"

请分析买家意图并生成合适的回复。回复应该：
1. 使用买家使用的语言（{language}）
2. 简洁、专业、友好
3. 解决买家的问题或提供有用信息

请输出JSON格式的回复。
"""
        
        try:
            messages = [
                SystemMessage(content=self.SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.chat(messages)
            logger.info(f"LLM客服回复响应: {response[:200]}...")
            
            # 解析JSON响应
            try:
                if "```json" in response:
                    json_start = response.find("```json") + 7
                    json_end = response.find("```", json_start)
                    result = json.loads(response[json_start:json_end].strip())
                elif "```" in response:
                    json_start = response.find("```") + 3
                    json_end = response.find("```", json_start)
                    result = json.loads(response[json_start:json_end].strip())
                else:
                    result = json.loads(response)
                
                return {
                    "intent": result.get("intent", "inquiry"),
                    "sentiment": result.get("sentiment", "neutral"),
                    "reply": result.get("reply", response),
                    "suggestions": result.get("suggestions", []),
                    "need_escalation": result.get("need_escalation", False)
                }
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON解析失败: {e}")
                return {
                    "intent": "inquiry",
                    "reply": response,
                    "need_escalation": False
                }
                
        except Exception as e:
            logger.error(f"客服回复生成失败: {e}")
            return {
                "intent": "error",
                "reply": f"Sorry, we're experiencing technical issues. Please try again later.",
                "need_escalation": True,
                "error": str(e)
            }
    
    async def handle_dispute(
        self,
        dispute_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        处理纠纷 - 调用豆包大模型
        
        Args:
            dispute_info: 纠纷信息
            
        Returns:
            处理建议
        """
        logger.info(f"开始AI纠纷处理: {dispute_info.get('type', 'unknown')}")
        
        prompt = f"""请分析以下纠纷案例并给出处理建议：

纠纷信息：
- 纠纷类型: {dispute_info.get('type', '未知')}
- 订单金额: ${dispute_info.get('order_value', 0)}
- 买家诉求: {dispute_info.get('buyer_claim', '未知')}
- 卖家说明: {dispute_info.get('seller_reason', '未知')}
- 相关证据: {dispute_info.get('evidence', '无')}

请给出处理建议：
1. 是否自动处理/转人工
2. 退款金额建议
3. 处理理由

输出格式（JSON）：
{{
  "action": "auto_refund/escalate/negotiate",
  "refund_amount": 退款金额（如适用）,
  "reason": "处理理由",
  "response_to_buyer": "给买家的回复",
  "priority": "low/medium/high"
}}"""
        
        try:
            messages = [
                SystemMessage(content=self.SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.chat(messages)
            
            # 解析JSON响应
            try:
                if "```json" in response:
                    json_start = response.find("```json") + 7
                    json_end = response.find("```", json_start)
                    result = json.loads(response[json_start:json_end].strip())
                else:
                    result = json.loads(response)
                
                return {
                    "action": result.get("action", "escalate"),
                    "refund_amount": result.get("refund_amount", dispute_info.get("order_value", 0)),
                    "reason": result.get("reason", ""),
                    "response_to_buyer": result.get("response_to_buyer", ""),
                    "priority": result.get("priority", "medium")
                }
                
            except json.JSONDecodeError:
                # 默认转人工处理
                return {
                    "action": "escalate",
                    "reason": "AI分析失败，转人工处理",
                    "priority": "medium"
                }
                
        except Exception as e:
            logger.error(f"纠纷处理失败: {e}")
            return {
                "action": "escalate",
                "reason": str(e),
                "priority": "high"
            }


# ============ 数据复盘智能体 ============

class DataReviewAgent:
    """数据复盘智能体 - 使用豆包大模型"""
    
    SYSTEM_PROMPT = """你是一位专业的跨境电商数据分析师，精通TikTok Shop、Amazon等平台的数据分析。

你的任务是：
1. 分析销售数据，发现问题和机会
2. 识别异常数据和趋势
3. 生成可执行的优化建议
4. 评估广告投放效果

分析维度：
- 销售趋势：增长/下降分析
- 商品表现：爆款/滞销商品识别
- 利润分析：利润率是否达标
- 广告效果：ROAS、ACOS、CPC等指标
- 库存健康：是否有积压或断货风险

输出要求：
- 数据驱动，客观分析
- 突出关键发现
- 提供可执行的建议
- 区分紧急程度"""
    
    def __init__(self):
        self.name = "数据复盘智能体"
        self.description = "分析销售数据，生成优化建议"
        self.llm = LLMService.for_agent("data_review", temperature=0.5)
    
    async def generate_report(
        self,
        start_date: datetime,
        end_date: datetime,
        platform: str = None,
        sales_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        生成分析报告 - 调用豆包大模型
        
        Args:
            start_date: 开始日期
            end_date: 结束日期
            platform: 平台
            sales_data: 销售数据（可选，如果不提供则使用模拟数据）
            
        Returns:
            分析报告
        """
        logger.info(f"开始AI数据复盘: {start_date} ~ {end_date}")
        
        # 构建数据描述
        data_description = ""
        if sales_data:
            data_description = f"""
销售数据：
- 总销售额: ${sales_data.get('total_sales', 0)}
- 总订单数: {sales_data.get('total_orders', 0)}
- 总利润: ${sales_data.get('total_profit', 0)}
- 利润率: {sales_data.get('profit_rate', 0):.1f}%
- 平均客单价: ${sales_data.get('avg_order_value', 0)}

广告数据：
- 广告花费: ${sales_data.get('ad_spend', 0)}
- 广告销售额: ${sales_data.get('ad_revenue', 0)}
- ROAS: {sales_data.get('roas', 0):.2f}
- ACOS: {sales_data.get('acos', 0):.2f}%

商品数据：
{json.dumps(sales_data.get('products', [])[:10], ensure_ascii=False, indent=2)}
"""
        else:
            data_description = "无详细销售数据，将基于通用跨境电商场景进行分析。"
        
        prompt = f"""请分析以下时间段的运营数据，并生成详细的数据复盘报告：

分析周期: {start_date.strftime('%Y-%m-%d')} ~ {end_date.strftime('%Y-%m-%d')}
目标平台: {platform or '全平台'}
{data_description}

请进行全面的数据分析，包括：
1. 核心指标汇总（销售额、订单量、利润等）
2. 趋势分析（环比变化）
3. 商品表现分析（TOP商品、滞销商品）
4. 广告效果分析
5. 问题识别（异常数据）
6. 优化建议

输出格式（JSON）：
{{
  "period": {{"start": "开始日期", "end": "结束日期"}},
  "summary": {{
    "total_sales": 总销售额,
    "total_orders": 总订单数,
    "total_profit": 总利润,
    "profit_rate": 利润率,
    "avg_order_value": 平均客单价,
    "sales_change": 销售额环比变化,
    "order_change": 订单环比变化
  }},
  "top_products": [
    {{"name": "商品名称", "sales": 销售额, "orders": 订单数, "profit_rate": 利润率}}
  ],
  "issues": [
    {{"type": "问题类型(low_stock/low_roi/high_refund等)", "product": "商品名称", "severity": "high/medium/low", "suggestion": "处理建议"}}
  ],
  "recommendations": ["建议1", "建议2", "建议3"]
}}"""
        
        try:
            messages = [
                SystemMessage(content=self.SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.chat(messages)
            logger.info(f"LLM数据复盘响应: {response[:200]}...")
            
            # 解析JSON响应
            try:
                if "```json" in response:
                    json_start = response.find("```json") + 7
                    json_end = response.find("```", json_start)
                    report = json.loads(response[json_start:json_end].strip())
                elif "```" in response:
                    json_start = response.find("```") + 3
                    json_end = response.find("```", json_start)
                    report = json.loads(response[json_start:json_end].strip())
                else:
                    report = json.loads(response)
                
                # 确保必要的字段存在
                report.setdefault("period", {
                    "start": start_date.strftime("%Y-%m-%d"),
                    "end": end_date.strftime("%Y-%m-%d")
                })
                report.setdefault("summary", {})
                report.setdefault("issues", [])
                report.setdefault("recommendations", [])
                
                return report
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON解析失败: {e}")
                return {
                    "period": {
                        "start": start_date.strftime("%Y-%m-%d"),
                        "end": end_date.strftime("%Y-%m-%d")
                    },
                    "summary": {},
                    "analysis": response,
                    "issues": [],
                    "recommendations": ["请查看详细分析报告"]
                }
                
        except Exception as e:
            logger.error(f"数据复盘失败: {e}")
            return {
                "period": {
                    "start": start_date.strftime("%Y-%m-%d"),
                    "end": end_date.strftime("%Y-%m-%d")
                },
                "summary": {},
                "issues": [],
                "recommendations": [],
                "error": str(e)
            }
    
    async def generate_action_items(
        self,
        report: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        生成行动项 - 调用豆包大模型
        
        Args:
            report: 分析报告
            
        Returns:
            行动项列表
        """
        logger.info(f"开始AI生成行动项")
        
        prompt = f"""基于以下数据复盘报告，生成可执行的行动项：

报告摘要：
{json.dumps(report.get('summary', {}), ensure_ascii=False, indent=2)}

发现的问题：
{json.dumps(report.get('issues', []), ensure_ascii=False, indent=2)}

建议：
{chr(10).join([f"- {r}" for r in report.get('recommendations', [])])}

请将建议转化为具体的行动项，格式如下：
- 明确的责任人
- 可执行的步骤
- 优先级和紧急程度

输出格式（JSON数组）：
[
  {{"priority": "high/medium/low", "type": "行动类型(inventory/ad/listing/pricing等)", "description": "行动描述", "auto_execute": false/true, "deadline": "完成期限"}}
]"""
        
        try:
            messages = [
                SystemMessage(content=self.SYSTEM_PROMPT),
                HumanMessage(content=prompt)
            ]
            
            response = await self.llm.chat(messages)
            
            # 解析JSON响应
            try:
                if "```json" in response:
                    json_start = response.find("```json") + 7
                    json_end = response.find("```", json_start)
                    action_items = json.loads(response[json_start:json_end].strip())
                elif "```" in response:
                    json_start = response.find("```") + 3
                    json_end = response.find("```", json_start)
                    action_items = json.loads(response[json_start:json_end].strip())
                else:
                    action_items = json.loads(response)
                
                # 确保是数组
                if isinstance(action_items, dict):
                    action_items = action_items.get("items", [action_items])
                
                return action_items
                
            except json.JSONDecodeError:
                return [
                    {"priority": "medium", "type": "review", "description": "查看详细报告", "auto_execute": False}
                ]
                
        except Exception as e:
            logger.error(f"行动项生成失败: {e}")
            return []


# ============ 全局实例 ============

product_selection_agent = ProductSelectionAgent()
listing_optimization_agent = ListingOptimizationAgent()
pricing_tool = PricingTool()
advertising_agent = AdvertisingAgent()
customer_service_agent = CustomerServiceAgent()
data_review_agent = DataReviewAgent()
