"""
套餐管理API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import json

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User, Package
from app.schemas.user import PackageCreate, PackageUpdate, PackageResponse

router = APIRouter(prefix="/packages", tags=["套餐管理"])


@router.get("")
async def get_packages(
    active_only: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取套餐列表"""
    query = select(Package)
    
    if active_only:
        query = query.where(Package.is_active == True)
    
    query = query.order_by(Package.price.asc())
    
    result = await db.execute(query)
    packages = result.scalars().all()
    
    return {
        "packages": [
            {
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "call_quota": p.call_quota,
                "duration": p.duration,
                "features": json.loads(p.features) if p.features else [],
                "is_active": p.is_active,
                "created_at": p.created_at,
                "updated_at": p.updated_at,
            }
            for p in packages
        ]
    }


@router.get("/{package_id}", response_model=PackageResponse)
async def get_package(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取套餐详情"""
    result = await db.execute(
        select(Package).where(Package.id == package_id)
    )
    package = result.scalar_one_or_none()
    
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="套餐不存在"
        )
    
    response = PackageResponse.model_validate(package)
    response.features = json.loads(package.features) if package.features else []
    
    return response


@router.post("", response_model=PackageResponse)
async def create_package(
    package_data: PackageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建套餐"""
    package = Package(
        name=package_data.name,
        price=package_data.price,
        call_quota=package_data.call_quota,
        duration=package_data.duration,
        features=json.dumps(package_data.features) if package_data.features else None,
    )
    
    db.add(package)
    await db.commit()
    await db.refresh(package)
    
    response = PackageResponse.model_validate(package)
    response.features = package_data.features or []
    
    return response


@router.put("/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: str,
    package_data: PackageUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新套餐"""
    result = await db.execute(
        select(Package).where(Package.id == package_id)
    )
    package = result.scalar_one_or_none()
    
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="套餐不存在"
        )
    
    # 更新字段
    update_data = package_data.model_dump(exclude_unset=True)
    if 'features' in update_data and update_data['features'] is not None:
        update_data['features'] = json.dumps(update_data['features'])
    
    for field, value in update_data.items():
        setattr(package, field, value)
    
    await db.commit()
    await db.refresh(package)
    
    response = PackageResponse.model_validate(package)
    response.features = json.loads(package.features) if package.features else []
    
    return response


@router.delete("/{package_id}")
async def delete_package(
    package_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除套餐"""
    result = await db.execute(
        select(Package).where(Package.id == package_id)
    )
    package = result.scalar_one_or_none()
    
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="套餐不存在"
        )
    
    # 检查是否有用户在使用此套餐
    from app.models.user import FeishuUser
    user_result = await db.execute(
        select(func.count(FeishuUser.id)).where(FeishuUser.package_id == package_id)
    )
    user_count = user_result.scalar() or 0
    
    if user_count > 0:
        # 软删除：设置为不活跃
        package.is_active = False
        await db.commit()
        return {
            "success": True,
            "message": f"套餐已禁用，有 {user_count} 个用户正在使用"
        }
    
    await db.delete(package)
    await db.commit()
    
    return {"success": True, "message": "删除成功"}
