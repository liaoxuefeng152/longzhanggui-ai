"""
图片设计智能体 - 使用豆包大模型（含视觉能力）
"""
from typing import TypedDict, Annotated, Sequence, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from loguru import logger
import operator
import json
import httpx

from app.agents.base import AgentState
from app.services.llm_service import get_llm_for_agent, LLMService


class ImageDesignState(TypedDict):
    """图片设计智能体状态"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    prompt: str              # 图片描述
    style: str               # 风格：professional, creative, minimalist
    size: str                # 尺寸：1024x1024, 1920x1080, etc.
    product_name: str        # 商品名称
    product_description: str # 商品描述
    reference_images: list[str]  # 参考图片URL
    generated_images: list[dict]  # 生成的图片
    design_suggestions: str  # 设计建议
    next_action: str


class ImageDesignAgent:
    """图片设计智能体"""
    
    SYSTEM_PROMPT = """你是一位专业的电商图片设计专家，精通商品主图、详情图、营销海报的设计。

你的职责是：
1. 根据商品特点提供专业的设计建议
2. 生成符合电商平台规范的图片描述
3. 优化图片以提升点击率和转化率

设计原则：
- 突出产品卖点
- 符合目标市场审美
- 遵守平台规范（如亚马逊、TikTok Shop等）
- 保持品牌一致性"""
    
    # 图片尺寸映射
    SIZE_MAP = {
        "square": "1024x1024",
        "landscape": "1920x1080",
        "portrait": "1080x1920",
        "product_main": "1000x1000",
        "banner": "1920x500",
        "story": "1080x1920"
    }
    
    # 风格提示词
    STYLE_PROMPTS = {
        "professional": "professional product photography, clean background, studio lighting, high-end commercial style",
        "creative": "creative artistic design, vibrant colors, modern style, eye-catching composition",
        "minimalist": "minimalist design, clean white background, simple elegant layout, premium feel",
        "lifestyle": "lifestyle photography, natural lighting, real-life context, warm atmosphere"
    }
    
    def __init__(
        self,
        temperature: float = 0.7,
        image_api_key: str = None,
        image_api_url: str = None
    ):
        """初始化图片设计智能体，使用豆包视觉模型"""
        self.temperature = temperature
        self.image_api_key = image_api_key
        self.image_api_url = image_api_url or "https://api.openai.com/v1"
        
        # 使用豆包大模型 - 视觉模型（支持图片理解）
        self.llm = get_llm_for_agent("image_design", temperature=temperature)
        
        self.workflow = self._build_workflow()
        self.app = self.workflow.compile()
    
    def _build_workflow(self) -> StateGraph:
        """构建图片设计工作流"""
        workflow = StateGraph(ImageDesignState)
        
        # 添加节点
        workflow.add_node("analyze_product", self._analyze_product)
        workflow.add_node("generate_design_prompt", self._generate_design_prompt)
        workflow.add_node("create_images", self._create_images)
        workflow.add_node("review_and_optimize", self._review_and_optimize)
        
        # 设置入口
        workflow.set_entry_point("analyze_product")
        
        # 添加边
        workflow.add_edge("analyze_product", "generate_design_prompt")
        workflow.add_edge("generate_design_prompt", "create_images")
        workflow.add_edge("create_images", "review_and_optimize")
        workflow.add_edge("review_and_optimize", END)
        
        return workflow
    
    async def _analyze_product(self, state: ImageDesignState) -> dict:
        """分析商品特点"""
        prompt = f"""请分析以下商品，提取设计要点：

商品名称：{state.get('product_name', '未指定')}
商品描述：{state.get('product_description', '未指定')}

请提供：
1. 核心卖点（3-5个）
2. 目标受众特征
3. 推荐的设计风格
4. 需要突出的视觉元素"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "design_suggestions": response.content,
            "next_action": "generate_design_prompt"
        }
    
    async def _generate_design_prompt(self, state: ImageDesignState) -> dict:
        """生成图片设计提示词"""
        style = state.get('style', 'professional')
        size = state.get('size', '1024x1024')
        
        style_prompt = self.STYLE_PROMPTS.get(style, self.STYLE_PROMPTS['professional'])
        
        prompt = f"""基于以下商品分析，生成图片设计的详细提示词：

商品分析：{state.get('design_suggestions', '')}
设计风格：{style}
图片尺寸：{size}

请生成一个详细的图片生成提示词（英文），用于AI图片生成工具。
提示词应包含：
1. 产品主体描述
2. 背景和环境
3. 光线和氛围
4. 构图和角度
5. 风格要求

请直接输出提示词，不需要其他解释。"""
        
        messages = [
            {"role": "system", "content": "You are a professional image prompt engineer."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        image_prompt = response.content.strip()
        
        # 组合最终提示词
        final_prompt = f"{image_prompt}, {style_prompt}"
        
        return {
            "messages": [AIMessage(content=final_prompt)],
            "prompt": final_prompt,
            "next_action": "create_images"
        }
    
    async def _create_images(self, state: ImageDesignState) -> dict:
        """创建图片"""
        generated_images = []
        
        # 如果配置了图片生成API
        if self.image_api_key:
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        f"{self.image_api_url}/images/generations",
                        headers={
                            "Authorization": f"Bearer {self.image_api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "model": "dall-e-3",
                            "prompt": state.get('prompt', ''),
                            "n": 1,
                            "size": state.get('size', '1024x1024'),
                            "quality": "standard"
                        }
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        generated_images = [
                            {
                                "url": img["url"],
                                "revised_prompt": img.get("revised_prompt", "")
                            }
                            for img in data.get("data", [])
                        ]
            except Exception as e:
                generated_images = [{
                    "error": str(e),
                    "message": "图片生成失败，请检查API配置"
                }]
        else:
            # 模拟图片生成
            generated_images = [{
                "url": "https://placeholder.com/generated-image.jpg",
                "prompt": state.get('prompt', ''),
                "message": "图片生成API未配置，这是模拟结果"
            }]
        
        return {
            "generated_images": generated_images,
            "next_action": "review_and_optimize"
        }
    
    async def _review_and_optimize(self, state: ImageDesignState) -> dict:
        """审核和优化建议"""
        images = state.get('generated_images', [])
        
        if not images or images[0].get('error'):
            return {"next_action": "completed"}
        
        # 生成优化建议
        prompt = f"""基于生成的图片，提供优化建议：

原始提示词：{state.get('prompt', '')}
生成数量：{len(images)}

请提供：
1. 图片质量评估
2. 改进建议
3. A/B测试建议（如不同风格、角度等）
4. 平台适配建议（亚马逊、TikTok等）"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "next_action": "completed"
        }
    
    async def run(
        self,
        product_name: str = "",
        product_description: str = "",
        style: str = "professional",
        size: str = "1024x1024",
        reference_images: list[str] = None
    ) -> dict:
        """运行图片设计智能体"""
        initial_state = {
            "messages": [],
            "prompt": "",
            "style": style,
            "size": size,
            "product_name": product_name,
            "product_description": product_description,
            "reference_images": reference_images or [],
            "generated_images": [],
            "design_suggestions": "",
            "next_action": ""
        }
        
        result = await self.app.ainvoke(initial_state)
        return result
    
    async def analyze_image(self, image_url: str, question: str = None) -> str:
        """
        分析图片（使用豆包视觉模型）
        
        Args:
            image_url: 图片URL
            question: 问题（可选）
        
        Returns:
            分析结果
        """
        llm_service = LLMService.for_agent("image_design")
        
        messages = [
            HumanMessage(content=[
                {"type": "text", "text": question or "请详细描述这张图片的内容，包括主体、背景、颜色、风格等。"},
                {"type": "image_url", "image_url": {"url": image_url}}
            ])
        ]
        
        return await llm_service.chat(messages)
    
    async def translate_image_text(self, image_url: str, target_lang: str = "en") -> dict:
        """
        识别图片中的文字、翻译，并在原图上绘制翻译后生成新图片上传到对象存储
        
        Args:
            image_url: 图片URL
            target_lang: 目标语言
        
        Returns:
            包含原文、翻译、图片URL的字典
        """
        import io
        import base64
        import uuid
        from PIL import Image, ImageDraw, ImageFont
        from coze_coding_dev_sdk.s3 import S3SyncStorage
        import os
        
        llm_service = LLMService.for_agent("image_design")
        
        # 语言名称映射
        lang_names = {
            "zh": "中文", "en": "英文", "id": "印尼语",
            "th": "泰语", "vi": "越南语", "ms": "马来语"
        }
        target_name = lang_names.get(target_lang, "英文")
        
        prompt = f"""请分析这张图片，找出所有可见的文字内容。

请以JSON格式返回识别结果：
{{
  "original_text": "识别到的所有文字，用换行分隔",
  "texts": [
    {{
      "text": "识别的文字内容",
      "position": {{"x": x坐标比例(0-1), "y": y坐标比例(0-1), "width": 宽度比例, "height": 高度比例}},
      "font_size": "字体大小描述"
    }}
  ]
}}

请只返回JSON，不要其他解释。"""
        
        messages = [
            HumanMessage(content=[
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_url}}
            ])
        ]
        
        try:
            # 1. 使用视觉模型识别文字
            response = await llm_service.json_chat(messages)
            
            original_text = response.get("original_text", "")
            texts = response.get("texts", [])
            
            if not texts:
                return {
                    "original_text": original_text or "",
                    "translated_text": original_text or "",
                    "text_positions": [],
                    "processed_url": image_url
                }
            
            # 2. 翻译每段文字
            translated_texts = []
            system_prompt = f"""你是一个专业的电商翻译。请将以下{target_name}翻译成{target_name}。
保持翻译简洁、自然，适合电商产品展示。
只输出翻译结果，不要解释。"""
            
            for text_info in texts:
                original = text_info.get("text", "")
                if original:
                    translate_messages = [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": original}
                    ]
                    try:
                        llm = get_llm_for_agent("image_design")
                        translate_response = await llm.ainvoke(translate_messages)
                        translated = translate_response.content.strip()
                    except:
                        translated = original
                    
                    text_info["translated"] = translated
                    translated_texts.append(translated_info := {
                        "text": original,
                        "translated": translated,
                        "position": text_info.get("position", {})
                    })
            
            # 3. 下载原图并绘制翻译文字
            async with httpx.AsyncClient() as client:
                resp = await client.get(image_url, timeout=30)
                resp.raise_for_status()
                image_data = resp.content
            
            # 打开图片
            img = Image.open(io.BytesIO(image_data))
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'RGBA':
                    background.paste(img, mask=img.split()[3])
                else:
                    background.paste(img)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            draw = ImageDraw.Draw(img)
            img_width, img_height = img.size
            
            # 字体大小
            base_font_size = 40 if target_lang == "zh" else 35
            
            # 尝试加载字体
            font = None
            for font_path in ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
                if os.path.exists(font_path):
                    try:
                        font = ImageFont.truetype(font_path, base_font_size)
                        break
                    except:
                        pass
            
            if font is None:
                font = ImageFont.load_default()
            
            # 在图片底部绘制翻译文字区域
            all_translated = " | ".join([t["translated"] for t in translated_texts])
            
            # 绘制底部翻译条
            bar_height = 80
            bar_y = img_height - bar_height
            
            # 白色背景
            draw.rectangle([0, bar_y, img_width, img_height], fill=(255, 255, 255))
            
            # 顶部边框
            draw.rectangle([0, bar_y, img_width, bar_y + 2], fill=(0, 0, 0))
            
            # 绘制翻译文字
            draw.text((20, bar_y + 25), all_translated[:100], fill=(0, 0, 0), font=font)
            
            # 4. 上传到对象存储
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=95)
            output_data = output.getvalue()
            
            try:
                storage = S3SyncStorage(
                    endpoint_url=os.getenv("COZE_BUCKET_ENDPOINT_URL"),
                    access_key="",
                    secret_key="",
                    bucket_name=os.getenv("COZE_BUCKET_NAME"),
                    region="cn-beijing",
                )
                
                file_name = f"translated/{uuid.uuid4()}.jpg"
                key = storage.upload_file(
                    file_content=output_data,
                    file_name=file_name,
                    content_type="image/jpeg"
                )
                processed_url = storage.generate_presigned_url(key=key, expire_time=7*24*3600)
            except Exception as e:
                logger.error(f"上传失败: {e}")
                # 上传失败返回base64
                b64 = base64.b64encode(output_data).decode()
                processed_url = f"data:image/jpeg;base64,{b64}"
            
            return {
                "original_text": original_text,
                "translated_text": "\n".join([t["translated"] for t in translated_texts]),
                "text_positions": translated_texts,
                "processed_url": processed_url
            }
            
        except Exception as e:
            logger.error(f"图片翻译处理失败: {e}")
            return {
                "original_text": "",
                "translated_text": "",
                "text_positions": [],
                "processed_url": image_url,
                "error": str(e)
            }
