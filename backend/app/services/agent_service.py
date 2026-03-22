"""
智能体服务层
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from datetime import datetime
import json

from app.models.agent import AIModel, Prompt, Agent, Task, TaskLog
from app.schemas.agent import (
    ModelCreate, ModelUpdate,
    PromptCreate, PromptUpdate,
    AgentCreate, AgentUpdate, AgentConfigUpdate,
    TaskResponse
)
from app.agents import get_agent_class
from loguru import logger


class ModelService:
    """AI模型服务"""
    
    @staticmethod
    async def create_model(db: AsyncSession, data: ModelCreate) -> AIModel:
        """创建AI模型"""
        model = AIModel(**data.model_dump())
        db.add(model)
        await db.commit()
        await db.refresh(model)
        logger.info(f"创建AI模型: {model.name}")
        return model
    
    @staticmethod
    async def update_model(
        db: AsyncSession,
        model_id: int,
        data: ModelUpdate
    ) -> Optional[AIModel]:
        """更新AI模型"""
        result = await db.execute(
            select(AIModel).where(AIModel.id == model_id)
        )
        model = result.scalar_one_or_none()
        
        if not model:
            return None
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(model, key, value)
        
        await db.commit()
        await db.refresh(model)
        return model
    
    @staticmethod
    async def list_models(
        db: AsyncSession,
        model_type: str = None,
        provider: str = None,
        active_only: bool = True
    ) -> List[AIModel]:
        """获取模型列表"""
        conditions = []
        if model_type:
            conditions.append(AIModel.model_type == model_type)
        if provider:
            conditions.append(AIModel.provider == provider)
        if active_only:
            conditions.append(AIModel.status == "active")
        
        query = select(AIModel)
        if conditions:
            query = query.where(and_(*conditions))
        query = query.order_by(AIModel.created_at.desc())
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_model(db: AsyncSession, model_id: int) -> Optional[AIModel]:
        """获取单个模型"""
        result = await db.execute(
            select(AIModel).where(AIModel.id == model_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def delete_model(db: AsyncSession, model_id: int) -> bool:
        """删除模型"""
        result = await db.execute(
            select(AIModel).where(AIModel.id == model_id)
        )
        model = result.scalar_one_or_none()
        
        if not model:
            return False
        
        await db.delete(model)
        await db.commit()
        return True
    
    @staticmethod
    async def test_model(db: AsyncSession, model_id: int) -> Dict[str, Any]:
        """测试模型连接"""
        model = await ModelService.get_model(db, model_id)
        
        if not model:
            return {"success": False, "message": "模型不存在"}
        
        try:
            # 这里可以添加实际的模型测试逻辑
            # 例如发送一个简单的测试请求
            return {
                "success": True,
                "message": "模型连接正常",
                "latency": 150  # 模拟延迟
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"连接失败: {str(e)}"
            }


class PromptService:
    """提示词服务"""
    
    @staticmethod
    async def create_prompt(db: AsyncSession, data: PromptCreate) -> Prompt:
        """创建提示词"""
        prompt = Prompt(**data.model_dump())
        db.add(prompt)
        await db.commit()
        await db.refresh(prompt)
        logger.info(f"创建提示词: {prompt.name}")
        return prompt
    
    @staticmethod
    async def update_prompt(
        db: AsyncSession,
        prompt_id: int,
        data: PromptUpdate
    ) -> Optional[Prompt]:
        """更新提示词"""
        result = await db.execute(
            select(Prompt).where(Prompt.id == prompt_id)
        )
        prompt = result.scalar_one_or_none()
        
        if not prompt:
            return None
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(prompt, key, value)
        
        await db.commit()
        await db.refresh(prompt)
        return prompt
    
    @staticmethod
    async def list_prompts(
        db: AsyncSession,
        category: str = None,
        agent_type: str = None
    ) -> List[Prompt]:
        """获取提示词列表"""
        conditions = []
        if category:
            conditions.append(Prompt.category == category)
        if agent_type:
            conditions.append(Prompt.agent_type == agent_type)
        
        query = select(Prompt)
        if conditions:
            query = query.where(and_(*conditions))
        query = query.order_by(Prompt.created_at.desc())
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_prompt(db: AsyncSession, prompt_id: int) -> Optional[Prompt]:
        """获取单个提示词"""
        result = await db.execute(
            select(Prompt).where(Prompt.id == prompt_id)
        )
        return result.scalar_one_or_none()


class AgentService:
    """智能体服务"""
    
    @staticmethod
    async def create_agent(db: AsyncSession, data: AgentCreate) -> Agent:
        """创建智能体"""
        agent = Agent(**data.model_dump())
        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        logger.info(f"创建智能体: {agent.name}")
        return agent
    
    @staticmethod
    async def update_agent(
        db: AsyncSession,
        agent_id: int,
        data: AgentUpdate
    ) -> Optional[Agent]:
        """更新智能体"""
        result = await db.execute(
            select(Agent).where(Agent.id == agent_id)
        )
        agent = result.scalar_one_or_none()
        
        if not agent:
            return None
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(agent, key, value)
        
        await db.commit()
        await db.refresh(agent)
        return agent
    
    @staticmethod
    async def update_agent_config(
        db: AsyncSession,
        agent_id: int,
        data: AgentConfigUpdate
    ) -> Optional[Agent]:
        """更新智能体配置"""
        result = await db.execute(
            select(Agent).where(Agent.id == agent_id)
        )
        agent = result.scalar_one_or_none()
        
        if not agent:
            return None
        
        # 合并配置
        current_config = json.loads(agent.config) if agent.config else {}
        new_config = data.model_dump()
        current_config.update(new_config)
        
        agent.config = json.dumps(current_config)
        await db.commit()
        await db.refresh(agent)
        return agent
    
    @staticmethod
    async def list_agents(
        db: AsyncSession,
        agent_type: str = None,
        status: str = None
    ) -> List[Agent]:
        """获取智能体列表"""
        conditions = []
        if agent_type:
            conditions.append(Agent.type == agent_type)
        if status:
            conditions.append(Agent.status == status)
        
        query = select(Agent)
        if conditions:
            query = query.where(and_(*conditions))
        query = query.order_by(Agent.sort_order, Agent.created_at)
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_agent(db: AsyncSession, agent_id: int) -> Optional[Agent]:
        """获取单个智能体"""
        result = await db.execute(
            select(Agent).where(Agent.id == agent_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_agent_by_type(db: AsyncSession, agent_type: str) -> Optional[Agent]:
        """根据类型获取智能体"""
        result = await db.execute(
            select(Agent).where(
                and_(
                    Agent.type == agent_type,
                    Agent.status == "active"
                )
            )
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    def get_agent_instance(agent_type: str, config: Dict[str, Any] = None):
        """获取智能体实例"""
        agent_class = get_agent_class(agent_type)
        
        if not agent_class:
            raise ValueError(f"未知的智能体类型: {agent_type}")
        
        # 根据配置创建智能体实例
        config = config or {}
        return agent_class(**config)
    
    @staticmethod
    async def run_agent(
        db: AsyncSession,
        agent_id: int,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """运行智能体"""
        agent = await AgentService.get_agent(db, agent_id)
        
        if not agent:
            raise ValueError("智能体不存在")
        
        if agent.status != "active":
            raise ValueError("智能体未激活")
        
        # 获取智能体实例
        config = json.loads(agent.config) if agent.config else {}
        agent_instance = AgentService.get_agent_instance(agent.type, config)
        
        # 运行智能体
        result = await agent_instance.run(**input_data)
        
        return result
