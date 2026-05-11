"""
妙手ERP对接服务
使用 Playwright 注入JS实时获取签名和认证token
"""

import asyncio
import hashlib
import json
import re
from typing import Optional, Dict, Any
from playwright.async_api import async_playwright, Page, BrowserContext

class MiaoshouClient:
    """妙手ERP API客户端"""
    
    BASE_URL = "https://erp.91miaoshou.com"
    
    def __init__(self):
        self.browser = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.auth_token: Optional[str] = None
        
    async def init(self):
        """初始化浏览器"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"
        )
        self.page = await self.context.new_page()
        
    async def login(self, phone: str, password: str) -> Dict[str, Any]:
        """
        登录妙手ERP
        
        Args:
            phone: 手机号
            password: 密码
            
        Returns:
            登录结果，包含token和用户信息
        """
        # 注入JS获取登录所需的加密参数
        await self.page.goto(f"{self.BASE_URL}/login")
        await self.page.wait_for_load_state("networkidle")
        
        # 等待登录表单加载
        await self.page.wait_for_selector('input[type="text"]', timeout=10000)
        
        # 注入JS获取加密后的密码和签名
        encrypt_js = """
        async () => {
            // 获取密码加密函数（需要从页面JS中提取）
            const passwordInput = document.querySelector('input[type="password"]');
            const phoneInput = document.querySelector('input[type="text"]');
            
            return {
                hasPasswordInput: !!passwordInput,
                hasPhoneInput: !!phoneInput,
                pageUrl: window.location.href
            };
        }
        """
        
        result = await self.page.evaluate(encrypt_js)
        print(f"登录页面信息: {result}")
        
        # 填写登录表单
        await self.page.fill('input[type="text"]', phone)
        await self.page.fill('input[type="password"]', password)
        
        # 点击登录按钮
        await self.page.click('button[type="submit"]')
        
        # 等待登录完成
        await asyncio.sleep(3)
        await self.page.wait_for_load_state("networkidle")
        
        # 获取当前URL
        current_url = self.page.url
        print(f"登录后URL: {current_url}")
        
        # 从localStorage获取token
        storage = await self.context.storage_state()
        local_storage = storage.get('cookies', [])
        
        # 查找authorization-token
        for cookie in local_storage:
            if 'authorization' in cookie.get('name', '').lower():
                self.auth_token = cookie['value']
                break
        
        # 如果没找到，尝试从页面获取
        if not self.auth_token:
            token_js = """
            () => {
                // 尝试从各种地方获取token
                const token = localStorage.getItem('authorization-token') 
                    || localStorage.getItem('token')
                    || localStorage.getItem('auth-token');
                return token;
            }
            """
            self.auth_token = await self.page.evaluate(token_js)
        
        return {
            "success": True,
            "url": current_url,
            "has_token": bool(self.auth_token),
            "token": self.auth_token[:50] + "..." if self.auth_token else None
        }
    
    async def get_signature(self, url: str, body: str = "") -> Dict[str, str]:
        """
        获取请求签名
        
        Args:
            url: 请求URL
            body: 请求体
            
        Returns:
            包含签名和时间戳的字典
        """
        # 注入JS获取签名
        signature_js = f"""
        async () => {{
            // 尝试调用页面的签名函数
            // 妙手ERP的签名通常在某个全局函数中
            const timestamp = Math.floor(Date.now() / 1000);
            
            // 尝试获取签名函数
            let signature = null;
            if (typeof window._getSignature === 'function') {{
                signature = window._getSignature('{url}', '{body}', timestamp);
            }} else if (typeof window.getSignature === 'function') {{
                signature = window.getSignature('{url}', '{body}', timestamp);
            }}
            
            return {{
                timestamp: timestamp,
                signature: signature,
                url: '{url}',
                body: '{body}'
            }};
        }}
        """
        
        result = await self.page.evaluate(signature_js)
        return result
    
    async def fetch_with_auth(self, api_path: str, method: str = "POST", body: str = "") -> Dict[str, Any]:
        """
        使用注入的认证发送请求
        
        Args:
            api_path: API路径（如 /api/move/common_collect_box/searchDetailList）
            method: 请求方法
            body: 请求体
        """
        url = f"{self.BASE_URL}{api_path}"
        
        # 获取签名
        sig_info = await self.get_signature(url, body)
        
        # 准备headers
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-timestamp": str(sig_info.get("timestamp", "")),
            "x-app-hippo": sig_info.get("signature", ""),
            "x-front-version": "1777027293625",
            "bx-v": "2.5.11",
            "Origin": self.BASE_URL,
            "Referer": f"{self.BASE_URL}/"
        }
        
        if self.auth_token:
            headers["authorization-token"] = self.auth_token
        
        # 使用Fetch API发送请求
        fetch_js = f"""
        async () => {{
            const response = await fetch('{url}', {{
                method: '{method}',
                headers: {json.dumps(headers, ensure_ascii=False)},
                body: '{body}'
            }});
            
            const text = await response.text();
            let data;
            try {{
                data = JSON.parse(text);
            }} catch (e) {{
                data = {{ raw: text }};
            }}
            
            return {{
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data: data
            }};
        }}
        """
        
        result = await self.page.evaluate(fetch_js)
        return result
    
    async def search_collect_box(self, keyword: str = "", page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """
        搜索采集箱商品
        
        Args:
            keyword: 搜索关键词
            page: 页码
            page_size: 每页数量
        """
        body = f"keyword={keyword}&page={page}&pageSize={page_size}"
        return await self.fetch_with_auth(
            "/api/move/common_collect_box/searchDetailList",
            method="POST",
            body=body
        )
    
    async def get_collect_item_info(self, detail_id: str) -> Dict[str, Any]:
        """
        获取采集商品详情
        
        Args:
            detail_id: 商品详情ID
        """
        body = f"detailId={detail_id}"
        return await self.fetch_with_auth(
            "/api/platform/tiktok/move/collect_box/getCollectItemInfo",
            method="POST",
            body=body
        )
    
    async def close(self):
        """关闭浏览器"""
        if self.browser:
            await self.browser.close()


async def main():
    """测试主函数"""
    client = MiaoshouClient()
    
    try:
        # 初始化
        await client.init()
        
        # 登录（需要提供真实的妙手账号）
        # login_result = await client.login("your_phone", "your_password")
        # print(f"登录结果: {login_result}")
        
        # 如果已登录，直接获取数据
        # 先访问主页获取基础认证
        await client.page.goto(client.BASE_URL)
        await client.page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)
        
        # 尝试搜索采集箱
        result = await client.search_collect_box(keyword="")
        print(f"搜索结果: {json.dumps(result, ensure_ascii=False, indent=2)}")
        
    except Exception as e:
        print(f"错误: {e}")
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
