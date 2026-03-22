"""
自定义HTTP异常
"""
from fastapi import HTTPException, status
from typing import Any, Optional


class AppException(HTTPException):
    """应用基础异常"""
    
    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: str = "服务器内部错误",
        error_code: str = None,
        headers: dict = None,
        extra: dict = None
    ):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code or f"ERR_{status_code}"
        self.headers = headers
        self.extra = extra or {}
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class NotFoundException(AppException):
    """资源未找到异常"""
    
    def __init__(
        self,
        detail: str = "资源不存在",
        resource_type: str = None,
        resource_id: Any = None
    ):
        if resource_type and resource_id:
            detail = f"{resource_type} (ID: {resource_id}) 不存在"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code="ERR_NOT_FOUND"
        )


class BadRequestException(AppException):
    """请求参数错误异常"""
    
    def __init__(
        self,
        detail: str = "请求参数错误",
        field: str = None,
        value: Any = None
    ):
        extra = {}
        if field:
            extra["field"] = field
        if value is not None:
            extra["value"] = str(value)
        
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code="ERR_BAD_REQUEST",
            extra=extra
        )


class UnauthorizedException(AppException):
    """未授权异常"""
    
    def __init__(
        self,
        detail: str = "未授权访问",
        reason: str = None
    ):
        extra = {}
        if reason:
            extra["reason"] = reason
        
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code="ERR_UNAUTHORIZED",
            headers={"WWW-Authenticate": "Bearer"},
            extra=extra
        )


class ForbiddenException(AppException):
    """禁止访问异常"""
    
    def __init__(
        self,
        detail: str = "禁止访问",
        permission: str = None
    ):
        extra = {}
        if permission:
            extra["required_permission"] = permission
        
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code="ERR_FORBIDDEN",
            extra=extra
        )


class ConflictException(AppException):
    """资源冲突异常"""
    
    def __init__(
        self,
        detail: str = "资源冲突",
        resource_type: str = None,
        field: str = None
    ):
        extra = {}
        if resource_type:
            extra["resource_type"] = resource_type
        if field:
            extra["conflict_field"] = field
        
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code="ERR_CONFLICT",
            extra=extra
        )


class RateLimitException(AppException):
    """请求频率限制异常"""
    
    def __init__(
        self,
        detail: str = "请求过于频繁",
        retry_after: int = 60
    ):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            error_code="ERR_RATE_LIMIT",
            headers={"Retry-After": str(retry_after)}
        )


class ValidationException(AppException):
    """数据验证异常"""
    
    def __init__(
        self,
        detail: str = "数据验证失败",
        errors: list = None
    ):
        extra = {}
        if errors:
            extra["validation_errors"] = errors
        
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            error_code="ERR_VALIDATION",
            extra=extra
        )


class InternalServerException(AppException):
    """服务器内部错误异常"""
    
    def __init__(
        self,
        detail: str = "服务器内部错误",
        error_id: str = None
    ):
        extra = {}
        if error_id:
            extra["error_id"] = error_id
        
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            error_code="ERR_INTERNAL",
            extra=extra
        )


class ServiceUnavailableException(AppException):
    """服务不可用异常"""
    
    def __init__(
        self,
        detail: str = "服务暂时不可用",
        service_name: str = None
    ):
        extra = {}
        if service_name:
            extra["service"] = service_name
        
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail,
            error_code="ERR_SERVICE_UNAVAILABLE",
            extra=extra
        )


class QuotaExceededException(AppException):
    """额度超限异常"""
    
    def __init__(
        self,
        detail: str = "调用额度不足",
        current: int = 0,
        required: int = 1
    ):
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=detail,
            error_code="ERR_QUOTA_EXCEEDED",
            extra={
                "current_quota": current,
                "required_quota": required
            }
        )
