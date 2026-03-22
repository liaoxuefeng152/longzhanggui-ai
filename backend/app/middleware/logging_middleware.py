"""
日志中间件
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
import time
import json

from loguru import logger
from app.utils.helpers import get_client_ip


class LoggingMiddleware(BaseHTTPMiddleware):
    """请求日志中间件"""
    
    # 不记录日志的路径
    SKIP_PATHS = [
        "/health",
        "/favicon.ico",
    ]
    
    async def dispatch(self, request: Request, call_next: Callable):
        # 检查是否跳过
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)
        
        # 记录开始时间
        start_time = time.time()
        
        # 获取请求信息
        client_ip = get_client_ip(request)
        method = request.method
        path = request.url.path
        query = str(request.query_params)
        
        # 记录请求日志
        logger.info(
            f"请求开始 | {method} {path} | IP: {client_ip} | Query: {query}"
        )
        
        # 处理请求
        try:
            response = await call_next(request)
            
            # 计算处理时间
            process_time = time.time() - start_time
            
            # 记录响应日志
            logger.info(
                f"请求完成 | {method} {path} | "
                f"状态: {response.status_code} | "
                f"耗时: {process_time:.3f}s"
            )
            
            # 添加处理时间头
            response.headers["X-Process-Time"] = f"{process_time:.3f}"
            
            return response
            
        except Exception as e:
            # 记录错误日志
            process_time = time.time() - start_time
            logger.error(
                f"请求异常 | {method} {path} | "
                f"耗时: {process_time:.3f}s | "
                f"错误: {str(e)}"
            )
            raise


class RequestBodyLoggerMiddleware(BaseHTTPMiddleware):
    """请求体日志中间件（用于调试）"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        # 只记录POST/PUT/PATCH请求
        if request.method not in ["POST", "PUT", "PATCH"]:
            return await call_next(request)
        
        # 读取请求体
        body = await request.body()
        
        try:
            # 尝试解析JSON
            body_json = json.loads(body)
            # 脱敏处理
            self._mask_sensitive(body_json)
            logger.debug(f"请求体: {json.dumps(body_json, ensure_ascii=False)}")
        except:
            logger.debug(f"请求体: {body[:500]}")
        
        return await call_next(request)
    
    def _mask_sensitive(self, data: dict):
        """脱敏敏感信息"""
        sensitive_keys = ["password", "token", "secret", "key", "authorization"]
        
        for key in data:
            if key.lower() in sensitive_keys:
                data[key] = "******"
            elif isinstance(data[key], dict):
                self._mask_sensitive(data[key])
