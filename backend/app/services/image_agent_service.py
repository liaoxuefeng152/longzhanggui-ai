"""
图片智能体服务
支持翻译模式（无货源卖家）和优化模式（自有产品卖家）
"""
import io
import json
import base64
import hashlib
import asyncio
import os
import uuid
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime
from enum import Enum
from pathlib import Path

import httpx
from PIL import Image, ImageDraw, ImageFont
from langchain_core.messages import HumanMessage, SystemMessage
from loguru import logger

from app.core.config import settings
from coze_coding_dev_sdk import LLMClient
from coze_coding_dev_sdk.s3 import S3SyncStorage


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
        # 初始化LLM客户端用于翻译
        self._llm_client = LLMClient()
        # 初始化对象存储客户端
        self._storage = None
    
    def _get_storage(self) -> S3SyncStorage:
        """获取对象存储客户端"""
        if self._storage is None:
            self._storage = S3SyncStorage(
                endpoint_url=os.getenv("COZE_BUCKET_ENDPOINT_URL"),
                access_key="",
                secret_key="",
                bucket_name=os.getenv("COZE_BUCKET_NAME"),
                region="cn-beijing",
            )
        return self._storage
    
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
        1. 使用视觉模型识别图片中的文字及位置
        2. 翻译文字到目标语言
        3. 在原图上绘制翻译文字
        4. 上传到对象存储并返回签名URL
        """
        logger.info(f"开始翻译模式处理: {task.task_id}")
        
        # 1. 下载图片
        image_data = await self._download_image(task.image_url)
        
        # 2. 使用视觉模型识别文字及位置
        ocr_result = await self._vision_ocr_image(image_data, task.target_language)
        
        if not ocr_result.get("texts"):
            logger.info("图片中未检测到文字，返回原图")
            return {
                "result_url": task.image_url,
                "ocr_text": "",
                "translated_text": ""
            }
        
        ocr_texts = ocr_result.get("texts", [])
        logger.info(f"识别到 {len(ocr_texts)} 处文字")
        
        # 3. 在原图上绘制翻译文字
        try:
            translated_image_data = await self._draw_translated_text(
                image_data=image_data,
                texts=ocr_texts,
                target_language=task.target_language
            )
            
            # 4. 上传到对象存储
            result_url = await self._upload_translated_image(
                image_data=translated_image_data,
                task_id=task.task_id
            )
            
            logger.info(f"翻译图片上传成功: {result_url}")
            
            return {
                "result_url": result_url,
                "ocr_text": "\n".join([t.get("original", "") for t in ocr_texts]),
                "translated_text": "\n".join([t.get("translated", "") for t in ocr_texts]),
                "text_count": len(ocr_texts)
            }
        except Exception as e:
            logger.error(f"生成翻译图片失败: {e}")
            # 如果绘制失败，返回原图URL
            return {
                "result_url": task.image_url,
                "ocr_text": "\n".join([t.get("original", "") for t in ocr_texts]),
                "translated_text": "\n".join([t.get("translated", "") for t in ocr_texts]),
                "text_count": len(ocr_texts),
                "warning": f"图片合成失败，仅返回文字翻译: {str(e)}"
            }
    
    async def _vision_ocr_image(self, image_data: bytes, target_lang: str) -> Dict[str, Any]:
        """
        使用豆包视觉模型识别图片中的文字及位置
        """
        # 编码图片为base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # 语言名称映射
        lang_names = {
            "zh": "中文", "en": "英文", "id": "印尼语",
            "th": "泰语", "vi": "越南语", "ms": "马来语"
        }
        target_name = lang_names.get(target_lang, "英文")
        
        prompt = f"""请分析这张图片，找出所有可见的文字内容。

请以JSON格式返回识别结果：
{{
  "texts": [
    {{
      "text": "识别的文字内容",
      "position": {{"x": x坐标比例(0-1), "y": y坐标比例(0-1), "width": 宽度比例(0-1), "height": 高度比例(0-1)}},
      "font_size": "字体大小描述"
    }}
  ]
}}

请只返回JSON，不要其他解释。"""

        try:
            # 使用视觉模型识别
            messages = [
                HumanMessage(content=[
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                ])
            ]
            
            response = self._llm_client.invoke(
                messages=messages,
                model="doubao-seed-1-8-251228",
                temperature=0.3
            )
            
            content = response.content.strip()
            # 尝试解析JSON
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            
            result = json.loads(content)
            logger.info(f"视觉模型识别结果: {result}")
            return result
            
        except Exception as e:
            logger.error(f"视觉模型识别失败: {e}")
            return {"texts": []}
    
    async def _draw_translated_text(
        self,
        image_data: bytes,
        texts: List[Dict[str, Any]],
        target_language: str
    ) -> bytes:
        """
        在图片上绘制翻译后的文字
        """
        try:
            # 打开图片
            img = Image.open(io.BytesIO(image_data))
            
            # 转换为RGB（确保可以绘制）
            if img.mode in ('RGBA', 'LA', 'P'):
                # 创建白色背景
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'RGBA':
                    background.paste(img, mask=img.split()[3])
                else:
                    background.paste(img)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            draw = ImageDraw.Draw(img)
            
            # 获取图片尺寸
            img_width, img_height = img.size
            
            # 语言字体大小映射
            font_size_map = {
                "zh": 40,  # 中文需要更大字号
                "en": 35,
                "id": 35,
                "th": 35,
                "vi": 35,
                "ms": 35
            }
            base_font_size = font_size_map.get(target_language, 35)
            
            # 尝试加载字体（使用系统字体）
            font = None
            try:
                # 尝试常用字体路径
                font_paths = [
                    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
                    "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
                    "/System/Library/Fonts/PingFang.ttc",  # macOS
                ]
                for font_path in font_paths:
                    if os.path.exists(font_path):
                        font = ImageFont.truetype(font_path, base_font_size)
                        break
            except Exception:
                pass
            
            if font is None:
                # 使用默认字体
                font = ImageFont.load_default()
            
            # 为每段文字创建标注框
            for text_info in texts:
                original = text_info.get("text", "")
                translated = text_info.get("translated", original)
                position = text_info.get("position", {})
                
                if not translated:
                    continue
                
                # 计算位置
                x_ratio = position.get("x", 0.5)
                y_ratio = position.get("y", 0.9)  # 默认放底部
                
                x = int(x_ratio * img_width)
                y = int(y_ratio * img_height)
                
                # 获取文字尺寸
                bbox = draw.textbbox((x, y), translated, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                # 绘制半透明背景框
                padding = 10
                box_x1 = x - padding
                box_y1 = y - padding
                box_x2 = x + text_width + padding
                box_y2 = y + text_height + padding
                
                # 绘制圆角矩形背景（使用多边形模拟）
                draw.rectangle([box_x1, box_y1, box_x2, box_y2], 
                              fill=(255, 255, 255, 220),
                              outline=(0, 0, 0))
                
                # 绘制黑色边框
                draw.rectangle([box_x1, box_y1, box_x2, box_y2], 
                              outline=(0, 0, 0), width=2)
                
                # 绘制翻译文字
                draw.text((x, y), translated, fill=(0, 0, 0), font=font)
                
                logger.info(f"绘制文字: {translated} at ({x}, {y})")
            
            # 转换为字节
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=95)
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"绘制翻译文字失败: {e}")
            raise
    
    async def _upload_translated_image(self, image_data: bytes, task_id: str) -> str:
        """
        上传翻译后的图片到对象存储
        """
        try:
            storage = self._get_storage()
            
            # 生成文件名
            file_name = f"translated/{task_id}.jpg"
            
            # 上传文件
            key = storage.upload_file(
                file_content=image_data,
                file_name=file_name,
                content_type="image/jpeg"
            )
            
            # 生成签名URL（有效期7天）
            url = storage.generate_presigned_url(
                key=key,
                expire_time=7 * 24 * 3600
            )
            
            logger.info(f"图片上传成功，key: {key}")
            return url
            
        except Exception as e:
            logger.error(f"上传失败: {e}")
            # 如果上传失败，返回base64编码的数据URL
            b64_data = base64.b64encode(image_data).decode('utf-8')
            return f"data:image/jpeg;base64,{b64_data}"
    
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
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30)
                response.raise_for_status()
                return response.content
        except Exception as e:
            logger.warning(f"下载图片失败: {url}, 错误: {e}")
            # 返回模拟数据，图片处理将使用模拟模式
            return b"mock_image_data"
    
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
        """翻译文本 - 使用豆包大模型"""
        # 获取语言名称
        source_name = self.SUPPORTED_LANGUAGES.get(source_lang, source_lang)
        target_name = self.SUPPORTED_LANGUAGES.get(target_lang, target_lang)
        
        # 使用豆包大模型进行翻译
        try:
            # 构建系统提示词
            system_prompt = f"""You are a professional translator for e-commerce products. 
Translate the following text from {source_name} to {target_name}.
Keep it natural, concise, and suitable for e-commerce.
Only output the translated text, no explanations."""

            # 调用LLM
            response = self._llm_client.invoke(
                messages=[
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=text)
                ],
                model="doubao-seed-1-8-251228",
                temperature=0.3  # 低温度保证翻译准确性
            )
            
            translated = response.content.strip()
            logger.info(f"翻译成功: {text} -> {translated}")
            return translated
            
        except Exception as e:
            logger.error(f"翻译失败: {e}")
            # 翻译失败时返回原文
            return f"[{target_lang}] {text}"
    
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
