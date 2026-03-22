"""
广告投放智能体
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
import operator
import json

from app.agents.base import AgentState


class AdvertisingState(TypedDict):
    """广告投放智能体状态"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    platform: str            # 平台：amazon_ads, facebook, google, tiktok
    product_name: str        # 商品名称
    budget: float            # 预算
    target_audience: dict    # 目标受众
    campaign_goal: str       # 广告目标：awareness, traffic, conversion
    keywords: list[str]      # 关键词
    campaign_structure: dict # 广告结构
    ad_creatives: list[dict] # 广告素材
    bidding_strategy: dict   # 出价策略
    performance_prediction: dict # 效果预测
    optimization_tips: str   # 优化建议
    next_action: str


class AdvertisingAgent:
    """广告投放智能体"""
    
    SYSTEM_PROMPT = """你是一位资深的电商广告投放专家，精通各大平台的广告系统和优化策略。

你的职责是：
1. 制定广告投放策略
2. 设计广告结构和素材
3. 优化出价和预算分配
4. 提升ROI和转化率

广告优化原则：
- 精准定位目标受众
- 合理分配预算
- 持续优化关键词和出价
- 测试不同广告创意
- 监控数据及时调整"""
    
    # 平台特性
    PLATFORM_FEATURES = {
        "amazon_ads": {
            "name": "亚马逊广告",
            "ad_types": ["Sponsored Products", "Sponsored Brands", "Sponsored Display"],
            "bidding_options": ["dynamic-down", "dynamic-up", "manual"],
            "targeting": ["keywords", "products", "categories", "audiences"],
            "tips": "关键词精准匹配，商品投放竞品拦截，品牌广告提升曝光"
        },
        "facebook": {
            "name": "Facebook广告",
            "ad_types": ["Image", "Video", "Carousel", "Collection"],
            "bidding_options": ["lowest_cost", "cost_cap", "bid_cap"],
            "targeting": ["demographics", "interests", "behaviors", "lookalike"],
            "tips": "利用相似受众扩展，测试多素材，优化落地页体验"
        },
        "google": {
            "name": "Google广告",
            "ad_types": ["Search", "Display", "Shopping", "Video"],
            "bidding_options": ["maximize_clicks", "maximize_conversions", "target_roas"],
            "targeting": ["keywords", "placements", "audiences", "topics"],
            "tips": "关键词分层管理，购物广告优化Feed，利用智能出价"
        },
        "tiktok": {
            "name": "TikTok广告",
            "ad_types": ["In-Feed", "TopView", "Branded Hashtag", "Spark Ads"],
            "bidding_options": ["CPM", "CPC", "OCPC", "CPA"],
            "targeting": ["interests", "behaviors", "hashtags", "creators"],
            "tips": "原生内容风格，热门音乐BGM，挑战赛互动，KOL合作"
        }
    }
    
    # 广告目标对应策略
    GOAL_STRATEGIES = {
        "awareness": {
            "focus": "曝光量和触达",
            "metrics": ["impressions", "reach", "frequency"],
            "bidding": "CPM",
            "tips": "扩大受众范围，品牌故事叙述"
        },
        "traffic": {
            "focus": "点击和访问",
            "metrics": ["clicks", "CTR", "CPC"],
            "bidding": "CPC",
            "tips": "优化广告文案，精准关键词"
        },
        "conversion": {
            "focus": "销售和转化",
            "metrics": ["conversions", "CPA", "ROAS"],
            "bidding": "CPA/ROAS",
            "tips": "精准受众定向，优化落地页"
        }
    }
    
    def __init__(
        self,
        model: str = "gpt-4o-mini",
        temperature: float = 0.5,
        api_key: str = None,
        base_url: str = None
    ):
        self.model = model
        self.temperature = temperature
        
        self.llm = ChatOpenAI(
            model=model,
            temperature=temperature,
            api_key=api_key,
            base_url=base_url
        )
        
        self.workflow = self._build_workflow()
        self.app = self.workflow.compile()
    
    def _build_workflow(self) -> StateGraph:
        """构建广告投放工作流"""
        workflow = StateGraph(AdvertisingState)
        
        # 添加节点
        workflow.add_node("analyze_market", self._analyze_market)
        workflow.add_node("design_campaign", self._design_campaign)
        workflow.add_node("create_ad_creatives", self._create_ad_creatives)
        workflow.add_node("setup_bidding", self._setup_bidding)
        workflow.add_node("predict_performance", self._predict_performance)
        
        # 设置入口
        workflow.set_entry_point("analyze_market")
        
        # 添加边
        workflow.add_edge("analyze_market", "design_campaign")
        workflow.add_edge("design_campaign", "create_ad_creatives")
        workflow.add_edge("create_ad_creatives", "setup_bidding")
        workflow.add_edge("setup_bidding", "predict_performance")
        workflow.add_edge("predict_performance", END)
        
        return workflow
    
    async def _analyze_market(self, state: AdvertisingState) -> dict:
        """分析市场和受众"""
        platform = state.get('platform', 'amazon_ads')
        platform_feature = self.PLATFORM_FEATURES.get(platform, self.PLATFORM_FEATURES['amazon_ads'])
        campaign_goal = state.get('campaign_goal', 'conversion')
        goal_strategy = self.GOAL_STRATEGIES.get(campaign_goal, self.GOAL_STRATEGIES['conversion'])
        
        prompt = f"""分析广告投放市场和受众：

商品：{state.get('product_name', '未指定')}
平台：{platform_feature['name']}
预算：${state.get('budget', 0):.2f}
广告目标：{campaign_goal}
目标受众：{json.dumps(state.get('target_audience', {}), ensure_ascii=False)}
关键词：{', '.join(state.get('keywords', []))}

平台特性：
- 广告类型：{', '.join(platform_feature['ad_types'])}
- 定向方式：{', '.join(platform_feature['targeting'])}
- 建议：{platform_feature['tips']}

请提供：
1. 市场竞争分析
2. 目标受众画像细化
3. 关键词策略建议
4. 预算分配建议
5. 预估效果范围"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "next_action": "design_campaign"
        }
    
    async def _design_campaign(self, state: AdvertisingState) -> dict:
        """设计广告结构"""
        platform = state.get('platform', 'amazon_ads')
        platform_feature = self.PLATFORM_FEATURES.get(platform, self.PLATFORM_FEATURES['amazon_ads'])
        
        prompt = f"""设计广告结构：

市场分析结果：{state.get('messages', [])[-1].content if state.get('messages') else ''}
平台：{platform_feature['name']}
广告类型选项：{', '.join(platform_feature['ad_types'])}
预算：${state.get('budget', 0):.2f}

请设计完整的广告结构：
1. 广告系列层级划分
2. 各广告组设置
3. 定向策略
4. 预算分配方案
5. 投放时间安排

请以JSON格式输出广告结构配置。"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 解析广告结构
        campaign_structure = {
            "campaigns": [
                {
                    "name": f"{state.get('product_name', 'Product')}_Main",
                    "type": platform_feature['ad_types'][0],
                    "budget": state.get('budget', 0) * 0.7,
                    "ad_groups": []
                }
            ]
        }
        
        try:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            parsed = json.loads(content.strip())
            if isinstance(parsed, dict):
                campaign_structure = parsed
        except:
            pass
        
        return {
            "messages": [AIMessage(content=response.content)],
            "campaign_structure": campaign_structure,
            "next_action": "create_ad_creatives"
        }
    
    async def _create_ad_creatives(self, state: AdvertisingState) -> dict:
        """创建广告素材"""
        platform = state.get('platform', 'amazon_ads')
        
        prompt = f"""创建广告素材：

广告结构：{json.dumps(state.get('campaign_structure', {}), ensure_ascii=False)}
商品：{state.get('product_name', '未指定')}

请为每个广告组创作广告文案：
1. 标题（多个版本供测试）
2. 描述文案
3. 行动号召（CTA）
4. 素材建议（图片/视频要点）
5. A/B测试建议

注意事项：
- 文案要突出产品卖点
- 符合平台字符限制
- 吸引目标受众点击"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 模拟广告素材
        ad_creatives = [
            {
                "headline": f"{state.get('product_name', 'Product')} - 限时特惠",
                "description": "高品质产品，快速配送，满意保证",
                "cta": "立即购买",
                "suggestions": ["突出折扣信息", "展示产品使用场景", "添加信任元素"]
            }
        ]
        
        return {
            "messages": [AIMessage(content=response.content)],
            "ad_creatives": ad_creatives,
            "next_action": "setup_bidding"
        }
    
    async def _setup_bidding(self, state: AdvertisingState) -> dict:
        """设置出价策略"""
        platform = state.get('platform', 'amazon_ads')
        campaign_goal = state.get('campaign_goal', 'conversion')
        platform_feature = self.PLATFORM_FEATURES.get(platform, self.PLATFORM_FEATURES['amazon_ads'])
        goal_strategy = self.GOAL_STRATEGIES.get(campaign_goal, self.GOAL_STRATEGIES['conversion'])
        
        prompt = f"""设置出价策略：

平台：{platform_feature['name']}
预算：${state.get('budget', 0):.2f}
广告目标：{campaign_goal}
出价选项：{', '.join(platform_feature['bidding_options'])}
推荐出价方式：{goal_strategy['bidding']}

请制定出价策略：
1. 出价方式选择和理由
2. 初始出价建议
3. 出价调整规则
4. 预算分配策略
5. ROI目标设定"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 出价策略
        bidding_strategy = {
            "strategy": goal_strategy['bidding'],
            "initial_bid": state.get('budget', 0) * 0.05,  # 初始出价约为预算的5%
            "adjustment_rules": [
                "CTR低于1%时提高出价",
                "CPA高于目标时降低出价",
                "ROAS达标时保持出价"
            ],
            "budget_allocation": {
                "testing": 0.3,    # 30%用于测试
                "scaling": 0.5,    # 50%用于扩量
                "retention": 0.2   # 20%用于维持
            }
        }
        
        return {
            "messages": [AIMessage(content=response.content)],
            "bidding_strategy": bidding_strategy,
            "next_action": "predict_performance"
        }
    
    async def _predict_performance(self, state: AdvertisingState) -> dict:
        """预测效果"""
        platform = state.get('platform', 'amazon_ads')
        budget = state.get('budget', 0)
        campaign_goal = state.get('campaign_goal', 'conversion')
        goal_strategy = self.GOAL_STRATEGIES.get(campaign_goal, self.GOAL_STRATEGIES['conversion'])
        
        prompt = f"""预测广告效果并给出优化建议：

平台：{platform}
预算：${budget:.2f}
目标：{campaign_goal}
核心指标：{', '.join(goal_strategy['metrics'])}

请预测：
1. 预估曝光量范围
2. 预估点击量范围
3. 预估转化量范围
4. 预估CPA/ROAS范围
5. 效果提升建议

请以JSON格式输出预测结果。"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 效果预测
        performance_prediction = {
            "impressions": {"min": int(budget * 10), "max": int(budget * 50)},
            "clicks": {"min": int(budget * 0.5), "max": int(budget * 2)},
            "conversions": {"min": int(budget * 0.05), "max": int(budget * 0.2)},
            "cpa": {"min": budget * 5, "max": budget * 20},
            "roas": {"min": 1.5, "max": 5.0},
            "key_factors": ["产品价格竞争力", "素材质量", "着陆页体验", "市场竞争程度"]
        }
        
        try:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            parsed = json.loads(content.strip())
            if isinstance(parsed, dict):
                performance_prediction.update(parsed)
        except:
            pass
        
        return {
            "messages": [AIMessage(content=response.content)],
            "performance_prediction": performance_prediction,
            "optimization_tips": response.content,
            "next_action": "completed"
        }
    
    async def run(
        self,
        platform: str = "amazon_ads",
        product_name: str = "",
        budget: float = 100.0,
        target_audience: dict = None,
        campaign_goal: str = "conversion",
        keywords: list[str] = None
    ) -> dict:
        """运行广告投放智能体"""
        initial_state = {
            "messages": [],
            "platform": platform,
            "product_name": product_name,
            "budget": budget,
            "target_audience": target_audience or {},
            "campaign_goal": campaign_goal,
            "keywords": keywords or [],
            "campaign_structure": {},
            "ad_creatives": [],
            "bidding_strategy": {},
            "performance_prediction": {},
            "optimization_tips": "",
            "next_action": ""
        }
        
        result = await self.app.ainvoke(initial_state)
        return result
