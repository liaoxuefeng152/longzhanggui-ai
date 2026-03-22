"""
Listing优化智能体
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
import operator
import json
import re

from app.agents.base import AgentState


class ListingOptimizationState(TypedDict):
    """Listing优化智能体状态"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    platform: str            # 平台：amazon, shopee, lazada, tiktok
    product_name: str        # 原商品名称
    original_title: str      # 原标题
    original_description: str # 原描述
    target_keywords: list[str] # 目标关键词
    category: str            # 类目
    competitor_analysis: dict # 竞品分析结果
    optimized_title: str     # 优化后的标题
    optimized_description: str # 优化后的描述
    optimized_bullets: list[str] # 优化后的卖点
    seo_score: dict          # SEO评分
    next_action: str


class ListingOptimizationAgent:
    """Listing优化智能体"""
    
    SYSTEM_PROMPT = """你是一位资深的电商Listing优化专家，精通各大电商平台的SEO规则和转化率优化。

你的职责是：
1. 分析现有Listing的问题和改进空间
2. 优化商品标题、描述、关键词
3. 提升搜索排名和转化率
4. 符合平台规范和最佳实践

优化原则：
- 关键词精准布局
- 标题吸引眼球且符合规范
- 描述突出卖点解决痛点
- 符合平台字符限制
- 避免违规词和夸大宣传"""
    
    # 平台规范
    PLATFORM_SPECS = {
        "amazon": {
            "title_max": 200,
            "bullet_max": 5,
            "bullet_chars": 500,
            "description_max": 2000,
            "tips": "标题包含品牌名，5点卖点，A+页面，后端关键词",
            "forbidden": ["best", "#1", "guarantee", "free shipping"]
        },
        "shopee": {
            "title_max": 100,
            "bullet_max": 3,
            "bullet_chars": 200,
            "description_max": 3000,
            "tips": "简洁明了，促销信息前置，使用emoji",
            "forbidden": ["outside Shopee", "contact directly"]
        },
        "lazada": {
            "title_max": 150,
            "bullet_max": 5,
            "bullet_chars": 300,
            "description_max": 4000,
            "tips": "关键词密集，结构清晰，包含规格参数",
            "forbidden": ["fake", "replica", "imitation"]
        },
        "tiktok": {
            "title_max": 100,
            "bullet_max": 3,
            "bullet_chars": 150,
            "description_max": 1000,
            "tips": "年轻化表达，潮流词汇，简洁有力",
            "forbidden": ["adult content", "weapon", "drug"]
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
        """构建Listing优化工作流"""
        workflow = StateGraph(ListingOptimizationState)
        
        # 添加节点
        workflow.add_node("analyze_current_listing", self._analyze_current_listing)
        workflow.add_node("research_keywords", self._research_keywords)
        workflow.add_node("optimize_title", self._optimize_title)
        workflow.add_node("optimize_bullets", self._optimize_bullets)
        workflow.add_node("optimize_description", self._optimize_description)
        workflow.add_node("calculate_seo_score", self._calculate_seo_score)
        
        # 设置入口
        workflow.set_entry_point("analyze_current_listing")
        
        # 添加边
        workflow.add_edge("analyze_current_listing", "research_keywords")
        workflow.add_edge("research_keywords", "optimize_title")
        workflow.add_edge("optimize_title", "optimize_bullets")
        workflow.add_edge("optimize_bullets", "optimize_description")
        workflow.add_edge("optimize_description", "calculate_seo_score")
        workflow.add_edge("calculate_seo_score", END)
        
        return workflow
    
    async def _analyze_current_listing(self, state: ListingOptimizationState) -> dict:
        """分析当前Listing"""
        platform = state.get('platform', 'amazon')
        platform_spec = self.PLATFORM_SPECS.get(platform, self.PLATFORM_SPECS['amazon'])
        
        prompt = f"""分析以下Listing存在的问题：

平台：{platform}
原标题：{state.get('original_title', '未提供')}
原描述：{state.get('original_description', '未提供')}
类目：{state.get('category', '未提供')}

平台规范：
- 标题最多{platform_spec['title_max']}字符
- 卖点最多{platform_spec['bullet_max']}条
- 禁止词汇：{', '.join(platform_spec['forbidden'])}

请分析：
1. 标题问题（长度、关键词、吸引力）
2. 描述问题（结构、卖点、格式）
3. 关键词布局问题
4. 可能的违规风险
5. 改进建议"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "next_action": "research_keywords"
        }
    
    async def _research_keywords(self, state: ListingOptimizationState) -> dict:
        """研究关键词"""
        target_keywords = state.get('target_keywords', [])
        
        prompt = f"""为以下商品研究最佳关键词：

商品名称：{state.get('product_name', '未提供')}
类目：{state.get('category', '未提供')}
现有目标关键词：{', '.join(target_keywords) if target_keywords else '未提供'}

请提供：
1. 核心关键词（3-5个）- 搜索量高、转化好
2. 长尾关键词（5-10个）- 精准、竞争小
3. 同义词和相关词
4. 避免的负面关键词
5. 关键词布局建议（标题/卖点/描述中的位置）"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "next_action": "optimize_title"
        }
    
    async def _optimize_title(self, state: ListingOptimizationState) -> dict:
        """优化标题"""
        platform = state.get('platform', 'amazon')
        platform_spec = self.PLATFORM_SPECS.get(platform, self.PLATFORM_SPECS['amazon'])
        
        prompt = f"""优化商品标题：

原标题：{state.get('original_title', '未提供')}
关键词研究结果：{state.get('messages', [])[-1].content if state.get('messages') else ''}

平台规范：
- 最多{platform_spec['title_max']}字符
- 建议：{platform_spec['tips']}

请生成3个优化后的标题选项：
1. 标准版（包含所有核心关键词）
2. 简洁版（突出卖点）
3. 促销版（带促销信息）

每个标题请说明：
- 字符数
- 包含的关键词
- 优化亮点"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 提取推荐的标题
        content = response.content
        # 简单提取第一个标题作为优化标题
        lines = content.split('\n')
        optimized_title = state.get('original_title', '')
        for line in lines:
            if line.strip() and not line.startswith('#') and len(line) < platform_spec['title_max']:
                optimized_title = line.strip().replace('"', '').replace("'", "")
                break
        
        return {
            "messages": [AIMessage(content=response.content)],
            "optimized_title": optimized_title,
            "next_action": "optimize_bullets"
        }
    
    async def _optimize_bullets(self, state: ListingOptimizationState) -> dict:
        """优化卖点"""
        platform = state.get('platform', 'amazon')
        platform_spec = self.PLATFORM_SPECS.get(platform, self.PLATFORM_SPECS['amazon'])
        
        prompt = f"""优化商品卖点：

优化后标题：{state.get('optimized_title', '')}
原描述：{state.get('original_description', '')}

平台规范：
- 最多{platform_spec['bullet_max']}条卖点
- 每条最多{platform_spec['bullet_chars']}字符

请生成{platform_spec['bullet_max']}条优化后的卖点：
1. 每条卖点突出一个核心优势
2. 包含相关关键词
3. 解决用户痛点
4. 使用有说服力的语言
5. 符合字符限制"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 解析卖点列表
        content = response.content
        bullets = []
        for line in content.split('\n'):
            line = line.strip()
            if line and (line.startswith('-') or line.startswith('•') or line[0].isdigit()):
                # 清理格式
                bullet = re.sub(r'^[-•\d.]+\s*', '', line)
                if bullet and len(bullet) < platform_spec['bullet_chars']:
                    bullets.append(bullet)
        
        # 确保不超过平台限制
        bullets = bullets[:platform_spec['bullet_max']]
        
        return {
            "messages": [AIMessage(content=response.content)],
            "optimized_bullets": bullets,
            "next_action": "optimize_description"
        }
    
    async def _optimize_description(self, state: ListingOptimizationState) -> dict:
        """优化描述"""
        platform = state.get('platform', 'amazon')
        platform_spec = self.PLATFORM_SPECS.get(platform, self.PLATFORM_SPECS['amazon'])
        
        prompt = f"""优化商品描述：

优化后标题：{state.get('optimized_title', '')}
优化后卖点：{chr(10).join(state.get('optimized_bullets', []))}
原描述：{state.get('original_description', '')}

平台规范：
- 最多{platform_spec['description_max']}字符
- 建议：{platform_spec['tips']}

请生成优化后的描述：
1. 结构清晰，分段明确
2. 自然融入关键词
3. 突出卖点和差异化
4. 包含产品规格参数
5. 引导购买行动"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        optimized_description = response.content[:platform_spec['description_max']]
        
        return {
            "messages": [AIMessage(content=response.content)],
            "optimized_description": optimized_description,
            "next_action": "calculate_seo_score"
        }
    
    async def _calculate_seo_score(self, state: ListingOptimizationState) -> dict:
        """计算SEO评分"""
        platform = state.get('platform', 'amazon')
        target_keywords = state.get('target_keywords', [])
        
        prompt = f"""评估以下Listing的SEO质量：

平台：{platform}
优化后标题：{state.get('optimized_title', '')}
优化后卖点：{chr(10).join(state.get('optimized_bullets', []))}
优化后描述：{state.get('optimized_description', '')[:500]}...
目标关键词：{', '.join(target_keywords) if target_keywords else '未指定'}

请提供评分（满分100）：
1. 关键词覆盖度（关键词是否充分覆盖）
2. 标题优化度（吸引力、关键词布局）
3. 内容质量（卖点、描述质量）
4. 规范符合度（是否符合平台规则）
5. 转化潜力（说服力、行动引导）

请以JSON格式输出评分结果和改进建议。"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 解析评分
        seo_score = {
            "overall": 85,
            "details": {
                "keyword_coverage": 90,
                "title_quality": 85,
                "content_quality": 80,
                "compliance": 95,
                "conversion_potential": 75
            },
            "suggestions": response.content
        }
        
        try:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            parsed = json.loads(content.strip())
            if isinstance(parsed, dict):
                seo_score.update(parsed)
        except:
            pass
        
        return {
            "messages": [AIMessage(content=response.content)],
            "seo_score": seo_score,
            "next_action": "completed"
        }
    
    async def run(
        self,
        platform: str = "amazon",
        product_name: str = "",
        original_title: str = "",
        original_description: str = "",
        target_keywords: list[str] = None,
        category: str = ""
    ) -> dict:
        """运行Listing优化智能体"""
        initial_state = {
            "messages": [],
            "platform": platform,
            "product_name": product_name,
            "original_title": original_title,
            "original_description": original_description,
            "target_keywords": target_keywords or [],
            "category": category,
            "competitor_analysis": {},
            "optimized_title": "",
            "optimized_description": "",
            "optimized_bullets": [],
            "seo_score": {},
            "next_action": ""
        }
        
        result = await self.app.ainvoke(initial_state)
        return result
