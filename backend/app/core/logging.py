"""
日志配置
"""
import sys
from loguru import logger
from app.core.config import settings


def setup_logging():
    """配置日志"""
    
    # 移除默认处理器
    logger.remove()
    
    # 控制台输出
    logger.add(
        sys.stdout,
        level="DEBUG" if settings.DEBUG else "INFO",
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
               "<level>{level: <8}</level> | "
               "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
               "<level>{message}</level>",
        colorize=True
    )
    
    # 文件输出 - 所有日志
    logger.add(
        "logs/app.log",
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation="10 MB",
        retention="7 days",
        compression="zip",
        enqueue=True
    )
    
    # 文件输出 - 错误日志
    logger.add(
        "logs/error.log",
        level="ERROR",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        rotation="10 MB",
        retention="30 days",
        compression="zip",
        enqueue=True
    )
    
    # 文件输出 - 访问日志
    logger.add(
        "logs/access.log",
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {message}",
        filter=lambda record: record["extra"].get("type") == "access",
        rotation="10 MB",
        retention="7 days",
        compression="zip",
        enqueue=True
    )
    
    logger.info("日志系统初始化完成")
    return logger


# 请求日志装饰器
def log_request(request_id: str, method: str, path: str, **kwargs):
    """记录请求日志"""
    logger.bind(type="access").info(
        f"REQUEST | {request_id} | {method} {path} | {kwargs}"
    )


def log_response(request_id: str, status_code: int, duration: float, **kwargs):
    """记录响应日志"""
    logger.bind(type="access").info(
        f"RESPONSE | {request_id} | {status_code} | {duration:.3f}s | {kwargs}"
    )


def log_error(request_id: str, error: Exception, **kwargs):
    """记录错误日志"""
    logger.error(
        f"ERROR | {request_id} | {type(error).__name__}: {str(error)} | {kwargs}"
    )
