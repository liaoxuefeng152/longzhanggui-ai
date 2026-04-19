"""
AI调用API路由 - 使用豆包大模型
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


@router.post("/invoke")
async def invoke_ai(
    request: AIInvokeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """调用AI模型 - 使用豆包大模型"""
    # 构建消息
    if request.messages:
        messages = request.messages
    elif request.prompt:
        messages = [{"role": "user", "content": request.prompt}]
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请提供prompt或messages参数"
        )
    
    # 确定模型
    model_id = request.model or settings.DEFAULT_MODEL
    
    # 根据场景选择模型（如果没有指定）
    if not request.model and request.scene:
        scene_model_map = {
            "customer_service": LLMModel.DOUBAO_MINI.value,     # 客服 - 快速响应
            "marketing": LLMModel.DOUBAO_LITE.value,           # 营销 - 平衡模型
            "content": LLMModel.DOUBAO_PRO.value,              # 内容创作 - 高质量
            "analysis": LLMModel.DOUBAO_PRO.value,             # 数据分析 - 复杂推理
            "translation": LLMModel.DOUBAO_MINI.value,         # 翻译 - 快速
            "agent": LLMModel.DOUBAO_AGENT.value,              # Agent场景
        }
        model_id = scene_model_map.get(request.scene, model_id)
    
    # 是否启用思考模式
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
