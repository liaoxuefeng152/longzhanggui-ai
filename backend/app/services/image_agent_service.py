"""
图片智能体服务
支持翻译模式（无货源卖家）和优化模式（自有产品卖家）
"""
import io
import json
import base64
import hashlib
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum
from pathlib import Path

import httpx
from loguru import logger

from app.core.config import settings


class ImageProcessMode(str, Enum):
    """图片处理模式"""
    TRANSLATE = "translate"  # 翻译模式
    OPTIMIZE = "optimize"   # 优化模式


class ImageTask:
    """图片处理任务"""
    def __init__(
        self,
        task_id: str,
        image_url: str,
        mode: ImageProcessMode,
        source_language: str = "zh",
        target_language: str = "en"
    ):
        self.task_id = task_id
        self.image_url = image_url
        self.mode = mode
        self.source_language = source_language
        self.target_language = target_language
        self.status = "pending"
        self.result_url: Optional[str] = None
        self.error: Optional[str] = None
        self.created_at = datetime.now()
        self.completed_at: Optional[datetime] = None


class ImageIntelligentAgent:
    """图片智能体"""
    
    # 支持的语言
    SUPPORTED_LANGUAGES = {
        "zh": "中文",
        "en": "English",
        "id": "Bahasa Indonesia",
        "th": "ภาษาไทย",
        "vi": "Tiếng Việt",
        "ms": "Bahasa Melayu",
    }
    
    # OCR API配置（使用阿里云/腾讯云等）
    OCR_API_URL = "https://ocr.cn-shanghai.aliyuncs.com/"
    
    # 翻译API配置
    TRANSLATE_API_URL = "https://mt.cn-shanghai.aliyuncs.com/"
    
    def __init__(self):
        self._tasks: Dict[str, ImageTask] = {}
    
    async def process_image(
        self,
        image_url: str,
        mode: ImageProcessMode = ImageProcessMode.TRANSLATE,
        source_language: str = "zh",
        target_language: str = "en",
        options: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        处理图片
        
        Args:
            image_url: 图片URL
            mode: 处理模式（翻译/优化）
            source_language: 源语言
            target_language: 目标语言
            options: 额外选项
            
        Returns:
            处理结果
        """
        import uuid
        task_id = str(uuid.uuid4())
        
        task = ImageTask(
            task_id=task_id,
            image_url=image_url,
            mode=mode,
            source_language=source_language,
            target_language=target_language
        )
        
        self._tasks[task_id] = task
        
        try:
            if mode == ImageProcessMode.TRANSLATE:
                result = await self._process_translate(task, options or {})
            else:
                result = await self._process_optimize(task, options or {})
            
            task.status = "completed"
            task.result_url = result.get("result_url")
            task.completed_at = datetime.now()
            
            return {
                "task_id": task_id,
                "status": "success",
                "mode": mode,
                "result_url": result.get("result_url"),
                "ocr_text": result.get("ocr_text"),
                "translated_text": result.get("translated_text"),
            }
            
        except Exception as e:
            task.status = "failed"
            task.error = str(e)
            logger.error(f"图片处理失败: {e}")
            
            return {
                "task_id": task_id,
                "status": "failed",
                "error": str(e)
            }
    
    async def _process_translate(
        self,
        task: ImageTask,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        翻译模式处理
        1. OCR识别图片中的文字
        2. 翻译文字到目标语言
        3. 合成新图片
        """
        logger.info(f"开始翻译模式处理: {task.task_id}")
        
        # 1. 下载图片
        image_data = await self._download_image(task.image_url)
        
        # 2. OCR识别
        ocr_result = await self._ocr_image(image_data)
        ocr_texts = ocr_result.get("texts", [])
        
        if not ocr_texts:
            logger.info("图片中未检测到文字，返回原图")
            return {
                "result_url": task.image_url,
                "ocr_text": "",
                "translated_text": ""
            }
        
        # 3. 翻译文字
        translations = []
        for text_info in ocr_texts:
            original_text = text_info.get("text", "")
            if original_text:
                translated = await self._translate_text(
                    original_text,
                    task.source_language,
                    task.target_language
                )
                translations.append({
                    "original": original_text,
                    "translated": translated,
                    "position": text_info.get("position"),
                    "font_size": text_info.get("font_size")
                })
        
        # 4. 合成新图片
        result_url = await self._compose_translated_image(
            image_data,
            translations,
            task.target_language
        )
        
        return {
            "result_url": result_url,
            "ocr_text": "\n".join([t["original"] for t in translations]),
            "translated_text": "\n".join([t["translated"] for t in translations])
        }
    
    async def _process_optimize(
        self,
        task: ImageTask,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        优化模式处理
        1. 去水印
        2. 白底图/场景图
        3. 尺寸裁剪
        4. 图片美化
        5. 卖点文案叠加
        """
        logger.info(f"开始优化模式处理: {task.task_id}")
        
        # 下载图片
        image_data = await self._download_image(task.image_url)
        
        # 1. 去水印
        if options.get("remove_watermark", True):
            image_data = await self._remove_watermark(image_data)
        
        # 2. 抠图（白底图）
        if options.get("white_background", False):
            image_data = await self._remove_background(image_data)
        
        # 3. 调整尺寸
        target_size = options.get("target_size")
        if target_size:
            image_data = await self._resize_image(image_data, target_size)
        
        # 4. 图片美化
        if options.get("enhance", True):
            image_data = await self._enhance_image(image_data)
        
        # 5. 添加卖点文案
        selling_points = options.get("selling_points", [])
        if selling_points:
            image_data = await self._add_text_overlay(image_data, selling_points)
        
        # 上传处理后的图片
        result_url = await self._upload_result(image_data, task.task_id)
        
        return {
            "result_url": result_url,
            "ocr_text": "",
            "translated_text": ""
        }
    
    async def _download_image(self, url: str) -> bytes:
        """下载图片"""
        # 模拟模式
        if not settings.OPENAI_API_KEY:
            logger.info(f"[模拟] 下载图片: {url}")
            return b"mock_image_data"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30)
            return response.content
    
    async def _ocr_image(self, image_data: bytes) -> Dict[str, Any]:
        """OCR识别"""
        # 模拟模式
        if not settings.OPENAI_API_KEY:
            logger.info("[模拟] OCR识别")
            return {
                "texts": [
                    {"text": "高品质产品", "position": [100, 100], "font_size": 24},
                    {"text": "限时特惠", "position": [100, 150], "font_size": 20}
                ]
            }
        
        # TODO: 调用真实的OCR API
        return {"texts": []}
    
    async def _translate_text(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> str:
        """翻译文本"""
        # 模拟模式
        if not settings.OPENAI_API_KEY:
            logger.info(f"[模拟] 翻译: {text}")
            translations = {
                "高品质产品": "Premium Quality Product",
                "限时特惠": "Limited Time Offer",
                "热销爆款": "Best Seller",
                "包邮": "Free Shipping"
            }
            return translations.get(text, f"[{target_lang}] {text}")
        
        # 使用LLM翻译
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.OPENAI_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": settings.DEFAULT_MODEL,
                        "messages": [
                            {
                                "role": "system",
                                "content": f"You are a professional translator for e-commerce products. Translate the following text from {self.SUPPORTED_LANGUAGES.get(source_lang, source_lang)} to {self.SUPPORTED_LANGUAGES.get(target_lang, target_lang)}. Keep it natural and suitable for e-commerce."
                            },
                            {
                                "role": "user",
                                "content": text
                            }
                        ],
                        "temperature": 0.3
                    },
                    timeout=30
                )
                
                data = response.json()
                return data["choices"][0]["message"]["content"]
                
        except Exception as e:
            logger.error(f"翻译失败: {e}")
            return text
    
    async def _compose_translated_image(
        self,
        image_data: bytes,
        translations: List[Dict],
        target_language: str
    ) -> str:
        """合成翻译后的图片"""
        # 模拟模式
        logger.info(f"[模拟] 合成翻译图片，{len(translations)}处文本")
        
        # 返回模拟URL
        return f"https://storage.example.com/translated/{hashlib.md5(image_data).hexdigest()}.jpg"
    
    async def _remove_watermark(self, image_data: bytes) -> bytes:
        """去水印"""
        logger.info("[模拟] 去水印处理")
        return image_data
    
    async def _remove_background(self, image_data: bytes) -> bytes:
        """抠图（白底）"""
        logger.info("[模拟] 抠图处理")
        return image_data
    
    async def _resize_image(
        self,
        image_data: bytes,
        target_size: tuple
    ) -> bytes:
        """调整尺寸"""
        logger.info(f"[模拟] 调整尺寸: {target_size}")
        return image_data
    
    async def _enhance_image(self, image_data: bytes) -> bytes:
        """图片美化"""
        logger.info("[模拟] 图片美化")
        return image_data
    
    async def _add_text_overlay(
        self,
        image_data: bytes,
        selling_points: List[str]
    ) -> bytes:
        """添加卖点文案"""
        logger.info(f"[模拟] 添加卖点文案: {selling_points}")
        return image_data
    
    async def _upload_result(self, image_data: bytes, task_id: str) -> str:
        """上传处理结果"""
        # 模拟URL
        return f"https://storage.example.com/optimized/{task_id}.jpg"
    
    async def batch_process(
        self,
        image_urls: List[str],
        mode: ImageProcessMode = ImageProcessMode.TRANSLATE,
        source_language: str = "zh",
        target_language: str = "en",
        options: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """批量处理图片"""
        results = []
        
        for url in image_urls:
            result = await self.process_image(
                image_url=url,
                mode=mode,
                source_language=source_language,
                target_language=target_language,
                options=options
            )
            results.append(result)
            
            # 避免请求过快
            await asyncio.sleep(0.5)
        
        return results
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """获取任务状态"""
        task = self._tasks.get(task_id)
        if not task:
            return None
        
        return {
            "task_id": task.task_id,
            "status": task.status,
            "image_url": task.image_url,
            "mode": task.mode,
            "result_url": task.result_url,
            "error": task.error,
            "created_at": task.created_at.isoformat(),
            "completed_at": task.completed_at.isoformat() if task.completed_at else None
        }


# 全局实例
image_agent = ImageIntelligentAgent()
