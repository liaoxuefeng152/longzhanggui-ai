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


# 不需要认证的路径（前缀）
PUBLIC_PATH_PREFIXES = [
    "/api/v1/auth/",
    "/api/v1/1688/",
    "/api/v1/miaoshou/",
    "/api/v1/ai/generate-video",
    "/api/v1/ai/generate-image",
    "/api/v1/ai/process-image",
    "/api/v1/ai/select-products",
    "/api/v1/ai/optimize-listing",
    "/api/v1/ai/calculate-price",
    "/api/v1/ai/customer-reply",
    "/api/v1/ai/chat",
    "/api/v1/erp/products",  # ERP商品读取（前端代理需要）
]

# 不需要认证的路径（精确匹配）
PUBLIC_PATHS = [
    "/",
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/v1/feishu/callback",
    "/api/v1/feishu/webhook",
]

# 正则匹配的公开路径
PUBLIC_PATTERNS = [
    r"^/static/.*",
    r"^/favicon\.ico",
]


class AuthMiddleware(BaseHTTPMiddleware):
    """认证中间件"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # 临时禁用认证，所有请求都通过
        return await call_next(request)
    
    def _is_public_path(self, path: str) -> bool:
        """检查是否是公开路径"""
        # 精确匹配
        if path in PUBLIC_PATHS:
            return True
        
        # 前缀匹配
        for prefix in PUBLIC_PATH_PREFIXES:
            if path.startswith(prefix):
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
