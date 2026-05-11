"""
认证API测试
"""
import pytest
from httpx import AsyncClient


class TestAuthAPI:
    """认证API测试"""
    
    @pytest.mark.asyncio
    async def test_send_sms(self, client: AsyncClient):
        """测试发送短信验证码"""
        response = await client.post(
            "/api/v1/auth/send-sms",
            json={"phone": "13800138000"}
        )
        assert response.status_code in [200, 400]  # 可能已发送
    
    @pytest.mark.asyncio
    async def test_register(self, client: AsyncClient):
        """测试用户注册"""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "phone": "13900139000",
                "password": "Test123456",
                "nickname": "测试用户"
            }
        )
        assert response.status_code in [200, 400]
    
    @pytest.mark.asyncio
    async def test_login_invalid_user(self, client: AsyncClient):
        """测试无效用户登录"""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "phone": "99999999999",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 400
    
    @pytest.mark.asyncio
    async def test_get_profile_unauthorized(self, client: AsyncClient):
        """测试未授权获取用户信息"""
        response = await client.get("/api/v1/auth/profile")
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_get_profile_authorized(
        self, 
        client: AsyncClient, 
        user_headers: dict
    ):
        """测试授权获取用户信息"""
        response = await client.get(
            "/api/v1/auth/profile",
            headers=user_headers
        )
        assert response.status_code == 200
