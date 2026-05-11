"""
妙手ERP签名获取器
使用Playwright注入JS获取实时签名
"""

import asyncio
import json
import time
from typing import Optional, Dict, Any
from playwright.async_api import async_playwright, Page

class MiaoshouSignatureFetcher:
    """妙手ERP签名获取器"""
    
    BASE_URL = "https://erp.91miaoshou.com"
    
    def __init__(self):
        self.browser = None
        self.page: Optional[Page] = None
        self.signature_cache: Dict[str, str] = {}
        self.last_fetch_time: float = 0
        
    async def init(self):
        """初始化浏览器"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        self.page = await self.context.new_page()
        
    async def login(self, phone: str, password: str) -> bool:
        """
        登录妙手ERP
        
        Args:
            phone: 手机号
            password: 密码
            
        Returns:
            是否登录成功
        """
        try:
            await self.page.goto(f"{self.BASE_URL}/login", timeout=30000)
            await self.page.wait_for_load_state("networkidle", timeout=30000)
            await asyncio.sleep(2)
            
            # 等待登录表单
            await self.page.wait_for_selector('input[type="text"]', timeout=10000)
            
            # 输入账号密码
            await self.page.fill('input[type="text"]', phone)
            await asyncio.sleep(0.5)
            await self.page.fill('input[type="password"]', password)
            await asyncio.sleep(0.5)
            
            # 点击登录
            await self.page.click('button[type="submit"]')
            await asyncio.sleep(3)
            await self.page.wait_for_load_state("networkidle", timeout=30000)
            
            # 检查是否登录成功
            current_url = self.page.url
            print(f"登录后URL: {current_url}")
            
            return "login" not in current_url.lower()
            
        except Exception as e:
            print(f"登录失败: {e}")
            return False
    
    async def get_signature(self, url: str, method: str = "POST", body: str = "") -> Dict[str, str]:
        """
        获取请求签名
        
        Args:
            url: 完整URL
            method: 请求方法
            body: 请求体
            
        Returns:
            包含签名和时间戳的字典
        """
        timestamp = str(int(time.time()))
        
        # 注入JS获取签名
        js_code = f"""
        async () => {{
            // 尝试从页面中获取签名函数
            const timestamp = {timestamp};
            
            // 妙手ERP的签名函数可能在哪里
            let signature = null;
            
            // 方法1: 尝试全局函数
            if (typeof window.getSignature === 'function') {{
                signature = window.getSignature('{url}', '{body}', timestamp);
            }} else if (typeof window._getSignature === 'function') {{
                signature = window._getSignature('{url}', '{body}', timestamp);
            }} else if (typeof window.generateSignature === 'function') {{
                signature = window.generateSignature('{url}', '{body}', timestamp);
            }}
            
            // 方法2: 从axios实例获取
            if (!signature && window.axios) {{
                // axios可能有拦截器
            }}
            
            // 方法3: 模拟签名计算
            if (!signature) {{
                // 尝试MD5(timestamp + url + body)
                const crypto = window.crypto || window.msCrypto;
                if (crypto) {{
                    const data = timestamp + '{url}' + '{body}';
                    const encoder = new TextEncoder();
                    const dataBuffer = encoder.encode(data);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                }}
            }}
            
            return {{
                timestamp: timestamp,
                signature: signature,
                url: '{url}',
                body: '{body}'
            }};
        }}
        """
        
        try:
            result = await self.page.evaluate(js_code)
            return result
        except Exception as e:
            print(f"获取签名失败: {e}")
            return {"timestamp": timestamp, "signature": None, "error": str(e)}
    
    async def fetch_api(self, api_path: str, body: str = "", method: str = "POST") -> Dict[str, Any]:
        """
        发送API请求
        
        Args:
            api_path: API路径
            body: 请求体
            method: 请求方法
        """
        url = f"{self.BASE_URL}{api_path}"
        
        # 获取签名
        sig_info = await self.get_signature(url, method, body)
        
        # 构建请求头
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": self.BASE_URL,
            "Referer": f"{self.BASE_URL}/",
            "x-timestamp": sig_info.get("timestamp", str(int(time.time()))),
            "x-app-hippo": sig_info.get("signature", ""),
            "x-front-version": "1777027293625",
            "bx-v": "2.5.11",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        }
        
        # 使用Fetch API发送请求
        fetch_js = f"""
        async () => {{
            const options = {{
                method: '{method}',
                headers: {json.dumps(headers, ensure_ascii=False)},
            }};
            
            if ('{method}' === 'POST' && '{body}') {{
                options.body = '{body}';
            }}
            
            try {{
                const response = await fetch('{url}', options);
                const text = await response.text();
                let data;
                try {{
                    data = JSON.parse(text);
                }} catch (e) {{
                    data = {{ raw: text }};
                }}
                return {{
                    status: response.status,
                    ok: response.ok,
                    data: data
                }};
            }} catch (e) {{
                return {{
                    error: e.message
                }};
            }}
        }}
        """
        
        try:
            result = await self.page.evaluate(fetch_js)
            return result
        except Exception as e:
            return {"error": str(e)}
    
    async def search_collect_box(self, keyword: str = "", page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """搜索采集箱"""
        body = f"pageNo={page}&pageSize={page_size}&keyword={keyword}"
        return await self.fetch_api("/api/move/common_collect_box/searchDetailList", body)
    
    async def get_collect_item_info(self, detail_id: str) -> Dict[str, Any]:
        """获取采集商品详情"""
        body = f"detailId={detail_id}"
        return await self.fetch_api("/api/platform/tiktok/move/collect_box/getCollectItemInfo", body)
    
    async def close(self):
        """关闭浏览器"""
        if self.browser:
            await self.browser.close()


async def main():
    """测试函数"""
    fetcher = MiaoshouSignatureFetcher()
    
    try:
        await fetcher.init()
        
        # 登录（需要真实的妙手账号）
        print("请确保已登录妙手ERP，或者提供账号密码登录")
        print("当前测试：使用已有登录状态获取签名...")
        
        # 访问主页建立连接
        await fetcher.page.goto(fetcher.BASE_URL)
        await asyncio.sleep(3)
        
        # 测试获取签名
        sig_info = await fetcher.get_signature(
            "https://erp.91miaoshou.com/api/move/common_collect_box/searchDetailList",
            "POST",
            "pageNo=1&pageSize=20"
        )
        print(f"签名信息: {sig_info}")
        
        # 测试API调用
        result = await fetcher.search_collect_box()
        print(f"API结果: {json.dumps(result, ensure_ascii=False, indent=2)[:500]}")
        
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await fetcher.close()


if __name__ == "__main__":
    asyncio.run(main())
