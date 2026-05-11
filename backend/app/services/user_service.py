"""
用户服务层
"""
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta

from app.models.user import User, FeishuUser, Package
from app.schemas.user import (
    UserCreate, UserResponse, FeishuUserCreate, 
    FeishuUserUpdate, PackageCreate, PackageUpdate
)
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from loguru import logger


class UserService:
    """用户服务"""
    
    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        """创建用户"""
        # 检查手机号是否已存在
        result = await db.execute(
            select(User).where(User.phone == user_data.phone)
        )
        if result.scalar_one_or_none():
            raise ValueError("手机号已被注册")
        
        # 创建用户
        user = User(
            phone=user_data.phone,
            password_hash=get_password_hash(user_data.password),
            nickname=user_data.nickname or user_data.phone,
            role="user",
            status="active",
            call_quota=100,  # 默认赠送100次调用
            quota_expire=datetime.now() + timedelta(days=7)
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        logger.info(f"创建新用户: {user.phone}")
        return user
    
    @staticmethod
    async def authenticate(db: AsyncSession, phone: str, password: str) -> Optional[User]:
        """用户认证"""
        result = await db.execute(
            select(User).where(User.phone == phone)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
        
        if user.status != "active":
            raise ValueError("账户已被禁用")
        
        # 更新最后登录时间
        user.last_login = datetime.now()
        await db.commit()
        
        return user
    
    @staticmethod
    async def login(db: AsyncSession, phone: str, password: str) -> dict:
        """用户登录"""
        user = await UserService.authenticate(db, phone, password)
        
        if not user:
            raise ValueError("手机号或密码错误")
        
        # 生成Token
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse.model_validate(user)
        }
    
    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_user_by_phone(db: AsyncSession, phone: str) -> Optional[User]:
        """根据手机号获取用户"""
        result = await db.execute(
            select(User).where(User.phone == phone)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_user_quota(db: AsyncSession, user_id: int, delta: int) -> bool:
        """更新用户调用额度
        
        Args:
            user_id: 用户ID
            delta: 变化量，正数增加，负数减少
        """
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return False
        
        user.call_quota = max(0, user.call_quota + delta)
        await db.commit()
        return True
    
    @staticmethod
    async def consume_quota(db: AsyncSession, user_id: int, count: int = 1) -> bool:
        """消费调用额度"""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            return False
        
        # 检查额度是否过期
        if user.quota_expire and user.quota_expire < datetime.now():
            raise ValueError("额度已过期")
        
        # 检查额度是否足够
        if user.call_quota < count:
            raise ValueError("调用额度不足")
        
        user.call_quota -= count
        await db.commit()
        return True
    
    @staticmethod
    async def list_users(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        role: str = None,
        status: str = None
    ) -> tuple[List[User], int]:
        """获取用户列表"""
        # 构建查询条件
        conditions = []
        if role:
            conditions.append(User.role == role)
        if status:
            conditions.append(User.status == status)
        
        # 查询总数
        count_query = select(User)
        if conditions:
            count_query = count_query.where(and_(*conditions))
        count_result = await db.execute(count_query)
        total = len(count_result.scalars().all())
        
        # 分页查询
        query = select(User)
        if conditions:
            query = query.where(and_(*conditions))
        query = query.offset((page - 1) * page_size).limit(page_size)
        query = query.order_by(User.created_at.desc())
        
        result = await db.execute(query)
        users = result.scalars().all()
        
        return list(users), total


class FeishuUserService:
    """飞书用户服务"""
    
    @staticmethod
    async def create_or_update(
        db: AsyncSession,
        user_data: FeishuUserCreate
    ) -> FeishuUser:
        """创建或更新飞书用户"""
        result = await db.execute(
            select(FeishuUser).where(
                FeishuUser.feishu_user_id == user_data.feishu_user_id
            )
        )
        feishu_user = result.scalar_one_or_none()
        
        if feishu_user:
            # 更新
            for key, value in user_data.model_dump(exclude_unset=True).items():
                setattr(feishu_user, key, value)
        else:
            # 创建
            feishu_user = FeishuUser(**user_data.model_dump())
            db.add(feishu_user)
        
        await db.commit()
        await db.refresh(feishu_user)
        return feishu_user
    
    @staticmethod
    async def bind_main_user(
        db: AsyncSession,
        feishu_user_id: str,
        main_user_id: int
    ) -> bool:
        """绑定主账户"""
        result = await db.execute(
            select(FeishuUser).where(
                FeishuUser.feishu_user_id == feishu_user_id
            )
        )
        feishu_user = result.scalar_one_or_none()
        
        if not feishu_user:
            return False
        
        feishu_user.main_user_id = main_user_id
        await db.commit()
        return True
    
    @staticmethod
    async def list_feishu_users(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        department_id: str = None
    ) -> tuple[List[FeishuUser], int]:
        """获取飞书用户列表"""
        conditions = []
        if department_id:
            conditions.append(FeishuUser.department_id == department_id)
        
        # 查询总数
        count_query = select(FeishuUser)
        if conditions:
            count_query = count_query.where(and_(*conditions))
        count_result = await db.execute(count_query)
        total = len(count_result.scalars().all())
        
        # 分页查询
        query = select(FeishuUser)
        if conditions:
            query = query.where(and_(*conditions))
        query = query.offset((page - 1) * page_size).limit(page_size)
        query = query.order_by(FeishuUser.created_at.desc())
        
        result = await db.execute(query)
        users = result.scalars().all()
        
        return list(users), total


class PackageService:
    """套餐服务"""
    
    @staticmethod
    async def create_package(db: AsyncSession, data: PackageCreate) -> Package:
        """创建套餐"""
        package = Package(**data.model_dump())
        db.add(package)
        await db.commit()
        await db.refresh(package)
        return package
    
    @staticmethod
    async def update_package(
        db: AsyncSession,
        package_id: int,
        data: PackageUpdate
    ) -> Optional[Package]:
        """更新套餐"""
        result = await db.execute(
            select(Package).where(Package.id == package_id)
        )
        package = result.scalar_one_or_none()
        
        if not package:
            return None
        
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(package, key, value)
        
        await db.commit()
        await db.refresh(package)
        return package
    
    @staticmethod
    async def list_packages(db: AsyncSession, active_only: bool = True) -> List[Package]:
        """获取套餐列表"""
        query = select(Package)
        if active_only:
            query = query.where(Package.status == "active")
        query = query.order_by(Package.price)
        
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def purchase_package(
        db: AsyncSession,
        user_id: int,
        package_id: int
    ) -> User:
        """购买套餐"""
        # 获取用户和套餐
        user_result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = user_result.scalar_one_or_none()
        
        package_result = await db.execute(
            select(Package).where(Package.id == package_id)
        )
        package = package_result.scalar_one_or_none()
        
        if not user or not package:
            raise ValueError("用户或套餐不存在")
        
        # 增加额度
        user.call_quota += package.call_quota
        user.quota_expire = datetime.now() + timedelta(days=package.duration)
        
        await db.commit()
        await db.refresh(user)
        
        logger.info(f"用户 {user_id} 购买套餐 {package_id}")
        return user
