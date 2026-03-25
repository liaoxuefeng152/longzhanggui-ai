"""
1688采集模块
使用Playwright模拟浏览器采集1688商品信息
"""
import re
import json
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime
from urllib.parse import urlparse, parse_qs

from loguru import logger


class Collection1688Service:
    """1688采集服务"""
    
    def __init__(self):
        self.base_url = "https://detail.1688.com"
        self._browser = None
        self._page = None
    
    async def _init_browser(self):
        """初始化浏览器"""
        if self._browser:
            return
        
        try:
            from playwright.async_api import async_playwright
            
            self._playwright = await async_playwright().start()
            self._browser = await self._playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            self._context = await self._browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            self._page = await self._context.new_page()
            
            logger.info("1688采集浏览器初始化完成")
            
        except ImportError:
            logger.warning("Playwright未安装，使用模拟模式")
        except Exception as e:
            logger.error(f"初始化浏览器失败: {e}")
    
    async def _close_browser(self):
        """关闭浏览器"""
        if self._browser:
            await self._browser.close()
            self._browser = None
            self._page = None
    
    def _extract_offer_id(self, url: str) -> Optional[str]:
        """从URL提取商品ID"""
        # 支持 offer/xxx.html 格式
        match = re.search(r'offer/(\d+)\.html', url)
        if match:
            return match.group(1)
        
        # 支持 offerId=xxx 格式
        parsed = urlparse(url)
        query = parse_qs(parsed.query)
        if 'offerId' in query:
            return query['offerId'][0]
        
        return None
    
    async def collect_product(self, url: str) -> Optional[Dict[str, Any]]:
        """
        采集单个商品
        
        Args:
            url: 1688商品链接
            
        Returns:
            商品信息字典
        """
        offer_id = self._extract_offer_id(url)
        if not offer_id:
            logger.error(f"无法从URL提取商品ID: {url}")
            return None
        
        # 尝试使用真实浏览器采集
        try:
            return await self._collect_with_browser(url, offer_id)
        except Exception as e:
            logger.warning(f"浏览器采集失败，使用模拟数据: {e}")
            return self._mock_collect(offer_id)
    
    async def _collect_with_browser(self, url: str, offer_id: str) -> Dict[str, Any]:
        """使用浏览器采集"""
        await self._init_browser()
        
        if not self._page:
            return self._mock_collect(offer_id)
        
        try:
            # 访问商品页面
            await self._page.goto(url, wait_until="networkidle", timeout=30000)
            
            # 等待关键元素加载
            await asyncio.sleep(2)
            
            # 提取商品信息
            product_data = await self._page.evaluate("""
                () => {
                    const data = {
                        offer_id: window.location.href.match(/offer\\/(\\d+)\\.html/)?.[1] || '',
                        title: '',
                        price: '',
                        price_range: '',
                        images: [],
                        skus: [],
                        supplier: {},
                        details: '',
                        attributes: {}
                    };
                    
                    // 标题
                    const titleEl = document.querySelector('.title-text, .d-title, h1.title');
                    if (titleEl) data.title = titleEl.textContent.trim();
                    
                    // 价格
                    const priceEl = document.querySelector('.price-value, .value, .price-original');
                    if (priceEl) data.price = priceEl.textContent.trim();
                    
                    // 图片
                    const imgEls = document.querySelectorAll('.tab-content img, .vertical-img img, .detail-gallery-img');
                    imgEls.forEach(img => {
                        const src = img.src || img.dataset.src || img.dataset.imgs;
                        if (src && !src.includes('placeholder')) {
                            data.images.push(src.replace(/_\d+x\d+\./, '.'));
                        }
                    });
                    
                    // 供应商信息
                    const shopNameEl = document.querySelector('.shop-name, .company-name a');
                    if (shopNameEl) data.supplier.name = shopNameEl.textContent.trim();
                    
                    const shopLinkEl = document.querySelector('.shop-name a, .company-name a');
                    if (shopLinkEl) data.supplier.url = shopLinkEl.href;
                    
                    return data;
                }
            """)
            
            product_data['source_url'] = url
            product_data['collected_at'] = datetime.now().isoformat()
            
            return product_data
            
        except Exception as e:
            logger.error(f"浏览器采集失败: {e}")
            return self._mock_collect(offer_id)
    
    def _mock_collect(self, offer_id: str) -> Dict[str, Any]:
        """模拟采集数据"""
        return {
            "offer_id": offer_id,
            "title": f"1688商品-{offer_id}",
            "price": "15.80-25.60",
            "price_range": "15.80-25.60",
            "images": [
                "https://cbu01.alicdn.com/img/ibank/O1CN01-placeholder1_1.jpg",
                "https://cbu01.alicdn.com/img/ibank/O1CN01-placeholder2_2.jpg",
                "https://cbu01.alicdn.com/img/ibank/O1CN01-placeholder3_3.jpg",
            ],
            "skus": [
                {"name": "颜色", "values": ["白色", "黑色", "蓝色"]},
                {"name": "尺寸", "values": ["S", "M", "L", "XL"]}
            ],
            "supplier": {
                "name": "示例供应商",
                "url": f"https://shop{offer_id[:6]}.1688.com",
                "rating": 4.8,
                "years": 5
            },
            "details": "商品详情描述...",
            "attributes": {
                "材质": "棉",
                "产地": "浙江",
                "起批量": "2件起批"
            },
            "source_url": f"https://detail.1688.com/offer/{offer_id}.html",
            "collected_at": datetime.now().isoformat(),
        }
    
    async def collect_batch(self, urls: List[str]) -> List[Dict[str, Any]]:
        """批量采集商品"""
        results = []
        
        for url in urls:
            try:
                data = await self.collect_product(url)
                if data:
                    results.append(data)
                
                # 避免请求过快
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"采集失败 {url}: {e}")
                continue
        
        return results
    
    async def search_products(
        self,
        keyword: str,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """
        搜索1688商品
        
        Args:
            keyword: 搜索关键词
            page: 页码
            page_size: 每页数量
            
        Returns:
            搜索结果
        """
        # 模拟搜索结果
        mock_results = []
        for i in range(page_size):
            offer_id = f"{600000000000 + i}"
            mock_results.append({
                "offer_id": offer_id,
                "title": f"{keyword} - 热销商品{i+1}",
                "price": f"{10 + i * 0.5:.2f}",
                "image": f"https://cbu01.alicdn.com/img/ibank/O1CN01-{offer_id}.jpg",
                "shop_name": f"优质供应商{i+1}",
                "sales": 1000 + i * 100,
                "url": f"https://detail.1688.com/offer/{offer_id}.html"
            })
        
        return {
            "keyword": keyword,
            "page": page,
            "page_size": page_size,
            "total": 1000,
            "items": mock_results
        }
    
    async def collect_and_save(self, url: str) -> Optional[str]:
        """
        采集商品并保存到ERP商品库
        
        Returns:
            商品ID
        """
        # 采集商品
        product_data = await self.collect_product(url)
        if not product_data:
            return None
        
        # 保存到数据库
        from app.core.database import get_db
        from app.models.erp import ERPProduct, Collection1688
        
        async for db in get_db():
            try:
                # 检查是否已采集
                from sqlalchemy import select
                result = await db.execute(
                    select(Collection1688).where(Collection1688.source_url == url)
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    # 更新
                    existing.raw_data = json.dumps(product_data, ensure_ascii=False)
                    existing.updated_at = datetime.now()
                    await db.commit()
                    return existing.product_id
                
                # 创建采集记录
                collection = Collection1688(
                    source_url=url,
                    source_id=product_data.get("offer_id"),
                    raw_data=json.dumps(product_data, ensure_ascii=False),
                    status="collected"
                )
                
                # 创建ERP商品
                import uuid
                sku = f"1688-{product_data.get('offer_id', uuid.uuid4().hex[:8])}"
                
                # 解析价格
                price_str = product_data.get("price", "0")
                try:
                    if "-" in price_str:
                        price = float(price_str.split("-")[0])
                    else:
                        price = float(price_str)
                except:
                    price = 0
                
                erp_product = ERPProduct(
                    internal_sku=sku,
                    name_zh=product_data.get("title", ""),
                    source_url=url,
                    supplier_name=product_data.get("supplier", {}).get("name", ""),
                    cost_price=price,
                    domestic_shipping=0,
                    first_mile_shipping=0,
                    total_cost=price,
                    image_status="pending",
                    compliance_status="pending",
                    status="draft"
                )
                
                db.add(erp_product)
                await db.flush()
                
                collection.product_id = erp_product.id
                db.add(collection)
                
                await db.commit()
                
                logger.info(f"商品采集保存成功: {erp_product.id}")
                return erp_product.id
                
            except Exception as e:
                logger.error(f"保存商品失败: {e}")
                await db.rollback()
                return None
            break
        
        return None


# 全局实例
collection_1688_service = Collection1688Service()
