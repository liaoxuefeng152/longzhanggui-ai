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
    """获取控制台统计数据（按PRD要求）"""
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    
    # 在线模型数 - 从 Agent 表获取启用状态的模型
    online_models_result = await db.execute(
        select(func.count(Agent.id)).where(
            Agent.is_active == True
        )
    )
    online_models = online_models_result.scalar() or 0
    
    # 今日任务总量
    today_tasks_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.created_at >= today_start
        )
    )
    today_task_count = today_tasks_result.scalar() or 0
    
    # 任务成功率 - 完成的任务数 / 总任务数
    total_tasks_result = await db.execute(
        select(func.count(Task.id))
    )
    total_tasks = total_tasks_result.scalar() or 0
    
    completed_tasks_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.status == "completed"
        )
    )
    completed_tasks = completed_tasks_result.scalar() or 0
    
    task_success_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # 付费用户数 - 有付费套餐的用户
    paid_users_result = await db.execute(
        select(func.count(FeishuUser.id)).where(
            FeishuUser.subscription_type != "free",
            FeishuUser.subscription_type.isnot(None)
        )
    )
    paid_users = paid_users_result.scalar() or 0
    
    # 智能助理调用次数 - 特定类型的任务（如问询、日报等）
    assistant_calls_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.created_at >= today_start,
            Task.task_type.in_(["assistant", "query", "daily_report", "inquiry"])
        )
    )
    assistant_calls = assistant_calls_result.scalar() or 0
    
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
    
    # 兼容旧字段
    today_calls = today_task_count
    online_users = online_models  # 暂时复用
    today_orders = today_task_count  # 暂时复用
    
    return {
        # PRD要求的5个核心指标
        "onlineModels": online_models,
        "todayTaskCount": today_task_count,
        "taskSuccessRate": round(task_success_rate, 1),
        "paidUsers": paid_users,
        "assistantCalls": assistant_calls,
        # 兼容旧字段
        "todayCalls": today_calls,
        "onlineUsers": online_users,
        "todayOrders": today_orders,
        "referralUsers": 0,
        # 趋势和用户数据
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
