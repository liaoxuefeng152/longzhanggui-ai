"""
应用配置模块
"""
from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用配置
    APP_NAME: str = "龙虾AI跨境无人店系统"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"
    
    # 数据库配置
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/lobster_ai.db"
    
    # Redis配置
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT配置
    JWT_SECRET_KEY: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天
    
    # AI模型配置
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    DOUBAO_API_KEY: Optional[str] = None
    DOUBAO_ENDPOINT: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    
    # 默认模型
    DEFAULT_MODEL: str = "gpt-4o-mini"
    
    # 飞书配置
    FEISHU_APP_ID: Optional[str] = None
    FEISHU_APP_SECRET: Optional[str] = None
    FEISHU_ENCRYPT_KEY: Optional[str] = None
    FEISHU_VERIFICATION_TOKEN: Optional[str] = None
    
    # 管理员配置
    ADMIN_PHONE: str = "13800138000"
    ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
