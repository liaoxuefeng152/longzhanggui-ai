"""
AI调用API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import AsyncGenerator
import json
import httpx

from app.core.database import get_db
from app.core.config import settings
from app.api.auth import get_current_user
from app.models.user import User
from app.models.agent import AIModel
from app.schemas.agent import AIInvokeRequest, AIInvokeResponse

router = APIRouter(prefix="/ai", tags=["AI调用"])


async def generate_stream(
    messages: list[dict],
    model: str,
    api_key: str,
    endpoint: str,
    temperature: float,
    max_tokens: int
) -> AsyncGenerator[str, None]:
    """生成流式响应"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{endpoint}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "stream": True
                }
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            yield "data: [DONE]\n\n"
                            break
                        try:
                            chunk = json.loads(data)
                            if chunk.get("choices") and chunk["choices"][0].get("delta", {}).get("content"):
                                content = chunk["choices"][0]["delta"]["content"]
                                yield f"data: {json.dumps({'content': content})}\n\n"
                        except json.JSONDecodeError:
                            continue
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@router.post("/invoke")
async def invoke_ai(
    request: AIInvokeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """调用AI模型"""
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
            "customer_service": "doubao-seed-1-8-251228",
            "marketing": "doubao-seed-2-0-lite-260215",
            "content": "doubao-seed-2-0-pro-260215",
        }
        model_id = scene_model_map.get(request.scene, model_id)
    
    # 获取模型配置
    result = await db.execute(
        select(AIModel).where(
            AIModel.model_id == model_id,
            AIModel.status == "active"
        )
    )
    model_config = result.scalar_one_or_none()
    
    # 确定API配置
    if model_config:
        api_key = model_config.api_key
        endpoint = model_config.endpoint or "https://api.openai.com/v1"
        model_name = model_config.model_id
    else:
        # 使用默认配置
        api_key = settings.OPENAI_API_KEY
        endpoint = settings.OPENAI_BASE_URL
        model_name = model_id
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI模型未配置"
        )
    
    # 流式输出
    if request.stream:
        return StreamingResponse(
            generate_stream(
                messages=messages,
                model=model_name,
                api_key=api_key,
                endpoint=endpoint,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    
    # 非流式输出
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{endpoint}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model_name,
                    "messages": messages,
                    "temperature": request.temperature,
                    "max_tokens": request.max_tokens,
                    "stream": False
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"AI调用失败: {response.text}"
                )
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            tokens_used = data.get("usage", {}).get("total_tokens", 0)
            
            return AIInvokeResponse(
                content=content,
                model=model_name,
                tokens_used=tokens_used
            )
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI调用失败: {str(e)}"
        )
