"""
跨境电商视频生成工具
用于生成商品展示视频
"""
from langchain.tools import tool
from coze_coding_utils.log.write_log import request_context
from coze_coding_utils.runtime_ctx.context import new_context
from coze_coding_dev_sdk.video import VideoGenerationClient, TextContent

@tool
def generate_product_video(
    product_name: str,
    features: str = "",
    duration: int = 10,
    platform: str = "shopee"
) -> str:
    """
    生成商品展示视频

    Args:
        product_name: 商品名称
        features: 商品特性描述（可选）
        duration: 视频时长（秒，建议5-15秒）
        platform: 目标平台（shopee/lazada/tiktok/amazon）

    Returns:
        返回生成的视频URL
    """
    ctx = request_context.get() or new_context(method="generate_product_video")

    # 根据平台确定视频尺寸
    platform_specs = {
        "shopee": {"resolution": "720p", "aspect_ratio": "1:1"},
        "lazada": {"resolution": "720p", "aspect_ratio": "1:1"},
        "tiktok": {"resolution": "720p", "aspect_ratio": "9:16"},
        "amazon": {"resolution": "1080p", "aspect_ratio": "16:9"}
    }

    spec = platform_specs.get(platform.lower(), platform_specs["shopee"])

    prompt = f"""
    {product_name}商品展示视频

    视频要求：
    - 时长：{duration}秒
    - 分辨率：{spec['resolution']}
    - 比例：{spec['aspect_ratio']}
    - 风格：专业、吸引人、适合{platform.upper()}平台
    - 内容：展示产品特点、使用场景、功能优势
    {f"- 突出特性：{features}" if features else ""}

    节奏：流畅、有吸引力、自动配乐
    """

    client = VideoGenerationClient(ctx=ctx)
    video_url, response, _ = client.video_generation(
        content_items=[TextContent(text=prompt.strip())],
        model="doubao-seedance-1-5-pro-251215",
        resolution=spec['resolution'],
        ratio=spec['aspect_ratio'],
        duration=duration,
        watermark=False
    )

    if video_url:
        return f"""✅ 商品视频生成成功！

**视频链接**: {video_url}

**视频信息**:
- 时长: {duration}秒
- 分辨率: {spec['resolution']}
- 比例: {spec['aspect_ratio']}
- 平台: {platform.upper()}

适合用作商品主图视频或营销推广视频。"""
    else:
        return "❌ 视频生成失败，请稍后重试"

@tool
def generate_product_intro_video(
    product_name: str,
    selling_points: str,
    duration: int = 15,
    language: str = "chinese"
) -> str:
    """
    生成商品介绍视频（带字幕和解说）

    Args:
        product_name: 商品名称
        selling_points: 卖点描述（用逗号分隔）
        duration: 视频时长（秒）
        language: 视频语言（chinese/english/indonesian/thai/vietnamese/malay）

    Returns:
        返回生成的视频URL
    """
    ctx = request_context.get() or new_context(method="generate_product_intro_video")

    language_map = {
        "chinese": "中文",
        "english": "英语",
        "indonesian": "印尼语",
        "thai": "泰语",
        "vietnamese": "越南语",
        "malay": "马来语"
    }

    lang = language_map.get(language.lower(), "中文")

    prompt = f"""
    {product_name}产品介绍视频

    核心卖点：
    {selling_points}

    视频要求：
    - 时长：{duration}秒
    - 尺寸：1080x1920（适合TikTok/短视频平台）
    - 语言：{lang}
    - 带字幕和自动解说
    - 节奏紧凑、吸引眼球
    - 展示产品细节和使用场景

    目标：快速传达产品价值和购买理由
    """

    client = VideoGenerationClient(ctx=ctx)
    video_url, response, _ = client.video_generation(
        content_items=[TextContent(text=prompt.strip())],
        model="doubao-seedance-1-5-pro-251215",
        resolution="720p",
        ratio="9:16",
        duration=duration,
        watermark=False
    )

    if video_url:
        return f"""✅ 产品介绍视频生成成功！

**视频链接**: {video_url}

**视频信息**:
- 时长: {duration}秒
- 语言: {lang}
- 带字幕和解说

适合用作产品推广、社交媒体营销视频。"""
    else:
        return "❌ 视频生成失败，请稍后重试"
