"""
AI客服智能体
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
import operator
import json

from app.agents.base import AgentState


class CustomerServiceState(TypedDict):
    """客服智能体状态"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_message: str
    language: str
    context: dict
    response: str
    intent: str
    next_action: str


class CustomerServiceAgent:
    """AI客服智能体"""
    
    SYSTEM_PROMPT_TEMPLATE = """你是一位专业的跨境电商客服，精通多种语言。

你的职责是：
1. 友好、专业地回答买家咨询
2. 解决订单、物流、售后等问题
3. 引导用户完成购买
4. 维护店铺形象和客户关系

当前语言：{language}

回复要求：
- 使用{language}回复
- 语气友好、专业
- 回复简洁明了
- 如遇无法解决的问题，引导用户联系人工客服"""

    LANGUAGE_PROMPTS = {
        "zh": "中文",
        "en": "English",
        "id": "Bahasa Indonesia",
        "th": "ภาษาไทย",
        "vi": "Tiếng Việt",
        "ms": "Bahasa Melayu"
    }
    
    def __init__(
        self,
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        api_key: str = None,
        base_url: str = None
    ):
        self.model = model
        self.temperature = temperature
        
        self.llm = ChatOpenAI(
            model=model,
            temperature=temperature,
            api_key=api_key,
            base_url=base_url
        )
        
        self.workflow = self._build_workflow()
        self.app = self.workflow.compile()
    
    def _build_workflow(self) -> StateGraph:
        """构建客服工作流"""
        workflow = StateGraph(CustomerServiceState)
        
        # 添加节点
        workflow.add_node("detect_intent", self._detect_intent)
        workflow.add_node("generate_response", self._generate_response)
        workflow.add_node("check_satisfaction", self._check_satisfaction)
        
        # 设置入口
        workflow.set_entry_point("detect_intent")
        
        # 添加边
        workflow.add_edge("detect_intent", "generate_response")
        workflow.add_edge("generate_response", "check_satisfaction")
        workflow.add_edge("check_satisfaction", END)
        
        return workflow
    
    async def _detect_intent(self, state: CustomerServiceState) -> dict:
        """识别用户意图"""
        prompt = f"""请分析以下用户消息，识别用户意图：

用户消息：{state.get('user_message', '')}

请从以下意图中选择一个：
- product_inquiry: 商品咨询
- order_status: 订单查询
- shipping_inquiry: 物流咨询
- return_refund: 退换货
- complaint: 投诉
- general: 一般咨询

只需返回意图关键词，不需要其他内容。"""
        
        response = await self.llm.ainvoke([
            {"role": "user", "content": prompt}
        ])
        
        intent = response.content.strip().lower()
        
        return {
            "intent": intent,
            "next_action": "generate_response"
        }
    
    async def _generate_response(self, state: CustomerServiceState) -> dict:
        """生成回复"""
        language = state.get('language', 'zh')
        language_name = self.LANGUAGE_PROMPTS.get(language, language)
        
        system_prompt = self.SYSTEM_PROMPT_TEMPLATE.format(language=language_name)
        
        # 构建上下文
        context = state.get('context', {})
        context_str = ""
        if context:
            context_str = f"\n\n订单信息：{json.dumps(context, ensure_ascii=False)}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": state.get('user_message', '') + context_str}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "response": response.content,
            "next_action": "check_satisfaction"
        }
    
    async def _check_satisfaction(self, state: CustomerServiceState) -> dict:
        """检查回复满意度标记"""
        # 这里可以添加满意度检测逻辑
        return {
            "next_action": "completed"
        }
    
    async def run(
        self,
        user_message: str,
        language: str = "zh",
        context: dict = None
    ) -> dict:
        """运行客服智能体"""
        initial_state = {
            "messages": [],
            "user_message": user_message,
            "language": language,
            "context": context or {},
            "response": "",
            "intent": "",
            "next_action": ""
        }
        
        result = await self.app.ainvoke(initial_state)
        return result


# 多语言翻译辅助
class TranslationAgent:
    """翻译智能体"""
    
    def __init__(
        self,
        model: str = "gpt-4o-mini",
        api_key: str = None,
        base_url: str = None
    ):
        self.llm = ChatOpenAI(
            model=model,
            temperature=0.3,
            api_key=api_key,
            base_url=base_url
        )
    
    async def translate(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> str:
        """翻译文本"""
        prompt = f"""请将以下{source_lang}文本翻译成{target_lang}：

{text}

只返回翻译结果，不要添加其他内容。"""
        
        response = await self.llm.ainvoke([
            {"role": "user", "content": prompt}
        ])
        
        return response.content
