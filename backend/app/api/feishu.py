"""
飞书机器人API路由
处理飞书回调事件和消息
"""
import json
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from loguru import logger

from app.services.feishu_service import feishu_service, command_parser


router = APIRouter(prefix="/feishu", tags=["飞书机器人"])


class FeishuEvent(BaseModel):
    """飞书事件模型"""
    type: str
    challenge: Optional[str] = None
    token: Optional[str] = None
    event: Optional[Dict[str, Any]] = None
    header: Optional[Dict[str, Any]] = None


class MessageEvent(BaseModel):
    """消息事件"""
    message_id: str
    root_id: Optional[str] = None
    parent_id: Optional[str] = None
    create_time: str
    chat_id: str
    chat_type: str
    message_type: str
    content: str
    mentions: Optional[List[Dict[str, Any]]] = None
    sender: Dict[str, Any]


@router.post("/callback")
async def feishu_callback(request: Request):
    """
    飞书事件回调接口
    处理URL验证、消息接收等事件
    """
    try:
        # 获取请求头
        timestamp = request.headers.get("X-Lark-Request-Timestamp", "")
        nonce = request.headers.get("X-Lark-Request-Nonce", "")
        signature = request.headers.get("X-Lark-Signature", "")
        
        # 获取请求体
        body = await request.body()
        body_str = body.decode("utf-8")
        
        # 验证签名（如果配置了）
        # if not feishu_service.verify_signature(timestamp, nonce, body_str, signature):
        #     raise HTTPException(status_code=401, detail="签名验证失败")
        
        data = json.loads(body_str)
        
        # URL验证
        if data.get("type") == "url_verification":
            challenge = data.get("challenge", "")
            logger.info(f"飞书URL验证: {challenge}")
            return PlainTextResponse(content=challenge)
        
        # 处理事件
        event_type = data.get("type")
        event = data.get("event", {})
        
        logger.info(f"收到飞书事件: {event_type}")
        
        # 处理消息事件
        if event_type == "event_callback":
            inner_event = event.get("event", {})
            if inner_event.get("message"):
                await handle_message_event(inner_event.get("message"))
        
        return {"code": 0, "msg": "success"}
        
    except json.JSONDecodeError:
        logger.error("飞书回调数据解析失败")
        raise HTTPException(status_code=400, detail="Invalid JSON")
    except Exception as e:
        logger.error(f"处理飞书回调失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def handle_message_event(message: Dict[str, Any]):
    """处理消息事件"""
    try:
        msg_type = message.get("message_type")
        sender = message.get("sender", {})
        open_id = sender.get("sender_id", {}).get("open_id", "")
        chat_id = message.get("chat_id", "")
        
        # 只处理文本消息
        if msg_type != "text":
            return
        
        # 解析消息内容
        content = json.loads(message.get("content", "{}"))
        text = content.get("text", "").strip()
        
        # 忽略空消息
        if not text:
            return
        
        logger.info(f"收到飞书消息: {text} (from: {open_id})")
        
        # 解析指令
        parsed = command_parser.parse(text)
        
        # 执行指令
        result = await command_parser.execute(parsed, open_id)
        
        # 发送回复
        if result.get("success"):
            await feishu_service.send_text(open_id, result.get("message", "✅ 已处理"))
        else:
            await feishu_service.send_text(open_id, f"❌ 处理失败: {result.get('message')}")
        
    except Exception as e:
        logger.error(f"处理消息事件失败: {e}")


@router.post("/send")
async def send_message(
    open_id: str,
    message: str
):
    """发送消息接口（管理员调用）"""
    success = await feishu_service.send_text(open_id, message)
    
    if success:
        return {"success": True, "message": "发送成功"}
    else:
        raise HTTPException(status_code=500, detail="发送失败")


@router.post("/send-card")
async def send_card_message(
    open_id: str,
    title: str,
    content: str
):
    """发送卡片消息"""
    success = await feishu_service.send_markdown(open_id, title, content)
    
    if success:
        return {"success": True, "message": "发送成功"}
    else:
        raise HTTPException(status_code=500, detail="发送失败")


@router.post("/alert")
async def send_alert(
    open_id: str,
    alert_type: str,
    title: str,
    content: str,
    level: str = "warning"
):
    """发送告警通知"""
    success = await feishu_service.send_alert(
        open_id, alert_type, title, content, level
    )
    
    if success:
        return {"success": True, "message": "告警已发送"}
    else:
        raise HTTPException(status_code=500, detail="发送失败")


@router.get("/commands")
async def get_commands():
    """获取支持的指令列表"""
    return {
        "commands": [
            {"command": "选品", "description": "AI智能选品", "example": "选品 3个印尼站宠物用品"},
            {"command": "采集", "description": "1688商品采集", "example": "采集 1688商品链接"},
            {"command": "图片处理", "description": "翻译/优化图片", "example": "图片处理 商品SKU"},
            {"command": "优化Listing", "description": "优化商品标题描述", "example": "优化Listing 商品SKU"},
            {"command": "定价", "description": "智能定价计算", "example": "定价 商品SKU"},
            {"command": "上架", "description": "上架商品到平台", "example": "上架到TK"},
            {"command": "同步订单", "description": "同步平台订单", "example": "同步订单"},
            {"command": "查看库存", "description": "查看库存状态", "example": "查看库存"},
            {"command": "创建采购单", "description": "创建采购任务", "example": "创建采购单 商品SKU 数量"},
            {"command": "创建广告", "description": "创建广告计划", "example": "创建广告 商品SKU 日预算100"},
            {"command": "日报", "description": "今日销售日报", "example": "日报"},
            {"command": "复盘", "description": "数据分析复盘", "example": "复盘"},
            {"command": "帮助", "description": "显示帮助信息", "example": "帮助"},
            {"command": "状态", "description": "查看系统状态", "example": "状态"},
        ]
    }
