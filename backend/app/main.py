"""
龙虾AI跨境无人店系统 - FastAPI后端
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from app.core.config import settings
from app.core.database import init_db
from app.api import api_router
from app.services.init_service import init_system
from app.exceptions.handlers import setup_exception_handlers
from app.middleware.logging_middleware import LoggingMiddleware
from app.services.scheduler_service import task_scheduler

# 导入工作流执行器以注册
from app.services.workflow_executors import *  # noqa: F401, F403


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} 启动中...")
    
    # 初始化数据库
    await init_db()
    logger.info("✅ 数据库初始化完成")
    
    # 初始化系统数据（创建默认管理员等）
    await init_system()
    logger.info("✅ 系统初始化完成")
    
    # 启动定时任务调度器
    task_scheduler.start()
    
    yield
    
    # 关闭时
    logger.info("👋 应用关闭")


# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## 龙虾AI跨境无人店系统

跨境电商AI智能体运营平台，提供以下功能：

### 核心功能
- 🔐 用户认证与权限管理
- 🤖 7大AI智能体服务
- 📊 数据分析与报表
- 💬 智能客服系统

### 智能体列表
1. 选品智能体 - 市场分析与选品推荐
2. 图片设计智能体 - 商品图片生成
3. 视频生成智能体 - 营销视频创作
4. Listing优化智能体 - 商品信息优化
5. 广告投放智能体 - 广告策略优化
6. AI客服智能体 - 多语言客服支持
7. 数据复盘智能体 - 数据分析与报告
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 设置异常处理器
setup_exception_handlers(app)

# 添加日志中间件
app.add_middleware(LoggingMiddleware)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://localhost:3000",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:3000",
        "*",  # 生产环境应配置具体域名
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
app.include_router(api_router, prefix=settings.API_PREFIX)


# 健康检查
@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# 根路径
@app.get("/")
async def root():
    """根路径"""
    return {
        "message": f"欢迎使用{settings.APP_NAME}",
        "docs": "/docs",
        "health": "/health"
    }
