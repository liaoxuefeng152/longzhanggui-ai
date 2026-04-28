"""
妙手ERP采集API
使用妙手ERP官方API采集商品
"""
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from loguru import logger

from app.services.miaoshou_collection_service import MiaoshouCollectionService, get_miaoshou_service

router = APIRouter(prefix="/api/v1/miaoshou", tags=["妙手ERP"])


class CollectRequest(BaseModel):
    """采集请求"""
    url: str
    platform: str = "1688"
    cookies: Optional[str] = None


class BatchCollectRequest(BaseModel):
    """批量采集请求"""
    urls: list[str]
    platform: str = "1688"
    cookies: Optional[str] = None


class MiaoshouConfig(BaseModel):
    """妙手ERP配置"""
    phone: Optional[str] = None
    password: Optional[str] = None
    cookies: Optional[str] = None


# 全局配置存储
_miaoshou_config: dict = {
    "status": "disconnected",
    "cookies": None,
}


@router.post("/collect")
async def collect_product(request: CollectRequest):
    """
    使用妙手ERP采集单个商品
    """
    try:
        # 获取Cookie
        cookies = request.cookies or _miaoshou_config.get("cookies")
        if not cookies:
            # 返回友好提示，而不是401错误
            return {
                "success": False,
                "error": "请先配置妙手ERP的Cookie",
                "code": "NEED_CONFIG",
                "message": "请前往「平台配置 - 妙手ERP」页面配置Cookie"
            }
        
        # 创建服务并采集
        service = get_miaoshou_service(cookies)
        product = await service.collect_product(request.url, request.platform)
        
        if product:
            return {
                "success": True,
                "data": product,
            }
        else:
            return {
                "success": False,
                "error": "采集失败，请检查链接是否正确"
            }
            
    except Exception as e:
        error_msg = str(e)
        logger.error(f"妙手ERP采集失败: {error_msg}")
        if "认证失败" in error_msg or "401" in error_msg:
            return {
                "success": False,
                "error": "Cookie已过期，请重新配置",
                "code": "COOKIE_EXPIRED",
                "message": "请前往「平台配置 - 妙手ERP」页面更新Cookie"
            }
        return {
            "success": False,
            "error": error_msg
        }


@router.post("/collect/batch")
async def batch_collect(request: BatchCollectRequest):
    """
    使用妙手ERP批量采集商品
    """
    try:
        cookies = request.cookies or _miaoshou_config.get("cookies")
        if not cookies:
            return {
                "success": False,
                "error": "请先配置妙手ERP的Cookie",
                "code": "NEED_CONFIG",
                "message": "请前往「平台配置 - 妙手ERP」页面配置Cookie"
            }
        
        service = get_miaoshou_service(cookies)
        products = await service.batch_collect(request.urls, request.platform)
        
        return {
            "success": True,
            "data": products,
            "total": len(products),
        }
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"妙手ERP批量采集失败: {error_msg}")
        if "认证失败" in error_msg or "401" in error_msg:
            return {
                "success": False,
                "error": "Cookie已过期，请重新配置",
                "code": "COOKIE_EXPIRED"
            }
        return {
            "success": False,
            "error": error_msg
        }


@router.post("/config")
async def update_config(config: MiaoshouConfig):
    """
    更新妙手ERP配置
    """
    global _miaoshou_config
    
    if config.cookies:
        _miaoshou_config["cookies"] = config.cookies
        _miaoshou_config["status"] = "connected"
    
    return {
        "success": True,
        "message": "配置已更新",
        "status": _miaoshou_config["status"]
    }


@router.get("/config")
async def get_config():
    """
    获取妙手ERP配置状态
    """
    return {
        "success": True,
        "status": _miaoshou_config.get("status", "disconnected"),
        "has_cookies": bool(_miaoshou_config.get("cookies")),
    }


@router.post("/test")
async def test_connection(config: MiaoshouConfig):
    """
    测试妙手ERP连接
    """
    try:
        cookies = config.cookies
        if not cookies:
            raise HTTPException(status_code=400, detail="请提供Cookie")
        
        # 解析Cookie
        cookie_dict = {}
        for item in cookies.split(';'):
            item = item.strip()
            if '=' in item:
                key, value = item.split('=', 1)
                cookie_dict[key.strip()] = value.strip()
        
        # 检查必要的Cookie字段
        required_fields = ['mserp', 'accountId']
        missing = [f for f in required_fields if f not in cookie_dict]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Cookie缺少必要字段: {', '.join(missing)}"
            )
        
        # 测试API调用
        import httpx
        async with httpx.AsyncClient(
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Cookie": cookies,
            },
            timeout=30.0,
            follow_redirects=True,
        ) as client:
            response = await client.get(
                "https://erp.91miaoshou.com/api/move/common_collect_box/getCommonCollectBizShowColumnsSetting"
            )
            
            if response.status_code == 200:
                # 更新全局配置
                _miaoshou_config["cookies"] = cookies
                _miaoshou_config["status"] = "connected"
                
                return {
                    "success": True,
                    "message": "连接成功！"
                }
            elif response.status_code == 401:
                raise HTTPException(status_code=401, detail="Cookie已过期")
            else:
                raise HTTPException(status_code=response.status_code, detail=f"API返回错误: {response.status_code}")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"妙手ERP连接测试失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
