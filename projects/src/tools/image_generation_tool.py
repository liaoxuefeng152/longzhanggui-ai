"""
跨境电商图片生成工具
用于生成商品图片、白底图、优化图片等
"""
from langchain.tools import tool
from coze_coding_utils.log.write_log import request_context
from coze_coding_utils.runtime_ctx.context import new_context
from coze_coding_dev_sdk import ImageGenerationClient

@tool
def generate_product_image(
    product_name: str,
    style: str = "专业产品展示",
    background: str = "白色",
    size: str = "1024x1024"
) -> str:
    """
    生成商品展示图片

    Args:
        product_name: 商品名称/描述
        style: 图片风格（如"专业产品展示"、"简约风格"、"高端质感"等）
        background: 背景颜色（如"白色"、"透明"、"浅灰色"等）
        size: 图片尺寸（1024x1024, 1536x1024, 1024x1536等）

    Returns:
        返回生成的图片URL
    """
    ctx = request_context.get() or new_context(method="generate_product_image")

    # 构建提示词
    prompt = f"""
    专业的{product_name}商品展示图
    风格：{style}
    背景：{background}
    要求：高清、专业、细节清晰、光影自然、适合电商平台展示
    """

    client = ImageGenerationClient(ctx=ctx)
    result = client.generate(
        prompt=prompt.strip(),
        size=size,
        watermark=False
    )

    if result and result.success:
        return f"✅ 商品图片生成成功！\n\n**图片链接**: {result.image_urls[0]}\n\n可以直接用于Shopee、Lazada、TikTok Shop等平台商品主图。"
    else:
        return "❌ 图片生成失败，请稍后重试"

@tool
def generate_product_lifestyle_image(
    product_name: str,
    usage_scene: str = "日常生活场景",
    platform: str = "shopee"
) -> str:
    """
    生成商品生活场景图

    Args:
        product_name: 商品名称
        usage_scene: 使用场景（如"办公环境"、"户外运动"、"家庭生活"等）
        platform: 目标平台（shopee/lazada/tiktok/amazon）

    Returns:
        返回生成的场景图URL
    """
    ctx = request_context.get() or new_context(method="generate_product_lifestyle_image")

    # 根据平台确定图片尺寸
    platform_sizes = {
        "shopee": "1024x1024",
        "lazada": "1024x1024",
        "tiktok": "1080x1920",
        "amazon": "1000x1000"
    }
    size = platform_sizes.get(platform.lower(), "1024x1024")

    prompt = f"""
    {product_name}在{usage_scene}中的自然使用场景
    要求：
    - 生活化、真实感强
    - 画面清晰、构图专业
    - 突出产品特点和功能
    - 光线自然、色彩饱满
    - 适合{platform.upper()}平台商品展示
    """

    client = ImageGenerationClient(ctx=ctx)
    result = client.generate(
        prompt=prompt.strip(),
        size=size,
        watermark=False
    )

    if result and result.success:
        return f"✅ 生活场景图生成成功！\n\n**图片链接**: {result.image_urls[0]}\n\n适合用作商品详情页或轮播图。"
    else:
        return "❌ 图片生成失败，请稍后重试"

@tool
def generate_product_infographic(
    product_features: str,
    platform: str = "shopee"
) -> str:
    """
    生成商品特性信息图（海报）

    Args:
        product_features: 商品特性列表（用逗号分隔）
        platform: 目标平台

    Returns:
        返回生成的信息图URL
    """
    ctx = request_context.get() or new_context(method="generate_product_infographic")

    platform_sizes = {
        "shopee": "1536x1024",
        "lazada": "1536x1024",
        "tiktok": "1080x1920",
        "amazon": "1500x500"
    }
    size = platform_sizes.get(platform.lower(), "1536x1024")

    prompt = f"""
    专业的商品特性信息图（海报设计）
    产品特性：{product_features}
    要求：
    - 设计专业、布局清晰
    - 图文结合、重点突出
    - 色彩搭配和谐、符合{platform.upper()}平台风格
    - 包含产品卖点、优势说明
    - 适合用作商品详情页宣传图
    """

    client = ImageGenerationClient(ctx=ctx)
    result = client.generate(
        prompt=prompt.strip(),
        size=size,
        watermark=False
    )

    if result and result.success:
        return f"✅ 商品信息图生成成功！\n\n**图片链接**: {result.image_urls[0]}\n\n适合用作商品详情页特性展示或营销海报。"
    else:
        return "❌ 图片生成失败，请稍后重试"
