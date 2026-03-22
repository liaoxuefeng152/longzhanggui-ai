"""
异常处理器
"""
from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from loguru import logger
import traceback
import uuid

from app.exceptions.http_exceptions import AppException


def setup_exception_handlers(app: FastAPI):
    """设置异常处理器"""
    
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        """应用异常处理"""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail,
                "error_code": exc.error_code,
                "data": exc.extra
            },
            headers=exc.headers
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """请求验证异常处理"""
        errors = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"])
            errors.append({
                "field": field,
                "message": error["msg"],
                "type": error["type"]
            })
        
        logger.warning(f"请求验证失败: {errors}")
        
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "请求参数验证失败",
                "error_code": "ERR_VALIDATION",
                "data": {"errors": errors}
            }
        )
    
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        """数据库异常处理"""
        error_id = str(uuid.uuid4())
        logger.error(f"数据库错误 [{error_id}]: {str(exc)}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "数据库操作失败",
                "error_code": "ERR_DATABASE",
                "data": {"error_id": error_id}
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """通用异常处理"""
        error_id = str(uuid.uuid4())
        
        # 记录完整错误堆栈
        logger.error(
            f"未处理异常 [{error_id}]: {str(exc)}\n"
            f"Traceback:\n{traceback.format_exc()}"
        )
        
        # 生产环境不暴露详细错误
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "服务器内部错误",
                "error_code": "ERR_INTERNAL",
                "data": {"error_id": error_id}
            }
        )


class ExceptionMiddleware:
    """异常处理中间件"""
    
    async def __call__(self, request: Request, call_next):
        try:
            return await call_next(request)
        except AppException as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "success": False,
                    "message": exc.detail,
                    "error_code": exc.error_code,
                    "data": exc.extra
                },
                headers=exc.headers
            )
        except Exception as exc:
            error_id = str(uuid.uuid4())
            logger.error(
                f"中间件捕获异常 [{error_id}]: {str(exc)}\n"
                f"Traceback:\n{traceback.format_exc()}"
            )
            
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "message": "服务器内部错误",
                    "error_code": "ERR_INTERNAL",
                    "data": {"error_id": error_id}
                }
            )
