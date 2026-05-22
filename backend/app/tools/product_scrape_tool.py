"""
商品采集工具 - 供 AI Agent 调用

支持:
1. 1688开放平台API采集（签名认证，结构化数据）
2. HTTPX 爬虫采集（页面解析，降级方案）
3. Playwright 浏览器采集（JS渲染，最后备选）

Agent 调用方式:
    tool = ProductScrapeTool()
    result = await tool.run(url="https://detail.1688.com/offer/123456.html")
"""
import re
import json
from typing import Optional, Dict, Any, List
from datetime import datetime

from loguru import logger

from app.services.alibaba_1688_service import alibaba_1688_service
from app.services.collection_1688_service import collection_1688_service


class ProductScrapeTool:
    """
    商品采集工具

    供 AI Agent 调用，采集1688商品信息。
    采用三级降级策略：API → 爬虫 → 浏览器

    使用示例:
        tool = ProductScrapeTool()
        result = await tool.run(url="https://detail.1688.com/offer/123456.html")
    """

    # 工具元数据（供 Agent 框架识别）
    name: str = "product_scrape"
    description: str = "采集1688商品信息，输入商品链接，返回标题、价格、图片、SKU、供应商等结构化数据"
    parameters: Dict[str, Any] = {
        "type": "object",
        "properties": {
            "url": {
                "type": "string",
                "description": "1688商品链接，如 https://detail.1688.com/offer/123456789.html",
            },
            "save_to_erp": {
                "type": "boolean",
                "description": "是否保存到ERP商品库，默认False",
                "default": False,
            },
        },
        "required": ["url"],
    }

    async def run(
        self,
        url: str,
        save_to_erp: bool = False,
    ) -> Dict[str, Any]:
        """
        执行商品采集

        采集策略（按优先级降级）:
        1. 1688开放平台API（签名认证，数据最完整）
        2. HTTPX 爬虫（页面解析，速度快）
        3. Playwright 浏览器（JS渲染，反爬弱）
        4. 模拟数据兜底（永不失败，需人工补充）

        Args:
            url: 1688商品链接
            save_to_erp: 是否保存到ERP商品库

        Returns:
            采集结果，包含商品完整信息
        """
        logger.info(f"[ProductScrapeTool] 开始采集: url={url}, save_to_erp={save_to_erp}")

        # 参数校验
        if not url or not isinstance(url, str):
            return self._error_result("url参数不能为空", "invalid_params")

        url = url.strip()
        if not url.startswith(("http://", "https://")):
            return self._error_result(f"无效的链接格式: {url}", "invalid_url")

        # 检测搜索页URL
        if collection_1688_service._is_search_page(url):
            return self._error_result(
                "检测到搜索页链接，请使用商品详情页链接进行采集。如需搜索页批量采集，请使用 search_and_collect 方法。",
                "search_page_not_supported",
            )

        # 提取 offerId
        offer_id = alibaba_1688_service.extract_offer_id(url)
        if not offer_id:
            return self._error_result(
                f"无法从链接中提取商品ID，请确认链接格式正确。支持格式: https://detail.1688.com/offer/xxx.html",
                "invalid_url",
            )

        # ========== 策略1: 1688开放平台API ==========
        result = await self._try_api_collect(url, offer_id)
        if result and result.get("success"):
            logger.info(f"[ProductScrapeTool] API采集成功: offerId={offer_id}")
            if save_to_erp:
                product_id = await self._save_to_erp(url, result)
                result["product_id"] = product_id
            return result

        # ========== 策略2: HTTPX 爬虫 ==========
        result = await self._try_httpx_collect(url)
        if result and result.get("success"):
            logger.info(f"[ProductScrapeTool] HTTPX爬虫采集成功: offerId={offer_id}")
            if save_to_erp:
                product_id = await self._save_to_erp(url, result)
                result["product_id"] = product_id
            return result

        # ========== 策略3: Playwright 浏览器 ==========
        result = await self._try_playwright_collect(url)
        if result and result.get("success"):
            logger.info(f"[ProductScrapeTool] Playwright采集成功: offerId={offer_id}")
            if save_to_erp:
                product_id = await self._save_to_erp(url, result)
                result["product_id"] = product_id
            return result

        # ========== 兜底: 所有策略失败 ==========
        logger.warning(f"[ProductScrapeTool] 所有采集策略失败: url={url}")
        return self._error_result(
            f"商品采集失败，所有策略均未成功。offerId={offer_id}",
            "all_strategies_failed",
        )

    # ========================================
    # 采集策略实现
    # ========================================
    async def _try_api_collect(self, url: str, offer_id: str) -> Optional[Dict[str, Any]]:
        """策略1: 通过1688开放平台API采集"""
        try:
            result = await alibaba_1688_service.get_product_info(offer_id)
            if result.get("success"):
                result["source_url"] = url
                result["collected_at"] = datetime.now().isoformat()
                return result
            return None
        except ValueError as e:
            # API凭据未配置
            logger.debug(f"[API采集] 跳过: {e}")
            return None
        except Exception as e:
            logger.warning(f"[API采集] 失败: {e}")
            return None

    async def _try_httpx_collect(self, url: str) -> Optional[Dict[str, Any]]:
        """策略2: 通过HTTPX爬虫采集"""
        try:
            data = await collection_1688_service.collect_product(url)
            if data and data.get("title"):
                data["success"] = True
                data["collected_at"] = datetime.now().isoformat()
                return data
            return None
        except Exception as e:
            logger.warning(f"[HTTPX采集] 失败: {e}")
            return None

    async def _try_playwright_collect(self, url: str) -> Optional[Dict[str, Any]]:
        """策略3: 通过Playwright浏览器采集"""
        try:
            data = await collection_1688_service._collect_with_playwright(url)
            if data and data.get("title"):
                data["success"] = True
                data["collected_at"] = datetime.now().isoformat()
                return data
            return None
        except Exception as e:
            logger.warning(f"[Playwright采集] 失败: {e}")
            return None

    # ========================================
    # 辅助方法
    # ========================================
    async def _save_to_erp(self, url: str, product_data: Dict[str, Any]) -> Optional[str]:
        """保存采集结果到ERP商品库"""
        try:
            product_id = await collection_1688_service.collect_and_save(url)
            if product_id:
                logger.info(f"[ProductScrapeTool] 保存到ERP成功: product_id={product_id}")
            return product_id
        except Exception as e:
            logger.error(f"[ProductScrapeTool] 保存ERP失败: {e}")
            return None

    def _error_result(self, message: str, error_type: str) -> Dict[str, Any]:
        """构建错误返回"""
        return {
            "success": False,
            "error": message,
            "error_type": error_type,
            "collected_at": datetime.now().isoformat(),
        }

    # ========================================
    # 批量采集
    # ========================================
    async def batch_run(self, urls: List[str], save_to_erp: bool = False) -> List[Dict[str, Any]]:
        """
        批量采集商品

        Args:
            urls: 商品链接列表
            save_to_erp: 是否保存到ERP

        Returns:
            采集结果列表
        """
        results = []
        for i, url in enumerate(urls):
            result = await self.run(url=url, save_to_erp=save_to_erp)
            results.append(result)

            # 避免请求过快被封
            if i < len(urls) - 1:
                import asyncio
                await asyncio.sleep(1.5)

        return results

    # ========================================
    # 搜索页批量采集
    # ========================================
    async def search_and_collect(
        self,
        keyword: str,
        max_items: int = 10,
        save_to_erp: bool = False,
    ) -> Dict[str, Any]:
        """
        搜索关键词并采集商品

        Args:
            keyword: 搜索关键词
            max_items: 最大采集数量
            save_to_erp: 是否保存到ERP

        Returns:
            搜索及采集结果
        """
        logger.info(f"[ProductScrapeTool] 搜索采集: keyword={keyword}, max={max_items}")

        # 先搜索
        search_result = await alibaba_1688_service.search_products(keyword=keyword, page_size=max_items)

        if not search_result.get("success"):
            # 降级到爬虫搜索
            search_result = await collection_1688_service.search_products(keyword=keyword, page_size=max_items)

        items = search_result.get("items", [])
        if not items:
            return {
                "success": False,
                "keyword": keyword,
                "items": [],
                "error": "搜索无结果",
            }

        # 采集详情
        collected = []
        for item in items[:max_items]:
            url = item.get("url", "")
            if url:
                result = await self.run(url=url, save_to_erp=save_to_erp)
                collected.append(result)

        return {
            "success": True,
            "keyword": keyword,
            "total_search": len(items),
            "total_collected": len(collected),
            "items": collected,
        }


# 全局工具实例
product_scrape_tool = ProductScrapeTool()
