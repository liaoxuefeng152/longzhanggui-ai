"""
TikTok Shop API 路由
提供商品上架、订单同步等接口
"""
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
from loguru import logger

from app.services.tiktok_shop_service import TikTokShopService, TikTokShopRegion, tiktok_service


router = APIRouter(prefix="/tiktok", tags=["TikTok Shop"])


# ===========================================
# 数据模型
# ===========================================

class ProductCreateRequest(BaseModel):
    """商品创建请求"""
    name: str
    description: str = ""
    category: str = ""
    images: List[str] = []
    price: float
    inventory: int = 100
    sku_code: str = ""
    region: str = "ID"


class OrderSyncRequest(BaseModel):
    """订单同步请求"""
    region: str = "ID"
    days: int = 1  # 同步最近N天的订单


class ShipOrderRequest(BaseModel):
    """发货请求"""
    order_id: str
    tracking_number: str
    shipping_provider: str = "JNE"


# ===========================================
# 商品相关 API
# ===========================================

@router.post("/products")
async def create_product(request: ProductCreateRequest):
    """
    创建商品到TikTok Shop
    
    Args:
        request: 商品创建请求
    """
    service = TikTokShopService(region=request.region)
    
    product_data = {
        "name": request.name,
        "description": request.description,
        "images": request.images,
        "price": request.price,
        "inventory": request.inventory,
        "category": request.category,
        "sku_code": request.sku_code
    }
    
    try:
        result = await service.create_product(product_data)
        return result
    except Exception as e:
        logger.error(f"创建商品失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/{product_id}")
async def get_product(product_id: str, region: str = "ID"):
    """获取商品详情"""
    service = TikTokShopService(region=region)
    
    try:
        result = await service.get_product(product_id)
        return result
    except Exception as e:
        logger.error(f"获取商品失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/products/{product_id}/inventory")
async def update_inventory(product_id: str, inventory: int, region: str = "ID"):
    """更新商品库存"""
    service = TikTokShopService(region=region)
    
    try:
        result = await service.update_product_inventory(product_id, inventory)
        return result
    except Exception as e:
        logger.error(f"更新库存失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ===========================================
# 订单相关 API
# ===========================================

@router.get("/orders")
async def get_orders(
    region: str = "ID",
    status: str = None,
    days: int = 7,
    page: int = 1,
    page_size: int = 50
):
    """
    获取TikTok Shop订单列表
    
    Args:
        region: 区域
        status: 订单状态过滤
        days: 最近N天
        page: 页码
        page_size: 每页数量
    """
    service = TikTokShopService(region=region)
    
    import time
    end_time = int(time.time())
    start_time = end_time - days * 86400
    
    try:
        result = await service.get_orders(
            status=status,
            start_time=start_time,
            end_time=end_time,
            page=page,
            page_size=page_size
        )
        return result
    except Exception as e:
        logger.error(f"获取订单失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/{order_id}")
async def get_order_detail(order_id: str, region: str = "ID"):
    """获取订单详情"""
    service = TikTokShopService(region=region)
    
    try:
        result = await service.get_order_detail(order_id)
        return result
    except Exception as e:
        logger.error(f"获取订单详情失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orders/ship")
async def ship_order(request: ShipOrderRequest, region: str = "ID"):
    """
    订单发货
    
    Args:
        order_id: 订单ID
        tracking_number: 物流单号
        shipping_provider: 物流服务商
    """
    service = TikTokShopService(region=region)
    
    try:
        result = await service.ship_order(
            order_id=request.order_id,
            tracking_number=request.tracking_number,
            shipping_provider=request.shipping_provider
        )
        return result
    except Exception as e:
        logger.error(f"发货失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ===========================================
# 类目相关 API
# ===========================================

@router.get("/categories")
async def get_categories(region: str = "ID", parent_id: str = None):
    """获取商品类目列表"""
    service = TikTokShopService(region=region)
    
    try:
        result = await service.get_categories(parent_id)
        return {"categories": result}
    except Exception as e:
        logger.error(f"获取类目失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories/{category_id}/attributes")
async def get_category_attributes(category_id: str, region: str = "ID"):
    """获取类目属性"""
    service = TikTokShopService(region=region)
    
    try:
        result = await service.get_category_attributes(category_id)
        return {"attributes": result}
    except Exception as e:
        logger.error(f"获取类目属性失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ===========================================
# 同步任务 API
# ===========================================

@router.post("/sync/orders")
async def sync_orders(request: OrderSyncRequest, background_tasks: BackgroundTasks):
    """
    同步TikTok Shop订单（后台任务）
    """
    async def do_sync():
        try:
            service = TikTokShopService(region=request.region)
            import time
            end_time = int(time.time())
            start_time = end_time - request.days * 86400
            
            result = await service.get_orders(
                start_time=start_time,
                end_time=end_time
            )
            logger.info(f"订单同步完成: {len(result.get('orders', []))}条")
        except Exception as e:
            logger.error(f"订单同步失败: {e}")
    
    background_tasks.add_task(do_sync)
    
    return {
        "success": True,
        "message": f"已启动同步最近{request.days}天订单的任务"
    }


@router.get("/health")
async def tiktok_health():
    """TikTok Shop API健康检查"""
    return {
        "status": "healthy",
        "service": "TikTok Shop API",
        "regions": [r.value for r in TikTokShopRegion]
    }
