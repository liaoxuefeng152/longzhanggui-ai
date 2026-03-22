"""
依赖注入模块
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.services.user_service import UserService
from app.exceptions.http_exceptions import UnauthorizedException, ForbiddenException


# Bearer认证
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """获取当前用户"""
    if not credentials:
        raise UnauthorizedException(detail="未提供认证信息")
    
    token = credentials.credentials
    
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise UnauthorizedException(detail="无效的Token")
        
        user = await UserService.get_user_by_id(db, int(user_id))
        
        if not user:
            raise UnauthorizedException(detail="用户不存在")
        
        if user.status != "active":
            raise UnauthorizedException(detail="账户已被禁用")
        
        return user
        
    except Exception as e:
        raise UnauthorizedException(detail="Token无效或已过期")


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """获取当前用户（可选）"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except:
        return None


async def get_current_admin(
    user: User = Depends(get_current_user)
) -> User:
    """获取当前管理员用户"""
    if user.role != "admin":
        raise ForbiddenException(detail="需要管理员权限")
    return user


async def check_quota(
    user: User = Depends(get_current_user),
    required: int = 1
) -> User:
    """检查用户额度"""
    if user.call_quota < required:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"调用额度不足，当前额度: {user.call_quota}，需要: {required}"
        )
    return user


class PaginationParams:
    """分页参数"""
    
    def __init__(
        self,
        page: int = 1,
        page_size: int = 20,
        page_size_max: int = 100
    ):
        self.page = max(1, page)
        self.page_size = min(max(1, page_size), page_size_max)
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size
    
    @property
    def limit(self) -> int:
        return self.page_size


def get_pagination(
    page: int = 1,
    page_size: int = 20
) -> PaginationParams:
    """获取分页参数"""
    return PaginationParams(page=page, page_size=page_size)


def get_user_id(user: User = Depends(get_current_user)) -> int:
    """获取用户ID"""
    return user.id


def get_user_role(user: User = Depends(get_current_user)) -> str:
    """获取用户角色"""
    return user.role
