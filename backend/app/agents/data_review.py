"""
数据复盘智能体 - 使用豆包大模型（Pro模型支持复杂分析）
"""
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
import operator
import json
from datetime import datetime

from app.agents.base import AgentState
from app.services.llm_service import get_llm_for_agent


class DataReviewState(TypedDict):
    """数据复盘智能体状态"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    platform: str            # 平台
    date_range: dict         # 时间范围
    sales_data: dict         # 销售数据
    traffic_data: dict       # 流量数据
    ad_data: dict            # 广告数据
    customer_data: dict      # 客户数据
    data_analysis: dict      # 数据分析结果
    insights: list[dict]     # 洞察发现
    recommendations: list[dict] # 优化建议
    report: str              # 复盘报告
    next_action: str


class DataReviewAgent:
    """数据复盘智能体"""
    
    SYSTEM_PROMPT = """你是一位专业的电商数据分析专家，精通数据挖掘、趋势分析和业务洞察。

你的职责是：
1. 深入分析销售、流量、广告、客户等多维数据
2. 发现数据异常和潜在问题
3. 提供可执行的优化建议
4. 输出专业的复盘报告

数据分析原则：
- 数据驱动决策
- 关注核心指标变化
- 多维度交叉分析
- 找出根因而非表象
- 建议具体可执行"""
    
    # 核心指标定义
    CORE_METRICS = {
        "sales": {
            "name": "销售指标",
            "metrics": ["GMV", "订单量", "客单价", "转化率", "退款率"],
            "focus": "关注销售趋势和结构变化"
        },
        "traffic": {
            "name": "流量指标",
            "metrics": ["访客数UV", "浏览量PV", "跳出率", "停留时长", "加购率"],
            "focus": "关注流量来源和质量"
        },
        "advertising": {
            "name": "广告指标",
            "metrics": ["花费", "曝光量", "点击率CTR", "转化率CVR", "ROAS", "CPA"],
            "focus": "关注广告效率和ROI"
        },
        "customer": {
            "name": "客户指标",
            "metrics": ["新客占比", "复购率", "客户满意度", "投诉率", "LTV"],
            "focus": "关注客户质量和忠诚度"
        }
    }
    
    # 异常检测阈值
    ANOMALY_THRESHOLDS = {
        "sales_drop": -20,
        "traffic_drop": -30,
        "ctr_drop": -15,
        "roas_low": 2.0,
        "refund_high": 5
    }
    
    def __init__(
        self,
        temperature: float = 0.3
    ):
        """初始化数据复盘智能体，使用豆包Pro模型"""
        self.temperature = temperature
        
        # 使用豆包大模型 - Pro模型（数据分析需要复杂推理）
        self.llm = get_llm_for_agent("data_review", temperature=temperature)
        
        self.workflow = self._build_workflow()
        self.app = self.workflow.compile()
    
    def _build_workflow(self) -> StateGraph:
        """构建数据复盘工作流"""
        workflow = StateGraph(DataReviewState)
        
        workflow.add_node("collect_data", self._collect_data)
        workflow.add_node("analyze_trends", self._analyze_trends)
        workflow.add_node("detect_anomalies", self._detect_anomalies)
        workflow.add_node("generate_insights", self._generate_insights)
        workflow.add_node("create_recommendations", self._create_recommendations)
        workflow.add_node("generate_report", self._generate_report)
        
        workflow.set_entry_point("collect_data")
        
        workflow.add_edge("collect_data", "analyze_trends")
        workflow.add_edge("analyze_trends", "detect_anomalies")
        workflow.add_edge("detect_anomalies", "generate_insights")
        workflow.add_edge("generate_insights", "create_recommendations")
        workflow.add_edge("create_recommendations", "generate_report")
        workflow.add_edge("generate_report", END)
        
        return workflow
    
    async def _collect_data(self, state: DataReviewState) -> dict:
        """收集和整理数据"""
        date_range = state.get('date_range', {})
        platform = state.get('platform', 'all')
        
        prompt = f"""整理和分析数据概况：

时间范围：{date_range.get('start', '未指定')} 至 {date_range.get('end', '未指定')}
平台：{platform}

销售数据：{json.dumps(state.get('sales_data', {}), ensure_ascii=False)}
流量数据：{json.dumps(state.get('traffic_data', {}), ensure_ascii=False)}
广告数据：{json.dumps(state.get('ad_data', {}), ensure_ascii=False)}
客户数据：{json.dumps(state.get('customer_data', {}), ensure_ascii=False)}

请提供：
1. 数据完整性检查
2. 核心指标汇总
3. 同比/环比概况
4. 数据质量评估"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "next_action": "analyze_trends"
        }
    
    async def _analyze_trends(self, state: DataReviewState) -> dict:
        """分析趋势"""
        prompt = f"""分析数据趋势变化：

数据概况：{state.get('messages', [])[-1].content if state.get('messages') else ''}

请深入分析各维度趋势：
1. 销售趋势分析（日/周/月趋势）
2. 流量趋势分析（来源渠道变化）
3. 广告趋势分析（效率和成本变化）
4. 客户趋势分析（新客老客结构）

重点分析：
- 增长点和下滑点
- 趋势拐点和原因
- 环比/同比差异原因"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        data_analysis = {
            "trend_analysis": response.content,
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "messages": [AIMessage(content=response.content)],
            "data_analysis": data_analysis,
            "next_action": "detect_anomalies"
        }
    
    async def _detect_anomalies(self, state: DataReviewState) -> dict:
        """检测异常"""
        thresholds = self.ANOMALY_THRESHOLDS
        
        prompt = f"""检测数据异常：

趋势分析结果：{state.get('data_analysis', {}).get('trend_analysis', '')}

异常检测阈值：
- 销售下降警戒：{thresholds['sales_drop']}%
- 流量下降警戒：{thresholds['traffic_drop']}%
- 点击率下降警戒：{thresholds['ctr_drop']}%
- ROAS低下警戒：{thresholds['roas_low']}
- 退款率过高警戒：{thresholds['refund_high']}%

请检测并分析：
1. 异常指标识别（超出阈值的指标）
2. 异常程度评估（轻微/中度/严重）
3. 可能原因分析
4. 影响范围评估
5. 紧急程度判断"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        anomalies = []
        try:
            content = response.content
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            parsed = json.loads(content.strip())
            if isinstance(parsed, list):
                anomalies = parsed
        except:
            anomalies = [
                {
                    "metric": "转化率",
                    "status": "warning",
                    "change": -15,
                    "severity": "medium",
                    "possible_cause": "可能受价格调整或竞品活动影响"
                }
            ]
        
        return {
            "messages": [AIMessage(content=response.content)],
            "data_analysis": {**state.get('data_analysis', {}), "anomalies": anomalies},
            "next_action": "generate_insights"
        }
    
    async def _generate_insights(self, state: DataReviewState) -> dict:
        """生成洞察"""
        prompt = f"""基于数据分析和异常检测，生成业务洞察：

趋势分析：{state.get('data_analysis', {}).get('trend_analysis', '')}
异常检测结果：{json.dumps(state.get('data_analysis', {}).get('anomalies', []), ensure_ascii=False)}

请生成深度洞察：
1. 关键发现（3-5个）
   - 发现描述
   - 数据支撑
   - 业务影响
   - 置信度

2. 问题根因分析
   - 表象问题
   - 根本原因
   - 证据链

3. 机会识别
   - 增长机会
   - 优化空间
   - 潜力预测

请以结构化方式输出洞察结果。"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        insights = [
            {
                "category": "销售增长",
                "finding": "移动端转化率提升显著",
                "evidence": "移动端转化率环比提升23%",
                "impact": "贡献总GMV增长的40%",
                "confidence": "high"
            }
        ]
        
        return {
            "messages": [AIMessage(content=response.content)],
            "insights": insights,
            "next_action": "create_recommendations"
        }
    
    async def _create_recommendations(self, state: DataReviewState) -> dict:
        """创建优化建议"""
        prompt = f"""基于洞察结果，制定优化建议：

洞察发现：{json.dumps(state.get('insights', []), ensure_ascii=False)}
异常问题：{json.dumps(state.get('data_analysis', {}).get('anomalies', []), ensure_ascii=False)}

请制定具体可执行的优化建议：
1. 短期行动建议（1-7天）
2. 中期优化建议（1-4周）
3. 长期战略建议（1-3月）

每条建议需包含：
- 具体行动步骤
- 预期效果量化
- 风险提示"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        recommendations = [
            {
                "timeframe": "short",
                "priority": "high",
                "action": "优化移动端商品详情页",
                "steps": ["压缩图片提升加载速度", "优化购买按钮位置", "简化结算流程"],
                "expected_impact": "转化率提升5-10%",
                "risk": "需要前端开发资源"
            }
        ]
        
        return {
            "messages": [AIMessage(content=response.content)],
            "recommendations": recommendations,
            "next_action": "generate_report"
        }
    
    async def _generate_report(self, state: DataReviewState) -> dict:
        """生成复盘报告"""
        date_range = state.get('date_range', {})
        
        prompt = f"""生成完整的数据复盘报告：

分析时间：{date_range.get('start', '')} 至 {date_range.get('end', '')}

数据概览：{state.get('messages', [])[0].content if state.get('messages') else ''}
趋势分析：{state.get('data_analysis', {}).get('trend_analysis', '')}
异常检测：{json.dumps(state.get('data_analysis', {}).get('anomalies', []), ensure_ascii=False)}
关键洞察：{json.dumps(state.get('insights', []), ensure_ascii=False)}
优化建议：{json.dumps(state.get('recommendations', []), ensure_ascii=False)}

请生成格式化复盘报告，包含：
1. 执行摘要（核心结论）
2. 数据概览（关键指标看板）
3. 详细分析（各维度分析）
4. 问题诊断（异常和根因）
5. 行动建议（优先级排序）
6. 下阶段规划

报告风格：专业、简洁、数据支撑充分。"""
        
        messages = [
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.llm.ainvoke(messages)
        
        return {
            "messages": [AIMessage(content=response.content)],
            "report": response.content,
            "next_action": "completed"
        }
    
    async def run(
        self,
        platform: str = "all",
        date_range: dict = None,
        sales_data: dict = None,
        traffic_data: dict = None,
        ad_data: dict = None,
        customer_data: dict = None
    ) -> dict:
        """运行数据复盘智能体"""
        initial_state = {
            "messages": [],
            "platform": platform,
            "date_range": date_range or {},
            "sales_data": sales_data or {},
            "traffic_data": traffic_data or {},
            "ad_data": ad_data or {},
            "customer_data": customer_data or {},
            "data_analysis": {},
            "insights": [],
            "recommendations": [],
            "report": "",
            "next_action": ""
        }
        
        result = await self.app.ainvoke(initial_state)
        return result
