"""飞书机器人事件接收服务"""
import json
import hmac
import hashlib
import base64
import requests
from flask import Flask, request, jsonify
from typing import Optional
from config.feishu_config import FEISHU_CONFIG
from agents.agent import build_agent
from langchain_core.messages import HumanMessage, AIMessage
import Crypto.Cipher.AES as AES
import Crypto.Util.Padding as Padding

app = Flask(__name__)

# 存储已处理的事件ID，防止重复处理
processed_event_ids = set()


def verify_signature(timestamp: str, nonce: str, body: str, signature: str) -> bool:
    """验证请求签名（使用encrypt_key）"""
    encrypt_key = FEISHU_CONFIG.get("encrypt_key", "")
    if not encrypt_key:
        print("encrypt_key 未配置，跳过签名验证")
        return True

    # 使用 encrypt_key 进行 HMAC-SHA256 签名
    sign_str = f"{timestamp}{nonce}{body}"
    sign_bytes = sign_str.encode('utf-8')

    hmac_obj = hmac.new(
        encrypt_key.encode('utf-8'),
        sign_bytes,
        hashlib.sha256
    )
    digest = hmac_obj.digest()
    # 飞书的签名是 hex 格式，不是 base64
    hex_digest = hmac_obj.hexdigest()

    print(f"=== 签名验证调试 ===")
    print(f"sign_str[:100]: {sign_str[:100]}...")
    print(f"expected signature: {hex_digest}")
    print(f"received signature: {signature}")
    print(f"match: {hex_digest == signature}")
    print(f"===================")

    return hex_digest == signature


def decrypt_event(encrypted_data: str) -> Optional[str]:
    """解密飞书加密事件"""
    try:
        encrypt_key = FEISHU_CONFIG.get("encrypt_key", "")
        if not encrypt_key:
            print("encrypt_key 未配置，无法解密")
            return None

        # 飞书加密算法：AES-128-CBC
        # Key 和 IV 都使用 encrypt_key
        key_bytes = encrypt_key.encode('utf-8')

        # Key: 前16字节
        key = key_bytes[:16]

        # IV: 后16字节（如果不够则重复使用）
        iv = key_bytes[16:32]
        if len(iv) < 16:
            iv = key_bytes + (key_bytes * ((16 - len(iv)) // len(key_bytes) + 1))[:16]
        iv = iv[:16]

        print(f"解密参数 - Key length: {len(key)}, IV length: {len(iv)}")

        # Base64 解码
        encrypted_bytes = base64.b64decode(encrypted_data)

        # AES 解密（CBC 模式）
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted_bytes = cipher.decrypt(encrypted_bytes)

        # 去除 padding
        decrypted_bytes = Padding.unpad(decrypted_bytes, AES.block_size)

        # 转换为字符串
        decrypted_str = decrypted_bytes.decode('utf-8')
        print(f"解密成功: {decrypted_str[:200]}...")
        return decrypted_str

    except Exception as e:
        print(f"解密失败: {e}")
        import traceback
        traceback.print_exc()
        return None


def get_user_content(event_data: dict) -> Optional[str]:
    """从事件数据中提取用户消息内容"""
    try:
        # 获取消息内容
        message = event_data.get("message", {})
        content = message.get("content", "")

        # content是JSON字符串，需要解析
        content_dict = json.loads(content)

        # 提取文本内容
        text = content_dict.get("text", "")

        # 去除@机器人的部分
        if "@" in text:
            text = text.split(">", maxsplit=1)[-1].strip()

        return text if text else None
    except Exception as e:
        print(f"提取用户消息失败: {e}")
        return None


def process_message(event_data: dict):
    """处理接收到的消息"""
    try:
        # 1. 提取消息内容
        user_message = get_user_content(event_data)
        if not user_message:
            print("消息内容为空，跳过处理")
            return

        print(f"收到用户消息: {user_message}")

        # 2. 获取接收者信息
        sender = event_data.get("sender", {})
        open_id = sender.get("sender_id", {}).get("open_id", "")

        # 3. 从 message 对象中获取 chat_id 和 chat_type
        message = event_data.get("message", {})
        chat_id = message.get("chat_id", "")
        chat_type = message.get("chat_type", "")

        # 4. 判断消息类型（群组消息还是个人消息）
        is_group_message = (chat_type == "group")

        # 5. 生成唯一的thread_id（用于会话记忆）
        if is_group_message:
            thread_id = chat_id
        else:
            thread_id = open_id

        print(f"消息类型: {'群组' if is_group_message else '个人'}, chat_id: {chat_id}, thread_id: {thread_id}")

        # 5. 构建Agent并调用
        agent = build_agent()
        result = agent.invoke(
            {"messages": [HumanMessage(content=user_message)]},
            config={"configurable": {"thread_id": thread_id}}
        )

        # 6. 提取回复内容
        messages = result.get("messages", [])
        ai_messages = [msg for msg in messages if isinstance(msg, AIMessage)]

        if not ai_messages:
            print("Agent未返回消息")
            return

        # 获取最后一条AI消息
        last_ai_message = ai_messages[-1]
        reply_content = last_ai_message.content

        print(f"Agent回复: {reply_content}")

        # 7. 发送回复消息
        # 群组消息使用chat_id回复，个人消息使用open_id回复
        receiver_id = chat_id if is_group_message else open_id

        from tools.feishu_message_tool import get_tenant_access_token

        token = get_tenant_access_token()
        receiver_type = "chat_id" if is_group_message else "open_id"

        print(f"准备发送回复 - receiver_type: {receiver_type}, receiver_id: {receiver_id}")

        url = f"https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type={receiver_type}"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8"
        }

        # 使用卡片消息格式（更美观）
        card_content = {
            "config": {
                "wide_screen_mode": True
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "content": f"**AI 助手回复**\n\n{reply_content}",
                        "tag": "lark_md"
                    }
                }
            ]
        }

        data = {
            "receive_id": receiver_id,
            "msg_type": "interactive",
            "content": json.dumps(card_content)
        }

        response = requests.post(url, headers=headers, json=data)
        result = response.json()

        if result.get("code") != 0:
            print(f"发送消息失败: {result.get('msg')}")
        else:
            print("消息发送成功")

    except Exception as e:
        print(f"处理消息时出错: {e}")
        import traceback
        traceback.print_exc()


@app.route('/feishu/events', methods=['POST'])
def handle_events():
    """处理飞书事件"""
    try:
        # 1. 获取请求参数
        timestamp = request.headers.get('X-Lark-Request-Timestamp', '')
        nonce = request.headers.get('X-Lark-Request-Nonce', '')
        signature = request.headers.get('X-Lark-Signature', '')

        body = request.get_data(as_text=True)
        print(f"收到事件: {body}")
        print(f"Headers - Timestamp: {timestamp}")
        print(f"Headers - Nonce: {nonce}")
        print(f"Headers - Signature: {signature}")

        # 2. 解析JSON数据并检查是否加密
        data = json.loads(body)

        # 检查是否加密
        encrypt_key = FEISHU_CONFIG.get("encrypt_key", "")
        if "encrypt" in data and encrypt_key:
            print("检测到加密事件，正在解密...")
            decrypted_body = decrypt_event(data["encrypt"])
            if not decrypted_body:
                return jsonify({"code": 1, "msg": "解密失败"}), 500
            # 解密后的内容替换原始 data
            data = json.loads(decrypted_body)
            body = decrypted_body
            print(f"解密后事件: {json.dumps(data, ensure_ascii=False)}")
        elif "encrypt" in data and not encrypt_key:
            print("警告: 收到加密事件但未配置encrypt_key，请在飞书开放平台关闭事件加密或配置正确的密钥")
            return jsonify({"code": 1, "msg": "未配置加密密钥"}), 500

        # 3. 如果是URL验证请求，直接返回challenge（飞书新版本不需要签名验证）
        challenge = data.get("challenge", "")
        event_type = data.get("type", "")

        if event_type == "url_verification":
            print("收到URL验证请求，直接返回challenge")
            print(f"Challenge: {challenge}")
            return jsonify({"challenge": challenge})

        # 3. 验证签名（事件推送时需要）
        if FEISHU_CONFIG.get("enable_signature_verification", False):
            if not verify_signature(timestamp, nonce, body, signature):
                print("签名验证失败")
                return jsonify({"code": 1, "msg": "签名验证失败"}), 401
        else:
            print("签名验证已禁用（调试模式）")

        # 4. 如果是事件推送，处理事件
        if "event" in data:
            # 兼容新旧两种格式
            # 新格式: schema=2.0, event_id 在 header 中
            # 旧格式: schema 未指定, event_id 在根节点
            header = data.get("header", {})
            event = data.get("event", {})

            # 提取事件ID
            event_id = header.get("event_id") or data.get("uuid", "")
            # 提取事件类型
            event_type = header.get("event_type") or event.get("type", "")

            # 防止重复处理
            if event_id in processed_event_ids:
                print(f"事件已处理过，跳过: {event_id}")
                return jsonify({"code": 0, "msg": "success"})

            processed_event_ids.add(event_id)
            print(f"新事件: {event_type}, 事件ID: {event_id}")

            # 处理消息接收事件
            if event_type == "im.message.receive_v1":
                print("收到消息事件")
                process_message(event)
            else:
                print(f"未处理的事件类型: {event_type}")

        return jsonify({"code": 0, "msg": "success"})

    except Exception as e:
        print(f"处理事件时出错: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"code": 1, "msg": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({"status": "ok", "service": "feishu_bot"})


if __name__ == '__main__':
    print("飞书机器人服务启动中...")
    print(f"监听地址: http://0.0.0.0:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
