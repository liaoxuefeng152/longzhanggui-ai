"""
定时任务模块
使用APScheduler实现定时调度
"""
import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum

from loguru import logger
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

from app.core.config import settings
from app.services.platform_service import tiktok_service, amazon_service


class TaskType(str, Enum):
    """任务类型"""
    SYNC_TIKTOK_ORDERS = "sync_tiktok_orders"
    SYNC_AMAZON_ORDERS = "sync_amazon_orders"
    SYNC_INVENTORY = "sync_inventory"
    CHECK_REPLENISHMENT = "check_replenishment"
    SYNC_LOGISTICS = "sync_logistics"
    GENERATE_DAILY_REPORT = "generate_daily_report"
    CLEANUP_LOGS = "cleanup_logs"


class TaskScheduler:
    """任务调度器"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self._running = False
    
    def start(self):
        """启动调度器"""
        if self._running:
            return
        
        # 添加定时任务
        self._setup_jobs()
        
        self.scheduler.start()
        self._running = True
        logger.info("✅ 任务调度器已启动")
    
    def stop(self):
        """停止调度器"""
        if self._running:
            self.scheduler.shutdown()
            self._running = False
            logger.info("任务调度器已停止")
    
    def _setup_jobs(self):
        """设置定时任务"""
        # 每15分钟同步TikTok订单
        self.scheduler.add_job(
            sync_tiktok_orders,
            trigger=IntervalTrigger(minutes=15),
            id="sync_tiktok_orders",
            name="同步TikTok订单",
            replace_existing=True
        )
        
        # 每15分钟同步Amazon订单
        self.scheduler.add_job(
            sync_amazon_orders,
            trigger=IntervalTrigger(minutes=15),
            id="sync_amazon_orders",
            name="同步Amazon订单",
            replace_existing=True
        )
        
        # 每小时同步库存
        self.scheduler.add_job(
            sync_inventory,
            trigger=IntervalTrigger(hours=1),
            id="sync_inventory",
            name="同步库存",
            replace_existing=True
        )
        
        # 每30分钟检查补货预警
        self.scheduler.add_job(
            check_replenishment,
            trigger=IntervalTrigger(minutes=30),
            id="check_replenishment",
            name="检查补货预警",
            replace_existing=True
        )
        
        # 每小时同步物流轨迹
        self.scheduler.add_job(
            sync_logistics,
            trigger=IntervalTrigger(hours=1),
            id="sync_logistics",
            name="同步物流轨迹",
            replace_existing=True
        )
        
        # 每天8:00生成日报
        self.scheduler.add_job(
            generate_daily_report,
            trigger=CronTrigger(hour=8, minute=0),
            id="generate_daily_report",
            name="生成日报",
            replace_existing=True
        )
        
        # 每天凌晨2点清理日志
        self.scheduler.add_job(
            cleanup_logs,
            trigger=CronTrigger(hour=2, minute=0),
            id="cleanup_logs",
            name="清理日志",
            replace_existing=True
        )
        
        logger.info(f"已配置 {len(self.scheduler.get_jobs())} 个定时任务")


# ============ 定时任务函数 ============

async def sync_tiktok_orders():
    """同步TikTok订单"""
    logger.info("开始同步TikTok订单...")
    
    try:
        # 获取最近24小时的订单
        start_time = datetime.now() - timedelta(hours=24)
        
        orders = await tiktok_service.get_orders(
            start_time=start_time,
            end_time=datetime.now()
        )
        
        # 保存到数据库
        saved_count = await _save_orders_to_db("tiktok", orders)
        
        logger.info(f"TikTok订单同步完成: 获取{len(orders)}条, 新增{saved_count}条")
        
        # 发送飞书通知
        if saved_count > 0:
            from app.services.feishu_service import feishu_service
            # TODO: 获取管理员open_id
            pass
        
    except Exception as e:
        logger.error(f"同步TikTok订单失败: {e}")


async def sync_amazon_orders():
    """同步Amazon订单"""
    logger.info("开始同步Amazon订单...")
    
    try:
        # 获取最近24小时的订单
        created_after = datetime.now() - timedelta(hours=24)
        
        orders = await amazon_service.get_orders(
            created_after=created_after
        )
        
        # 保存到数据库
        saved_count = await _save_orders_to_db("amazon", orders)
        
        logger.info(f"Amazon订单同步完成: 获取{len(orders)}条, 新增{saved_count}条")
        
    except Exception as e:
        logger.error(f"同步Amazon订单失败: {e}")


async def sync_inventory():
    """同步库存"""
    logger.info("开始同步库存...")
    
    try:
        # 获取各平台库存并同步
        # TODO: 实现库存同步逻辑
        logger.info("库存同步完成")
        
    except Exception as e:
        logger.error(f"同步库存失败: {e}")


async def check_replenishment():
    """检查补货预警"""
    logger.info("开始检查补货预警...")
    
    try:
        # 查询低于安全库存的商品
        from app.core.database import get_db
        from app.models.erp import Inventory
        from sqlalchemy import select
        
        async for db in get_db():
            result = await db.execute(
                select(Inventory).where(
                    Inventory.available_qty <= Inventory.reorder_point
                )
            )
            low_stock_items = result.scalars().all()
            
            if low_stock_items:
                # 发送飞书告警
                from app.services.feishu_service import feishu_service
                
                alert_content = "\n".join([
                    f"- {item.sku}: 可售{item.available_qty}, 安全库存{item.safety_stock}"
                    for item in low_stock_items
                ])
                
                logger.warning(f"发现{len(low_stock_items)}个SKU需要补货")
            
            break
        
        logger.info("补货预警检查完成")
        
    except Exception as e:
        logger.error(f"检查补货预警失败: {e}")


async def sync_logistics():
    """同步物流轨迹"""
    logger.info("开始同步物流轨迹...")
    
    try:
        # TODO: 实现物流轨迹同步
        logger.info("物流轨迹同步完成")
        
    except Exception as e:
        logger.error(f"同步物流轨迹失败: {e}")


async def generate_daily_report():
    """生成日报"""
    logger.info("开始生成日报...")
    
    try:
        from app.core.database import get_db
        from app.models.erp import ERPOrder, DailyFinanceSummary
        from sqlalchemy import select, func
        from datetime import date
        
        today = date.today()
        
        async for db in get_db():
            # 统计今日订单
            result = await db.execute(
                select(
                    func.count(ERPOrder.id).label("order_count"),
                    func.sum(ERPOrder.total_amount).label("total_sales"),
                    func.sum(ERPOrder.cost_price).label("total_cost"),
                ).where(
                    func.date(ERPOrder.created_at) == today
                )
            )
            stats = result.first()
            
            if stats:
                # 生成财务汇总
                summary = DailyFinanceSummary(
                    date=today,
                    total_sales=stats.total_sales or 0,
                    total_cost=stats.total_cost or 0,
                    gross_profit=(stats.total_sales or 0) - (stats.total_cost or 0),
                    profit_rate=(stats.total_sales or 0) > 0 and 
                               ((stats.total_sales - stats.total_cost) / stats.total_sales) or 0,
                    order_count=stats.order_count or 0
                )
                
                db.add(summary)
                await db.commit()
                
                # 发送飞书日报
                report = f"""
📊 **日报 - {today}**

**销售数据**
- 订单数: {stats.order_count or 0}
- 销售额: ${stats.total_sales or 0:.2f}
- 成本: ${stats.total_cost or 0:.2f}
- 毛利润: ${summary.gross_profit:.2f}
- 利润率: {summary.profit_rate * 100:.1f}%
"""
                logger.info(report)
            
            break
        
        logger.info("日报生成完成")
        
    except Exception as e:
        logger.error(f"生成日报失败: {e}")


async def cleanup_logs():
    """清理过期日志"""
    logger.info("开始清理过期日志...")
    
    try:
        # 清理30天前的操作日志
        from app.core.database import get_db
        from app.models.business import TaskLog
        from sqlalchemy import delete
        from datetime import timedelta
        
        threshold = datetime.now() - timedelta(days=30)
        
        async for db in get_db():
            await db.execute(
                delete(TaskLog).where(TaskLog.created_at < threshold)
            )
            await db.commit()
            break
        
        logger.info("过期日志清理完成")
        
    except Exception as e:
        logger.error(f"清理日志失败: {e}")


async def _save_orders_to_db(platform: str, orders: List[Dict]) -> int:
    """保存订单到数据库"""
    from app.core.database import get_db
    from app.models.erp import ERPOrder
    from sqlalchemy import select
    
    saved_count = 0
    
    async for db in get_db():
        for order_data in orders:
            try:
                # 检查订单是否已存在
                platform_order_id = order_data.get("order_id") or order_data.get("AmazonOrderId")
                
                result = await db.execute(
                    select(ERPOrder).where(ERPOrder.platform_order_id == platform_order_id)
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    continue
                
                # 创建新订单
                if platform == "tiktok":
                    order = ERPOrder(
                        platform="tiktok",
                        platform_order_id=platform_order_id,
                        product_name=order_data.get("item_list", [{}])[0].get("product_name"),
                        quantity=order_data.get("item_list", [{}])[0].get("quantity", 1),
                        sale_price=float(order_data.get("payment_info", {}).get("total_amount", 0)),
                        total_amount=float(order_data.get("payment_info", {}).get("total_amount", 0)),
                        currency="USD",
                        status=_map_tiktok_status(order_data.get("order_status")),
                        buyer_name=order_data.get("buyer_info", {}).get("buyer_username"),
                        order_time=datetime.fromtimestamp(order_data.get("create_time", 0)),
                    )
                else:  # amazon
                    order = ERPOrder(
                        platform="amazon",
                        platform_order_id=platform_order_id,
                        product_name="Amazon Order",
                        quantity=1,
                        sale_price=float(order_data.get("OrderTotal", {}).get("Amount", 0)),
                        total_amount=float(order_data.get("OrderTotal", {}).get("Amount", 0)),
                        currency=order_data.get("OrderTotal", {}).get("CurrencyCode", "USD"),
                        status=_map_amazon_status(order_data.get("OrderStatus")),
                        buyer_name=order_data.get("BuyerInfo", {}).get("BuyerName"),
                    )
                
                db.add(order)
                saved_count += 1
                
            except Exception as e:
                logger.error(f"保存订单失败: {e}")
                continue
        
        await db.commit()
        break
    
    return saved_count


def _map_tiktok_status(status: str) -> str:
    """映射TikTok订单状态"""
    mapping = {
        "AWAITING_SHIPMENT": "paid",
        "AWAITING_COLLECTION": "paid",
        "IN_TRANSIT": "shipped",
        "DELIVERED": "delivered",
        "CANCELLED": "cancelled",
    }
    return mapping.get(status, "pending")


def _map_amazon_status(status: str) -> str:
    """映射Amazon订单状态"""
    mapping = {
        "Pending": "pending",
        "Unshipped": "paid",
        "Shipped": "shipped",
        "Delivered": "delivered",
        "Canceled": "cancelled",
    }
    return mapping.get(status, "pending")


# 全局调度器实例
task_scheduler = TaskScheduler()
