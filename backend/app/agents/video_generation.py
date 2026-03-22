"""
视频生成智能体
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
import operator
import json
import httpx

from app.agents.base import AgentState


class VideoGenerationState(TypedDict):
    """视频生成智能体状态"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    product_name: str        # 商品名称
    product_description: str # 商品描述
    video_type: str          # 视频类型：product_showcase, tutorial, unboxing, lifestyle
    duration: int            # 时长（秒）
    platform: str            # 目标平台：tiktok, instagram, youtube
    script: str              # 视频脚本
    scenes: list[dict]       # 场景列表
    generated_video: dict    # 生成的视频信息
    optimization_tips: str   # 优化建议
    next_action: str


class VideoGenerationAgent:
    """视频生成智能体"""
    
    SYSTEM_PROMPT = """你是一位专业的短视频创作专家，精通电商产品视频的策划和制作。

你的职责是：
1. 根据产品特点创作吸引人的视频脚本
2. 设计分镜头和场景
3. 提供专业的拍摄和剪辑建议
4. 优化视频以提升观看量和转化率

视频创作原则：
- 前3秒吸引注意力
- 突出产品核心卖点
- 符合平台特色（TikTok快节奏，YouTube更详细）
- 包含明确的行动号召（CTA）"""
    
    # 平台规范
    PLATFORM_SPECS = {
        "tiktok": {
            "duration_range": (15, 60),
            "aspect_ratio": "9:16",
            "resolution": "1080x1920",
            "tips": "快节奏、热门音乐、特效、挑战赛风格"
        },
        "instagram": {
            "duration_range": (15, 90),
            "aspect_ratio": "4:5",
            "resolution": "1080x1350",
            "tips": "美观、生活方式感、故事性"
        },
        "youtube": {
            "duration_range": (30, 300),
            "aspect_ratio": "16:9",
            "resolution": "1920x1080",
            "tips": "详细展示、教育性、专业制作"
        },
        "shopee": {
            "duration_range": (15, 60),
            "aspect_ratio": "1:1",
            "resolution": "1080x1080",
            "tips": "产品展示为主、价格突出、促销信息"
        }
    }
    
    # 视频类型模板
    VIDEO_TEMPLATES = {
        "product_showcase": {
            "name": "产品展示",
            "structure": ["开场吸引", "产品全貌", "细节展示", "使用场景", "购买引导"],
            "duration_per_scene": 3
        },
        "tutorial": {
            "name": "使用教程",
            "structure": ["问题引入", "产品介绍", "使用步骤", "效果展示", "总结"],
            "duration_per_scene": 5
        },
        "unboxing": {
            "name": "开箱体验",
            "structure": ["包装展示", "开箱过程", "产品初见", "配件展示", "第一印象"],
            "duration_per_scene": 4
        },
        "lifestyle": {
            "name": "生活方式",
            "structure": ["生活场景", "问题出现", "产品解决", "美好生活", "品牌露出"],
            "duration_per_scene": 4
        }
    }
    
    def __init__(
        self,
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        api_key: str = None,
        base_url: str = None,
        video_api_key: str = None,
        video_api_url: str = None
    ):
        self.model = model
        self.temperature = temperature
        self.video_api_key = video_api_key
        self.video_api_url = video_api_url
        
        self.llm = ChatOpenAI(
            model=model,
            temperature=temperature,
            api_key=api_key,
            base_url=base_url
        )
        
        self.workflow = self._build_workflow()
        self.app = self.workflow.compile()
    
    def _build_workflow(self) -> StateGraph:
        """构建视频生成工作流"""
        workflow = StateGraph(VideoGenerationState)
        
        # 添加节点
        workflow.add_node("analyze_requirements", self._analyze_requirements)
        workflow.add_node("create_script", self._create_script)
        workflow.add_node("design_scenes", self._design_scenes)
        workflow.add_node("generate_video", self._generate_video)
        workflow.add_node("optimize_output", self._optimize_output)
        
        # 设置入口
        workflow.set_entry_point("analyze_requirements")
        
        # 添加边
        workflow.add_edge("analyze_requirements", "create_script")
        workflow.add_edge("create_script", "design_scenes")
        workflow.add_edge("design_scenes", "generate_video")
        workflow.add_edge("generate_video", "optimize_output")
        workflow.add_edge("optimize_output", END)
        
        return workflow
    
    async def _analyze_requirements(self, state: VideoGenerationState) -> dict:
        """分析视频需求"""
        platform = state.get('platform', 'tiktok')
        video_type = state.get('video_type', 'product_showcase')
        duration = state.get('duration', 30)
        
        platform_spec = self.PLATFORM_SPECS.get(platform, self.PLATFORM_SPECS['tiktok'])
        video_template = self.VIDEO_TEMPLATES.get(video_type, self.VIDEO_TEMPLATES['product_showcase'])
        
        # 验证时长
        min_dur, max_dur = platform_spec['duration_range']
        adjusted_duration = max(min_dur, min(max_dur, duration))
        
        prompt = f"""分析视频制作需求：

商品名称：{state.get('product_name', '未指定')}
商品描述：{state.get('product_description', '未指定')}
目标平台：{platform}
视频类型：{video_template['name']}
视频时长：{adjusted_duration}秒

平台规范：
- 分辨率：{platform_spec['resolution']}
- 比例：{platform_spec['aspect_ratio']}
- 时长范围：{min_dur}-{max_dur}秒
- 特色：{platform_spec['tips']}

请提供视频创意建议：
1. 核心卖点提炼
2. 目标观众画像
3. 视频风格建议
4. 关键视觉元素"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "duration": adjusted_duration,
            "next_action": "create_script"
        }
    
    async def _create_script(self, state: VideoGenerationState) -> dict:
        """创建视频脚本"""
        video_type = state.get('video_type', 'product_showcase')
        duration = state.get('duration', 30)
        video_template = self.VIDEO_TEMPLATES.get(video_type, self.VIDEO_TEMPLATES['product_showcase'])
        
        # 计算每个场景时长
        scene_count = len(video_template['structure'])
        duration_per_scene = duration // scene_count
        
        prompt = f"""为以下商品创作短视频脚本：

商品信息：
{state.get('messages', [])[-1].content if state.get('messages') else ''}

视频结构：{' -> '.join(video_template['structure'])}
总时长：{duration}秒
每场景时长：约{duration_per_scene}秒

请创作：
1. 完整的视频脚本（包含场景描述、旁白文字、画面说明）
2. 每个场景的时间分配
3. 背景音乐建议
4. 字幕要点"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "script": response.content,
            "next_action": "design_scenes"
        }
    
    async def _design_scenes(self, state: VideoGenerationState) -> dict:
        """设计分镜头"""
        prompt = f"""基于以下脚本，设计详细的分镜头：

脚本：
{state.get('script', '')}

请为每个场景提供：
1. 场景编号和名称
2. 画面描述（主体、背景、角度、动作）
3. 时长（秒）
4. 旁白/字幕文字
5. 音乐/音效建议
6. 转场效果

请以JSON格式输出分镜头列表。"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # 解析场景
        try:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            scenes = json.loads(content.strip())
            if not isinstance(scenes, list):
                scenes = []
        except:
            scenes = [{"description": "场景解析失败", "raw": response.content}]
        
        return {
            "messages": [AIMessage(content=response.content)],
            "scenes": scenes,
            "next_action": "generate_video"
        }
    
    async def _generate_video(self, state: VideoGenerationState) -> dict:
        """生成视频"""
        scenes = state.get('scenes', [])
        duration = state.get('duration', 30)
        platform = state.get('platform', 'tiktok')
        platform_spec = self.PLATFORM_SPECS.get(platform, self.PLATFORM_SPECS['tiktok'])
        
        generated_video = {}
        
        # 如果配置了视频生成API
        if self.video_api_key and self.video_api_url:
            try:
                # 这里可以调用实际的AI视频生成API
                # 如 RunwayML、Pika、Sora 等
                async with httpx.AsyncClient(timeout=120.0) as client:
                    response = await client.post(
                        f"{self.video_api_url}/generate",
                        headers={
                            "Authorization": f"Bearer {self.video_api_key}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "prompt": state.get('script', ''),
                            "duration": duration,
                            "resolution": platform_spec['resolution'],
                            "scenes": scenes
                        }
                    )
                    
                    if response.status_code == 200:
                        generated_video = response.json()
            except Exception as e:
                generated_video = {"error": str(e)}
        else:
            # 模拟视频生成
            generated_video = {
                "status": "simulated",
                "message": "视频生成API未配置",
                "scenes": scenes,
                "duration": duration,
                "resolution": platform_spec['resolution'],
                "preview_url": None,
                "tips": "请配置视频生成API（如RunwayML、Pika等）以启用真实视频生成功能"
            }
        
        return {
            "generated_video": generated_video,
            "next_action": "optimize_output"
        }
    
    async def _optimize_output(self, state: VideoGenerationState) -> dict:
        """优化输出建议"""
        platform = state.get('platform', 'tiktok')
        
        prompt = f"""基于生成的视频内容，提供优化建议：

视频信息：{json.dumps(state.get('generated_video', {}), ensure_ascii=False)}
目标平台：{platform}

请提供：
1. 平台适配优化建议
2. 发布时间建议
3. 标题和话题标签建议
4. 互动引导策略
5. 数据监测要点"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "optimization_tips": response.content,
            "next_action": "completed"
        }
    
    async def run(
        self,
        product_name: str = "",
        product_description: str = "",
        video_type: str = "product_showcase",
        duration: int = 30,
        platform: str = "tiktok"
    ) -> dict:
        """运行视频生成智能体"""
        initial_state = {
            "messages": [],
            "product_name": product_name,
            "product_description": product_description,
            "video_type": video_type,
            "duration": duration,
            "platform": platform,
            "script": "",
            "scenes": [],
            "generated_video": {},
            "optimization_tips": "",
            "next_action": ""
        }
        
        result = await self.app.ainvoke(initial_state)
        return result
