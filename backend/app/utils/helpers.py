"""
通用辅助函数
"""
from typing import Any, Dict, List, Optional
from datetime import datetime
import uuid
import re


def generate_uuid() -> str:
    """生成UUID"""
    return str(uuid.uuid4())


def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M:%S") -> str:
    """格式化日期时间"""
    if not dt:
        return ""
    return dt.strftime(fmt)


def format_duration(seconds: int) -> str:
    """格式化时长"""
    if seconds < 60:
        return f"{seconds}秒"
    elif seconds < 3600:
        minutes = seconds // 60
        secs = seconds % 60
        return f"{minutes}分{secs}秒"
    else:
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        return f"{hours}小时{minutes}分"


def mask_phone(phone: str) -> str:
    """脱敏手机号"""
    if not phone or len(phone) < 7:
        return phone
    return f"{phone[:3]}****{phone[-4:]}"


def mask_email(email: str) -> str:
    """脱敏邮箱"""
    if not email or "@" not in email:
        return email
    parts = email.split("@")
    name = parts[0]
    domain = parts[1]
    if len(name) <= 2:
        return f"{name[0]}***@{domain}"
    return f"{name[:2]}***@{domain}"


def calculate_pagination(total: int, page: int, page_size: int) -> Dict[str, Any]:
    """计算分页信息"""
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 0
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1
    }


def build_response(
    success: bool = True,
    message: str = "",
    data: Any = None,
    code: int = 200
) -> Dict[str, Any]:
    """构建统一响应"""
    return {
        "success": success,
        "message": message,
        "data": data,
        "code": code
    }


def build_list_response(
    items: List[Any],
    total: int,
    page: int = 1,
    page_size: int = 20,
    message: str = ""
) -> Dict[str, Any]:
    """构建列表响应"""
    pagination = calculate_pagination(total, page, page_size)
    return {
        "success": True,
        "message": message,
        "data": {
            "items": items,
            "pagination": pagination
        }
    }


def deep_merge(dict1: Dict, dict2: Dict) -> Dict:
    """深度合并字典"""
    result = dict1.copy()
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result


def flatten_dict(d: Dict, parent_key: str = '', sep: str = '.') -> Dict:
    """扁平化字典"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep).items())
        else:
            items.append((new_key, v))
    return dict(items)


def extract_numbers(text: str) -> List[str]:
    """提取文本中的数字"""
    return re.findall(r'\d+\.?\d*', text)


def extract_urls(text: str) -> List[str]:
    """提取文本中的URL"""
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    return re.findall(url_pattern, text)


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """截断文本"""
    if not text or len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def clean_text(text: str) -> str:
    """清理文本（去除多余空白）"""
    if not text:
        return ""
    # 去除多余空白
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def is_valid_json(text: str) -> bool:
    """检查是否为有效JSON"""
    try:
        import json
        json.loads(text)
        return True
    except:
        return False


def safe_json_loads(text: str, default: Any = None) -> Any:
    """安全的JSON解析"""
    try:
        import json
        return json.loads(text)
    except:
        return default


def get_client_ip(request) -> str:
    """获取客户端IP"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def build_cache_key(*args, prefix: str = "") -> str:
    """构建缓存键"""
    parts = [str(arg) for arg in args if arg is not None]
    key = ":".join(parts)
    return f"{prefix}:{key}" if prefix else key
