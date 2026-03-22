"""
用户相关Schema
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ===========================================
# 用户相关
# ===========================================
class UserBase(BaseModel):
    phone: str = Field(..., description="手机号")
    nickname: str = Field(..., description="昵称")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="密码")


class UserLogin(BaseModel):
    phone: str = Field(..., description="手机号")
    password: str = Field(..., description="密码")


class UserResponse(UserBase):
    id: str
    role: str
    avatar: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ===========================================
# 飞书用户相关
# ===========================================
class FeishuUserBase(BaseModel):
    open_id: str = Field(..., description="飞书Open ID")
    nickname: Optional[str] = Field(None, description="昵称")
    avatar: Optional[str] = Field(None, description="头像")


class FeishuUserCreate(FeishuUserBase):
    union_id: Optional[str] = None
    mobile: Optional[str] = None
    department_id: Optional[str] = None
    referral_code: Optional[str] = None


class FeishuUserUpdate(BaseModel):
    nickname: Optional[str] = None
    status: Optional[str] = None
    package_id: Optional[str] = None


class FeishuUserResponse(FeishuUserBase):
    id: str
    union_id: Optional[str] = None
    mobile: Optional[str] = None
    department_id: Optional[str] = None
    status: str
    package_id: Optional[str] = None
    call_quota: int
    call_used: int
    referral_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FeishuUserListResponse(BaseModel):
    items: list[FeishuUserResponse]
    total: int
    page: int
    page_size: int


# ===========================================
# 套餐相关
# ===========================================
class PackageBase(BaseModel):
    name: str = Field(..., description="套餐名称")
    price: int = Field(..., description="价格（分）")
    call_quota: int = Field(..., description="调用配额")
    duration: int = Field(..., description="有效期（天）")
    features: Optional[list[str]] = Field(None, description="功能特性")


class PackageCreate(PackageBase):
    pass


class PackageUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[int] = None
    call_quota: Optional[int] = None
    duration: Optional[int] = None
    features: Optional[list[str]] = None
    is_active: Optional[bool] = None


class PackageResponse(PackageBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
