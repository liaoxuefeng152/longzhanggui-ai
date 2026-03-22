# 龙虾AI跨境无人店系统 - API接口清单

> 版本：v2.0  
> 更新时间：2024-02-22  
> 状态：✅ 全部实现

---

## 一、认证模块 `/api/v1/auth`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 1 | `/auth/login` | POST | 用户登录 | ✅ |
| 2 | `/auth/logout` | POST | 用户登出 | ✅ |
| 3 | `/auth/me` | GET | 获取当前用户 | ✅ |
| 4 | `/auth/send-code` | POST | 发送验证码 | ✅ |

---

## 二、模型路由模块 `/api/v1/models`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 5 | `/models` | GET | 获取模型列表 | ✅ |
| 6 | `/models` | POST | 创建模型配置 | ✅ |
| 7 | `/models/{id}` | GET | 获取模型详情 | ✅ |
| 8 | `/models/{id}` | PUT | 更新模型配置 | ✅ |
| 9 | `/models/{id}` | DELETE | 删除模型配置 | ✅ |
| 10 | `/models/{id}/test` | POST | 测试模型连通性 | ✅ |
| 11 | `/models/status/list` | GET | 获取模型状态列表 | ✅ |

---

## 三、Prompt模块 `/api/v1/prompts`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 12 | `/prompts` | GET | 获取Prompt列表 | ✅ |
| 13 | `/prompts` | POST | 创建Prompt模板 | ✅ |
| 14 | `/prompts/{id}` | GET | 获取Prompt详情 | ✅ |
| 15 | `/prompts/{id}` | PUT | 更新Prompt模板 | ✅ |
| 16 | `/prompts/{id}` | DELETE | 删除Prompt模板 | ✅ |

---

## 四、智能体模块 `/api/v1/agents`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 17 | `/agents` | GET | 获取智能体列表 | ✅ |
| 18 | `/agents` | POST | 创建智能体 | ✅ |
| 19 | `/agents/{id}` | GET | 获取智能体详情 | ✅ |
| 20 | `/agents/{id}/config` | PUT | 更新智能体配置 | ✅ |
| 21 | `/agents/{id}/start` | POST | 启动智能体任务 | ✅ |
| 22 | `/agents/{id}/stop` | POST | 停止智能体任务 | ✅ |
| 23 | `/agents/tasks` | GET | 获取任务列表 | ✅ |
| 24 | `/agents/tasks/{taskId}` | GET | 获取任务详情 | ✅ |

---

## 五、AI调用模块 `/api/v1/ai`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 25 | `/ai/invoke` | POST | AI模型调用（支持流式） | ✅ |

---

## 六、控制台模块 `/api/v1/dashboard`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 26 | `/dashboard/stats` | GET | 获取控制台统计数据 | ✅ |

---

## 七、飞书用户模块 `/api/v1/feishu-users`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 27 | `/feishu-users` | GET | 获取飞书用户列表 | ✅ |
| 28 | `/feishu-users` | POST | 创建飞书用户 | ✅ |
| 29 | `/feishu-users/{id}` | GET | 获取用户详情 | ✅ |
| 30 | `/feishu-users/{id}` | PUT | 更新用户信息 | ✅ |
| 31 | `/feishu-users/{id}/quota` | PUT | 调整用户配额 | ✅ |
| 32 | `/feishu-users/{id}/usage` | GET | 获取用户使用统计 | ✅ |

---

## 八、套餐管理模块 `/api/v1/packages`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 33 | `/packages` | GET | 获取套餐列表 | ✅ |
| 34 | `/packages` | POST | 创建套餐 | ✅ |
| 35 | `/packages/{id}` | GET | 获取套餐详情 | ✅ |
| 36 | `/packages/{id}` | PUT | 更新套餐 | ✅ |
| 37 | `/packages/{id}` | DELETE | 删除套餐 | ✅ |

---

## 九、任务日志模块 `/api/v1/task-logs`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 38 | `/task-logs` | GET | 获取任务日志列表 | ✅ |
| 39 | `/task-logs/{id}` | GET | 获取日志详情 | ✅ |
| 40 | `/task-logs/{id}/retry` | POST | 重试任务 | ✅ |
| 41 | `/task-logs/stats/summary` | GET | 获取任务统计 | ✅ |

---

## 十、平台绑定模块 `/api/v1/platform-bindings`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 42 | `/platform-bindings` | GET | 获取平台绑定列表 | ✅ |
| 43 | `/platform-bindings` | POST | 绑定平台账号 | ✅ |
| 44 | `/platform-bindings/{id}` | GET | 获取绑定详情 | ✅ |
| 45 | `/platform-bindings/{id}` | PUT | 更新绑定信息 | ✅ |
| 46 | `/platform-bindings/{id}` | DELETE | 解绑平台账号 | ✅ |
| 47 | `/platform-bindings/{id}/sync` | POST | 同步平台数据 | ✅ |

---

## 十一、商品库模块 `/api/v1/products`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 48 | `/products` | GET | 获取商品列表 | ✅ |
| 49 | `/products` | POST | 添加商品 | ✅ |
| 50 | `/products/{id}` | GET | 获取商品详情 | ✅ |
| 51 | `/products/{id}` | PUT | 更新商品信息 | ✅ |
| 52 | `/products/{id}` | DELETE | 删除商品 | ✅ |
| 53 | `/products/batch` | POST | 批量导入商品 | ✅ |
| 54 | `/products/categories/list` | GET | 获取商品分类 | ✅ |

---

## 十二、订单中心模块 `/api/v1/orders`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 55 | `/orders` | GET | 获取订单列表 | ✅ |
| 56 | `/orders` | POST | 创建订单 | ✅ |
| 57 | `/orders/{id}` | GET | 获取订单详情 | ✅ |
| 58 | `/orders/{id}/status` | PUT | 更新订单状态 | ✅ |
| 59 | `/orders/stats/summary` | GET | 获取订单统计 | ✅ |
| 60 | `/orders/platforms/list` | GET | 获取平台列表 | ✅ |

---

## 十三、客服工单模块 `/api/v1/customer-tickets`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 61 | `/customer-tickets` | GET | 获取工单列表 | ✅ |
| 62 | `/customer-tickets` | POST | 创建工单 | ✅ |
| 63 | `/customer-tickets/{id}` | GET | 获取工单详情 | ✅ |
| 64 | `/customer-tickets/{id}` | PUT | 更新工单 | ✅ |
| 65 | `/customer-tickets/{id}/close` | POST | 关闭工单 | ✅ |
| 66 | `/customer-tickets/{id}/assign` | POST | 分配工单 | ✅ |
| 67 | `/customer-tickets/stats/summary` | GET | 获取工单统计 | ✅ |

---

## 十四、数据报表模块 `/api/v1/reports`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 68 | `/reports/overview` | GET | 获取报表概览 | ✅ |
| 69 | `/reports/usage` | GET | 获取使用量统计 | ✅ |
| 70 | `/reports/revenue` | GET | 获取收入统计 | ✅ |
| 71 | `/reports/agents` | GET | 获取智能体统计 | ✅ |

---

## 十五、系统设置模块 `/api/v1/settings`

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 72 | `/settings` | GET | 获取系统设置 | ✅ |
| 73 | `/settings` | PUT | 更新系统设置 | ✅ |
| 74 | `/settings/feishu` | GET | 获取飞书配置 | ✅ |
| 75 | `/settings/feishu` | PUT | 更新飞书配置 | ✅ |
| 76 | `/settings/feishu/test` | POST | 测试飞书连接 | ✅ |
| 77 | `/settings/backup` | GET | 获取备份信息 | ✅ |
| 78 | `/settings/backup` | POST | 创建备份 | ✅ |

---

## 统计汇总

| 模块 | API数量 | 状态 |
|------|---------|------|
| 认证模块 | 4 | ✅ |
| 模型路由 | 7 | ✅ |
| Prompt模块 | 5 | ✅ |
| 智能体模块 | 8 | ✅ |
| AI调用模块 | 1 | ✅ |
| 控制台模块 | 1 | ✅ |
| 飞书用户模块 | 6 | ✅ |
| 套餐管理模块 | 5 | ✅ |
| 任务日志模块 | 4 | ✅ |
| 平台绑定模块 | 6 | ✅ |
| 商品库模块 | 7 | ✅ |
| 订单中心模块 | 6 | ✅ |
| 客服工单模块 | 7 | ✅ |
| 数据报表模块 | 4 | ✅ |
| 系统设置模块 | 7 | ✅ |
| **总计** | **78** | **✅** |

---

## API文档访问

启动后端服务后，访问以下地址查看完整API文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
