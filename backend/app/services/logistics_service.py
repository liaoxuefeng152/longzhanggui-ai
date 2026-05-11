"""
物流服务模块
支持物流轨迹查询和异常预警
"""
import time
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

import httpx
from loguru import logger


class Carrier(str, Enum):
    """物流承运商"""
    JTEXPRESS = "j&t"          # 极兔
    YUNTU = "yuntu"            # 云途
    SF = "sf"                  # 顺丰
    DHL = "dhl"                # DHL
    FEDEX = "fedex"            # FedEx
    UPS = "ups"                # UPS
    LAZADA_EXPRESS = "lzd"     # Lazada Express
    NINJAVAN = "ninjavan"      # Ninja Van


class LogisticsStatus(str, Enum):
    """物流状态"""
    PENDING = "pending"           # 待发货
    SHIPPED = "shipped"          # 已发货
    IN_TRANSIT = "in_transit"    # 运输中
    OUT_FOR_DELIVERY = "out_for_delivery"  # 派送中
    DELIVERED = "delivered"      # 已签收
    EXCEPTION = "exception"      # 异常
    RETURNED = "returned"        # 退回


class LogisticsService:
    """物流服务"""
    
    # 物流商API配置
    CARRIER_APIS = {
        Carrier.JTEXPRESS: "https://jtexpress.com.cn/api/track",
        Carrier.YUNTU: "https://www.yunexpress.com/api/track",
        Carrier.DHL: "https://www.dhl.com/api/track",
    }
    
    def __init__(self):
        self._cache: Dict[str, Dict] = {}
    
    async def track_shipment(
        self,
        tracking_number: str,
        carrier: str = None
    ) -> Dict[str, Any]:
        """
        查询物流轨迹
        
        Args:
            tracking_number: 运单号
            carrier: 承运商
            
        Returns:
            物流信息
        """
        # 检查缓存
        cache_key = f"{carrier}_{tracking_number}"
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            if time.time() - cached["timestamp"] < 3600:  # 1小时缓存
                return cached["data"]
        
        # 查询物流信息
        result = await self._query_carrier(tracking_number, carrier)
        
        # 缓存结果
        self._cache[cache_key] = {
            "data": result,
            "timestamp": time.time()
        }
        
        return result
    
    async def _query_carrier(
        self,
        tracking_number: str,
        carrier: str = None
    ) -> Dict[str, Any]:
        """查询承运商API"""
        # 模拟模式
        logger.info(f"[模拟] 查询物流: {carrier} {tracking_number}")
        
        # 生成模拟轨迹
        events = self._generate_mock_events()
        
        return {
            "tracking_number": tracking_number,
            "carrier": carrier or "unknown",
            "status": LogisticsStatus.IN_TRANSIT,
            "origin": "Guangzhou, China",
            "destination": "Jakarta, Indonesia",
            "shipped_at": (datetime.now()).isoformat(),
            "estimated_delivery": (datetime.now()).isoformat(),
            "events": events,
            "latest_event": events[0] if events else None
        }
    
    def _generate_mock_events(self) -> List[Dict[str, Any]]:
        """生成模拟物流事件"""
        now = datetime.now()
        
        return [
            {
                "timestamp": now.isoformat(),
                "status": "in_transit",
                "location": "Jakarta Sorting Center",
                "description": "Package arrived at sorting center"
            },
            {
                "timestamp": (now.replace(hour=now.hour-6)).isoformat(),
                "status": "in_transit",
                "location": "Singapore Hub",
                "description": "Package in transit to destination"
            },
            {
                "timestamp": (now.replace(hour=now.hour-12)).isoformat(),
                "status": "shipped",
                "location": "Guangzhou Warehouse",
                "description": "Package picked up by carrier"
            },
            {
                "timestamp": (now.replace(hour=now.hour-24)).isoformat(),
                "status": "pending",
                "location": "Seller Warehouse",
                "description": "Order shipped"
            }
        ]
    
    async def batch_track(
        self,
        tracking_numbers: List[str],
        carrier: str = None
    ) -> List[Dict[str, Any]]:
        """批量查询物流"""
        results = []
        
        for tn in tracking_numbers:
            result = await self.track_shipment(tn, carrier)
            results.append(result)
        
        return results
    
    async def check_exceptions(
        self,
        tracking_numbers: List[str],
        carrier: str = None,
        stuck_days: int = 3
    ) -> List[Dict[str, Any]]:
        """
        检查物流异常
        
        Args:
            tracking_numbers: 运单号列表
            carrier: 承运商
            stuck_days: 滞留天数阈值
            
        Returns:
            异常物流列表
        """
        exceptions = []
        
        for tn in tracking_numbers:
            tracking = await self.track_shipment(tn, carrier)
            
            # 检查状态
            if tracking["status"] == LogisticsStatus.EXCEPTION:
                exceptions.append({
                    "tracking_number": tn,
                    "type": "exception",
                    "status": tracking["status"],
                    "latest_event": tracking.get("latest_event"),
                    "message": "物流异常"
                })
            
            # 检查滞留
            events = tracking.get("events", [])
            if events:
                latest_time = datetime.fromisoformat(events[0]["timestamp"])
                hours_stuck = (datetime.now() - latest_time).total_seconds() / 3600
                
                if hours_stuck > stuck_days * 24:
                    exceptions.append({
                        "tracking_number": tn,
                        "type": "stuck",
                        "stuck_hours": hours_stuck,
                        "latest_event": events[0],
                        "message": f"物流滞留{hours_stuck/24:.1f}天"
                    })
        
        return exceptions
    
    async def update_order_logistics(
        self,
        order_id: str,
        tracking_number: str,
        carrier: str
    ) -> bool:
        """更新订单物流信息"""
        from app.core.database import get_db
        from app.models.erp import Logistics, ERPOrder
        from sqlalchemy import select
        
        async for db in get_db():
            try:
                # 查询订单
                result = await db.execute(
                    select(ERPOrder).where(ERPOrder.id == order_id)
                )
                order = result.scalar_one_or_none()
                
                if not order:
                    logger.error(f"订单不存在: {order_id}")
                    return False
                
                # 创建物流记录
                logistics = Logistics(
                    order_id=order_id,
                    carrier=carrier,
                    tracking_number=tracking_number,
                    status="shipped",
                    shipped_at=datetime.now()
                )
                
                db.add(logistics)
                
                # 更新订单状态
                order.status = "shipped"
                
                await db.commit()
                
                logger.info(f"订单物流更新成功: {order_id}")
                return True
                
            except Exception as e:
                logger.error(f"更新物流失败: {e}")
                await db.rollback()
                return False
            break
        
        return False
    
    async def get_logistics_by_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        """获取订单物流信息"""
        from app.core.database import get_db
        from app.models.erp import Logistics
        from sqlalchemy import select
        
        async for db in get_db():
            result = await db.execute(
                select(Logistics).where(Logistics.order_id == order_id)
            )
            logistics = result.scalar_one_or_none()
            
            if logistics:
                # 查询最新轨迹
                tracking = await self.track_shipment(
                    logistics.tracking_number,
                    logistics.carrier
                )
                
                return {
                    "id": logistics.id,
                    "order_id": logistics.order_id,
                    "carrier": logistics.carrier,
                    "tracking_number": logistics.tracking_number,
                    "status": logistics.status,
                    "shipped_at": logistics.shipped_at.isoformat() if logistics.shipped_at else None,
                    "delivered_at": logistics.delivered_at.isoformat() if logistics.delivered_at else None,
                    "tracking_events": tracking.get("events", [])
                }
            
            break
        
        return None


# 全局实例
logistics_service = LogisticsService()
