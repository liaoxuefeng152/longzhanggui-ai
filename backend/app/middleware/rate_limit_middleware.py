"""
限流中间件
"""
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable, Dict
from datetime import datetime, timedelta
import asyncio
from collections import defaultdict

from loguru import logger
from app.utils.helpers import get_client_ip


class RateLimitMiddleware(BaseHTTPMiddleware):
    """请求限流中间件"""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self._requests: Dict[str, list] = defaultdict(list)
        self._lock = asyncio.Lock()
    
    async def dispatch(self, request: Request, call_next: Callable):
        # 获取客户端标识
        client_ip = get_client_ip(request)
        
        # 检查是否超过限制
        async with self._lock:
            now = datetime.now()
            minute_ago = now - timedelta(minutes=1)
            
            # 清理过期记录
            self._requests[client_ip] = [
                t for t in self._requests[client_ip] 
                if t > minute_ago
            ]
            
            # 检查请求次数
            if len(self._requests[client_ip]) >= self.requests_per_minute:
                logger.warning(f"IP {client_ip} 请求频率超限")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="请求过于频繁，请稍后再试"
                )
            
            # 记录本次请求
            self._requests[client_ip].append(now)
        
        return await call_next(request)


class IPRateLimiter:
    """IP限流器"""
    
    def __init__(
        self,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000
    ):
        self.rpm = requests_per_minute
        self.rph = requests_per_hour
        self._minute_requests: Dict[str, list] = defaultdict(list)
        self._hour_requests: Dict[str, list] = defaultdict(list)
        self._lock = asyncio.Lock()
    
    async def check(self, client_ip: str) -> tuple[bool, str]:
        """检查是否允许请求
        
        Returns:
            (allowed, message)
        """
        async with self._lock:
            now = datetime.now()
            minute_ago = now - timedelta(minutes=1)
            hour_ago = now - timedelta(hours=1)
            
            # 清理过期记录
            self._minute_requests[client_ip] = [
                t for t in self._minute_requests[client_ip]
                if t > minute_ago
            ]
            self._hour_requests[client_ip] = [
                t for t in self._hour_requests[client_ip]
                if t > hour_ago
            ]
            
            # 检查每分钟限制
            if len(self._minute_requests[client_ip]) >= self.rpm:
                return False, f"每分钟最多{self.rpm}次请求"
            
            # 检查每小时限制
            if len(self._hour_requests[client_ip]) >= self.rph:
                return False, f"每小时最多{self.rph}次请求"
            
            # 记录请求
            self._minute_requests[client_ip].append(now)
            self._hour_requests[client_ip].append(now)
            
            return True, ""
    
    async def get_remaining(self, client_ip: str) -> dict:
        """获取剩余请求次数"""
        async with self._lock:
            now = datetime.now()
            minute_ago = now - timedelta(minutes=1)
            hour_ago = now - timedelta(hours=1)
            
            minute_count = len([
                t for t in self._minute_requests[client_ip]
                if t > minute_ago
            ])
            hour_count = len([
                t for t in self._hour_requests[client_ip]
                if t > hour_ago
            ])
            
            return {
                "minute_remaining": max(0, self.rpm - minute_count),
                "hour_remaining": max(0, self.rph - hour_count)
            }


class UserRateLimiter:
    """用户限流器"""
    
    def __init__(self, requests_per_day: int = 1000):
        self.rpd = requests_per_day
        self._daily_requests: Dict[int, list] = defaultdict(list)
        self._lock = asyncio.Lock()
    
    async def check(self, user_id: int) -> tuple[bool, str]:
        """检查用户今日请求次数"""
        async with self._lock:
            now = datetime.now()
            day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            
            # 清理过期记录
            self._daily_requests[user_id] = [
                t for t in self._daily_requests[user_id]
                if t >= day_start
            ]
            
            # 检查限制
            if len(self._daily_requests[user_id]) >= self.rpd:
                return False, f"今日请求次数已达上限（{self.rpd}次）"
            
            # 记录请求
            self._daily_requests[user_id].append(now)
            
            return True, ""
    
    async def get_remaining(self, user_id: int) -> int:
        """获取用户今日剩余请求次数"""
        async with self._lock:
            now = datetime.now()
            day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            
            count = len([
                t for t in self._daily_requests[user_id]
                if t >= day_start
            ])
            
            return max(0, self.rpd - count)


# 全局限流器实例
ip_rate_limiter = IPRateLimiter()
user_rate_limiter = UserRateLimiter()
