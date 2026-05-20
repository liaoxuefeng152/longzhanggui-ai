"""
统一LLM服务层 - 封装豆包大模型调用
为所有AI智能体提供统一的AI能力接口
"""
import os
from typing import List, Optional, Dict, Any, Union, AsyncIterator
from enum import Enum
from loguru import logger
import httpx

# 从环境变量获取豆包API配置
DOUBAO_API_KEY = os.environ.get("DOUBAO_API_KEY", os.environ.get("COZE_API_TOKEN", ""))
DOUBAO_API_BASE = os.environ.get("DOUBAO_API_BASE", "https://ark.cn-beijing.volces.com/api/v3")

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage


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
        api_key: str = None,
        api_base: str = None,
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
        self.api_key = api_key or DOUBAO_API_KEY
        self.api_base = api_base or DOUBAO_API_BASE
        
        # 创建HTTP客户端
        self._client = httpx.AsyncClient(
            base_url=self.api_base,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=120.0
        )
    
    def _convert_messages(self, messages: List[BaseMessage]) -> List[Dict]:
        """将LangChain消息转换为API格式"""
        result = []
        for msg in messages:
            if isinstance(msg, HumanMessage):
                result.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                result.append({"role": "assistant", "content": msg.content})
            elif isinstance(msg, SystemMessage):
                result.append({"role": "system", "content": msg.content})
            else:
                result.append({"role": "user", "content": str(msg.content)})
        return result
    
    def _get_text_content(self, content: Union[str, List]) -> str:
        """
        安全地从响应中提取文本
        """
        if isinstance(content, str):
            return content
        elif isinstance(content, list):
            if content and isinstance(content[0], str):
                return " ".join(content)
            else:
                text_parts = []
                for item in content:
                    if isinstance(item, dict):
                        if item.get("type") == "text":
                            text_parts.append(item.get("text", ""))
                        elif "text" in item:
                            text_parts.append(str(item["text"]))
                return " ".join(text_parts) if text_parts else str(content)
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
            **kwargs: 其他参数
        
        Returns:
            AI回复文本
        """
        try:
            payload = {
                "model": model or self.model,
                "messages": self._convert_messages(messages),
                "temperature": temperature if temperature is not None else self.temperature,
                "max_tokens": kwargs.get("max_completion_tokens", 32768)
            }
            
            response = await self._client.post("/chat/completions", json=payload)
            response.raise_for_status()
            data = response.json()
            
            return self._get_text_content(data["choices"][0]["message"]["content"])
            
        except Exception as e:
            logger.error(f"LLM调用失败: {e}")
            # 如果API未配置，返回模拟响应
            if not self.api_key:
                logger.warning("未配置DOUBAO_API_KEY，返回模拟响应")
                return "【模拟响应】AI服务暂未配置，请联系管理员配置豆包API密钥。"
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
            payload = {
                "model": model or self.model,
                "messages": self._convert_messages(messages),
                "temperature": temperature if temperature is not None else self.temperature,
                "max_tokens": kwargs.get("max_completion_tokens", 32768),
                "stream": True
            }
            
            async with self._client.stream("POST", "/chat/completions", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            import json
                            chunk = json.loads(data)
                            content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if content:
                                yield content
                        except:
                            pass
                            
        except Exception as e:
            logger.error(f"LLM流式调用失败: {e}")
            if not self.api_key:
                yield "【模拟响应】AI服务暂未配置，请联系管理员配置豆包API密钥。"
            else:
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
            text = response.strip()
            
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
        if agent_type:
            self.llm = LLMService.for_agent(agent_type, temperature=temperature)
        else:
            self.llm = LLMService(model=model or LLMModel.DOUBAO_AGENT.value, temperature=temperature)
        
        self.model = self.llm.model
        self.temperature = temperature
    
    async def ainvoke(self, messages: List[BaseMessage], **kwargs) -> AIMessage:
        temperature = kwargs.get("temperature", self.temperature)
        response_text = await self.llm.chat(messages, temperature=temperature)
        return AIMessage(content=response_text)
    
    def invoke(self, messages: List[BaseMessage], **kwargs) -> AIMessage:
        import asyncio
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        return loop.run_until_complete(self.ainvoke(messages, **kwargs))


def get_llm_for_agent(agent_type: str, temperature: float = 0.7) -> AgentLLMWrapper:
    return AgentLLMWrapper(agent_type=agent_type, temperature=temperature)


def get_llm(model: str = None, temperature: float = 0.7) -> AgentLLMWrapper:
    return AgentLLMWrapper(model=model, temperature=temperature)
