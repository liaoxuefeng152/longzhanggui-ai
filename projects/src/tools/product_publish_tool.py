"""商品发布工具 - 支持多平台商品发布"""
import json
import os
from typing import Optional
from langchain.tools import tool
from datetime import datetime


@tool
def publish_product_to_platform(
    platform: str,
    title: str,
    description: str,
    price: float,
    stock: int,
    images: list,
    category: str,
    sku: Optional[str] = None,
    brand: Optional[str] = None,
    weight: Optional[float] = None,
    tags: Optional[list] = None
) -> str:
    """
    发布商品到电商平台（生成发布数据包）

    Args:
        platform: 平台名称（shopee/lazada/tiktok/amazon）
        title: 商品标题
        description: 商品描述
        price: 商品价格
        stock: 库存数量
        images: 图片URL列表
        category: 商品类目
        sku: 商品SKU（可选）
        brand: 品牌名称（可选）
        weight: 商品重量（kg，可选）
        tags: 商品标签（可选）

    Returns:
        发布结果或数据包
    """
    try:
        platform = platform.lower()

        # 生成SKU（如果未提供）
        if not sku:
            sku = f"PROD-{datetime.now().strftime('%Y%m%d%H%M%S')}"

        # 基础商品数据
        product_data = {
            "sku": sku,
            "title": title,
            "description": description,
            "price": price,
            "stock": stock,
            "images": images,
            "category": category,
            "created_at": datetime.now().isoformat(),
        }

        # 可选字段
        if brand:
            product_data["brand"] = brand
        if weight:
            product_data["weight"] = weight
        if tags:
            product_data["tags"] = tags

        # 根据平台格式化数据
        formatted_data = None

        if platform == "tiktok":
            formatted_data = format_tiktok_product(product_data)
            return f"✅ 已生成 TikTok Shop 商品发布数据包：\n\n```json\n{json.dumps(formatted_data, indent=2, ensure_ascii=False)}\n```\n\n💡 提示：请将此数据上传到 TikTok Shop 后台或使用API发布。"
        elif platform == "shopee":
            formatted_data = format_shopee_product(product_data)
            return f"✅ 已生成 Shopee 商品发布数据包：\n\n```json\n{json.dumps(formatted_data, indent=2, ensure_ascii=False)}\n```\n\n💡 提示：请将此数据上传到 Shopee 卖家中心或使用API发布。"
        elif platform == "lazada":
            formatted_data = format_lazada_product(product_data)
            return f"✅ 已生成 Lazada 商品发布数据包：\n\n```json\n{json.dumps(formatted_data, indent=2, ensure_ascii=False)}\n```\n\n💡 提示：请将此数据上传到 Lazada 卖家中心或使用API发布。"
        elif platform == "amazon":
            formatted_data = format_amazon_product(product_data)
            return f"✅ 已生成 Amazon 商品发布数据包：\n\n```json\n{json.dumps(formatted_data, indent=2, ensure_ascii=False)}\n```\n\n💡 提示：请将此数据上传到 Amazon Seller Central 或使用API发布。"
        else:
            return f"❌ 不支持的平台：{platform}\n\n支持的平台：shopee, lazada, tiktok, amazon"

    except Exception as e:
        return f"❌ 商品发布失败：{str(e)}"


def format_tiktok_product(data: dict) -> dict:
    """格式化 TikTok Shop 商品数据"""
    return {
        "product": {
            "sku_id": data["sku"],
            "name": data["title"],
            "description": data["description"],
            "category_id": data["category"],
            "brand_id": data.get("brand", ""),
            "package_weight": data.get("weight", 1.0),
            "images": [
                {
                    "url": img,
                    "type": "MAIN" if i == 0 else "DETAIL"
                }
                for i, img in enumerate(data["images"])
            ],
            "skus": [
                {
                    "id": data["sku"],
                    "seller_sku": data["sku"],
                    "stock": data["stock"],
                    "price": {
                        "amount": int(data["price"] * 100),  # 转换为分
                        "currency": "THB"
                    }
                }
            ],
            "attributes": {
                "tags": data.get("tags", [])
            }
        }
    }


def format_shopee_product(data: dict) -> dict:
    """格式化 Shopee 商品数据"""
    return {
        "item": {
            "item_sku": data["sku"],
            "item_name": data["title"],
            "description": data["description"],
            "item_status": "NORMAL",
            "category_id": data["category"],
            "brand_id": data.get("brand", ""),
            "item_weight": data.get("weight", 1.0),
            "images": data["images"],
            "price": int(data["price"] * 100000),  # 转换为印尼盾/泰铢等
            "stock": data["stock"],
            "normal_stock": data["stock"],
            "item_dangerous": False,
            "pre_order": False,
            "logistics": {
                "is_free_shipping": False
            },
            "attributes": {
                "tags": data.get("tags", [])
            }
        }
    }


def format_lazada_product(data: dict) -> dict:
    """格式化 Lazada 商品数据"""
    return {
        "Product": {
            "SellerSku": data["sku"],
            "Title": data["title"],
            "Description": data["description"],
            "Brand": data.get("brand", "Generic"),
            "Price": data["price"],
            "SalePrice": data["price"],
            "Quantity": data["stock"],
            "CategoryId": data["category"],
            "PrimaryCategory": data["category"],
            "Images": [
                {
                    "ImageUrl": img,
                    "IsMain": i == 0
                }
                for i, img in enumerate(data["images"])
            ],
            "PackageWeight": data.get("weight", 1.0),
            "PackageLength": 30.0,
            "PackageWidth": 20.0,
            "PackageHeight": 10.0,
            "ProductData": {
                "tags": data.get("tags", [])
            }
        }
    }


def format_amazon_product(data: dict) -> dict:
    """格式化 Amazon 商品数据"""
    return {
        "Product": {
            "SKU": data["sku"],
            "StandardProductID": {
                "Type": "ASIN",
                "Value": data.get("asin", "")
            },
            "ProductTaxCode": "A_GEN_NOTAX",
            "DescriptionData": {
                "Title": data["title"],
                "Brand": data.get("brand", "Generic"),
                "Description": data["description"],
                "BulletPoint": [
                    data["description"][:200],
                    f"Price: ${data['price']}",
                    f"In Stock: {data['stock']}"
                ],
                "ItemType": "product",
                "Keywords": data.get("tags", [])
            },
            "ProductData": {
                "Category": data["category"]
            },
            "Condition": {
                "ConditionType": "New"
            },
            "Price": {
                "StandardPrice": {
                    "_currency": "USD",
                    "_value": data["price"]
                }
            },
            "Inventory": {
                "Stock": data["stock"]
            }
        }
    }


@tool
def generate_product_publish_template(
    platform: str,
    product_type: str
) -> str:
    """
    生成商品发布模板

    Args:
        platform: 平台名称（shopee/lazada/tiktok/amazon）
        product_type: 商品类型（clothing/electronics/beauty/home等）

    Returns:
        发布模板
    """
    templates = {
        "shopee": {
            "clothing": "Shopee服装商品模板：标题包含品牌、材质、颜色；图片需有模特图；详细描述包含尺码表",
            "electronics": "Shopee电子产品模板：标题需包含型号、规格；图片需有功能展示；详细描述包含参数表、保修信息",
            "beauty": "Shopee美妆商品模板：标题需包含品牌、功效、容量；图片需有前后对比；详细描述包含成分表、使用方法",
            "home": "Shopee家居商品模板：标题需包含材质、尺寸、颜色；图片需有场景图；详细描述包含规格参数"
        },
        "tiktok": {
            "clothing": "TikTok Shop服装模板：标题短小精悍（30字以内）；图片/视频展示穿搭效果；详细描述突出卖点",
            "electronics": "TikTok Shop电子产品模板：标题突出核心功能；需有演示视频；详细描述包含使用场景",
            "beauty": "TikTok Shop美妆模板：标题突出功效；需有使用教程视频；详细描述包含对比效果",
            "home": "TikTok Shop家居商品模板：标题突出使用场景；需有展示视频；详细描述包含使用方法"
        },
        "lazada": {
            "clothing": "Lazada服装模板：标题包含品牌、材质、性别；图片需有模特图；详细描述包含洗涤说明",
            "electronics": "Lazada电子产品模板：标题需包含型号、规格；图片需有功能展示；详细描述包含技术参数",
            "beauty": "Lazada美妆模板：标题需包含品牌、功效、容量；图片需有产品特写；详细描述包含全成分表",
            "home": "Lazada家居商品模板：标题需包含材质、尺寸、颜色；图片需有场景图；详细描述包含规格参数"
        },
        "amazon": {
            "clothing": "Amazon服装模板：标题包含品牌、性别、类型；图片需有多角度图；详细描述包含尺码、材质、洗涤说明",
            "electronics": "Amazon电子产品模板：标题需包含品牌、型号、规格；图片需有功能展示；详细描述包含技术参数、保修信息",
            "beauty": "Amazon美妆模板：标题需包含品牌、功效、容量；图片需有产品图；详细描述包含成分、使用方法、注意事项",
            "home": "Amazon家居商品模板：标题需包含品牌、材质、尺寸；图片需有场景图；详细描述包含规格参数、使用说明"
        }
    }

    if platform.lower() not in templates:
        return f"❌ 不支持的平台：{platform}\n\n支持的平台：shopee, lazada, tiktok, amazon"

    if product_type.lower() not in templates[platform.lower()]:
        return f"❌ 不支持的类型：{product_type}\n\n支持类型：clothing, electronics, beauty, home"

    template = templates[platform.lower()][product_type.lower()]
    return f"✅ {platform.upper()} - {product_type.upper()} 商品发布模板\n\n{template}\n\n💡 提示：根据模板准备商品信息和素材，然后使用 publish_product_to_platform 工具发布。"
