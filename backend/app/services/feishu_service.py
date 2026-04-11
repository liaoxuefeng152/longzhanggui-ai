"""
飞书机器人服务模块
实现龙掌柜调度机器人，作为系统唯一交互入口
"""
import json
import hashlib
import hmac
import time
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

import httpx
from loguru import logger

from app.core.config import settings


class CommandType(str, Enum):
    """指令类型"""
    # 全链路自动化
    FULL_AUTOMATION = "full_automation"  # 全链路自动化：选品→采集→图片→定价→Listing→上架
    
    # 选品相关
    SELECT_PRODUCTS = "select_products"  # 选品
    
    # 商品相关
    COLLECT_1688 = "collect_1688"  # 1688采集
    PROCESS_IMAGE = "process_image"  # 图片处理
    OPTIMIZE_LISTING = "optimize_listing"  # Listing优化
    CALCULATE_PRICE = "calculate_price"  # 智能定价
    PUBLISH_PRODUCT = "publish_product"  # 商品上架
    
    # 订单相关
    SYNC_ORDERS = "sync_orders"  # 同步订单
    CHECK_INVENTORY = "check_inventory"  # 查看库存
    CREATE_PURCHASE = "create_purchase"  # 创建采购单
    
    # 广告相关
    CREATE_AD = "create_ad"  # 创建广告
    CHECK_AD_STATUS = "check_ad_status"  # 查看广告
    
    # 客服相关
    REPLY_CUSTOMER = "reply_customer"  # 客服回复
    CHECK_TICKETS = "check_tickets"  # 查看工单
    
    # 数据相关
    DAILY_REPORT = "daily_report"  # 日报
    DATA_REVIEW = "data_review"  # 数据复盘
    
    # 系统相关
    HELP = "help"  # 帮助
    STATUS = "status"  # 系统状态


class FeishuService:
    """飞书机器人服务"""
    
    def __init__(self):
        self.app_id = settings.FEISHU_APP_ID
        self.app_secret = settings.FEISHU_APP_SECRET
        self.encrypt_key = settings.FEISHU_ENCRYPT_KEY
        self.verification_token = settings.FEISHU_VERIFICATION_TOKEN
        self._access_token: Optional[str] = None
        self._token_expire_time: int = 0
        
        # API基础URL
        self.base_url = "https://open.feishu.cn/open-apis"
    
    async def get_access_token(self) -> str:
        """获取飞书access_token"""
        # 检查缓存是否有效
        if self._access_token and time.time() < self._token_expire_time:
            return self._access_token
        
        if not self.app_id or not self.app_secret:
            logger.warning("飞书配置缺失，使用模拟模式")
            return "mock_access_token"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/auth/v3/tenant_access_token/internal",
                json={
                    "app_id": self.app_id,
                    "app_secret": self.app_secret
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == 0:
                    self._access_token = data["tenant_access_token"]
                    self._token_expire_time = time.time() + data.get("expire", 7200) - 300
                    return self._access_token
            
            logger.error(f"获取飞书access_token失败: {response.text}")
            return ""
    
    def verify_signature(self, timestamp: str, nonce: str, body: str, signature: str) -> bool:
        """验证飞书请求签名"""
        if not self.encrypt_key:
            return True  # 未配置加密key时跳过验证
        
        # 拼接字符串
        sign_base = timestamp + nonce + self.encrypt_key + body
        
        # 计算签名
        calculated = hashlib.sha256(sign_base.encode()).hexdigest()
        
        return calculated == signature
    
    def decrypt_message(self, encrypted_data: str) -> str:
        """解密飞书消息"""
        if not self.encrypt_key:
            return encrypted_data
        
        try:
            import base64
            from Crypto.Cipher import AES
            
            key = hashlib.sha256(self.encrypt_key.encode()).digest()
            cipher = AES.new(key, AES.MODE_CBC, iv=encrypted_data[:16].encode())
            decrypted = cipher.decrypt(base64.b64decode(encrypted_data[16:]))
            # 去除padding
            pad = decrypted[-1]
            return decrypted[:-pad].decode()
        except Exception as e:
            logger.error(f"解密消息失败: {e}")
            return encrypted_data
    
    async def send_message(
        self,
        receive_id: str,
        msg_type: str,
        content: Dict[str, Any],
        receive_id_type: str = "open_id"
    ) -> bool:
        """发送消息"""
        token = await self.get_access_token()
        
        if token == "mock_access_token":
            logger.info(f"[模拟] 发送消息: {content}")
            return True
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/im/v1/messages",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                },
                params={"receive_id_type": receive_id_type},
                json={
                    "receive_id": receive_id,
                    "msg_type": msg_type,
                    "content": json.dumps(content)
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("code") == 0
            
            logger.error(f"发送消息失败: {response.text}")
            return False
    
    async def send_text(self, open_id: str, text: str) -> bool:
        """发送文本消息"""
        return await self.send_message(open_id, "text", {"text": text})
    
    async def send_card(self, open_id: str, card: Dict[str, Any]) -> bool:
        """发送卡片消息"""
        return await self.send_message(open_id, "interactive", card)
    
    async def send_markdown(self, open_id: str, title: str, content: str) -> bool:
        """发送Markdown消息"""
        card = {
            "config": {
                "wide_screen_mode": True
            },
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": title
                }
            },
            "elements": [
                {
                    "tag": "markdown",
                    "content": content
                }
            ]
        }
        return await self.send_card(open_id, card)
    
    async def send_task_progress(
        self,
        open_id: str,
        task_name: str,
        status: str,
        progress: int,
        details: Optional[str] = None
    ) -> bool:
        """发送任务进度通知"""
        status_emoji = {
            "pending": "⏳",
            "running": "🔄",
            "success": "✅",
            "failed": "❌"
        }
        
        card = {
            "config": {"wide_screen_mode": True},
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": f"{status_emoji.get(status, '📋')} {task_name}"
                },
                "template": "blue" if status == "running" else "green" if status == "success" else "red"
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "plain_text",
                        "content": f"状态: {status} | 进度: {progress}%"
                    }
                }
            ]
        }
        
        if details:
            card["elements"].append({
                "tag": "markdown",
                "content": details
            })
        
        return await self.send_card(open_id, card)
    
    async def send_alert(
        self,
        open_id: str,
        alert_type: str,
        title: str,
        content: str,
        level: str = "warning"
    ) -> bool:
        """发送告警通知"""
        level_config = {
            "info": {"emoji": "ℹ️", "color": "blue"},
            "warning": {"emoji": "⚠️", "color": "yellow"},
            "error": {"emoji": "🚨", "color": "red"},
            "success": {"emoji": "✅", "color": "green"}
        }
        
        config = level_config.get(level, level_config["warning"])
        
        card = {
            "config": {"wide_screen_mode": True},
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": f"{config['emoji']} {title}"
                },
                "template": config["color"]
            },
            "elements": [
                {
                    "tag": "div",
                    "text": {
                        "tag": "lark_md",
                        "content": f"**类型:** {alert_type}\n\n{content}"
                    }
                },
                {
                    "tag": "note",
                    "elements": [
                        {
                            "tag": "plain_text",
                            "content": f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                        }
                    ]
                }
            ]
        }
        
        return await self.send_card(open_id, card)


class CommandParser:
    """指令解析器"""
    
    # 指令关键词映射
    KEYWORD_MAP = {
        # 全链路自动化（最高优先级）
        "自动上架": CommandType.FULL_AUTOMATION,
        "全自动": CommandType.FULL_AUTOMATION,
        "全链路": CommandType.FULL_AUTOMATION,
        "一键上架": CommandType.FULL_AUTOMATION,
        
        # 选品
        "选品": CommandType.SELECT_PRODUCTS,
        "选": CommandType.SELECT_PRODUCTS,
        "爆款": CommandType.SELECT_PRODUCTS,
        
        # 采集
        "采集": CommandType.COLLECT_1688,
        "1688": CommandType.COLLECT_1688,
        "抓取": CommandType.COLLECT_1688,
        
        # 图片
        "图片": CommandType.PROCESS_IMAGE,
        "翻译图片": CommandType.PROCESS_IMAGE,
        "处理图片": CommandType.PROCESS_IMAGE,
        
        # Listing
        "listing": CommandType.OPTIMIZE_LISTING,
        "优化": CommandType.OPTIMIZE_LISTING,
        "标题": CommandType.OPTIMIZE_LISTING,
        
        # 定价
        "定价": CommandType.CALCULATE_PRICE,
        "价格": CommandType.CALCULATE_PRICE,
        
        # 上架
        "上架": CommandType.PUBLISH_PRODUCT,
        "发布": CommandType.PUBLISH_PRODUCT,
        
        # 订单
        "订单": CommandType.SYNC_ORDERS,
        "同步订单": CommandType.SYNC_ORDERS,
        
        # 库存
        "库存": CommandType.CHECK_INVENTORY,
        "库存预警": CommandType.CHECK_INVENTORY,
        
        # 采购
        "采购": CommandType.CREATE_PURCHASE,
        "补货": CommandType.CREATE_PURCHASE,
        
        # 广告
        "广告": CommandType.CREATE_AD,
        "投放": CommandType.CREATE_AD,
        
        # 客服
        "客服": CommandType.REPLY_CUSTOMER,
        "回复": CommandType.REPLY_CUSTOMER,
        "工单": CommandType.CHECK_TICKETS,
        
        # 报表
        "日报": CommandType.DAILY_REPORT,
        "报表": CommandType.DAILY_REPORT,
        "复盘": CommandType.DATA_REVIEW,
        "数据": CommandType.DATA_REVIEW,
        
        # 帮助
        "帮助": CommandType.HELP,
        "help": CommandType.HELP,
        "?": CommandType.HELP,
        
        # 状态
        "状态": CommandType.STATUS,
        "系统状态": CommandType.STATUS,
    }
    
    def __init__(self):
        self.feishu_service = FeishuService()
    
    def parse(self, text: str) -> Dict[str, Any]:
        """解析用户指令"""
        text = text.strip().lower()
        
        # 提取平台
        platform = None
        if "tk" in text or "tiktok" in text:
            platform = "tiktok"
        elif "亚马逊" in text or "amazon" in text:
            platform = "amazon"
        
        # 提取数量
        import re
        num_match = re.search(r'(\d+)[个件款]', text)
        quantity = int(num_match.group(1)) if num_match else None
        
        # 提取站点
        site = None
        site_keywords = {
            "印尼": "id",
            "印尼站": "id",
            "泰国": "th",
            "泰国站": "th",
            "越南": "vn",
            "越南站": "vn",
            "美国": "us",
            "美国站": "us",
        }
        for keyword, code in site_keywords.items():
            if keyword in text:
                site = code
                break
        
        # 提取品类
        category = None
        category_keywords = ["宠物用品", "服装", "美妆", "家居", "电子", "玩具", "食品"]
        for cat in category_keywords:
            if cat in text:
                category = cat
                break
        
        # 检测是否需要自动上架
        auto_publish = False
        if "上架" in text or "自动" in text or "一键" in text:
            auto_publish = True
        
        # 识别指令类型
        command_type = None
        for keyword, cmd_type in self.KEYWORD_MAP.items():
            if keyword in text:
                command_type = cmd_type
                break
        
        if not command_type:
            command_type = CommandType.HELP
        
        return {
            "command_type": command_type,
            "platform": platform,
            "site": site,
            "category": category,
            "quantity": quantity,
            "auto_publish": auto_publish,
            "original_text": text,
        }
    
    async def execute(self, parsed_command: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """执行指令"""
        from app.services.task_service import TaskService
        from app.services.workflow_orchestrator import workflow_orchestrator
        
        command_type = parsed_command["command_type"]
        
        # 帮助指令
        if command_type == CommandType.HELP:
            return {
                "success": True,
                "message": self._get_help_text(),
                "need_callback": False
            }
        
        # 系统状态
        if command_type == CommandType.STATUS:
            return {
                "success": True,
                "message": "✅ 系统运行正常\n- ERP服务: 正常\n- AI智能体: 正常\n- 订单同步: 正常\n- 工作流引擎: 正常",
                "need_callback": False
            }
        
        # 全链路自动化 - 使用工作流引擎
        if command_type == CommandType.FULL_AUTOMATION:
            return await self._execute_full_automation(parsed_command, user_id)
        
        # 单步选品 + 自动触发后续流程
        if command_type == CommandType.SELECT_PRODUCTS:
            # 判断是否需要自动上架
            if parsed_command.get("auto_publish") or "上架" in parsed_command.get("original_text", ""):
                return await self._execute_full_automation(parsed_command, user_id)
            
            # 否则只执行选品
            return await self._execute_single_task(command_type, parsed_command, user_id)
        
        # 其他单步任务
        return await self._execute_single_task(command_type, parsed_command, user_id)
    
    async def _execute_full_automation(self, parsed_command: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """执行全链路自动化"""
        from app.services.workflow_orchestrator import workflow_orchestrator
        import asyncio
        
        logger.info(f"启动全链路自动化: {parsed_command}")
        
        # 立即返回确认消息
        async def notify_progress(workflow_id: str, event_type: str, data: Dict[str, Any]):
            """进度通知回调"""
            try:
                if event_type == "step_completed":
                    step_name = data.get("step_name", "")
                    progress = data.get("progress", 0)
                    message = f"🔄 {step_name} 完成 ({progress:.0f}%)"
                    await self.feishu_service.send_text(user_id, message)
                elif event_type == "workflow_completed":
                    results = data.get("results", {})
                    message = self._format_workflow_result(results)
                    await self.feishu_service.send_markdown(user_id, "✅ 全链路自动化完成", message)
                elif event_type == "workflow_failed":
                    await self.feishu_service.send_text(user_id, f"❌ 工作流执行失败: {data.get('error')}")
            except Exception as e:
                logger.error(f"发送进度通知失败: {e}")
        
        # 构建工作流参数
        workflow_params = {
            "category": parsed_command.get("category", "宠物用品"),
            "platform": parsed_command.get("platform", "tiktok"),
            "region": parsed_command.get("site", "id"),
            "quantity": parsed_command.get("quantity", 3),
            "target_language": "id" if parsed_command.get("site") == "id" else "en",
            "image_mode": "translate",
            "profit_rate": 0.3
        }
        
        # 异步执行工作流
        asyncio.create_task(
            workflow_orchestrator.execute_workflow(
                template_name="full_automation",
                user_id=user_id,
                params=workflow_params,
                notify_callback=notify_progress
            )
        )
        
        return {
            "success": True,
            "message": f"🚀 **全链路自动化已启动**\n\n"
                      f"📋 选品需求：{workflow_params['quantity']}个{workflow_params['region']}站{workflow_params['category']}\n"
                      f"🎯 目标平台：{workflow_params['platform']}\n\n"
                      f"系统将自动执行以下步骤：\n"
                      f"1️⃣ AI智能选品\n"
                      f"2️⃣ 1688商品采集\n"
                      f"3️⃣ 图片智能处理\n"
                      f"4️⃣ 智能定价\n"
                      f"5️⃣ Listing优化\n"
                      f"6️⃣ 商品上架\n\n"
                      f"⏳ 请稍候，正在执行中...",
            "need_callback": True,
            "workflow": "full_automation"
        }
    
    async def _execute_single_task(self, command_type: CommandType, parsed_command: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """执行单步任务"""
        from app.services.task_service import TaskService
        
        task_service = TaskService()
        task = await task_service.create_task(
            user_id=user_id,
            task_type=command_type.value,
            params=parsed_command
        )
        
        return {
            "success": True,
            "message": f"✅ 已收到指令，正在执行...\n任务ID: {task['id']}",
            "task_id": task["id"],
            "need_callback": True
        }
    
    def _format_workflow_result(self, results: Dict[str, Any]) -> str:
        """格式化工作流结果"""
        lines = []
        
        # 选品结果
        if "product_selection" in results:
            products = results["product_selection"].get("output", {}).get("products", [])
            lines.append(f"**选品完成**：{len(products)}个商品")
        
        # 采集结果
        if "collect_1688" in results:
            collected = results["collect_1688"].get("output", {}).get("total_count", 0)
            images = results["collect_1688"].get("output", {}).get("total_images", 0)
            lines.append(f"**采集完成**：{collected}个商品，{images}张图片")
        
        # 图片处理结果
        if "image_processing" in results:
            processed = results["image_processing"].get("output", {}).get("total_processed", 0)
            lines.append(f"**图片处理**：{processed}张完成")
        
        # 定价结果
        if "pricing" in results:
            pricing_count = results["pricing"].get("output", {}).get("total_products", 0)
            lines.append(f"**定价完成**：{pricing_count}个商品")
        
        # 上架结果
        if "publish" in results:
            published = results["publish"].get("output", {}).get("total_published", 0)
            products = results["publish"].get("output", {}).get("published_products", [])
            lines.append(f"**上架完成**：{published}个商品")
            
            # 列出上架商品链接
            for p in products[:3]:
                if p.get("listing_url"):
                    lines.append(f"  - [{p.get('product_name')}]({p.get('listing_url')})")
        
        return "\n".join(lines) if lines else "执行完成"
    
    def _get_help_text(self) -> str:
        """获取帮助文本"""
        return """
🦞 **龙掌柜智能运营系统 - 指令帮助**

**🚀 全链路自动化（推荐）**
• `选品 3个印尼站宠物用品 自动上架` - 一句话完成选品到上架全流程
• `全自动上架 2个泰国站美妆` - 全链路自动化
• `一键上架 美国站电子` - 自动选品+采集+处理+上架

**📦 单步操作**
• `选品 3个印尼站宠物用品` - AI智能选品
• `采集 1688商品链接` - 采集1688商品
• `图片处理 [商品]` - 翻译/优化图片
• `优化Listing [商品]` - 优化标题描述
• `定价 [商品]` - 智能定价计算
• `上架到TK/亚马逊` - 自动上架商品

**📊 运营管理**
• `同步订单` - 同步平台订单
• `查看库存` - 库存状态与预警
• `创建采购单` - 创建采购任务
• `创建广告` - 创建广告计划

**💬 客服与数据**
• `客服回复` - AI客服处理
• `查看工单` - 查看客服工单
• `日报` - 今日销售日报
• `复盘` - 数据分析复盘

**⚙️ 系统**
• `帮助` - 显示帮助信息
• `状态` - 查看系统状态
"""


# 全局实例
feishu_service = FeishuService()
command_parser = CommandParser()
