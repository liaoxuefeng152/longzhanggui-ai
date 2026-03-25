"""
工作流编排引擎 - 龙虾调度中枢
实现全链路自动化编排，协调各智能体和服务执行
"""
import asyncio
import json
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field
from loguru import logger

from sqlalchemy.ext.asyncio import AsyncSession


class WorkflowStatus(str, Enum):
    """工作流状态"""
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class StepStatus(str, Enum):
    """步骤状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class WorkflowContext:
    """工作流上下文 - 步骤间数据传递的载体"""
    workflow_id: str
    user_id: str
    params: Dict[str, Any]  # 初始参数
    data: Dict[str, Any] = field(default_factory=dict)  # 各步骤产生的数据
    variables: Dict[str, Any] = field(default_factory=dict)  # 中间变量
    errors: List[Dict[str, Any]] = field(default_factory=list)  # 错误记录
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取数据（支持跨步骤访问）"""
        # 先查变量
        if key in self.variables:
            return self.variables[key]
        # 再查步骤数据
        for step_data in self.data.values():
            if isinstance(step_data, dict) and key in step_data:
                return step_data[key]
        return default
    
    def set(self, key: str, value: Any):
        """设置变量"""
        self.variables[key] = value
    
    def set_step_data(self, step_id: str, data: Dict[str, Any]):
        """设置步骤数据"""
        self.data[step_id] = data
    
    def get_step_data(self, step_id: str) -> Optional[Dict[str, Any]]:
        """获取步骤数据"""
        return self.data.get(step_id)


@dataclass
class WorkflowStep:
    """工作流步骤定义"""
    id: str
    name: str
    description: str = ""
    executor: str = ""  # 执行器名称
    config: Dict[str, Any] = field(default_factory=dict)
    depends_on: List[str] = field(default_factory=list)  # 依赖的步骤
    condition: Optional[str] = None  # 执行条件（表达式）
    retry_count: int = 0
    retry_delay: int = 5  # 秒
    timeout: int = 300  # 秒


@dataclass 
class WorkflowStepResult:
    """步骤执行结果"""
    step_id: str
    status: StepStatus
    output: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class WorkflowOrchestrator:
    """工作流编排引擎 - 龙虾调度中枢"""
    
    # 预定义工作流模板
    WORKFLOW_TEMPLATES = {
        # 全链路自动化：选品 → 采集 → 图片 → 定价 → Listing → 上架
        "full_automation": {
            "name": "全链路自动化上架",
            "description": "一句话完成选品到上架全流程",
            "steps": [
                {
                    "id": "product_selection",
                    "name": "AI智能选品",
                    "executor": "product_selection_agent",
                    "description": "根据需求分析市场，推荐爆款商品"
                },
                {
                    "id": "collect_1688",
                    "name": "1688商品采集",
                    "executor": "collection_1688_service",
                    "depends_on": ["product_selection"],
                    "description": "采集选品结果对应的1688商品信息"
                },
                {
                    "id": "image_processing",
                    "name": "图片智能处理",
                    "executor": "image_design_agent",
                    "depends_on": ["collect_1688"],
                    "description": "图片翻译/优化/合规处理"
                },
                {
                    "id": "pricing",
                    "name": "智能定价",
                    "executor": "pricing_service",
                    "depends_on": ["collect_1688"],
                    "description": "基于成本+竞品计算建议售价"
                },
                {
                    "id": "listing_optimization",
                    "name": "Listing优化",
                    "executor": "listing_optimization_agent",
                    "depends_on": ["image_processing", "pricing"],
                    "description": "优化标题、描述、关键词"
                },
                {
                    "id": "publish",
                    "name": "商品上架",
                    "executor": "publish_service",
                    "depends_on": ["listing_optimization"],
                    "description": "上架到目标平台(TK/亚马逊)"
                }
            ]
        },
        
        # 图片处理流水线
        "image_pipeline": {
            "name": "图片处理流水线",
            "description": "采集并处理图片",
            "steps": [
                {
                    "id": "collect_1688",
                    "name": "1688商品采集",
                    "executor": "collection_1688_service"
                },
                {
                    "id": "image_processing",
                    "name": "图片智能处理",
                    "executor": "image_design_agent",
                    "depends_on": ["collect_1688"]
                }
            ]
        },
        
        # 单品上架流程
        "single_product_publish": {
            "name": "单品上架流程",
            "description": "从采集到上架单个商品",
            "steps": [
                {
                    "id": "collect_1688",
                    "name": "1688商品采集",
                    "executor": "collection_1688_service"
                },
                {
                    "id": "image_processing",
                    "name": "图片智能处理",
                    "executor": "image_design_agent",
                    "depends_on": ["collect_1688"]
                },
                {
                    "id": "pricing",
                    "name": "智能定价",
                    "executor": "pricing_service",
                    "depends_on": ["collect_1688"]
                },
                {
                    "id": "listing_optimization",
                    "name": "Listing优化",
                    "executor": "listing_optimization_agent",
                    "depends_on": ["image_processing", "pricing"]
                },
                {
                    "id": "publish",
                    "name": "商品上架",
                    "executor": "publish_service",
                    "depends_on": ["listing_optimization"]
                }
            ]
        },
        
        # 订单履约流程
        "order_fulfillment": {
            "name": "订单履约流程",
            "description": "订单处理到发货全流程",
            "steps": [
                {
                    "id": "sync_orders",
                    "name": "同步平台订单",
                    "executor": "order_sync_service"
                },
                {
                    "id": "check_inventory",
                    "name": "检查库存",
                    "executor": "inventory_service",
                    "depends_on": ["sync_orders"]
                },
                {
                    "id": "create_purchase",
                    "name": "创建采购单",
                    "executor": "purchase_service",
                    "depends_on": ["check_inventory"],
                    "condition": "need_purchase == True"  # 条件执行
                },
                {
                    "id": "create_logistics",
                    "name": "创建物流单",
                    "executor": "logistics_service",
                    "depends_on": ["check_inventory"]
                }
            ]
        },
        
        # 广告投放流程
        "ad_campaign": {
            "name": "广告投放流程",
            "description": "创建并启动广告计划",
            "steps": [
                {
                    "id": "analyze_performance",
                    "name": "分析商品表现",
                    "executor": "data_review_agent"
                },
                {
                    "id": "create_ad_plan",
                    "name": "创建广告计划",
                    "executor": "advertising_agent",
                    "depends_on": ["analyze_performance"]
                },
                {
                    "id": "submit_ad",
                    "name": "提交广告投放",
                    "executor": "ad_publish_service",
                    "depends_on": ["create_ad_plan"]
                }
            ]
        }
    }
    
    # 执行器注册表
    _executors: Dict[str, Callable] = {}
    
    @classmethod
    def register_executor(cls, name: str, executor: Callable):
        """注册执行器"""
        cls._executors[name] = executor
        logger.info(f"注册工作流执行器: {name}")
    
    @classmethod
    def get_executor(cls, name: str) -> Optional[Callable]:
        """获取执行器"""
        return cls._executors.get(name)
    
    def __init__(self, db: Optional[AsyncSession] = None, feishu_service=None):
        self.db = db
        self.feishu_service = feishu_service
        self._running_workflows: Dict[str, asyncio.Task] = {}
    
    def get_workflow_template(self, template_name: str) -> Optional[Dict[str, Any]]:
        """获取工作流模板"""
        return self.WORKFLOW_TEMPLATES.get(template_name)
    
    def list_workflow_templates(self) -> List[Dict[str, Any]]:
        """列出所有工作流模板"""
        return [
            {
                "id": key,
                "name": value["name"],
                "description": value["description"],
                "steps_count": len(value["steps"])
            }
            for key, value in self.WORKFLOW_TEMPLATES.items()
        ]
    
    async def execute_workflow(
        self,
        template_name: str,
        user_id: str,
        params: Dict[str, Any],
        notify_callback: Optional[Callable] = None
    ) -> Dict[str, Any]:
        """
        执行工作流
        
        Args:
            template_name: 工作流模板名称
            user_id: 用户ID
            params: 执行参数
            notify_callback: 进度通知回调
        
        Returns:
            工作流执行结果
        """
        template = self.get_workflow_template(template_name)
        if not template:
            raise ValueError(f"工作流模板不存在: {template_name}")
        
        import uuid
        workflow_id = str(uuid.uuid4())
        
        # 创建上下文
        context = WorkflowContext(
            workflow_id=workflow_id,
            user_id=user_id,
            params=params
        )
        
        # 解析步骤
        steps = [WorkflowStep(**step) for step in template["steps"]]
        results: Dict[str, WorkflowStepResult] = {}
        
        logger.info(f"开始执行工作流: {template_name} ({workflow_id})")
        
        # 通知开始
        if notify_callback:
            await notify_callback(
                workflow_id, 
                "workflow_start",
                {
                    "template": template_name,
                    "name": template["name"],
                    "total_steps": len(steps)
                }
            )
        
        # 执行步骤
        for i, step in enumerate(steps):
            # 检查依赖
            can_execute = await self._check_dependencies(step, results)
            
            if not can_execute:
                logger.info(f"步骤 {step.id} 依赖未满足，跳过")
                results[step.id] = WorkflowStepResult(
                    step_id=step.id,
                    status=StepStatus.SKIPPED
                )
                continue
            
            # 检查条件
            if step.condition and not self._evaluate_condition(step.condition, context):
                logger.info(f"步骤 {step.id} 条件不满足，跳过: {step.condition}")
                results[step.id] = WorkflowStepResult(
                    step_id=step.id,
                    status=StepStatus.SKIPPED
                )
                continue
            
            # 执行步骤
            result = await self._execute_step(step, context, notify_callback)
            results[step.id] = result
            
            # 如果步骤失败，停止工作流
            if result.status == StepStatus.FAILED:
                logger.error(f"步骤 {step.id} 执行失败，工作流终止: {result.error}")
                
                if notify_callback:
                    await notify_callback(
                        workflow_id,
                        "workflow_failed",
                        {"step": step.id, "error": result.error}
                    )
                
                return {
                    "workflow_id": workflow_id,
                    "template": template_name,
                    "status": WorkflowStatus.FAILED.value,
                    "results": {k: {"status": v.status.value, "output": v.output, "error": v.error} for k, v in results.items()},
                    "context": {"params": context.params, "data": context.data}
                }
            
            # 通知进度
            if notify_callback:
                await notify_callback(
                    workflow_id,
                    "step_completed",
                    {
                        "step_id": step.id,
                        "step_name": step.name,
                        "progress": (i + 1) / len(steps) * 100,
                        "output": result.output
                    }
                )
        
        # 工作流完成
        logger.info(f"工作流执行完成: {workflow_id}")
        
        if notify_callback:
            await notify_callback(
                workflow_id,
                "workflow_completed",
                {
                    "template": template_name,
                    "name": template["name"],
                    "results": {k: v.output for k, v in results.items() if v.output}
                }
            )
        
        return {
            "workflow_id": workflow_id,
            "template": template_name,
            "status": WorkflowStatus.COMPLETED.value,
            "results": {k: {"status": v.status.value, "output": v.output} for k, v in results.items()},
            "context": {"params": context.params, "data": context.data}
        }
    
    async def _check_dependencies(
        self,
        step: WorkflowStep,
        results: Dict[str, WorkflowStepResult]
    ) -> bool:
        """检查步骤依赖"""
        for dep_id in step.depends_on:
            if dep_id not in results:
                return False
            if results[dep_id].status != StepStatus.COMPLETED:
                return False
        return True
    
    def _evaluate_condition(self, condition: str, context: WorkflowContext) -> bool:
        """评估条件表达式"""
        try:
            # 简单的条件求值（生产环境应使用更安全的方式）
            local_vars = {
                "need_purchase": context.get("need_purchase"),
                "has_stock": context.get("has_stock"),
                "stock_level": context.get("stock_level"),
                **context.variables
            }
            return bool(eval(condition, {"__builtins__": {}}, local_vars))
        except Exception as e:
            logger.warning(f"条件求值失败: {condition}, error: {e}")
            return False
    
    async def _execute_step(
        self,
        step: WorkflowStep,
        context: WorkflowContext,
        notify_callback: Optional[Callable] = None
    ) -> WorkflowStepResult:
        """执行单个步骤"""
        logger.info(f"执行步骤: {step.id} - {step.name}")
        
        result = WorkflowStepResult(
            step_id=step.id,
            status=StepStatus.RUNNING,
            started_at=datetime.now()
        )
        
        # 获取执行器
        executor = self.get_executor(step.executor)
        if not executor:
            result.status = StepStatus.FAILED
            result.error = f"执行器未注册: {step.executor}"
            result.completed_at = datetime.now()
            return result
        
        # 准备输入数据
        input_data = self._prepare_step_input(step, context)
        
        # 执行（带重试）
        retry_count = 0
        last_error = None
        
        while retry_count <= step.retry_count:
            try:
                # 调用执行器
                output = await executor(
                    context=context,
                    step_config=step.config,
                    input_data=input_data,
                    db=self.db
                )
                
                # 更新上下文
                context.set_step_data(step.id, output)
                
                result.status = StepStatus.COMPLETED
                result.output = output
                result.completed_at = datetime.now()
                
                logger.info(f"步骤完成: {step.id}")
                return result
                
            except Exception as e:
                last_error = str(e)
                retry_count += 1
                
                if retry_count <= step.retry_count:
                    logger.warning(f"步骤 {step.id} 执行失败，重试 {retry_count}/{step.retry_count}: {e}")
                    await asyncio.sleep(step.retry_delay)
                else:
                    logger.error(f"步骤 {step.id} 执行失败: {e}")
        
        result.status = StepStatus.FAILED
        result.error = last_error
        result.completed_at = datetime.now()
        return result
    
    def _prepare_step_input(
        self,
        step: WorkflowStep,
        context: WorkflowContext
    ) -> Dict[str, Any]:
        """准备步骤输入数据"""
        input_data = {
            "params": context.params,
            "variables": context.variables.copy()
        }
        
        # 添加依赖步骤的输出
        for dep_id in step.depends_on:
            dep_data = context.get_step_data(dep_id)
            if dep_data:
                input_data[dep_id] = dep_data
        
        return input_data


# 工作流执行器装饰器
def workflow_executor(name: str):
    """注册工作流执行器的装饰器"""
    def decorator(func: Callable):
        WorkflowOrchestrator.register_executor(name, func)
        return func
    return decorator


# 全局实例
workflow_orchestrator = WorkflowOrchestrator()
