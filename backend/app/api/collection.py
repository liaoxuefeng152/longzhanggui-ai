"""
1688采集API路由
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any

from app.services.collection_1688_service import collection_1688_service
from loguru import logger


router = APIRouter(prefix="/1688", tags=["1688采集"])


class CollectRequest(BaseModel):
    """采集请求"""
    url: str


class BatchCollectRequest(BaseModel):
    """批量采集请求"""
    urls: List[str]


class SearchRequest(BaseModel):
    """搜索请求"""
    keyword: str
    page: int = 1
    page_size: int = 20


@router.post("/collect")
async def collect_product(request: CollectRequest):
    """
    采集单个1688商品
    
    采集商品信息并保存到ERP商品库
    """
    try:
        product_id = await collection_1688_service.collect_and_save(request.url)
        
        if product_id:
            return {
                "success": True,
                "message": "采集成功",
                "product_id": product_id
            }
        else:
            raise HTTPException(status_code=500, detail="采集失败")
            
    except Exception as e:
        logger.error(f"采集失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/collect/preview")
async def preview_product(request: CollectRequest):
    """
    预览采集商品
    
    只采集信息，不保存到数据库
    """
    try:
        data = await collection_1688_service.collect_product(request.url)
        
        if data:
            return {
                "success": True,
                "data": data
            }
        else:
            raise HTTPException(status_code=400, detail="无效的商品链接")
            
    except Exception as e:
        logger.error(f"预览失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/collect/batch")
async def batch_collect(request: BatchCollectRequest):
    """批量采集商品"""
    try:
        results = await collection_1688_service.collect_batch(request.urls)
        
        return {
            "success": True,
            "total": len(results),
            "items": results
        }
        
    except Exception as e:
        logger.error(f"批量采集失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search_products(request: SearchRequest):
    """搜索1688商品"""
    try:
        results = await collection_1688_service.search_products(
            keyword=request.keyword,
            page=request.page,
            page_size=request.page_size
        )
        
        return {
            "success": True,
            "data": results
        }
        
    except Exception as e:
        logger.error(f"搜索失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_collection_history(
    page: int = 1,
    page_size: int = 20
):
    """获取采集历史"""
    from app.core.database import get_db
    from app.models.erp import Collection1688
    from sqlalchemy import select, desc
    
    async for db in get_db():
        try:
            # 查询总数
            from sqlalchemy import func
            count_result = await db.execute(
                select(func.count(Collection1688.id))
            )
            total = count_result.scalar()
            
            # 分页查询
            result = await db.execute(
                select(Collection1688)
                .order_by(desc(Collection1688.created_at))
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
            items = result.scalars().all()
            
            return {
                "success": True,
                "total": total,
                "page": page,
                "page_size": page_size,
                "items": [
                    {
                        "id": item.id,
                        "source_url": item.source_url,
                        "source_id": item.source_id,
                        "product_id": item.product_id,
                        "status": item.status,
                        "created_at": item.created_at.isoformat() if item.created_at else None
                    }
                    for item in items
                ]
            }
            
        except Exception as e:
            logger.error(f"获取采集历史失败: {e}")
            raise HTTPException(status_code=500, detail=str(e))
        break
