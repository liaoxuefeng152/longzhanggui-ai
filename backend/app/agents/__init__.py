"""
智能体模块
"""
from app.agents.base import BaseAgent, AgentState
from app.agents.product_selection import ProductSelectionAgent
from app.agents.customer_service import CustomerServiceAgent, TranslationAgent
from app.agents.image_design import ImageDesignAgent
from app.agents.video_generation import VideoGenerationAgent
from app.agents.listing_optimization import ListingOptimizationAgent
from app.agents.advertising import AdvertisingAgent
from app.agents.data_review import DataReviewAgent

# 智能体类型映射
AGENT_CLASSES = {
    "product-selection": ProductSelectionAgent,
    "customer-service": CustomerServiceAgent,
    "image-design": ImageDesignAgent,
    "video-generation": VideoGenerationAgent,
    "listing-optimization": ListingOptimizationAgent,
    "advertising": AdvertisingAgent,
    "data-review": DataReviewAgent,
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
    "ImageDesignAgent",
    "VideoGenerationAgent",
    "ListingOptimizationAgent",
    "AdvertisingAgent",
    "DataReviewAgent",
    "get_agent_class",
]
