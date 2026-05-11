"""
ERP系统模型
包含：商品管理、库存管理、采购管理、订单管理、物流管理、财务管理
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


# ===========================================
# 商品管理
# ===========================================

class ERPProduct(Base):
    """ERP商品主表"""
    __tablename__ = "erp_products"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    
    # 内部SKU
    internal_sku = Column(String(100), unique=True, nullable=False)
    
    # 基础信息
    name_zh = Column(String(500), nullable=False)  # 中文商品名
    name_en = Column(String(500), nullable=True)  # 英文商品名
    description = Column(Text, nullable=True)  # 商品描述（采集后填充）
    
    # 分类信息
    category_id = Column(String(36), nullable=True)
    category_name = Column(String(100), nullable=True)
    
    # 来源信息
    source_url = Column(String(500), nullable=True)  # 1688来源链接
    source_id = Column(String(100), nullable=True)  # 1688商品ID
    supplier_name = Column(String(200), nullable=True)  # 供应商名称
    supplier_url = Column(String(500), nullable=True)  # 供应商链接
    
    # 采购成本
    cost_price = Column(Numeric(10, 2), default=0)  # 采购成本价
    domestic_shipping = Column(Numeric(10, 2), default=0)  # 国内运费
    
    # 物流信息
    weight = Column(Numeric(10, 3), default=0)  # 商品重量(kg)
    first_mile_shipping = Column(Numeric(10, 2), default=0)  # 头程运费
    
    # 图片信息
    images = Column(Text, nullable=True)  # 原图JSON数组
    processed_images = Column(Text, nullable=True)  # 处理后图片JSON数组
    image_status = Column(String(20), default="pending")  # pending, processing, done, failed
    
    # 销售信息
    sale_title = Column(String(500), nullable=True)  # Listing标题
    sale_description = Column(Text, nullable=True)  # Listing描述
    sale_keywords = Column(Text, nullable=True)  # 销售关键词JSON数组
    listing_status = Column(String(20), default="pending")  # pending, done
    
    # 定价信息
    suggested_price = Column(Numeric(10, 2), default=0)  # 建议售价
    target_profit_rate = Column(Numeric(5, 2), default=0.30)  # 目标利润率
    
    # 合规信息
    compliance_status = Column(String(20), default="pending")  # pending, passed, failed
    compliance_check_result = Column(Text, nullable=True)  # 合规检查结果JSON
    
    # 状态（工作流状态）
    workflow_status = Column(String(20), default="draft")  # draft, selected, collecting, processing, listing, pricing, ready, published
    status = Column(String(20), default="draft")  # draft, active, inactive, archived
    
    # 关联的选品ID
    selection_id = Column(String(36), nullable=True)  # 关联的选品推荐ID
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    platform_skus = relationship("PlatformSKU", back_populates="product", cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder", back_populates="product")
    collection = relationship("Collection1688", back_populates="product", uselist=False)
    
    @property
    def total_cost(self):
        """总成本"""
        return float(self.cost_price or 0) + float(self.domestic_shipping or 0) + float(self.first_mile_shipping or 0)
    
    @property
    def images_list(self):
        """图片列表"""
        if not self.images:
            return []
        try:
            import json
            return json.loads(self.images)
        except:
            return []
    
    @property
    def processed_images_list(self):
        """处理后图片列表"""
        if not self.processed_images:
            return []
        try:
            import json
            return json.loads(self.processed_images)
        except:
            return []
    
    @property
    def keywords_list(self):
        """关键词列表"""
        if not self.sale_keywords:
            return []
        try:
            import json
            return json.loads(self.sale_keywords)
        except:
            return []


class PlatformSKU(Base):
    """平台SKU映射表"""
    __tablename__ = "platform_skus"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("erp_products.id"), nullable=False)
    
    # 平台信息
    platform = Column(String(20), nullable=False)  # tiktok, amazon, shopee
    shop_id = Column(String(100), nullable=False)  # 店铺ID
    platform_sku_id = Column(String(100), nullable=False)  # 平台SKU ID
    platform_product_id = Column(String(100), nullable=True)  # 平台商品ID
    
    # 销售信息
    sale_price = Column(Numeric(10, 2), default=0)  # 销售价
    currency = Column(String(10), default="USD")
    
    # Listing信息
    listing_url = Column(String(500), nullable=True)
    listing_status = Column(String(20), default="pending")  # pending, active, inactive
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    product = relationship("ERPProduct", back_populates="platform_skus")


# ===========================================
# 库存管理
# ===========================================

class Inventory(Base):
    """库存表"""
    __tablename__ = "inventory"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("erp_products.id"), nullable=False, unique=True)
    
    # 库存数量
    qty_available = Column(Integer, default=0)  # 可售库存
    qty_reserved = Column(Integer, default=0)  # 预占库存
    qty_in_transit = Column(Integer, default=0)  # 在途库存
    
    # 预警设置
    safety_stock = Column(Integer, default=10)  # 安全库存
    reorder_point = Column(Integer, default=20)  # 补货点
    reorder_qty = Column(Integer, default=50)  # 补货数量
    
    # 销售统计
    avg_daily_sales = Column(Numeric(10, 2), default=0)  # 日均销量
    days_of_stock = Column(Integer, default=0)  # 库存天数
    
    # 仓库信息
    warehouse = Column(String(100), default="default")  # 仓库
    location = Column(String(100), nullable=True)  # 库位
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    product = relationship("ERPProduct", back_populates="inventory")
    
    @property
    def is_low_stock(self):
        """是否低库存"""
        return self.qty_available <= self.safety_stock
    
    @property
    def need_reorder(self):
        """是否需要补货"""
        return self.qty_available <= self.reorder_point


# ===========================================
# 采购管理
# ===========================================

class PurchaseOrder(Base):
    """采购单表"""
    __tablename__ = "purchase_orders"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    po_number = Column(String(50), unique=True, nullable=False)  # 采购单号
    product_id = Column(String(36), ForeignKey("erp_products.id"), nullable=False)
    
    # 采购信息
    qty = Column(Integer, default=0)  # 采购数量
    unit_price = Column(Numeric(10, 2), default=0)  # 单价
    total_amount = Column(Numeric(10, 2), default=0)  # 总金额
    
    # 供应商信息
    supplier_name = Column(String(200), nullable=True)
    supplier_url = Column(String(500), nullable=True)
    supplier_contact = Column(String(100), nullable=True)
    
    # 状态
    status = Column(String(20), default="pending")  # pending, paid, shipped, received, cancelled
    
    # 时间信息
    order_date = Column(Date, nullable=True)  # 下单日期
    expected_arrival = Column(Date, nullable=True)  # 预计到货日期
    actual_arrival = Column(Date, nullable=True)  # 实际到货日期
    
    # 备注
    notes = Column(Text, nullable=True)
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    product = relationship("ERPProduct", back_populates="purchase_orders")


# ===========================================
# 订单管理
# ===========================================

class ERPOrder(Base):
    """ERP订单表"""
    __tablename__ = "erp_orders"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    
    # 平台信息
    platform = Column(String(20), nullable=False)  # tiktok, amazon
    shop_id = Column(String(100), nullable=True)
    platform_order_id = Column(String(100), unique=True, nullable=False)  # 平台订单号
    
    # 商品信息
    product_id = Column(String(36), ForeignKey("erp_products.id"), nullable=True)
    sku_id = Column(String(36), ForeignKey("platform_skus.id"), nullable=True)
    product_name = Column(String(500), nullable=True)
    quantity = Column(Integer, default=1)
    
    # 价格信息
    sale_price = Column(Numeric(10, 2), default=0)  # 售价
    total_amount = Column(Numeric(10, 2), default=0)  # 订单总额
    currency = Column(String(10), default="USD")
    
    # 成本信息
    cost_price = Column(Numeric(10, 2), default=0)  # 成本
    shipping_cost = Column(Numeric(10, 2), default=0)  # 运费
    platform_fee = Column(Numeric(10, 2), default=0)  # 平台佣金
    ad_cost = Column(Numeric(10, 2), default=0)  # 广告成本
    profit = Column(Numeric(10, 2), default=0)  # 利润
    
    # 买家信息
    buyer_id = Column(String(100), nullable=True)
    buyer_name = Column(String(200), nullable=True)
    buyer_phone = Column(String(50), nullable=True)
    buyer_address = Column(Text, nullable=True)
    
    # 订单状态
    status = Column(String(20), default="pending")  # pending, paid, shipped, delivered, cancelled
    abnormal_type = Column(String(50), nullable=True)  # 异常类型：address_error, buyer_cancel, timeout
    
    # 时间信息
    order_time = Column(DateTime, nullable=True)  # 下单时间
    pay_time = Column(DateTime, nullable=True)  # 支付时间
    ship_time = Column(DateTime, nullable=True)  # 发货时间
    deliver_time = Column(DateTime, nullable=True)  # 签收时间
    
    # 备注
    notes = Column(Text, nullable=True)
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    product = relationship("ERPProduct")
    logistics = relationship("Logistics", back_populates="order", uselist=False)


# ===========================================
# 物流管理
# ===========================================

class Logistics(Base):
    """物流表"""
    __tablename__ = "logistics"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_id = Column(String(36), ForeignKey("erp_orders.id"), nullable=False)
    
    # 物流信息
    carrier = Column(String(100), nullable=True)  # 物流公司
    tracking_number = Column(String(100), nullable=True)  # 运单号
    shipping_method = Column(String(50), nullable=True)  # 发货方式
    
    # 物流状态
    status = Column(String(20), default="pending")  # pending, picked_up, in_transit, out_for_delivery, delivered, exception
    
    # 物流轨迹
    last_event = Column(Text, nullable=True)  # 最新轨迹JSON
    all_events = Column(Text, nullable=True)  # 全部轨迹JSON
    
    # 时间信息
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    
    # 异常信息
    exception_type = Column(String(50), nullable=True)
    exception_note = Column(Text, nullable=True)
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    order = relationship("ERPOrder", back_populates="logistics")


# ===========================================
# 财务管理
# ===========================================

class FinancialRecord(Base):
    """财务记录表"""
    __tablename__ = "financials"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    
    # 关联信息
    ref_type = Column(String(20), nullable=False)  # order, purchase, refund, ad, other
    ref_id = Column(String(36), nullable=True)  # 关联ID
    product_id = Column(String(36), ForeignKey("erp_products.id"), nullable=True)
    
    # 金额信息
    amount = Column(Numeric(12, 2), default=0)  # 金额（原始货币）
    currency = Column(String(10), default="USD")
    amount_rmb = Column(Numeric(12, 2), default=0)  # 人民币金额
    exchange_rate = Column(Numeric(10, 4), default=1)  # 汇率
    
    # 类型
    type = Column(String(20), nullable=False)  # income, expense
    category = Column(String(50), nullable=True)  # sales, cost, shipping, fee, ad, refund
    
    # 描述
    description = Column(String(500), nullable=True)
    
    # 日期
    transaction_date = Column(Date, nullable=False)
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    product = relationship("ERPProduct")


class DailyFinanceSummary(Base):
    """每日财务汇总表"""
    __tablename__ = "daily_finance_summary"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    date = Column(Date, nullable=False)
    
    # 收入
    total_sales = Column(Numeric(12, 2), default=0)  # 销售额
    total_orders = Column(Integer, default=0)  # 订单数
    
    # 支出
    total_cost = Column(Numeric(12, 2), default=0)  # 商品成本
    total_shipping = Column(Numeric(12, 2), default=0)  # 运费
    total_platform_fee = Column(Numeric(12, 2), default=0)  # 平台佣金
    total_ad_cost = Column(Numeric(12, 2), default=0)  # 广告成本
    total_refund = Column(Numeric(12, 2), default=0)  # 退款
    
    # 利润
    gross_profit = Column(Numeric(12, 2), default=0)  # 毛利
    net_profit = Column(Numeric(12, 2), default=0)  # 净利
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# ===========================================
# 1688采集记录
# ===========================================

class Collection1688(Base):
    """1688采集记录表"""
    __tablename__ = "collection_1688"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    product_id = Column(String(36), ForeignKey("erp_products.id"), nullable=True)
    
    # 来源信息
    source_url = Column(String(500), nullable=False)
    source_id = Column(String(100), nullable=True)  # 1688商品ID
    
    # 采集数据
    title = Column(String(500), nullable=True)
    price = Column(Numeric(10, 2), default=0)
    images = Column(Text, nullable=True)  # JSON数组
    skus = Column(Text, nullable=True)  # JSON数组
    description = Column(Text, nullable=True)
    supplier_name = Column(String(200), nullable=True)
    supplier_rating = Column(Numeric(3, 2), default=0)
    weight = Column(Numeric(10, 3), default=0)  # 商品重量(kg)
    
    # 状态
    status = Column(String(20), default="pending")  # pending, success, failed
    error_message = Column(Text, nullable=True)
    
    # 时间戳
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    product = relationship("ERPProduct")
