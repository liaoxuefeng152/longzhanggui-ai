"""
跨境电商利润计算工具
用于计算成本、运费、佣金和净利润
"""
from typing import Optional
from langchain.tools import tool

@tool
def calculate_product_profit(
    selling_price: float,
    cost_price: float,
    shipping_fee: float,
    platform: str = "shopee",
    quantity: int = 1
) -> str:
    """
    计算商品利润

    Args:
        selling_price: 售价（本地货币）
        cost_price: 进货成本（CNY）
        shipping_fee: 运费（本地货币）
        platform: 平台（shopee/lazada/tiktok/amazon）
        quantity: 销售数量

    Returns:
        返回利润分析报告，包含总收入、总成本、净利润、利润率等
    """
    # 平台佣金率
    platform_commission_rates = {
        "shopee": 0.05,       # 5%
        "lazada": 0.06,       # 6%
        "tiktok": 0.05,       # 5%
        "amazon": 0.15        # 15%
    }

    platform_commission = platform_commission_rates.get(platform.lower(), 0.05)

    # 计算各项费用
    total_sales = selling_price * quantity
    total_cost_price = cost_price * quantity
    total_shipping = shipping_fee * quantity
    commission = total_sales * platform_commission

    # 净利润
    net_profit = total_sales - total_cost_price - total_shipping - commission

    # 利润率
    profit_margin = (net_profit / total_sales * 100) if total_sales > 0 else 0

    output = []
    output.append("## 利润计算报告\n")
    output.append(f"**平台**: {platform.upper()}")
    output.append(f"**销售数量**: {quantity}\n")

    output.append("### 收入")
    output.append(f"- 总销售额: {total_sales:.2f}")
    output.append(f"- 单价: {selling_price:.2f}\n")

    output.append("### 成本")
    output.append(f"- 进货成本: {total_cost_price:.2f} CNY")
    output.append(f"- 运费: {total_shipping:.2f}")
    output.append(f"- 平台佣金 ({platform_commission*100}%): {commission:.2f}\n")

    output.append("### 利润分析")
    output.append(f"- **净利润**: {net_profit:.2f}")
    output.append(f"- **利润率**: {profit_margin:.2f}%\n")

    if net_profit > 0:
        output.append("✅ **盈利**：该商品有利润空间")
    elif net_profit < 0:
        output.append("❌ **亏损**：该商品存在亏损，需要调整定价或降低成本")
    else:
        output.append("⚠️ **保本**：该商品刚好保本")

    return "\n".join(output)

@tool
def calculate_break_even_price(
    cost_price: float,
    shipping_fee: float,
    platform: str = "shopee",
    target_profit: float = 0
) -> str:
    """
    计算保本价或目标利润价

    Args:
        cost_price: 进货成本
        shipping_fee: 运费
        platform: 平台
        target_profit: 目标利润（默认0为保本价）

    Returns:
        返回建议售价
    """
    platform_commission_rates = {
        "shopee": 0.05,
        "lazada": 0.06,
        "tiktok": 0.05,
        "amazon": 0.15
    }

    commission_rate = platform_commission_rates.get(platform.lower(), 0.05)

    # 保本价计算公式: price * (1 - commission_rate) = cost + shipping + target_profit
    # price = (cost + shipping + target_profit) / (1 - commission_rate)

    selling_price = (cost_price + shipping_fee + target_profit) / (1 - commission_rate)

    output = []
    output.append("## 定价建议\n")
    output.append(f"**平台**: {platform.upper()}")
    output.append(f"**进货成本**: {cost_price:.2f} CNY")
    output.append(f"**运费**: {shipping_fee:.2f}")
    output.append(f"**平台佣金率**: {commission_rate*100}%")
    output.append(f"**目标利润**: {target_profit:.2f}\n")

    if target_profit == 0:
        output.append(f"### 保本价: {selling_price:.2f}")
        output.append(f"建议售价: {selling_price * 1.2:.2f} (加价20%)\n")
        output.append("⚠️ 保本价仅覆盖成本，建议加价20%-30%以获得合理利润")
    else:
        output.append(f"### 目标利润售价: {selling_price:.2f}")
        output.append(f"建议售价: {selling_price * 1.1:.2f} (加价10%作为缓冲)\n")

    return "\n".join(output)

@tool
def analyze_daily_profit(
    orders_data: str,
    platform: str = "shopee"
) -> str:
    """
    分析每日利润

    Args:
        orders_data: 订单数据JSON字符串，格式如下：
            [
                {"product": "商品A", "quantity": 10, "selling_price": 100, "cost_price": 50, "shipping_fee": 5},
                {"product": "商品B", "quantity": 5, "selling_price": 200, "cost_price": 100, "shipping_fee": 10}
            ]
        platform: 平台

    Returns:
        返回每日利润分析报告
    """
    import json

    try:
        orders = json.loads(orders_data)
    except json.JSONDecodeError:
        return "❌ 订单数据格式错误，请提供有效的JSON格式"

    platform_commission_rates = {
        "shopee": 0.05,
        "lazada": 0.06,
        "tiktok": 0.05,
        "amazon": 0.15
    }

    commission_rate = platform_commission_rates.get(platform.lower(), 0.05)

    total_sales = 0
    total_cost = 0
    total_shipping = 0
    total_commission = 0
    total_orders = len(orders)

    order_details = []

    for order in orders:
        quantity = order.get("quantity", 1)
        selling_price = order.get("selling_price", 0)
        cost_price = order.get("cost_price", 0)
        shipping_fee = order.get("shipping_fee", 0)

        sales = selling_price * quantity
        cost = cost_price * quantity
        shipping = shipping_fee * quantity
        commission = sales * commission_rate
        profit = sales - cost - shipping - commission

        total_sales += sales
        total_cost += cost
        total_shipping += shipping
        total_commission += commission

        order_details.append({
            "product": order.get("product", "Unknown"),
            "profit": profit,
            "profit_margin": (profit / sales * 100) if sales > 0 else 0
        })

    total_profit = total_sales - total_cost - total_shipping - total_commission
    overall_margin = (total_profit / total_sales * 100) if total_sales > 0 else 0

    output = []
    output.append("## 每日利润分析报告\n")
    output.append(f"**平台**: {platform.upper()}")
    output.append(f"**订单数**: {total_orders}\n")

    output.append("### 总览")
    output.append(f"- 总销售额: {total_sales:.2f}")
    output.append(f"- 总成本: {total_cost:.2f} CNY")
    output.append(f"- 总运费: {total_shipping:.2f}")
    output.append(f"- 总佣金: {total_commission:.2f}")
    output.append(f"- **净利润**: {total_profit:.2f}")
    output.append(f"- **综合利润率**: {overall_margin:.2f}%\n")

    output.append("### 商品利润排行")
    sorted_orders = sorted(order_details, key=lambda x: x["profit"], reverse=True)
    for i, item in enumerate(sorted_orders, 1):
        output.append(f"{i}. **{item['product']}**")
        output.append(f"   利润: {item['profit']:.2f} | 利润率: {item['profit_margin']:.2f}%")
        if item['profit'] < 0:
            output.append("   ⚠️ 亏损商品")

    # 识别亏损商品
    loss_products = [item for item in order_details if item['profit'] < 0]
    if loss_products:
        output.append("\n### 亏损商品预警")
        for item in loss_products:
            output.append(f"❌ {item['product']}: 亏损 {item['profit']:.2f}")

    return "\n".join(output)
