"""
缓存服务
"""
from typing import Optional, Any
import json
import redis.asyncio as redis
from datetime import timedelta

from app.core.config import settings
from loguru import logger


class CacheService:
    """Redis缓存服务"""
    
    _client: Optional[redis.Redis] = None
    
    @classmethod
    async def get_client(cls) -> redis.Redis:
        """获取Redis客户端"""
        if cls._client is None:
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
        
        return cls._client
    
    @classmethod
    async def close(cls):
        """关闭Redis连接"""
        if cls._client:
            await cls._client.close()
            cls._client = None
    
    @classmethod
    async def get(cls, key: str) -> Optional[Any]:
        """获取缓存"""
        try:
            client = await cls.get_client()
            if client:
                value = await client.get(key)
                if value:
                    return json.loads(value)
        except Exception as e:
            logger.warning(f"缓存读取失败: {e}")
        return None
    
    @classmethod
    async def set(
        cls,
        key: str,
        value: Any,
        expire: int = 3600
    ) -> bool:
        """设置缓存"""
        try:
            client = await cls.get_client()
            if client:
                await client.set(
                    key,
                    json.dumps(value, ensure_ascii=False),
                    ex=expire
                )
                return True
        except Exception as e:
            logger.warning(f"缓存写入失败: {e}")
        return False
    
    @classmethod
    async def delete(cls, key: str) -> bool:
        """删除缓存"""
        try:
            client = await cls.get_client()
            if client:
                await client.delete(key)
                return True
        except Exception as e:
            logger.warning(f"缓存删除失败: {e}")
        return False
    
    @classmethod
    async def exists(cls, key: str) -> bool:
        """检查缓存是否存在"""
        try:
            client = await cls.get_client()
            if client:
                return await client.exists(key) > 0
        except Exception as e:
            logger.warning(f"缓存检查失败: {e}")
        return False
    
    @classmethod
    async def incr(cls, key: str) -> int:
        """计数器增加"""
        try:
            client = await cls.get_client()
            if client:
                return await client.incr(key)
        except Exception as e:
            logger.warning(f"计数器增加失败: {e}")
        return 0
    
    @classmethod
    async def expire(cls, key: str, seconds: int) -> bool:
        """设置过期时间"""
        try:
            client = await cls.get_client()
            if client:
                await client.expire(key, seconds)
                return True
        except Exception as e:
            logger.warning(f"设置过期时间失败: {e}")
        return False


class MemoryCache:
    """内存缓存（Redis不可用时的备选方案）"""
    
    _cache: dict = {}
    _expire: dict = {}
    
    @classmethod
    def get(cls, key: str) -> Optional[Any]:
        """获取缓存"""
        import time
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
        import time
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


# 统一缓存接口
class Cache:
    """缓存接口"""
    
    @staticmethod
    async def get(key: str) -> Optional[Any]:
        """获取缓存"""
        # 优先使用Redis
        result = await CacheService.get(key)
        if result is not None:
            return result
        # 回退到内存缓存
        return MemoryCache.get(key)
    
    @staticmethod
    async def set(key: str, value: Any, expire: int = 3600):
        """设置缓存"""
        await CacheService.set(key, value, expire)
        MemoryCache.set(key, value, expire)
    
    @staticmethod
    async def delete(key: str):
        """删除缓存"""
        await CacheService.delete(key)
        MemoryCache.delete(key)
    
    @staticmethod
    async def exists(key: str) -> bool:
        """检查缓存是否存在"""
        if await CacheService.exists(key):
            return True
        return MemoryCache.exists(key)
