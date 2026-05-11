"""
1688 开放平台 API 客户端
负责签名算法和API请求调用

API签名算法: HMAC-SHA1(app_info + app_key + key1 + value1 + key2 + value2 + ..., app_secret).upper()
参考: https://open.1688.com/doc/signature.htm
"""
import hashlib
import hmac
import time
import json
import re
import base64
import asyncio
from typing import Optional, Dict, Any, List
from urllib.parse import urlparse, parse_qs

import httpx
from loguru import logger

from app.core.config import settings


class Alibaba1688Service:
    """1688开放平台API客户端"""

    # API基础URL
    GATEWAY_URL = "https://gw.open.1688.com/openapi"

    # 支持的API接口（包含完整的API路径，用于签名）
    APIS = {
        # 商品详情（分销版）
        "product_info": {
            "path": "/param2/1/com.alibaba.fenxiao/alibaba.fenxiao.productInfo.get/{app_key}",
            "biz_name": "offerDetailParam",
        },
        # 商品详情（通用版）
        "product_detail": {
            "path": "/param2/1/com.alibaba.product/alibaba.product.get/{app_key}",
            "biz_name": "productDetailParam",
        },
        # 商品列表
        "product_list": {
            "path": "/param2/1/com.alibaba.fenxiao/alibaba.fenxiao.products.get/{app_key}",
            "biz_name": "offerListParam",
        },
        # 搜索商品
        "product_search": {
            "path": "/param2/1/com.alibaba.fenxiao/alibaba.fenxiao.product.search/{app_key}",
            "biz_name": "productSearchParam",
        },
        # 供应商信息
        "supplier_info": {
            "path": "/param2/1/com.alibaba.fenxiao/alibaba.fenxiao.supplier.get/{app_key}",
            "biz_name": "supplierParam",
        },
    }

    def __init__(self):
        self.app_key = settings.ALIBABA_APP_KEY or ""
        self.app_secret = settings.ALIBABA_APP_SECRET or ""
        self.access_token = settings.ALIBABA_ACCESS_TOKEN or ""
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """获取HTTP客户端"""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=30.0,
                follow_redirects=True,
                verify=False,
            )
        return self._client

    async def close(self):
        """关闭HTTP客户端"""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    # ========================================
    # 签名算法（1688开放平台标准 AOP签名）
    # ========================================
    def _generate_sign(self, params: Dict[str, str], api_path: str) -> str:
        """
        生成API签名（1688官方AOP签名算法 - HMAC-SHA1）

        AOP签名算法:
        1. 获取apiInfo = API路径中 /appKey 之前部分
        2. 拼接: apiInfo + appKey + accessToken + 业务参数(按key字母排序)
        3. 注意：只包含业务参数，不包含公共参数
        4. 使用 HMAC-SHA1 和 appSecret 加密
        5. 十六进制大写输出

        Args:
            params: 请求参数（不含sign）
            api_path: API路径

        Returns:
            签名字符串（40位大写十六进制）
        """
        # 获取apiInfo（去掉 /{appKey} 部分）
        api_info = api_path.replace("/" + self.app_key, "")
        
        # 排除签名本身和公共参数，只保留业务参数
        exclude_keys = {"_aop_signature", "sign", "appKey", "access_token", "format", "v", "signMethod", "timestamp"}
        biz_params = {k: v for k, v in params.items() if k not in exclude_keys}
        
        # 业务参数按 key 字母升序排列
        sorted_keys = sorted(biz_params.keys())

        # AOP签名格式: apiInfo + appKey + accessToken + key1 + value1 + key2 + value2...
        sign_str = api_info + self.app_key
        if self.access_token:
            sign_str += "access_token" + self.access_token
        for key in sorted_keys:
            sign_str += str(key) + str(params[key])

        # HMAC-SHA1 加密
        signature = hmac.new(
            self.app_secret.encode("utf-8"),
            sign_str.encode("utf-8"),
            hashlib.sha1
        ).hexdigest().upper()

        return signature

    def _build_common_params(self) -> Dict[str, str]:
        """
        构建公共请求参数

        Returns:
            包含公共参数的字典
        """
        return {
            "appKey": self.app_key,
            "access_token": self.access_token,
            "format": "json",
            "v": "2.0",
            "signMethod": "md5",
            "timestamp": str(int(time.time() * 1000)),
        }

    # ========================================
    # API 请求
    # ========================================
    async def _call_api(
        self,
        api_name: str,
        biz_params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        调用1688开放平台API

        Args:
            api_name: API名称（对应 APIS 字典的 key）
            biz_params: 业务参数

        Returns:
            API响应数据
        """
        if not self.app_key or not self.app_secret:
            raise ValueError("1688 API凭据未配置，请设置 ALIBABA_APP_KEY 和 ALIBABA_APP_SECRET")

        # 获取API配置
        api_config = self.APIS.get(api_name)
        if not api_config:
            raise ValueError(f"不支持的API: {api_name}")

        # 获取API路径（原始路径，用于签名）
        api_path = api_config["path"]

        # 替换 appKey 占位符（用于URL）
        api_path_with_key = api_path.replace("{app_key}", self.app_key)
        url = f"{self.GATEWAY_URL}{api_path_with_key}"

        # 合并公共参数和业务参数
        params = self._build_common_params()
        if biz_params:
            for key, value in biz_params.items():
                params[key] = str(value)

        # 生成签名（1688新平台使用 _aop_signature）
        # 签名时不包含 sign/_aop_signature 参数本身
        exclude_keys = ("sign", "_aop_signature")
        sign_params = {k: v for k, v in params.items() if k not in exclude_keys}
        # AOP签名包含API路径
        params["_aop_signature"] = self._generate_sign(sign_params, api_path_with_key)

        # 发送请求（1688 AOP支持POST方法，参数放在URL query string中）
        client = await self._get_client()
        try:
            from urllib.parse import urlencode
            # 构建带参数的URL
            query_string = urlencode(params)
            full_url = f"{url}?{query_string}"
            
            # 使用POST方法（与调试工具一致）
            response = await client.post(
                full_url,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )
            response.raise_for_status()
            data = response.json()

            # 检查API错误
            if "error_code" in data or "errorCode" in data:
                error_code = data.get("error_code") or data.get("errorCode")
                error_msg = data.get("error_message") or data.get("errorMessage") or data.get("msg", "未知错误")
                logger.error(f"1688 API错误: code={error_code}, msg={error_msg}")
                return {"success": False, "error_code": error_code, "error_message": error_msg}

            return {"success": True, "data": data}

        except httpx.HTTPStatusError as e:
            logger.error(f"1688 API HTTP错误: {e.response.status_code}, response: {e.response.text[:200]}")
            
            # 检查是否是签名错误
            error_text = e.response.text.lower()
            if "signature" in error_text or "invalid" in error_text:
                return {
                    "success": False,
                    "error_code": "SIGNATURE_INVALID",
                    "error_message": "API签名验证失败。可能原因: (1)Access Token没有该API权限 (2)签名算法不匹配 (3)AppKey未开通该接口权限。建议检查1688开放平台的API授权设置。",
                    "suggestion": "请登录 https://open.1688.com 检查应用权限，或尝试使用通用版API (alibaba.product.get) 替代"
                }
            
            return {"success": False, "error_code": "HTTP_ERROR", "error_message": str(e)}
        except Exception as e:
            logger.error(f"1688 API请求异常: {e}")
            return {"success": False, "error_code": "REQUEST_ERROR", "error_message": str(e)}

    # ========================================
    # URL 解析
    # ========================================
    def extract_offer_id(self, url: str) -> Optional[str]:
        """
        从1688商品链接中提取商品ID

        支持格式:
        - https://detail.1688.com/offer/123456789.html
        - https://m.1688.com/offer/-xxxxx/123456789.html
        - https://p.1688.com/view/123456789.htm
        - https://m.1688.com/offer/123456789.html
        - ?offerId=123456789

        Args:
            url: 1688商品链接

        Returns:
            商品ID，解析失败返回None
        """
        # offer/xxx.html 格式（支持多种域名）
        match = re.search(r"offer/(?:[\w-]+/)?(\d+)\.html?", url)
        if match:
            return match.group(1)

        # view/xxx.htm 格式
        match = re.search(r"view/(\d+)\.htm", url)
        if match:
            return match.group(1)

        # 纯数字路径
        match = re.search(r"/(\d{10,})\.html?", url)
        if match:
            return match.group(1)

        # offerId=xxx 格式
        parsed = urlparse(url)
        query = parse_qs(parsed.query)
        if "offerId" in query:
            return query["offerId"][0]

        return None

    # ========================================
    # 商品采集
    # ========================================
    async def get_product_info(self, offer_id: str) -> Dict[str, Any]:
        """
        通过1688开放平台API获取商品详情（分销版）

        Args:
            offer_id: 商品ID

        Returns:
            商品详情数据
        """
        logger.info(f"[1688 API] 获取商品详情: offerId={offer_id}")

        # 分销版API需要 offerDetailParam 格式
        biz_param = json.dumps({"offerId": str(offer_id)}, ensure_ascii=False)
        result = await self._call_api(
            "product_info",
            biz_params={"offerDetailParam": biz_param},
        )

        if result.get("success"):
            raw_data = result.get("data", {})
            product = self._parse_product_info(raw_data, offer_id)
            product["collect_method"] = "alibaba_api"
            product["offer_id"] = offer_id
            return product

        # 降级：尝试通用版API
        logger.info(f"[1688 API] 分销版失败，尝试通用版API: offerId={offer_id}")
        biz_param2 = json.dumps({"productId": str(offer_id)}, ensure_ascii=False)
        result2 = await self._call_api(
            "product_detail",
            biz_params={"productDetailParam": biz_param2},
        )

        if result2.get("success"):
            raw_data = result2.get("data", {})
            product = self._parse_product_info(raw_data, offer_id)
            product["collect_method"] = "alibaba_api_v2"
            product["offer_id"] = offer_id
            return product

        return {
            "success": False,
            "offer_id": offer_id,
            "error": result.get("error_message", "API调用失败"),
        }

    def _parse_product_info(self, raw_data: Dict[str, Any], offer_id: str) -> Dict[str, Any]:
        """
        解析1688 API返回的商品数据为统一格式

        Args:
            raw_data: API原始返回
            offer_id: 商品ID

        Returns:
            标准化的商品数据
        """
        # 从不同API响应结构中提取商品数据
        product = raw_data.get("result") or raw_data.get("productInfo") or raw_data.get("product") or raw_data

        # 解析图片列表
        images = []
        image_list = product.get("imageUrls") or product.get("images") or []
        if isinstance(image_list, list):
            for img in image_list:
                img_url = img if isinstance(img, str) else img.get("imageUrl", "")
                if img_url:
                    # 补全 https 前缀
                    if img_url.startswith("//"):
                        img_url = "https:" + img_url
                    # 去除缩略图后缀，获取原图
                    img_url = re.sub(r"_\d+x\d+\.", ".", img_url)
                    images.append(img_url)

        # 解析价格
        price = "0"
        price_range = ""
        price_obj = product.get("price") or product.get("saleInfo", {}).get("price") if isinstance(product.get("saleInfo"), dict) else None
        if isinstance(price_obj, (int, float)):
            price = str(price_obj)
        elif isinstance(price_obj, str):
            price = price_obj
        elif isinstance(price_obj, dict):
            price = str(price_obj.get("price", "0"))
            if "priceRange" in price_obj:
                price_range = str(price_obj["priceRange"])

        # 解析SKU列表
        skus = []
        sku_list = product.get("skuInfos") or product.get("skus") or []
        if isinstance(sku_list, list):
            for sku in sku_list:
                if isinstance(sku, dict):
                    sku_name = sku.get("attributes") or sku.get("name", "")
                    if isinstance(sku_name, list):
                        # 属性列表格式
                        sku_name = "/".join(
                            attr.get("attributeValueName", "") if isinstance(attr, dict) else str(attr)
                            for attr in sku_name
                        )
                    skus.append({
                        "sku_id": sku.get("skuId", ""),
                        "name": sku_name,
                        "price": sku.get("price", "0"),
                        "stock": sku.get("amountOnSale", 0),
                    })

        # 解析属性
        attributes = {}
        attr_list = product.get("attributes") or product.get("productFeatureList") or []
        if isinstance(attr_list, list):
            for attr in attr_list:
                if isinstance(attr, dict):
                    key = attr.get("attributeName") or attr.get("name", "")
                    value = attr.get("attributeValueName") or attr.get("value", "")
                    if key and value:
                        attributes[key] = value

        # 解析供应商
        supplier = {}
        supplier_info = product.get("supplierInfo") or product.get("sellerInfo") or {}
        if isinstance(supplier_info, dict):
            supplier = {
                "name": supplier_info.get("companyName") or supplier_info.get("shopName", ""),
                "url": supplier_info.get("shopUrl", ""),
                "rating": supplier_info.get("creditRating", 0),
                "years": supplier_info.get("yearsOnPlatform", 0),
                "member_type": supplier_info.get("memberType", ""),
            }

        return {
            "success": True,
            "title": product.get("subject") or product.get("title", ""),
            "price": price,
            "price_range": price_range,
            "images": images[:10],  # 最多10张图
            "skus": skus,
            "attributes": attributes,
            "supplier": supplier,
            "weight": float(product.get("weight", 0) or 0),
            "details": product.get("description", ""),
            "source_url": f"https://detail.1688.com/offer/{offer_id}.html",
        }

    # ========================================
    # 搜索商品
    # ========================================
    async def search_products(
        self,
        keyword: str,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """
        通过1688开放平台API搜索商品

        Args:
            keyword: 搜索关键词
            page: 页码
            page_size: 每页数量

        Returns:
            搜索结果
        """
        logger.info(f"[1688 API] 搜索商品: keyword={keyword}, page={page}")

        # 搜索API需要特定参数格式
        biz_param = json.dumps({
            "keywords": keyword,
            "pageNo": page,
            "pageSize": page_size,
        }, ensure_ascii=False)
        
        result = await self._call_api(
            "product_search",
            biz_params={"productSearchParam": biz_param},
        )

        if result.get("success"):
            raw_data = result.get("data", {})
            items = self._parse_search_results(raw_data)
            return {
                "success": True,
                "keyword": keyword,
                "page": page,
                "page_size": page_size,
                "items": items,
                "collect_method": "alibaba_api",
            }

        return {
            "success": False,
            "keyword": keyword,
            "items": [],
            "error": result.get("error_message", "搜索失败"),
        }

    def _parse_search_results(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """解析搜索结果"""
        items = []
        result_list = raw_data.get("result") or raw_data.get("items") or raw_data.get("products") or []

        if not isinstance(result_list, list):
            return items

        for item in result_list[:20]:
            if not isinstance(item, dict):
                continue

            offer_id = str(item.get("offerId") or item.get("productId", ""))
            title = item.get("subject") or item.get("title", "")
            price = str(item.get("price", "0"))
            image = item.get("imageUrl") or item.get("imageUrls", [""])[0] if isinstance(item.get("imageUrls"), list) else ""

            if image and image.startswith("//"):
                image = "https:" + image

            items.append({
                "offer_id": offer_id,
                "title": title,
                "price": price,
                "image": image,
                "url": f"https://detail.1688.com/offer/{offer_id}.html" if offer_id else "",
            })

        return items

    # ========================================
    # 便捷方法：采集商品（URL → 完整数据）
    # ========================================
    async def collect_by_url(self, url: str) -> Dict[str, Any]:
        """
        通过URL采集商品信息

        自动提取offerId，调用API获取详情

        Args:
            url: 1688商品链接

        Returns:
            商品完整数据
        """
        offer_id = self.extract_offer_id(url)
        if not offer_id:
            return {
                "success": False,
                "error": f"无法从链接中提取商品ID: {url}",
                "error_type": "invalid_url",
            }

        result = await self.get_product_info(offer_id)

        # 补充 source_url
        if result.get("success"):
            result["source_url"] = url
            result["offer_id"] = offer_id

        return result


# 全局实例
alibaba_1688_service = Alibaba1688Service()


# ========================================
# 诊断工具
# ========================================
def diagnose_1688_config() -> Dict[str, Any]:
    """
    诊断1688 API配置问题
    
    Returns:
        诊断结果和建议
    """
    from app.core.config import settings
    
    results = {
        "configured": {
            "app_key": bool(settings.ALIBABA_APP_KEY),
            "app_secret": bool(settings.ALIBABA_APP_SECRET),
            "access_token": bool(settings.ALIBABA_ACCESS_TOKEN),
        },
        "issues": [],
        "suggestions": []
    }
    
    # 检查配置完整性
    if not all(results["configured"].values()):
        missing = [k for k, v in results["configured"].items() if not v]
        results["issues"].append(f"缺少配置: {', '.join(missing)}")
        results["suggestions"].append("请在.env文件中配置 ALIBABA_APP_KEY, ALIBABA_APP_SECRET, ALIBABA_ACCESS_TOKEN")
        return results
    
    # 检查AppKey
    if settings.ALIBABA_APP_KEY == "6340034":
        results["issues"].append("使用测试AppKey，可能无法调用分销API")
        results["suggestions"].append("分销API (alibaba.fenxiao.*) 需要正式授权的AppKey，请登录open.1688.com申请")
    
    # 检查Token格式
    if settings.ALIBABA_ACCESS_TOKEN and len(settings.ALIBABA_ACCESS_TOKEN) < 20:
        results["issues"].append("Access Token格式可能不正确")
        results["suggestions"].append("Access Token应该是36位UUID格式 (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)")
    
    return results
