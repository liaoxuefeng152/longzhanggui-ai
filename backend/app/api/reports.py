"""
数据报表API路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User, FeishuUser
from app.models.agent import Task, Agent
from app.models.business import Order

router = APIRouter(prefix="/reports", tags=["数据报表"])


@router.get("/overview")
async def get_overview(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取报表概览"""
    # 默认最近30天
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).date().isoformat()
    if not end_date:
        end_date = datetime.now().date().isoformat()
    
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date + " 23:59:59")
    
    # 用户统计
    total_users_result = await db.execute(select(func.count(FeishuUser.id)))
    total_users = total_users_result.scalar() or 0
    
    new_users_result = await db.execute(
        select(func.count(FeishuUser.id)).where(
            FeishuUser.created_at >= start_dt,
            FeishuUser.created_at <= end_dt
        )
    )
    new_users = new_users_result.scalar() or 0
    
    # 任务统计
    total_tasks_result = await db.execute(select(func.count(Task.id)))
    total_tasks = total_tasks_result.scalar() or 0
    
    period_tasks_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.created_at >= start_dt,
            Task.created_at <= end_dt
        )
    )
    period_tasks = period_tasks_result.scalar() or 0
    
    completed_tasks_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.created_at >= start_dt,
            Task.created_at <= end_dt,
            Task.status == "completed"
        )
    )
    completed_tasks = completed_tasks_result.scalar() or 0
    
    # 订单统计
    total_orders_result = await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= start_dt,
            Order.created_at <= end_dt
        )
    )
    total_orders = total_orders_result.scalar() or 0
    
    total_amount_result = await db.execute(
        select(func.sum(Order.amount)).where(
            Order.created_at >= start_dt,
            Order.created_at <= end_dt
        )
    )
    total_amount = float(total_amount_result.scalar() or 0)
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "users": {
            "total": total_users,
            "new": new_users
        },
        "tasks": {
            "total": total_tasks,
            "period": period_tasks,
            "completed": completed_tasks,
            "completion_rate": round(completed_tasks / period_tasks * 100, 2) if period_tasks > 0 else 0
        },
        "orders": {
            "total": total_orders,
            "amount": total_amount
        }
    }


@router.get("/usage")
async def get_usage_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    granularity: str = "day",  # day, week, month
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取使用量统计"""
    # 默认最近7天
    if not start_date:
        start_date = (datetime.now() - timedelta(days=7)).date().isoformat()
    if not end_date:
        end_date = datetime.now().date().isoformat()
    
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date + " 23:59:59")
    
    # 按天统计
    usage_data = []
    current_dt = start_dt
    
    while current_dt <= end_dt:
        day_start = current_dt.replace(hour=0, minute=0, second=0)
        day_end = current_dt.replace(hour=23, minute=59, second=59)
        
        # 任务数
        tasks_result = await db.execute(
            select(func.count(Task.id)).where(
                Task.created_at >= day_start,
                Task.created_at <= day_end
            )
        )
        tasks_count = tasks_result.scalar() or 0
        
        # 成功任务数
        success_result = await db.execute(
            select(func.count(Task.id)).where(
                Task.created_at >= day_start,
                Task.created_at <= day_end,
                Task.status == "completed"
            )
        )
        success_count = success_result.scalar() or 0
        
        usage_data.append({
            "date": current_dt.strftime("%Y-%m-%d"),
            "tasks": tasks_count,
            "success": success_count,
            "success_rate": round(success_count / tasks_count * 100, 2) if tasks_count > 0 else 0
        })
        
        current_dt += timedelta(days=1)
    
    return {
        "granularity": granularity,
        "start_date": start_date,
        "end_date": end_date,
        "data": usage_data
    }


@router.get("/revenue")
async def get_revenue_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    granularity: str = "day",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取收入统计"""
    # 默认最近30天
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).date().isoformat()
    if not end_date:
        end_date = datetime.now().date().isoformat()
    
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date + " 23:59:59")
    
    # 按天统计
    revenue_data = []
    current_dt = start_dt
    
    while current_dt <= end_dt:
        day_start = current_dt.replace(hour=0, minute=0, second=0)
        day_end = current_dt.replace(hour=23, minute=59, second=59)
        
        # 订单数
        orders_result = await db.execute(
            select(func.count(Order.id)).where(
                Order.created_at >= day_start,
                Order.created_at <= day_end
            )
        )
        orders_count = orders_result.scalar() or 0
        
        # 金额
        amount_result = await db.execute(
            select(func.sum(Order.amount)).where(
                Order.created_at >= day_start,
                Order.created_at <= day_end
            )
        )
        amount = float(amount_result.scalar() or 0)
        
        revenue_data.append({
            "date": current_dt.strftime("%Y-%m-%d"),
            "orders": orders_count,
            "amount": amount
        })
        
        current_dt += timedelta(days=1)
    
    # 汇总
    total_orders = sum(d["orders"] for d in revenue_data)
    total_amount = sum(d["amount"] for d in revenue_data)
    
    return {
        "granularity": granularity,
        "start_date": start_date,
        "end_date": end_date,
        "summary": {
            "total_orders": total_orders,
            "total_amount": total_amount,
            "avg_order_amount": round(total_amount / total_orders, 2) if total_orders > 0 else 0
        },
        "data": revenue_data
    }


@router.get("/agents")
async def get_agent_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取智能体调用统计"""
    # 默认最近7天
    if not start_date:
        start_date = (datetime.now() - timedelta(days=7)).date().isoformat()
    if not end_date:
        end_date = datetime.now().date().isoformat()
    
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date + " 23:59:59")
    
    # 获取所有智能体
    agents_result = await db.execute(select(Agent))
    agents = agents_result.scalars().all()
    
    agent_stats = []
    
    for agent in agents:
        # 调用次数
        calls_result = await db.execute(
            select(func.count(Task.id)).where(
                Task.agent_id == agent.id,
                Task.created_at >= start_dt,
                Task.created_at <= end_dt
            )
        )
        calls = calls_result.scalar() or 0
        
        # 成功次数
        success_result = await db.execute(
            select(func.count(Task.id)).where(
                Task.agent_id == agent.id,
                Task.created_at >= start_dt,
                Task.created_at <= end_dt,
                Task.status == "completed"
            )
        )
        success = success_result.scalar() or 0
        
        agent_stats.append({
            "id": agent.id,
            "name": agent.name,
            "type": agent.type,
            "calls": calls,
            "success": success,
            "success_rate": round(success / calls * 100, 2) if calls > 0 else 0,
            "total_calls": agent.total_calls
        })
    
    # 按调用次数排序
    agent_stats.sort(key=lambda x: x["calls"], reverse=True)
    
    return {
        "start_date": start_date,
        "end_date": end_date,
        "agents": agent_stats
    }
