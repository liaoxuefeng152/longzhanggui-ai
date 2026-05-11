"""
妙手ERP - 直接操作页面采集商品
使用Playwright模拟人工操作
"""

import asyncio
import json
from typing import Dict, Any, List, Optional
from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeout

class MiaoshouPageScraper:
    """妙手ERP页面爬虫"""
    
    BASE_URL = "https://erp.91miaoshou.com"
    
    def __init__(self):
        self.browser = None
        self.context = None
        self.page: Optional[Page] = None
        
    async def init(self, headless: bool = True):
        """初始化浏览器"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=headless,
            args=['--disable-blink-features=AutomationControlled']
        )
        self.context = await self.browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        self.page = await self.context.new_page()
    
    async def login(self, phone: str, password: str) -> Dict[str, Any]:
        """
        登录妙手ERP
        
        Args:
            phone: 手机号
            password: 密码
            
        Returns:
            登录结果
        """
        try:
            print(f"正在打开登录页面...")
            await self.page.goto(f"{self.BASE_URL}/login", timeout=60000)
            await asyncio.sleep(3)
            
            # 输入手机号
            print(f"输入手机号: {phone}")
            await self._fill_input('input[type="text"], input[placeholder*="手机"]', phone)
            await asyncio.sleep(0.5)
            
            # 输入密码
            print(f"输入密码...")
            await self._fill_input('input[type="password"]', password)
            await asyncio.sleep(0.5)
            
            # 点击登录
            print("点击登录按钮...")
            await self._click_button('button[type="submit"], button:has-text("登录")')
            
            # 等待登录处理
            print("等待登录处理（可能需要验证码）...")
            await asyncio.sleep(10)
            
            # 检查是否登录成功
            current_url = self.page.url
            if "login" not in current_url.lower():
                print(f"✅ 登录成功! 当前URL: {current_url}")
                return {"success": True, "logged_in": True, "url": current_url}
            else:
                print(f"⚠️ 可能需要验证码处理")
                return {"success": True, "logged_in": False, "url": current_url}
                
        except Exception as e:
            print(f"登录失败: {e}")
            return {"success": False, "error": str(e)}
    
    async def _fill_input(self, selector: str, value: str):
        """填写输入框"""
        for sel in selector.split(", "):
            try:
                await self.page.wait_for_selector(sel.strip(), timeout=3000)
                await self.page.fill(sel.strip(), value)
                print(f"  成功填写: {sel}")
                return True
            except:
                continue
        raise Exception(f"找不到输入框: {selector}")
    
    async def _click_button(self, selector: str):
        """点击按钮"""
        for sel in selector.split(", "):
            try:
                await self.page.click(sel.strip(), timeout=3000)
                print(f"  成功点击: {sel}")
                return True
            except:
                continue
        raise Exception(f"找不到按钮: {selector}")
    
    async def go_to_collect_box(self):
        """跳转到采集中心"""
        print("跳转到采集中心...")
        
        # 尝试多种导航方式
        nav_selectors = [
            'a[href*="common_collect_box"]',
            'a:has-text("公用采集箱")',
            '.sidebar a:has-text("采集")',
            '[class*="menu"] a:has-text("采集")',
        ]
        
        for sel in nav_selectors:
            try:
                await self.page.click(sel, timeout=3000)
                print(f"  点击导航: {sel}")
                await asyncio.sleep(2)
                break
            except:
                continue
        
        # 如果导航失败，直接跳转URL
        if "collect_box" not in self.page.url:
            await self.page.goto(f"{self.BASE_URL}/common_collect_box/index")
            await asyncio.sleep(3)
        
        print(f"当前页面: {self.page.url}")
    
    async def collect_url(self, url: str) -> Dict[str, Any]:
        """
        采集1688商品链接
        
        Args:
            url: 1688商品链接
            
        Returns:
            采集结果
        """
        try:
            print(f"\n采集链接: {url}")
            
            # 跳转到采集中心
            await self.go_to_collect_box()
            await asyncio.sleep(2)
            
            # 查找输入框并粘贴链接
            input_selectors = [
                'input[placeholder*="链接"]',
                'input[placeholder*="URL"]', 
                'input[placeholder*="采集"]',
                'textarea',
            ]
            
            for sel in input_selectors:
                try:
                    await self.page.wait_for_selector(sel, timeout=3000)
                    await self.page.fill(sel, url)
                    print(f"  粘贴链接到: {sel}")
                    break
                except:
                    continue
            
            await asyncio.sleep(1)
            
            # 点击采集按钮
            button_selectors = [
                'button:has-text("采集")',
                'button:has-text("抓取")',
                'button:has-text("获取")',
            ]
            
            for sel in button_selectors:
                try:
                    await self.page.click(sel, timeout=3000)
                    print(f"  点击采集按钮: {sel}")
                    break
                except:
                    continue
            
            # 等待采集完成
            print("等待采集完成...")
            await asyncio.sleep(5)
            
            # 检查结果
            # 可以从页面中提取采集结果
            page_content = await self._extract_product_info()
            
            return {
                "success": True,
                "url": url,
                "result": page_content
            }
            
        except Exception as e:
            print(f"采集失败: {e}")
            return {"success": False, "error": str(e), "url": url}
    
    async def _extract_product_info(self) -> Dict[str, Any]:
        """从页面提取商品信息"""
        extract_js = """
        () => {
            // 尝试从页面中提取商品信息
            // 这需要根据妙手页面的实际结构来提取
            
            const result = {
                title: '',
                price: '',
                images: [],
                skuInfo: [],
                sourceUrl: ''
            };
            
            // 尝试提取标题
            const titleEl = document.querySelector('.product-title, .item-title, [class*="title"]');
            if (titleEl) result.title = titleEl.textContent.trim();
            
            // 尝试提取价格
            const priceEl = document.querySelector('.price, [class*="price"]');
            if (priceEl) result.price = priceEl.textContent.trim();
            
            // 尝试提取图片
            const images = document.querySelectorAll('img[class*="image"], img[class*="img"]');
            result.images = Array.from(images).slice(0, 5).map(img => img.src);
            
            // 尝试提取SKU
            const skus = document.querySelectorAll('[class*="sku"]');
            result.skuInfo = Array.from(skus).slice(0, 10).map(sku => sku.textContent.trim());
            
            // 获取页面文本
            result.pageText = document.body.innerText.substring(0, 500);
            
            return result;
        }
        """
        
        try:
            info = await self.page.evaluate(extract_js)
            return info
        except:
            return {}
    
    async def get_collect_box_items(self, page: int = 1) -> List[Dict[str, Any]]:
        """
        获取采集箱商品列表
        
        Returns:
            商品列表
        """
        try:
            print(f"\n获取采集箱列表...")
            
            await self.go_to_collect_box()
            await asyncio.sleep(3)
            
            # 等待商品列表加载
            await self.page.wait_for_selector('[class*="item"], [class*="product"]', timeout=10000)
            await asyncio.sleep(2)
            
            # 提取商品列表
            extract_js = """
            () => {
                // 尝试提取商品列表
                const items = [];
                
                // 尝试多种选择器
                const selectors = [
                    '.item-list .item',
                    '.product-list .product',
                    '[class*="collect"] [class*="item"]',
                    'tr[class*="item"]',
                    '.el-table__row'
                ];
                
                for (const sel of selectors) {
                    const elements = document.querySelectorAll(sel);
                    if (elements.length > 0) {
                        elements.forEach(el => {
                            const item = {
                                title: '',
                                price: '',
                                image: '',
                                id: ''
                            };
                            
                            // 提取标题
                            const titleEl = el.querySelector('[class*="title"], [class*="name"]');
                            if (titleEl) item.title = titleEl.textContent.trim();
                            
                            // 提取价格
                            const priceEl = el.querySelector('[class*="price"]');
                            if (priceEl) item.price = priceEl.textContent.trim();
                            
                            // 提取图片
                            const imgEl = el.querySelector('img');
                            if (imgEl) item.image = imgEl.src;
                            
                            // 提取ID
                            if (el.dataset.id) item.id = el.dataset.id;
                            
                            items.push(item);
                        });
                        break;
                    }
                }
                
                return {
                    count: items.length,
                    items: items.slice(0, 20)
                };
            }
            """
            
            result = await self.page.evaluate(extract_js)
            print(f"找到 {result.get('count', 0)} 个商品")
            return result.get('items', [])
            
        except Exception as e:
            print(f"获取列表失败: {e}")
            return []
    
    async def wait_for_manual_action(self, message: str = "请在浏览器中完成操作"):
        """
        等待手动操作
        
        Args:
            message: 提示信息
        """
        print(f"\n⚠️ {message}")
        print("按 Ctrl+C 在终端中结束等待")
        
        # 保持浏览器打开
        while True:
            await asyncio.sleep(10)
    
    async def close(self):
        """关闭浏览器"""
        if self.browser:
            await self.browser.close()


async def main():
    """测试函数"""
    scraper = MiaoshouPageScraper()
    
    try:
        await scraper.init()
        print("✅ 浏览器初始化成功")
        print("⚠️ 注意：请在弹出的浏览器中完成登录（可能需要验证码）\n")
        
        # 登录
        phone = input("请输入妙手ERP手机号: ").strip()
        password = input("请输入密码: ").strip()
        
        result = await scraper.login(phone, password)
        
        if result.get('logged_in'):
            print("\n✅ 登录成功!")
            
            # 采集链接测试
            test_url = input("\n请输入要采集的1688链接（直接回车跳过）: ").strip()
            if test_url:
                await scraper.collect_url(test_url)
            
            # 获取采集箱列表
            items = await scraper.get_collect_box_items()
            print(f"\n采集箱商品数量: {len(items)}")
            
            # 保存结果
            if items:
                with open('/tmp/miaoshou_items.json', 'w', encoding='utf-8') as f:
                    json.dump(items, f, ensure_ascii=False, indent=2)
                print("商品列表已保存到 /tmp/miaoshou_items.json")
        else:
            print("\n⚠️ 登录可能需要验证码处理")
            print("请在浏览器中完成验证码验证...")
            
            # 等待用户手动操作
            await scraper.wait_for_manual_action("请在浏览器中完成验证码验证")
            
    except KeyboardInterrupt:
        print("\n\n用户中断")
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await scraper.close()


if __name__ == "__main__":
    asyncio.run(main())
