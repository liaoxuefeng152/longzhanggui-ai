"""飞书消息发送工具"""
import requests
import json
import os
from typing import Optional, List, Dict
from langchain.tools import tool

# 导入配置
from config.feishu_config import FEISHU_CONFIG, FEISHU_API_BASE_URL


def get_tenant_access_token():
    """获取租户访问令牌"""
    url = f"{FEISHU_API_BASE_URL}/auth/v3/tenant_access_token/internal"
    headers = {"Content-Type": "application/json; charset=utf-8"}
    data = {
        "app_id": FEISHU_CONFIG["app_id"],
        "app_secret": FEISHU_CONFIG["app_secret"]
    }

    response = requests.post(url, headers=headers, json=data)
    result = response.json()

    if result.get("code") != 0:
        raise Exception(f"获取租户访问令牌失败: {result.get('msg')}")

    return result.get("tenant_access_token")


@tool
def send_feishu_message(
    receiver: str,
    content: str,
    msg_type: str = "text"
) -> str:
    """
    发送飞书消息

    Args:
        receiver: 接收者ID（open_id或chat_id）
        content: 消息内容
        msg_type: 消息类型（text/text/image）

    Returns:
        发送结果
    """
    token = get_tenant_access_token()

    # 自动判断接收者类型
    receiver_type = "open_id" if receiver.startswith("oc_") or receiver.startswith("ou_") else "chat_id"

    url = f"{FEISHU_API_BASE_URL}/im/v1/messages?receive_id_type={receiver_type}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8"
    }

    data = {
        "receive_id": receiver,
        "msg_type": msg_type,
        "content": json.dumps({"text": content})
    }

    response = requests.post(url, headers=headers, json=data)
    result = response.json()

    if result.get("code") != 0:
        return f"❌ 发送失败: {result.get('msg')}"

    return "✅ 消息发送成功"


@tool
def send_feishu_card(
    receiver: str,
    title: str,
    content: str,
    buttons: Optional[List[Dict]] = None
) -> str:
    """
    发送飞书卡片消息

    Args:
        receiver: 接收者ID
        title: 卡片标题
        content: 卡片内容
        buttons: 按钮列表（可选）

    Returns:
        发送结果
    """
    token = get_tenant_access_token()

    # 自动判断接收者类型
    receiver_type = "open_id" if receiver.startswith("oc_") or receiver.startswith("ou_") else "chat_id"

    url = f"{FEISHU_API_BASE_URL}/im/v1/messages?receive_id_type={receiver_type}"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8"
    }

    card_content = {
        "config": {
            "wide_screen_mode": True
        },
        "header": {
            "title": {
                "content": title,
                "tag": "plain_text"
            }
        },
        "elements": [
            {
                "tag": "div",
                "text": {
                    "content": content,
                    "tag": "lark_md"
                }
            }
        ]
    }

    if buttons:
        card_content["elements"].append({
            "tag": "action",
            "actions": buttons
        })

    data = {
        "receive_id": receiver,
        "msg_type": "interactive",
        "content": json.dumps(card_content)
    }

    response = requests.post(url, headers=headers, json=data)
    result = response.json()

    if result.get("code") != 0:
        return f"❌ 卡片发送失败: {result.get('msg')}"

    return "✅ 卡片发送成功"


@tool
def test_feishu_connection() -> str:
    """
    测试飞书API连接

    Returns:
        测试结果
    """
    try:
        token = get_tenant_access_token()
        return f"✅ 飞书API连接成功！\n\n租户访问令牌已获取: {token[:30]}..."
    except Exception as e:
        return f"❌ 飞书API连接失败: {str(e)}"
