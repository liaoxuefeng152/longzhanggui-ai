"""
智能体API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
import json

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.agent import Agent, Task, AIModel, Prompt
from app.schemas.agent import (
    AgentCreate, AgentUpdate, AgentResponse, AgentConfigUpdate,
    TaskStartRequest, TaskStartResponse, TaskStopRequest, TaskResponse, TaskListResponse
)

router = APIRouter(prefix="/agents", tags=["智能体管理"])


@router.get("")
async def get_agents(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取智能体列表"""
    query = select(Agent)
    count_query = select(func.count(Agent.id))
    
    if status:
        query = query.where(Agent.status == status)
        count_query = count_query.where(Agent.status == status)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Agent.created_at.desc())
    
    result = await db.execute(query)
    agents = result.scalars().all()
    
    # 转换为响应格式
    items = []
    for a in agents:
        item = {
            "id": a.id,
            "name": a.name,
            "type": a.type,
            "description": a.description,
            "prompt_id": a.prompt_id,
            "model_id": a.model_id,
            "config": json.loads(a.config) if a.config else None,
            "status": a.status,
            "total_calls": a.total_calls,
            "created_at": a.created_at,
            "updated_at": a.updated_at,
        }
        items.append(item)
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/{agent_id}")
async def get_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取智能体详情"""
    result = await db.execute(
        select(Agent).where(Agent.id == agent_id)
    )
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="智能体不存在"
        )
    
    return {
        "id": agent.id,
        "name": agent.name,
        "type": agent.type,
        "description": agent.description,
        "prompt_id": agent.prompt_id,
        "model_id": agent.model_id,
        "config": json.loads(agent.config) if agent.config else None,
        "status": agent.status,
        "total_calls": agent.total_calls,
        "created_at": agent.created_at,
        "updated_at": agent.updated_at,
    }


@router.post("")
async def create_agent(
    agent_data: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建智能体"""
    agent = Agent(
        name=agent_data.name,
        type=agent_data.type,
        description=agent_data.description,
        prompt_id=agent_data.prompt_id,
        model_id=agent_data.model_id,
        config=json.dumps(agent_data.config) if agent_data.config else None,
    )
    
    db.add(agent)
    await db.commit()
    await db.refresh(agent)
    
    return {
        "id": agent.id,
        "name": agent.name,
        "type": agent.type,
        "description": agent.description,
        "prompt_id": agent.prompt_id,
        "model_id": agent.model_id,
        "config": json.loads(agent.config) if agent.config else None,
        "status": agent.status,
        "total_calls": agent.total_calls,
        "created_at": agent.created_at,
        "updated_at": agent.updated_at,
    }


@router.put("/{agent_id}/config")
async def update_agent_config(
    agent_id: str,
    config_data: AgentConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新智能体配置"""
    result = await db.execute(
        select(Agent).where(Agent.id == agent_id)
    )
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="智能体不存在"
        )
    
    agent.config = json.dumps(config_data.config)
    await db.commit()
    await db.refresh(agent)
    
    return {
        "id": agent.id,
        "name": agent.name,
        "type": agent.type,
        "description": agent.description,
        "prompt_id": agent.prompt_id,
        "model_id": agent.model_id,
        "config": json.loads(agent.config) if agent.config else None,
        "status": agent.status,
        "total_calls": agent.total_calls,
        "created_at": agent.created_at,
        "updated_at": agent.updated_at,
    }


@router.post("/{agent_id}/start", response_model=TaskStartResponse)
async def start_agent_task(
    agent_id: str,
    task_data: TaskStartRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """启动智能体任务"""
    # 检查智能体是否存在
    result = await db.execute(
        select(Agent).where(Agent.id == agent_id)
    )
    agent = result.scalar_one_or_none()
    
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="智能体不存在"
        )
    
    # 创建任务
    task = Task(
        agent_id=agent_id,
        user_id=current_user.id,
        status="pending",
        input=json.dumps(task_data.params),
    )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    # TODO: 实际执行任务（后续集成LangGraph）
    
    return TaskStartResponse(
        task_id=task.id,
        message="任务已创建，正在处理中"
    )


@router.post("/{agent_id}/stop")
async def stop_agent_task(
    agent_id: str,
    task_data: TaskStopRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """停止智能体任务"""
    result = await db.execute(
        select(Task).where(
            Task.id == task_data.task_id,
            Task.agent_id == agent_id
        )
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    if task.status not in ["pending", "running"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="任务无法停止"
        )
    
    task.status = "failed"
    task.error = "用户手动停止"
    await db.commit()
    
    return {"success": True, "message": "任务已停止"}


@router.get("/tasks")
async def get_tasks(
    agent_id: Optional[str] = None,
    task_status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取任务列表"""
    query = select(Task)
    count_query = select(func.count(Task.id))
    
    if agent_id:
        query = query.where(Task.agent_id == agent_id)
        count_query = count_query.where(Task.agent_id == agent_id)
    
    if task_status:
        query = query.where(Task.status == task_status)
        count_query = count_query.where(Task.status == task_status)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Task.created_at.desc())
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    return {
        "items": [
            {
                **TaskResponse.model_validate(t).model_dump(),
                "input": json.loads(t.input) if t.input else None,
                "output": json.loads(t.output) if t.output else None
            }
            for t in tasks
        ],
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/tasks/{task_id}")
async def get_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取任务详情"""
    result = await db.execute(
        select(Task).where(Task.id == task_id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="任务不存在"
        )
    
    return {
        **TaskResponse.model_validate(task).model_dump(),
        "input": json.loads(task.input) if task.input else None,
        "output": json.loads(task.output) if task.output else None
    }
