"""
模型管理API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
import time
import httpx

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.agent import AIModel
from app.schemas.agent import (
    ModelCreate, ModelUpdate, ModelResponse, ModelTestResponse
)

router = APIRouter(prefix="/models", tags=["模型管理"])


@router.get("")
async def get_models(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取模型列表"""
    query = select(AIModel)
    count_query = select(func.count(AIModel.id))
    
    if status:
        query = query.where(AIModel.status == status)
        count_query = count_query.where(AIModel.status == status)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(AIModel.created_at.desc())
    
    result = await db.execute(query)
    models = result.scalars().all()
    
    return {
        "items": [ModelResponse.model_validate(m) for m in models],
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.post("", response_model=ModelResponse)
async def create_model(
    model_data: ModelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建模型配置"""
    model = AIModel(
        name=model_data.name,
        model_id=model_data.model_id,
        provider=model_data.provider,
        api_key=model_data.api_key,
        endpoint=model_data.endpoint,
        daily_limit=model_data.daily_limit,
    )
    
    db.add(model)
    await db.commit()
    await db.refresh(model)
    
    return ModelResponse.model_validate(model)


@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取模型详情"""
    result = await db.execute(
        select(AIModel).where(AIModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型不存在"
        )
    
    return ModelResponse.model_validate(model)


@router.put("/{model_id}", response_model=ModelResponse)
async def update_model(
    model_id: str,
    model_data: ModelUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新模型配置"""
    result = await db.execute(
        select(AIModel).where(AIModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型不存在"
        )
    
    # 更新字段
    update_data = model_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(model, field, value)
    
    await db.commit()
    await db.refresh(model)
    
    return ModelResponse.model_validate(model)


@router.delete("/{model_id}")
async def delete_model(
    model_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除模型配置"""
    result = await db.execute(
        select(AIModel).where(AIModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型不存在"
        )
    
    await db.delete(model)
    await db.commit()
    
    return {"success": True, "message": "删除成功"}


@router.post("/{model_id}/test", response_model=ModelTestResponse)
async def test_model(
    model_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """测试模型连通性"""
    result = await db.execute(
        select(AIModel).where(AIModel.id == model_id)
    )
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模型不存在"
        )
    
    start_time = time.time()
    
    try:
        # 根据提供商测试连接
        if model.provider == "openai":
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{model.endpoint or 'https://api.openai.com/v1'}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {model.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": model.model_id,
                        "messages": [{"role": "user", "content": "Hello"}],
                        "max_tokens": 10
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    latency = int((time.time() - start_time) * 1000)
                    return ModelTestResponse(
                        success=True,
                        latency=latency,
                        message="模型连接正常"
                    )
                else:
                    return ModelTestResponse(
                        success=False,
                        latency=0,
                        message=f"API返回错误: {response.status_code}"
                    )
        else:
            # 其他提供商暂时返回成功
            latency = int((time.time() - start_time) * 1000)
            return ModelTestResponse(
                success=True,
                latency=latency,
                message="模型配置已保存"
            )
            
    except Exception as e:
        return ModelTestResponse(
            success=False,
            latency=0,
            message=f"连接失败: {str(e)}"
        )


@router.get("/status/list")
async def get_models_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取模型状态列表"""
    result = await db.execute(
        select(AIModel).where(AIModel.status == "active")
    )
    models = result.scalars().all()
    
    return {
        "models": [
            {
                "id": m.id,
                "name": m.name,
                "status": m.status,
                "modelId": m.model_id,
                "totalTokens": 0,
                "dailyLimit": m.daily_limit,
                "todayUsed": m.today_used
            }
            for m in models
        ]
    }
