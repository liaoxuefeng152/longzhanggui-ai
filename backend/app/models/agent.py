"""
智能体相关模型
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class ModelProvider(str, str):
    DOUBAO = "doubao"
    OPENAI = "openai"
    DEEPSEEK = "deepseek"
    CUSTOM = "custom"


class ModelStatus(str, str):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"


class AIModel(Base):
    """AI模型配置表"""
    __tablename__ = "models"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    model_id = Column(String(100), nullable=False)
    provider = Column(String(20), nullable=False)
    api_key = Column(String(255), nullable=False)
    endpoint = Column(String(255), nullable=True)
    daily_limit = Column(Integer, default=1000000)
    today_used = Column(Integer, default=0)
    status = Column(String(20), default=ModelStatus.ACTIVE.value)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Prompt(Base):
    """Prompt模板表"""
    __tablename__ = "prompts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    content = Column(Text, nullable=False)
    model_id = Column(String(36), ForeignKey("models.id"), nullable=True)
    agent_type = Column(String(50), nullable=True)
    version = Column(String(20), default="v1.0")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    model = relationship("AIModel", backref="prompts")


class AgentType(str, str):
    PRODUCT_SELECTION = "product-selection"
    IMAGE_DESIGN = "image-design"
    VIDEO_GENERATION = "video-generation"
    LISTING_OPTIMIZATION = "listing-optimization"
    ADVERTISING = "advertising"
    CUSTOMER_SERVICE = "customer-service"
    DATA_REVIEW = "data-review"


class AgentStatus(str, str):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Agent(Base):
    """智能体配置表"""
    __tablename__ = "agents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    type = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    prompt_id = Column(String(36), ForeignKey("prompts.id"), nullable=True)
    model_id = Column(String(36), ForeignKey("models.id"), nullable=True)
    config = Column(Text, nullable=True)  # JSON
    status = Column(String(20), default=AgentStatus.ACTIVE.value)
    total_calls = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    prompt = relationship("Prompt", backref="agents")
    model = relationship("AIModel", backref="agents")


class TaskStatus(str, str):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Task(Base):
    """任务表"""
    __tablename__ = "tasks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    status = Column(String(20), default=TaskStatus.PENDING.value)
    input = Column(Text, nullable=True)  # JSON
    output = Column(Text, nullable=True)  # JSON
    error = Column(Text, nullable=True)
    tokens_used = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # 关联
    agent = relationship("Agent", backref="tasks")
    user = relationship("FeishuUser", backref="tasks")


class TaskLog(Base):
    """任务日志表"""
    __tablename__ = "task_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False)
    agent_id = Column(String(36), nullable=False)
    user_id = Column(String(36), nullable=False)
    action = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False)
    input = Column(Text, nullable=True)  # JSON
    output = Column(Text, nullable=True)  # JSON
    error = Column(Text, nullable=True)
    duration = Column(Integer, default=0)  # 毫秒
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    
    # 关联
    task = relationship("Task", backref="logs")
