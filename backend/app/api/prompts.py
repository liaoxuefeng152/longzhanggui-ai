"""
Prompt管理API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.agent import Prompt
from app.schemas.agent import PromptCreate, PromptUpdate, PromptResponse

router = APIRouter(prefix="/prompts", tags=["Prompt管理"])


@router.get("")
async def get_prompts(
    category: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取Prompt列表"""
    query = select(Prompt)
    count_query = select(func.count(Prompt.id))
    
    if category:
        query = query.where(Prompt.category == category)
        count_query = count_query.where(Prompt.category == category)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Prompt.created_at.desc())
    
    result = await db.execute(query)
    prompts = result.scalars().all()
    
    return {
        "prompts": [PromptResponse.model_validate(p) for p in prompts],
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.post("", response_model=PromptResponse)
async def create_prompt(
    prompt_data: PromptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建Prompt模板"""
    prompt = Prompt(
        name=prompt_data.name,
        category=prompt_data.category,
        content=prompt_data.content,
        model_id=prompt_data.model_id,
        agent_type=prompt_data.agent_type,
    )
    
    db.add(prompt)
    await db.commit()
    await db.refresh(prompt)
    
    return PromptResponse.model_validate(prompt)


@router.get("/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取Prompt详情"""
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()
    
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt不存在"
        )
    
    return PromptResponse.model_validate(prompt)


@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: str,
    prompt_data: PromptUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新Prompt模板"""
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()
    
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt不存在"
        )
    
    # 更新字段
    update_data = prompt_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prompt, field, value)
    
    await db.commit()
    await db.refresh(prompt)
    
    return PromptResponse.model_validate(prompt)


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除Prompt模板"""
    result = await db.execute(
        select(Prompt).where(Prompt.id == prompt_id)
    )
    prompt = result.scalar_one_or_none()
    
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt不存在"
        )
    
    await db.delete(prompt)
    await db.commit()
    
    return {"success": True, "message": "删除成功"}
