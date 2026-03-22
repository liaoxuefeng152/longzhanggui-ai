"""
API路由模块
"""
from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.sms import router as sms_router
from app.api.models import router as models_router
from app.api.prompts import router as prompts_router
from app.api.agents import router as agents_router
from app.api.ai import router as ai_router
from app.api.dashboard import router as dashboard_router
from app.api.feishu_users import router as feishu_users_router
from app.api.packages import router as packages_router
from app.api.task_logs import router as task_logs_router
from app.api.platform_bindings import router as platform_bindings_router
from app.api.products import router as products_router
from app.api.orders import router as orders_router
from app.api.tickets import router as tickets_router
from app.api.reports import router as reports_router
from app.api.settings import router as settings_router

api_router = APIRouter()

# 注册所有路由
api_router.include_router(auth_router)
api_router.include_router(sms_router)
api_router.include_router(models_router)
api_router.include_router(prompts_router)
api_router.include_router(agents_router)
api_router.include_router(ai_router)
api_router.include_router(dashboard_router)
api_router.include_router(feishu_users_router)
api_router.include_router(packages_router)
api_router.include_router(task_logs_router)
api_router.include_router(platform_bindings_router)
api_router.include_router(products_router)
api_router.include_router(orders_router)
api_router.include_router(tickets_router)
api_router.include_router(reports_router)
api_router.include_router(settings_router)
