"""
应用配置模块 - 支持豆包大模型
"""
from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用配置
    APP_NAME: str = "龙掌柜智能运营系统"
    APP_VERSION: str = "2.0.0"
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
    
    # ========================================
    # AI模型配置 - 使用豆包大模型（通过coze-coding-dev-sdk）
    # ========================================
    # 注意：coze-coding-dev-sdk 已预装，无需额外配置API Key
    # 如需使用其他模型，可配置以下选项：
    
    # OpenAI配置（可选，用于备用）
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    
    # 豆包配置（可选，用于直接调用火山引擎API）
    DOUBAO_API_KEY: Optional[str] = None
    DOUBAO_ENDPOINT: Optional[str] = None
    
    # DeepSeek配置（可选）
    DEEPSEEK_API_KEY: Optional[str] = None
    
    # 默认模型配置
    DEFAULT_MODEL: str = "doubao-seed-1-8-251228"  # 豆包Agent优化模型
    DEFAULT_TEMPERATURE: float = 0.7
    
    # ========================================
    # 飞书配置
    # ========================================
    FEISHU_APP_ID: Optional[str] = None
    FEISHU_APP_SECRET: Optional[str] = None
    FEISHU_ENCRYPT_KEY: Optional[str] = None
    FEISHU_VERIFICATION_TOKEN: Optional[str] = None
    
    # ========================================
    # 1688开放平台配置
    # ========================================
    ALIBABA_APP_KEY: Optional[str] = None
    ALIBABA_APP_SECRET: Optional[str] = None
    ALIBABA_ACCESS_TOKEN: Optional[str] = None

    # ========================================
    # TikTok Shop配置
    # ========================================
    TIKTOK_APP_KEY: Optional[str] = None
    TIKTOK_APP_SECRET: Optional[str] = None
    TIKTOK_SHOP_ID: Optional[str] = None
    
    # ========================================
    # 图片/视频生成API配置
    # ========================================
    IMAGE_API_KEY: Optional[str] = None
    IMAGE_API_URL: str = "https://api.openai.com/v1"
    VIDEO_API_KEY: Optional[str] = None
    VIDEO_API_URL: Optional[str] = None
    
    # ========================================
    # 跨境AI运营智能体配置 (云端API)
    # ========================================
    KUAJING_API_TOKEN: Optional[str] = None
    KUAJING_PROJECT_ID: Optional[str] = None
    KUAJING_API_URL: str = "https://yggzpcgkdt.coze.site/stream_run"
    
    # ========================================
    # 管理员配置
    # ========================================
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
