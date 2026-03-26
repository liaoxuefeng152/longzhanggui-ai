"""
选品智能体 - 使用豆包大模型
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
import operator
import json

from app.agents.base import AgentState
from app.services.llm_service import get_llm_for_agent


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

请用专业、客观的语言进行分析，并给出明确的选品建议。

输出格式要求：
请以JSON格式输出推荐结果，格式如下：
```json
{
  "analysis": "市场分析报告...",
  "recommendations": [
    {
      "name": "商品名称",
      "reason": "推荐理由",
      "price_range": "建议售价区间",
      "profit_margin": "预估利润率",
      "risks": ["风险1", "风险2"]
    }
  ]
}
```"""
    
    def __init__(
        self,
        temperature: float = 0.7
    ):
        """初始化选品智能体，使用豆包Agent优化模型"""
        self.temperature = temperature
        
        # 使用豆包大模型 - Agent优化模型
        self.llm = get_llm_for_agent("product_selection", temperature=temperature)
        
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
        """生成选品推荐"""
        prompt = f"""基于以下市场分析，请推荐3-5个最有潜力的商品：

市场分析：
{state.get('analysis', '')}

目标平台：{state.get('platform', '未指定')}
目标地区：{state.get('region', '未指定')}

请以JSON格式输出推荐结果，每个商品包含：
- name: 商品名称
- reason: 推荐理由（包含市场需求、竞争度、利润空间等）
- price_range: 建议售价区间
- profit_margin: 预估利润率
- risks: 可能的风险列表

请直接输出JSON，不要有其他内容。"""
        
        messages = [
            {"role": "system", "content": "你是专业的选品专家，请以JSON格式输出推荐结果。"},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 尝试解析JSON
        recommendations = []
        try:
            content = response.content
            # 提取JSON部分
            if "```json" in content:
                start = content.find("```json") + 7
                end = content.find("```", start)
                content = content[start:end].strip()
            elif "```" in content:
                start = content.find("```") + 3
                end = content.find("```", start)
                content = content[start:end].strip()
            
            data = json.loads(content)
            recommendations = data.get("recommendations", [])
        except:
            # 如果解析失败，创建默认推荐
            recommendations = [
                {"name": f"推荐商品{i+1}", "reason": "基于市场分析推荐", "price_range": "待定", "profit_margin": "待定", "risks": []}
                for i in range(3)
            ]
        
        return {
            "recommendations": recommendations,
            "next_action": "format_output"
        }
    
    async def _format_output(self, state: ProductSelectionState) -> dict:
        """格式化输出"""
        return {
            "next_action": "completed"
        }
    
    async def run(self, input_data: dict) -> dict:
        """运行选品智能体"""
        initial_state = {
            "messages": [],
            "category": input_data.get("category", ""),
            "platform": input_data.get("platform", "tiktok"),
            "region": input_data.get("region", "id"),
            "budget": input_data.get("budget", "中等"),
            "recommendations": [],
            "analysis": "",
            "next_action": ""
        }
        
        result = await self.app.ainvoke(initial_state)
        
        # 格式化输出
        return {
            "output": {
                "analysis": result.get("analysis", ""),
                "recommendations": result.get("recommendations", [])
            },
            "messages": result.get("messages", [])
        }
