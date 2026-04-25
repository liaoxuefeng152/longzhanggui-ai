"""
妙手ERP API客户端 - 采集和发布功能
"""

import asyncio
import hashlib
import json
import time
from typing import Dict, Any, Optional, List
from playwright.async_api import async_playwright, Page, BrowserContext

class MiaoshouAPI:
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
        self.browser = await playwright.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        )
        self.page = await self.context.new_page()
        
        # 注入签名获取代码
        await self._inject_signature_interceptor()
        
    async def _inject_signature_interceptor(self):
        """注入签名拦截器"""
        intercept_code = """
        () => {
            // 拦截XMLHttpRequest
            const originalXHROpen = XMLHttpRequest.prototype.open;
            const originalXHRSend = XMLHttpRequest.prototype.send;
            
            window.__miaoshou_requests = [];
            
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                this.__method = method;
                this.__url = url;
                return originalXHROpen.apply(this, [method, url, ...args]);
            };
            
            XMLHttpRequest.prototype.send = function(body) {
                this.__body = body;
                const self = this;
                
                this.addEventListener('load', function() {
                    if (self.__url && self.__url.includes('miaoshou')) {
                        // 尝试从请求中提取headers
                        const headers = {};
                        try {
                            // 访问内部headers
                            headers['x-timestamp'] = self.getResponseHeader('x-timestamp') || 
                                document.querySelector('meta[name="timestamp"]')?.content || '';
                            headers['x-app-hippo'] = self.getResponseHeader('x-app-hippo') || '';
                        } catch (e) {}
                        
                        window.__miaoshou_requests.push({
                            method: self.__method,
                            url: self.__url,
                            body: self.__body,
                            status: self.status,
                            headers: headers
                        });
                    }
                });
                
                return originalXHRSend.apply(this, [body]);
            };
            
            // 拦截fetch
            const originalFetch = window.fetch;
            window.fetch = async function(url, options = {}) {
                const response = await originalFetch(url, options);
                return response;
            };
        }
        """
        await self.page.evaluate(intercept_code)
        
    async def login(self, phone: str, password: str) -> Dict[str, Any]:
        """登录妙手ERP"""
        try:
            await self.page.goto(f"{self.BASE_URL}/login", timeout=30000)
            await asyncio.sleep(2)
            
            # 填写登录表单
            await self.page.fill('input[type="text"]', phone)
            await asyncio.sleep(0.5)
            await self.page.fill('input[type="password"]', password)
            await asyncio.sleep(0.5)
            
            # 点击登录
            await self.page.click('button[type="submit"]')
            await asyncio.sleep(5)
            
            # 获取cookies
            cookies = await self.context.cookies()
            for c in cookies:
                if 'authorization' in c['name'].lower() or 'token' in c['name'].lower():
                    self.auth_token = c['value']
            
            # 获取localStorage中的token
            token_js = """
            () => localStorage.getItem('authorization-token') || 
                  localStorage.getItem('Authorization') ||
                  localStorage.getItem('token') || ''
            """
            self.auth_token = await self.page.evaluate(token_js) or self.auth_token
            
            return {
                "success": True,
                "logged_in": "login" not in self.page.url.lower(),
                "has_token": bool(self.auth_token)
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def call_api(self, api_path: str, body: str = "", method: str = "POST") -> Dict[str, Any]:
        """
        调用妙手API - 使用注入的方式
        """
        url = f"{self.BASE_URL}{api_path}"
        timestamp = str(int(time.time()))
        
        # 构建请求headers
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": self.BASE_URL,
            "Referer": f"{self.BASE_URL}/",
            "x-timestamp": timestamp,
            "x-front-version": "1777027293625",
            "bx-v": "2.5.11",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        }
        
        if self.auth_token:
            headers["authorization-token"] = self.auth_token
        
        # 使用页面上下文发送请求（复用浏览器的签名）
        request_js = f"""
        async () => {{
            // 获取页面中可能的签名函数
            let signature = '';
            const timestamp = '{timestamp}';
            const url = '{url}';
            const body = '{body}';
            
            // 尝试从全局获取签名
            if (window.__miaoshou_signature) {{
                signature = window.__miaoshou_signature(url, body, timestamp);
            }} else if (window.getSignature) {{
                signature = window.getSignature(url, body, timestamp);
            }} else if (window.signature) {{
                signature = window.signature(url, body, timestamp);
            }}
            
            // 尝试计算签名
            if (!signature) {{
                // 使用MD5作为后备（可能不正确）
                const data = timestamp + url + body;
                // 使用Web Crypto API
                try {{
                    const encoder = new TextEncoder();
                    const dataBuffer = encoder.encode(data);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                }} catch (e) {{
                    // 如果无法计算，设置空签名
                    signature = '';
                }}
            }}
            
            // 添加签名到headers
            const headers = {json.dumps(headers, ensure_ascii=False)};
            headers['x-app-hippo'] = signature;
            
            // 发送请求
            try {{
                const options = {{
                    method: '{method}',
                    headers: headers,
                }};
                
                if ('{method}' === 'POST' && body) {{
                    options.body = body;
                }}
                
                const response = await fetch(url, options);
                const text = await response.text();
                
                return {{
                    status: response.status,
                    ok: response.ok,
                    headers: Object.fromEntries(response.headers.entries()),
                    body: text
                }};
            }} catch (e) {{
                return {{ error: e.message }};
            }}
        }}
        """
        
        try:
            result = await self.page.evaluate(request_js)
            
            # 解析响应
            if 'error' in result:
                return {"success": False, "error": result['error']}
            
            try:
                data = json.loads(result.get('body', '{}'))
                return {
                    "success": data.get('result') == 'success',
                    "data": data,
                    "status": result.get('status'),
                    "reason": data.get('reason', '')
                }
            except:
                return {
                    "success": False,
                    "raw": result.get('body', ''),
                    "status": result.get('status')
                }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def collect_url(self, url: str) -> Dict[str, Any]:
        """
        采集1688链接 - /api/move/common_collect_box/fetchItem
        """
        body = f"url={url}&source=linkCopy"
        return await self.call_api("/api/move/common_collect_box/fetchItem", body)
    
    async def search_collect_box(self, page: int = 1, page_size: int = 20, tab: str = "noClaimed") -> Dict[str, Any]:
        """
        搜索采集箱 - /api/move/common_collect_box/searchDetailList
        """
        body = f"pageNo={page}&pageSize={page_size}&filter%5BtabPaneName%5D={tab}"
        return await self.call_api("/api/move/common_collect_box/searchDetailList", body)
    
    async def get_collect_item_info(self, detail_id: str) -> Dict[str, Any]:
        """
        获取采集商品详情 - /api/platform/tiktok/move/collect_box/getCollectItemInfo
        """
        body = f"detailId={detail_id}"
        return await self.call_api("/api/platform/tiktok/move/collect_box/getCollectItemInfo", body)
    
    async def claim_item(self, detail_id: str, shop_id: str) -> Dict[str, Any]:
        """
        认领商品到店铺 - /api/move/common_collect_box/claimed
        """
        body = f"detailId={detail_id}&shopId={shop_id}"
        return await self.call_api("/api/move/common_collect_box/claimed", body)
    
    async def get_shop_list(self) -> Dict[str, Any]:
        """
        获取店铺列表 - /api/auth/account/getShopGroupShopList
        """
        return await self.call_api("/api/auth/account/getShopGroupShopList", "")
    
    async def close(self):
        """关闭浏览器"""
        if self.browser:
            await self.browser.close()


async def test():
    """测试函数"""
    # 这里需要填入你的妙手ERP账号密码
    PHONE = input("请输入妙手ERP手机号: ")
    PASSWORD = input("请输入密码: ")
    
    client = MiaoshouAPI()
    
    try:
        await client.init()
        print("✅ 浏览器初始化成功")
        
        # 登录
        print(f"\n正在登录: {PHONE}")
        login_result = await client.login(PHONE, PASSWORD)
        print(f"登录结果: {login_result}")
        
        if login_result.get('success') and login_result.get('logged_in'):
            print("✅ 登录成功!")
            
            # 获取店铺列表
            print("\n获取店铺列表...")
            shops = await client.get_shop_list()
            print(f"店铺: {json.dumps(shops, ensure_ascii=False)[:500]}")
            
            # 搜索采集箱
            print("\n搜索采集箱...")
            collections = await client.search_collect_box(page=1, page_size=10)
            print(f"采集箱: {json.dumps(collections, ensure_ascii=False)[:500]}")
        else:
            print("❌ 登录失败")
            
    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(test())
