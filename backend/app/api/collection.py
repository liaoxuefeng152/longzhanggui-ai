"""
1688采集API路由
"""
from fastapi import APIRouter, HTTPException, Depends, Body
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
            
    except ValueError as e:
        # 友好的错误消息（URL格式问题）
        logger.warning(f"URL格式错误: {e}")
        return {
            "success": False,
            "message": str(e),
            "error_type": "invalid_url"
        }
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
            
    except ValueError as e:
        # 友好的错误消息
        logger.warning(f"URL格式错误: {e}")
        return {
            "success": False,
            "message": str(e),
            "error_type": "invalid_url"
        }
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


@router.post("/collect/search-page")
async def collect_from_search_page(
    url: str = Body(..., embed=True),
    max_items: int = Body(10, embed=True)
):
    """
    从1688搜索页批量提取商品链接
    
    支持的URL格式:
    - https://search.1688.com/jerry/search.htm?keywords=xxx
    - https://s.1688.com/youyuan/index.htm?keywords=xxx
    """
    from app.services.collection_1688_service import collect_from_search_page
    
    try:
        result = await collect_from_search_page(url, max_items)
        return result
        
    except Exception as e:
        logger.error(f"搜索页采集失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/collect/batch-from-search")
async def batch_collect_from_search_page(
    request: dict  # { url: str, max_items: int }
):
    """
    从搜索页采集并保存多个商品
    
    1. 解析搜索页获取商品链接
    2. 批量采集每个商品并保存到商品库
    """
    from app.services.collection_1688_service import collect_from_search_page, collection_1688_service
    
    try:
        search_url = request.get("url", "")
        max_items = request.get("max_items", 10)
        
        if not search_url:
            raise HTTPException(status_code=400, detail="URL不能为空")
        
        # 步骤1: 从搜索页提取商品链接
        extract_result = await collect_from_search_page(search_url, max_items)
        if not extract_result.get("success"):
            return {
                "success": False,
                "error": extract_result.get("error", "提取商品链接失败")
            }
        
        product_links = extract_result.get("links", [])
        if not product_links:
            return {
                "success": True,
                "message": "未找到商品链接",
                "collected": []
            }
        
        # 步骤2: 批量采集每个商品
        collected = []
        failed = []
        
        for link in product_links:
            try:
                product_id = await collection_1688_service.collect_and_save(link)
                if product_id:
                    collected.append({
                        "product_id": product_id,
                        "url": link,
                        "status": "success"
                    })
                else:
                    failed.append({
                        "url": link,
                        "status": "failed",
                        "error": "采集失败"
                    })
            except Exception as e:
                logger.error(f"采集失败 {link}: {e}")
                failed.append({
                    "url": link,
                    "status": "failed", 
                    "error": str(e)
                })
        
        return {
            "success": True,
            "message": f"成功采集 {len(collected)}/{len(product_links)} 个商品",
            "total": len(product_links),
            "collected": collected,
            "failed": failed
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"批量采集失败: {e}")
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
