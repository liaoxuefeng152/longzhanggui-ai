"""
API路由模块
"""
from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.models import router as models_router
from app.api.prompts import router as prompts_router
from app.api.agents import router as agents_router
from app.api.ai import router as ai_router
from app.api.dashboard import router as dashboard_router

api_router = APIRouter()

# 注册所有路由
api_router.include_router(auth_router)
api_router.include_router(models_router)
api_router.include_router(prompts_router)
api_router.include_router(agents_router)
api_router.include_router(ai_router)
api_router.include_router(dashboard_router)
