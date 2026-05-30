"""
ERP系统 API路由
包含：商品管理、库存管理、采购管理、订单管理、物流管理、财务管理、智能定价
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional, List
from datetime import datetime, date, timedelta
from decimal import Decimal
import json
import uuid

from app.core.database import get_db
from app.api.auth import get_current_user, get_optional_user
from app.models.user import User, FeishuUser
from app.models.erp import (
    ERPProduct, PlatformSKU, Inventory, PurchaseOrder,
    ERPOrder, Logistics, FinancialRecord, DailyFinanceSummary,
    Collection1688
)
from app.schemas.erp import (
    ERPProductCreate, ERPProductUpdate, ERPProductResponse, ERPProductListResponse,
    PlatformSKUCreate, PlatformSKUResponse,
    InventoryUpdate, InventoryResponse,
    PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrderResponse,
    ERPOrderResponse, ERPOrderListResponse,
    LogisticsResponse,
    FinancialRecordResponse, DailyFinanceSummaryResponse,
    Collection1688Create, Collection1688Response,
    PricingRequest, PricingResponse
)

router = APIRouter(prefix="/erp", tags=["ERP系统"])


# ===========================================
# 商品管理 API
# ===========================================

@router.get("/products", response_model=ERPProductListResponse)
async def get_erp_products(
    keyword: Optional[str] = None,
    status: Optional[str] = None,
    compliance_status: Optional[str] = None,
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """获取ERP商品列表"""
    query = select(ERPProduct)
    count_query = select(func.count(ERPProduct.id))
    
    # 筛选条件
    if keyword:
        query = query.where(
            or_(
                ERPProduct.name_zh.contains(keyword),
                ERPProduct.name_en.contains(keyword),
                ERPProduct.internal_sku.contains(keyword)
            )
        )
        count_query = count_query.where(
            or_(
                ERPProduct.name_zh.contains(keyword),
                ERPProduct.name_en.contains(keyword),
                ERPProduct.internal_sku.contains(keyword)
            )
        )
    if status:
        query = query.where(ERPProduct.status == status)
        count_query = count_query.where(ERPProduct.status == status)
    if compliance_status:
        query = query.where(ERPProduct.compliance_status == compliance_status)
        count_query = count_query.where(ERPProduct.compliance_status == compliance_status)
    if category:
        query = query.where(ERPProduct.category_name == category)
        count_query = count_query.where(ERPProduct.category_name == category)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(ERPProduct.created_at.desc())
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    # 构造响应
    items = []
    for p in products:
        items.append({
            "id": p.id,
            "user_id": p.user_id,
            "internal_sku": p.internal_sku,
            "name_zh": p.name_zh,
            "name_en": p.name_en,
            "source_url": p.source_url,
            "supplier_name": p.supplier_name,
            "supplier_url": p.supplier_url,
            "cost_price": float(p.cost_price or 0),
            "domestic_shipping": float(p.domestic_shipping or 0),
            "first_mile_shipping": float(p.first_mile_shipping or 0),
            "total_cost": float(p.total_cost or 0),
            "images": p.images,
            "processed_images": p.processed_images,
            "image_status": p.image_status,
            "compliance_status": p.compliance_status,
            "compliance_check_result": p.compliance_check_result,
            "category_id": p.category_id,
            "category_name": p.category_name,
            "status": p.status,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
        })
    
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.post("/products", response_model=ERPProductResponse)
async def create_erp_product(
    product_data: ERPProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建ERP商品"""
    # 检查SKU是否重复
    existing = await db.execute(
        select(ERPProduct).where(ERPProduct.internal_sku == product_data.internal_sku)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="SKU已存在")
    
    product = ERPProduct(
        user_id=current_user.id,
        internal_sku=product_data.internal_sku,
        name_zh=product_data.name_zh,
        name_en=product_data.name_en,
        source_url=product_data.source_url,
        supplier_name=product_data.supplier_name,
        supplier_url=product_data.supplier_url,
        cost_price=product_data.cost_price,
        domestic_shipping=product_data.domestic_shipping,
        first_mile_shipping=product_data.first_mile_shipping,
        images=product_data.images,
        category_id=product_data.category_id,
        category_name=product_data.category_name,
    )
    
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    # 创建库存记录
    inventory = Inventory(product_id=product.id)
    db.add(inventory)
    await db.commit()
    
    return {
        "id": product.id,
        "user_id": product.user_id,
        "internal_sku": product.internal_sku,
        "name_zh": product.name_zh,
        "name_en": product.name_en,
        "source_url": product.source_url,
        "supplier_name": product.supplier_name,
        "supplier_url": product.supplier_url,
        "cost_price": float(product.cost_price or 0),
        "domestic_shipping": float(product.domestic_shipping or 0),
        "first_mile_shipping": float(product.first_mile_shipping or 0),
        "total_cost": float(product.total_cost or 0),
        "images": product.images,
        "processed_images": product.processed_images,
        "image_status": product.image_status,
        "compliance_status": product.compliance_status,
        "compliance_check_result": product.compliance_check_result,
        "category_id": product.category_id,
        "category_name": product.category_name,
        "status": product.status,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
    }


@router.get("/products/{product_id}", response_model=ERPProductResponse)
async def get_erp_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """获取ERP商品详情"""
    result = await db.execute(
        select(ERPProduct).where(ERPProduct.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    return {
        "id": product.id,
        "user_id": product.user_id,
        "internal_sku": product.internal_sku,
        "name_zh": product.name_zh,
        "name_en": product.name_en,
        "source_url": product.source_url,
        "supplier_name": product.supplier_name,
        "supplier_url": product.supplier_url,
        "cost_price": float(product.cost_price or 0),
        "domestic_shipping": float(product.domestic_shipping or 0),
        "first_mile_shipping": float(product.first_mile_shipping or 0),
        "total_cost": float(product.total_cost or 0),
        "images": product.images,
        "processed_images": product.processed_images,
        "image_status": product.image_status,
        "compliance_status": product.compliance_status,
        "compliance_check_result": product.compliance_check_result,
        "category_id": product.category_id,
        "category_name": product.category_name,
        "status": product.status,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
    }


@router.put("/products/{product_id}", response_model=ERPProductResponse)
async def update_erp_product(
    product_id: str,
    product_data: ERPProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新ERP商品"""
    result = await db.execute(
        select(ERPProduct).where(ERPProduct.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    # 更新字段
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    
    await db.commit()
    await db.refresh(product)
    
    return {
        "id": product.id,
        "user_id": product.user_id,
        "internal_sku": product.internal_sku,
        "name_zh": product.name_zh,
        "name_en": product.name_en,
        "source_url": product.source_url,
        "supplier_name": product.supplier_name,
        "supplier_url": product.supplier_url,
        "cost_price": float(product.cost_price or 0),
        "domestic_shipping": float(product.domestic_shipping or 0),
        "first_mile_shipping": float(product.first_mile_shipping or 0),
        "total_cost": float(product.total_cost or 0),
        "images": product.images,
        "processed_images": product.processed_images,
        "image_status": product.image_status,
        "compliance_status": product.compliance_status,
        "compliance_check_result": product.compliance_check_result,
        "category_id": product.category_id,
        "category_name": product.category_name,
        "status": product.status,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
    }


@router.delete("/products/{product_id}")
async def delete_erp_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除ERP商品"""
    result = await db.execute(
        select(ERPProduct).where(ERPProduct.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    await db.delete(product)
    await db.commit()
    
    return {"success": True, "message": "商品已删除"}


# ===========================================
# 库存管理 API
# ===========================================

@router.get("/inventory", response_model=List[InventoryResponse])
async def get_inventory_list(
    low_stock: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取库存列表"""
    query = select(Inventory)
    
    if low_stock:
        # 筛选低库存
        query = query.where(Inventory.qty_available <= Inventory.safety_stock)
    
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Inventory.updated_at.desc())
    
    result = await db.execute(query)
    inventories = result.scalars().all()
    
    return [{
        "id": i.id,
        "product_id": i.product_id,
        "qty_available": i.qty_available,
        "qty_reserved": i.qty_reserved,
        "qty_in_transit": i.qty_in_transit,
        "safety_stock": i.safety_stock,
        "reorder_point": i.reorder_point,
        "reorder_qty": i.reorder_qty,
        "avg_daily_sales": float(i.avg_daily_sales or 0),
        "days_of_stock": i.days_of_stock,
        "is_low_stock": i.is_low_stock,
        "need_reorder": i.need_reorder,
        "warehouse": i.warehouse,
        "location": i.location,
        "created_at": i.created_at,
        "updated_at": i.updated_at,
    } for i in inventories]


@router.get("/inventory/{product_id}", response_model=InventoryResponse)
async def get_product_inventory(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取商品库存"""
    result = await db.execute(
        select(Inventory).where(Inventory.product_id == product_id)
    )
    inventory = result.scalar_one_or_none()
    
    if not inventory:
        raise HTTPException(status_code=404, detail="库存记录不存在")
    
    return {
        "id": inventory.id,
        "product_id": inventory.product_id,
        "qty_available": inventory.qty_available,
        "qty_reserved": inventory.qty_reserved,
        "qty_in_transit": inventory.qty_in_transit,
        "safety_stock": inventory.safety_stock,
        "reorder_point": inventory.reorder_point,
        "reorder_qty": inventory.reorder_qty,
        "avg_daily_sales": float(inventory.avg_daily_sales or 0),
        "days_of_stock": inventory.days_of_stock,
        "is_low_stock": inventory.is_low_stock,
        "need_reorder": inventory.need_reorder,
        "warehouse": inventory.warehouse,
        "location": inventory.location,
        "created_at": inventory.created_at,
        "updated_at": inventory.updated_at,
    }


@router.put("/inventory/{product_id}", response_model=InventoryResponse)
async def update_inventory(
    product_id: str,
    inventory_data: InventoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新库存"""
    result = await db.execute(
        select(Inventory).where(Inventory.product_id == product_id)
    )
    inventory = result.scalar_one_or_none()
    
    if not inventory:
        raise HTTPException(status_code=404, detail="库存记录不存在")
    
    # 更新字段
    update_data = inventory_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(inventory, key, value)
    
    await db.commit()
    await db.refresh(inventory)
    
    return {
        "id": inventory.id,
        "product_id": inventory.product_id,
        "qty_available": inventory.qty_available,
        "qty_reserved": inventory.qty_reserved,
        "qty_in_transit": inventory.qty_in_transit,
        "safety_stock": inventory.safety_stock,
        "reorder_point": inventory.reorder_point,
        "reorder_qty": inventory.reorder_qty,
        "avg_daily_sales": float(inventory.avg_daily_sales or 0),
        "days_of_stock": inventory.days_of_stock,
        "is_low_stock": inventory.is_low_stock,
        "need_reorder": inventory.need_reorder,
        "warehouse": inventory.warehouse,
        "location": inventory.location,
        "created_at": inventory.created_at,
        "updated_at": inventory.updated_at,
    }


# ===========================================
# 采购管理 API
# ===========================================

@router.get("/purchase-orders", response_model=List[PurchaseOrderResponse])
async def get_purchase_orders(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取采购单列表"""
    query = select(PurchaseOrder)
    
    if status:
        query = query.where(PurchaseOrder.status == status)
    
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(PurchaseOrder.created_at.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return [{
        "id": o.id,
        "po_number": o.po_number,
        "product_id": o.product_id,
        "qty": o.qty,
        "unit_price": float(o.unit_price or 0),
        "total_amount": float(o.total_amount or 0),
        "supplier_name": o.supplier_name,
        "supplier_url": o.supplier_url,
        "supplier_contact": o.supplier_contact,
        "status": o.status,
        "order_date": o.order_date,
        "expected_arrival": o.expected_arrival,
        "actual_arrival": o.actual_arrival,
        "notes": o.notes,
        "created_at": o.created_at,
        "updated_at": o.updated_at,
    } for o in orders]


@router.post("/purchase-orders", response_model=PurchaseOrderResponse)
async def create_purchase_order(
    order_data: PurchaseOrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建采购单"""
    # 生成采购单号
    po_number = f"PO{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:4].upper()}"
    
    # 计算总金额
    total_amount = order_data.qty * order_data.unit_price
    
    order = PurchaseOrder(
        po_number=po_number,
        product_id=order_data.product_id,
        qty=order_data.qty,
        unit_price=order_data.unit_price,
        total_amount=total_amount,
        supplier_name=order_data.supplier_name,
        supplier_url=order_data.supplier_url,
        supplier_contact=order_data.supplier_contact,
        expected_arrival=order_data.expected_arrival,
        notes=order_data.notes,
        order_date=date.today(),
    )
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    
    return {
        "id": order.id,
        "po_number": order.po_number,
        "product_id": order.product_id,
        "qty": order.qty,
        "unit_price": float(order.unit_price or 0),
        "total_amount": float(order.total_amount or 0),
        "supplier_name": order.supplier_name,
        "supplier_url": order.supplier_url,
        "supplier_contact": order.supplier_contact,
        "status": order.status,
        "order_date": order.order_date,
        "expected_arrival": order.expected_arrival,
        "actual_arrival": order.actual_arrival,
        "notes": order.notes,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }


@router.put("/purchase-orders/{order_id}", response_model=PurchaseOrderResponse)
async def update_purchase_order(
    order_id: str,
    order_data: PurchaseOrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新采购单"""
    result = await db.execute(
        select(PurchaseOrder).where(PurchaseOrder.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="采购单不存在")
    
    # 更新字段
    update_data = order_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)
    
    await db.commit()
    await db.refresh(order)
    
    return {
        "id": order.id,
        "po_number": order.po_number,
        "product_id": order.product_id,
        "qty": order.qty,
        "unit_price": float(order.unit_price or 0),
        "total_amount": float(order.total_amount or 0),
        "supplier_name": order.supplier_name,
        "supplier_url": order.supplier_url,
        "supplier_contact": order.supplier_contact,
        "status": order.status,
        "order_date": order.order_date,
        "expected_arrival": order.expected_arrival,
        "actual_arrival": order.actual_arrival,
        "notes": order.notes,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }


# ===========================================
# ERP订单管理 API
# ===========================================

@router.get("/orders", response_model=ERPOrderListResponse)
async def get_erp_orders(
    platform: Optional[str] = None,
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取ERP订单列表"""
    query = select(ERPOrder)
    count_query = select(func.count(ERPOrder.id))
    
    # 筛选条件
    if platform:
        query = query.where(ERPOrder.platform == platform)
        count_query = count_query.where(ERPOrder.platform == platform)
    if status:
        query = query.where(ERPOrder.status == status)
        count_query = count_query.where(ERPOrder.status == status)
    if keyword:
        query = query.where(
            or_(
                ERPOrder.platform_order_id.contains(keyword),
                ERPOrder.product_name.contains(keyword),
                ERPOrder.buyer_name.contains(keyword)
            )
        )
        count_query = count_query.where(
            or_(
                ERPOrder.platform_order_id.contains(keyword),
                ERPOrder.product_name.contains(keyword),
                ERPOrder.buyer_name.contains(keyword)
            )
        )
    if start_date:
        query = query.where(ERPOrder.order_time >= start_date)
        count_query = count_query.where(ERPOrder.order_time >= start_date)
    if end_date:
        query = query.where(ERPOrder.order_time <= end_date)
        count_query = count_query.where(ERPOrder.order_time <= end_date)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(ERPOrder.order_time.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return {
        "items": [{
            "id": o.id,
            "user_id": o.user_id,
            "platform": o.platform,
            "shop_id": o.shop_id,
            "platform_order_id": o.platform_order_id,
            "product_id": o.product_id,
            "sku_id": o.sku_id,
            "product_name": o.product_name,
            "quantity": o.quantity,
            "sale_price": float(o.sale_price or 0),
            "total_amount": float(o.total_amount or 0),
            "currency": o.currency,
            "cost_price": float(o.cost_price or 0),
            "shipping_cost": float(o.shipping_cost or 0),
            "platform_fee": float(o.platform_fee or 0),
            "ad_cost": float(o.ad_cost or 0),
            "profit": float(o.profit or 0),
            "buyer_id": o.buyer_id,
            "buyer_name": o.buyer_name,
            "buyer_phone": o.buyer_phone,
            "buyer_address": o.buyer_address,
            "status": o.status,
            "abnormal_type": o.abnormal_type,
            "order_time": o.order_time,
            "pay_time": o.pay_time,
            "ship_time": o.ship_time,
            "deliver_time": o.deliver_time,
            "notes": o.notes,
            "created_at": o.created_at,
            "updated_at": o.updated_at,
        } for o in orders],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# ===========================================
# 智能定价 API
# ===========================================

@router.post("/pricing", response_model=PricingResponse)
async def calculate_pricing(
    pricing_data: PricingRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """计算智能定价"""
    # 计算总成本
    total_cost = (
        pricing_data.cost_price +
        pricing_data.domestic_shipping +
        pricing_data.first_mile_shipping
    )
    
    # 计算目标售价
    # 目标售价 = 总成本 / (1 - 平台佣金率 - 广告预算占比)
    denominator = 1 - float(pricing_data.platform_fee_rate) - float(pricing_data.ad_budget_rate)
    if denominator <= 0:
        denominator = 0.5  # 防止除零
    
    target_price = float(total_cost) * (1 + float(pricing_data.target_profit_rate)) / denominator
    
    # 计算建议售价（考虑竞品价格）
    suggested_price = target_price
    pricing_basis = f"成本{float(total_cost):.2f} × (1 + {float(pricing_data.target_profit_rate)*100:.0f}%) = {target_price:.2f}"
    
    if pricing_data.competitor_price:
        competitor_price = float(pricing_data.competitor_price)
        # 不超过竞品价格的110%
        max_price = competitor_price * 1.1
        if suggested_price > max_price:
            suggested_price = max_price
            pricing_basis += f"，竞品参考{competitor_price:.2f}，最终取{max_price:.2f}"
        else:
            pricing_basis += f"，竞品参考{competitor_price:.2f}，最终取{suggested_price:.2f}"
    
    # 计算利润率
    profit_margin = (suggested_price - float(total_cost)) / suggested_price
    
    # 成本明细
    cost_breakdown = {
        "cost_price": float(pricing_data.cost_price),
        "domestic_shipping": float(pricing_data.domestic_shipping),
        "first_mile_shipping": float(pricing_data.first_mile_shipping),
        "total_cost": float(total_cost),
        "platform_fee": suggested_price * float(pricing_data.platform_fee_rate),
        "ad_budget": suggested_price * float(pricing_data.ad_budget_rate),
        "expected_profit": suggested_price - float(total_cost) - suggested_price * float(pricing_data.platform_fee_rate) - suggested_price * float(pricing_data.ad_budget_rate),
    }
    
    return {
        "product_id": pricing_data.product_id,
        "total_cost": float(total_cost),
        "target_price": round(target_price, 2),
        "competitor_price": float(pricing_data.competitor_price) if pricing_data.competitor_price else None,
        "suggested_price": round(suggested_price, 2),
        "profit_margin": round(profit_margin * 100, 2),
        "cost_breakdown": cost_breakdown,
        "pricing_basis": pricing_basis,
    }


# ===========================================
# 财务汇总 API
# ===========================================

@router.get("/finance/summary")
async def get_finance_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取财务汇总"""
    # 默认查询最近30天
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()
    
    # 查询汇总数据
    result = await db.execute(
        select(DailyFinanceSummary)
        .where(DailyFinanceSummary.date >= start_date)
        .where(DailyFinanceSummary.date <= end_date)
        .order_by(DailyFinanceSummary.date.desc())
    )
    summaries = result.scalars().all()
    
    # 计算总计
    total_sales = sum(float(s.total_sales or 0) for s in summaries)
    total_orders = sum(s.total_orders or 0 for s in summaries)
    total_cost = sum(float(s.total_cost or 0) for s in summaries)
    total_profit = sum(float(s.net_profit or 0) for s in summaries)
    
    return {
        "period": {"start_date": start_date, "end_date": end_date},
        "total_sales": round(total_sales, 2),
        "total_orders": total_orders,
        "total_cost": round(total_cost, 2),
        "total_profit": round(total_profit, 2),
        "profit_rate": round(total_profit / total_sales * 100, 2) if total_sales > 0 else 0,
        "daily_summaries": [{
            "date": s.date,
            "total_sales": float(s.total_sales or 0),
            "total_orders": s.total_orders,
            "net_profit": float(s.net_profit or 0),
        } for s in summaries],
    }
