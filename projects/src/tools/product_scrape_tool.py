"""商品链接采集工具 - 支持多平台商品信息采集"""
import re
import json
from typing import Optional, Dict, List
from langchain.tools import tool


@tool
def scrape_product_from_url(product_url: str, platform: Optional[str] = None) -> str:
    """
    采集商品链接信息，提取商品标题、价格、图片、描述等关键信息

    Args:
        product_url: 商品链接
        platform: 平台名称（可选，自动识别）。支持：1688、teum、淘宝、天猫、京东、拼多多等

    Returns:
        商品信息JSON字符串，包含标题、价格、图片、描述等信息
    """
    try:
        # 自动识别平台
        if not platform:
            platform = detect_platform(product_url)

        print(f"识别到平台: {platform}, 链接: {product_url}")

        # 根据平台提取商品ID
        product_id = extract_product_id(product_url, platform)
        if not product_id:
            return f"❌ 无法提取商品ID，请检查链接格式\n\n链接: {product_url}"

        # 根据平台采集商品信息
        product_info = {
            "platform": platform,
            "product_url": product_url,
            "product_id": product_id,
            "collected_at": None,
        }

        # 模拟不同平台的信息提取（实际需要调用对应的API或爬虫）
        if platform == "1688":
            product_info.update(scrape_1688_product(product_id, product_url))
        elif platform == "teum":
            product_info.update(scrape_teum_product(product_id, product_url))
        elif platform == "taobao":
            product_info.update(scrape_taobao_product(product_id, product_url))
        elif platform == "tmall":
            product_info.update(scrape_tmall_product(product_id, product_url))
        elif platform == "jd":
            product_info.update(scrape_jd_product(product_id, product_url))
        elif platform == "pinduoduo":
            product_info.update(scrape_pinduoduo_product(product_id, product_url))
        else:
            product_info.update(scrape_generic_product(product_id, product_url))

        return f"✅ 成功采集商品信息：\n\n```json\n{json.dumps(product_info, indent=2, ensure_ascii=False)}\n```\n\n💡 提示：可以使用这些信息生成Listing或发布到其他平台。"

    except Exception as e:
        return f"❌ 商品采集失败：{str(e)}\n\n链接: {product_url}"


def detect_platform(url: str) -> str:
    """自动识别平台"""
    platform_patterns = {
        "1688": [r"1688\.com"],
        "teum": [r"teum\.", r"teum\.com"],
        "taobao": [r"taobao\.com"],
        "tmall": [r"tmall\.com"],
        "jd": [r"jd\.com", r"item\.jd\.com"],
        "pinduoduo": [r"pinduoduo\.com", r"yangkeduo\.com"],
    }

    for platform, patterns in platform_patterns.items():
        for pattern in patterns:
            if re.search(pattern, url, re.IGNORECASE):
                return platform

    return "generic"


def extract_product_id(url: str, platform: str) -> Optional[str]:
    """提取商品ID"""
    try:
        if platform == "1688":
            # 1688: https://detail.1688.com/offer/123456789.html
            match = re.search(r'/offer/(\d+)\.html', url)
            if match:
                return match.group(1)

        elif platform == "teum":
            # teum: 根据实际格式调整
            match = re.search(r'/product/(\d+)', url)
            if match:
                return match.group(1)

        elif platform == "taobao" or platform == "tmall":
            # 淘宝/天猫: https://item.taobao.com/item.htm?id=123456789
            match = re.search(r'[?&]id=(\d+)', url)
            if match:
                return match.group(1)

        elif platform == "jd":
            # 京东: https://item.jd.com/123456789.html
            match = re.search(r'/(\d+)\.html', url)
            if match:
                return match.group(1)

        elif platform == "pinduoduo":
            # 拼多多: https://mobile.yangkeduo.com/goods.html?goods_id=123456789
            match = re.search(r'[?&]goods_id=(\d+)', url)
            if match:
                return match.group(1)

        # 通用提取
        match = re.search(r'/(\d+)', url)
        if match:
            return match.group(1)

        return None
    except:
        return None


def scrape_1688_product(product_id: str, url: str) -> Dict:
    """采集1688商品信息（模拟数据）"""
    return {
        "title": "1688商品标题示例 - 优质货源",
        "price": 29.99,
        "currency": "CNY",
        "images": [
            f"https://example.com/1688_{product_id}_1.jpg",
            f"https://example.com/1688_{product_id}_2.jpg",
        ],
        "description": "1688商品详细描述，包含产品特点、规格参数、包装信息等。",
        "category": "服装/配饰",
        "brand": "未指定",
        "stock": 9999,
        "sales": 1000,
        "rating": 4.8,
        "attributes": {
            "材质": "优质面料",
            "尺寸": "均码",
            "颜色": "多色可选"
        }
    }


def scrape_teum_product(product_id: str, url: str) -> Dict:
    """采集teum商品信息（模拟数据）"""
    return {
        "title": "Teum平台精选商品",
        "price": 15.99,
        "currency": "USD",
        "images": [
            f"https://example.com/teum_{product_id}_1.jpg",
            f"https://example.com/teum_{product_id}_2.jpg",
        ],
        "description": "Teum平台商品描述，包含产品亮点、使用场景、客户评价等。",
        "category": "电子产品",
        "brand": "Teum优选",
        "stock": 500,
        "sales": 200,
        "rating": 4.5,
        "attributes": {
            "型号": "TE-001",
            "保修": "1年",
            "产地": "中国"
        }
    }


def scrape_taobao_product(product_id: str, url: str) -> Dict:
    """采集淘宝商品信息（模拟数据）"""
    return {
        "title": "淘宝爆款商品",
        "price": 59.90,
        "currency": "CNY",
        "images": [
            f"https://example.com/taobao_{product_id}_1.jpg",
            f"https://example.com/taobao_{product_id}_2.jpg",
        ],
        "description": "淘宝商品详细描述，包含产品特色、买家秀、问答等。",
        "category": "美妆个护",
        "brand": "国货品牌",
        "stock": 999,
        "sales": 5000,
        "rating": 4.7,
        "attributes": {
            "规格": "标准装",
            "保质期": "3年",
            "适用人群": "所有人群"
        }
    }


def scrape_tmall_product(product_id: str, url: str) -> Dict:
    """采集天猫商品信息（模拟数据）"""
    return {
        "title": "天猫品牌旗舰店商品",
        "price": 199.00,
        "currency": "CNY",
        "images": [
            f"https://example.com/tmall_{product_id}_1.jpg",
            f"https://example.com/tmall_{product_id}_2.jpg",
        ],
        "description": "天猫官方旗舰店商品，品质保证，正品保障。",
        "category": "家居用品",
        "brand": "知名品牌",
        "stock": 1000,
        "sales": 3000,
        "rating": 4.9,
        "attributes": {
            "材质": "环保材质",
            "尺寸": "多种尺寸",
            "包装": "精美包装"
        }
    }


def scrape_jd_product(product_id: str, url: str) -> Dict:
    """采集京东商品信息（模拟数据）"""
    return {
        "title": "京东自营商品",
        "price": 299.00,
        "currency": "CNY",
        "images": [
            f"https://example.com/jd_{product_id}_1.jpg",
            f"https://example.com/jd_{product_id}_2.jpg",
        ],
        "description": "京东自营，正品保证，快速配送，无忧售后。",
        "category": "数码产品",
        "brand": "国际品牌",
        "stock": 2000,
        "sales": 8000,
        "rating": 4.8,
        "attributes": {
            "型号": "JD-PRO",
            "保修": "2年",
            "服务": "全国联保"
        }
    }


def scrape_pinduoduo_product(product_id: str, url: str) -> Dict:
    """采集拼多多商品信息（模拟数据）"""
    return {
        "title": "拼多多百亿补贴商品",
        "price": 9.90,
        "currency": "CNY",
        "images": [
            f"https://example.com/pdd_{product_id}_1.jpg",
            f"https://example.com/pdd_{product_id}_2.jpg",
        ],
        "description": "拼多多爆款，超值价格，多人拼单更优惠。",
        "category": "日用百货",
        "brand": "品质好货",
        "stock": 10000,
        "sales": 100000,
        "rating": 4.6,
        "attributes": {
            "规格": "家庭装",
            "保质期": "2年",
            "产地": "产地直供"
        }
    }


def scrape_generic_product(product_id: str, url: str) -> Dict:
    """通用商品信息采集"""
    return {
        "title": "通用商品标题",
        "price": 0.0,
        "currency": "USD",
        "images": [f"https://example.com/generic_{product_id}.jpg"],
        "description": f"从 {url} 采集的商品信息",
        "category": "未分类",
        "brand": "未知",
        "stock": 0,
        "sales": 0,
        "rating": 0.0,
        "attributes": {}
    }


@tool
def batch_scrape_products(urls: List[str]) -> str:
    """
    批量采集多个商品链接信息

    Args:
        urls: 商品链接列表

    Returns:
        批量采集结果
    """
    try:
        results = []
        success_count = 0
        failed_count = 0

        for url in urls:
            platform = detect_platform(url)
            product_id = extract_product_id(url, platform)

            if not product_id:
                failed_count += 1
                results.append({
                    "url": url,
                    "status": "failed",
                    "error": "无法提取商品ID"
                })
                continue

            # 模拟采集
            product_info = {
                "platform": platform,
                "product_url": url,
                "product_id": product_id,
                "title": f"{platform.upper()} 商品 {product_id}",
                "price": 0.0,
                "status": "success"
            }

            results.append(product_info)
            success_count += 1

        return f"✅ 批量采集完成\n\n成功: {success_count} 个\n失败: {failed_count} 个\n\n```json\n{json.dumps(results, indent=2, ensure_ascii=False)}\n```\n\n💡 提示：实际使用时需要配置对应的平台API或爬虫服务。"

    except Exception as e:
        return f"❌ 批量采集失败：{str(e)}"


@tool
def get_supported_platforms() -> str:
    """
    获取支持的商品采集平台列表

    Returns:
        支持的平台列表和说明
    """
    platforms = {
        "1688": {
            "name": "阿里巴巴1688",
            "url_pattern": "https://detail.1688.com/offer/{product_id}.html",
            "description": "中国领先的B2B批发平台",
            "features": ["批量采购", "工厂直供", "价格透明"]
        },
        "teum": {
            "name": "Teum平台",
            "url_pattern": "https://teum.com/product/{product_id}",
            "description": "全球跨境电商平台",
            "features": ["跨境销售", "多语言", "国际物流"]
        },
        "taobao": {
            "name": "淘宝",
            "url_pattern": "https://item.taobao.com/item.htm?id={product_id}",
            "description": "中国最大的C2C购物平台",
            "features": ["海量商品", "价格实惠", "社交电商"]
        },
        "tmall": {
            "name": "天猫",
            "url_pattern": "https://detail.tmall.com/item.htm?id={product_id}",
            "description": "中国领先的B2C品牌购物平台",
            "features": ["品牌正品", "品质保障", "官方售后"]
        },
        "jd": {
            "name": "京东",
            "url_pattern": "https://item.jd.com/{product_id}.html",
            "description": "中国领先的综合性电商平台",
            "features": ["自营正品", "快速配送", "无忧售后"]
        },
        "pinduoduo": {
            "name": "拼多多",
            "url_pattern": "https://mobile.yangkeduo.com/goods.html?goods_id={product_id}",
            "description": "中国领先的社交电商平台",
            "features": ["拼单优惠", "百亿补贴", "社交裂变"]
        }
    }

    result = "## ✅ 支持的商品采集平台\n\n"
    for code, info in platforms.items():
        result += f"### {info['name']} (`{code}`)\n"
        result += f"- **链接格式**: `{info['url_pattern']}`\n"
        result += f"- **平台特色**: {info['description']}\n"
        result += f"- **核心功能**: {', '.join(info['features'])}\n\n"

    result += "## 💡 使用方法\n\n"
    result += "1. **单个采集**: 使用 `scrape_product_from_url` 工具\n"
    result += "   示例：请采集这个商品信息 https://detail.1688.com/offer/123456789.html\n\n"
    result += "2. **批量采集**: 使用 `batch_scrape_products` 工具\n"
    result += "   示例：请批量采集这些商品\n"
    result += "   - https://detail.1688.com/offer/123456789.html\n"
    result += "   - https://item.taobao.com/item.htm?id=987654321\n\n"
    result += "3. **查看支持平台**: 使用 `get_supported_platforms` 工具\n\n"
    result += "## ⚠️ 注意事项\n\n"
    result += "- 当前版本使用模拟数据，实际使用需要配置对应平台的API或爬虫服务\n"
    result += "- 请遵守各平台的服务条款和爬虫规则\n"
    result += "- 采集的商品信息仅用于学习和参考，请尊重知识产权\n"
    result += "- 建议使用官方API获取准确的商品信息"

    return result
