"""
Dashboard API路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User, FeishuUser
from app.models.agent import Task, Agent
from app.models.business import Order

router = APIRouter(prefix="/dashboard", tags=["控制台"])


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取控制台统计数据"""
    today = datetime.now().date()
    
    # 今日调用次数
    today_start = datetime.combine(today, datetime.min.time())
    calls_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.created_at >= today_start
        )
    )
    today_calls = calls_result.scalar() or 0
    
    # 在线用户数（近30分钟有活动）
    online_threshold = datetime.now() - timedelta(minutes=30)
    online_result = await db.execute(
        select(func.count(FeishuUser.id)).where(
            FeishuUser.updated_at >= online_threshold
        )
    )
    online_users = online_result.scalar() or 0
    
    # 今日订单数
    orders_result = await db.execute(
        select(func.count(Order.id)).where(
            Order.created_at >= today_start
        )
    )
    today_orders = orders_result.scalar() or 0
    
    # 推荐用户数
    referral_result = await db.execute(
        select(func.count(FeishuUser.id)).where(
            FeishuUser.referred_by.isnot(None)
        )
    )
    referral_users = referral_result.scalar() or 0
    
    # 调用趋势（最近7天）
    trend_data = []
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        date_start = datetime.combine(date, datetime.min.time())
        date_end = datetime.combine(date, datetime.max.time())
        
        count_result = await db.execute(
            select(func.count(Task.id)).where(
                Task.created_at >= date_start,
                Task.created_at <= date_end
            )
        )
        count = count_result.scalar() or 0
        trend_data.append({
            "date": date.strftime("%m-%d"),
            "calls": count
        })
    
    # 最近用户
    recent_users_result = await db.execute(
        select(FeishuUser)
        .order_by(FeishuUser.created_at.desc())
        .limit(5)
    )
    recent_users = recent_users_result.scalars().all()
    
    return {
        "todayCalls": today_calls,
        "onlineUsers": online_users,
        "todayOrders": today_orders,
        "referralUsers": referral_users,
        "callTrend": trend_data,
        "recentUsers": [
            {
                "id": u.id,
                "nickname": u.nickname or "未知用户",
                "avatar": u.avatar,
                "createdAt": u.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for u in recent_users
        ]
    }
