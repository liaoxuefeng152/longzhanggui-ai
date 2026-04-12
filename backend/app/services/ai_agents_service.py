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
                # 提取JSON（可能在代码块中）
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
    """Listing优化智能体"""
    
    def __init__(self):
        self.name = "Listing优化智能体"
        self.description = "优化商品标题、描述、关键词等"
    
    async def optimize_listing(
        self,
        product_info: Dict[str, Any],
        platform: str = "tiktok",
        language: str = "en",
        keywords: List[str] = None
    ) -> Dict[str, Any]:
        """
        优化Listing
        
        Args:
            product_info: 商品信息
            platform: 平台
            language: 语言
            keywords: 目标关键词
            
        Returns:
            优化后的Listing
        """
        product_name = product_info.get("name", "商品")
        
        # 模拟生成优化后的Listing
        if platform == "tiktok":
            listing = {
                "title": f"{product_name} - Premium Quality with Fast Delivery",
                "title_localized": {
                    "en": f"{product_name} - Premium Quality with Fast Delivery",
                    "id": f"{product_name} - Kualitas Premium dengan Pengiriman Cepat",
                    "th": f"{product_name} - คุณภาพระดับพรีเมียม ส่งเร็ว"
                },
                "description": f"""
🔥 {product_name} - Your Perfect Choice!

✨ Features:
• Premium quality material
• Modern design
• Durable and long-lasting
• Perfect for daily use

📦 Package Includes:
• 1x {product_name}

🚚 Fast Shipping Available!
💬 Any questions? Feel free to contact us!
                """.strip(),
                "tags": ["#trending", "#viral", "#musthave", "#quality", "#" + product_name.replace(" ", "")],
                "highlights": [
                    "Premium Quality",
                    "Fast Delivery",
                    "Best Seller",
                    "Money Back Guarantee"
                ],
                "keywords": keywords or ["popular", "trending", "quality", "affordable"],
                "category_suggestion": "Home & Living",
                "seo_score": 85
            }
        else:  # amazon
            listing = {
                "title": f"{product_name} - Premium Quality with Multiple Colors Available",
                "bullet_points": [
                    f"【Premium Quality】Made with high-quality materials for durability and long-lasting use.",
                    f"【Modern Design】Sleek and stylish design that fits any home decor.",
                    f"【Easy to Use】Simple and intuitive operation for everyday convenience.",
                    f"【Versatile】Perfect for various occasions and uses.",
                    f"【Satisfaction Guaranteed】We stand behind our product with a 100% satisfaction guarantee."
                ],
                "description": f"""
<h2>About This Product</h2>
<p>Introducing our premium {product_name}, designed to exceed your expectations. Crafted with the finest materials and attention to detail, this product combines functionality with style.</p>

<h3>Key Features:</h3>
<ul>
<li>Premium quality construction</li>
<li>Modern, sleek design</li>
<li>Durable and reliable</li>
<li>Perfect for everyday use</li>
</ul>

<h3>What's in the Box:</h3>
<ul>
<li>1x {product_name}</li>
<li>User Manual</li>
</ul>
                """.strip(),
                "search_terms": keywords or ["quality", "popular", "best seller"],
                "target_audience": "Adults looking for quality home products",
                "seo_score": 88
            }
        
        return listing
    
    async def suggest_keywords(
        self,
        product_name: str,
        platform: str = "tiktok"
    ) -> List[Dict[str, Any]]:
        """关键词建议"""
        return [
            {"keyword": product_name, "search_volume": 50000, "competition": "medium"},
            {"keyword": f"{product_name} quality", "search_volume": 30000, "competition": "low"},
            {"keyword": f"best {product_name}", "search_volume": 25000, "competition": "high"},
            {"keyword": f"{product_name} trending", "search_volume": 20000, "competition": "low"},
            {"keyword": f"{product_name} affordable", "search_volume": 15000, "competition": "medium"},
        ]


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
    """广告投放智能体"""
    
    def __init__(self):
        self.name = "广告投放智能体"
        self.description = "创建和优化广告投放计划"
    
    async def create_ad_campaign(
        self,
        product_id: str,
        platform: str = "tiktok",
        daily_budget: float = 100,
        target_acos: float = 0.20,
        keywords: List[str] = None
    ) -> Dict[str, Any]:
        """创建广告计划"""
        campaign_id = f"CMP{int(datetime.now().timestamp())}"
        
        return {
            "campaign_id": campaign_id,
            "product_id": product_id,
            "platform": platform,
            "daily_budget": daily_budget,
            "target_acos": target_acos,
            "campaign_name": f"Auto Campaign - {product_id}",
            "ad_groups": [
                {
                    "name": "Main Keywords",
                    "keywords": keywords or ["product", "quality", "best"],
                    "bid": 0.5,
                    "match_type": "broad"
                },
                {
                    "name": "Competitors",
                    "keywords": ["competitor brand"],
                    "bid": 0.8,
                    "match_type": "exact"
                }
            ],
            "targeting": {
                "age_range": "25-44",
                "gender": "all",
                "interests": ["shopping", "online deals"]
            },
            "schedule": {
                "start_date": datetime.now().strftime("%Y-%m-%d"),
                "end_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            },
            "risk_controls": {
                "max_daily_spend": daily_budget * 1.2,
                "min_roi": 1.0,
                "pause_on_low_performance": True
            }
        }
    
    async def optimize_campaign(
        self,
        campaign_id: str,
        performance_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """优化广告计划"""
        return {
            "campaign_id": campaign_id,
            "optimizations": [
                {
                    "type": "bid_adjustment",
                    "action": "increase",
                    "keywords": ["high_converter_1", "high_converter_2"],
                    "new_bid": 0.6
                },
                {
                    "type": "keyword_pause",
                    "action": "pause",
                    "keywords": ["low_performer_1"],
                    "reason": "ACOS过高"
                }
            ],
            "budget_recommendation": {
                "action": "maintain",
                "reason": "当前ROI表现良好"
            }
        }


# ============ AI客服智能体 ============

class CustomerServiceAgent:
    """AI客服智能体"""
    
    def __init__(self):
        self.name = "AI客服智能体"
        self.description = "多语种智能客服，自动回复买家咨询"
    
    async def generate_reply(
        self,
        message: str,
        language: str = "en",
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """生成客服回复"""
        # 模拟意图识别
        intent = self._detect_intent(message)
        
        # 生成回复
        reply_templates = {
            "shipping": {
                "en": "Thank you for your inquiry! 📦 Your order will be shipped within 24 hours. Standard delivery takes 5-7 business days. You can track your order using the link in your order confirmation email.",
                "id": "Terima kasih atas pertanyaan Anda! 📦 Pesanan Anda akan dikirim dalam waktu 24 jam. Pengiriman standar membutuhkan waktu 5-7 hari kerja.",
                "th": "ขอบคุณสำหรับการสอบถาม! 📦 คำสั่งซื้อของคุณจะถูกจัดส่งภายใน 24 ชั่วโมง การจัดส่งมาตรฐานใช้เวลา 5-7 วันทำการ"
            },
            "return": {
                "en": "We're sorry to hear you're having issues with your order. 😔 Our return policy allows returns within 7 days of delivery. Please provide your order number and we'll process your return request.",
                "id": "Kami menyesal mendengar Anda mengalami masalah dengan pesanan Anda. 😔 Kebijakan pengembalian kami memungkinkan pengembalian dalam waktu 7 hari.",
                "th": "เราขออภัยที่ได้ยินว่าคุณมีปัญหากับคำสั่งซื้อ นโยบายการคืนสินค้าของเราอนุญาตให้คืนได้ภายใน 7 วัน"
            },
            "product": {
                "en": "Thank you for your interest! 🌟 This product is made with premium quality materials. It's currently in stock and ready to ship. Do you have any specific questions about the product?",
                "id": "Terima kasih atas minat Anda! 🌟 Produk ini dibuat dengan bahan berkualitas premium. Saat ini tersedia dan siap dikirim.",
                "th": "ขอบคุณสำหรับความสนใจ! 🌟 ผลิตภัณฑ์นี้ทำจากวัสดุคุณภาพระดับพรีเมียม พร้อมส่งทันที"
            },
            "discount": {
                "en": "Great news! 🎉 We currently have a special promotion. Use code SAVE10 for 10% off your order. The promotion is valid until the end of this month!",
                "id": "Kabar baik! 🎉 Kami memiliki promosi khusus. Gunakan kode SAVE10 untuk diskon 10%.",
                "th": "ข่าวดี! 🎉 เรามีโปรโมชั่นพิเศษ ใช้โค้ด SAVE10 ลด 10%"
            },
            "default": {
                "en": "Thank you for your message! 💬 Our team will respond within 2 hours. Is there anything specific I can help you with?",
                "id": "Terima kasih atas pesan Anda! 💬 Tim kami akan merespons dalam waktu 2 jam.",
                "th": "ขอบคุณสำหรับข้อความของคุณ! 💬 ทีมของเราจะตอบภายใน 2 ชั่วโมง"
            }
        }
        
        reply = reply_templates.get(intent, reply_templates["default"]).get(language, reply_templates["default"]["en"])
        
        return {
            "intent": intent,
            "language": language,
            "reply": reply,
            "confidence": 0.95,
            "need_escalation": intent == "complaint"
        }
    
    def _detect_intent(self, message: str) -> str:
        """检测意图"""
        message_lower = message.lower()
        
        if any(kw in message_lower for kw in ["ship", "delivery", "track", "arrive", "when"]):
            return "shipping"
        elif any(kw in message_lower for kw in ["return", "refund", "money back", "cancel"]):
            return "return"
        elif any(kw in message_lower for kw in ["size", "color", "material", "quality", "specification"]):
            return "product"
        elif any(kw in message_lower for kw in ["discount", "coupon", "sale", "cheaper", "deal"]):
            return "discount"
        elif any(kw in message_lower for kw in ["complaint", "bad", "terrible", "broken", "wrong"]):
            return "complaint"
        else:
            return "default"
    
    async def handle_dispute(
        self,
        dispute_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """处理纠纷"""
        dispute_type = dispute_info.get("type", "general")
        order_value = dispute_info.get("order_value", 0)
        
        # 自动处理小额退款
        if order_value <= 50:
            return {
                "action": "auto_refund",
                "reason": "订单金额≤$50，自动退款",
                "refund_amount": order_value
            }
        else:
            return {
                "action": "escalate",
                "reason": "订单金额>$50，转人工处理",
                "priority": "high"
            }


# ============ 数据复盘智能体 ============

class DataReviewAgent:
    """数据复盘智能体"""
    
    def __init__(self):
        self.name = "数据复盘智能体"
        self.description = "分析销售数据，生成优化建议"
    
    async def generate_report(
        self,
        start_date: datetime,
        end_date: datetime,
        platform: str = None
    ) -> Dict[str, Any]:
        """生成分析报告"""
        # 模拟数据
        report = {
            "period": {
                "start": start_date.strftime("%Y-%m-%d"),
                "end": end_date.strftime("%Y-%m-%d")
            },
            "summary": {
                "total_sales": 15890.50,
                "total_orders": 328,
                "total_profit": 4767.15,
                "profit_rate": 30.0,
                "avg_order_value": 48.45
            },
            "trends": {
                "sales_trend": "up",
                "sales_change": "+15.3%",
                "order_trend": "up",
                "order_change": "+12.8%"
            },
            "top_products": [
                {"name": "Product A", "sales": 3500, "orders": 72, "profit_rate": 35},
                {"name": "Product B", "sales": 2800, "orders": 58, "profit_rate": 32},
                {"name": "Product C", "sales": 2200, "orders": 45, "profit_rate": 28},
            ],
            "top_categories": [
                {"category": "Electronics", "sales": 6500, "share": 40.9},
                {"category": "Home & Living", "sales": 5200, "share": 32.7},
                {"category": "Fashion", "sales": 4190, "share": 26.4},
            ],
            "ad_performance": {
                "total_spend": 1589.05,
                "total_revenue": 6356.20,
                "roas": 4.0,
                "cpa": 4.85,
                "ctr": 2.8
            },
            "issues": [
                {
                    "type": "low_stock",
                    "product": "Product D",
                    "severity": "high",
                    "suggestion": "库存不足，建议立即补货"
                },
                {
                    "type": "low_roi",
                    "product": "Product E",
                    "severity": "medium",
                    "suggestion": "ROI低于目标，建议暂停广告并优化Listing"
                }
            ],
            "recommendations": [
                "增加热销商品库存，避免断货",
                "优化Product E的Listing，提升转化率",
                "继续投放表现良好的广告计划",
                "关注竞争对手定价变化"
            ]
        }
        
        return report
    
    async def generate_action_items(
        self,
        report: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """生成行动项"""
        action_items = []
        
        for issue in report.get("issues", []):
            action_items.append({
                "priority": issue["severity"],
                "type": issue["type"],
                "description": issue["suggestion"],
                "auto_execute": issue["type"] in ["low_stock"],
                "status": "pending"
            })
        
        return action_items


# ============ 全局实例 ============

product_selection_agent = ProductSelectionAgent()
listing_optimization_agent = ListingOptimizationAgent()
pricing_tool = PricingTool()
advertising_agent = AdvertisingAgent()
customer_service_agent = CustomerServiceAgent()
data_review_agent = DataReviewAgent()
