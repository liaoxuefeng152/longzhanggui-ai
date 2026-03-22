"""
业务相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from decimal import Decimal


# ===========================================
# 平台绑定相关
# ===========================================
class PlatformBindingBase(BaseModel):
    platform: str = Field(..., description="平台: tiktok/shopee/lazada/tokopedia")
    shop_id: str = Field(..., description="店铺ID")
    shop_name: Optional[str] = Field(None, description="店铺名称")
    account_info: Optional[dict[str, Any]] = Field(None, description="账号信息")


class PlatformBindingCreate(PlatformBindingBase):
    credentials: dict[str, Any] = Field(..., description="认证凭据")


class PlatformBindingUpdate(BaseModel):
    shop_name: Optional[str] = None
    account_info: Optional[dict[str, Any]] = None
    credentials: Optional[dict[str, Any]] = None
    status: Optional[str] = None


class PlatformBindingResponse(PlatformBindingBase):
    id: str
    user_id: str
    status: str
    last_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===========================================
# 商品相关
# ===========================================
class ProductBase(BaseModel):
    name: str = Field(..., description="商品名称")
    sku: Optional[str] = Field(None, description="SKU")
    category: Optional[str] = Field(None, description="分类")
    price: Decimal = Field(Decimal("0"), description="价格")
    stock: int = Field(0, description="库存")
    images: Optional[list[str]] = Field(None, description="图片列表")
    description: Optional[str] = Field(None, description="描述")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    images: Optional[list[str]] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int


class ProductBatchImport(BaseModel):
    products: list[ProductCreate]


class ProductBatchImportResponse(BaseModel):
    success: int
    failed: int
    errors: list[dict[str, Any]]


# ===========================================
# 订单相关
# ===========================================
class OrderBase(BaseModel):
    platform: str = Field(..., description="平台")
    shop_id: Optional[str] = Field(None, description="店铺ID")
    product_name: str = Field(..., description="商品名称")
    quantity: int = Field(1, description="数量")
    amount: Decimal = Field(Decimal("0"), description="金额")
    buyer_info: Optional[dict[str, Any]] = Field(None, description="买家信息")


class OrderCreate(OrderBase):
    product_id: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="订单状态")
    remark: Optional[str] = Field(None, description="备注")


class OrderResponse(OrderBase):
    id: str
    order_no: str
    user_id: str
    product_id: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int


class OrderStats(BaseModel):
    total_orders: int
    total_amount: Decimal
    pending_orders: int
    completed_orders: int
    cancelled_orders: int


# ===========================================
# 工单相关
# ===========================================
class TicketBase(BaseModel):
    title: str = Field(..., description="标题")
    content: str = Field(..., description="内容")
    priority: str = Field("medium", description="优先级: low/medium/high")


class TicketCreate(TicketBase):
    user_id: str = Field(..., description="用户ID")


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class TicketClose(BaseModel):
    resolution: str = Field(..., description="解决方案")


class TicketResponse(TicketBase):
    id: str
    status: str
    user_id: str
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    items: list[TicketResponse]
    total: int
    page: int
    page_size: int


# ===========================================
# 设置相关
# ===========================================
class SettingsUpdate(BaseModel):
    settings: dict[str, Any] = Field(..., description="设置项")


class FeishuConfigUpdate(BaseModel):
    app_id: str = Field(..., description="飞书App ID")
    app_secret: str = Field(..., description="飞书App Secret")
    encrypt_key: Optional[str] = Field(None, description="加密Key")
    verification_token: Optional[str] = Field(None, description="验证Token")
