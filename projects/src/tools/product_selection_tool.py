"""
跨境电商选品工具
使用联网搜索获取市场趋势、竞品信息、热门商品等
"""
from langchain.tools import tool
from coze_coding_utils.log.write_log import request_context
from coze_coding_utils.runtime_ctx.context import new_context
from coze_coding_dev_sdk import SearchClient

@tool
def search_market_trends(query: str, platform: str = "shopee") -> str:
    """
    搜索市场趋势和热门商品信息

    Args:
        query: 搜索关键词（如"蓝牙耳机"、"运动鞋"等）
        platform: 目标平台（shopee/lazada/tiktok/amazon）

    Returns:
        返回市场趋势分析结果，包含热门商品、竞争度、需求量等信息
    """
    ctx = request_context.get() or new_context(method="search_market_trends")

    # 构建搜索查询
    search_query = f"{platform} {query} 市场趋势 热门商品 销量 竞争分析"

    client = SearchClient(ctx=ctx)
    results = client.web_search(
        query=search_query,
        count=10
    )

    # 整理搜索结果
    output = []
    output.append(f"## {platform.upper()} 平台 - {query} 市场趋势分析\n")

    if hasattr(results, 'web_items') and results.web_items:
        for i, item in enumerate(results.web_items, 1):
            output.append(f"### {i}. {item.title}")
            output.append(f"**来源**: {item.url}")
            output.append(f"**摘要**: {item.snippet}")
            output.append("")

    return "\n".join(output)

@tool
def analyze_competitors(product_name: str, platform: str = "shopee") -> str:
    """
    分析竞争对手情况

    Args:
        product_name: 商品名称
        platform: 目标平台

    Returns:
        返回竞品分析结果，包含价格区间、销量、评分等信息
    """
    ctx = request_context.get() or new_context(method="analyze_competitors")

    search_query = f"{platform} {product_name} 竞品分析 价格对比 销量排行"
    client = SearchClient(ctx=ctx)
    results = client.web_search(
        query=search_query,
        count=8
    )

    output = []
    output.append(f"## 竞品分析报告：{product_name}\n")
    output.append(f"**平台**: {platform.upper()}\n")

    if hasattr(results, 'web_items') and results.web_items:
        output.append("### 竞品信息\n")
        for i, item in enumerate(results.web_items, 1):
            output.append(f"**竞品 {i}**: {item.title}")
            output.append(f"{item.snippet}")
            output.append(f"来源: {item.url}")
            output.append("")

    return "\n".join(output)

@tool
def search_profitable_niches(category: str, market: str = "东南亚") -> str:
    """
    搜索有利润空间的细分市场

    Args:
        category: 类目（如"电子产品"、"服装"、"家居用品"等）
        market: 目标市场（东南亚/欧美/日韩等）

    Returns:
        返回蓝海类目和潜力商品推荐
    """
    ctx = request_context.get() or new_context(method="search_profitable_niches")

    search_query = f"{market} {category} 蓝海类目 潜力商品 低竞争高利润 选品建议"
    client = SearchClient(ctx=ctx)
    results = client.web_search(
        query=search_query,
        count=10
    )

    output = []
    output.append(f"## {market} - {category} 细分市场选品报告\n")

    if hasattr(results, 'web_items') and results.web_items:
        output.append("### 推荐蓝海类目\n")
        for i, item in enumerate(results.web_items, 1):
            output.append(f"#### {i}. {item.title}")
            output.append(f"{item.snippet}")
            output.append(f"参考: {item.url}")
            output.append("")

    return "\n".join(output)
