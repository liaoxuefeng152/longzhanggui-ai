"""
系统初始化服务
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import async_session_maker
from app.core.security import get_password_hash
from app.core.config import settings
from app.models.user import User, Package
from app.models.agent import Agent, Prompt
from loguru import logger
import json


async def init_system():
    """初始化系统数据"""
    async with async_session_maker() as db:
        # 创建默认管理员
        await create_default_admin(db)
        
        # 创建默认套餐
        await create_default_packages(db)
        
        # 创建默认智能体
        await create_default_agents(db)
        
        await db.commit()


async def create_default_admin(db: AsyncSession):
    """创建默认管理员"""
    result = await db.execute(
        select(User).where(User.phone == settings.ADMIN_PHONE)
    )
    admin = result.scalar_one_or_none()
    
    if not admin:
        admin = User(
            phone=settings.ADMIN_PHONE,
            password_hash=get_password_hash(settings.ADMIN_PASSWORD),
            nickname="阿峰",
            role="admin",
            status="active"
        )
        db.add(admin)
        logger.info(f"✅ 创建默认管理员: {settings.ADMIN_PHONE}")


async def create_default_packages(db: AsyncSession):
    """创建默认套餐"""
    packages = [
        {
            "name": "体验版",
            "price": 0,
            "call_quota": 100,
            "duration": 3,
            "features": json.dumps(["100次AI调用", "基础智能体功能", "3天有效期"])
        },
        {
            "name": "月度版",
            "price": 9900,  # 99元
            "call_quota": 1000,
            "duration": 30,
            "features": json.dumps(["1000次AI调用", "全部智能体功能", "30天有效期", "优先客服支持"])
        },
        {
            "name": "季度版",
            "price": 26900,  # 269元
            "call_quota": 4000,
            "duration": 90,
            "features": json.dumps(["4000次AI调用", "全部智能体功能", "90天有效期", "专属客服", "数据分析报告"])
        },
        {
            "name": "年度版",
            "price": 99900,  # 999元
            "call_quota": 20000,
            "duration": 365,
            "features": json.dumps(["20000次AI调用", "全部智能体功能", "365天有效期", "专属客服", "数据分析报告", "API接口访问"])
        }
    ]
    
    for pkg_data in packages:
        result = await db.execute(
            select(Package).where(Package.name == pkg_data["name"])
        )
        if not result.scalar_one_or_none():
            package = Package(**pkg_data)
            db.add(package)
            logger.info(f"✅ 创建套餐: {pkg_data['name']}")


async def create_default_agents(db: AsyncSession):
    """创建默认智能体"""
    agents = [
        {
            "name": "选品智能体",
            "type": "product-selection",
            "description": "基于数据分析推荐爆款商品，帮助卖家选品决策",
            "config": json.dumps({"temperature": 0.7, "max_tokens": 2048})
        },
        {
            "name": "图片设计智能体",
            "type": "image-design",
            "description": "生成商品主图、详情图等营销图片",
            "config": json.dumps({"style": "professional", "size": "1024x1024"})
        },
        {
            "name": "视频生成智能体",
            "type": "video-generation",
            "description": "生成商品展示视频、营销短视频",
            "config": json.dumps({"duration": 30, "format": "mp4"})
        },
        {
            "name": "Listing优化智能体",
            "type": "listing-optimization",
            "description": "优化商品标题、描述、关键词，提升搜索排名",
            "config": json.dumps({"language": "auto", "seo_optimize": True})
        },
        {
            "name": "广告投放智能体",
            "type": "advertising",
            "description": "智能广告投放策略，优化广告ROI",
            "config": json.dumps({"platforms": ["tiktok", "shopee"]})
        },
        {
            "name": "AI客服智能体",
            "type": "customer-service",
            "description": "多语言智能客服，自动回复买家咨询",
            "config": json.dumps({"languages": ["zh", "en", "id", "th", "vi", "ms"]})
        },
        {
            "name": "数据复盘智能体",
            "type": "data-review",
            "description": "数据分析与复盘，生成运营报告",
            "config": json.dumps({"report_type": "weekly"})
        }
    ]
    
    for agent_data in agents:
        result = await db.execute(
            select(Agent).where(Agent.type == agent_data["type"])
        )
        if not result.scalar_one_or_none():
            agent = Agent(**agent_data)
            db.add(agent)
            logger.info(f"✅ 创建智能体: {agent_data['name']}")
