"""
视频生成智能体 - 使用 coze-coding-dev-sdk 调用豆包视频模型
"""
import asyncio
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime
from loguru import logger

from coze_coding_dev_sdk import VideoGenerationClient
from coze_coding_utils.runtime_ctx.context import new_context


class VideoGenerationAgent:
    """视频生成智能体"""
    
    def __init__(self):
        self.name = "视频生成智能体"
        self.description = "AI生成商品营销视频，支持文生视频、图生视频"
        self._client = None
        self._tasks: Dict[str, Dict[str, Any]] = {}
    
    def _get_client(self) -> VideoGenerationClient:
        """获取视频生成客户端"""
        if self._client is None:
            ctx = new_context(method="generate")
            self._client = VideoGenerationClient(ctx=ctx)
        return self._client
    
    async def generate_video(
        self,
        prompt: str,
        image_url: Optional[str] = None,
        resolution: str = "720p",
        ratio: str = "9:16",
        duration: int = 5,
        watermark: bool = False,
        generate_audio: bool = True,
        style: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        生成视频
        
        Args:
            prompt: 视频描述
            image_url: 参考图片URL（图生视频）
            resolution: 分辨率 (480p, 720p, 1080p)
            ratio: 宽高比 (16:9, 9:16, 1:1, 4:3, 3:4, 21:9)
            duration: 时长 (5-12秒)
            watermark: 是否添加水印
            generate_audio: 是否生成音频
            style: 风格描述
            
        Returns:
            视频生成结果
        """
        logger.info(f"开始生成视频: prompt={prompt[:50]}...")
        
        try:
            client = self._get_client()
            
            # 构建生成参数
            params = {
                "prompt": prompt,
                "resolution": resolution,
                "ratio": ratio,
                "duration": duration,
                "watermark": watermark,
                "generate_audio": generate_audio,
            }
            
            if image_url:
                params["image_url"] = image_url
            
            if style:
                params["style"] = style
            
            # 调用视频生成
            task = client.generate(**params)
            
            # 创建任务记录
            task_id = f"VID{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"
            task_info = {
                "task_id": task_id,
                "status": "processing",
                "prompt": prompt,
                "image_url": image_url,
                "resolution": resolution,
                "ratio": ratio,
                "duration": duration,
                "created_at": datetime.now().isoformat(),
                "task": task,
            }
            self._tasks[task_id] = task_info
            
            # 获取结果
            result = task.wait_for_completed(timeout=300)  # 5分钟超时
            
            if result:
                # 视频生成成功
                task_info["status"] = "completed"
                task_info["video_url"] = result.video_url
                task_info["last_frame"] = result.last_frame
                task_info["completed_at"] = datetime.now().isoformat()
                
                return {
                    "task_id": task_id,
                    "status": "success",
                    "video_url": result.video_url,
                    "last_frame": result.last_frame,
                    "duration": duration,
                    "resolution": resolution,
                    "ratio": ratio,
                    "fps": 24,
                    "model": "doubao-seedance-1-5-pro-251215",
                    "thumbnail_url": result.last_frame,
                    "created_at": task_info["created_at"],
                }
            else:
                # 视频生成超时或失败
                task_info["status"] = "failed"
                task_info["error"] = "视频生成超时或失败"
                
                return {
                    "task_id": task_id,
                    "status": "failed",
                    "error": "视频生成超时，请稍后重试",
                    "created_at": task_info["created_at"],
                }
                
        except Exception as e:
            logger.error(f"视频生成失败: {e}")
            return {
                "task_id": f"VID{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "status": "failed",
                "error": str(e),
            }
    
    async def generate_from_product(
        self,
        product_name: str,
        product_description: Optional[str] = None,
        product_images: Optional[List[str]] = None,
        video_type: str = "product_showcase",
        duration: int = 5,
        style: Optional[str] = None,
        language: str = "en",
    ) -> Dict[str, Any]:
        """
        根据商品信息生成视频
        
        Args:
            product_name: 商品名称
            product_description: 商品描述
            product_images: 商品图片URL列表
            video_type: 视频类型 (script, voiceover, slideshow, full, product_showcase)
            duration: 时长
            style: 风格
            language: 语言
            
        Returns:
            视频生成结果
        """
        logger.info(f"根据商品生成视频: {product_name}")
        
        # 根据视频类型生成不同的prompt
        if video_type == "script":
            prompt = self._generate_script_prompt(product_name, product_description, language)
        elif video_type == "slideshow":
            prompt = self._generate_slideshow_prompt(product_name, product_description, language)
        elif video_type == "product_showcase":
            prompt = self._generate_showcase_prompt(product_name, product_description, language)
        else:
            prompt = self._generate_full_prompt(product_name, product_description, language)
        
        # 选择参考图片
        image_url = product_images[0] if product_images else None
        
        return await self.generate_video(
            prompt=prompt,
            image_url=image_url,
            duration=duration,
            style=style,
        )
    
    def _generate_script_prompt(self, name: str, desc: Optional[str], lang: str) -> str:
        """生成脚本视频prompt"""
        return f"""Create a promotional video script for product: {name}.
{'Description: ' + desc if desc else ''}
Style: Educational and informative, showcasing product features.
Language: {lang.upper()}"""
    
    def _generate_slideshow_prompt(self, name: str, desc: Optional[str], lang: str) -> str:
        """生成幻灯片视频prompt"""
        return f"""Create a slideshow-style promotional video for product: {name}.
{'Showcase features: ' + desc if desc else 'Showcase key product features and benefits.'}
Style: Modern, clean transitions between images.
Duration: 5-12 seconds loop.
Language: {lang.upper()}"""
    
    def _generate_showcase_prompt(self, name: str, desc: Optional[str], lang: str) -> str:
        """生成产品展示视频prompt"""
        return f"""Create an engaging product showcase video for {name}.
{'Highlight: ' + desc if desc else 'Show the product in use, highlighting key features and benefits.'}
Style: Dynamic, energetic, suitable for TikTok/social media.
Include: Product close-ups, usage scenarios, key selling points.
Language: {lang.upper()}"""
    
    def _generate_full_prompt(self, name: str, desc: Optional[str], lang: str) -> str:
        """生成完整视频prompt"""
        return f"""Create a complete promotional video for {name}.
{'Product details: ' + desc if desc else 'Create an engaging product presentation.'}
Include:
- Eye-catching opening hook
- Product introduction and features
- Usage demonstration
- Call to action
Style: Professional yet casual, perfect for e-commerce platforms.
Duration: 5-12 seconds.
Language: {lang.upper()}"""
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """获取任务状态"""
        task = self._tasks.get(task_id)
        if not task:
            return None
        
        return {
            "task_id": task_id,
            "status": task["status"],
            "video_url": task.get("video_url"),
            "error": task.get("error"),
            "created_at": task["created_at"],
        }


# 全局实例
video_generation_agent = VideoGenerationAgent()
