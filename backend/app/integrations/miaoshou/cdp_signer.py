"""
妙手ERP集成服务 - 使用CDP协议获取签名
"""

import asyncio
import json
import subprocess
import time
from typing import Dict, Any, Optional
from playwright.async_api import async_playwright, Page

class MiaoshouSigner:
    """妙手ERP签名获取器"""
    
    BASE_URL = "https://erp.91miaoshou.com"
    
    def __init__(self):
        self.browser = None
        self.context = None
        self.page: Optional[Page] = None
        self.cookies: Dict[str, str] = {}
        
    async def init(self):
        """初始化浏览器"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        )
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        self.page = await self.context.new_page()
        
        # 保存cookies
        await self.page.goto(self.BASE_URL)
        await asyncio.sleep(2)
        self.cookies = {c['name']: c['value'] for c in self.context.cookies()}
        
    async def login(self, phone: str, password: str) -> bool:
        """登录妙手"""
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
            
            # 更新cookies
            self.cookies = {c['name']: c['value'] for c in self.context.cookies()}
            
            return "login" not in self.page.url.lower()
        except Exception as e:
            print(f"登录失败: {e}")
            return False
    
    async def intercept_request(self, api_path: str, body: str = "") -> Dict[str, Any]:
        """
        通过拦截请求获取签名
        
        原理：注入代码拦截XMLHttpRequest，捕获发送的请求并获取签名
        """
        # 注入拦截代码
        intercept_code = """
        () => {
            const originalXHROpen = XMLHttpRequest.prototype.open;
            const originalXHRSend = XMLHttpRequest.prototype.send;
            
            window.__miaoshou_last_request = null;
            
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
                        window.__miaoshou_last_request = {
                            method: self.__method,
                            url: self.__url,
                            body: self.__body,
                            status: self.status,
                            response: self.responseText
                        };
                    }
                });
                
                return originalXHRSend.apply(this, [body]);
            };
        }
        """
        
        await self.page.evaluate(intercept_code)
        
        # 触发API请求
        url = f"{self.BASE_URL}{api_path}"
        trigger_code = f"""
        async () => {{
            try {{
                const response = await fetch('{url}', {{
                    method: 'POST',
                    headers: {{
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': '{self.BASE_URL}',
                        'Referer': '{self.BASE_URL}/'
                    }},
                    body: '{body}'
                }});
                return {{ status: response.status, ok: response.ok }};
            }} catch (e) {{
                return {{ error: e.message }};
            }}
        }}
        """
        
        await self.page.evaluate(trigger_code)
        await asyncio.sleep(1)
        
        # 获取拦截的请求
        last_request = await self.page.evaluate("() => window.__miaoshou_last_request")
        
        if last_request:
            # 从请求中提取headers
            return {
                "success": True,
                "url": last_request.get("url"),
                "method": last_request.get("method"),
                "body": last_request.get("body"),
                "response": last_request.get("response")
            }
        
        return {"success": False, "error": "未捕获到请求"}
    
    async def get_headers(self, api_path: str, body: str = "") -> Dict[str, str]:
        """
        获取API请求所需的headers
        """
        result = await self.intercept_request(api_path, body)
        
        if result.get("success"):
            # 注入代码获取当前请求的headers
            headers_code = """
            async () => {
                // 尝试从全局变量或闭包中获取headers
                const headers = window.__miaoshou_headers || window.__miaoshou_last_headers || null;
                return headers;
            }
            """
            headers = await self.page.evaluate(headers_code)
            
            if headers:
                return headers
        
        # 如果拦截失败，返回默认headers
        return {
            "x-timestamp": str(int(time.time())),
            "x-front-version": "1777027293625",
            "bx-v": "2.5.11",
            "x-app-hippo": "",  # 需要从拦截中获取
            "Content-Type": "application/x-www-form-urlencoded"
        }
    
    async def api_call(self, api_path: str, body: str = "", method: str = "POST") -> Dict[str, Any]:
        """
        调用妙手API
        """
        url = f"{self.BASE_URL}{api_path}"
        
        # 使用Fetch API直接调用（签名由注入的代码处理）
        fetch_code = f"""
        async () => {{
            const timestamp = Math.floor(Date.now() / 1000);
            const data = '{body}';
            
            // 尝试使用页面的签名函数
            let signature = '';
            if (typeof window.getSignature === 'function') {{
                signature = window.getSignature('{url}', data, timestamp);
            }}
            
            // 如果没有签名函数，发送请求并记录
            try {{
                const response = await fetch('{url}', {{
                    method: '{method}',
                    headers: {{
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Origin': '{self.BASE_URL}',
                        'Referer': '{self.BASE_URL}/',
                        'x-timestamp': timestamp.toString(),
                        'x-app-hippo': signature || 'placeholder',
                        'x-front-version': '1777027293625',
                        'bx-v': '2.5.11'
                    }},
                    body: data
                }});
                
                const text = await response.text();
                return {{
                    status: response.status,
                    ok: response.ok,
                    text: text.substring(0, 1000)
                }};
            }} catch (e) {{
                return {{ error: e.message }};
            }}
        }}
        """
        
        result = await self.page.evaluate(fetch_code)
        return result
    
    async def get_collect_box_list(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """获取采集箱列表"""
        body = f"pageNo={page}&pageSize={page_size}&filter%5BtabPaneName%5D=noClaimed"
        return await self.api_call("/api/move/common_collect_box/searchDetailList", body)
    
    async def close(self):
        """关闭浏览器"""
        if self.browser:
            await self.browser.close()


async def main():
    """测试函数"""
    signer = MiaoshouSigner()
    
    try:
        await signer.init()
        print("浏览器初始化成功")
        
        # 访问主页
        await signer.page.goto(signer.BASE_URL)
        await asyncio.sleep(3)
        print(f"当前URL: {signer.page.url}")
        
        # 测试API调用
        result = await signer.get_collect_box_list()
        print(f"\n采集箱列表API结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False)[:500])
        
    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await signer.close()


if __name__ == "__main__":
    asyncio.run(main())
