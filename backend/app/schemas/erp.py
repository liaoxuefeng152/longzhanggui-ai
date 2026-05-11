"""
ERP系统 Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime, date
from decimal import Decimal


# ===========================================
# 商品管理 Schemas
# ===========================================

class ERPProductCreate(BaseModel):
    """创建ERP商品"""
    internal_sku: str = Field(..., description="内部SKU")
    name_zh: str = Field(..., description="中文商品名")
    name_en: Optional[str] = Field(None, description="英文商品名")
    source_url: Optional[str] = Field(None, description="1688来源链接")
    supplier_name: Optional[str] = Field(None, description="供应商名称")
    supplier_url: Optional[str] = Field(None, description="供应商链接")
    cost_price: Decimal = Field(default=0, description="采购成本价")
    domestic_shipping: Decimal = Field(default=0, description="国内运费")
    first_mile_shipping: Decimal = Field(default=0, description="头程运费")
    images: Optional[str] = Field(None, description="原图JSON")
    category_id: Optional[str] = Field(None, description="分类ID")
    category_name: Optional[str] = Field(None, description="分类名称")


class ERPProductUpdate(BaseModel):
    """更新ERP商品"""
    name_zh: Optional[str] = None
    name_en: Optional[str] = None
    source_url: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_url: Optional[str] = None
    cost_price: Optional[Decimal] = None
    domestic_shipping: Optional[Decimal] = None
    first_mile_shipping: Optional[Decimal] = None
    images: Optional[str] = None
    processed_images: Optional[str] = None
    image_status: Optional[str] = None
    compliance_status: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    status: Optional[str] = None


class ERPProductResponse(BaseModel):
    """ERP商品响应"""
    id: str
    user_id: str
    internal_sku: str
    name_zh: str
    name_en: Optional[str]
    source_url: Optional[str]
    supplier_name: Optional[str]
    supplier_url: Optional[str]
    cost_price: Decimal
    domestic_shipping: Decimal
    first_mile_shipping: Decimal
    total_cost: Decimal
    images: Optional[str]
    processed_images: Optional[str]
    image_status: str
    compliance_status: str
    compliance_check_result: Optional[str]
    category_id: Optional[str]
    category_name: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ERPProductListResponse(BaseModel):
    """商品列表响应"""
    items: List[ERPProductResponse]
    total: int
    page: int
    page_size: int


# ===========================================
# 平台SKU Schemas
# ===========================================

class PlatformSKUCreate(BaseModel):
    """创建平台SKU"""
    product_id: str
    platform: str = Field(..., description="平台: tiktok, amazon, shopee")
    shop_id: str = Field(..., description="店铺ID")
    platform_sku_id: str = Field(..., description="平台SKU ID")
    platform_product_id: Optional[str] = None
    sale_price: Decimal = Field(default=0)
    currency: str = Field(default="USD")
    listing_url: Optional[str] = None


class PlatformSKUResponse(BaseModel):
    """平台SKU响应"""
    id: str
    product_id: str
    platform: str
    shop_id: str
    platform_sku_id: str
    platform_product_id: Optional[str]
    sale_price: Decimal
    currency: str
    listing_url: Optional[str]
    listing_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===========================================
# 库存 Schemas
# ===========================================

class InventoryUpdate(BaseModel):
    """更新库存"""
    qty_available: Optional[int] = None
    qty_reserved: Optional[int] = None
    qty_in_transit: Optional[int] = None
    safety_stock: Optional[int] = None
    reorder_point: Optional[int] = None
    reorder_qty: Optional[int] = None
    warehouse: Optional[str] = None
    location: Optional[str] = None


class InventoryResponse(BaseModel):
    """库存响应"""
    id: str
    product_id: str
    qty_available: int
    qty_reserved: int
    qty_in_transit: int
    safety_stock: int
    reorder_point: int
    reorder_qty: int
    avg_daily_sales: Decimal
    days_of_stock: int
    is_low_stock: bool
    need_reorder: bool
    warehouse: str
    location: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===========================================
# 采购单 Schemas
# ===========================================

class PurchaseOrderCreate(BaseModel):
    """创建采购单"""
    product_id: str
    qty: int = Field(..., ge=1)
    unit_price: Decimal
    supplier_name: Optional[str] = None
    supplier_url: Optional[str] = None
    supplier_contact: Optional[str] = None
    expected_arrival: Optional[date] = None
    notes: Optional[str] = None


class PurchaseOrderUpdate(BaseModel):
    """更新采购单"""
    status: Optional[str] = None
    actual_arrival: Optional[date] = None
    notes: Optional[str] = None


class PurchaseOrderResponse(BaseModel):
    """采购单响应"""
    id: str
    po_number: str
    product_id: str
    qty: int
    unit_price: Decimal
    total_amount: Decimal
    supplier_name: Optional[str]
    supplier_url: Optional[str]
    supplier_contact: Optional[str]
    status: str
    order_date: Optional[date]
    expected_arrival: Optional[date]
    actual_arrival: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===========================================
# 订单 Schemas
# ===========================================

class ERPOrderResponse(BaseModel):
    """ERP订单响应"""
    id: str
    user_id: str
    platform: str
    shop_id: Optional[str]
    platform_order_id: str
    product_id: Optional[str]
    sku_id: Optional[str]
    product_name: Optional[str]
    quantity: int
    sale_price: Decimal
    total_amount: Decimal
    currency: str
    cost_price: Decimal
    shipping_cost: Decimal
    platform_fee: Decimal
    ad_cost: Decimal
    profit: Decimal
    buyer_id: Optional[str]
    buyer_name: Optional[str]
    buyer_phone: Optional[str]
    buyer_address: Optional[str]
    status: str
    abnormal_type: Optional[str]
    order_time: Optional[datetime]
    pay_time: Optional[datetime]
    ship_time: Optional[datetime]
    deliver_time: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ERPOrderListResponse(BaseModel):
    """订单列表响应"""
    items: List[ERPOrderResponse]
    total: int
    page: int
    page_size: int


# ===========================================
# 物流 Schemas
# ===========================================

class LogisticsResponse(BaseModel):
    """物流响应"""
    id: str
    order_id: str
    carrier: Optional[str]
    tracking_number: Optional[str]
    shipping_method: Optional[str]
    status: str
    last_event: Optional[str]
    all_events: Optional[str]
    shipped_at: Optional[datetime]
    delivered_at: Optional[datetime]
    exception_type: Optional[str]
    exception_note: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===========================================
# 财务 Schemas
# ===========================================

class FinancialRecordResponse(BaseModel):
    """财务记录响应"""
    id: str
    user_id: str
    ref_type: str
    ref_id: Optional[str]
    product_id: Optional[str]
    amount: Decimal
    currency: str
    amount_rmb: Decimal
    exchange_rate: Decimal
    type: str
    category: Optional[str]
    description: Optional[str]
    transaction_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DailyFinanceSummaryResponse(BaseModel):
    """每日财务汇总响应"""
    id: str
    user_id: str
    date: date
    total_sales: Decimal
    total_orders: int
    total_cost: Decimal
    total_shipping: Decimal
    total_platform_fee: Decimal
    total_ad_cost: Decimal
    total_refund: Decimal
    gross_profit: Decimal
    net_profit: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===========================================
# 1688采集 Schemas
# ===========================================

class Collection1688Create(BaseModel):
    """创建1688采集"""
    source_url: str = Field(..., description="1688商品链接")


class Collection1688Response(BaseModel):
    """1688采集响应"""
    id: str
    user_id: str
    product_id: Optional[str]
    source_url: str
    source_id: Optional[str]
    title: Optional[str]
    price: Decimal
    images: Optional[str]
    skus: Optional[str]
    description: Optional[str]
    supplier_name: Optional[str]
    supplier_rating: Decimal
    status: str
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===========================================
# 智能定价 Schemas
# ===========================================

class PricingRequest(BaseModel):
    """定价请求"""
    product_id: str
    cost_price: Decimal = Field(..., description="采购成本价")
    domestic_shipping: Decimal = Field(default=0, description="国内运费")
    first_mile_shipping: Decimal = Field(default=0, description="头程运费")
    platform_fee_rate: Decimal = Field(default=0.15, description="平台佣金率")
    target_profit_rate: Decimal = Field(default=0.30, description="目标利润率")
    ad_budget_rate: Decimal = Field(default=0.10, description="广告预算占比")
    competitor_price: Optional[Decimal] = Field(None, description="竞品价格")


class PricingResponse(BaseModel):
    """定价响应"""
    product_id: str
    total_cost: Decimal = Field(..., description="总成本")
    target_price: Decimal = Field(..., description="目标售价")
    competitor_price: Optional[Decimal] = Field(None, description="竞品价格")
    suggested_price: Decimal = Field(..., description="建议售价")
    profit_margin: Decimal = Field(..., description="利润率")
    cost_breakdown: dict = Field(..., description="成本明细")
    pricing_basis: str = Field(..., description="定价依据")
