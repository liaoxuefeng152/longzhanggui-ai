"""
认证中间件
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import re

from app.core.security import decode_access_token
from app.core.config import settings
from loguru import logger


# 不需要认证的路径
PUBLIC_PATHS = [
    "/",
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/send-sms",
    "/api/v1/auth/verify-sms",
    # 1688采集API（临时公开，生产环境需要认证）
    "/api/v1/1688/collect",
    "/api/v1/1688/collect/preview",
    "/api/v1/1688/collect/batch",
    "/api/v1/1688/history",
    "/api/v1/1688/search",
]

# 正则匹配的公开路径
PUBLIC_PATTERNS = [
    r"^/static/.*",
    r"^/favicon\.ico",
]


class AuthMiddleware(BaseHTTPMiddleware):
    """认证中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # 检查是否是公开路径
        path = request.url.path
        
        if self._is_public_path(path):
            return await call_next(request)
        
        # 获取Token
        auth_header = request.headers.get("Authorization")
        
        if not auth_header:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="未提供认证信息",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # 验证Token格式
        if not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="认证格式错误",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        token = auth_header.replace("Bearer ", "")
        
        # 验证Token
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            role = payload.get("role")
            
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="无效的Token"
                )
            
            # 将用户信息存储到请求状态
            request.state.user_id = int(user_id)
            request.state.user_role = role
            
        except Exception as e:
            logger.warning(f"Token验证失败: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token无效或已过期",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return await call_next(request)
    
    def _is_public_path(self, path: str) -> bool:
        """检查是否是公开路径"""
        # 精确匹配
        if path in PUBLIC_PATHS:
            return True
        
        # 正则匹配
        for pattern in PUBLIC_PATTERNS:
            if re.match(pattern, path):
                return True
        
        return False


class AdminOnlyMiddleware(BaseHTTPMiddleware):
    """管理员权限中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # 检查用户角色
        user_role = getattr(request.state, "user_role", None)
        
        if user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="需要管理员权限"
            )
        
        return await call_next(request)
