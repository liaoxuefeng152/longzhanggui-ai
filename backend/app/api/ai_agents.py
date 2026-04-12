"""
AI智能体API路由
包含选品、图片处理、Listing优化、智能定价、广告、客服、数据复盘、视频生成
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.services.image_agent_service import image_agent, ImageProcessMode
from app.services.ai_agents_service import (
    product_selection_agent,
    listing_optimization_agent,
    pricing_tool,
    advertising_agent,
    customer_service_agent,
    data_review_agent
)
from app.services.video_agent_service import video_generation_agent
from loguru import logger


# 图片生成客户端（延迟导入，避免循环依赖）
_image_gen_client = None

def get_image_gen_client():
    """获取图片生成客户端"""
    global _image_gen_client
    if _image_gen_client is None:
        from coze_coding_dev_sdk import ImageGenerationClient
        from coze_coding_utils.runtime_ctx.context import new_context
        ctx = new_context(method="generate")
        _image_gen_client = ImageGenerationClient(ctx=ctx)
    return _image_gen_client


router = APIRouter(prefix="/ai", tags=["AI智能体"])


# ============ 请求模型 ============

class SelectProductsRequest(BaseModel):
    """选品请求"""
    platform: str = "tiktok"
    site: str = "id"
    category: Optional[str] = None
    count: int = 5
    min_profit_rate: float = 0.3


class ProcessImageRequest(BaseModel):
    """图片处理请求"""
    image_url: str
    mode: str = "translate"
    source_language: str = "zh"
    target_language: str = "en"
    options: Optional[Dict[str, Any]] = None


class BatchProcessImageRequest(BaseModel):
    """批量图片处理请求"""
    image_urls: List[str]
    mode: str = "translate"
    source_language: str = "zh"
    target_language: str = "en"


class GenerateImageRequest(BaseModel):
    """图片生成请求"""
    prompt: str
    size: str = "2K"
    image: Optional[str] = None  # 参考图片URL（可选，用于图生图）
    watermark: bool = True
    style: Optional[str] = None  # 风格描述


class GenerateVideoRequest(BaseModel):
    """视频生成请求"""
    prompt: str  # 视频描述
    image_url: Optional[str] = None  # 参考图片URL（图生视频）
    resolution: str = "720p"  # 分辨率: 480p, 720p, 1080p
    ratio: str = "16:9"  # 宽高比: 16:9, 9:16, 1:1, 4:3, 3:4, 21:9
    duration: int = 5  # 时长: 5-12秒
    watermark: bool = False
    generate_audio: bool = True


class CreateAdRequest(BaseModel):
    """创建广告请求"""
    product_id: str
    product_name: Optional[str] = None  # 新增：商品名称
    platform: str = "tiktok"
    daily_budget: float = 100
    target_acos: float = 0.20
    keywords: Optional[List[str]] = None
    category: Optional[str] = None  # 新增：商品类目


class OptimizeListingRequest(BaseModel):
    """Listing优化请求"""
    product_info: Dict[str, Any]
    platform: str = "tiktok"
    language: str = "en"
    keywords: Optional[List[str]] = None


class CalculatePriceRequest(BaseModel):
    """定价计算请求"""
    cost_price: float
    domestic_shipping: float = 0
    first_mile_shipping: float = 0
    platform_commission_rate: float = 0.05
    ad_cost_rate: float = 0.10
    target_profit_rate: float = 0.30
    competitor_prices: Optional[List[float]] = None


class CreateAdRequest(BaseModel):
    """创建广告请求"""
    product_id: str
    product_name: Optional[str] = None  # 新增：商品名称
    platform: str = "tiktok"
    daily_budget: float = 100
    target_acos: float = 0.20
    keywords: Optional[List[str]] = None
    category: Optional[str] = None  # 新增：商品类目


class CustomerReplyRequest(BaseModel):
    """客服回复请求"""
    message: str
    language: str = "en"
    context: Optional[Dict[str, Any]] = None


class DataReportRequest(BaseModel):
    """数据报告请求"""
    start_date: str
    end_date: str
    platform: Optional[str] = None


# ============ 选品智能体 ============

@router.post("/select-products")
async def select_products(request: SelectProductsRequest):
    """AI选品"""
    try:
        result = await product_selection_agent.select_products(
            platform=request.platform,
            site=request.site,
            category=request.category,
            count=request.count,
            min_profit_rate=request.min_profit_rate
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"选品失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-competition")
async def analyze_competition(product_name: str, platform: str = "tiktok"):
    """竞品分析"""
    try:
        result = await product_selection_agent.analyze_competition(
            product_name=product_name,
            platform=platform
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"竞品分析失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ 图片智能体 ============

@router.post("/process-image")
async def process_image(request: ProcessImageRequest):
    """处理图片"""
    try:
        mode = ImageProcessMode(request.mode)
        result = await image_agent.process_image(
            image_url=request.image_url,
            mode=mode,
            source_language=request.source_language,
            target_language=request.target_language,
            options=request.options
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"图片处理失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-image/batch")
async def batch_process_image(request: BatchProcessImageRequest):
    """批量处理图片"""
    try:
        mode = ImageProcessMode(request.mode)
        result = await image_agent.batch_process(
            image_urls=request.image_urls,
            mode=mode,
            source_language=request.source_language,
            target_language=request.target_language
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"批量图片处理失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/process-image/task/{task_id}")
async def get_image_task_status(task_id: str):
    """获取图片处理任务状态"""
    result = image_agent.get_task_status(task_id)
    if not result:
        raise HTTPException(status_code=404, detail="任务不存在")
    return {"success": True, "data": result}


# ============ 图片生成 ============

_video_gen_client = None

def get_video_gen_client():
    """获取视频生成客户端"""
    global _video_gen_client
    if _video_gen_client is None:
        from coze_coding_dev_sdk.video import VideoGenerationClient
        from coze_coding_utils.runtime_ctx.context import new_context
        ctx = new_context(method="video.generate")
        _video_gen_client = VideoGenerationClient(ctx=ctx)
    return _video_gen_client


@router.post("/generate-video")
async def generate_video(request: GenerateVideoRequest):
    """
    AI生成视频
    根据文本描述或图片生成商品营销视频
    """
    try:
        logger.info(f"开始AI视频生成: {request.prompt[:50]}...")
        
        client = get_video_gen_client()
        
        # 构建内容项
        from coze_coding_dev_sdk.video import TextContent, ImageURLContent, ImageURL
        
        content_items = [TextContent(text=request.prompt)]
        
        # 如果提供了图片，则添加图生视频
        if request.image_url:
            content_items.append(
                ImageURLContent(
                    image_url=ImageURL(url=request.image_url),
                    role="first_frame"
                )
            )
        
        # 调用视频生成服务
        video_url, response, last_frame_url = client.video_generation(
            content_items=content_items,
            model="doubao-seedance-1-5-pro-251215",
            resolution=request.resolution,
            ratio=request.ratio,
            duration=request.duration,
            watermark=request.watermark,
            generate_audio=request.generate_audio,
        )
        
        if video_url:
            return {
                "success": True,
                "data": {
                    "video_url": video_url,
                    "task_id": response.get("id", ""),
                    "status": response.get("status", "succeeded"),
                    "resolution": request.resolution,
                    "ratio": request.ratio,
                    "duration": request.duration,
                    "model": "doubao-seedance-1-5-pro-251215",
                    "last_frame_url": last_frame_url,
                }
            }
        else:
            logger.error(f"视频生成失败: {response}")
            raise HTTPException(status_code=500, detail="视频生成失败")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"视频生成失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-image")
async def generate_image(request: GenerateImageRequest):
    """
    AI生成图片
    根据文本描述生成商品主图、背景图等
    """
    try:
        logger.info(f"开始AI图片生成: {request.prompt[:50]}...")
        
        client = get_image_gen_client()
        
        # 构建生成提示词
        prompt = request.prompt
        if request.style:
            prompt = f"{prompt}, {request.style}"
        
        # 调用图片生成服务
        response = client.generate(
            prompt=prompt,
            size=request.size,
            watermark=request.watermark,
            image=request.image,  # 如果提供则是图生图模式
        )
        
        if response.success:
            return {
                "success": True,
                "data": {
                    "image_url": response.image_urls[0] if response.image_urls else None,
                    "image_urls": response.image_urls,
                    "size": request.size,
                    "model": response.model,
                    "prompt": prompt,
                }
            }
        else:
            logger.error(f"图片生成失败: {response.error_messages}")
            raise HTTPException(status_code=500, detail=response.error_messages[0] if response.error_messages else "生成失败")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"图片生成失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Listing优化智能体 ============

@router.post("/optimize-listing")
async def optimize_listing(request: OptimizeListingRequest):
    """优化Listing"""
    try:
        result = await listing_optimization_agent.optimize_listing(
            product_info=request.product_info,
            platform=request.platform,
            language=request.language,
            keywords=request.keywords
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Listing优化失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/suggest-keywords")
async def suggest_keywords(product_name: str, platform: str = "tiktok"):
    """关键词建议"""
    try:
        result = await listing_optimization_agent.suggest_keywords(
            product_name=product_name,
            platform=platform
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"关键词建议失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ 智能定价工具 ============

@router.post("/calculate-price")
async def calculate_price(request: CalculatePriceRequest):
    """智能定价计算"""
    try:
        result = pricing_tool.calculate_price(
            cost_price=request.cost_price,
            domestic_shipping=request.domestic_shipping,
            first_mile_shipping=request.first_mile_shipping,
            platform_commission_rate=request.platform_commission_rate,
            ad_cost_rate=request.ad_cost_rate,
            target_profit_rate=request.target_profit_rate,
            competitor_prices=request.competitor_prices
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"定价计算失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ 广告投放智能体 ============

@router.post("/create-ad")
async def create_ad(request: CreateAdRequest):
    """创建广告计划"""
    try:
        result = await advertising_agent.create_ad_campaign(
            product_id=request.product_id,
            product_name=request.product_name,
            platform=request.platform,
            daily_budget=request.daily_budget,
            target_acos=request.target_acos,
            keywords=request.keywords,
            category=request.category
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"创建广告失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/optimize-ad/{campaign_id}")
async def optimize_ad(campaign_id: str):
    """优化广告计划"""
    try:
        # 模拟性能数据
        performance_data = {
            "impressions": 10000,
            "clicks": 500,
            "conversions": 25,
            "spend": 150,
            "revenue": 750
        }
        result = await advertising_agent.optimize_campaign(
            campaign_id=campaign_id,
            performance_data=performance_data
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"优化广告失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ AI客服智能体 ============

@router.post("/customer-reply")
async def generate_customer_reply(request: CustomerReplyRequest):
    """生成客服回复"""
    try:
        result = await customer_service_agent.generate_reply(
            message=request.message,
            language=request.language,
            context=request.context
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"生成回复失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/handle-dispute")
async def handle_dispute(dispute_info: Dict[str, Any]):
    """处理纠纷"""
    try:
        result = await customer_service_agent.handle_dispute(dispute_info)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"处理纠纷失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ 数据复盘智能体 ============

@router.post("/data-report")
async def generate_data_report(request: DataReportRequest):
    """生成数据报告"""
    try:
        start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        end_date = datetime.strptime(request.end_date, "%Y-%m-%d")
        
        result = await data_review_agent.generate_report(
            start_date=start_date,
            end_date=end_date,
            platform=request.platform
        )
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"生成报告失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/action-items")
async def generate_action_items(report: Dict[str, Any]):
    """生成行动项"""
    try:
        result = await data_review_agent.generate_action_items(report)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"生成行动项失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ 智能体列表 ============

@router.get("/agents")
async def list_agents():
    """获取智能体列表"""
    return {
        "agents": [
            {
                "id": "product_selection",
                "name": product_selection_agent.name,
                "description": product_selection_agent.description,
                "priority": "P0",
                "status": "active"
            },
            {
                "id": "image",
                "name": "图片智能体",
                "description": "AI生成商品主图、背景图，支持图生图",
                "priority": "P0",
                "status": "active"
            },
            {
                "id": "video",
                "name": "视频生成智能体",
                "description": "AI生成商品营销视频，支持文生视频、图生视频",
                "priority": "P0",
                "status": "active"
            },
            {
                "id": "listing_optimization",
                "name": listing_optimization_agent.name,
                "description": listing_optimization_agent.description,
                "priority": "P0",
                "status": "active"
            },
            {
                "id": "pricing",
                "name": pricing_tool.name,
                "description": pricing_tool.description,
                "priority": "P0",
                "status": "active"
            },
            {
                "id": "advertising",
                "name": advertising_agent.name,
                "description": advertising_agent.description,
                "priority": "P1",
                "status": "active"
            },
            {
                "id": "customer_service",
                "name": customer_service_agent.name,
                "description": customer_service_agent.description,
                "priority": "P1",
                "status": "active"
            },
            {
                "id": "data_review",
                "name": data_review_agent.name,
                "description": data_review_agent.description,
                "priority": "P1",
                "status": "active"
            }
        ]
    }


# ============ 视频生成智能体 ============

class GenerateVideoRequest(BaseModel):
    """视频生成请求"""
    product_name: Optional[str] = None
    product_description: Optional[str] = None
    product_images: Optional[List[str]] = None
    video_type: str = "product_showcase"  # script, voiceover, slideshow, full, product_showcase
    duration: int = 5  # 5-12秒
    style: Optional[str] = None
    language: str = "en"
    # 直接生成参数
    prompt: Optional[str] = None
    image_url: Optional[str] = None
    resolution: str = "720p"
    ratio: str = "9:16"
    watermark: bool = False
    generate_audio: bool = True


@router.post("/generate-video")
async def generate_video(request: GenerateVideoRequest):
    """生成视频"""
    try:
        logger.info(f"收到视频生成请求: {request.product_name or request.prompt}")
        
        # 如果有prompt直接使用
        if request.prompt:
            result = await video_generation_agent.generate_video(
                prompt=request.prompt,
                image_url=request.image_url,
                resolution=request.resolution,
                ratio=request.ratio,
                duration=request.duration,
                watermark=request.watermark,
                generate_audio=request.generate_audio,
                style=request.style,
            )
        # 如果有product_name使用商品信息生成
        elif request.product_name:
            result = await video_generation_agent.generate_from_product(
                product_name=request.product_name,
                product_description=request.product_description,
                product_images=request.product_images,
                video_type=request.video_type,
                duration=request.duration,
                style=request.style,
                language=request.language,
            )
        else:
            return {"success": False, "error": "请提供product_name或prompt参数"}
        
        if result.get("status") == "failed":
            return {"success": False, "error": result.get("error", "视频生成失败")}
        
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"视频生成失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/generate-video/{task_id}")
async def get_video_status(task_id: str):
    """获取视频生成状态"""
    try:
        result = video_generation_agent.get_task_status(task_id)
        if not result:
            raise HTTPException(status_code=404, detail="任务不存在")
        return {"success": True, "data": result}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取视频状态失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))
