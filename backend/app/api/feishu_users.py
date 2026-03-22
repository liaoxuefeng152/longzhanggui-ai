"""
飞书用户管理API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
import uuid

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User, FeishuUser, Package
from app.schemas.user import (
    FeishuUserCreate, FeishuUserUpdate, FeishuUserResponse, FeishuUserListResponse
)

router = APIRouter(prefix="/feishu-users", tags=["飞书用户"])


def generate_referral_code():
    """生成推荐码"""
    return uuid.uuid4().hex[:8].upper()


@router.get("", response_model=FeishuUserListResponse)
async def get_feishu_users(
    page: int = 1,
    page_size: int = 20,
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取飞书用户列表"""
    query = select(FeishuUser)
    count_query = select(func.count(FeishuUser.id))
    
    # 关键词搜索
    if keyword:
        query = query.where(
            or_(
                FeishuUser.nickname.contains(keyword),
                FeishuUser.mobile.contains(keyword),
                FeishuUser.open_id.contains(keyword)
            )
        )
        count_query = count_query.where(
            or_(
                FeishuUser.nickname.contains(keyword),
                FeishuUser.mobile.contains(keyword),
                FeishuUser.open_id.contains(keyword)
            )
        )
    
    # 状态过滤
    if status:
        query = query.where(FeishuUser.status == status)
        count_query = count_query.where(FeishuUser.status == status)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(FeishuUser.created_at.desc())
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return FeishuUserListResponse(
        items=[FeishuUserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{user_id}", response_model=FeishuUserResponse)
async def get_feishu_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取飞书用户详情"""
    result = await db.execute(
        select(FeishuUser).where(FeishuUser.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    return FeishuUserResponse.model_validate(user)


@router.post("", response_model=FeishuUserResponse)
async def create_feishu_user(
    user_data: FeishuUserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建飞书用户"""
    # 检查open_id是否已存在
    result = await db.execute(
        select(FeishuUser).where(FeishuUser.open_id == user_data.open_id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该飞书用户已存在"
        )
    
    # 生成推荐码
    referral_code = generate_referral_code()
    
    user = FeishuUser(
        open_id=user_data.open_id,
        union_id=user_data.union_id,
        nickname=user_data.nickname,
        avatar=user_data.avatar,
        mobile=user_data.mobile,
        department_id=user_data.department_id,
        referral_code=referral_code,
        referred_by=user_data.referral_code,
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return FeishuUserResponse.model_validate(user)


@router.put("/{user_id}", response_model=FeishuUserResponse)
async def update_feishu_user(
    user_id: str,
    user_data: FeishuUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新飞书用户信息"""
    result = await db.execute(
        select(FeishuUser).where(FeishuUser.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 更新字段
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    return FeishuUserResponse.model_validate(user)


@router.put("/{user_id}/quota")
async def update_user_quota(
    user_id: str,
    quota: int,
    reason: str = "",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """调整用户配额"""
    result = await db.execute(
        select(FeishuUser).where(FeishuUser.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 更新配额
    user.call_quota = quota
    
    # TODO: 记录配额变更日志
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "success": True,
        "message": "配额调整成功",
        "user": FeishuUserResponse.model_validate(user)
    }


@router.get("/{user_id}/usage")
async def get_user_usage(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户使用统计"""
    from app.models.agent import Task
    from datetime import datetime, timedelta
    
    result = await db.execute(
        select(FeishuUser).where(FeishuUser.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )
    
    # 今日使用量
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    today_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.created_at >= today_start
        )
    )
    today_calls = today_result.scalar() or 0
    
    # 本月使用量
    month_start = datetime.combine(today.replace(day=1), datetime.min.time())
    
    month_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.user_id == user_id,
            Task.created_at >= month_start
        )
    )
    month_calls = month_result.scalar() or 0
    
    return {
        "quota": user.call_quota,
        "used": user.call_used,
        "remaining": max(0, user.call_quota - user.call_used),
        "today_calls": today_calls,
        "month_calls": month_calls
    }
