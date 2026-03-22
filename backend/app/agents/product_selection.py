"""
选品智能体
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
import operator
import json

from app.agents.base import AgentState


class ProductSelectionState(TypedDict):
    """选品智能体状态"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    category: str  # 商品类目
    platform: str  # 平台
    region: str    # 目标地区
    budget: str    # 预算范围
    recommendations: list[dict]  # 推荐结果
    analysis: str  # 分析报告
    next_action: str


class ProductSelectionAgent:
    """选品智能体"""
    
    SYSTEM_PROMPT = """你是一位专业的跨境电商选品专家，精通各大电商平台的市场分析。

你的任务是根据用户提供的信息，推荐最有潜力的爆款商品。

分析维度包括：
1. 市场需求分析 - 搜索量、趋势、竞争度
2. 利润空间分析 - 成本、售价、毛利率
3. 物流可行性 - 重量、体积、清关难度
4. 季节性因素 - 销售周期、库存风险
5. 平台政策 - 合规性、禁售品检查

请用专业、客观的语言进行分析，并给出明确的选品建议。"""
    
    def __init__(
        self,
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
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
        """构建选品工作流"""
        workflow = StateGraph(ProductSelectionState)
        
        # 添加节点
        workflow.add_node("analyze_market", self._analyze_market)
        workflow.add_node("generate_recommendations", self._generate_recommendations)
        workflow.add_node("format_output", self._format_output)
        
        # 设置入口
        workflow.set_entry_point("analyze_market")
        
        # 添加边
        workflow.add_edge("analyze_market", "generate_recommendations")
        workflow.add_edge("generate_recommendations", "format_output")
        workflow.add_edge("format_output", END)
        
        return workflow
    
    async def _analyze_market(self, state: ProductSelectionState) -> dict:
        """分析市场"""
        prompt = f"""请分析以下选品需求：

商品类目：{state.get('category', '未指定')}
目标平台：{state.get('platform', '未指定')}
目标地区：{state.get('region', '未指定')}
预算范围：{state.get('budget', '未指定')}

请从以下几个维度进行分析：
1. 市场需求趋势
2. 竞争格局
3. 价格区间
4. 爆款潜力

请用中文回复，提供详细的市场分析。"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "analysis": response.content,
            "next_action": "generate_recommendations"
        }
    
    async def _generate_recommendations(self, state: ProductSelectionState) -> dict:
        """生成推荐"""
        prompt = f"""基于以下市场分析：
{state.get('analysis', '')}

请推荐3-5个具体的产品，包括：
1. 产品名称
2. 推荐理由
3. 预计售价区间
4. 毛利率预估
5. 风险提示

请以JSON格式输出，格式如下：
{{
  "recommendations": [
    {{
      "name": "产品名称",
      "reason": "推荐理由",
      "price_range": "价格区间",
      "profit_margin": "毛利率",
      "risks": ["风险1", "风险2"]
    }}
  ]
}}"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 解析JSON
        try:
            content = response.content
            # 提取JSON部分
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            result = json.loads(content.strip())
            recommendations = result.get("recommendations", [])
        except:
            recommendations = []
        
        return {
            "messages": [AIMessage(content=response.content)],
            "recommendations": recommendations,
            "next_action": "format_output"
        }
    
    async def _format_output(self, state: ProductSelectionState) -> dict:
        """格式化输出"""
        return {
            "next_action": "completed"
        }
    
    async def run(
        self,
        category: str = "",
        platform: str = "",
        region: str = "",
        budget: str = ""
    ) -> dict:
        """运行选品智能体"""
        initial_state = {
            "messages": [],
            "category": category,
            "platform": platform,
            "region": region,
            "budget": budget,
            "recommendations": [],
            "analysis": "",
            "next_action": ""
        }
        
        result = await self.app.ainvoke(initial_state)
        return result
