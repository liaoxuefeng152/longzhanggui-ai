"""
全能跨境电商AI运营智能体
专为 Shopee / Lazada / TikTok Shop / 亚马逊 卖家提供一站式AI自动化运营服务
"""
import os
import json
from typing import Annotated
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.graph import MessagesState
from langgraph.graph.message import add_messages
from langchain_core.messages import AnyMessage
from coze_coding_utils.runtime_ctx.context import default_headers
from storage.memory.memory_saver import get_memory_saver

# 导入所有工具
from tools.product_selection_tool import (
    search_market_trends,
    analyze_competitors,
    search_profitable_niches
)
from tools.profit_calculator_tool import (
    calculate_product_profit,
    calculate_break_even_price,
    analyze_daily_profit
)
from tools.image_generation_tool import (
    generate_product_image,
    generate_product_lifestyle_image,
    generate_product_infographic
)
from tools.video_generation_tool import (
    generate_product_video,
    generate_product_intro_video
)
from tools.storage_tool import (
    upload_file_to_storage,
    generate_presigned_url
)
from tools.tiktok_shop_api_tool import (
    get_tiktok_shop_products,
    get_tiktok_shop_orders,
    get_tiktok_shop_order_detail,
    get_tiktok_shop_analytics
)
from tools.feishu_message_tool import (
    send_feishu_message,
    send_feishu_card,
    test_feishu_connection
)
from tools.product_publish_tool import (
    publish_product_to_platform,
    generate_product_publish_template
)
from tools.product_scrape_tool import (
    scrape_product_from_url,
    batch_scrape_products,
    get_supported_platforms
)

LLM_CONFIG = "config/agent_llm_config.json"

# 默认保留最近 20 轮对话 (40 条消息)
MAX_MESSAGES = 40

def _windowed_messages(old, new):
    """滑动窗口: 只保留最近 MAX_MESSAGES 条消息"""
    return add_messages(old, new)[-MAX_MESSAGES:]  # type: ignore

class AgentState(MessagesState):
    messages: Annotated[list[AnyMessage], _windowed_messages]

def build_agent(ctx=None):
    workspace_path = os.getenv("COZE_WORKSPACE_PATH", "/workspace/projects")
    config_path = os.path.join(workspace_path, LLM_CONFIG)

    with open(config_path, 'r', encoding='utf-8') as f:
        cfg = json.load(f)

    api_key = os.getenv("COZE_WORKLOAD_IDENTITY_API_KEY")
    base_url = os.getenv("COZE_INTEGRATION_MODEL_BASE_URL")

    llm = ChatOpenAI(
        model=cfg['config'].get("model"),
        api_key=api_key,
        base_url=base_url,
        temperature=cfg['config'].get('temperature', 0.7),
        streaming=True,
        timeout=cfg['config'].get('timeout', 600),
        extra_body={
            "thinking": {
                "type": cfg['config'].get('thinking', 'disabled')
            }
        },
        default_headers=default_headers(ctx) if ctx else {}
    )

    # 配置所有工具
    tools = [
        # 选品相关工具
        search_market_trends,
        analyze_competitors,
        search_profitable_niches,

        # 利润计算工具
        calculate_product_profit,
        calculate_break_even_price,
        analyze_daily_profit,

        # 图像生成工具
        generate_product_image,
        generate_product_lifestyle_image,
        generate_product_infographic,

        # 视频生成工具
        generate_product_video,
        generate_product_intro_video,

        # 存储工具
        upload_file_to_storage,
        generate_presigned_url,

        # TikTok Shop API工具
        get_tiktok_shop_products,
        get_tiktok_shop_orders,
        get_tiktok_shop_order_detail,
        get_tiktok_shop_analytics,

        # 飞书消息工具
        send_feishu_message,
        send_feishu_card,
        test_feishu_connection,

        # 商品发布工具
        publish_product_to_platform,
        generate_product_publish_template,

        # 商品采集工具
        scrape_product_from_url,
        batch_scrape_products,
        get_supported_platforms,
    ]

    return create_agent(
        model=llm,
        system_prompt=cfg.get("sp"),
        tools=tools,
        checkpointer=get_memory_saver(),
        state_schema=AgentState,
    )
