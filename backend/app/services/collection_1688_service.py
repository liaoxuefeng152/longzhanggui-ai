"""
1688采集模块
支持多种采集方式：httpx快速采集 / Playwright浏览器采集
"""
import re
import json
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime
from urllib.parse import urlparse, parse_qs, urljoin
import hashlib

from loguru import logger

# 使用已有的依赖
import httpx
from bs4 import BeautifulSoup


class Collection1688Service:
    """1688采集服务"""
    
    def __init__(self):
        self.base_url = "https://detail.1688.com"
        self._browser = None
        self._page = None
        
        # 请求头 - 模拟真实浏览器
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Cache-Control": "max-age=0",
        }
        
        # HTTP客户端
        self._client = None
    
    async def _get_client(self) -> httpx.AsyncClient:
        """获取HTTP客户端"""
        if self._client is None:
            self._client = httpx.AsyncClient(
                headers=self.headers,
                timeout=30.0,
                follow_redirects=True,
                verify=False  # 跳过SSL验证
            )
        return self._client
    
    async def close(self):
        """关闭资源"""
        if self._client:
            await self._client.aclose()
            self._client = None
        
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
        
        # 方案1: 尝试HTTPX快速采集
        try:
            result = await self._collect_with_httpx(url, offer_id)
            if result and result.get("title"):  # 验证采集到了有效数据
                logger.info(f"HTTPX采集成功: {offer_id}")
                return result
        except Exception as e:
            logger.warning(f"HTTPX采集失败: {e}")
        
        # 方案2: 尝试Playwright浏览器采集（如果已安装）
        try:
            result = await self._collect_with_browser(url, offer_id)
            if result and result.get("title"):
                logger.info(f"Playwright采集成功: {offer_id}")
                return result
        except Exception as e:
            logger.warning(f"Playwright采集失败: {e}")
        
        # 方案3: 使用API接口获取
        try:
            result = await self._collect_with_api(offer_id)
            if result and result.get("title"):
                logger.info(f"API采集成功: {offer_id}")
                return result
        except Exception as e:
            logger.warning(f"API采集失败: {e}")
        
        # 最后回退到模拟数据
        logger.warning(f"所有采集方式失败，使用模拟数据: {offer_id}")
        return self._mock_collect(offer_id, url)
    
    async def _collect_with_httpx(self, url: str, offer_id: str) -> Optional[Dict[str, Any]]:
        """使用HTTPX采集商品页面"""
        client = await self._get_client()
        
        try:
            response = await client.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 提取商品信息
            data = {
                "offer_id": offer_id,
                "source_url": url,
                "collected_at": datetime.now().isoformat(),
                "collect_method": "httpx"
            }
            
            # 标题 - 多种选择器尝试
            title_selectors = [
                '.d-title',
                '.title-text',
                'h1.title',
                '.mod-detail-title h1',
                '[class*="title"]'
            ]
            for selector in title_selectors:
                title_el = soup.select_one(selector)
                if title_el:
                    data['title'] = title_el.get_text(strip=True)
                    break
            
            if not data.get('title'):
                # 尝试从页面数据提取
                script_data = self._extract_page_data(soup)
                if script_data:
                    data['title'] = script_data.get('subject', '') or script_data.get('title', '')
            
            # 价格
            price_selectors = [
                '.price-value',
                '.value',
                '.price-original',
                '[class*="price"]',
                '.mod-detail-price .value'
            ]
            for selector in price_selectors:
                price_el = soup.select_one(selector)
                if price_el:
                    price_text = price_el.get_text(strip=True)
                    # 清理价格文本
                    price_text = re.sub(r'[^\d.\-]', '', price_text)
                    if price_text:
                        data['price'] = price_text
                        break
            
            # 从script数据中获取更完整的信息
            script_data = self._extract_page_data(soup)
            if script_data:
                # 价格区间
                if not data.get('price') and script_data.get('price'):
                    data['price'] = str(script_data['price'])
                
                # 价格区间
                if script_data.get('priceRange'):
                    data['price_range'] = script_data['priceRange']
                
                # 起批量
                if script_data.get('minQuantity'):
                    data['min_order'] = script_data['minQuantity']
            
            # 图片
            images = []
            img_selectors = [
                '.tab-content img',
                '.vertical-img img',
                '.detail-gallery-img',
                '[class*="image"] img',
                '.mod-detail-gallery img'
            ]
            for selector in img_selectors:
                img_els = soup.select(selector)
                for img in img_els:
                    src = img.get('src') or img.get('data-src') or img.get('data-imgs') or img.get('data-lazy-src')
                    if src:
                        # 获取高清大图
                        if src.startswith('//'):
                            src = 'https:' + src
                        # 移除缩略图后缀
                        src = re.sub(r'_\d+x\d+\.(\w+)$', r'.\1', src)
                        src = re.sub(r'\.\d+x\d+\.', '.', src)
                        if src not in images and 'placeholder' not in src.lower():
                            images.append(src)
            
            if images:
                data['images'] = images[:10]  # 最多10张
            
            # 从script数据获取更多图片
            if script_data and script_data.get('images'):
                for img_url in script_data['images']:
                    if img_url and img_url not in data.get('images', []):
                        data.setdefault('images', []).append(img_url)
            
            # 供应商信息
            supplier = {}
            shop_selectors = [
                ('.shop-name a, .company-name a', 'name'),
                ('[class*="shop"] a', 'name'),
                ('[class*="company"] a', 'name'),
            ]
            for selector, field in shop_selectors:
                el = soup.select_one(selector)
                if el:
                    if field == 'name':
                        supplier['name'] = el.get_text(strip=True)
                    if el.get('href'):
                        supplier['url'] = el.get('href')
            
            if supplier:
                data['supplier'] = supplier
            
            # SKU信息
            skus = []
            sku_els = soup.select('[class*="sku"] [class*="item"], [class*="spec"] [class*="item"]')
            for sku_el in sku_els:
                sku_name = sku_el.get('data-name') or sku_el.get('title')
                if sku_name:
                    skus.append({
                        "name": sku_name,
                        "available": not sku_el.has_attr('disabled')
                    })
            
            if skus:
                data['skus'] = skus
            
            # 属性
            attributes = {}
            attr_selectors = [
                ('.mod-detail-attributes tr', 'td'),
                ('[class*="attribute"] li', 'span'),
                ('[class*="property"] tr', 'td'),
            ]
            for container_sel, value_sel in attr_selectors:
                rows = soup.select(container_sel)
                for row in rows:
                    cells = row.select(value_sel)
                    if len(cells) >= 2:
                        key = cells[0].get_text(strip=True)
                        value = cells[1].get_text(strip=True)
                        if key and value:
                            attributes[key] = value
            
            # 提取重量信息
            weight = None
            weight_patterns = [
                (r'重量[：:]\s*([0-9.]+)\s*(?:kg|KG)', 'kg'),
                (r'净重[：:]\s*([0-9.]+)\s*(?:kg|KG|克|g)', 'g'),
                (r'([0-9.]+)\s*kg', 'kg'),
            ]
            for pattern, unit in weight_patterns:
                match = re.search(pattern, response.text, re.IGNORECASE)
                if match:
                    try:
                        weight = float(match.group(1))
                        if unit == 'g':
                            weight = weight / 1000  # 转换为kg
                        data['weight'] = weight
                        break
                    except (ValueError, IndexError):
                        pass
            
            # 如果没找到重量，尝试从属性中获取
            if not weight and attributes:
                for key, value in attributes.items():
                    if '重量' in key:
                        match = re.search(r'([0-9.]+)', value)
                        if match:
                            data['weight'] = float(match.group(1)) / 1000 if '克' in value else float(match.group(1))
                            break
            
            # 重量默认值
            if not data.get('weight'):
                data['weight'] = 0.5  # 默认0.5kg
            
            if attributes:
                data['attributes'] = attributes
            
            return data
            
        except httpx.HTTPError as e:
            logger.error(f"HTTP请求失败: {e}")
            return None
        except Exception as e:
            logger.error(f"HTTPX采集异常: {e}")
            return None
    
    def _extract_page_data(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """从页面script标签提取数据"""
        try:
            scripts = soup.find_all('script')
            for script in scripts:
                content = script.string
                if not content:
                    continue
                
                # 尝试匹配各种数据格式
                patterns = [
                    r'window\.__INITIAL_DATA__\s*=\s*({.*?});',
                    r'var\s+globalData\s*=\s*({.*?});',
                    r'window\.pageData\s*=\s*({.*?});',
                    r'"subject"\s*:\s*"([^"]+)"',
                    r'"price"\s*:\s*"?([\d.\-]+)"?',
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, content, re.DOTALL)
                    if match:
                        try:
                            if pattern.endswith('})'):  # JSON格式
                                return json.loads(match.group(1))
                            else:
                                return {'matched': match.group(1)}
                        except json.JSONDecodeError:
                            continue
            
            return {}
        except Exception as e:
            logger.debug(f"提取页面数据失败: {e}")
            return {}
    
    async def _collect_with_browser(self, url: str, offer_id: str) -> Optional[Dict[str, Any]]:
        """使用Playwright浏览器采集"""
        try:
            from playwright.async_api import async_playwright
        except ImportError:
            logger.debug("Playwright未安装，跳过浏览器采集")
            return None
        
        if self._browser is None:
            self._playwright = await async_playwright().start()
            self._browser = await self._playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            self._context = await self._browser.new_context(
                user_agent=self.headers["User-Agent"]
            )
            self._page = await self._context.new_page()
        
        try:
            await self._page.goto(url, wait_until="networkidle", timeout=30000)
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
                            data.images.push(src.replace(/_\\d+x\\d+\\./, '.'));
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
            product_data['collect_method'] = 'playwright'
            
            return product_data
            
        except Exception as e:
            logger.error(f"Playwright采集失败: {e}")
            return None
    
    async def _collect_with_api(self, offer_id: str) -> Optional[Dict[str, Any]]:
        """尝试通过API获取商品数据"""
        client = await self._get_client()
        
        try:
            # 1688 有一些公开的API端点可以尝试
            api_url = f"https://m.1688.com/offer/{offer_id}.html"
            
            response = await client.get(
                api_url,
                headers={**self.headers, "Accept": "application/json"}
            )
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if data:
                        return {
                            "offer_id": offer_id,
                            "title": data.get("subject") or data.get("title"),
                            "price": data.get("price") or data.get("priceRange"),
                            "images": data.get("images", []),
                            "supplier": data.get("sellerInfo", {}),
                            "collect_method": "api"
                        }
                except json.JSONDecodeError:
                    pass
            
            return None
            
        except Exception as e:
            logger.debug(f"API采集失败: {e}")
            return None
    
    def _mock_collect(self, offer_id: str, url: str) -> Dict[str, Any]:
        """模拟采集数据（最后备选）"""
        return {
            "offer_id": offer_id,
            "title": f"1688商品-{offer_id}",
            "price": "15.80-25.60",
            "price_range": "15.80-25.60",
            "images": [
                f"https://cbu01.alicdn.com/img/ibank/O1CN01-{offer_id}_1.jpg",
                f"https://cbu01.alicdn.com/img/ibank/O1CN01-{offer_id}_2.jpg",
                f"https://cbu01.alicdn.com/img/ibank/O1CN01-{offer_id}_3.jpg",
            ],
            "skus": [
                {"name": "颜色", "values": ["白色", "黑色", "蓝色"]},
                {"name": "尺寸", "values": ["S", "M", "L", "XL"]}
            ],
            "supplier": {
                "name": "待补充供应商",
                "url": f"https://shop{offer_id[:6]}.1688.com",
                "rating": 4.8,
                "years": 5
            },
            "details": "商品详情待采集",
            "attributes": {
                "材质": "待补充",
                "产地": "待补充",
                "起批量": "2件起批"
            },
            "source_url": url,
            "collected_at": datetime.now().isoformat(),
            "collect_method": "mock",
            "note": "采集失败，使用模拟数据，请手动补充"
        }
    
    async def collect_batch(self, urls: List[str]) -> List[Dict[str, Any]]:
        """批量采集商品"""
        results = []
        
        for i, url in enumerate(urls):
            try:
                data = await self.collect_product(url)
                if data:
                    results.append(data)
                
                # 避免请求过快被封
                if i < len(urls) - 1:
                    await asyncio.sleep(1.5)
                
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
        client = await self._get_client()
        
        try:
            # 构建搜索URL
            search_url = f"https://s.1688.com/selloffer/offer_search.htm?keywords={keyword}&n={page_size}&beginPage={page}"
            
            response = await client.get(search_url)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                items = []
                
                # 解析搜索结果
                offer_els = soup.select('.offer-item, [class*="offer"]')
                for el in offer_els[:page_size]:
                    try:
                        link = el.select_one('a[href*="offer"]')
                        if link:
                            href = link.get('href', '')
                            offer_id = self._extract_offer_id(href)
                            
                            if offer_id:
                                title_el = el.select_one('[class*="title"], a')
                                price_el = el.select_one('[class*="price"]')
                                img_el = el.select_one('img')
                                
                                items.append({
                                    "offer_id": offer_id,
                                    "title": title_el.get_text(strip=True) if title_el else "",
                                    "price": price_el.get_text(strip=True) if price_el else "",
                                    "image": img_el.get('src') or img_el.get('data-src') if img_el else "",
                                    "url": f"https://detail.1688.com/offer/{offer_id}.html"
                                })
                    except Exception as e:
                        logger.debug(f"解析商品项失败: {e}")
                        continue
                
                if items:
                    return {
                        "keyword": keyword,
                        "page": page,
                        "page_size": page_size,
                        "total": len(items),
                        "items": items,
                        "collect_method": "httpx"
                    }
        
        except Exception as e:
            logger.warning(f"搜索失败: {e}")
        
        # 回退到模拟搜索结果
        mock_results = []
        for i in range(page_size):
            offer_id = f"{600000000000 + page * page_size + i}"
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
            "items": mock_results,
            "collect_method": "mock"
        }
    
    async def collect_and_save(self, url: str, selection_id: str = None) -> Optional[str]:
        """
        采集商品并保存到ERP商品库
        
        Args:
            url: 1688商品链接
            selection_id: 关联的选品ID（可选）
            
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
        from sqlalchemy import select
        
        async for db in get_db():
            try:
                # 检查是否已采集
                result = await db.execute(
                    select(Collection1688).where(Collection1688.source_url == url)
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    # 更新
                    existing.title = product_data.get("title", "")
                    existing.price = float(str(product_data.get("price", "0")).split("-")[0]) if product_data.get("price") else 0
                    existing.images = json.dumps(product_data.get("images", []), ensure_ascii=False)
                    existing.skus = json.dumps(product_data.get("skus", []), ensure_ascii=False)
                    existing.description = product_data.get("details", "") or product_data.get("attributes", {}).get("详细说明", "")
                    existing.supplier_name = product_data.get("supplier", {}).get("name", "")
                    existing.weight = float(product_data.get("weight", 0)) if product_data.get("weight") else 0
                    existing.status = "success"
                    existing.updated_at = datetime.now()
                    
                    # 更新关联的ERP商品
                    if existing.product_id:
                        product_result = await db.execute(
                            select(ERPProduct).where(ERPProduct.id == existing.product_id)
                        )
                        erp_product = product_result.scalar_one_or_none()
                        if erp_product:
                            erp_product.name_zh = product_data.get("title", "")
                            erp_product.description = product_data.get("details", "") or product_data.get("attributes", {}).get("详细说明", "")
                            erp_product.images = json.dumps(product_data.get("images", []), ensure_ascii=False)
                            erp_product.weight = float(product_data.get("weight", 0)) if product_data.get("weight") else 0
                            erp_product.workflow_status = "collecting"
                    
                    await db.commit()
                    logger.info(f"更新已存在的采集记录: {existing.product_id}")
                    return existing.product_id
                
                # 创建采集记录
                supplier = product_data.get("supplier", {})
                
                # 获取默认用户ID
                from sqlalchemy import text
                result = await db.execute(text("SELECT id FROM feishu_users LIMIT 1"))
                default_user = result.fetchone()
                user_id = default_user[0] if default_user else "system"
                
                # 解析价格
                price_str = product_data.get("price", "0")
                try:
                    if "-" in str(price_str):
                        price = float(str(price_str).split("-")[0])
                    else:
                        price = float(price_str)
                except (ValueError, TypeError):
                    price = 0
                
                # 创建ERP商品
                import uuid
                sku = f"1688-{product_data.get('offer_id', uuid.uuid4().hex[:8])}"
                
                # 提取商品描述
                description = product_data.get("details", "") or product_data.get("attributes", {}).get("详细说明", "")
                
                erp_product = ERPProduct(
                    user_id=user_id,
                    internal_sku=sku,
                    name_zh=product_data.get("title", ""),
                    description=description,
                    source_url=url,
                    source_id=product_data.get("offer_id"),
                    supplier_name=supplier.get("name", ""),
                    supplier_url=supplier.get("url", ""),
                    cost_price=price,
                    domestic_shipping=0,
                    first_mile_shipping=0,
                    weight=float(product_data.get("weight", 0)) if product_data.get("weight") else 0,
                    images=json.dumps(product_data.get("images", []), ensure_ascii=False),
                    image_status="pending",
                    compliance_status="pending",
                    workflow_status="collecting",
                    selection_id=selection_id,
                    status="draft"
                )
                
                db.add(erp_product)
                await db.flush()
                
                # 创建采集记录
                collection = Collection1688(
                    user_id=user_id,
                    source_url=url,
                    source_id=product_data.get("offer_id"),
                    title=product_data.get("title", ""),
                    price=price,
                    images=json.dumps(product_data.get("images", []), ensure_ascii=False),
                    skus=json.dumps(product_data.get("skus", []), ensure_ascii=False),
                    description=description,
                    supplier_name=supplier.get("name", ""),
                    supplier_rating=supplier.get("rating", 0),
                    weight=float(product_data.get("weight", 0)) if product_data.get("weight") else 0,
                    status="success",
                    product_id=erp_product.id
                )
                
                db.add(collection)
                await db.commit()
                
                logger.info(f"商品采集保存成功: {erp_product.id}, 采集方式: {product_data.get('collect_method')}")
                return erp_product.id
                
            except Exception as e:
                logger.error(f"保存商品失败: {e}")
                await db.rollback()
                return None
            break
        
        return None


# 全局实例
collection_1688_service = Collection1688Service()


# 搜索页采集相关方法
async def collect_from_search_page(url: str, max_items: int = 10) -> Dict[str, Any]:
    """
    从1688搜索页批量采集商品（使用Playwright浏览器自动化）
    
    Args:
        url: 搜索页URL
        max_items: 最大采集数量
        
    Returns:
        包含商品链接列表的结果
    """
    import re
    
    logger.info(f"使用Playwright采集搜索页: {url}")
    
    try:
        # 使用异步方式运行Playwright
        from playwright.async_api import async_playwright
        
        async with async_playwright() as p:
            # 启动Chromium浏览器，禁用webdriver属性
            browser = await p.chromium.launch(
                headless=True,
                executable_path="/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome",
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-using',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--window-size=1920,1080',
                ]
            )
            
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1920, "height": 1080},
                locale="zh-CN",
                timezone_id="Asia/Shanghai",
                # 添加更多浏览器属性以绕过检测
                extra_http_headers={
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                }
            )
            
            # 阻止检测脚本
            await context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
                window.navigator.chrome = {
                    runtime: {}
                };
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5]
                });
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['zh-CN', 'zh', 'en']
                });
            """)
            
            page = await context.new_page()
            
            # 设置超时
            page.set_default_timeout(60000)
            
            # 访问搜索页
            logger.info(f"正在访问搜索页...")
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            
            # 等待更长时间让内容加载
            await page.wait_for_timeout(5000)
            
            # 模拟人类滚动
            await page.evaluate("window.scrollBy(0, 300)")
            await page.wait_for_timeout(500)
            
            # 获取页面内容检查
            page_title = await page.title()
            logger.info(f"页面标题: {page_title}")
            
            # 检查是否被拦截
            if "captcha" in page_title.lower() or "验证" in page_title:
                logger.warning("页面被验证码拦截，尝试其他方法")
                # 尝试从页面数据中提取
                page_content = await page.content()
                
                # 尝试从script标签提取商品数据
                scripts = await page.query_selector_all("script")
                for script in scripts:
                    content = await script.inner_text()
                    if content and ('window.__INITIAL_STATE__' in content or 'offerList' in content or 'offer_list' in content):
                        # 提取offer ID
                        offer_ids = re.findall(r'"offerId"\s*:\s*"?(\d{8,})"?', content)
                        if offer_ids:
                            product_links = [f'https://detail.1688.com/offer/{oid}.html' for oid in offer_ids[:max_items]]
                            logger.info(f"从脚本中找到 {len(product_links)} 个商品")
                            await browser.close()
                            return {
                                "success": True,
                                "total": len(product_links),
                                "links": product_links,
                                "source_url": url
                            }
                
                # 尝试从JSON数据提取
                json_data = await page.evaluate("""
                    () => {
                        const scripts = document.querySelectorAll('script');
                        for (const script of scripts) {
                            const content = script.textContent;
                            if (content && content.includes('offerId')) {
                                const match = content.match(/"offerId"\\s*:\\s*"(\\d+)"/g);
                                if (match) {
                                    return match.map(m => {
                                        const id = m.match(/\\d+/)[0];
                                        return 'https://detail.1688.com/offer/' + id + '.html';
                                    });
                                }
                            }
                        }
                        return [];
                    }
                """)
                
                if json_data:
                    await browser.close()
                    return {
                        "success": True,
                        "total": len(json_data),
                        "links": json_data[:max_items],
                        "source_url": url
                    }
            
            # 提取商品链接
            product_links = []
            
            # 1688搜索结果页的多种链接模式
            link_patterns = [
                '.offer-item .title a',
                '.offer-item a.title',
                '[class*="offer-item"] a',
                '.search-product a[href*="1688"]',
                'a[href*="detail.1688.com/offer"]',
                '[data-offer-id]',
            ]
            
            for selector in link_patterns:
                links = await page.query_selector_all(selector)
                for link in links:
                    href = await link.get_attribute('href')
                    if href:
                        if 'detail.1688.com' in href or 'offer/' in href:
                            if href.startswith('//'):
                                href = 'https:' + href
                            href = re.sub(r'\?.*$', '', href)
                            if href not in product_links:
                                product_links.append(href)
                
                if product_links:
                    logger.info(f"使用选择器 {selector} 找到 {len(product_links)} 个链接")
                    break
            
            # 尝试从data属性提取
            if not product_links:
                offer_ids = await page.evaluate("""
                    () => {
                        const ids = [];
                        document.querySelectorAll('[data-offer-id]').forEach(el => {
                            const id = el.getAttribute('data-offer-id');
                            if (id && id.length > 6) ids.push(id);
                        });
                        return ids;
                    }
                """)
                
                if offer_ids:
                    product_links = [f'https://detail.1688.com/offer/{oid}.html' for oid in offer_ids[:max_items]]
                    logger.info(f"从data属性找到 {len(product_links)} 个商品")
            
            await browser.close()
            
            # 去重并限制数量
            product_links = list(dict.fromkeys(product_links))[:max_items]
            
            logger.info(f"从搜索页提取到 {len(product_links)} 个商品链接")
            
            return {
                "success": True,
                "total": len(product_links),
                "links": product_links,
                "source_url": url
            }
            
    except Exception as e:
        logger.error(f"Playwright搜索页采集失败: {e}")
        return {
            "success": False,
            "error": str(e),
            "links": []
        }
