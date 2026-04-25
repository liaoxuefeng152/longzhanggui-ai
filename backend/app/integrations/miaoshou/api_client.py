"""
妙手ERP API客户端 - 使用cookies登录
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
        
    async def set_cookies(self, cookies: Dict[str, str]):
        """
        设置cookies进行认证
        
        Args:
            cookies: cookie字典，格式 {name: value}
        """
        cookie_list = []
        for name, value in cookies.items():
            # 自动识别域名
            domain = ".erp.91miaoshou.com"
            if name in ["_ga", "_ati", "_clck", "_clsk", "Hm_lpvt", "Hm_lvt"]:
                domain = ".91miaoshou.com"
            
            cookie_list.append({
                "name": name,
                "value": value,
                "domain": domain,
                "path": "/"
            })
        
        if cookie_list:
            await self.context.add_cookies(cookie_list)
            print(f"已设置 {len(cookie_list)} 个cookies")
    
    async def login_with_cookies(self, account_id: str = None, auto_login_token: str = None) -> Dict[str, Any]:
        """
        使用cookies登录
        
        Args:
            account_id: accountId cookie的值
            auto_login_token: autoLoginToken cookie的值
        """
        cookies = {}
        if account_id:
            cookies["accountId"] = account_id
        if auto_login_token:
            cookies["autoLoginToken"] = auto_login_token
            self.auth_token = auto_login_token
        
        if cookies:
            await self.set_cookies(cookies)
        
        # 访问主页验证登录
        await self.page.goto(self.BASE_URL, timeout=30000)
        await asyncio.sleep(3)
        
        current_url = self.page.url
        logged_in = "login" not in current_url.lower()
        
        return {
            "success": True,
            "logged_in": logged_in,
            "has_token": bool(self.auth_token),
            "url": current_url
        }
    
    async def call_api(self, api_path: str, body: str = "", method: str = "POST") -> Dict[str, Any]:
        """
        调用妙手API
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
        
        # 使用页面上下文发送请求
        request_js = f"""
        async () => {{
            const timestamp = '{timestamp}';
            const url = '{url}';
            const bodyData = '{body}';
            
            // 尝试计算签名
            let signature = '';
            try {{
                const encoder = new TextEncoder();
                const data = timestamp + url + bodyData;
                const dataBuffer = encoder.encode(data);
                const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }} catch (e) {{
                signature = '';
            }}
            
            const finalHeaders = {json.dumps(headers, ensure_ascii=False)};
            finalHeaders['x-app-hippo'] = signature;
            
            try {{
                const options = {{
                    method: '{method}',
                    headers: finalHeaders,
                }};
                
                if ('{method}' === 'POST' && bodyData) {{
                    options.body = bodyData;
                }}
                
                const response = await fetch(url, options);
                const text = await response.text();
                
                return {{
                    status: response.status,
                    ok: response.ok,
                    body: text
                }};
            }} catch (e) {{
                return {{ error: e.message }};
            }}
        }}
        """
        
        try:
            result = await self.page.evaluate(request_js)
            
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
        """采集1688链接"""
        body = f"url={url}&source=linkCopy"
        return await self.call_api("/api/move/common_collect_box/fetchItem", body)
    
    async def search_collect_box(self, page: int = 1, page_size: int = 20, tab: str = "noClaimed") -> Dict[str, Any]:
        """搜索采集箱"""
        body = f"pageNo={page}&pageSize={page_size}&filter%5BtabPaneName%5D={tab}"
        return await self.call_api("/api/move/common_collect_box/searchDetailList", body)
    
    async def get_shop_list(self) -> Dict[str, Any]:
        """获取店铺列表"""
        return await self.call_api("/api/auth/account/getShopGroupShopList", "")
    
    async def claim_item(self, detail_id: str, shop_id: str) -> Dict[str, Any]:
        """认领商品"""
        body = f"detailId={detail_id}&shopId={shop_id}"
        return await self.call_api("/api/move/common_collect_box/claimed", body)
    
    async def close(self):
        """关闭浏览器"""
        if self.browser:
            await self.browser.close()


async def main():
    """测试函数"""
    client = MiaoshouAPI()
    
    try:
        await client.init()
        print("✅ 浏览器初始化成功")
        
        # 使用你的cookies登录 - 添加更多cookies
        print("\n使用cookies登录...")
        
        # 所有需要的cookies
        all_cookies = {
            "accountId": "13257815",
            "autoLoginToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50SWQiOiIxMzI1NzgxNSIsImNsaWVudElkIjpudWxsLCJzdWJBY2NvdW50SWQiOjAsImV4cGlyZVRpbWUiOjE3Nzc2ODg2NzUsImdtdENyZWF0ZSI6IjIwMjYtMDQtMjUgMTA6MjQ6MzUiLCJleHAiOjE3NzcwODM5OTV9.W6_SIq4cfVXpDCc1AE6h0rBqGGvOCj9hi25wG5bQU5c",
            "acw_tc": "65c93fbb17770827400308559eb45b0b51caf45130751853347358d7fdab2c",
            "bsClientId": "bs_efcae7a0-f6b0-4d97-bbb9-b49d6dbb02e5",
            "firstClientId": "b29a4cc6-54ae-46a4-935e-78ce119fc79e",
            "Hm_lpvt_7974377ca203df6dcf98836f348d0722": "1777083372",
        }
        
        login_result = await client.login_with_cookies()
        # 直接设置所有cookies
        await client.set_cookies(all_cookies)
        print(f"登录结果: {json.dumps(login_result, ensure_ascii=False, indent=2)}")
        
        if login_result.get('success'):
            print("\n✅ 登录成功!")
            
            # 获取店铺列表
            print("\n获取店铺列表...")
            shops = await client.get_shop_list()
            print(f"店铺: {json.dumps(shops, ensure_ascii=False, indent=2)[:1500]}")
            
            # 搜索采集箱
            print("\n搜索采集箱...")
            collections = await client.search_collect_box(page=1, page_size=10)
            print(f"采集箱: {json.dumps(collections, ensure_ascii=False, indent=2)[:1500]}")
        else:
            print("\n❌ 登录失败")
            
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await client.close()


if __name__ == "__main__":
    asyncio.run(main())
