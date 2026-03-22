"""
智能体模块
"""
from app.agents.base import BaseAgent, AgentState
from app.agents.product_selection import ProductSelectionAgent
from app.agents.customer_service import CustomerServiceAgent, TranslationAgent

# 智能体类型映射
AGENT_CLASSES = {
    "product-selection": ProductSelectionAgent,
    "customer-service": CustomerServiceAgent,
}


def get_agent_class(agent_type: str):
    """获取智能体类"""
    return AGENT_CLASSES.get(agent_type)


__all__ = [
    "BaseAgent",
    "AgentState",
    "ProductSelectionAgent",
    "CustomerServiceAgent",
    "TranslationAgent",
    "get_agent_class",
]
