"""
用户相关数据验证模型
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


class UserLogin(BaseModel):
    """用户登录请求"""
    code: str


class UserProfile(BaseModel):
    """用户信息"""
    user_id: int
    openid: str
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    phone_verified: bool = False
    is_member: bool = False
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    """更新用户信息"""
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None


class UserResponse(BaseModel):
    """用户响应"""
    code: int = 0
    msg: str = "success"
    data: UserProfile


class LoginResponse(BaseModel):
    """登录响应"""
    code: int = 0
    msg: str = "success"
    data: dict


class TokenData(BaseModel):
    """Token数据"""
    user_id: Optional[int] = None
    openid: Optional[str] = None


class TokenResponse(BaseModel):
    """Token响应"""
    code: int = 0
    msg: str = "success"
    data: dict


# ===== 套餐相关Schema =====
class PackageStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class PackageType(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class PackageCreate(BaseModel):
    """创建套餐"""
    name: str
    type: PackageType
    price: float
    duration_days: int
    features: List[str] = []
    description: Optional[str] = None
    is_active: bool = True


class PackageUpdate(BaseModel):
    """更新套餐"""
    name: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    features: Optional[List[str]] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class PackageResponse(BaseModel):
    """套餐响应"""
    id: int
    name: str
    type: str
    price: float
    duration_days: int
    features: List[str]
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===== 飞书用户相关Schema =====
class FeishuUserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BANNED = "banned"


class FeishuUserCreate(BaseModel):
    """创建飞书用户"""
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.USER
    referral_code: Optional[str] = None


class FeishuUserUpdate(BaseModel):
    """更新飞书用户"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[FeishuUserStatus] = None
    is_member: Optional[bool] = None
    member_expire: Optional[datetime] = None
    points: Optional[int] = None


class FeishuUserResponse(BaseModel):
    """飞书用户响应"""
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    status: str
    is_member: bool
    member_expire: Optional[datetime] = None
    points: int
    invitation_code: Optional[str] = None
    invited_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FeishuUserListResponse(BaseModel):
    """飞书用户列表响应"""
    code: int = 0
    msg: str = "success"
    data: dict
