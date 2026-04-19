"""
AI调用API路由 - 支持云端智能体和豆包大模型
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
import json

from app.core.database import get_db
from app.core.config import settings
from app.api.auth import get_current_user
from app.models.user import User
from app.models.agent import AIModel
from app.schemas.agent import AIInvokeRequest, AIInvokeResponse
from app.services.llm_service import LLMService, LLMModel
from app.services.kuajing_agent_service import kuajing_agent_service

router = APIRouter(prefix="/ai", tags=["AI调用"])


async def generate_stream_doubao(
    messages: list,
    model: str,
    temperature: float,
    thinking: str = "disabled"
) -> AsyncGenerator[str, None]:
    """使用豆包大模型生成流式响应"""
    try:
        llm = LLMService(model=model, temperature=temperature, thinking=thinking)
        
        # 转换消息格式
        langchain_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                langchain_messages.append(SystemMessage(content=content))
            elif role == "assistant":
                langchain_messages.append(AIMessage(content=content))
            else:
                langchain_messages.append(HumanMessage(content=content))
        
        async for chunk in llm.stream_chat(langchain_messages):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


async def generate_stream_kuajing(
    query: str,
    session_id: str = None
) -> AsyncGenerator[str, None]:
    """使用云端跨境AI运营智能体生成流式响应"""
    try:
        async for chunk in kuajing_agent_service.chat_stream(query, session_id):
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        yield "data: [DONE]\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


# 使用云端智能体的场景
KUAJING_SCENES = ["agent", "product_selection", "listing", "image", "video", "customer_service"]


@router.post("/invoke")
async def invoke_ai(
    request: AIInvokeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """调用AI模型 - 优先使用云端智能体"""
    # 获取用户输入
    if request.messages:
        # 从messages提取最后一条用户消息
        user_query = None
        for msg in reversed(request.messages):
            if msg.get("role") == "user":
                user_query = msg.get("content", "")
                break
        if not user_query:
            user_query = str(request.messages)
    elif request.prompt:
        user_query = request.prompt
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请提供prompt或messages参数"
        )
    
    # 判断是否使用云端智能体
    use_kuajing = (
        settings.KUAJING_API_TOKEN and 
        settings.KUAJING_PROJECT_ID and
        (request.scene in KUAJING_SCENES or request.model == "kuajing")
    )
    
    # 使用云端智能体
    if use_kuajing:
        session_id = f"user_{current_user.id}"
        
        # 流式输出
        if request.stream:
            return StreamingResponse(
                generate_stream_kuajing(user_query, session_id),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        
        # 非流式输出
        response_text = await kuajing_agent_service.chat(user_query, session_id)
        return AIInvokeResponse(
            content=response_text,
            model="kuajing-agent",
            tokens_used=0
        )
    
    # 使用本地豆包大模型
    messages = request.messages or [{"role": "user", "content": user_query}]
    model_id = request.model or settings.DEFAULT_MODEL
    
    # 根据场景选择模型
    if not request.model and request.scene:
        scene_model_map = {
            "customer_service": LLMModel.DOUBAO_MINI.value,
            "marketing": LLMModel.DOUBAO_LITE.value,
            "content": LLMModel.DOUBAO_PRO.value,
            "analysis": LLMModel.DOUBAO_PRO.value,
            "translation": LLMModel.DOUBAO_MINI.value,
            "agent": LLMModel.DOUBAO_AGENT.value,
        }
        model_id = scene_model_map.get(request.scene, model_id)
    
    thinking = "enabled" if request.scene in ["analysis", "content"] else "disabled"
    
    # 流式输出
    if request.stream:
        return StreamingResponse(
            generate_stream_doubao(
                messages=messages,
                model=model_id,
                temperature=request.temperature or 0.7,
                thinking=thinking
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    
    # 非流式输出
    try:
        llm = LLMService(model=model_id, temperature=request.temperature or 0.7, thinking=thinking)
        
        langchain_messages = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                langchain_messages.append(SystemMessage(content=content))
            elif role == "assistant":
                langchain_messages.append(AIMessage(content=content))
            else:
                langchain_messages.append(HumanMessage(content=content))
        
        response_text = await llm.chat(langchain_messages)
        
        return AIInvokeResponse(
            content=response_text,
            model=model_id,
            tokens_used=0
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI调用失败: {str(e)}"
        )


@router.post("/chat")
async def chat(
    request: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """AI聊天接口 - 供前端AI助手调用"""
    user_message = request.get("message", "")
    scene = request.get("scene", "agent")
    stream = request.get("stream", True)
    session_id = request.get("session_id") or f"user_{current_user.id}"
    
    if not user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="消息内容不能为空"
        )
    
    # 判断是否使用云端智能体
    use_kuajing = (
        settings.KUAJING_API_TOKEN and 
        settings.KUAJING_PROJECT_ID and
        scene in KUAJING_SCENES
    )
    
    # 使用云端智能体
    if use_kuajing:
        # 流式输出
        if stream:
            return StreamingResponse(
                generate_stream_kuajing(user_message, session_id),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        
        # 非流式输出
        response_text = await kuajing_agent_service.chat(user_message, session_id)
        return {"content": response_text, "model": "kuajing-agent"}
    
    # 使用本地豆包大模型
    messages = [{"role": "user", "content": user_message}]
    
    # 根据场景选择模型
    scene_model_map = {
        "customer_service": LLMModel.DOUBAO_MINI.value,
        "marketing": LLMModel.DOUBAO_LITE.value,
        "content": LLMModel.DOUBAO_PRO.value,
        "analysis": LLMModel.DOUBAO_PRO.value,
        "translation": LLMModel.DOUBAO_MINI.value,
        "agent": LLMModel.DOUBAO_AGENT.value,
    }
    model_id = scene_model_map.get(scene, settings.DEFAULT_MODEL)
    
    # 流式输出
    if stream:
        return StreamingResponse(
            generate_stream_doubao(
                messages=messages,
                model=model_id,
                temperature=0.7,
                thinking="disabled"
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    
    # 非流式输出
    try:
        llm = LLMService(model=model_id, temperature=0.7)
        response_text = await llm.simple_chat(user_message)
        return {"content": response_text, "model": model_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI调用失败: {str(e)}"
        )


@router.get("/models")
async def list_models():
    """列出可用的AI模型"""
    return {
        "models": [
            {
                "id": LLMModel.DOUBAO_PRO.value,
                "name": "豆包 Pro",
                "description": "旗舰模型，适合复杂推理任务",
                "best_for": ["数据分析", "策略制定", "复杂决策"]
            },
            {
                "id": LLMModel.DOUBAO_LITE.value,
                "name": "豆包 Lite",
                "description": "平衡性能和成本",
                "best_for": ["内容创作", "营销文案", "通用任务"]
            },
            {
                "id": LLMModel.DOUBAO_MINI.value,
                "name": "豆包 Mini",
                "description": "快速响应，成本最优",
                "best_for": ["客服对话", "翻译", "简单任务"]
            },
            {
                "id": LLMModel.DOUBAO_AGENT.value,
                "name": "豆包 Agent",
                "description": "Agent优化模型，默认模型",
                "best_for": ["智能体", "工具调用", "多步骤任务"]
            },
            {
                "id": LLMModel.DOUBAO_VISION.value,
                "name": "豆包 Vision",
                "description": "视觉理解模型",
                "best_for": ["图片分析", "OCR", "图片理解"]
            },
            {
                "id": LLMModel.DEEPSEEK_V3.value,
                "name": "DeepSeek V3",
                "description": "DeepSeek推理模型",
                "best_for": ["代码生成", "逻辑推理"]
            },
            {
                "id": LLMModel.KIMI_K25.value,
                "name": "Kimi K2.5",
                "description": "Kimi最强模型",
                "best_for": ["长文本", "代码", "多模态"]
            }
        ]
    }


@router.post("/test")
async def test_llm():
    """测试LLM服务是否正常工作"""
    try:
        llm = LLMService()
        response = await llm.simple_chat(
            "你好，请用一句话介绍你自己。",
            system_prompt="你是一个友好的AI助手。"
        )
        return {
            "success": True,
            "message": "LLM服务正常工作",
            "response": response[:100] + "..." if len(response) > 100 else response
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
