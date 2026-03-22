"""
用户相关模型
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum
import uuid


def generate_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BANNED = "banned"


class User(Base):
    """管理员用户表"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(50), nullable=False)
    role = Column(String(20), default=UserRole.ADMIN.value)
    avatar = Column(String(500), nullable=True)
    status = Column(String(20), default=UserStatus.ACTIVE.value)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class FeishuUserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class FeishuUser(Base):
    """飞书用户表（终端用户）"""
    __tablename__ = "feishu_users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    open_id = Column(String(100), unique=True, nullable=False, index=True)
    union_id = Column(String(100), nullable=True)
    nickname = Column(String(100), nullable=True)
    avatar = Column(String(500), nullable=True)
    mobile = Column(String(20), nullable=True)
    department_id = Column(String(50), nullable=True)
    status = Column(String(20), default=FeishuUserStatus.ACTIVE.value)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=True)
    call_quota = Column(Integer, default=0)
    call_used = Column(Integer, default=0)
    referral_code = Column(String(20), unique=True, nullable=True)
    referred_by = Column(String(36), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    package = relationship("Package", back_populates="users")


class Package(Base):
    """套餐表"""
    __tablename__ = "packages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)  # 单位：分
    call_quota = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=False)  # 天数
    features = Column(Text, nullable=True)  # JSON array
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关联
    users = relationship("FeishuUser", back_populates="package")
