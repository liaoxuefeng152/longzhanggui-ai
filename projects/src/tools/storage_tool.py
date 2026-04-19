"""
对象存储工具
用于上传和管理文件
"""
from langchain.tools import tool
from coze_coding_utils.log.write_log import request_context
from coze_coding_utils.runtime_ctx.context import new_context
from coze_coding_dev_sdk.s3 import S3SyncStorage
import os

@tool
def upload_file_to_storage(
    file_path: str,
    folder: str = "products"
) -> str:
    """
    上传文件到对象存储

    Args:
        file_path: 本地文件路径（如 "/tmp/product_image.png"）
        folder: 存储文件夹（如 "products"、"videos"）

    Returns:
        返回文件访问URL
    """
    ctx = request_context.get() or new_context(method="upload_file_to_storage")

    # 检查文件是否存在
    if not os.path.exists(file_path):
        return f"❌ 文件不存在：{file_path}"

    try:
        storage = S3SyncStorage(
            endpoint_url=os.getenv("COZE_BUCKET_ENDPOINT_URL"),
            access_key="",
            secret_key="",
            bucket_name=os.getenv("COZE_BUCKET_NAME"),
            region="cn-beijing",
        )

        # 读取文件内容
        with open(file_path, 'rb') as f:
            file_content = f.read()

        # 上传文件
        file_key = storage.upload_file(
            file_content=file_content,
            file_name=os.path.basename(file_path),
            content_type="application/octet-stream"
        )

        # 生成访问URL
        url = storage.generate_presigned_url(
            key=file_key,
            expire_time=86400  # 24小时
        )

        return f"""✅ 文件上传成功！

**文件路径**: {file_path}
**存储位置**: {folder}/
**文件Key**: {file_key}
**访问URL**: {url}

可以直接使用该URL在商品详情页、广告素材中使用。"""
    except Exception as e:
        return f"❌ 上传出错：{str(e)}"

@tool
def generate_presigned_url(
    file_path: str,
    expire_seconds: int = 86400
) -> str:
    """
    生成文件的临时访问链接

    Args:
        file_path: 存储中的文件路径（如 "products/image_001.png"）
        expire_seconds: 链接过期时间（秒，默认24小时）

    Returns:
        返回临时访问链接
    """
    ctx = request_context.get() or new_context(method="generate_presigned_url")

    try:
        storage = S3SyncStorage(
            endpoint_url=os.getenv("COZE_BUCKET_ENDPOINT_URL"),
            access_key="",
            secret_key="",
            bucket_name=os.getenv("COZE_BUCKET_NAME"),
            region="cn-beijing",
        )

        url = storage.generate_presigned_url(
            key=file_path,
            expire_time=expire_seconds
        )

        return f"""✅ 临时链接生成成功！

**文件路径**: {file_path}
**有效时长**: {expire_seconds}秒 ({expire_seconds/3600:.1f}小时)
**访问链接**: {url}

请在该链接过期前使用。"""
    except Exception as e:
        return f"❌ 生成链接出错：{str(e)}"
