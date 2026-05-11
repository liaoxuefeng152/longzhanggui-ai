"""
任务日志API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime
import json

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.agent import Task, TaskLog, Agent

router = APIRouter(prefix="/task-logs", tags=["任务日志"])


@router.get("")
async def get_task_logs(
    user_id: Optional[str] = None,
    agent_id: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取任务日志列表"""
    query = select(TaskLog)
    count_query = select(func.count(TaskLog.id))
    
    # 过滤条件
    if user_id:
        query = query.where(TaskLog.user_id == user_id)
        count_query = count_query.where(TaskLog.user_id == user_id)
    
    if agent_id:
        query = query.where(TaskLog.agent_id == agent_id)
        count_query = count_query.where(TaskLog.agent_id == agent_id)
    
    if status:
        query = query.where(TaskLog.status == status)
        count_query = count_query.where(TaskLog.status == status)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        query = query.where(TaskLog.created_at >= start_dt)
        count_query = count_query.where(TaskLog.created_at >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        query = query.where(TaskLog.created_at <= end_dt)
        count_query = count_query.where(TaskLog.created_at <= end_dt)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(TaskLog.created_at.desc())
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return {
        "items": [
            {
                "id": log.id,
                "task_id": log.task_id,
                "agent_id": log.agent_id,
                "user_id": log.user_id,
                "action": log.action,
                "status": log.status,
                "input": json.loads(log.input) if log.input else None,
                "output": json.loads(log.output) if log.output else None,
                "error": log.error,
                "duration": log.duration,
                "tokens_used": log.tokens_used,
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ],
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/{log_id}")
async def get_task_log(
    log_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取任务日志详情"""
    result = await db.execute(
        select(TaskLog).where(TaskLog.id == log_id)
    )
    log = result.scalar_one_or_none()
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="日志不存在"
        )
    
    return {
        "id": log.id,
        "task_id": log.task_id,
        "agent_id": log.agent_id,
        "user_id": log.user_id,
        "action": log.action,
        "status": log.status,
        "input": json.loads(log.input) if log.input else None,
        "output": json.loads(log.output) if log.output else None,
        "error": log.error,
        "duration": log.duration,
        "tokens_used": log.tokens_used,
        "created_at": log.created_at.isoformat()
    }


@router.post("/{log_id}/retry")
async def retry_task(
    log_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """重试任务"""
    result = await db.execute(
        select(TaskLog).where(TaskLog.id == log_id)
    )
    log = result.scalar_one_or_none()
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="日志不存在"
        )
    
    # 获取原任务
    task_result = await db.execute(
        select(Task).where(Task.id == log.task_id)
    )
    original_task = task_result.scalar_one_or_none()
    
    if not original_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="原任务不存在"
        )
    
    # 创建新任务
    new_task = Task(
        agent_id=original_task.agent_id,
        user_id=original_task.user_id,
        status="pending",
        input=original_task.input,
    )
    
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    
    # TODO: 实际执行任务
    
    return {
        "success": True,
        "task_id": new_task.id,
        "message": "任务已重新创建"
    }


@router.get("/stats/summary")
async def get_log_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取任务统计"""
    # 默认最近7天
    if not start_date:
        start_date = (datetime.now() - timedelta(days=7)).isoformat()
    if not end_date:
        end_date = datetime.now().isoformat()
    
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date)
    
    # 总任务数
    total_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.created_at >= start_dt,
            Task.created_at <= end_dt
        )
    )
    total_tasks = total_result.scalar() or 0
    
    # 成功任务数
    success_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.created_at >= start_dt,
            Task.created_at <= end_dt,
            Task.status == "completed"
        )
    )
    success_tasks = success_result.scalar() or 0
    
    # 失败任务数
    failed_result = await db.execute(
        select(func.count(Task.id)).where(
            Task.created_at >= start_dt,
            Task.created_at <= end_dt,
            Task.status == "failed"
        )
    )
    failed_tasks = failed_result.scalar() or 0
    
    # 平均耗时
    avg_result = await db.execute(
        select(func.avg(TaskLog.duration)).where(
            TaskLog.created_at >= start_dt,
            TaskLog.created_at <= end_dt,
            TaskLog.status == "success"
        )
    )
    avg_duration = avg_result.scalar() or 0
    
    # 总Token使用量
    tokens_result = await db.execute(
        select(func.sum(TaskLog.tokens_used)).where(
            TaskLog.created_at >= start_dt,
            TaskLog.created_at <= end_dt
        )
    )
    total_tokens = tokens_result.scalar() or 0
    
    return {
        "total_tasks": total_tasks,
        "success_tasks": success_tasks,
        "failed_tasks": failed_tasks,
        "success_rate": round(success_tasks / total_tasks * 100, 2) if total_tasks > 0 else 0,
        "avg_duration": int(avg_duration),
        "total_tokens": total_tokens,
        "start_date": start_date,
        "end_date": end_date
    }


from datetime import timedelta
