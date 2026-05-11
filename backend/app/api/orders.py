"""
订单中心API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
from datetime import datetime
from decimal import Decimal
import json
import uuid

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.business import Order, Product
from app.schemas.business import (
    OrderCreate, OrderStatusUpdate, OrderResponse, OrderListResponse, OrderStats
)

router = APIRouter(prefix="/orders", tags=["订单中心"])


def generate_order_no():
    """生成订单号"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_str = uuid.uuid4().hex[:6].upper()
    return f"ORD{timestamp}{random_str}"


@router.get("", response_model=OrderListResponse)
async def get_orders(
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    platform: Optional[str] = None,
    user_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取订单列表"""
    query = select(Order)
    count_query = select(func.count(Order.id))
    
    # 关键词搜索
    if keyword:
        query = query.where(
            or_(
                Order.order_no.contains(keyword),
                Order.product_name.contains(keyword)
            )
        )
        count_query = count_query.where(
            or_(
                Order.order_no.contains(keyword),
                Order.product_name.contains(keyword)
            )
        )
    
    # 状态过滤
    if status:
        query = query.where(Order.status == status)
        count_query = count_query.where(Order.status == status)
    
    # 平台过滤
    if platform:
        query = query.where(Order.platform == platform)
        count_query = count_query.where(Order.platform == platform)
    
    # 用户过滤
    if user_id:
        query = query.where(Order.user_id == user_id)
        count_query = count_query.where(Order.user_id == user_id)
    
    # 日期范围
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        query = query.where(Order.created_at >= start_dt)
        count_query = count_query.where(Order.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        query = query.where(Order.created_at <= end_dt)
        count_query = count_query.where(Order.created_at <= end_dt)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Order.created_at.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return OrderListResponse(
        items=[
            {
                **OrderResponse.model_validate(o).model_dump(),
                "amount": float(o.amount) if o.amount else 0,
                "buyer_info": json.loads(o.buyer_info) if o.buyer_info else {}
            }
            for o in orders
        ],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建订单"""
    order = Order(
        order_no=generate_order_no(),
        user_id=current_user.id,
        platform=order_data.platform,
        shop_id=order_data.shop_id,
        product_id=order_data.product_id,
        product_name=order_data.product_name,
        quantity=order_data.quantity,
        amount=order_data.amount,
        buyer_info=json.dumps(order_data.buyer_info) if order_data.buyer_info else None,
    )
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    response = OrderResponse.model_validate(order)
    response.amount = float(order.amount) if order.amount else 0
    response.buyer_info = order_data.buyer_info or {}
    
    return response


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取订单详情"""
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )
    
    return {
        **OrderResponse.model_validate(order).model_dump(),
        "amount": float(order.amount) if order.amount else 0,
        "buyer_info": json.loads(order.buyer_info) if order.buyer_info else {}
    }


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新订单状态"""
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在"
        )
    
    # 更新状态
    order.status = status_data.status
    
    # 如果备注存在，更新到buyer_info中
    if status_data.remark:
        buyer_info = json.loads(order.buyer_info) if order.buyer_info else {}
        buyer_info['remark'] = status_data.remark
        order.buyer_info = json.dumps(buyer_info)
    
    await db.commit()
    await db.refresh(order)
    
    return {
        **OrderResponse.model_validate(order).model_dump(),
        "amount": float(order.amount) if order.amount else 0,
        "buyer_info": json.loads(order.buyer_info) if order.buyer_info else {}
    }


@router.get("/stats/summary", response_model=OrderStats)
async def get_order_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取订单统计"""
    # 默认今天
    if not start_date:
        start_date = datetime.now().date().isoformat()
    if not end_date:
        end_date = datetime.now().date().isoformat()
    
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date + " 23:59:59")
    
    # 总订单数
    total_result = await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= start_dt,
            Order.created_at <= end_dt
        )
    )
    total_orders = total_result.scalar() or 0
    
    # 总金额
    amount_result = await db.execute(
        select(func.sum(Order.amount)).where(
            Order.created_at >= start_dt,
            Order.created_at <= end_dt
        )
    )
    total_amount = amount_result.scalar() or 0
    
    # 待处理订单
    pending_result = await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= start_dt,
            Order.created_at <= end_dt,
            Order.status == "pending"
        )
    )
    pending_orders = pending_result.scalar() or 0
    
    # 已完成订单
    completed_result = await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= start_dt,
            Order.created_at <= end_dt,
            Order.status == "completed"
        )
    )
    completed_orders = completed_result.scalar() or 0
    
    # 已取消订单
    cancelled_result = await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= start_dt,
            Order.created_at <= end_dt,
            Order.status == "cancelled"
        )
    )
    cancelled_orders = cancelled_result.scalar() or 0
    
    return OrderStats(
        total_orders=total_orders,
        total_amount=Decimal(str(total_amount)),
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        cancelled_orders=cancelled_orders
    )


@router.get("/platforms/list")
async def get_platforms(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取平台列表"""
    result = await db.execute(
        select(Order.platform, func.count(Order.id).label('count'))
        .where(Order.platform.isnot(None))
        .group_by(Order.platform)
        .order_by(func.count(Order.id).desc())
    )
    
    platforms = [
        {"name": row[0], "count": row[1]}
        for row in result.all()
    ]
    
    return {"platforms": platforms}
