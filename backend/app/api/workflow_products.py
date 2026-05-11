"""
工作流商品管理API
提供工作流与商品库的关联接口
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
from loguru import logger

from app.core.database import get_db
from app.models.erp import ERPProduct, Collection1688
from sqlalchemy import select, and_


router = APIRouter(prefix="/workflow/products", tags=["工作流商品"])


# ===========================================
# 数据模型
# ===========================================

class CreateProductDraftRequest(BaseModel):
    """创建商品草稿请求"""
    name: str  # 商品名称
    category: str = ""  # 类目
    platform: str = ""  # 目标平台
    region: str = ""  # 目标地区
    source_link: str = ""  # 1688链接
    selection_id: str = ""  # 选品ID


class UpdateProductWorkflowRequest(BaseModel):
    """更新商品工作流状态"""
    product_id: str
    workflow_status: str  # draft, selected, collecting, processing, listing, pricing, ready, published
    

class UpdateListingRequest(BaseModel):
    """更新Listing信息"""
    product_id: str
    sale_title: str = ""
    sale_description: str = ""
    sale_keywords: List[str] = []


class UpdatePricingRequest(BaseModel):
    """更新定价信息"""
    product_id: str
    suggested_price: float
    target_profit_rate: float = 0.30


class UpdateImagesRequest(BaseModel):
    """更新处理后的图片"""
    product_id: str
    processed_images: List[str]
    image_status: str = "done"


# ===========================================
# API接口
# ===========================================

@router.post("/draft")
async def create_product_draft(request: CreateProductDraftRequest):
    """
    从选品创建商品草稿
    
    选品完成后，创建商品草稿记录，关联选品ID和1688链接
    """
    async for db in get_db():
        try:
            from sqlalchemy import text
            from app.services.collection_1688_service import collection_1688_service
            
            # 获取默认用户ID
            result = await db.execute(text("SELECT id FROM feishu_users LIMIT 1"))
            default_user = result.fetchone()
            user_id = default_user[0] if default_user else "system"
            
            # 生成SKU
            import uuid
            sku = f"SKU-{uuid.uuid4().hex[:8].upper()}"
            
            # 创建商品草稿
            product = ERPProduct(
                user_id=user_id,
                internal_sku=sku,
                name_zh=request.name,
                category_name=request.category,
                source_url=request.source_link,
                workflow_status="selected",
                selection_id=request.selection_id,
                status="draft"
            )
            
            db.add(product)
            await db.flush()
            
            # 如果有1688链接，同时发起采集
            product_id = product.id
            source_link = request.source_link
            
            await db.commit()
            
            logger.info(f"商品草稿创建成功: {product_id}")
            
            result_data = {
                "product_id": product_id,
                "internal_sku": sku,
                "workflow_status": "selected"
            }
            
            # 如果有1688链接，返回采集状态
            if source_link:
                result_data["source_link"] = source_link
                result_data["collection_status"] = "ready"
            
            return {
                "success": True,
                "data": result_data
            }
            
        except Exception as e:
            logger.error(f"创建商品草稿失败: {e}")
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        break
    
    return {"success": False, "error": "Database connection failed"}


@router.get("/{product_id}")
async def get_product_for_workflow(product_id: str):
    """
    获取工作流商品详情
    
    工作流各步骤从该接口读取商品数据
    """
    async for db in get_db():
        try:
            # 查询商品
            result = await db.execute(
                select(ERPProduct).where(ERPProduct.id == product_id)
            )
            product = result.scalar_one_or_none()
            
            if not product:
                raise HTTPException(status_code=404, detail="商品不存在")
            
            # 查询采集记录（不使用relationship，直接查询）
            collection_result = await db.execute(
                select(Collection1688).where(Collection1688.product_id == product_id)
            )
            collection = collection_result.scalar_one_or_none()
            
            # 格式化返回数据
            return {
                "success": True,
                "data": {
                    "id": product.id,
                    "internal_sku": product.internal_sku,
                    "name_zh": product.name_zh,
                    "name_en": product.name_en or "",
                    "description": product.description or "",
                    "category_name": product.category_name or "",
                    
                    # 来源信息
                    "source_url": product.source_url or "",
                    "source_id": product.source_id or "",
                    "supplier_name": product.supplier_name or "",
                    
                    # 成本价格
                    "cost_price": float(product.cost_price or 0),
                    "domestic_shipping": float(product.domestic_shipping or 0),
                    "first_mile_shipping": float(product.first_mile_shipping or 0),
                    "total_cost": float(product.total_cost),
                    "weight": float(product.weight or 0),
                    
                    # 图片
                    "images": product.images_list,
                    "processed_images": product.processed_images_list,
                    "image_status": product.image_status,
                    
                    # Listing
                    "sale_title": product.sale_title or "",
                    "sale_description": product.sale_description or "",
                    "keywords": product.keywords_list,
                    "listing_status": product.listing_status,
                    
                    # 定价
                    "suggested_price": float(product.suggested_price or 0),
                    "target_profit_rate": float(product.target_profit_rate or 0.30),
                    
                    # 状态
                    "workflow_status": product.workflow_status,
                    "status": product.status,
                    "selection_id": product.selection_id,
                    
                    # 采集数据（如果有）
                    "collection": {
                        "title": collection.title if collection else "",
                        "price": float(collection.price or 0) if collection else 0,
                        "images": json.loads(collection.images) if collection and collection.images else [],
                        "description": collection.description if collection else "",
                        "skus": json.loads(collection.skus) if collection and collection.skus else [],
                        "weight": float(collection.weight or 0) if collection else 0,
                    } if collection else None,
                    
                    # 时间
                    "created_at": product.created_at.isoformat() if product.created_at else None,
                    "updated_at": product.updated_at.isoformat() if product.updated_at else None,
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"获取商品详情失败: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        break
    
    return {"success": False, "error": "Database connection failed"}


@router.put("/workflow-status")
async def update_workflow_status(request: UpdateProductWorkflowRequest):
    """
    更新商品工作流状态
    """
    async for db in get_db():
        try:
            result = await db.execute(
                select(ERPProduct).where(ERPProduct.id == request.product_id)
            )
            product = result.scalar_one_or_none()
            
            if not product:
                raise HTTPException(status_code=404, detail="商品不存在")
            
            product.workflow_status = request.workflow_status
            await db.commit()
            
            return {
                "success": True,
                "data": {
                    "product_id": product.id,
                    "workflow_status": product.workflow_status
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"更新工作流状态失败: {e}")
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        break


@router.put("/listing")
async def update_listing(request: UpdateListingRequest):
    """
    更新Listing信息（优化标题、描述、关键词）
    """
    async for db in get_db():
        try:
            result = await db.execute(
                select(ERPProduct).where(ERPProduct.id == request.product_id)
            )
            product = result.scalar_one_or_none()
            
            if not product:
                raise HTTPException(status_code=404, detail="商品不存在")
            
            # 更新Listing信息
            product.sale_title = request.sale_title
            product.sale_description = request.sale_description
            product.sale_keywords = json.dumps(request.sale_keywords, ensure_ascii=False)
            product.listing_status = "done"
            product.workflow_status = "listing"
            
            await db.commit()
            
            logger.info(f"Listing更新成功: {product.id}")
            
            return {
                "success": True,
                "data": {
                    "product_id": product.id,
                    "sale_title": product.sale_title,
                    "sale_keywords": product.keywords_list,
                    "listing_status": product.listing_status
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"更新Listing失败: {e}")
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        break


@router.put("/pricing")
async def update_pricing(request: UpdatePricingRequest):
    """
    更新定价信息
    """
    async for db in get_db():
        try:
            result = await db.execute(
                select(ERPProduct).where(ERPProduct.id == request.product_id)
            )
            product = result.scalar_one_or_none()
            
            if not product:
                raise HTTPException(status_code=404, detail="商品不存在")
            
            # 更新定价信息
            product.suggested_price = request.suggested_price
            product.target_profit_rate = request.target_profit_rate
            product.workflow_status = "pricing"
            
            await db.commit()
            
            logger.info(f"定价更新成功: {product.id}")
            
            return {
                "success": True,
                "data": {
                    "product_id": product.id,
                    "suggested_price": float(product.suggested_price),
                    "target_profit_rate": float(product.target_profit_rate),
                    "workflow_status": product.workflow_status
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"更新定价失败: {e}")
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        break


@router.put("/images")
async def update_processed_images(request: UpdateImagesRequest):
    """
    更新处理后的图片
    """
    async for db in get_db():
        try:
            result = await db.execute(
                select(ERPProduct).where(ERPProduct.id == request.product_id)
            )
            product = result.scalar_one_or_none()
            
            if not product:
                raise HTTPException(status_code=404, detail="商品不存在")
            
            # 更新图片
            product.processed_images = json.dumps(request.processed_images, ensure_ascii=False)
            product.image_status = request.image_status
            
            await db.commit()
            
            logger.info(f"图片更新成功: {product.id}")
            
            return {
                "success": True,
                "data": {
                    "product_id": product.id,
                    "processed_images": product.processed_images_list,
                    "image_status": product.image_status
                }
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"更新图片失败: {e}")
            await db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        break


@router.get("/list/by-status")
async def list_products_by_status(workflow_status: str = None):
    """
    按工作流状态查询商品列表
    """
    async for db in get_db():
        try:
            query = select(ERPProduct)
            
            if workflow_status:
                query = query.where(ERPProduct.workflow_status == workflow_status)
            
            query = query.order_by(ERPProduct.created_at.desc())
            
            result = await db.execute(query)
            products = result.scalars().all()
            
            return {
                "success": True,
                "data": [
                    {
                        "id": p.id,
                        "internal_sku": p.internal_sku,
                        "name_zh": p.name_zh,
                        "workflow_status": p.workflow_status,
                        "listing_status": p.listing_status,
                        "cost_price": float(p.cost_price or 0),
                        "suggested_price": float(p.suggested_price or 0),
                        "images_count": len(p.images_list),
                        "created_at": p.created_at.isoformat() if p.created_at else None,
                    }
                    for p in products
                ]
            }
            
        except Exception as e:
            logger.error(f"查询商品列表失败: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        break
