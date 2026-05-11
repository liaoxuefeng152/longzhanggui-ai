"""
商品库API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
from decimal import Decimal
import json

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.business import Product
from app.schemas.business import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    ProductBatchImport, ProductBatchImportResponse
)

router = APIRouter(prefix="/products", tags=["商品库"])


@router.get("", response_model=ProductListResponse)
async def get_products(
    keyword: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取商品列表"""
    query = select(Product)
    count_query = select(func.count(Product.id))
    
    # 关键词搜索
    if keyword:
        query = query.where(
            or_(
                Product.name.contains(keyword),
                Product.sku.contains(keyword)
            )
        )
        count_query = count_query.where(
            or_(
                Product.name.contains(keyword),
                Product.sku.contains(keyword)
            )
        )
    
    # 分类过滤
    if category:
        query = query.where(Product.category == category)
        count_query = count_query.where(Product.category == category)
    
    # 状态过滤
    if status:
        query = query.where(Product.status == status)
        count_query = count_query.where(Product.status == status)
    
    # 用户过滤
    if user_id:
        query = query.where(Product.user_id == user_id)
        count_query = count_query.where(Product.user_id == user_id)
    
    # 获取总数
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Product.created_at.desc())
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return ProductListResponse(
        items=[
            {
                **ProductResponse.model_validate(p).model_dump(),
                "images": json.loads(p.images) if p.images else [],
                "price": float(p.price) if p.price else 0
            }
            for p in products
        ],
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """添加商品"""
    product = Product(
        user_id=current_user.id,
        name=product_data.name,
        sku=product_data.sku,
        category=product_data.category,
        price=product_data.price,
        stock=product_data.stock,
        images=json.dumps(product_data.images) if product_data.images else None,
        description=product_data.description,
    )
    
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    response = ProductResponse.model_validate(product)
    response.images = product_data.images or []
    response.price = float(product.price) if product.price else 0
    
    return response


@router.get("/{product_id}")
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取商品详情"""
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    return {
        **ProductResponse.model_validate(product).model_dump(),
        "images": json.loads(product.images) if product.images else [],
        "price": float(product.price) if product.price else 0
    }


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新商品信息"""
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    # 更新字段
    update_data = product_data.model_dump(exclude_unset=True)
    
    if 'images' in update_data and update_data['images'] is not None:
        update_data['images'] = json.dumps(update_data['images'])
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    return {
        **ProductResponse.model_validate(product).model_dump(),
        "images": json.loads(product.images) if product.images else [],
        "price": float(product.price) if product.price else 0
    }


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除商品"""
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商品不存在"
        )
    
    await db.delete(product)
    await db.commit()
    
    return {"success": True, "message": "删除成功"}


@router.post("/batch", response_model=ProductBatchImportResponse)
async def batch_import_products(
    import_data: ProductBatchImport,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """批量导入商品"""
    success_count = 0
    failed_count = 0
    errors = []
    
    for idx, product_data in enumerate(import_data.products):
        try:
            product = Product(
                user_id=current_user.id,
                name=product_data.name,
                sku=product_data.sku,
                category=product_data.category,
                price=product_data.price,
                stock=product_data.stock,
                images=json.dumps(product_data.images) if product_data.images else None,
                description=product_data.description,
            )
            db.add(product)
            success_count += 1
        except Exception as e:
            failed_count += 1
            errors.append({
                "row": idx + 1,
                "name": product_data.name,
                "error": str(e)
            })
    
    await db.commit()
    
    return ProductBatchImportResponse(
        success=success_count,
        failed=failed_count,
        errors=errors
    )


@router.get("/categories/list")
async def get_product_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取商品分类列表"""
    result = await db.execute(
        select(Product.category, func.count(Product.id).label('count'))
        .where(Product.category.isnot(None))
        .group_by(Product.category)
        .order_by(func.count(Product.id).desc())
    )
    
    categories = [
        {"name": row[0], "count": row[1]}
        for row in result.all()
    ]
    
    return {"categories": categories}
