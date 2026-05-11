"""
统一LLM服务层 - 封装豆包大模型调用
为所有AI智能体提供统一的AI能力接口
"""
import os
from typing import List, Optional, Dict, Any, Union, AsyncIterator
from enum import Enum
from loguru import logger

# CRITICAL: 在导入SDK之前设置环境变量
# coze-coding-dev-sdk需要COZE_WORKSPACE_ID
if not os.environ.get("COZE_WORKSPACE_ID"):
    workspace_id = os.environ.get("COZE_PROJECT_SPACE_ID", "7597647832174657536")
    os.environ["COZE_WORKSPACE_ID"] = workspace_id
    logger.debug(f"设置COZE_WORKSPACE_ID={workspace_id}")

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage

# 使用 coze-coding-dev-sdk 调用豆包大模型
from coze_coding_dev_sdk import LLMClient
from coze_coding_utils.runtime_ctx.context import Context, new_context


class LLMModel(str, Enum):
    """支持的LLM模型"""
    # 豆包模型
    DOUBAO_PRO = "doubao-seed-2-0-pro-260215"          # 旗舰模型 - 复杂推理
    DOUBAO_LITE = "doubao-seed-2-0-lite-260215"        # 平衡模型 - 通用任务
    DOUBAO_MINI = "doubao-seed-2-0-mini-260215"        # 轻量模型 - 快速响应
    DOUBAO_AGENT = "doubao-seed-1-8-251228"            # Agent优化模型 - 默认
    DOUBAO_VISION = "doubao-seed-1-6-vision-250815"   # 视觉模型 - 图片/视频理解
    
    # DeepSeek模型
    DEEPSEEK_V3 = "deepseek-v3-2-251201"              # DeepSeek V3.2
    DEEPSEEK_R1 = "deepseek-r1-250528"                # DeepSeek R1
    
    # Kimi模型
    KIMI_K2 = "kimi-k2-250905"                        # Kimi K2
    KIMI_K25 = "kimi-k2-5-260127"                     # Kimi K2.5 - 最强
    
    # GLM模型
    GLM_4 = "glm-4-7-251222"                          # GLM-4-7


class LLMService:
    """
    统一LLM服务 - 所有AI智能体的核心大脑
    
    使用方式：
        llm = LLMService()
        response = await llm.chat("你好")
        async for chunk in llm.stream_chat("请详细解释"):
            print(chunk)
    """
    
    # 智能体默认模型配置
    AGENT_MODEL_MAP = {
        "product_selection": LLMModel.DOUBAO_AGENT,      # 选品 - Agent优化
        "image_design": LLMModel.DOUBAO_VISION,          # 图片 - 视觉模型
        "listing_optimization": LLMModel.DOUBAO_LITE,    # Listing - 平衡模型
        "advertising": LLMModel.DOUBAO_PRO,              # 广告 - 需要复杂推理
        "customer_service": LLMModel.DOUBAO_MINI,        # 客服 - 快速响应
        "data_review": LLMModel.DOUBAO_PRO,              # 数据复盘 - 复杂分析
        "video_generation": LLMModel.DOUBAO_LITE,        # 视频生成 - 通用任务
        "translation": LLMModel.DOUBAO_MINI,             # 翻译 - 快速响应
    }
    
    def __init__(
        self,
        model: str = None,
        temperature: float = 0.7,
        thinking: str = "disabled",
        caching: str = "disabled"
    ):
        """
        初始化LLM服务
        
        Args:
            model: 模型ID，默认使用豆包Agent优化模型
            temperature: 输出随机性 (0-2)
            thinking: 是否启用思考模式 ("enabled"/"disabled")
            caching: 是否启用缓存 ("enabled"/"disabled")
        """
        self.model = model or LLMModel.DOUBAO_AGENT.value
        self.temperature = temperature
        self.thinking = thinking
        self.caching = caching
        
        # 创建客户端
        self._ctx = new_context(method="invoke")
        self._client = LLMClient(ctx=self._ctx)
    
    @classmethod
    def for_agent(cls, agent_type: str, **kwargs) -> "LLMService":
        """
        为特定智能体创建LLM服务
        
        Args:
            agent_type: 智能体类型 (product_selection, image_design, etc.)
            **kwargs: 其他参数 (temperature, thinking等)
        
        Returns:
            配置好的LLMService实例
        """
        model = cls.AGENT_MODEL_MAP.get(agent_type, LLMModel.DOUBAO_AGENT)
        return cls(model=model.value, **kwargs)
    
    def _get_text_content(self, content: Union[str, List]) -> str:
        """
        安全地从AIMessage.content提取文本
        
        AIMessage.content 可能是：
        - str: 纯文本
        - list[str]: 字符串列表
        - list[dict]: 多模态响应块
        """
        if isinstance(content, str):
            return content
        elif isinstance(content, list):
            if content and isinstance(content[0], str):
                return " ".join(content)
            else:
                # 多模态响应，提取text块
                text_parts = []
                for item in content:
                    if isinstance(item, dict) and item.get("type") == "text":
                        text_parts.append(item.get("text", ""))
                return " ".join(text_parts)
        return str(content)
    
    async def chat(
        self,
        messages: List[BaseMessage],
        temperature: Optional[float] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        同步对话（非流式）
        
        Args:
            messages: 消息列表，使用LangChain消息格式
            temperature: 覆盖默认温度
            model: 覆盖默认模型
            **kwargs: 其他参数 (thinking, caching等)
        
        Returns:
            AI回复文本
        """
        try:
            response = self._client.invoke(
                messages=messages,
                model=model or self.model,
                temperature=temperature if temperature is not None else self.temperature,
                thinking=kwargs.get("thinking", self.thinking),
                caching=kwargs.get("caching", self.caching),
                max_completion_tokens=kwargs.get("max_completion_tokens", 32768)
            )
            
            return self._get_text_content(response.content)
            
        except Exception as e:
            logger.error(f"LLM调用失败: {e}")
            raise
    
    async def stream_chat(
        self,
        messages: List[BaseMessage],
        temperature: Optional[float] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> AsyncIterator[str]:
        """
        流式对话
        
        Args:
            messages: 消息列表
            temperature: 覆盖默认温度
            model: 覆盖默认模型
            **kwargs: 其他参数
        
        Yields:
            文本块
        """
        try:
            for chunk in self._client.stream(
                messages=messages,
                model=model or self.model,
                temperature=temperature if temperature is not None else self.temperature,
                thinking=kwargs.get("thinking", self.thinking),
                caching=kwargs.get("caching", self.caching),
                max_completion_tokens=kwargs.get("max_completion_tokens", 32768)
            ):
                if chunk.content:
                    yield self._get_text_content(chunk.content)
                    
        except Exception as e:
            logger.error(f"LLM流式调用失败: {e}")
            raise
    
    async def simple_chat(
        self,
        user_message: str,
        system_prompt: str = None,
        temperature: Optional[float] = None
    ) -> str:
        """
        简单对话接口
        
        Args:
            user_message: 用户消息
            system_prompt: 系统提示（可选）
            temperature: 温度
        
        Returns:
            AI回复
        """
        messages = []
        if system_prompt:
            messages.append(SystemMessage(content=system_prompt))
        messages.append(HumanMessage(content=user_message))
        
        return await self.chat(messages, temperature=temperature)
    
    async def json_chat(
        self,
        messages: List[BaseMessage],
        temperature: Optional[float] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        对话并返回JSON格式结果
        
        Args:
            messages: 消息列表
            temperature: 温度
        
        Returns:
            解析后的JSON对象
        """
        import json
        
        response = await self.chat(messages, temperature=temperature, **kwargs)
        
        try:
            # 尝试提取JSON
            text = response.strip()
            
            # 尝试找到JSON块
            if "```json" in text:
                start = text.find("```json") + 7
                end = text.find("```", start)
                text = text[start:end].strip()
            elif "```" in text:
                start = text.find("```") + 3
                end = text.find("```", start)
                text = text[start:end].strip()
            
            return json.loads(text)
        except json.JSONDecodeError:
            # 返回原始文本作为error字段
            return {"error": "JSON解析失败", "raw_response": response}


class AgentLLMWrapper:
    """
    智能体LLM包装器 - 兼容LangChain接口
    
    为现有使用ChatOpenAI的智能体提供兼容层，
    内部使用豆包大模型
    """
    
    def __init__(
        self,
        agent_type: str = None,
        model: str = None,
        temperature: float = 0.7
    ):
        """
        初始化包装器
        
        Args:
            agent_type: 智能体类型，自动选择合适模型
            model: 直接指定模型
            temperature: 温度
        """
        if agent_type:
            self.llm = LLMService.for_agent(agent_type, temperature=temperature)
        else:
            self.llm = LLMService(model=model or LLMModel.DOUBAO_AGENT.value, temperature=temperature)
        
        self.model = self.llm.model
        self.temperature = temperature
    
    async def ainvoke(self, messages: List[BaseMessage], **kwargs) -> AIMessage:
        """
        异步调用 - 兼容LangChain ChatOpenAI接口
        
        Args:
            messages: 消息列表
            **kwargs: 其他参数
        
        Returns:
            AIMessage对象
        """
        temperature = kwargs.get("temperature", self.temperature)
        
        response_text = await self.llm.chat(messages, temperature=temperature)
        
        return AIMessage(content=response_text)
    
    def invoke(self, messages: List[BaseMessage], **kwargs) -> AIMessage:
        """
        同步调用 - 注意：这是一个阻塞方法，仅用于兼容
        """
        import asyncio
        
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        return loop.run_until_complete(self.ainvoke(messages, **kwargs))


# 便捷工厂函数
def get_llm_for_agent(agent_type: str, temperature: float = 0.7) -> AgentLLMWrapper:
    """
    为智能体获取LLM实例
    
    Args:
        agent_type: 智能体类型
        temperature: 温度
    
    Returns:
        AgentLLMWrapper实例
    """
    return AgentLLMWrapper(agent_type=agent_type, temperature=temperature)


def get_llm(model: str = None, temperature: float = 0.7) -> AgentLLMWrapper:
    """
    获取通用LLM实例
    
    Args:
        model: 模型ID
        temperature: 温度
    
    Returns:
        AgentLLMWrapper实例
    """
    return AgentLLMWrapper(model=model, temperature=temperature)
