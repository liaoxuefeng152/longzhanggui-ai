# 龙掌柜智能运营系统 - API接口文档

## 概述

- **基础URL**: `http://localhost:8000/api/v1`
- **认证方式**: Bearer Token (JWT)
- **内容类型**: `application/json`
- **Swagger UI**: `http://localhost:8000/docs`
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`

## 完整API列表

### 认证模块 `/auth`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /auth/login | 用户登录 |
| POST | /auth/logout | 用户登出 |
| GET | /auth/me | 获取当前用户信息 |
| POST | /auth/send-code | 发送验证码 |

### AI智能体 `/ai-agents`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /ai-agents/select-products | 选品分析 |
| POST | /ai-agents/optimize-listing | Listing优化 |
| POST | /ai-agents/calculate-price | 智能定价 |
| POST | /ai-agents/process-image | 图片翻译处理 |
| POST | /ai-agents/process-image/batch | 批量图片翻译 |
| POST | /ai-agents/collect-1688 | 1688采集 |
| POST | /ai-agents/collect-1688/batch | 批量1688采集 |

### AI核心 `/ai`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /ai/invoke | 通用模型调用 |
| GET | /ai/models | 获取可用模型 |
| POST | /ai/test | 测试模型 |
| POST | /ai/select-products | 选品分析 |
| POST | /ai/optimize-listing | Listing优化 |
| POST | /ai/calculate-price | 定价计算 |
| POST | /ai/process-image | 图片处理 |
| POST | /ai/process-image/batch | 批量图片处理 |
| GET | /ai/process-image/task/{task_id} | 获取图片处理任务 |
| POST | /ai/analyze-competition | 竞品分析 |
| POST | /ai/suggest-keywords | 关键词建议 |
| POST | /ai/create-ad | 创建广告计划 |
| POST | /ai/optimize-ad/{campaign_id} | 优化广告 |
| POST | /ai/customer-reply | 客服回复生成 |
| POST | /ai/handle-dispute | 纠纷处理 |
| POST | /ai/data-report | 数据报告生成 |
| POST | /ai/action-items | 行动项生成 |
| POST | /ai/generate-image | 图片生成 |
| POST | /ai/generate-video | 视频生成 |
| GET | /ai/generate-video/{task_id} | 获取视频任务状态 |
| GET | /ai/agents | 智能体列表 |

### 1688采集 `/1688`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /1688/collect | 采集商品 |
| POST | /1688/collect/preview | 预览采集 |
| POST | /1688/collect/batch | 批量采集 |
| POST | /1688/search | 搜索1688 |
| POST | /1688/collect/search-page | 搜索页面采集 |
| POST | /1688/collect/batch-from-search | 搜索结果批量采集 |
| GET | /1688/history | 采集历史 |

### 智能体管理 `/agents`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /agents | 智能体列表 |
| GET | /agents/{agent_id} | 智能体详情 |
| PUT | /agents/{agent_id}/config | 更新配置 |
| POST | /agents/{agent_id}/start | 启动智能体 |
| POST | /agents/{agent_id}/stop | 停止智能体 |
| GET | /agents/tasks | 任务列表 |
| GET | /agents/tasks/{task_id} | 任务详情 |

### 工作流编排 `/workflow`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /workflow/execute | 执行工作流 |
| POST | /workflow/execute-sync | 同步执行工作流 |
| POST | /workflow/full-automation | 全自动化执行 |
| GET | /workflow/templates | 工作流模板列表 |
| GET | /workflow/templates/{template_name} | 获取模板详情 |
| GET | /workflow/executors | 执行器列表 |
| GET | /workflow/health | 工作流健康检查 |
| POST | /workflow/products/draft | 创建商品草稿 |
| GET | /workflow/products/{product_id} | 获取工作流商品 |
| PUT | /workflow/products/workflow-status | 更新工作流状态 |
| PUT | /workflow/products/listing | 更新Listing |
| PUT | /workflow/products/pricing | 更新定价 |
| PUT | /workflow/products/images | 更新图片 |
| GET | /workflow/products/list/by-status | 按状态获取商品 |

### ERP系统 `/erp`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /erp/products | 商品列表 |
| POST | /erp/products | 创建商品 |
| GET | /erp/products/{product_id} | 商品详情 |
| PUT | /erp/products/{product_id} | 更新商品 |
| DELETE | /erp/products/{product_id} | 删除商品 |
| GET | /erp/inventory | 库存列表 |
| GET | /erp/inventory/{product_id} | 商品库存 |
| PUT | /erp/inventory/{product_id} | 更新库存 |
| GET | /erp/orders | 订单列表 |
| GET | /erp/orders/{order_id} | 订单详情 |
| PUT | /erp/orders/{order_id}/status | 更新订单状态 |
| GET | /erp/purchase-orders | 采购单列表 |
| POST | /erp/purchase-orders | 创建采购单 |
| PUT | /erp/purchase-orders/{order_id} | 更新采购单 |
| GET | /erp/finance/summary | 财务汇总 |
| POST | /erp/pricing | 定价计算 |

### 商品管理 `/products`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /products | 商品列表 |
| POST | /products | 创建商品 |
| POST | /products/batch | 批量创建 |
| GET | /products/{product_id} | 商品详情 |
| PUT | /products/{product_id} | 更新商品 |
| DELETE | /products/{product_id} | 删除商品 |
| GET | /products/categories/list | 类目列表 |

### 订单管理 `/orders`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /orders | 订单列表 |
| POST | /orders | 创建订单 |
| GET | /orders/{order_id} | 订单详情 |
| PUT | /orders/{order_id}/status | 更新订单状态 |
| GET | /orders/platforms/list | 平台列表 |
| GET | /orders/stats/summary | 订单统计 |

### TikTok Shop `/tiktok`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /tiktok/health | 健康检查 |
| POST | /tiktok/products | 创建商品 |
| GET | /tiktok/products/{product_id} | 商品详情 |
| PUT | /tiktok/products/{product_id}/inventory | 更新库存 |
| GET | /tiktok/orders | 订单列表 |
| GET | /tiktok/orders/{order_id} | 订单详情 |
| POST | /tiktok/orders/ship | 订单发货 |
| POST | /tiktok/sync/orders | 同步订单 |
| GET | /tiktok/categories | 类目列表 |
| GET | /tiktok/categories/{category_id}/attributes | 类目属性 |

### 飞书集成 `/feishu`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /feishu/callback | 接收回调 |
| POST | /feishu/send | 发送消息 |
| POST | /feishu/send-card | 发送卡片消息 |
| POST | /feishu/alert | 发送告警 |
| GET | /feishu/commands | 支持的指令 |

### 飞书用户 `/feishu-users`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /feishu-users | 用户列表 |
| POST | /feishu-users | 创建用户 |
| GET | /feishu-users/{user_id} | 用户详情 |
| PUT | /feishu-users/{user_id} | 更新用户 |
| PUT | /feishu-users/{user_id}/quota | 更新配额 |
| GET | /feishu-users/{user_id}/usage | 使用量统计 |

### 控制台 `/dashboard`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /dashboard/stats | 统计数据 |

### 模型管理 `/models`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /models | 模型列表 |
| POST | /models | 创建模型 |
| GET | /models/{model_id} | 模型详情 |
| PUT | /models/{model_id} | 更新模型 |
| DELETE | /models/{model_id} | 删除模型 |
| POST | /models/{model_id}/test | 测试模型 |
| GET | /models/status/list | 模型状态列表 |

### Prompt管理 `/prompts`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /prompts | Prompt列表 |
| POST | /prompts | 创建Prompt |
| GET | /prompts/{prompt_id} | Prompt详情 |
| PUT | /prompts/{prompt_id} | 更新Prompt |
| DELETE | /prompts/{prompt_id} | 删除Prompt |

### 平台管理 `/platforms`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /platforms | 平台列表 |
| POST | /platforms | 创建平台配置 |
| POST | /platforms/{platform_id}/test | 测试连接 |
| DELETE | /platforms/{platform_id} | 删除平台 |

### 平台绑定 `/platform-bindings`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /platform-bindings | 绑定列表 |
| POST | /platform-bindings | 创建绑定 |
| GET | /platform-bindings/{binding_id} | 绑定详情 |
| PUT | /platform-bindings/{binding_id} | 更新绑定 |
| DELETE | /platform-bindings/{binding_id} | 删除绑定 |
| POST | /platform-bindings/{binding_id}/sync | 同步数据 |

### 套餐管理 `/packages`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /packages | 套餐列表 |
| POST | /packages | 创建套餐 |
| GET | /packages/{package_id} | 套餐详情 |
| PUT | /packages/{package_id} | 更新套餐 |
| DELETE | /packages/{package_id} | 删除套餐 |

### 任务日志 `/task-logs`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /task-logs | 日志列表 |
| GET | /task-logs/{log_id} | 日志详情 |
| POST | /task-logs/{log_id}/retry | 重试任务 |
| GET | /task-logs/stats/summary | 统计汇总 |

### 工单管理 `/customer-tickets`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /customer-tickets | 工单列表 |
| POST | /customer-tickets | 创建工单 |
| GET | /customer-tickets/{ticket_id} | 工单详情 |
| PUT | /customer-tickets/{ticket_id} | 更新工单 |
| POST | /customer-tickets/{ticket_id}/close | 关闭工单 |
| POST | /customer-tickets/{ticket_id}/assign | 分配工单 |
| GET | /customer-tickets/stats/summary | 统计汇总 |

### 报表 `/reports`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /reports/overview | 总览报表 |
| GET | /reports/usage | 使用量报表 |
| GET | /reports/revenue | 收入报表 |
| GET | /reports/agents | 智能体报表 |

### 系统设置 `/settings`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /settings | 获取设置 |
| PUT | /settings | 更新设置 |
| GET | /settings/feishu | 飞书设置 |
| PUT | /settings/feishu | 更新飞书设置 |
| POST | /settings/feishu/test | 测试飞书连接 |
| GET | /settings/backup | 备份列表 |
| POST | /settings/backup | 创建备份 |

### 系统 `/health`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /health | 健康检查 |
| GET | / | 根路径 |

---

## 详细接口说明

## 认证

### 登录
```
POST /auth/login
```

**请求体:**
```json
{
  "phone": "13800138000",
  "password": "admin123"
}
```

**响应:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "phone": "13800138000",
    "nickname": "阿峰",
    "role": "admin"
  }
}
```

### 获取当前用户
```
GET /auth/me
Authorization: Bearer <token>
```

---

## AI智能体

### 图片翻译处理
```
POST /ai-agents/process-image
```

**请求体:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "mode": "translate",
  "target_language": "id"
}
```

**参数说明:**
- `image_url`: 图片URL
- `mode`: 处理模式 (translate/white_bg/optimize)
- `target_language`: 目标语言 (zh/en/id/th/vi/ms)

**响应:**
```json
{
  "success": true,
  "data": {
    "original_url": "原图URL",
    "processed_url": "翻译后图片URL(可预览)",
    "original_text": "识别到的原文",
    "translated_text": "翻译后的文字",
    "text_positions": [...]
  }
}
```

### 批量图片翻译
```
POST /ai-agents/process-image/batch
```

**请求体:**
```json
{
  "image_urls": ["url1", "url2", "url3"],
  "mode": "translate",
  "target_language": "th"
}
```

### 选品分析
```
POST /ai-agents/select-products
```

**请求体:**
```json
{
  "category": "宠物用品",
  "platform": "tiktok",
  "region": "id",
  "budget": "中等",
  "quantity": 3
}
```

### Listing优化
```
POST /ai/optimize-listing
```

**请求体:**
```json
{
  "product_info": {
    "name": "产品名称",
    "description": "产品描述"
  },
  "target_platform": "tiktok"
}
```

### 智能定价
```
POST /ai-agents/calculate-price
```

**请求体:**
```json
{
  "cost_price": 68.00,
  "logistics_cost": 15.00,
  "platform_fee_rate": 0.06,
  "target_profit_rate": 0.30
}
```

### 1688采集
```
POST /ai-agents/collect-1688
```

**请求体:**
```json
{
  "url": "https://detail.1688.com/offer/xxx.html"
}
```

### 批量1688采集
```
POST /ai-agents/collect-1688/batch
```

**请求体:**
```json
{
  "urls": ["url1", "url2"]
}
```

### 关键词建议
```
POST /ai/suggest-keywords
```

**请求体:**
```json
{
  "product_name": "产品名称",
  "platform": "tiktok",
  "region": "id",
  "count": 10
}
```

### 创建广告
```
POST /ai/create-ad
```

**请求体:**
```json
{
  "product_id": "产品ID",
  "platform": "tiktok",
  "daily_budget": 100,
  "target_acos": 0.20,
  "keywords": ["关键词1", "关键词2"]
}
```

### 客服回复生成
```
POST /ai/customer-reply
```

**请求体:**
```json
{
  "message": "客户消息内容",
  "language": "id",
  "order_info": {}
}
```

### 数据复盘
```
POST /ai/data-report
```

**请求体:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "platform": "tiktok"
}
```

### 竞品分析
```
POST /ai/analyze-competition
```

**请求体:**
```json
{
  "product_name": "产品名称",
  "platform": "tiktok",
  "region": "id"
}
```

---

## 工作流编排

### 执行工作流
```
POST /workflow/execute
```

**请求体:**
```json
{
  "template_name": "new_product_listing",
  "params": {
    "category": "宠物用品",
    "region": "id"
  }
}
```

### 同步执行工作流
```
POST /workflow/execute-sync
```

### 全自动化执行
```
POST /workflow/full-automation
```

**请求体:**
```json
{
  "category": "宠物用品",
  "region": "id",
  "target_platform": "tiktok"
}
```

### 获取工作流模板
```
GET /workflow/templates
```

---

## 采集系统

### 采集商品
```
POST /1688/collect
```

**请求体:**
```json
{
  "url": "https://detail.1688.com/offer/xxx.html"
}
```

### 预览采集
```
POST /1688/collect/preview
```

### 批量采集
```
POST /1688/collect/batch
```

### 搜索采集
```
POST /1688/search
```

### 采集历史
```
GET /1688/history
```

---

## 飞书集成

### 接收飞书回调
```
POST /feishu/callback
```

### 发送消息
```
POST /feishu/send
```

### 发送卡片消息
```
POST /feishu/send-card
```

### 发送告警
```
POST /feishu/alert
```

### 获取支持的指令
```
GET /feishu/commands
```

### 飞书用户管理

**获取用户列表:**
```
GET /feishu-users
```

**创建用户:**
```
POST /feishu-users
```

**请求体:**
```json
{
  "open_id": "ou_xxx",
  "nickname": "测试用户"
}
```

**更新用户配额:**
```
PUT /feishu-users/{user_id}/quota
```

**获取用户使用量:**
```
GET /feishu-users/{user_id}/usage
```

### 工单管理

**创建工单:**
```
POST /customer-tickets
```

**请求体:**
```json
{
  "title": "工单标题",
  "content": "工单内容",
  "user_id": "用户ID",
  "priority": "medium"
}
```

---

## TikTok Shop

### 商品管理
```
POST /tiktok/products
GET /tiktok/products/{product_id}
PUT /tiktok/products/{product_id}/inventory
```

### 订单管理
```
GET /tiktok/orders
GET /tiktok/orders/{order_id}
POST /tiktok/orders/ship
POST /tiktok/sync/orders
```

### 类目管理
```
GET /tiktok/categories
GET /tiktok/categories/{category_id}/attributes
```

### 健康检查
```
GET /tiktok/health
```

---

## 控制台

### 统计数据
```
GET /dashboard/stats
```

---

## 模型管理
```
GET /models
POST /models
GET /models/{model_id}
PUT /models/{model_id}
DELETE /models/{model_id}
POST /models/{model_id}/test
GET /models/status/list
```

## Prompt管理
```
GET /prompts
POST /prompts
GET /prompts/{prompt_id}
PUT /prompts/{prompt_id}
DELETE /prompts/{prompt_id}
```

## 平台配置
```
GET /platforms
POST /platforms
POST /platforms/{platform_id}/test
DELETE /platforms/{platform_id}
```

## 套餐管理
```
GET /packages
GET /packages/{package_id}
POST /packages
PUT /packages/{package_id}
DELETE /packages/{package_id}
```

## 任务日志
```
GET /task-logs
GET /task-logs/{log_id}
POST /task-logs/{log_id}/retry
GET /task-logs/stats/summary
```

## 工单管理
```
GET /tickets
POST /tickets
GET /tickets/{ticket_id}
PUT /tickets/{ticket_id}
POST /tickets/{ticket_id}/close
POST /tickets/{ticket_id}/assign
GET /tickets/stats/summary
```

## 报表
```
GET /reports/overview
GET /reports/usage
GET /reports/revenue
GET /reports/agents
```

## 设置
```
GET /settings
PUT /settings
GET /settings/feishu
PUT /settings/feishu
POST /settings/feishu/test
GET /settings/backup
POST /settings/backup
```

---

## 通用AI调用

### 模型调用
```
POST /ai/invoke
```

**请求体:**
```json
{
  "model": "doubao-seed-1-8-251228",
  "messages": [
    {"role": "user", "content": "你好"}
  ],
  "temperature": 0.7
}
```

### 获取可用模型
```
GET /ai/models
```

### 测试模型
```
POST /ai/test
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 / Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 示例代码

### Python调用示例
```python
import requests

# 登录获取token
resp = requests.post("http://localhost:8000/api/v1/auth/login", json={
    "phone": "13800138000",
    "password": "admin123"
})
token = resp.json()["access_token"]

# 调用AI接口
headers = {"Authorization": f"Bearer {token}"}
resp = requests.post(
    "http://localhost:8000/api/v1/ai-agents/process-image",
    headers=headers,
    json={
        "image_url": "https://example.com/image.jpg",
        "mode": "translate",
        "target_language": "id"
    }
)
print(resp.json())
```

### JavaScript调用示例
```javascript
// 登录获取token
const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({phone: '13800138000', password: 'admin123'})
});
const {access_token} = await loginRes.json();

// 调用AI接口
const res = await fetch('http://localhost:8000/api/v1/ai-agents/process-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    image_url: 'https://example.com/image.jpg',
    mode: 'translate',
    target_language: 'id'
  })
});
const data = await res.json();
console.log(data);
```

### cURL调用示例
```bash
# 登录
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"admin123"}' | jq -r '.access_token')

# 调用图片处理API
curl -X POST http://localhost:8000/api/v1/ai-agents/process-image \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image_url":"https://example.com/image.jpg","mode":"translate","target_language":"id"}'
```

---

## API统计

| 模块 | 接口数量 |
|------|----------|
| 认证 | 4 |
| AI智能体 | 7 |
| AI核心 | 22 |
| 1688采集 | 7 |
| 智能体管理 | 7 |
| 工作流编排 | 15 |
| ERP系统 | 15 |
| 商品管理 | 7 |
| 订单管理 | 6 |
| TikTok Shop | 10 |
| 飞书集成 | 5 |
| 飞书用户 | 6 |
| 控制台 | 1 |
| 模型管理 | 7 |
| Prompt管理 | 5 |
| 平台管理 | 4 |
| 平台绑定 | 6 |
| 套餐管理 | 5 |
| 任务日志 | 4 |
| 工单管理 | 7 |
| 报表 | 4 |
| 系统设置 | 7 |
| **总计** | **~160+** |
