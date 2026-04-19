"""
跨境AI运营智能体服务 - 调用云端API
提供智能对话、选品分析、图片设计等AI能力
"""
import json
import httpx
from typing import AsyncIterator, Optional
from loguru import logger

from app.core.config import settings


class KuajingAgentService:
    """跨境AI运营智能体服务 - 云端API调用"""
    
    def __init__(self):
        self.api_url = settings.KUAJING_API_URL
        self.api_token = settings.KUAJING_API_TOKEN
        self.project_id = settings.KUAJING_PROJECT_ID
        
    def _get_headers(self) -> dict:
        """获取请求头"""
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }
    
    def _build_request_body(self, query: str, session_id: Optional[str] = None) -> dict:
        """构建请求体"""
        return {
            "project_id": self.project_id,
            "input": {
                "type": "query",
                "session_id": session_id or "default",
                "message": query,
                "content": {
                    "query": {
                        "text": query
                    }
                }
            },
            "stream": True
        }
    
    async def chat_stream(
        self, 
        query: str, 
        session_id: Optional[str] = None
    ) -> AsyncIterator[str]:
        """
        流式对话
        
        Args:
            query: 用户输入
            session_id: 会话ID（用于多轮对话）
            
        Yields:
            流式返回的文本内容
        """
        if not self.api_token or not self.project_id:
            yield "错误：云端智能体API未配置，请联系管理员"
            return
            
        headers = self._get_headers()
        body = self._build_request_body(query, session_id)
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream(
                    "POST",
                    self.api_url,
                    headers=headers,
                    json=body,
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        logger.error(f"云端智能体API错误: {response.status_code} - {error_text}")
                        yield f"API调用失败: {response.status_code}"
                        return
                    
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                            
                        # 解析SSE格式: event: message 或 data: {...}
                        if line.startswith("data:"):
                            data_str = line[5:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                data = json.loads(data_str)
                                # 云端API格式: {"type": "answer", "content": {"answer": "文本"}}
                                if data.get("type") == "answer":
                                    content = data.get("content", {})
                                    answer = content.get("answer", "")
                                    if answer:
                                        yield answer
                                # 兼容其他格式
                                elif "content" in data and isinstance(data["content"], str):
                                    yield data["content"]
                                elif "text" in data:
                                    yield data["text"]
                            except json.JSONDecodeError:
                                continue
                                
        except httpx.TimeoutException:
            logger.error("云端智能体API超时")
            yield "请求超时，请稍后重试"
        except Exception as e:
            logger.error(f"云端智能体API调用异常: {e}")
            yield f"调用失败: {str(e)}"
    
    async def chat(
        self, 
        query: str, 
        session_id: Optional[str] = None
    ) -> str:
        """
        非流式对话 - 返回完整结果
        
        Args:
            query: 用户输入
            session_id: 会话ID
            
        Returns:
            完整的AI回复
        """
        full_content = []
        async for chunk in self.chat_stream(query, session_id):
            if isinstance(chunk, str):
                full_content.append(chunk)
        return "".join(full_content)


# 单例
kuajing_agent_service = KuajingAgentService()
