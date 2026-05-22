"""
1688 开放平台 API 客户端
负责签名算法和API请求调用

API签名算法: HMAC-SHA1
签名串格式: api_path_with_appkey + key1 + value1 + key2 + value2 + ...
签名参数名: _aop_signature

参考: 1688开放平台签名工具验证通过
"""
import hashlib
import hmac
import time
import json
import re
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

    # 支持的API接口（路径模板，末尾拼接appKey）
    APIS = {
        # 商品详情（分销版）- 截图中验证通过的接口
        "product_info": "param2/1/com.alibaba.fenxiao/alibaba.fenxiao.productInfo.get/",
        # 商品详情（通用版）
        "product_detail": "param2/1/com.alibaba.product/alibaba.product.get/",
        # 商品列表
        "product_list": "param2/1/com.alibaba.fenxiao/alibaba.fenxiao.products.get/",
        # 搜索商品
        "product_search": "param2/1/com.alibaba.fenxiao/alibaba.fenxiao.product.search/",
        # 供应商信息
        "supplier_info": "param2/1/com.alibaba.fenxiao/alibaba.fenxiao.supplier.get/",
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
    # 签名算法（1688开放平台 HMAC-SHA1 标准）
    # ========================================
    def _generate_signature(
        self,
        api_path_with_appkey: str,
        params: Dict[str, str],
    ) -> str:
        """
        生成1688 API签名（HMAC-SHA1算法）

        签名串格式: api_path_with_appkey + key1 + value1 + key2 + value2 + ...
        其中 key 按 ASCII 字母升序排列
        签名方法: hmac_sha1(appSecret, sign_str).hexdigest().upper()

        示例（来自1688签名工具）:
          sign_str = "param2/1/com.alibaba.fenxiao/alibaba.fenxiao.productInfo.get/6340034access_token2d11660b-2f2f-4bba-ace4-7c46910588d7offerId744527345183"
          signature = hmac_sha1("W40WVLd7i8X", sign_str).hexdigest().upper()

        Args:
            api_path_with_appkey: API路径（含末尾appKey）
            params: 请求参数（不含签名相关参数）

        Returns:
            签名字符串（大写十六进制）
        """
        # 构建签名串：api_path（含appKey）+ 按key排序的参数
        sign_str = api_path_with_appkey

        # 按 key 字母升序排列参数
        for key in sorted(params.keys()):
            sign_str += str(key) + str(params[key])

        logger.info(f"[1688签名] 签名串: {sign_str[:300]}")

        # HMAC-SHA1 签名
        signature = hmac.new(
            self.app_secret.encode("utf-8"),
            sign_str.encode("utf-8"),
            hashlib.sha1,
        ).hexdigest().upper()

        logger.info(f"[1688签名] 签名结果: {signature}")
        return signature

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

        # 获取API路径模板
        api_path_template = self.APIS.get(api_name)
        if not api_path_template:
            raise ValueError(f"不支持的API: {api_name}")

        # 拼接完整路径：api_path + appKey
        api_path_with_appkey = api_path_template + self.app_key
        url = f"{self.GATEWAY_URL}/{api_path_with_appkey}"

        # 只传业务参数 + access_token（不传 _aop_timestamp 等额外参数，与官方调试工具一致）
        params: Dict[str, str] = {
            "access_token": self.access_token,
        }
        if biz_params:
            for key, value in biz_params.items():
                params[key] = str(value)

        # 生成 HMAC-SHA1 签名
        signature = self._generate_signature(api_path_with_appkey, params)
        params["_aop_signature"] = signature

        # 调试日志
        logger.info(f"[1688 API] 请求URL: {url}")
        logger.info(f"[1688 API] 参数keys: {list(params.keys())}")

        # 发送请求
        client = await self._get_client()
        try:
            response = await client.get(url, params=params)
            logger.info(f"[1688 API] 响应状态: {response.status_code}")
            resp_text = response.text[:2000]
            logger.info(f"[1688 API] 响应内容: {resp_text}")
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
            try:
                error_data = e.response.json()
                error_code = error_data.get("error_code", "HTTP_ERROR")
                error_msg = error_data.get("error_message") or error_data.get("exception", str(e))
                logger.error(f"1688 API业务错误: code={error_code}, msg={error_msg}")
                return {"success": False, "error_code": error_code, "error_message": error_msg}
            except Exception:
                logger.error(f"1688 API HTTP错误: {e.response.status_code}")
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
        - ?offerId=123456789
        """
        # offer/xxx.html 格式
        match = re.search(r"offer/[\w-]*?(\d+)\.html?", url)
        if match:
            return match.group(1)

        # offerId=xxx 格式
        parsed = urlparse(url)
        query = parse_qs(parsed.query)
        if "offerId" in query:
            return query["offerId"][0]

        # 纯数字路径
        match = re.search(r"/(\d{10,})\.html?", url)
        if match:
            return match.group(1)

        return None

    # ========================================
    # 商品采集
    # ========================================
    async def get_product_info(self, offer_id: str) -> Dict[str, Any]:
        """
        通过1688开放平台API获取商品详情（分销版）
        """
        logger.info(f"[1688 API] 获取商品详情: offerId={offer_id}")

        result = await self._call_api(
            "product_info",
            biz_params={"offerId": offer_id},
        )

        if result.get("success"):
            raw_data = result.get("data", {})
            product = self._parse_product_info(raw_data, offer_id)
            product["collect_method"] = "alibaba_api"
            product["offer_id"] = offer_id
            return product

        # 降级：尝试通用版API
        logger.info(f"[1688 API] 分销版失败，尝试通用版API: offerId={offer_id}")
        result2 = await self._call_api(
            "product_detail",
            biz_params={"productId": offer_id},
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
        """解析1688 API返回的商品数据为统一格式"""
        # 从不同API响应结构中提取商品数据
        product = raw_data.get("result") or raw_data.get("productInfo") or raw_data.get("product") or raw_data

        # 如果result是嵌套结构，继续深入
        if isinstance(product, dict):
            inner = product.get("result") or product.get("productInfo") or product.get("product")
            if inner and isinstance(inner, dict):
                product = inner

        # 解析图片列表
        images = []
        image_list = product.get("imageUrls") or product.get("images") or []
        if isinstance(image_list, list):
            for img in image_list:
                img_url = img if isinstance(img, str) else img.get("imageUrl", "")
                if img_url:
                    if img_url.startswith("//"):
                        img_url = "https:" + img_url
                    # 去除缩略图后缀，获取原图
                    img_url = re.sub(r"_\d+x\d+\.", ".", img_url)
                    images.append(img_url)

        # 解析价格
        price = "0"
        price_range = ""
        price_obj = product.get("price") or (product.get("saleInfo", {}).get("price") if isinstance(product.get("saleInfo"), dict) else None)
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
            "images": images[:10],
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
        """通过1688开放平台API搜索商品"""
        logger.info(f"[1688 API] 搜索商品: keyword={keyword}, page={page}")

        result = await self._call_api(
            "product_search",
            biz_params={
                "keywords": keyword,
                "pageNo": page,
                "pageSize": page_size,
            },
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

        if isinstance(result_list, list):
            for item in result_list[:20]:
                if isinstance(item, dict):
                    offer_id = str(item.get("offerId") or item.get("productId", ""))
                    items.append({
                        "offer_id": offer_id,
                        "title": item.get("subject") or item.get("title", ""),
                        "price": str(item.get("price", "0")),
                        "image": item.get("imageUrl") or (item.get("imageUrls", [""])[0] if isinstance(item.get("imageUrls"), list) else ""),
                        "source_url": f"https://detail.1688.com/offer/{offer_id}.html" if offer_id else "",
                    })

        return items

    # ========================================
    # 供应商查询
    # ========================================
    async def get_supplier_info(self, supplier_id: str) -> Dict[str, Any]:
        """获取供应商信息"""
        logger.info(f"[1688 API] 获取供应商信息: supplierId={supplier_id}")

        result = await self._call_api(
            "supplier_info",
            biz_params={"supplierId": supplier_id},
        )

        if result.get("success"):
            raw_data = result.get("data", {})
            supplier = raw_data.get("result") or raw_data.get("supplierInfo") or raw_data
            return {
                "success": True,
                "supplier_id": supplier_id,
                "name": supplier.get("companyName") or supplier.get("shopName", ""),
                "rating": supplier.get("creditRating", 0),
                "years": supplier.get("yearsOnPlatform", 0),
                "member_type": supplier.get("memberType", ""),
                "main_products": supplier.get("mainProducts", ""),
            }

        return {
            "success": False,
            "supplier_id": supplier_id,
            "error": result.get("error_message", "获取供应商信息失败"),
        }


# 全局单例
alibaba_1688_service = Alibaba1688Service()
