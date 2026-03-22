"""
平台绑定API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime
import json
import hashlib
import base64

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User, FeishuUser
from app.models.business import PlatformBinding
from app.schemas.business import (
    PlatformBindingCreate, PlatformBindingUpdate, PlatformBindingResponse
)

router = APIRouter(prefix="/platform-bindings", tags=["平台绑定"])


def encrypt_credentials(data: dict) -> str:
    """加密凭据（简单实现，生产环境应使用更安全的加密方式）"""
    json_str = json.dumps(data)
    # 使用base64编码（生产环境应使用AES等加密算法）
    return base64.b64encode(json_str.encode()).decode()


def decrypt_credentials(encrypted: str) -> dict:
    """解密凭据"""
    try:
        json_str = base64.b64decode(encrypted.encode()).decode()
        return json.loads(json_str)
    except:
        return {}


@router.get("")
async def get_platform_bindings(
    user_id: Optional[str] = None,
    platform: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取平台绑定列表"""
    query = select(PlatformBinding)
    count_query = select(func.count(PlatformBinding.id))
    
    if user_id:
        query = query.where(PlatformBinding.user_id == user_id)
        count_query = count_query.where(PlatformBinding.user_id == user_id)
    
    if platform:
        query = query.where(PlatformBinding.platform == platform)
        count_query = count_query.where(PlatformBinding.platform == platform)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(PlatformBinding.created_at.desc())
    
    result = await db.execute(query)
    bindings = result.scalars().all()
    
    return {
        "items": [
            {
                "id": b.id,
                "user_id": b.user_id,
                "platform": b.platform,
                "shop_id": b.shop_id,
                "shop_name": b.shop_name,
                "account_info": json.loads(b.account_info) if b.account_info else {},
                "status": b.status,
                "last_sync_at": b.last_sync_at.isoformat() if b.last_sync_at else None,
                "created_at": b.created_at.isoformat(),
                "updated_at": b.updated_at.isoformat()
            }
            for b in bindings
        ],
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.post("", response_model=PlatformBindingResponse)
async def create_platform_binding(
    binding_data: PlatformBindingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """绑定平台账号"""
    # 检查是否已绑定
    result = await db.execute(
        select(PlatformBinding).where(
            PlatformBinding.user_id == binding_data.user_id,
            PlatformBinding.platform == binding_data.platform,
            PlatformBinding.shop_id == binding_data.shop_id
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该店铺已绑定"
        )
    
    # 验证凭据（模拟）
    # 生产环境应该调用平台API验证
    credentials = binding_data.credentials
    
    binding = PlatformBinding(
        user_id=binding_data.user_id,
        platform=binding_data.platform,
        shop_id=binding_data.shop_id,
        shop_name=binding_data.shop_name,
        account_info=json.dumps(binding_data.account_info) if binding_data.account_info else None,
        credentials=encrypt_credentials(credentials),
        status="active"
    )
    
    db.add(binding)
    await db.commit()
    await db.refresh(binding)
    
    return PlatformBindingResponse.model_validate(binding)


@router.get("/{binding_id}")
async def get_platform_binding(
    binding_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取平台绑定详情"""
    result = await db.execute(
        select(PlatformBinding).where(PlatformBinding.id == binding_id)
    )
    binding = result.scalar_one_or_none()
    
    if not binding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="绑定记录不存在"
        )
    
    return {
        "id": binding.id,
        "user_id": binding.user_id,
        "platform": binding.platform,
        "shop_id": binding.shop_id,
        "shop_name": binding.shop_name,
        "account_info": json.loads(binding.account_info) if binding.account_info else {},
        "status": binding.status,
        "last_sync_at": binding.last_sync_at.isoformat() if binding.last_sync_at else None,
        "created_at": binding.created_at.isoformat(),
        "updated_at": binding.updated_at.isoformat()
    }


@router.put("/{binding_id}")
async def update_platform_binding(
    binding_id: str,
    binding_data: PlatformBindingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新绑定信息"""
    result = await db.execute(
        select(PlatformBinding).where(PlatformBinding.id == binding_id)
    )
    binding = result.scalar_one_or_none()
    
    if not binding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="绑定记录不存在"
        )
    
    # 更新字段
    update_data = binding_data.model_dump(exclude_unset=True)
    
    if 'account_info' in update_data and update_data['account_info']:
        update_data['account_info'] = json.dumps(update_data['account_info'])
    
    if 'credentials' in update_data and update_data['credentials']:
        update_data['credentials'] = encrypt_credentials(update_data['credentials'])
    
    for field, value in update_data.items():
        setattr(binding, field, value)
    
    await db.commit()
    await db.refresh(binding)
    
    return {
        "id": binding.id,
        "user_id": binding.user_id,
        "platform": binding.platform,
        "shop_id": binding.shop_id,
        "shop_name": binding.shop_name,
        "account_info": json.loads(binding.account_info) if binding.account_info else {},
        "status": binding.status,
        "last_sync_at": binding.last_sync_at.isoformat() if binding.last_sync_at else None,
        "created_at": binding.created_at.isoformat(),
        "updated_at": binding.updated_at.isoformat()
    }


@router.delete("/{binding_id}")
async def delete_platform_binding(
    binding_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """解绑平台账号"""
    result = await db.execute(
        select(PlatformBinding).where(PlatformBinding.id == binding_id)
    )
    binding = result.scalar_one_or_none()
    
    if not binding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="绑定记录不存在"
        )
    
    await db.delete(binding)
    await db.commit()
    
    return {"success": True, "message": "解绑成功"}


@router.post("/{binding_id}/sync")
async def sync_platform_data(
    binding_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """同步平台数据"""
    result = await db.execute(
        select(PlatformBinding).where(PlatformBinding.id == binding_id)
    )
    binding = result.scalar_one_or_none()
    
    if not binding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="绑定记录不存在"
        )
    
    # TODO: 调用平台API同步数据
    
    # 更新同步时间
    binding.last_sync_at = datetime.now()
    await db.commit()
    
    return {
        "success": True,
        "message": "同步成功",
        "sync_time": binding.last_sync_at.isoformat()
    }
