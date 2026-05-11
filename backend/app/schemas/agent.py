"""
智能体相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime


# ===========================================
# 模型相关
# ===========================================
class ModelBase(BaseModel):
    name: str = Field(..., description="模型名称")
    model_id: str = Field(..., description="模型ID")
    provider: str = Field(..., description="提供商: doubao/openai/deepseek/custom")
    api_key: str = Field(..., description="API密钥")
    endpoint: Optional[str] = Field(None, description="自定义端点")
    daily_limit: int = Field(1000000, description="每日限制")


class ModelCreate(ModelBase):
    pass


class ModelUpdate(BaseModel):
    name: Optional[str] = None
    model_id: Optional[str] = None
    provider: Optional[str] = None
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    daily_limit: Optional[int] = None
    status: Optional[str] = None


class ModelResponse(ModelBase):
    id: str
    today_used: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelTestResponse(BaseModel):
    success: bool
    latency: int  # 毫秒
    message: str


# ===========================================
# Prompt相关
# ===========================================
class PromptBase(BaseModel):
    name: str = Field(..., description="Prompt名称")
    category: str = Field(..., description="分类")
    content: str = Field(..., description="Prompt内容")
    model_id: Optional[str] = Field(None, description="关联模型ID")
    agent_type: Optional[str] = Field(None, description="智能体类型")


class PromptCreate(PromptBase):
    pass


class PromptUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    model_id: Optional[str] = None
    agent_type: Optional[str] = None
    version: Optional[str] = None
    is_active: Optional[bool] = None


class PromptResponse(PromptBase):
    id: str
    version: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===========================================
# 智能体相关
# ===========================================
class AgentBase(BaseModel):
    name: str = Field(..., description="智能体名称")
    type: str = Field(..., description="智能体类型")
    description: Optional[str] = Field(None, description="描述")
    prompt_id: Optional[str] = Field(None, description="关联Prompt ID")
    model_id: Optional[str] = Field(None, description="关联模型ID")
    config: Optional[dict[str, Any]] = Field(None, description="配置")


class AgentCreate(AgentBase):
    pass


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt_id: Optional[str] = None
    model_id: Optional[str] = None
    config: Optional[dict[str, Any]] = None
    status: Optional[str] = None


class AgentResponse(AgentBase):
    id: str
    status: str
    total_calls: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AgentConfigUpdate(BaseModel):
    config: dict[str, Any] = Field(..., description="智能体配置")


# ===========================================
# 任务相关
# ===========================================
class TaskStartRequest(BaseModel):
    params: dict[str, Any] = Field(..., description="任务参数")


class TaskStartResponse(BaseModel):
    task_id: str
    message: str


class TaskStopRequest(BaseModel):
    task_id: str = Field(..., description="任务ID")


class TaskResponse(BaseModel):
    id: str
    agent_id: str
    user_id: str
    status: str
    input: Optional[dict[str, Any]] = None
    output: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    tokens_used: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    page_size: int


# ===========================================
# AI调用相关
# ===========================================
class AIInvokeRequest(BaseModel):
    prompt: Optional[str] = Field(None, description="Prompt文本")
    messages: Optional[list[dict[str, str]]] = Field(None, description="消息列表")
    model: Optional[str] = Field(None, description="指定模型")
    scene: Optional[str] = Field(None, description="场景: customer_service/marketing/content")
    temperature: float = Field(0.7, ge=0, le=2, description="温度参数")
    max_tokens: int = Field(2048, ge=1, le=32000, description="最大Token数")
    stream: bool = Field(True, description="是否流式输出")


class AIInvokeResponse(BaseModel):
    content: str
    model: str
    tokens_used: int
