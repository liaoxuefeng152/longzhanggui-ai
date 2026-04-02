"""
工作流API路由
提供工作流管理、触发、状态查询等接口
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from loguru import logger

from app.services.workflow_orchestrator import (
    WorkflowOrchestrator, 
    workflow_orchestrator,
    WorkflowStatus
)


router = APIRouter(prefix="/workflow", tags=["工作流编排"])


# ===========================================
# 数据模型
# ===========================================

class WorkflowExecuteRequest(BaseModel):
    """工作流执行请求"""
    template_name: Optional[str] = None
    template_id: Optional[str] = None  # 兼容前端传递的template_id
    user_id: str
    params: Dict[str, Any] = {}
    notify_webhook: Optional[str] = None  # 进度通知webhook
    
    def get_template_name(self) -> str:
        """获取模板名称（兼容两种参数名）"""
        return self.template_name or self.template_id or ""


class WorkflowTemplateResponse(BaseModel):
    """工作流模板响应"""
    id: str
    name: str
    description: str
    steps_count: int


class WorkflowStatusResponse(BaseModel):
    """工作流状态响应"""
    workflow_id: str
    template: str
    status: str
    results: Dict[str, Any]
    created_at: Optional[str] = None


# ===========================================
# API接口
# ===========================================

@router.get("/templates", response_model=List[WorkflowTemplateResponse])
async def list_workflow_templates():
    """
    获取所有工作流模板
    
    返回系统预定义的所有工作流模板列表
    """
    templates = workflow_orchestrator.list_workflow_templates()
    return [
        WorkflowTemplateResponse(**t) for t in templates
    ]


@router.get("/templates/{template_name}")
async def get_workflow_template(template_name: str):
    """
    获取工作流模板详情
    
    Args:
        template_name: 模板名称，如 full_automation, image_pipeline
    """
    template = workflow_orchestrator.get_workflow_template(template_name)
    
    if not template:
        raise HTTPException(status_code=404, detail=f"模板不存在: {template_name}")
    
    return {
        "id": template_name,
        "name": template["name"],
        "description": template["description"],
        "steps": [
            {
                "id": step["id"],
                "name": step["name"],
                "description": step.get("description", ""),
                "depends_on": step.get("depends_on", [])
            }
            for step in template["steps"]
        ]
    }


@router.post("/execute")
async def execute_workflow(request: WorkflowExecuteRequest, background_tasks: BackgroundTasks):
    """
    执行工作流（异步）
    
    启动一个工作流执行任务，立即返回工作流ID，实际执行在后台进行
    
    Args:
        template_name/template_id: 工作流模板名称（两种参数名都支持）
        user_id: 用户ID
        params: 执行参数
    """
    template_name = request.get_template_name()
    template = workflow_orchestrator.get_workflow_template(template_name)
    if not template:
        raise HTTPException(status_code=404, detail=f"模板不存在: {template_name}")
    
    # 进度通知回调
    async def notify_callback(workflow_id: str, event_type: str, data: Dict[str, Any]):
        """进度通知"""
        logger.info(f"工作流进度: {workflow_id} - {event_type}")
        # TODO: 可以发送到webhook或WebSocket
        if request.notify_webhook:
            # 发送webhook通知
            pass
    
    # 在后台执行工作流
    async def run_workflow():
        try:
            result = await workflow_orchestrator.execute_workflow(
                template_name=template_name,
                user_id=request.user_id,
                params=request.params,
                notify_callback=notify_callback
            )
            logger.info(f"工作流执行完成: {result['workflow_id']}")
        except Exception as e:
            logger.error(f"工作流执行失败: {e}")
    
    background_tasks.add_task(run_workflow)
    
    return {
        "success": True,
        "message": "工作流已启动",
        "template": template_name,
        "template_name": template["name"]
    }


@router.post("/execute-sync")
async def execute_workflow_sync(request: WorkflowExecuteRequest):
    """
    同步执行工作流（等待完成）
    
    执行工作流并等待完成后返回结果，适用于短时工作流或测试场景
    """
    template_name = request.get_template_name()
    template = workflow_orchestrator.get_workflow_template(template_name)
    if not template:
        raise HTTPException(status_code=404, detail=f"模板不存在: {template_name}")
    
    try:
        result = await workflow_orchestrator.execute_workflow(
            template_name=template_name,
            user_id=request.user_id,
            params=request.params
        )
        return result
    except Exception as e:
        logger.error(f"工作流执行失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/full-automation")
async def trigger_full_automation(
    user_id: str,
    category: str = "宠物用品",
    platform: str = "tiktok",
    region: str = "id",
    quantity: int = 3,
    background_tasks: BackgroundTasks = None
):
    """
    快捷接口：触发全链路自动化
    
    一键启动从选品到上架的完整流程
    
    Args:
        user_id: 用户ID
        category: 商品类目
        platform: 目标平台（tiktok/amazon）
        region: 目标地区（id/th/vn/us）
        quantity: 选品数量
    """
    params = {
        "category": category,
        "platform": platform,
        "region": region,
        "quantity": quantity,
        "target_language": "id" if region == "id" else "en",
        "image_mode": "translate",
        "profit_rate": 0.3
    }
    
    async def run_workflow():
        try:
            result = await workflow_orchestrator.execute_workflow(
                template_name="full_automation",
                user_id=user_id,
                params=params
            )
            logger.info(f"全链路自动化完成: {result['workflow_id']}")
        except Exception as e:
            logger.error(f"全链路自动化执行失败: {e}")
    
    if background_tasks:
        background_tasks.add_task(run_workflow)
    else:
        await run_workflow()
    
    return {
        "success": True,
        "message": "🚀 全链路自动化已启动",
        "params": params,
        "steps": [
            "1️⃣ AI智能选品",
            "2️⃣ 1688商品采集", 
            "3️⃣ 图片智能处理",
            "4️⃣ 智能定价",
            "5️⃣ Listing优化",
            "6️⃣ 商品上架"
        ]
    }


@router.get("/executors")
async def list_executors():
    """
    获取所有已注册的执行器
    """
    return {
        "executors": list(WorkflowOrchestrator._executors.keys())
    }


@router.get("/health")
async def workflow_health():
    """
    工作流引擎健康检查
    """
    return {
        "status": "healthy",
        "templates_count": len(workflow_orchestrator.WORKFLOW_TEMPLATES),
        "executors_count": len(WorkflowOrchestrator._executors),
        "running_workflows": len(workflow_orchestrator._running_workflows)
    }
