"""
平台API对接服务
支持TikTok Shop和Amazon SP-API
"""
import time
import hashlib
import hmac
import json
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from enum import Enum

import httpx
from loguru import logger

from app.core.config import settings


class Platform(str, Enum):
    """平台类型"""
    TIKTOK = "tiktok"
    AMAZON = "amazon"
    SHOPEE = "shopee"
    LAZADA = "lazada"


class PlatformConfig:
    """平台配置"""
    
    # TikTok Shop配置
    TIKTOK_BASE_URL = "https://open-api.tiktokglobalshop.com"
    TIKTOK_AUTH_URL = "https://auth.tiktok-shops.com"
    
    # Amazon SP-API配置
    AMAZON_BASE_URL = "https://sellingpartnerapi-na.amazon.com"
    AMAZON_AUTH_URL = "https://api.amazon.com"
    
    # 区域端点
    TIKTOK_REGIONS = {
        "id": "https://open-api.tiktokglobalshop.com",  # 印尼
        "th": "https://open-api.tiktokglobalshop.com",  # 泰国
        "vn": "https://open-api.tiktokglobalshop.com",  # 越南
        "my": "https://open-api.tiktokglobalshop.com",  # 马来西亚
        "ph": "https://open-api.tiktokglobalshop.com",  # 菲律宾
    }
    
    AMAZON_REGIONS = {
        "us": "https://sellingpartnerapi-na.amazon.com",
        "eu": "https://sellingpartnerapi-eu.amazon.com",
        "fe": "https://sellingpartnerapi-fe.amazon.com",
    }


class TikTokShopService:
    """TikTok Shop API服务"""
    
    def __init__(self, app_key: str = None, app_secret: str = None, access_token: str = None):
        self.app_key = app_key or settings.FEISHU_APP_ID  # 模拟使用
        self.app_secret = app_secret or settings.FEISHU_APP_SECRET
        self.access_token = access_token
        self.base_url = PlatformConfig.TIKTOK_BASE_URL
    
    def _generate_signature(self, path: str, params: Dict[str, Any]) -> str:
        """生成API签名"""
        # 排序参数
        sorted_params = sorted(params.items())
        sign_string = self.app_secret + path + ''.join([f"{k}{v}" for k, v in sorted_params]) + self.app_secret
        
        # HMAC-SHA256签名
        return hmac.new(
            self.app_secret.encode(),
            sign_string.encode(),
            hashlib.sha256
        ).hexdigest()
    
    async def _request(self, method: str, path: str, params: Dict = None, data: Dict = None) -> Dict:
        """发送API请求"""
        # 添加公共参数
        if params is None:
            params = {}
        
        params.update({
            "app_key": self.app_key,
            "timestamp": int(time.time()),
            "access_token": self.access_token or "",
        })
        
        # 生成签名
        params["sign"] = self._generate_signature(path, params)
        
        # 模拟模式
        if not self.app_key or self.app_key == settings.FEISHU_APP_ID:
            logger.info(f"[模拟] TikTok API请求: {method} {path}")
            return self._mock_response(path, params)
        
        async with httpx.AsyncClient() as client:
            if method == "GET":
                response = await client.get(f"{self.base_url}{path}", params=params)
            else:
                response = await client.post(f"{self.base_url}{path}", params=params, json=data)
            
            return response.json()
    
    def _mock_response(self, path: str, params: Dict) -> Dict:
        """模拟响应"""
        if "orders" in path:
            return {
                "code": 0,
                "data": {
                    "orders": [
                        {
                            "order_id": f"TK{int(time.time())}001",
                            "order_status": "AWAITING_SHIPMENT",
                            "create_time": int(time.time()),
                            "buyer_info": {
                                "buyer_user_id": "user001",
                                "buyer_username": "test_buyer"
                            },
                            "item_list": [
                                {
                                    "item_id": "item001",
                                    "sku_id": "sku001",
                                    "product_name": "测试商品",
                                    "quantity": 1,
                                    "sale_price": {"currency": "USD", "value": "29.99"}
                                }
                            ],
                            "payment_info": {
                                "total_amount": "29.99",
                                "currency": "USD"
                            }
                        }
                    ]
                }
            }
        elif "products" in path:
            return {
                "code": 0,
                "data": {
                    "products": [
                        {
                            "product_id": "prod001",
                            "title": "测试商品",
                            "description": "商品描述",
                            "category_id": "cat001",
                            "price": {"currency": "USD", "value": "29.99"},
                            "stock_info": {"quantity": 100}
                        }
                    ]
                }
            }
        return {"code": 0, "data": {}}
    
    async def get_orders(
        self,
        start_time: datetime = None,
        end_time: datetime = None,
        order_status: str = None,
        page_size: int = 50
    ) -> List[Dict]:
        """获取订单列表"""
        params = {
            "page_size": page_size,
        }
        
        if start_time:
            params["create_time_from"] = int(start_time.timestamp())
        if end_time:
            params["create_time_to"] = int(end_time.timestamp())
        if order_status:
            params["order_status"] = order_status
        
        response = await self._request("GET", "/api/orders/search", params)
        
        if response.get("code") == 0:
            return response.get("data", {}).get("orders", [])
        return []
    
    async def get_order_detail(self, order_id: str) -> Optional[Dict]:
        """获取订单详情"""
        response = await self._request("GET", f"/api/orders/{order_id}")
        
        if response.get("code") == 0:
            return response.get("data", {})
        return None
    
    async def get_products(self, page_size: int = 50) -> List[Dict]:
        """获取商品列表"""
        params = {"page_size": page_size}
        response = await self._request("GET", "/api/products/search", params)
        
        if response.get("code") == 0:
            return response.get("data", {}).get("products", [])
        return []
    
    async def create_product(self, product_data: Dict) -> Optional[str]:
        """创建商品"""
        response = await self._request("POST", "/api/products/create", data=product_data)
        
        if response.get("code") == 0:
            return response.get("data", {}).get("product_id")
        return None
    
    async def update_product(self, product_id: str, product_data: Dict) -> bool:
        """更新商品"""
        response = await self._request("POST", f"/api/products/{product_id}/update", data=product_data)
        return response.get("code") == 0
    
    async def update_inventory(self, sku_id: str, quantity: int) -> bool:
        """更新库存"""
        data = {"sku_id": sku_id, "quantity": quantity}
        response = await self._request("POST", "/api/inventory/update", data=data)
        return response.get("code") == 0
    
    async def ship_order(self, order_id: str, tracking_number: str, carrier: str) -> bool:
        """订单发货"""
        data = {
            "order_id": order_id,
            "tracking_number": tracking_number,
            "carrier": carrier
        }
        response = await self._request("POST", "/api/orders/ship", data=data)
        return response.get("code") == 0


class AmazonSPAPIService:
    """Amazon SP-API服务"""
    
    def __init__(self, client_id: str = None, client_secret: str = None, refresh_token: str = None):
        self.client_id = client_id
        self.client_secret = client_secret
        self.refresh_token = refresh_token
        self.base_url = PlatformConfig.AMAZON_BASE_URL
        self._access_token = None
        self._token_expire = 0
    
    async def get_access_token(self) -> str:
        """获取访问令牌"""
        if self._access_token and time.time() < self._token_expire:
            return self._access_token
        
        # 模拟模式
        if not self.client_id:
            logger.info("[模拟] Amazon获取访问令牌")
            self._access_token = "mock_amazon_token"
            self._token_expire = time.time() + 3600
            return self._access_token
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PlatformConfig.AMAZON_AUTH_URL}/auth/o2/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": self.refresh_token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                }
            )
            
            data = response.json()
            self._access_token = data.get("access_token")
            self._token_expire = time.time() + data.get("expires_in", 3600) - 300
            return self._access_token
    
    async def _request(self, method: str, path: str, params: Dict = None, data: Dict = None) -> Dict:
        """发送API请求"""
        token = await self.get_access_token()
        
        # 模拟模式
        if token == "mock_amazon_token":
            logger.info(f"[模拟] Amazon SP-API请求: {method} {path}")
            return self._mock_response(path)
        
        async with httpx.AsyncClient() as client:
            headers = {
                "x-amz-access-token": token,
                "Content-Type": "application/json"
            }
            
            if method == "GET":
                response = await client.get(f"{self.base_url}{path}", headers=headers, params=params)
            else:
                response = await client.post(f"{self.base_url}{path}", headers=headers, json=data)
            
            return response.json()
    
    def _mock_response(self, path: str) -> Dict:
        """模拟响应"""
        if "orders" in path:
            return {
                "payload": {
                    "Orders": [
                        {
                            "AmazonOrderId": f"AMZ{int(time.time())}001",
                            "OrderStatus": "Shipped",
                            "PurchaseDate": datetime.now().isoformat(),
                            "BuyerInfo": {
                                "BuyerName": "Test Buyer",
                                "BuyerEmail": "test@example.com"
                            },
                            "OrderTotal": {"CurrencyCode": "USD", "Amount": "49.99"}
                        }
                    ]
                }
            }
        elif "catalogItems" in path:
            return {
                "payload": {
                    "Item": {
                        "Identifiers": {
                            "MarketplaceASIN": {"ASIN": "B0XXXXXXXX"}
                        },
                        "AttributeSets": {
                            "Title": "测试商品",
                            "ListPrice": {"CurrencyCode": "USD", "Amount": "49.99"}
                        }
                    }
                }
            }
        return {"payload": {}}
    
    async def get_orders(
        self,
        created_after: datetime = None,
        order_statuses: List[str] = None,
        max_results: int = 50
    ) -> List[Dict]:
        """获取订单列表"""
        params = {"MaxResultsPerPage": max_results}
        
        if created_after:
            params["CreatedAfter"] = created_after.isoformat()
        if order_statuses:
            params["OrderStatuses"] = ",".join(order_statuses)
        
        response = await self._request("GET", "/orders/v0/orders", params)
        
        return response.get("payload", {}).get("Orders", [])
    
    async def get_order_items(self, order_id: str) -> List[Dict]:
        """获取订单商品"""
        response = await self._request("GET", f"/orders/v0/orders/{order_id}/orderItems")
        
        return response.get("payload", {}).get("OrderItems", [])
    
    async def get_catalog_item(self, asin: str) -> Optional[Dict]:
        """获取商品信息"""
        response = await self._request("GET", f"/catalog/v0/items/{asin}")
        
        return response.get("payload", {}).get("Item")
    
    async def update_inventory(self, sku: str, quantity: int) -> bool:
        """更新库存"""
        data = {
            "body": {
                "inventory": [
                    {
                        "sellerSku": sku,
                        "quantity": quantity
                    }
                ]
            }
        }
        response = await self._request("POST", "/inventory/v0/inventory", data=data)
        return response.get("payload", {}).get("sku", "") == sku
    
    async def create_listing(self, listing_data: Dict) -> Optional[str]:
        """创建商品Listing"""
        response = await self._request("POST", "/listings/v0/listings", data=listing_data)
        
        return response.get("payload", {}).get("sku")


class PlatformServiceFactory:
    """平台服务工厂"""
    
    @staticmethod
    def create_tiktok_service(
        app_key: str = None,
        app_secret: str = None,
        access_token: str = None
    ) -> TikTokShopService:
        """创建TikTok Shop服务"""
        return TikTokShopService(app_key, app_secret, access_token)
    
    @staticmethod
    def create_amazon_service(
        client_id: str = None,
        client_secret: str = None,
        refresh_token: str = None
    ) -> AmazonSPAPIService:
        """创建Amazon SP-API服务"""
        return AmazonSPAPIService(client_id, client_secret, refresh_token)
    
    @staticmethod
    def get_service(platform: Platform, **kwargs):
        """根据平台获取对应服务"""
        if platform == Platform.TIKTOK:
            return PlatformServiceFactory.create_tiktok_service(**kwargs)
        elif platform == Platform.AMAZON:
            return PlatformServiceFactory.create_amazon_service(**kwargs)
        else:
            raise ValueError(f"不支持的平台: {platform}")


# 全局实例
tiktok_service = TikTokShopService()
amazon_service = AmazonSPAPIService()
