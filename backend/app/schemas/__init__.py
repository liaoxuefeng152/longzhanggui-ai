"""
Pydantic Schemas
"""
from app.schemas.user import (
    UserBase, UserCreate, UserLogin, UserResponse, TokenResponse,
    FeishuUserBase, FeishuUserCreate, FeishuUserUpdate, FeishuUserResponse, FeishuUserListResponse,
    PackageBase, PackageCreate, PackageUpdate, PackageResponse
)
from app.schemas.agent import (
    ModelBase, ModelCreate, ModelUpdate, ModelResponse, ModelTestResponse,
    PromptBase, PromptCreate, PromptUpdate, PromptResponse,
    AgentBase, AgentCreate, AgentUpdate, AgentResponse, AgentConfigUpdate,
    TaskStartRequest, TaskStartResponse, TaskStopRequest, TaskResponse, TaskListResponse,
    AIInvokeRequest, AIInvokeResponse
)
from app.schemas.business import (
    PlatformBindingBase, PlatformBindingCreate, PlatformBindingUpdate, PlatformBindingResponse,
    ProductBase, ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    ProductBatchImport, ProductBatchImportResponse,
    OrderBase, OrderCreate, OrderStatusUpdate, OrderResponse, OrderListResponse, OrderStats,
    TicketBase, TicketCreate, TicketUpdate, TicketClose, TicketResponse, TicketListResponse,
    SettingsUpdate, FeishuConfigUpdate
)

__all__ = [
    # 用户
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "TokenResponse",
    "FeishuUserBase",
    "FeishuUserCreate",
    "FeishuUserUpdate",
    "FeishuUserResponse",
    "FeishuUserListResponse",
    "PackageBase",
    "PackageCreate",
    "PackageUpdate",
    "PackageResponse",
    # 智能体
    "ModelBase",
    "ModelCreate",
    "ModelUpdate",
    "ModelResponse",
    "ModelTestResponse",
    "PromptBase",
    "PromptCreate",
    "PromptUpdate",
    "PromptResponse",
    "AgentBase",
    "AgentCreate",
    "AgentUpdate",
    "AgentResponse",
    "AgentConfigUpdate",
    "TaskStartRequest",
    "TaskStartResponse",
    "TaskStopRequest",
    "TaskResponse",
    "TaskListResponse",
    "AIInvokeRequest",
    "AIInvokeResponse",
    # 业务
    "PlatformBindingBase",
    "PlatformBindingCreate",
    "PlatformBindingUpdate",
    "PlatformBindingResponse",
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    "ProductListResponse",
    "ProductBatchImport",
    "ProductBatchImportResponse",
    "OrderBase",
    "OrderCreate",
    "OrderStatusUpdate",
    "OrderResponse",
    "OrderListResponse",
    "OrderStats",
    "TicketBase",
    "TicketCreate",
    "TicketUpdate",
    "TicketClose",
    "TicketResponse",
    "TicketListResponse",
    "SettingsUpdate",
    "FeishuConfigUpdate",
]
