"""
智能体API测试
"""
import pytest
from httpx import AsyncClient


class TestAgentAPI:
    """智能体API测试"""
    
    @pytest.mark.asyncio
    async def test_list_agents(self, client: AsyncClient):
        """测试获取智能体列表"""
        response = await client.get("/api/v1/agents")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data["data"]
    
    @pytest.mark.asyncio
    async def test_get_agent_not_found(self, client: AsyncClient):
        """测试获取不存在的智能体"""
        response = await client.get("/api/v1/agents/99999")
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_list_models(
        self, 
        client: AsyncClient, 
        admin_headers: dict
    ):
        """测试获取模型列表"""
        response = await client.get(
            "/api/v1/models",
            headers=admin_headers
        )
        assert response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_list_prompts(
        self, 
        client: AsyncClient, 
        admin_headers: dict
    ):
        """测试获取提示词列表"""
        response = await client.get(
            "/api/v1/prompts",
            headers=admin_headers
        )
        assert response.status_code == 200
