"""
龙掌柜智能运营系统 - 数据模型
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float, ForeignKey, Boolean, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.core.database import Base

# 从各模块导入所有模型
from app.models.user import (
    User, FeishuUser, Package,
    UserRole, UserStatus, FeishuUserStatus
)
from app.models.agent import AIModel, Prompt, Agent, Task, TaskLog
from app.models.business import PlatformBinding, Product, Order, Ticket, Setting, FeishuConfig, APIStats
from app.models.erp import ERPProduct, PlatformSKU, Inventory, PurchaseOrder, ERPOrder, Logistics, FinancialRecord, DailyFinanceSummary, Collection1688

# 导出所有模型
__all__ = [
    "Base",
    "User",
    "FeishuUser",
    "Package",
    "UserRole",
    "UserStatus",
    "FeishuUserStatus",
    "AIModel",
    "Prompt",
    "Agent",
    "Task",
    "TaskLog",
    "PlatformBinding",
    "Product",
    "Order",
    "Ticket",
    "Setting",
    "FeishuConfig",
    "APIStats",
    "ERPProduct",
    "PlatformSKU",
    "Inventory",
    "PurchaseOrder",
    "ERPOrder",
    "Logistics",
    "FinancialRecord",
    "DailyFinanceSummary",
    "Collection1688",
]
