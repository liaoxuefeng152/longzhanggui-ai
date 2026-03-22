"""
数据验证工具
"""
import re
from typing import Optional, Tuple


def validate_phone(phone: str) -> Tuple[bool, Optional[str]]:
    """
    验证手机号
    
    Returns:
        (is_valid, error_message)
    """
    if not phone:
        return False, "手机号不能为空"
    
    # 去除空格和横线
    phone = phone.replace(" ", "").replace("-", "")
    
    # 中国大陆手机号
    if re.match(r'^1[3-9]\d{9}$', phone):
        return True, None
    
    # 其他国家手机号（简单验证）
    if re.match(r'^\+?\d{6,15}$', phone):
        return True, None
    
    return False, "手机号格式不正确"


def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    验证邮箱
    
    Returns:
        (is_valid, error_message)
    """
    if not email:
        return False, "邮箱不能为空"
    
    # 邮箱正则
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if re.match(pattern, email):
        return True, None
    
    return False, "邮箱格式不正确"


def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """
    验证密码
    
    规则：
    - 至少6个字符
    - 至少包含一个字母
    - 至少包含一个数字
    
    Returns:
        (is_valid, error_message)
    """
    if not password:
        return False, "密码不能为空"
    
    if len(password) < 6:
        return False, "密码长度至少6位"
    
    if len(password) > 32:
        return False, "密码长度不能超过32位"
    
    if not re.search(r'[a-zA-Z]', password):
        return False, "密码必须包含至少一个字母"
    
    if not re.search(r'\d', password):
        return False, "密码必须包含至少一个数字"
    
    return True, None


def validate_username(username: str) -> Tuple[bool, Optional[str]]:
    """
    验证用户名
    
    规则：
    - 2-20个字符
    - 只能包含字母、数字、下划线、中文
    
    Returns:
        (is_valid, error_message)
    """
    if not username:
        return False, "用户名不能为空"
    
    if len(username) < 2:
        return False, "用户名至少2个字符"
    
    if len(username) > 20:
        return False, "用户名不能超过20个字符"
    
    # 允许中文、字母、数字、下划线
    pattern = r'^[\u4e00-\u9fa5a-zA-Z0-9_]+$'
    
    if not re.match(pattern, username):
        return False, "用户名只能包含中文、字母、数字和下划线"
    
    return True, None


def sanitize_string(text: str, max_length: int = None) -> str:
    """
    清理字符串
    
    - 去除首尾空白
    - 替换多个空格为单个
    - 可选截断长度
    """
    if not text:
        return ""
    
    # 替换多个空白为单个
    text = re.sub(r'\s+', ' ', text)
    
    # 去除首尾空白
    text = text.strip()
    
    # 截断
    if max_length and len(text) > max_length:
        text = text[:max_length]
    
    return text


def validate_url(url: str) -> Tuple[bool, Optional[str]]:
    """
    验证URL
    """
    if not url:
        return False, "URL不能为空"
    
    pattern = r'^https?://[^\s<>"{}|\\^`\[\]]+$'
    
    if re.match(pattern, url):
        return True, None
    
    return False, "URL格式不正确"


def validate_positive_integer(value: int, field_name: str = "值") -> Tuple[bool, Optional[str]]:
    """
    验证正整数
    """
    if value is None:
        return False, f"{field_name}不能为空"
    
    if not isinstance(value, int):
        return False, f"{field_name}必须是整数"
    
    if value <= 0:
        return False, f"{field_name}必须大于0"
    
    return True, None


def validate_range(
    value: int, 
    min_val: int = None, 
    max_val: int = None,
    field_name: str = "值"
) -> Tuple[bool, Optional[str]]:
    """
    验证数值范围
    """
    if value is None:
        return False, f"{field_name}不能为空"
    
    if min_val is not None and value < min_val:
        return False, f"{field_name}不能小于{min_val}"
    
    if max_val is not None and value > max_val:
        return False, f"{field_name}不能大于{max_val}"
    
    return True, None


def validate_json(data: str) -> Tuple[bool, Optional[str]]:
    """
    验证JSON字符串
    """
    if not data:
        return False, "JSON数据不能为空"
    
    try:
        import json
        json.loads(data)
        return True, None
    except json.JSONDecodeError as e:
        return False, f"JSON格式错误: {str(e)}"


def validate_id_list(ids: str) -> Tuple[bool, Optional[str], list]:
    """
    验证ID列表字符串
    
    格式：1,2,3,4
    """
    if not ids:
        return False, "ID列表不能为空", []
    
    try:
        id_list = [int(id.strip()) for id in ids.split(",")]
        if any(id <= 0 for id in id_list):
            return False, "ID必须为正整数", []
        return True, None, id_list
    except ValueError:
        return False, "ID格式不正确", []


def contains_sensitive_words(text: str, words: list = None) -> Tuple[bool, Optional[str]]:
    """
    检查是否包含敏感词
    
    Args:
        text: 要检查的文本
        words: 敏感词列表
    
    Returns:
        (contains, matched_word)
    """
    if not text:
        return False, None
    
    # 默认敏感词
    default_words = ["admin", "root", "system", "管理员", "系统"]
    sensitive_words = words or default_words
    
    text_lower = text.lower()
    for word in sensitive_words:
        if word.lower() in text_lower:
            return True, word
    
    return False, None
