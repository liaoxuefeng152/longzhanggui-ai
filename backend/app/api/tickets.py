"""
客服工单API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.business import Ticket
from app.schemas.business import (
    TicketCreate, TicketUpdate, TicketClose, TicketResponse, TicketListResponse
)

router = APIRouter(prefix="/customer-tickets", tags=["客服工单"])


@router.get("", response_model=TicketListResponse)
async def get_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    user_id: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取工单列表"""
    query = select(Ticket)
    count_query = select(func.count(Ticket.id))
    
    # 状态过滤
    if status:
        query = query.where(Ticket.status == status)
        count_query = count_query.where(Ticket.status == status)
    
    # 优先级过滤
    if priority:
        query = query.where(Ticket.priority == priority)
        count_query = count_query.where(Ticket.priority == priority)
    
    # 用户过滤
    if user_id:
        query = query.where(Ticket.user_id == user_id)
        count_query = count_query.where(Ticket.user_id == user_id)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Ticket.created_at.desc())
    
    result = await db.execute(query)
    tickets = result.scalars().all()
    
    return TicketListResponse(
        items=[TicketResponse.model_validate(t) for t in tickets],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=TicketResponse)
async def create_ticket(
    ticket_data: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建工单"""
    ticket = Ticket(
        title=ticket_data.title,
        content=ticket_data.content,
        priority=ticket_data.priority,
        user_id=ticket_data.user_id,
        status="open"
    )
    
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    
    return TicketResponse.model_validate(ticket)


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取工单详情"""
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="工单不存在"
        )
    
    return TicketResponse.model_validate(ticket)


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新工单"""
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="工单不存在"
        )
    
    # 更新字段
    update_data = ticket_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)
    
    await db.commit()
    await db.refresh(ticket)
    
    return TicketResponse.model_validate(ticket)


@router.post("/{ticket_id}/close")
async def close_ticket(
    ticket_id: str,
    close_data: TicketClose,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """关闭工单"""
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="工单不存在"
        )
    
    if ticket.status == "closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="工单已关闭"
        )
    
    # 关闭工单
    ticket.status = "closed"
    ticket.resolution = close_data.resolution
    ticket.assigned_to = current_user.id
    
    await db.commit()
    await db.refresh(ticket)
    
    return {
        "success": True,
        "message": "工单已关闭",
        "ticket": TicketResponse.model_validate(ticket)
    }


@router.post("/{ticket_id}/assign")
async def assign_ticket(
    ticket_id: str,
    assignee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """分配工单"""
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )
    ticket = result.scalar_one_or_none()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="工单不存在"
        )
    
    # 检查被分配人是否存在
    assignee_result = await db.execute(
        select(User).where(User.id == assignee_id)
    )
    if not assignee_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="被分配人不存在"
        )
    
    # 分配工单
    ticket.assigned_to = assignee_id
    ticket.status = "in_progress"
    
    await db.commit()
    await db.refresh(ticket)
    
    return {
        "success": True,
        "message": "工单已分配",
        "ticket": TicketResponse.model_validate(ticket)
    }


@router.get("/stats/summary")
async def get_ticket_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取工单统计"""
    # 总工单数
    total_result = await db.execute(select(func.count(Ticket.id)))
    total = total_result.scalar() or 0
    
    # 各状态工单数
    open_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "open")
    )
    open_count = open_result.scalar() or 0
    
    in_progress_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "in_progress")
    )
    in_progress_count = in_progress_result.scalar() or 0
    
    resolved_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "resolved")
    )
    resolved_count = resolved_result.scalar() or 0
    
    closed_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status == "closed")
    )
    closed_count = closed_result.scalar() or 0
    
    # 各优先级工单数
    high_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.priority == "high")
    )
    high_count = high_result.scalar() or 0
    
    medium_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.priority == "medium")
    )
    medium_count = medium_result.scalar() or 0
    
    low_result = await db.execute(
        select(func.count(Ticket.id)).where(Ticket.priority == "low")
    )
    low_count = low_result.scalar() or 0
    
    return {
        "total": total,
        "by_status": {
            "open": open_count,
            "in_progress": in_progress_count,
            "resolved": resolved_count,
            "closed": closed_count
        },
        "by_priority": {
            "high": high_count,
            "medium": medium_count,
            "low": low_count
        }
    }
