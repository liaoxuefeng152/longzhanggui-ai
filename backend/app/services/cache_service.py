"""
缓存服务
支持Redis和内存缓存两种模式
"""
from typing import Optional, Any
import json
from datetime import timedelta
import time

from app.core.config import settings
from loguru import logger

# 尝试导入redis，如果不可用则使用内存缓存
try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis模块未安装，将使用内存缓存")


class MemoryCache:
    """内存缓存"""
    
    _cache: dict = {}
    _expire: dict = {}
    
    @classmethod
    def get(cls, key: str) -> Optional[Any]:
        """获取缓存"""
        if key in cls._cache:
            if key in cls._expire and cls._expire[key] < time.time():
                del cls._cache[key]
                del cls._expire[key]
                return None
            return cls._cache[key]
        return None
    
    @classmethod
    def set(cls, key: str, value: Any, expire: int = 3600):
        """设置缓存"""
        cls._cache[key] = value
        cls._expire[key] = time.time() + expire
    
    @classmethod
    def delete(cls, key: str):
        """删除缓存"""
        cls._cache.pop(key, None)
        cls._expire.pop(key, None)
    
    @classmethod
    def exists(cls, key: str) -> bool:
        """检查缓存是否存在"""
        return cls.get(key) is not None
    
    @classmethod
    def incr(cls, key: str) -> int:
        """计数器增加"""
        value = cls._cache.get(key, 0)
        if not isinstance(value, int):
            value = 0
        value += 1
        cls._cache[key] = value
        return value


class CacheService:
    """Redis缓存服务（可选）"""
    
    _client: Optional[Any] = None
    _initialized: bool = False
    
    @classmethod
    async def init(cls):
        """初始化Redis连接"""
        if cls._initialized:
            return
        
        cls._initialized = True
        
        if not REDIS_AVAILABLE:
            logger.info("Redis不可用，使用内存缓存")
            return
        
        try:
            cls._client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
            # 测试连接
            await cls._client.ping()
            logger.info("Redis连接成功")
        except Exception as e:
            logger.warning(f"Redis连接失败: {e}，将使用内存缓存")
            cls._client = None
    
    @classmethod
    async def close(cls):
        """关闭Redis连接"""
        if cls._client:
            await cls._client.close()
            cls._client = None
    
    @classmethod
    async def get(cls, key: str) -> Optional[Any]:
        """获取缓存"""
        if cls._client is None:
            return MemoryCache.get(key)
        
        try:
            value = await cls._client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.warning(f"Redis缓存读取失败: {e}")
        return None
    
    @classmethod
    async def set(
        cls,
        key: str,
        value: Any,
        expire: int = 3600
    ) -> bool:
        """设置缓存"""
        # 同时写入内存缓存
        MemoryCache.set(key, value, expire)
        
        if cls._client is None:
            return True
        
        try:
            await cls._client.set(
                key,
                json.dumps(value, ensure_ascii=False),
                ex=expire
            )
            return True
        except Exception as e:
            logger.warning(f"Redis缓存写入失败: {e}")
        return False
    
    @classmethod
    async def delete(cls, key: str) -> bool:
        """删除缓存"""
        MemoryCache.delete(key)
        
        if cls._client is None:
            return True
        
        try:
            await cls._client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Redis缓存删除失败: {e}")
        return False
    
    @classmethod
    async def exists(cls, key: str) -> bool:
        """检查缓存是否存在"""
        if MemoryCache.exists(key):
            return True
        
        if cls._client is None:
            return False
        
        try:
            return await cls._client.exists(key) > 0
        except Exception as e:
            logger.warning(f"Redis缓存检查失败: {e}")
        return False
    
    @classmethod
    async def incr(cls, key: str) -> int:
        """计数器增加"""
        if cls._client is None:
            return MemoryCache.incr(key)
        
        try:
            return await cls._client.incr(key)
        except Exception as e:
            logger.warning(f"Redis计数器增加失败: {e}")
            return MemoryCache.incr(key)


# 统一缓存接口
class Cache:
    """缓存接口（统一封装）"""
    
    @staticmethod
    async def get(key: str) -> Optional[Any]:
        """获取缓存"""
        # 优先从内存缓存获取
        result = MemoryCache.get(key)
        if result is not None:
            return result
        # 尝试从Redis获取
        return await CacheService.get(key)
    
    @staticmethod
    async def set(key: str, value: Any, expire: int = 3600):
        """设置缓存"""
        await CacheService.set(key, value, expire)
    
    @staticmethod
    async def delete(key: str):
        """删除缓存"""
        await CacheService.delete(key)
    
    @staticmethod
    async def exists(key: str) -> bool:
        """检查缓存是否存在"""
        return await CacheService.exists(key)
    
    @staticmethod
    async def incr(key: str) -> int:
        """计数器增加"""
        return await CacheService.incr(key)
