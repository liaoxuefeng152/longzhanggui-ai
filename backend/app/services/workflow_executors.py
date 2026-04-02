"""
工作流执行器实现
为各智能体和服务提供可被工作流编排引擎调用的执行接口
"""
from typing import Dict, Any, Optional
from datetime import datetime
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.workflow_orchestrator import (
    WorkflowOrchestrator, 
    WorkflowContext, 
    workflow_executor
)
from app.services.collection_1688_service import Collection1688Service
from app.agents.product_selection import ProductSelectionAgent
from app.agents.image_design import ImageDesignAgent
from app.agents.listing_optimization import ListingOptimizationAgent
from app.agents.advertising import AdvertisingAgent
from app.agents.data_review import DataReviewAgent


# ===========================================
# 选品智能体执行器
# ===========================================
@workflow_executor("product_selection_agent")
async def execute_product_selection(
    context: WorkflowContext,
    step_config: Dict[str, Any],
    input_data: Dict[str, Any],
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    """
    执行选品智能体
    
    输入参数（从context.params获取）：
    - category: 商品类目，如"宠物用品"
    - platform: 目标平台，如"tiktok"
    - region: 目标地区，如"id"（印尼）
    - quantity: 需要选品的数量，如3
    
    输出：
    - products: 推荐的商品列表，包含名称、1688链接等
    - analysis: 市场分析报告
    """
    params = input_data.get("params", {})
    
    logger.info(f"执行选品智能体: {params}")
    
    # 初始化选品智能体
    agent = ProductSelectionAgent()
    
    # 执行选品分析
    result = await agent.run({
        "category": params.get("category", "宠物用品"),
        "platform": params.get("platform", "tiktok"),
        "region": params.get("region", "id"),
        "budget": params.get("budget", "中等")
    })
    
    # 解析推荐结果
    recommendations = result.get("output", {}).get("recommendations", [])
    
    # 构造输出 - 包含可执行的下一步数据
    products = []
    for i, rec in enumerate(recommendations[:params.get("quantity", 3)]):
        product = {
            "id": f"product_{i+1}",
            "name": rec.get("name", f"推荐商品{i+1}"),
            "reason": rec.get("reason", ""),
            "price_range": rec.get("price_range", ""),
            "profit_margin": rec.get("profit_margin", ""),
            "risks": rec.get("risks", []),
            # 模拟1688链接（实际应通过选品工具API获取）
            "1688_url": f"https://detail.1688.com/offer/{600000000000 + i}.html",
            "estimated_cost": 50.0 + i * 10,  # 模拟成本
        }
        products.append(product)
    
    return {
        "products": products,
        "analysis": result.get("output", {}).get("analysis", ""),
        "total_count": len(products)
    }


# ===========================================
# 1688采集执行器
# ===========================================
@workflow_executor("collection_1688_service")
async def execute_collection_1688(
    context: WorkflowContext,
    step_config: Dict[str, Any],
    input_data: Dict[str, Any],
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    """
    执行1688商品采集
    
    输入数据来源：
    - 从上一步"product_selection"获取商品列表
    - 或直接传入url参数
    
    输出：
    - collected_products: 采集到的商品详细信息
    - images: 商品图片列表
    - skus: SKU信息
    """
    params = input_data.get("params", {})
    
    # 获取采集来源
    urls_to_collect = []
    
    # 优先从上一步骤获取
    selection_result = input_data.get("product_selection", {})
    if selection_result.get("products"):
        for product in selection_result["products"]:
            if product.get("1688_url"):
                urls_to_collect.append({
                    "url": product["1688_url"],
                    "name": product.get("name")
                })
    
    # 或直接传入URL
    if params.get("url"):
        urls_to_collect = [{"url": params["url"], "name": params.get("name")}]
    
    if params.get("urls"):
        urls_to_collect = [{"url": url, "name": None} for url in params["urls"]]
    
    if not urls_to_collect:
        return {
            "collected_products": [],
            "error": "没有待采集的商品链接"
        }
    
    logger.info(f"开始采集1688商品: {len(urls_to_collect)}个")
    
    # 初始化采集服务
    collection_service = Collection1688Service()
    
    collected_products = []
    all_images = []
    
    for item in urls_to_collect:
        try:
            product_data = await collection_service.collect_product(item["url"])
            
            if product_data:
                collected_products.append({
                    "source_url": item["url"],
                    "name": product_data.get("title", item.get("name")),
                    "price": product_data.get("price", ""),
                    "images": product_data.get("images", []),
                    "supplier": product_data.get("supplier", {}),
                    "attributes": product_data.get("attributes", {}),
                    "skus": product_data.get("skus", [])
                })
                all_images.extend(product_data.get("images", []))
        except Exception as e:
            logger.error(f"采集失败: {item['url']}, error: {e}")
    
    # 保存到数据库（如果提供了db session）
    if db and collected_products:
        # TODO: 保存到ERP商品库
        pass
    
    return {
        "collected_products": collected_products,
        "images": all_images,
        "total_count": len(collected_products),
        "total_images": len(all_images)
    }


# ===========================================
# 图片处理执行器
# ===========================================
@workflow_executor("image_design_agent")
async def execute_image_processing(
    context: WorkflowContext,
    step_config: Dict[str, Any],
    input_data: Dict[str, Any],
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    """
    执行图片智能处理
    
    输入数据来源：
    - 从上一步"collect_1688"获取图片列表
    
    输出：
    - processed_images: 处理后的图片URL列表
    - processing_report: 处理报告
    """
    params = input_data.get("params", {})
    
    # 获取待处理的图片
    images_to_process = []
    
    collection_result = input_data.get("collect_1688", {})
    if collection_result.get("images"):
        images_to_process = collection_result["images"]
    
    # 或直接传入
    if params.get("images"):
        images_to_process = params["images"]
    
    if not images_to_process:
        return {
            "processed_images": [],
            "error": "没有待处理的图片"
        }
    
    logger.info(f"开始处理图片: {len(images_to_process)}张")
    
    # 获取处理模式
    mode = params.get("image_mode", "translate")  # translate, optimize, both
    target_language = params.get("target_language", "id")  # 印尼语
    
    # 初始化图片智能体
    agent = ImageDesignAgent()
    
    # 获取商品名称
    product_name = ""
    collected_products = input_data.get("collect_1688", {}).get("collected_products", [])
    if collected_products and len(collected_products) > 0:
        product_name = collected_products[0].get("name", "")
    
    processed_images = []
    processing_report = []
    
    for i, image_url in enumerate(images_to_process[:20]):  # 限制最多20张
        try:
            # 根据模式选择处理方式
            if mode == "translate":
                # 使用图片文字翻译功能
                result = await agent.translate_image_text(image_url, target_language)
                processed_url = image_url  # 翻译模式暂时返回原图URL
                ocr_result = result
            else:
                # 使用图片设计工作流
                result = await agent.run(
                    product_name=product_name,
                    product_description=f"处理电商商品图片，目标语言：{target_language}",
                    reference_images=[image_url],
                    style="professional",
                    size="1000x1000"
                )
                # 从结果中提取处理后的图片URL
                processed_url = result.get("generated_images", [{}])[0].get("url", image_url) if result.get("generated_images") else image_url
            
            processed_images.append({
                "original_url": image_url,
                "processed_url": processed_url,
                "mode": mode,
                "status": "success"
            })
            
            processing_report.append({
                "image_index": i,
                "status": "success"
            })
            
        except Exception as e:
            logger.error(f"图片处理失败: {image_url}, error: {e}")
            processed_images.append({
                "original_url": image_url,
                "processed_url": image_url,  # 使用原图
                "mode": mode,
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "processed_images": processed_images,
        "processing_report": processing_report,
        "total_processed": len([p for p in processed_images if p["status"] == "success"]),
        "total_failed": len([p for p in processed_images if p["status"] == "failed"])
    }


# ===========================================
# 智能定价执行器
# ===========================================
@workflow_executor("pricing_service")
async def execute_pricing(
    context: WorkflowContext,
    step_config: Dict[str, Any],
    input_data: Dict[str, Any],
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    """
    执行智能定价
    
    输入数据来源：
    - 从上一步"collect_1688"获取成本信息
    
    输出：
    - suggested_price: 建议售价
    - pricing_breakdown: 定价明细
    """
    params = input_data.get("params", {})
    
    # 获取成本数据
    collection_result = input_data.get("collect_1688", {})
    products = collection_result.get("collected_products", [])
    
    if not products:
        return {
            "error": "没有商品定价数据"
        }
    
    logger.info(f"开始智能定价: {len(products)}个商品")
    
    pricing_results = []
    
    for product in products:
        # 解析成本
        cost_price = float(product.get("price", "0").replace("¥", "").replace(",", "").split("-")[0] or 0)
        
        # 定价计算（简化版，实际应参考竞品）
        # 公式: 总成本 = 采购价 + 国内运费 + 头程 + 平台佣金
        domestic_shipping = 5.0  # 国内运费预估
        first_mile_shipping = 3.0  # 头程运费预估（$/件）
        platform_commission_rate = 0.05  # 平台佣金率
        
        total_cost_usd = (cost_price / 7.2) + domestic_shipping + first_mile_shipping  # 转美元
        
        # 目标利润率
        target_profit_rate = params.get("profit_rate", 0.3)  # 30%
        
        # 计算建议售价
        suggested_price = total_cost_usd * (1 + target_profit_rate) / (1 - platform_commission_rate)
        
        # 参考竞品价格（模拟）
        competitor_price = suggested_price * 1.1  # 模拟竞品价格略高
        
        # 最终价格 = min(建议价, 竞品价 * 1.1)
        final_price = min(suggested_price, competitor_price * 1.1)
        
        pricing_results.append({
            "product_name": product.get("name"),
            "cost_cny": cost_price,
            "cost_usd": round(total_cost_usd, 2),
            "suggested_price": round(final_price, 2),
            "profit_margin": round((final_price - total_cost_usd) / final_price * 100, 1),
            "pricing_breakdown": {
                "product_cost": round(cost_price / 7.2, 2),
                "domestic_shipping": domestic_shipping,
                "first_mile_shipping": first_mile_shipping,
                "platform_commission": round(final_price * platform_commission_rate, 2),
                "target_profit": round(final_price * target_profit_rate, 2)
            }
        })
    
    return {
        "pricing_results": pricing_results,
        "total_products": len(pricing_results)
    }


# ===========================================
# Listing优化执行器
# ===========================================
@workflow_executor("listing_optimization_agent")
async def execute_listing_optimization(
    context: WorkflowContext,
    step_config: Dict[str, Any],
    input_data: Dict[str, Any],
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    """
    执行Listing优化
    
    输入数据来源：
    - 从collect_1688获取原始商品信息
    - 从image_processing获取处理后图片
    - 从pricing获取定价信息
    
    输出：
    - optimized_listings: 优化后的Listing内容
    """
    params = input_data.get("params", {})
    
    # 获取数据
    collection_result = input_data.get("collect_1688", {})
    image_result = input_data.get("image_processing", {})
    pricing_result = input_data.get("pricing", {})
    
    products = collection_result.get("collected_products", [])
    processed_images = image_result.get("processed_images", [])
    pricing_data = pricing_result.get("pricing_results", [])
    
    if not products:
        return {
            "error": "没有待优化的商品"
        }
    
    logger.info(f"开始Listing优化: {len(products)}个商品")
    
    # 初始化Listing优化智能体
    agent = ListingOptimizationAgent()
    
    platform = params.get("platform", "tiktok")
    target_language = params.get("target_language", "id")  # 印尼语
    
    optimized_listings = []
    
    for i, product in enumerate(products):
        try:
            # 执行Listing优化
            result = await agent.run({
                "platform": platform,
                "product_name": product.get("name", ""),
                "original_title": product.get("name", ""),
                "original_description": product.get("attributes", {}).get("description", ""),
                "target_keywords": params.get("keywords", []),
                "category": product.get("attributes", {}).get("category", "")
            })
            
            output = result.get("output", {})
            
            # 获取定价
            price_info = pricing_data[i] if i < len(pricing_data) else {}
            
            optimized_listings.append({
                "product_name": product.get("name"),
                "original_title": product.get("name"),
                "optimized_title": output.get("optimized_title", product.get("name")),
                "optimized_description": output.get("optimized_description", ""),
                "optimized_bullets": output.get("optimized_bullets", []),
                "keywords": output.get("keywords", []),
                "images": [img.get("processed_url") for img in processed_images if img.get("status") == "success"],
                "price": price_info.get("suggested_price"),
                "seo_score": output.get("seo_score", {})
            })
            
        except Exception as e:
            logger.error(f"Listing优化失败: {product.get('name')}, error: {e}")
    
    return {
        "optimized_listings": optimized_listings,
        "total_count": len(optimized_listings)
    }


# ===========================================
# 商品上架执行器
# ===========================================
@workflow_executor("publish_service")
async def execute_publish(
    context: WorkflowContext,
    step_config: Dict[str, Any],
    input_data: Dict[str, Any],
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    """
    执行商品上架
    
    输入数据来源：
    - 从listing_optimization获取优化后的Listing
    
    输出：
    - published_products: 已上架商品信息
    """
    from app.services.tiktok_shop_service import TikTokShopService, publish_to_tiktok
    
    params = input_data.get("params", {})
    
    listing_result = input_data.get("listing_optimization", {})
    listings = listing_result.get("optimized_listings", [])
    
    if not listings:
        return {
            "error": "没有待上架的商品"
        }
    
    platform = params.get("platform", "tiktok")
    region = params.get("region", "ID")
    
    logger.info(f"开始上架商品到{platform}: {len(listings)}个")
    
    published_products = []
    
    for listing in listings:
        try:
            if platform.lower() == "tiktok":
                # 调用TikTok Shop API上架
                product_data = {
                    "title": listing.get("optimized_title", listing.get("product_name")),
                    "name": listing.get("product_name"),
                    "description": listing.get("optimized_description", ""),
                    "images": listing.get("images", []),
                    "price": listing.get("price", 10.0),
                    "inventory": 100,
                    "category": params.get("category", "宠物用品"),
                    "region": region,
                    "sku": f"SKU_{hash(listing.get('product_name')) % 10000}"
                }
                
                result = await publish_to_tiktok(product_data)
                
                published_products.append({
                    "product_name": listing.get("product_name"),
                    "platform": platform,
                    "status": "published" if result.get("success") else "failed",
                    "listing_id": result.get("product_id", ""),
                    "listing_url": result.get("listing_url", ""),
                    "published_at": datetime.now().isoformat(),
                    "message": result.get("message", "")
                })
            else:
                # 其他平台（暂返回模拟结果）
                published_products.append({
                    "product_name": listing.get("product_name"),
                    "platform": platform,
                    "status": "published",
                    "listing_id": f"LIST_{platform.upper()}_{hash(listing.get('product_name')) % 100000}",
                    "listing_url": f"https://shop.{platform}.com/product/{hash(listing.get('product_name')) % 100000}",
                    "published_at": datetime.now().isoformat()
                })
            
        except Exception as e:
            logger.error(f"上架失败: {listing.get('product_name')}, error: {e}")
            published_products.append({
                "product_name": listing.get("product_name"),
                "platform": platform,
                "status": "failed",
                "error": str(e)
            })
    
    return {
        "published_products": published_products,
        "total_published": len([p for p in published_products if p["status"] == "published"]),
        "total_failed": len([p for p in published_products if p["status"] == "failed"])
    }


# ===========================================
# 数据复盘执行器
# ===========================================
@workflow_executor("data_review_agent")
async def execute_data_review(
    context: WorkflowContext,
    step_config: Dict[str, Any],
    input_data: Dict[str, Any],
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    """执行数据复盘"""
    params = input_data.get("params", {})
    
    agent = DataReviewAgent()
    
    result = await agent.run({
        "date_range": params.get("date_range", "today"),
        "metrics": params.get("metrics", ["sales", "orders", "roi"])
    })
    
    return result.get("output", {})


# ===========================================
# 广告投放执行器
# ===========================================
@workflow_executor("advertising_agent")
async def execute_advertising(
    context: WorkflowContext,
    step_config: Dict[str, Any],
    input_data: Dict[str, Any],
    db: Optional[AsyncSession] = None
) -> Dict[str, Any]:
    """执行广告投放"""
    params = input_data.get("params", {})
    
    agent = AdvertisingAgent()
    
    result = await agent.run({
        "product_id": params.get("product_id"),
        "budget": params.get("budget", 100),
        "target_audience": params.get("target_audience")
    })
    
    return result.get("output", {})


logger.info("工作流执行器注册完成")
