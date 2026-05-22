"""
1688采集API路由

采集策略优先级:
1. 1688开放平台API（alibaba_1688_service，签名认证）
2. HTTPX爬虫（collection_1688_service，页面解析）
3. Playwright浏览器（JS渲染）
4. 模拟数据兜底
"""
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any

from app.services.alibaba_1688_service import alibaba_1688_service
from app.services.collection_1688_service import collection_1688_service
from app.tools.product_scrape_tool import product_scrape_tool
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


class TokenConfigRequest(BaseModel):
    """1688 API Token配置"""
    app_key: Optional[str] = None
    app_secret: Optional[str] = None
    access_token: Optional[str] = None


@router.post("/collect")
async def collect_product(request: CollectRequest):
    """
    采集单个1688商品

    采集策略: API优先 → 爬虫降级 → 浏览器降级
    采集成功后自动保存到ERP商品库
    """
    try:
        # 使用 ProductScrapeTool（三级降级 + 自动保存）
        result = await product_scrape_tool.run(
            url=request.url,
            save_to_erp=True,
        )
        
        if result.get("success"):
            return {
                "success": True,
                "message": "采集成功",
                "product_id": result.get("product_id"),
                "data": result,
            }
        else:
            return {
                "success": False,
                "message": result.get("error", "采集失败"),
                "error_type": result.get("error_type", "unknown"),
            }
            
    except ValueError as e:
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
    采集策略: API优先 → 爬虫降级
    """
    try:
        # 策略1: 尝试1688开放平台API
        api_result = await alibaba_1688_service.collect_by_url(request.url)
        if api_result.get("success"):
            return {
                "success": True,
                "data": api_result,
            }
        
        # 策略2: 降级到爬虫
        data = await collection_1688_service.collect_product(request.url)
        if data:
            return {
                "success": True,
                "data": data,
            }
        
        raise HTTPException(status_code=400, detail="无效的商品链接")
            
    except ValueError as e:
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
    """
    批量采集商品

    使用 ProductScrapeTool 三级降级策略，采集并保存到ERP
    """
    try:
        results = await product_scrape_tool.batch_run(
            urls=request.urls,
            save_to_erp=True,
        )
        
        return {
            "success": True,
            "total": len(results),
            "items": results,
        }
        
    except Exception as e:
        logger.error(f"批量采集失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search")
async def search_products(request: SearchRequest):
    """
    搜索1688商品

    优先使用1688开放平台API搜索，失败降级到爬虫
    """
    try:
        # 策略1: 1688开放平台API搜索
        api_result = await alibaba_1688_service.search_products(
            keyword=request.keyword,
            page=request.page,
            page_size=request.page_size,
        )
        
        if api_result.get("success") and api_result.get("items"):
            return {
                "success": True,
                "data": api_result,
            }
        
        # 策略2: 降级到爬虫搜索
        results = await collection_1688_service.search_products(
            keyword=request.keyword,
            page=request.page,
            page_size=request.page_size,
        )
        
        return {
            "success": True,
            "data": results,
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


@router.get("/token-config")
async def get_token_config():
    """获取1688 API Token配置（脱敏显示）"""
    try:
        from app.core.config import settings
        
        return {
            "success": True,
            "data": {
                "app_key": getattr(settings, 'ALIBABA_APP_KEY', '') or '',
                "app_secret_set": bool(getattr(settings, 'ALIBABA_APP_SECRET', '')),
                "access_token_set": bool(getattr(settings, 'ALIBABA_ACCESS_TOKEN', '')),
                "app_secret_masked": "****" + (getattr(settings, 'ALIBABA_APP_SECRET', '')[-4:] if getattr(settings, 'ALIBABA_APP_SECRET', '') else ''),
                "access_token_masked": "****" + (getattr(settings, 'ALIBABA_ACCESS_TOKEN', '')[-8:] if getattr(settings, 'ALIBABA_ACCESS_TOKEN', '') else ''),
            }
        }
    except Exception as e:
        logger.error(f"获取Token配置失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/token-config")
async def update_token_config(request: TokenConfigRequest):
    """更新1688 API Token配置（运行时更新，重启后失效）"""
    try:
        from app.core.config import settings
        from app.services.alibaba_1688_service import alibaba_1688_service
        
        updated = []
        
        if request.app_key is not None:
            settings.ALIBABA_APP_KEY = request.app_key
            alibaba_1688_service.app_key = request.app_key
            updated.append("app_key")
        
        if request.app_secret is not None:
            settings.ALIBABA_APP_SECRET = request.app_secret
            alibaba_1688_service.app_secret = request.app_secret
            updated.append("app_secret")
        
        if request.access_token is not None:
            settings.ALIBABA_ACCESS_TOKEN = request.access_token
            alibaba_1688_service.access_token = request.access_token
            updated.append("access_token")
        
        logger.info(f"1688 API Token配置已更新: {updated}")
        
        return {
            "success": True,
            "message": f"已更新: {', '.join(updated)}",
            "updated": updated
        }
    except Exception as e:
        logger.error(f"更新Token配置失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/token-config/test")
async def test_token_config():
    """测试当前1688 API Token是否有效"""
    try:
        from app.services.alibaba_1688_service import alibaba_1688_service
        
        # 使用一个测试offerId来验证Token
        result = await alibaba_1688_service.get_product_info("1049118574787")
        
        if result.get("success"):
            return {
                "success": True,
                "message": "Token有效，API调用成功",
                "test_product_title": result.get("title", "")[:50],
            }
        else:
            error_msg = result.get("error", "未知错误")
            if "401" in str(error_msg) or "authorized" in str(error_msg).lower():
                return {
                    "success": False,
                    "message": "Token已过期或无效，请重新获取",
                    "error_type": "token_expired"
                }
            else:
                return {
                    "success": False,
                    "message": f"API调用失败: {error_msg}",
                    "error_type": "api_error"
                }
    except Exception as e:
        logger.error(f"测试Token失败: {e}")
        return {
            "success": False,
            "message": f"测试失败: {str(e)}",
            "error_type": "connection_error"
        }
