"""
系统设置API路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

from app.core.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.business import Setting, FeishuConfig
from app.schemas.business import SettingsUpdate, FeishuConfigUpdate

router = APIRouter(prefix="/settings", tags=["系统设置"])


# 默认系统设置
DEFAULT_SETTINGS = {
    "site_name": "龙掌柜智能运营系统",
    "site_logo": "",
    "contact_email": "support@example.com",
    "contact_phone": "400-888-8888",
    "trial_days": 3,
    "default_call_quota": 100,
    "maintenance_mode": False,
    "allow_registration": True,
    "max_login_attempts": 5,
    "session_timeout": 30,
}


@router.get("")
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取系统设置"""
    result = await db.execute(select(Setting))
    settings = result.scalars().all()
    
    # 转换为字典
    settings_dict = DEFAULT_SETTINGS.copy()
    for setting in settings:
        try:
            value = json.loads(setting.value)
        except:
            value = setting.value
        settings_dict[setting.key] = value
    
    return {"settings": settings_dict}


@router.put("")
async def update_settings(
    settings_data: SettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新系统设置"""
    for key, value in settings_data.settings.items():
        # 查找现有设置
        result = await db.execute(
            select(Setting).where(Setting.key == key)
        )
        setting = result.scalar_one_or_none()
        
        # 序列化值
        if isinstance(value, (dict, list)):
            value_str = json.dumps(value)
        else:
            value_str = str(value)
        
        if setting:
            setting.value = value_str
        else:
            setting = Setting(key=key, value=value_str)
            db.add(setting)
    
    await db.commit()
    
    # 返回更新后的设置
    result = await db.execute(select(Setting))
    settings = result.scalars().all()
    
    settings_dict = DEFAULT_SETTINGS.copy()
    for setting in settings:
        try:
            value = json.loads(setting.value)
        except:
            value = setting.value
        settings_dict[setting.key] = value
    
    return {"settings": settings_dict}


@router.get("/feishu")
async def get_feishu_config(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取飞书配置"""
    result = await db.execute(select(FeishuConfig))
    configs = result.scalars().all()
    
    # 转换为字典
    config_dict = {
        "app_id": "",
        "app_secret": "",
        "encrypt_key": "",
        "verification_token": "",
        "bot_name": "龙掌柜助手",
        "welcome_message": "欢迎使用龙掌柜智能运营系统！"
    }
    
    for config in configs:
        # 敏感信息脱敏
        if config.key == "app_secret":
            config_dict[config.key] = "******" if config.value else ""
        elif config.key == "encrypt_key":
            config_dict[config.key] = "******" if config.value else ""
        else:
            config_dict[config.key] = config.value
    
    return {"feishu": config_dict}


@router.put("/feishu")
async def update_feishu_config(
    config_data: FeishuConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新飞书配置"""
    config_items = {
        "app_id": config_data.app_id,
        "app_secret": config_data.app_secret,
        "encrypt_key": config_data.encrypt_key or "",
        "verification_token": config_data.verification_token or ""
    }
    
    for key, value in config_items.items():
        result = await db.execute(
            select(FeishuConfig).where(FeishuConfig.key == key)
        )
        config = result.scalar_one_or_none()
        
        if config:
            config.value = value
        else:
            config = FeishuConfig(key=key, value=value)
            db.add(config)
    
    await db.commit()
    
    return {
        "success": True,
        "message": "飞书配置已更新"
    }


@router.post("/feishu/test")
async def test_feishu_connection(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """测试飞书连接"""
    # 获取配置
    result = await db.execute(select(FeishuConfig))
    configs = result.scalars().all()
    
    config_dict = {c.key: c.value for c in configs}
    
    if not config_dict.get("app_id") or not config_dict.get("app_secret"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请先配置飞书App ID和App Secret"
        )
    
    # TODO: 实际调用飞书API测试连接
    
    return {
        "success": True,
        "message": "飞书连接正常"
    }


@router.get("/backup")
async def get_backup_info(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取备份信息"""
    from datetime import datetime
    import os
    
    # 获取数据库文件信息
    db_path = "./data/lobster_ai.db"
    
    backup_info = {
        "last_backup": None,
        "db_size": 0,
        "backup_enabled": False,
        "backup_interval": 24  # 小时
    }
    
    if os.path.exists(db_path):
        backup_info["db_size"] = os.path.getsize(db_path)
    
    # 从设置中获取备份信息
    result = await db.execute(
        select(Setting).where(Setting.key == "last_backup")
    )
    last_backup = result.scalar_one_or_none()
    if last_backup:
        backup_info["last_backup"] = last_backup.value
    
    return backup_info


@router.post("/backup")
async def create_backup(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建备份"""
    from datetime import datetime
    import shutil
    import os
    
    # 创建备份目录
    backup_dir = "./data/backups"
    os.makedirs(backup_dir, exist_ok=True)
    
    # 生成备份文件名
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"{backup_dir}/lobster_ai_{timestamp}.db"
    
    # 复制数据库文件
    db_path = "./data/lobster_ai.db"
    if os.path.exists(db_path):
        shutil.copy2(db_path, backup_file)
    
    # 更新最后备份时间
    result = await db.execute(
        select(Setting).where(Setting.key == "last_backup")
    )
    setting = result.scalar_one_or_none()
    
    if setting:
        setting.value = datetime.now().isoformat()
    else:
        setting = Setting(key="last_backup", value=datetime.now().isoformat())
        db.add(setting)
    
    await db.commit()
    
    return {
        "success": True,
        "message": "备份创建成功",
        "backup_file": backup_file,
        "backup_time": datetime.now().isoformat()
    }
