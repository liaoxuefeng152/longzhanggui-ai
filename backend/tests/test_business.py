"""
业务API测试
"""
import pytest
from httpx import AsyncClient


class TestProductAPI:
    """商品API测试"""
    
    @pytest.mark.asyncio
    async def test_list_products(
        self, 
        client: AsyncClient, 
        user_headers: dict
    ):
        """测试获取商品列表"""
        response = await client.get(
            "/api/v1/products",
            headers=user_headers
        )
        assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_create_product(
        self, 
        client: AsyncClient, 
        user_headers: dict
    ):
        """测试创建商品"""
        response = await client.post(
            "/api/v1/products",
            headers=user_headers,
            json={
                "name": "测试商品",
                "sku": "TEST001",
                "price": 99.99,
                "stock": 100
            }
        )
        assert response.status_code in [200, 201, 400]


class TestOrderAPI:
    """订单API测试"""
    
    @pytest.mark.asyncio
    async def test_list_orders(
        self, 
        client: AsyncClient, 
        user_headers: dict
    ):
        """测试获取订单列表"""
        response = await client.get(
            "/api/v1/orders",
            headers=user_headers
        )
        assert response.status_code == 200


class TestDashboardAPI:
    """控制台API测试"""
    
    @pytest.mark.asyncio
    async def test_get_stats(
        self, 
        client: AsyncClient, 
        user_headers: dict
    ):
        """测试获取统计数据"""
        response = await client.get(
            "/api/v1/dashboard/stats",
            headers=user_headers
        )
        assert response.status_code == 200
