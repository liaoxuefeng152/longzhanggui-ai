"""
任务服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from datetime import datetime
import json
import asyncio
import uuid

from app.models.agent import Task, TaskLog, Agent
from app.schemas.agent import TaskStartRequest, TaskStopRequest
from loguru import logger


class TaskService:
    """任务服务"""
    
    # 运行中的任务缓存
    _running_tasks: Dict[str, asyncio.Task] = {}
    
    @staticmethod
    async def create_task(
        db: AsyncSession,
        user_id: int,
        agent_id: int,
        input_data: Dict[str, Any]
    ) -> Task:
        """创建任务"""
        task = Task(
            task_id=str(uuid.uuid4()),
            user_id=user_id,
            agent_id=agent_id,
            status="pending",
            input_data=json.dumps(input_data)
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)
        
        logger.info(f"创建任务: {task.task_id}")
        return task
    
    @staticmethod
    async def get_task(db: AsyncSession, task_id: str) -> Optional[Task]:
        """获取任务"""
        result = await db.execute(
            select(Task).where(Task.task_id == task_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_task_by_id(db: AsyncSession, id: int) -> Optional[Task]:
        """根据ID获取任务"""
        result = await db.execute(
            select(Task).where(Task.id == id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def list_tasks(
        db: AsyncSession,
        user_id: int = None,
        agent_id: int = None,
        status: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> tuple[List[Task], int]:
        """获取任务列表"""
        conditions = []
        if user_id:
            conditions.append(Task.user_id == user_id)
        if agent_id:
            conditions.append(Task.agent_id == agent_id)
        if status:
            conditions.append(Task.status == status)
        
        # 查询总数
        count_query = select(Task)
        if conditions:
            count_query = count_query.where(and_(*conditions))
        count_result = await db.execute(count_query)
        total = len(count_result.scalars().all())
        
        # 分页查询
        query = select(Task).options(selectinload(Task.agent))
        if conditions:
            query = query.where(and_(*conditions))
        query = query.offset((page - 1) * page_size).limit(page_size)
        query = query.order_by(Task.created_at.desc())
        
        result = await db.execute(query)
        tasks = result.scalars().all()
        
        return list(tasks), total
    
    @staticmethod
    async def start_task(
        db: AsyncSession,
        task_id: str
    ) -> Dict[str, Any]:
        """启动任务"""
        task = await TaskService.get_task(db, task_id)
        
        if not task:
            raise ValueError("任务不存在")
        
        if task.status == "running":
            raise ValueError("任务已在运行中")
        
        # 更新状态
        task.status = "running"
        task.started_at = datetime.now()
        await db.commit()
        
        # 创建日志
        await TaskLogService.create_log(
            db, task.id, "info", f"任务启动: {task.task_id}"
        )
        
        logger.info(f"启动任务: {task.task_id}")
        
        return {
            "task_id": task.task_id,
            "status": "running",
            "started_at": task.started_at.isoformat()
        }
    
    @staticmethod
    async def stop_task(
        db: AsyncSession,
        task_id: str
    ) -> Dict[str, Any]:
        """停止任务"""
        task = await TaskService.get_task(db, task_id)
        
        if not task:
            raise ValueError("任务不存在")
        
        if task.status != "running":
            raise ValueError("任务未在运行")
        
        # 更新状态
        task.status = "stopped"
        task.ended_at = datetime.now()
        await db.commit()
        
        # 创建日志
        await TaskLogService.create_log(
            db, task.id, "warning", f"任务已停止: {task.task_id}"
        )
        
        logger.info(f"停止任务: {task.task_id}")
        
        return {
            "task_id": task.task_id,
            "status": "stopped",
            "ended_at": task.ended_at.isoformat()
        }
    
    @staticmethod
    async def complete_task(
        db: AsyncSession,
        task_id: str,
        output_data: Dict[str, Any],
        success: bool = True
    ) -> Task:
        """完成任务"""
        task = await TaskService.get_task(db, task_id)
        
        if not task:
            raise ValueError("任务不存在")
        
        task.status = "completed" if success else "failed"
        task.output_data = json.dumps(output_data)
        task.ended_at = datetime.now()
        
        if task.started_at:
            task.duration = int((task.ended_at - task.started_at).total_seconds())
        
        await db.commit()
        await db.refresh(task)
        
        # 创建日志
        log_level = "info" if success else "error"
        await TaskLogService.create_log(
            db, task.id, log_level, 
            f"任务{'成功' if success else '失败'}完成: {task.task_id}"
        )
        
        logger.info(f"完成任务: {task.task_id}, 状态: {task.status}")
        return task
    
    @staticmethod
    async def update_task_progress(
        db: AsyncSession,
        task_id: str,
        progress: float,
        message: str = None
    ) -> Task:
        """更新任务进度"""
        task = await TaskService.get_task(db, task_id)
        
        if not task:
            raise ValueError("任务不存在")
        
        task.progress = progress
        await db.commit()
        
        if message:
            await TaskLogService.create_log(db, task.id, "info", message)
        
        return task
    
    @staticmethod
    async def retry_task(db: AsyncSession, task_id: str) -> Task:
        """重试任务"""
        task = await TaskService.get_task(db, task_id)
        
        if not task:
            raise ValueError("任务不存在")
        
        if task.status not in ["failed", "stopped"]:
            raise ValueError("只能重试失败或停止的任务")
        
        # 重置任务状态
        task.status = "pending"
        task.started_at = None
        task.ended_at = None
        task.duration = None
        task.progress = 0
        task.output_data = None
        
        await db.commit()
        await db.refresh(task)
        
        await TaskLogService.create_log(
            db, task.id, "info", f"任务重试: {task.task_id}"
        )
        
        logger.info(f"重试任务: {task.task_id}")
        return task
    
    @staticmethod
    async def delete_task(db: AsyncSession, task_id: str) -> bool:
        """删除任务"""
        task = await TaskService.get_task(db, task_id)
        
        if not task:
            return False
        
        if task.status == "running":
            raise ValueError("无法删除运行中的任务")
        
        await db.delete(task)
        await db.commit()
        
        logger.info(f"删除任务: {task_id}")
        return True


class TaskLogService:
    """任务日志服务"""
    
    @staticmethod
    async def create_log(
        db: AsyncSession,
        task_id: int,
        level: str,
        message: str,
        details: Dict[str, Any] = None
    ) -> TaskLog:
        """创建任务日志"""
        log = TaskLog(
            task_id=task_id,
            level=level,
            message=message,
            details=json.dumps(details) if details else None
        )
        db.add(log)
        await db.commit()
        await db.refresh(log)
        return log
    
    @staticmethod
    async def list_logs(
        db: AsyncSession,
        task_id: int,
        level: str = None,
        page: int = 1,
        page_size: int = 50
    ) -> tuple[List[TaskLog], int]:
        """获取任务日志列表"""
        conditions = [TaskLog.task_id == task_id]
        if level:
            conditions.append(TaskLog.level == level)
        
        # 查询总数
        count_query = select(TaskLog).where(and_(*conditions))
        count_result = await db.execute(count_query)
        total = len(count_result.scalars().all())
        
        # 分页查询
        query = select(TaskLog).where(and_(*conditions))
        query = query.offset((page - 1) * page_size).limit(page_size)
        query = query.order_by(TaskLog.created_at.desc())
        
        result = await db.execute(query)
        logs = result.scalars().all()
        
        return list(logs), total
    
    @staticmethod
    async def get_recent_logs(
        db: AsyncSession,
        task_id: int,
        limit: int = 100
    ) -> List[TaskLog]:
        """获取最近的日志"""
        query = select(TaskLog).where(TaskLog.task_id == task_id)
        query = query.order_by(TaskLog.created_at.desc()).limit(limit)
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def clear_logs(db: AsyncSession, task_id: int) -> int:
        """清除任务日志"""
        query = select(TaskLog).where(TaskLog.task_id == task_id)
        result = await db.execute(query)
        logs = result.scalars().all()
        
        count = len(logs)
        for log in logs:
            await db.delete(log)
        
        await db.commit()
        return count
