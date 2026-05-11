"""
妙手ERP采集模块
使用妙手ERP官方API进行商品采集
"""
import re
import json
from typing import Optional, Dict, Any
from datetime import datetime
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup


class MiaoshouCollectionService:
    """妙手ERP采集服务"""
    
    def __init__(self, cookies: str = None):
        self.base_url = "https://erp.91miaoshou.com"
        self.api_base = f"{self.base_url}/api"
        
        # 请求头
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": self.base_url,
            "Referer": f"{self.base_url}/",
        }
        
        self.cookies = cookies or ""
        self._client = None
    
    def set_cookies(self, cookies: str):
        """设置Cookie"""
        self.cookies = cookies
        if self._client:
            self._client.cookies = httpx.Cookies()
            for cookie in self.cookies.split(';'):
                cookie = cookie.strip()
                if '=' in cookie:
                    key, value = cookie.split('=', 1)
                    self._client.cookies.set(key.strip(), value)
    
    async def _get_client(self) -> httpx.AsyncClient:
        """获取HTTP客户端"""
        if self._client is None:
            self._client = httpx.AsyncClient(
                headers=self.headers,
                timeout=60.0,
                follow_redirects=True,
                verify=False
            )
            if self.cookies:
                for cookie in self.cookies.split(';'):
                    cookie = cookie.strip()
                    if '=' in cookie:
                        key, value = cookie.split('=', 1)
                        self._client.cookies.set(key.strip(), value)
        return self._client
    
    async def close(self):
        """关闭资源"""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    def _extract_product_url(self, url: str) -> str:
        """提取商品URL"""
        parsed = urlparse(url)
        # 如果是1688链接，直接返回
        if '1688.com' in url:
            return url
        # 如果是淘宝/天猫链接，转换为1688可能不直接支持
        if 'taobao.com' in url or 'tmall.com' in url:
            return url
        return url
    
    async def collect_product(self, url: str, platform: str = '1688') -> Optional[Dict[str, Any]]:
        """
        使用妙手ERP采集单个商品
        
        Args:
            url: 商品链接
            platform: 平台类型 (1688/taobao/tmall)
            
        Returns:
            商品信息字典，失败时返回None
        """
        try:
            client = await self._get_client()
            
            # 构建采集请求
            # 根据抓包数据分析，妙手ERP使用表单数据
            data = {
                'itemUrl': self._extract_product_url(url),
                'collectBoxSetting': json.dumps({
                    'collectBoxId': '',  # 空表示使用默认采集箱
                    'isAddToCollectBox': True,
                    'collectPlatform': platform,
                })
            }
            
            # 调用妙手ERP采集API
            response = await client.post(
                f"{self.api_base}/move/common_collect_box/fetchItem",
                data=data
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('code') == 0 or result.get('success'):
                    return self._parse_product(result.get('data', {}))
                else:
                    return None
            elif response.status_code == 401:
                raise Exception("妙手ERP认证失败，请检查Cookie是否有效")
            else:
                raise Exception(f"采集失败: HTTP {response.status_code}")
                
        except Exception as e:
            raise e
    
    def _parse_product(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """解析妙手ERP返回的商品数据"""
        return {
            'name': data.get('subject', ''),
            'price': data.get('price', ''),
            'image': data.get('imageUrl', ''),
            'images': data.get('imageList', []),
            'description': data.get('description', ''),
            'sku': data.get('skuInfos', []),
            'stock': data.get('canSellCount', 0),
            'platform': data.get('platform', '1688'),
            'original_url': data.get('itemUrl', ''),
            'collect_time': datetime.now().isoformat(),
        }
    
    async def batch_collect(self, urls: list, platform: str = '1688') -> list:
        """
        批量采集商品
        
        Args:
            urls: 商品链接列表
            platform: 平台类型
            
        Returns:
            成功采集的商品列表
        """
        results = []
        for url in urls:
            try:
                product = await self.collect_product(url, platform)
                if product:
                    results.append(product)
            except Exception as e:
                print(f"采集失败 {url}: {str(e)}")
                continue
        return results


# 全局服务实例
_miaoshou_service: MiaoshouCollectionService = None


def get_miaoshou_service(cookies: str = None) -> MiaoshouCollectionService:
    """获取妙手ERP服务实例"""
    global _miaoshou_service
    if _miaoshou_service is None or cookies:
        _miaoshou_service = MiaoshouCollectionService(cookies)
    return _miaoshou_service
