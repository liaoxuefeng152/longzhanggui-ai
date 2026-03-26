"""
LangGraph智能体基础模块 - 使用豆包大模型
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph, END
import operator

from app.services.llm_service import get_llm_for_agent, AgentLLMWrapper


class AgentState(TypedDict):
    """智能体状态"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next_action: str
    current_step: str
    output: dict
    error: str


class BaseAgent:
    """智能体基类 - 所有智能体默认使用豆包大模型"""
    
    def __init__(
        self,
        name: str,
        agent_type: str = None,
        temperature: float = 0.7
    ):
        """
        初始化智能体基类
        
        Args:
            name: 智能体名称
            agent_type: 智能体类型（用于自动选择合适的模型）
            temperature: 温度参数
        """
        self.name = name
        self.temperature = temperature
        
        # 使用豆包大模型
        if agent_type:
            self.llm = get_llm_for_agent(agent_type, temperature=temperature)
        else:
            self.llm = AgentLLMWrapper(temperature=temperature)
        
        # 构建工作流
        self.workflow = self._build_workflow()
        self.app = self.workflow.compile()
    
    def _build_workflow(self) -> StateGraph:
        """构建工作流，子类需要重写"""
        workflow = StateGraph(AgentState)
        
        # 添加默认节点
        workflow.add_node("start", self._start_node)
        workflow.add_node("process", self._process_node)
        workflow.add_node("end", self._end_node)
        
        # 添加边
        workflow.set_entry_point("start")
        workflow.add_edge("start", "process")
        workflow.add_edge("process", "end")
        workflow.add_edge("end", END)
        
        return workflow
    
    async def _start_node(self, state: AgentState) -> dict:
        """开始节点"""
        return {"current_step": "started", "next_action": "process"}
    
    async def _process_node(self, state: AgentState) -> dict:
        """处理节点"""
        return {"current_step": "processed", "next_action": "end"}
    
    async def _end_node(self, state: AgentState) -> dict:
        """结束节点"""
        return {"current_step": "completed", "next_action": ""}
    
    async def run(self, input_data: dict) -> dict:
        """运行智能体"""
        initial_state = {
            "messages": [],
            "next_action": "",
            "current_step": "",
            "output": {},
            "error": ""
        }
        
        try:
            result = await self.app.ainvoke(initial_state)
            return result
        except Exception as e:
            return {"error": str(e)}
