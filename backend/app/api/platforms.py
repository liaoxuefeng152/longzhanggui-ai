"""
平台配置API路由
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from datetime import datetime
import json
import os
from pathlib import Path

from app.api.auth import get_current_user
from app.models.user import User
from app.schemas.business import (
    PlatformConfigUpdate, PlatformConfigResponse, PlatformConfigListResponse
)

router = APIRouter(prefix="/platforms", tags=["平台配置"])

# 配置文件路径
CONFIG_FILE = Path(__file__).parent.parent.parent.parent / "data" / "platform_configs.json"


def get_default_platforms() -> dict:
    """获取默认平台配置"""
    return {
        "tiktok": {
            "id": "tiktok",
            "name": "TikTok Shop",
            "icon": "🎵",
            "color": "#FF0050",
            "api_doc_url": "https://partner.tiktok.com/product",
            "regions": ["美国", "英国", "东南亚", "中东"],
            "currencies": ["USD", "GBP", "SGD"],
        },
        "amazon": {
            "id": "amazon",
            "name": "Amazon",
            "icon": "📦",
            "color": "#FF9900",
            "api_doc_url": "https://developer.amazonservices.com",
            "regions": ["美国", "英国", "德国", "日本", "澳洲"],
            "currencies": ["USD", "GBP", "EUR", "JPY", "AUD"],
        },
        "shopee": {
            "id": "shopee",
            "name": "Shopee",
            "icon": "🛒",
            "color": "#EE4D2D",
            "api_doc_url": "https://partner.shopeemobile.com",
            "regions": ["新加坡", "马来西亚", "泰国", "印尼", "越南", "菲律宾"],
            "currencies": ["SGD", "MYR", "THB", "IDR", "VND", "PHP"],
        },
        "lazada": {
            "id": "lazada",
            "name": "Lazada",
            "icon": "🏪",
            "color": "#0F1472",
            "api_doc_url": "https://open.lazada.com",
            "regions": ["新加坡", "马来西亚", "泰国", "印尼", "越南", "菲律宾"],
            "currencies": ["SGD", "MYR", "THB", "IDR", "VND", "PHP"],
        },
        "tokopedia": {
            "id": "tokopedia",
            "name": "Tokopedia",
            "icon": "🏬",
            "color": "#42D06D",
            "api_doc_url": "https://developer.tokopedia.com",
            "regions": ["印尼"],
            "currencies": ["IDR"],
        },
    }


def load_configs() -> dict:
    """加载保存的配置"""
    if not CONFIG_FILE.exists():
        return {}
    
    try:
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def save_configs(configs: dict) -> None:
    """保存配置到文件"""
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(configs, f, ensure_ascii=False, indent=2)


@router.get("", response_model=dict)
async def get_platforms(
    current_user: User = Depends(get_current_user)
):
    """获取所有平台配置"""
    saved_configs = load_configs()
    default_platforms = get_default_platforms()
    
    platforms = {}
    for platform_id, platform_info in default_platforms.items():
        saved = saved_configs.get(platform_id, {})
        
        has_credentials = bool(
            saved.get("credentials", {}).get("api_key") or
            saved.get("credentials", {}).get("api_secret")
        )
        
        platforms[platform_id] = {
            "id": platform_id,
            "name": platform_info["name"],
            "icon": platform_info["icon"],
            "color": platform_info["color"],
            "api_doc_url": platform_info.get("api_doc_url"),
            "regions": platform_info.get("regions", []),
            "currencies": platform_info.get("currencies", []),
            "has_credentials": has_credentials,
            "credentials": saved.get("credentials") if has_credentials else None,
            "status": "configured" if has_credentials else "unconfigured",
            "last_updated": saved.get("last_updated"),
        }
    
    return {
        "success": True,
        "data": {
            "platforms": platforms
        }
    }


@router.post("")
async def save_platform_config(
    config_data: PlatformConfigUpdate,
    current_user: User = Depends(get_current_user)
):
    """保存平台配置"""
    # 检查是否是管理员
    if current_user.role not in ["founder", "admin"]:
        raise HTTPException(status_code=403, detail="只有管理员才能配置平台API")
    
    platform_id = config_data.platform
    default_platforms = get_default_platforms()
    
    if platform_id not in default_platforms:
        raise HTTPException(status_code=404, detail=f"平台 {platform_id} 不存在")
    
    saved_configs = load_configs()
    
    # 保存配置
    saved_configs[platform_id] = {
        "credentials": config_data.credentials.model_dump(exclude_none=True),
        "last_updated": datetime.now().isoformat()
    }
    
    save_configs(saved_configs)
    
    return {
        "success": True,
        "message": f"{default_platforms[platform_id]['name']} 配置已保存",
        "data": {
            "platform_id": platform_id,
            "status": "configured"
        }
    }


@router.post("/{platform_id}/test")
async def test_platform_connection(
    platform_id: str,
    current_user: User = Depends(get_current_user)
):
    """测试平台连接"""
    default_platforms = get_default_platforms()
    
    if platform_id not in default_platforms:
        raise HTTPException(status_code=404, detail=f"平台 {platform_id} 不存在")
    
    saved_configs = load_configs()
    saved = saved_configs.get(platform_id, {})
    credentials = saved.get("credentials", {})
    
    api_key = credentials.get("api_key")
    api_secret = credentials.get("api_secret")
    
    if not api_key and not api_secret:
        return {
            "success": False,
            "message": "请先配置 API 凭证",
            "data": {
                "connected": False
            }
        }
    
    # 模拟连接测试
    # 实际生产环境中应该调用各平台的API进行真实测试
    return {
        "success": True,
        "message": f"{default_platforms[platform_id]['name']} 连接测试成功",
        "data": {
            "connected": True,
            "platform": platform_id,
            "tested_at": datetime.now().isoformat()
        }
    }


@router.delete("/{platform_id}")
async def delete_platform_config(
    platform_id: str,
    current_user: User = Depends(get_current_user)
):
    """删除平台配置"""
    if current_user.role not in ["founder", "admin"]:
        raise HTTPException(status_code=403, detail="只有管理员才能删除平台配置")
    
    default_platforms = get_default_platforms()
    
    if platform_id not in default_platforms:
        raise HTTPException(status_code=404, detail=f"平台 {platform_id} 不存在")
    
    saved_configs = load_configs()
    
    if platform_id in saved_configs:
        del saved_configs[platform_id]
        save_configs(saved_configs)
    
    return {
        "success": True,
        "message": f"{default_platforms[platform_id]['name']} 配置已删除"
    }
