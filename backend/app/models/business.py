"""
业务相关模型
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class PlatformBinding(Base):
    """平台绑定表"""
    __tablename__ = "platform_bindings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    platform = Column(String(20), nullable=False)  # tiktok, shopee, lazada, tokopedia
    shop_id = Column(String(100), nullable=False)
    shop_name = Column(String(200), nullable=True)
    account_info = Column(Text, nullable=True)  # JSON
    credentials = Column(Text, nullable=True)  # JSON, 加密存储
    status = Column(String(20), default="active")
    last_sync_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    user = relationship("FeishuUser", backref="platform_bindings")


class Product(Base):
    """商品表"""
    __tablename__ = "products"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    sku = Column(String(100), nullable=True)
    category = Column(String(50), nullable=True)
    price = Column(Numeric(10, 2), default=0)
    stock = Column(Integer, default=0)
    images = Column(Text, nullable=True)  # JSON array
    description = Column(Text, nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    user = relationship("FeishuUser", backref="products")


class Order(Base):
    """订单表"""
    __tablename__ = "orders"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    order_no = Column(String(100), unique=True, nullable=False)
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    platform = Column(String(20), nullable=False)
    shop_id = Column(String(100), nullable=True)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=True)
    product_name = Column(String(200), nullable=True)
    quantity = Column(Integer, default=1)
    amount = Column(Numeric(10, 2), default=0)
    status = Column(String(20), default="pending")
    buyer_info = Column(Text, nullable=True)  # JSON
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    user = relationship("FeishuUser", backref="orders")
    product = relationship("Product", backref="orders")


class Ticket(Base):
    """客服工单表"""
    __tablename__ = "tickets"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="open")
    user_id = Column(String(36), ForeignKey("feishu_users.id"), nullable=False)
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True)
    resolution = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    user = relationship("FeishuUser", backref="tickets")
    assignee = relationship("User", backref="tickets")


class Setting(Base):
    """系统设置表"""
    __tablename__ = "settings"
    
    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(String(500), nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class FeishuConfig(Base):
    """飞书配置表"""
    __tablename__ = "feishu_config"
    
    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class APIStats(Base):
    """API调用统计表"""
    __tablename__ = "api_stats"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    date = Column(DateTime, nullable=False, index=True)
    agent_type = Column(String(50), nullable=True)
    model_id = Column(String(36), nullable=True)
    total_calls = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    fail_count = Column(Integer, default=0)
    avg_duration = Column(Integer, default=0)  # 毫秒
