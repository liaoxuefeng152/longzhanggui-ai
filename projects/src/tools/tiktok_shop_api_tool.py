"""
TikTok Shop API 集成工具
用于获取实时店铺数据、订单信息、商品数据等
"""
import os
import json
import hashlib
import hmac
import time
from typing import Optional, Dict, Any
from langchain.tools import tool
from coze_coding_utils.log.write_log import request_context
from coze_coding_utils.runtime_ctx.context import new_context
import requests

# 尝试加载.env文件
try:
    from dotenv import load_dotenv
    # 加载项目根目录的.env文件
    workspace_path = os.getenv("COZE_WORKSPACE_PATH", "/workspace/projects")
    env_file = os.path.join(workspace_path, ".env")
    if os.path.exists(env_file):
        load_dotenv(env_file)
except ImportError:
    pass  # 如果没有安装python-dotenv，使用系统环境变量

def _generate_signature(
    app_secret: str,
    method: str,
    api_path: str,
    timestamp: str,
    params: Optional[Dict[str, Any]] = None
) -> str:
    """生成API签名"""
    # 构建待签名字符串
    str_to_sign = f"{app_secret}{method}{api_path}{timestamp}"
    if params:
        sorted_params = sorted(params.items())
        query_string = "&".join([f"{k}={v}" for k, v in sorted_params])
        str_to_sign += query_string

    # 生成签名
    signature = hmac.new(
        app_secret.encode('utf-8'),
        str_to_sign.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return signature

def _make_tiktok_request(
    api_path: str,
    method: str = "GET",
    params: Optional[Dict[str, Any]] = None,
    body: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """发送TikTok Shop API请求"""
    app_key = os.getenv("TIKTOK_SHOP_APP_KEY", "")
    app_secret = os.getenv("TIKTOK_SHOP_APP_SECRET", "")
    api_url = os.getenv("TIKTOK_SHOP_API_URL", "https://open.tiktokapis.com")

    if not app_key or not app_secret:
        return {
            "success": False,
            "error": "TikTok Shop API密钥未配置，请在环境变量中设置TIKTOK_SHOP_APP_KEY和TIKTOK_SHOP_APP_SECRET"
        }

    timestamp = str(int(time.time()))
    signature = _generate_signature(app_secret, method, api_path, timestamp, params)

    # 构建请求URL
    url = f"{api_url}{api_path}"

    headers = {
        "Content-Type": "application/json",
        "X-Tiktok-Shop-App-Key": app_key,
        "X-Tiktok-Shop-Timestamp": timestamp,
        "X-Tiktok-Shop-Signature": signature,
    }

    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=params, timeout=30)
        else:
            response = requests.post(url, headers=headers, json=body, timeout=30)

        response_data = response.json()

        # 检查响应
        if response.status_code == 200 and response_data.get("code") == 0:
            return {
                "success": True,
                "data": response_data.get("data", {})
            }
        else:
            return {
                "success": False,
                "error": response_data.get("message", "API请求失败"),
                "code": response_data.get("code"),
                "details": response_data
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"请求异常: {str(e)}"
        }

@tool
def get_tiktok_shop_products(
    page_size: int = 20,
    page_number: int = 1,
    status: str = "APPROVED"
) -> str:
    """
    获取TikTok Shop商品列表

    Args:
        page_size: 每页数量（1-100）
        page_number: 页码（从1开始）
        status: 商品状态（APPROVED/REVIEWING/REJECTED/DELETED）

    Returns:
        返回商品列表信息
    """
    api_path = "/product/202309/products"
    params = {
        "page_size": page_size,
        "page_number": page_number,
        "status": status
    }

    result = _make_tiktok_request(api_path, "GET", params)

    if result["success"]:
        products = result["data"].get("products", [])
        output = []
        output.append("## TikTok Shop 商品列表\n")
        output.append(f"**状态**: {status}")
        output.append(f"**数量**: {len(products)}\n")

        for i, product in enumerate(products, 1):
            output.append(f"### {i}. {product.get('name', 'N/A')}")
            output.append(f"- **商品ID**: {product.get('id', 'N/A')}")
            output.append(f"- **SKU ID**: {product.get('sku_id', 'N/A')}")
            output.append(f"- **价格**: {product.get('price', {}).get('amount', 'N/A')} {product.get('price', {}).get('currency', 'N/A')}")
            output.append(f"- **库存**: {product.get('stock', 'N/A')}")
            output.append(f"- **销量**: {product.get('sold_count', 'N/A')}")
            output.append(f"- **状态**: {product.get('status', 'N/A')}")
            output.append("")

        if result["data"].get("total_count"):
            output.append(f"**总计**: {result['data']['total_count']} 个商品")

        return "\n".join(output)
    else:
        return f"❌ 获取商品列表失败: {result['error']}"

@tool
def get_tiktok_shop_orders(
    start_date: str,
    end_date: str,
    order_status: str = "ALL",
    page_size: int = 20
) -> str:
    """
    获取TikTok Shop订单列表

    Args:
        start_date: 开始日期 (YYYY-MM-DD)
        end_date: 结束日期 (YYYY-MM-DD)
        order_status: 订单状态（ALL/UNPAID/PAID/IN_PROGRESS/COMPLETED/CANCELLED/IN_CANCEL/REFUNDING）
        page_size: 每页数量

    Returns:
        返回订单列表和利润分析
    """
    api_path = "/order/202309/orders"
    params = {
        "start_date": start_date,
        "end_date": end_date,
        "order_status": order_status,
        "page_size": page_size
    }

    result = _make_tiktok_request(api_path, "GET", params)

    if result["success"]:
        orders = result["data"].get("orders", [])
        output = []
        output.append(f"## TikTok Shop 订单分析\n")
        output.append(f"**日期范围**: {start_date} 至 {end_date}")
        output.append(f"**订单状态**: {order_status}")
        output.append(f"**订单数量**: {len(orders)}\n")

        # 统计数据
        total_sales = 0
        total_order_count = len(orders)

        if orders:
            output.append("### 订单明细\n")
            for i, order in enumerate(orders, 1):
                order_id = order.get("order_id", "N/A")
                total_amount = order.get("total_amount", {}).get("amount", 0)
                total_sales += total_amount

                output.append(f"#### {i}. 订单 {order_id}")
                output.append(f"- **订单时间**: {order.get('created_at', 'N/A')}")
                output.append(f"- **订单金额**: {total_amount} {order.get('total_amount', {}).get('currency', 'N/A')}")
                output.append(f"- **状态**: {order.get('order_status', 'N/A')}")
                output.append(f"- **支付方式**: {order.get('payment_method', 'N/A')}")
                output.append("")

            output.append("### 汇总统计\n")
            output.append(f"- **订单总数**: {total_order_count}")
            output.append(f"- **总销售额**: {total_sales:.2f}")
            output.append(f"- **平均客单价**: {total_sales/total_order_count:.2f}" if total_order_count > 0 else "")
        else:
            output.append("### ⚠️ 该时间段暂无订单数据")

        return "\n".join(output)
    else:
        return f"❌ 获取订单列表失败: {result['error']}"

@tool
def get_tiktok_shop_order_detail(order_id: str) -> str:
    """
    获取TikTok Shop订单详情

    Args:
        order_id: 订单ID

    Returns:
        返回订单详细信息，包含商品明细、利润计算
    """
    api_path = "/order/202309/orders/detail"
    params = {"order_id": order_id}

    result = _make_tiktok_request(api_path, "GET", params)

    if result["success"]:
        order = result["data"]
        output = []
        output.append(f"## 订单详情\n")
        output.append(f"**订单ID**: {order.get('order_id', 'N/A')}")
        output.append(f"**订单状态**: {order.get('order_status', 'N/A')}")
        output.append(f"**创建时间**: {order.get('created_at', 'N/A')}")
        output.append(f"**支付时间**: {order.get('paid_time', 'N/A')}\n")

        output.append("### 订单信息\n")
        output.append(f"- **订单总额**: {order.get('total_amount', {}).get('amount', 'N/A')} {order.get('total_amount', {}).get('currency', 'N/A')}")
        output.append(f"- **商品总价**: {order.get('product_total_amount', {}).get('amount', 'N/A')}")
        output.append(f"- **运费**: {order.get('shipping_amount', {}).get('amount', 'N/A')}")
        output.append(f"- **平台佣金**: {order.get('commission_fee', {}).get('amount', 'N/A')}")
        output.append(f"- **税费**: {order.get('tax_amount', {}).get('amount', 'N/A')}\n")

        output.append("### 收货信息\n")
        recipient = order.get("recipient", {})
        output.append(f"- **收货人**: {recipient.get('name', 'N/A')}")
        output.append(f"- **电话**: {recipient.get('phone', 'N/A')}")
        output.append(f"- **地址**: {recipient.get('full_address', 'N/A')}\n")

        output.append("### 商品明细\n")
        items = order.get("items", [])
        for i, item in enumerate(items, 1):
            output.append(f"#### 商品 {i}")
            output.append(f"- **商品名称**: {item.get('product_name', 'N/A')}")
            output.append(f"- **SKU ID**: {item.get('sku_id', 'N/A')}")
            output.append(f"- **单价**: {item.get('unit_price', {}).get('amount', 'N/A')}")
            output.append(f"- **数量**: {item.get('quantity', 'N/A')}")
            output.append(f"- **小计**: {item.get('total_amount', {}).get('amount', 'N/A')}")
            output.append("")

        return "\n".join(output)
    else:
        return f"❌ 获取订单详情失败: {result['error']}"

@tool
def get_tiktok_shop_analytics(
    start_date: str,
    end_date: str,
    metrics: str = "TOTAL_SALES,ORDER_COUNT"
) -> str:
    """
    获取TikTok Shop店铺数据分析

    Args:
        start_date: 开始日期 (YYYY-MM-DD)
        end_date: 结束日期 (YYYY-MM-DD)
        metrics: 指标类型（TOTAL_SALES/ORDER_COUNT/VISIT_COUNT/CONVERSION_RATE/）

    Returns:
        返回店铺运营数据
    """
    api_path = "/shop/202309/shop/analytics"
    params = {
        "start_date": start_date,
        "end_date": end_date,
        "metrics": metrics
    }

    result = _make_tiktok_request(api_path, "GET", params)

    if result["success"]:
        data = result["data"]
        output = []
        output.append(f"## TikTok Shop 店铺数据报告\n")
        output.append(f"**日期范围**: {start_date} 至 {end_date}\n")

        output.append("### 核心指标\n")
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, (int, float)):
                    output.append(f"- **{key}**: {value}")
                else:
                    output.append(f"- **{key}**: {json.dumps(value, ensure_ascii=False)}")
        else:
            output.append(str(data))

        return "\n".join(output)
    else:
        return f"❌ 获取店铺数据失败: {result['error']}"
