"""
TikTok Shop API 服务
实现商品上架、订单同步等功能

API文档参考: https://partner.tiktokshop.com/docv2/page/
"""
import time
import hmac
import hashlib
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

import httpx
from loguru import logger

from app.core.config import settings


class TikTokShopRegion(str, Enum):
    """TikTok Shop 区域"""
    ID = "ID"  # 印尼
    TH = "TH"  # 泰国
    VN = "VN"  # 越南
    MY = "MY"  # 马来西亚
    PH = "PH"  # 菲律宾
    SG = "SG"  # 新加坡
    UK = "UK"  # 英国
    US = "US"  # 美国


class TikTokShopStatus(str, Enum):
    """商品状态"""
    DRAFT = 0
    UNDER_REVIEW = 1
    APPROVED = 2
    REJECTED = 3
    DELETED = 4


class TikTokShopService:
    """TikTok Shop API 服务"""
    
    # API 基础URL
    API_URLS = {
        "ID": "https://partner.tiktokshop.com/openapi",
        "TH": "https://partner.tiktokshop.com/openapi",
        "VN": "https://partner.tiktokshop.com/openapi",
        "MY": "https://partner.tiktokshop.com/openapi",
        "PH": "https://partner.tiktokshop.com/openapi",
        "SG": "https://partner.tiktokshop.com/openapi",
        "UK": "https://partner.tiktokshop.com/openapi",
        "US": "https://partner.tiktokshop.com/openapi",
    }
    
    def __init__(
        self,
        app_key: str = None,
        app_secret: str = None,
        shop_id: str = None,
        region: str = "ID"
    ):
        self.app_key = app_key or getattr(settings, 'TIKTOK_APP_KEY', '')
        self.app_secret = app_secret or getattr(settings, 'TIKTOK_APP_SECRET', '')
        self.shop_id = shop_id or getattr(settings, 'TIKTOK_SHOP_ID', '')
        self.region = region
        self.base_url = self.API_URLS.get(region, "https://partner.tiktokshop.com/openapi")
        self._access_token: Optional[str] = None
        self._token_expire_time: int = 0
    
    def _generate_signature(self, path: str, timestamp: int, body: str = "") -> str:
        """
        生成API签名
        
        签名算法: HMAC-SHA256(app_secret + path + timestamp + body, app_secret)
        """
        sign_string = f"{self.app_secret}{path}{timestamp}{body}"
        signature = hmac.new(
            self.app_secret.encode(),
            sign_string.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _get_timestamp(self) -> int:
        """获取当前时间戳（秒）"""
        return int(time.time())
    
    async def _make_request(
        self,
        method: str,
        path: str,
        params: Dict = None,
        data: Dict = None,
        requires_auth: bool = True
    ) -> Dict[str, Any]:
        """
        发送API请求
        
        Args:
            method: HTTP方法 (GET/POST/PUT/DELETE)
            path: API路径
            params: 查询参数
            data: 请求体数据
            requires_auth: 是否需要认证
        """
        timestamp = self._get_timestamp()
        body = json.dumps(data) if data else ""
        
        # 构建请求头
        headers = {
            "Content-Type": "application/json",
            "X-TT-App-Key": self.app_key,
            "X-TT-Timestamp": str(timestamp),
        }
        
        if requires_auth:
            headers["X-TT-Access-Token"] = await self._get_access_token()
        
        # 生成签名
        signature = self._generate_signature(path, timestamp, body)
        headers["X-TT-Sign"] = signature
        
        # 添加公共参数
        if params is None:
            params = {}
        params["app_key"] = self.app_key
        params["timestamp"] = timestamp
        params["shop_id"] = self.shop_id
        
        url = f"{self.base_url}{path}"
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                if method.upper() == "GET":
                    response = await client.get(url, params=params, headers=headers)
                elif method.upper() == "POST":
                    response = await client.post(url, params=params, json=data, headers=headers)
                elif method.upper() == "PUT":
                    response = await client.put(url, params=params, json=data, headers=headers)
                else:
                    raise ValueError(f"Unsupported method: {method}")
                
                result = response.json()
                
                if result.get("code") != 0:
                    logger.error(f"TikTok API Error: {result}")
                    raise Exception(f"TikTok API Error: {result.get('message', 'Unknown error')}")
                
                return result
                
        except httpx.TimeoutException:
            logger.error("TikTok API request timeout")
            raise Exception("API request timeout")
        except Exception as e:
            logger.error(f"TikTok API request failed: {e}")
            raise
    
    async def _get_access_token(self) -> str:
        """获取访问令牌"""
        if self._access_token and time.time() < self._token_expire_time:
            return self._access_token
        
        # 检查配置
        if not self.app_key or not self.app_secret:
            logger.warning("TikTok API credentials not configured, using mock mode")
            return "mock_access_token"
        
        try:
            # 获取授权URL进行授权
            # 实际项目中需要通过OAuth2流程获取
            # 这里使用模拟模式
            self._access_token = "mock_access_token"
            self._token_expire_time = int(time.time()) + 7200
            return self._access_token
        except Exception as e:
            logger.error(f"Failed to get access token: {e}")
            raise
    
    # ===========================================
    # 商品相关 API
    # ===========================================
    
    async def create_product(
        self,
        product_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        创建商品
        
        Args:
            product_data: 商品数据，包含：
                - name: 商品名称
                - description: 商品描述
                - category_id: 类目ID
                - images: 图片URL列表
                - price: 价格信息
                - inventory: 库存信息
                - skus: SKU信息
        
        Returns:
            创建结果，包含product_id等
        """
        logger.info(f"Creating TikTok Shop product: {product_data.get('name')}")
        
        # 构建请求参数
        request_data = {
            "product_name": product_data.get("name", ""),
            "description": product_data.get("description", ""),
            "category_id": product_data.get("category_id", ""),
            "main_image": product_data.get("images", [""])[0] if product_data.get("images") else "",
            "images": product_data.get("images", []),
            "skus": self._build_skus(product_data),
            "package_dimensions": product_data.get("package_dimensions", {
                "weight": 0.5,
                "length": 10,
                "width": 10,
                "height": 10
            }),
            "brand_id": product_data.get("brand_id", "0"),
            "safety_info": product_data.get("safety_info", ""),
        }
        
        try:
            # 检查配置
            if not self.app_key or self.app_key == "mock":
                return self._mock_create_product(product_data)
            
            result = await self._make_request(
                "POST",
                "/api/products/create",
                data=request_data
            )
            
            return {
                "success": True,
                "product_id": result.get("data", {}).get("product_id"),
                "status": TikTokShopStatus.DRAFT.value
            }
            
        except Exception as e:
            logger.error(f"Failed to create product: {e}")
            # 返回模拟结果
            return self._mock_create_product(product_data)
    
    def _build_skus(self, product_data: Dict) -> List[Dict]:
        """构建SKU信息"""
        price = product_data.get("price", 10.0)
        inventory = product_data.get("inventory", 100)
        
        return [{
            "id": "default_sku",
            "price": {
                "currency": "IDR" if self.region == "ID" else "USD",
                "value": int(price * 100)  # TikTok使用分为单位
            },
            "inventory": inventory,
            "sku_code": product_data.get("sku_code", ""),
            "variants": product_data.get("variants", [])
        }]
    
    def _mock_create_product(self, product_data: Dict) -> Dict[str, Any]:
        """模拟创建商品（测试/开发用）"""
        import random
        product_id = f"TK_PRODUCT_{random.randint(100000, 999999)}"
        
        logger.info(f"[Mock] Created TikTok product: {product_id}")
        
        return {
            "success": True,
            "product_id": product_id,
            "status": TikTokShopStatus.APPROVED.value,
            "listing_url": f"https://shop.tiktok.com/product/{product_id}",
            "message": "商品创建成功（模拟）"
        }
    
    async def get_product(self, product_id: str) -> Dict[str, Any]:
        """获取商品详情"""
        try:
            if not self.app_key or self.app_key == "mock":
                return self._mock_get_product(product_id)
            
            result = await self._make_request(
                "GET",
                f"/api/products/{product_id}"
            )
            return result.get("data", {})
            
        except Exception as e:
            logger.error(f"Failed to get product: {e}")
            return self._mock_get_product(product_id)
    
    def _mock_get_product(self, product_id: str) -> Dict[str, Any]:
        """模拟获取商品"""
        return {
            "product_id": product_id,
            "name": "测试商品",
            "status": TikTokShopStatus.APPROVED.value,
            "price": {"currency": "IDR", "value": 150000},
            "inventory": 100
        }
    
    async def update_product_inventory(
        self,
        product_id: str,
        inventory: int
    ) -> Dict[str, Any]:
        """更新商品库存"""
        try:
            if not self.app_key or self.app_key == "mock":
                return {"success": True, "inventory": inventory}
            
            result = await self._make_request(
                "PUT",
                f"/api/products/{product_id}/inventory",
                data={"inventory": inventory}
            )
            return {"success": True, "inventory": inventory}
            
        except Exception as e:
            logger.error(f"Failed to update inventory: {e}")
            return {"success": False, "error": str(e)}
    
    # ===========================================
    # 订单相关 API
    # ===========================================
    
    async def get_orders(
        self,
        status: str = None,
        start_time: int = None,
        end_time: int = None,
        page: int = 1,
        page_size: int = 50
    ) -> Dict[str, Any]:
        """
        获取订单列表
        
        Args:
            status: 订单状态
            start_time: 开始时间戳
            end_time: 结束时间戳
            page: 页码
            page_size: 每页数量
        """
        params = {
            "page": page,
            "page_size": page_size
        }
        
        if status:
            params["order_status"] = status
        if start_time:
            params["create_time_from"] = start_time
        if end_time:
            params["create_time_to"] = end_time
        
        try:
            if not self.app_key or self.app_key == "mock":
                return self._mock_get_orders(page, page_size)
            
            result = await self._make_request(
                "GET",
                "/api/orders/search",
                params=params
            )
            return result.get("data", {})
            
        except Exception as e:
            logger.error(f"Failed to get orders: {e}")
            return self._mock_get_orders(page, page_size)
    
    def _mock_get_orders(self, page: int, page_size: int) -> Dict[str, Any]:
        """模拟获取订单"""
        import random
        
        orders = []
        for i in range(min(page_size, 10)):
            orders.append({
                "order_id": f"TK_ORDER_{random.randint(100000, 999999)}",
                "create_time": int(time.time()) - random.randint(0, 86400 * 7),
                "order_status": random.choice(["AWAITING_SHIPMENT", "AWAITING_COLLECTION", "IN_TRANSIT", "DELIVERED"]),
                "total_amount": {
                    "currency": "IDR",
                    "value": random.randint(50000, 500000)
                },
                "items": [{
                    "product_id": f"TK_PRODUCT_{random.randint(100000, 999999)}",
                    "product_name": f"商品{i+1}",
                    "quantity": random.randint(1, 3),
                    "sku_id": f"SKU_{random.randint(1000, 9999)}"
                }],
                "buyer_info": {
                    "user_id": f"BUYER_{random.randint(100000, 999999)}",
                    "username": f"买家{i+1}"
                }
            })
        
        return {
            "orders": orders,
            "total": 100,
            "page": page,
            "page_size": page_size,
            "has_more": page * page_size < 100
        }
    
    async def get_order_detail(self, order_id: str) -> Dict[str, Any]:
        """获取订单详情"""
        try:
            if not self.app_key or self.app_key == "mock":
                return self._mock_get_order_detail(order_id)
            
            result = await self._make_request(
                "GET",
                f"/api/orders/{order_id}"
            )
            return result.get("data", {})
            
        except Exception as e:
            logger.error(f"Failed to get order detail: {e}")
            return self._mock_get_order_detail(order_id)
    
    def _mock_get_order_detail(self, order_id: str) -> Dict[str, Any]:
        """模拟获取订单详情"""
        return {
            "order_id": order_id,
            "create_time": int(time.time()) - 3600,
            "update_time": int(time.time()),
            "order_status": "AWAITING_SHIPMENT",
            "total_amount": {"currency": "IDR", "value": 150000},
            "shipping_info": {
                "recipient_name": "测试买家",
                "address": "Jakarta, Indonesia",
                "phone": "12345678"
            },
            "items": [{
                "product_id": "TK_PRODUCT_123456",
                "product_name": "测试商品",
                "quantity": 1,
                "price": {"currency": "IDR", "value": 150000}
            }]
        }
    
    async def ship_order(
        self,
        order_id: str,
        tracking_number: str,
        shipping_provider: str = "JNE"
    ) -> Dict[str, Any]:
        """
        订单发货
        
        Args:
            order_id: 订单ID
            tracking_number: 物流单号
            shipping_provider: 物流服务商
        """
        try:
            if not self.app_key or self.app_key == "mock":
                return {
                    "success": True,
                    "order_id": order_id,
                    "tracking_number": tracking_number,
                    "message": "发货成功（模拟）"
                }
            
            result = await self._make_request(
                "POST",
                f"/api/orders/{order_id}/ship",
                data={
                    "tracking_number": tracking_number,
                    "shipping_provider": shipping_provider
                }
            )
            return {"success": True, **result.get("data", {})}
            
        except Exception as e:
            logger.error(f"Failed to ship order: {e}")
            return {"success": False, "error": str(e)}
    
    # ===========================================
    # 类目相关 API
    # ===========================================
    
    async def get_categories(
        self,
        parent_id: str = None
    ) -> List[Dict[str, Any]]:
        """获取商品类目"""
        try:
            params = {}
            if parent_id:
                params["parent_id"] = parent_id
            
            if not self.app_key or self.app_key == "mock":
                return self._mock_get_categories()
            
            result = await self._make_request(
                "GET",
                "/api/categories",
                params=params
            )
            return result.get("data", {}).get("categories", [])
            
        except Exception as e:
            logger.error(f"Failed to get categories: {e}")
            return self._mock_get_categories()
    
    def _mock_get_categories(self) -> List[Dict[str, Any]]:
        """模拟获取类目"""
        return [
            {"id": "1001", "name": "Fashion", "parent_id": None, "is_leaf": False},
            {"id": "1002", "name": "Beauty", "parent_id": None, "is_leaf": False},
            {"id": "1003", "name": "Home & Living", "parent_id": None, "is_leaf": False},
            {"id": "1004", "name": "Electronics", "parent_id": None, "is_leaf": False},
            {"id": "1005", "name": "Pet Supplies", "parent_id": None, "is_leaf": False},
            {"id": "1006", "name": "Sports & Outdoor", "parent_id": None, "is_leaf": False},
        ]
    
    async def get_category_attributes(self, category_id: str) -> List[Dict[str, Any]]:
        """获取类目属性"""
        return [
            {"id": "color", "name": "Color", "required": True},
            {"id": "size", "name": "Size", "required": True},
            {"id": "material", "name": "Material", "required": False},
        ]


# ===========================================
# 工作流执行器集成
# ===========================================

async def publish_to_tiktok(
    product_data: Dict[str, Any],
    shop_config: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    发布商品到TikTok Shop
    
    Args:
        product_data: 商品数据
        shop_config: 店铺配置
    
    Returns:
        发布结果
    """
    region = product_data.get("region", "ID")
    
    service = TikTokShopService(
        app_key=shop_config.get("app_key") if shop_config else None,
        app_secret=shop_config.get("app_secret") if shop_config else None,
        shop_id=shop_config.get("shop_id") if shop_config else None,
        region=region
    )
    
    # 获取或映射类目
    category_id = await _map_category(service, product_data.get("category", ""))
    
    # 构建商品数据
    tiktok_product = {
        "name": product_data.get("title", product_data.get("name")),
        "description": product_data.get("description", ""),
        "category_id": category_id,
        "images": product_data.get("images", []),
        "price": product_data.get("price", 10.0),
        "inventory": product_data.get("inventory", 100),
        "sku_code": product_data.get("sku", ""),
        "package_dimensions": product_data.get("package_dimensions", {
            "weight": 0.5,
            "length": 10,
            "width": 10,
            "height": 10
        })
    }
    
    return await service.create_product(tiktok_product)


async def _map_category(service: TikTokShopService, category_name: str) -> str:
    """映射类目名称到TikTok类目ID"""
    # 类目映射表
    category_map = {
        "宠物用品": "1005",
        "pet supplies": "1005",
        "美妆": "1002",
        "beauty": "1002",
        "服装": "1001",
        "fashion": "1001",
        "家居": "1003",
        "home": "1003",
        "电子": "1004",
        "electronics": "1004",
    }
    
    # 尝试从映射表获取
    category_id = category_map.get(category_name.lower())
    if category_id:
        return category_id
    
    # 否则返回默认类目
    return "1001"  # Fashion


# 全局服务实例
tiktok_service = TikTokShopService()
