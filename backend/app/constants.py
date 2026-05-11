"""
常量定义
"""
from enum import Enum


# 用户角色
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


# 用户状态
class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BANNED = "banned"


# 智能体状态
class AgentStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"


# 任务状态
class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    STOPPED = "stopped"


# 平台类型
class PlatformType(str, Enum):
    TIKTOK = "tiktok"
    SHOPEE = "shopee"
    LAZADA = "lazada"
    AMAZON = "amazon"
    ALIEXPRESS = "aliexpress"


# 订单状态
class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


# 工单状态
class TicketStatus(str, Enum):
    OPEN = "open"
    PROCESSING = "processing"
    RESOLVED = "resolved"
    CLOSED = "closed"


# 工单优先级
class TicketPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


# AI模型类型
class ModelType(str, Enum):
    CHAT = "chat"
    EMBEDDING = "embedding"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


# AI模型提供商
class ModelProvider(str, Enum):
    OPENAI = "openai"
    DOUBAO = "doubao"
    DEEPSEEK = "deepseek"
    KIMI = "kimi"


# 智能体类型
class AgentType(str, Enum):
    PRODUCT_SELECTION = "product-selection"
    IMAGE_DESIGN = "image-design"
    VIDEO_GENERATION = "video-generation"
    LISTING_OPTIMIZATION = "listing-optimization"
    ADVERTISING = "advertising"
    CUSTOMER_SERVICE = "customer-service"
    DATA_REVIEW = "data-review"


# 语言代码
class LanguageCode(str, Enum):
    ZH = "zh"       # 中文
    EN = "en"       # 英文
    ID = "id"       # 印尼语
    TH = "th"       # 泰语
    VI = "vi"       # 越南语
    MS = "ms"       # 马来语
    PT = "pt"       # 葡萄牙语
    ES = "es"       # 西班牙语


# 错误码
class ErrorCode(str, Enum):
    # 通用错误
    INTERNAL_ERROR = "ERR_INTERNAL"
    NOT_FOUND = "ERR_NOT_FOUND"
    BAD_REQUEST = "ERR_BAD_REQUEST"
    
    # 认证错误
    UNAUTHORIZED = "ERR_UNAUTHORIZED"
    FORBIDDEN = "ERR_FORBIDDEN"
    TOKEN_EXPIRED = "ERR_TOKEN_EXPIRED"
    TOKEN_INVALID = "ERR_TOKEN_INVALID"
    
    # 业务错误
    USER_NOT_FOUND = "ERR_USER_NOT_FOUND"
    USER_EXISTS = "ERR_USER_EXISTS"
    PASSWORD_ERROR = "ERR_PASSWORD_ERROR"
    QUOTA_EXCEEDED = "ERR_QUOTA_EXCEEDED"
    
    # 智能体错误
    AGENT_NOT_FOUND = "ERR_AGENT_NOT_FOUND"
    AGENT_INACTIVE = "ERR_AGENT_INACTIVE"
    TASK_FAILED = "ERR_TASK_FAILED"
    
    # 限流错误
    RATE_LIMIT = "ERR_RATE_LIMIT"


# 配置常量
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
DEFAULT_TOKEN_EXPIRE = 7 * 24 * 60 * 60  # 7天（秒）

# 文件上传限制
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
ALLOWED_DOCUMENT_TYPES = ["application/pdf", "application/msword", "text/plain"]

# 缓存过期时间（秒）
CACHE_EXPIRE_SHORT = 60          # 1分钟
CACHE_EXPIRE_MEDIUM = 300        # 5分钟
CACHE_EXPIRE_LONG = 3600         # 1小时
CACHE_EXPIRE_DAY = 86400         # 1天
