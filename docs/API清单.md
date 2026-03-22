# 龙虾AI跨境无人店系统 - API接口清单

> 版本：v1.0  
> 更新时间：2024-02-21

---

## 一、已存在 API（需完善）

| 序号 | API路径 | 方法 | 功能 | 状态 |
|------|---------|------|------|------|
| 1 | `/api/auth/login` | POST | 手机验证码登录 | ⚠️ Mock实现 |
| 2 | `/api/dashboard/stats` | GET | 控制台统计数据 | ⚠️ Mock实现 |
| 3 | `/api/models/status` | GET | 模型状态列表 | ⚠️ Mock实现 |
| 4 | `/api/prompts` | GET | Prompt模板列表 | ⚠️ Mock实现 |
| 5 | `/api/ai/model/invoke` | POST | AI模型调用（流式） | ✅ 已实现SDK调用 |

---

## 二、待实现 API

### 1. 认证模块 `/api/auth`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 6 | `/api/auth/send-code` | POST | 发送短信验证码 | `phone: string` | `{ success: boolean, message: string }` |
| 7 | `/api/auth/logout` | POST | 退出登录 | - | `{ success: boolean }` |
| 8 | `/api/auth/me` | GET | 获取当前用户信息 | - | `{ user: User }` |

### 2. 模型路由模块 `/api/models`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 9 | `/api/models` | GET | 获取模型列表 | `page, pageSize, status` | `{ models: Model[], total: number }` |
| 10 | `/api/models` | POST | 添加模型配置 | `name, modelId, apiKey, endpoint, dailyLimit` | `{ model: Model }` |
| 11 | `/api/models/[id]` | PUT | 更新模型配置 | `name, modelId, apiKey, endpoint, dailyLimit, status` | `{ model: Model }` |
| 12 | `/api/models/[id]` | DELETE | 删除模型配置 | - | `{ success: boolean }` |
| 13 | `/api/models/[id]/test` | POST | 测试模型连通性 | - | `{ success: boolean, latency: number, message: string }` |

### 3. Prompt模块 `/api/prompts`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 14 | `/api/prompts` | POST | 创建Prompt模板 | `name, category, content, model, agent` | `{ prompt: Prompt }` |
| 15 | `/api/prompts/[id]` | GET | 获取Prompt详情 | - | `{ prompt: Prompt }` |
| 16 | `/api/prompts/[id]` | PUT | 更新Prompt模板 | `name, category, content, model, agent, isActive` | `{ prompt: Prompt }` |
| 17 | `/api/prompts/[id]` | DELETE | 删除Prompt模板 | - | `{ success: boolean }` |

### 4. 智能体模块 `/api/agents`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 18 | `/api/agents` | GET | 获取智能体列表 | `page, pageSize, status` | `{ agents: Agent[], total: number }` |
| 19 | `/api/agents/[id]` | GET | 获取智能体详情 | - | `{ agent: Agent }` |
| 20 | `/api/agents/[id]/config` | PUT | 更新智能体配置 | `config: object` | `{ agent: Agent }` |
| 21 | `/api/agents/[id]/start` | POST | 启动智能体任务 | `params: object` | `{ taskId: string }` |
| 22 | `/api/agents/[id]/stop` | POST | 停止智能体任务 | `taskId: string` | `{ success: boolean }` |
| 23 | `/api/agents/tasks` | GET | 获取任务列表 | `agentId, status, page, pageSize` | `{ tasks: Task[], total: number }` |
| 24 | `/api/agents/tasks/[taskId]` | GET | 获取任务详情 | - | `{ task: Task }` |

### 5. 飞书用户模块 `/api/feishu-users`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 25 | `/api/feishu-users` | GET | 获取飞书用户列表 | `page, pageSize, keyword, status` | `{ users: FeishuUser[], total: number }` |
| 26 | `/api/feishu-users/[id]` | GET | 获取用户详情 | - | `{ user: FeishuUser }` |
| 27 | `/api/feishu-users/[id]` | PUT | 更新用户信息 | `nickname, status, packageId` | `{ user: FeishuUser }` |
| 28 | `/api/feishu-users/[id]/quota` | PUT | 调整用户配额 | `callQuota: number, reason: string` | `{ user: FeishuUser }` |

### 6. 套餐管理模块 `/api/packages`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 29 | `/api/packages` | GET | 获取套餐列表 | - | `{ packages: Package[] }` |
| 30 | `/api/packages` | POST | 创建套餐 | `name, price, callQuota, duration, features` | `{ package: Package }` |
| 31 | `/api/packages/[id]` | PUT | 更新套餐 | `name, price, callQuota, duration, features, isActive` | `{ package: Package }` |
| 32 | `/api/packages/[id]` | DELETE | 删除套餐 | - | `{ success: boolean }` |

### 7. 任务日志模块 `/api/task-logs`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 33 | `/api/task-logs` | GET | 获取任务日志列表 | `userId, agentId, status, startDate, endDate, page, pageSize` | `{ logs: TaskLog[], total: number }` |
| 34 | `/api/task-logs/[id]` | GET | 获取日志详情 | - | `{ log: TaskLog }` |
| 35 | `/api/task-logs/[id]/retry` | POST | 重试任务 | - | `{ taskId: string }` |

### 8. 平台绑定模块 `/api/platform-bindings`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 36 | `/api/platform-bindings` | GET | 获取平台绑定列表 | `userId, platform, page, pageSize` | `{ bindings: PlatformBinding[], total: number }` |
| 37 | `/api/platform-bindings` | POST | 绑定平台账号 | `platform, accountInfo, credentials` | `{ binding: PlatformBinding }` |
| 38 | `/api/platform-bindings/[id]` | PUT | 更新绑定信息 | `accountInfo, credentials, status` | `{ binding: PlatformBinding }` |
| 39 | `/api/platform-bindings/[id]` | DELETE | 解绑平台账号 | - | `{ success: boolean }` |

### 9. 商品库模块 `/api/products`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 40 | `/api/products` | GET | 获取商品列表 | `keyword, category, status, page, pageSize` | `{ products: Product[], total: number }` |
| 41 | `/api/products` | POST | 添加商品 | `name, sku, category, price, stock, images, description` | `{ product: Product }` |
| 42 | `/api/products/[id]` | GET | 获取商品详情 | - | `{ product: Product }` |
| 43 | `/api/products/[id]` | PUT | 更新商品信息 | `name, sku, category, price, stock, images, description, status` | `{ product: Product }` |
| 44 | `/api/products/[id]` | DELETE | 删除商品 | - | `{ success: boolean }` |
| 45 | `/api/products/batch` | POST | 批量导入商品 | `products: Product[]` | `{ success: number, failed: number }` |

### 10. 订单中心模块 `/api/orders`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 46 | `/api/orders` | GET | 获取订单列表 | `keyword, status, platform, startDate, endDate, page, pageSize` | `{ orders: Order[], total: number }` |
| 47 | `/api/orders/[id]` | GET | 获取订单详情 | - | `{ order: Order }` |
| 48 | `/api/orders/[id]/status` | PUT | 更新订单状态 | `status, remark` | `{ order: Order }` |
| 49 | `/api/orders/stats` | GET | 获取订单统计 | `startDate, endDate` | `{ stats: OrderStats }` |

### 11. 客服工单模块 `/api/customer-tickets`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 50 | `/api/customer-tickets` | GET | 获取工单列表 | `status, priority, userId, page, pageSize` | `{ tickets: Ticket[], total: number }` |
| 51 | `/api/customer-tickets` | POST | 创建工单 | `title, content, priority, userId` | `{ ticket: Ticket }` |
| 52 | `/api/customer-tickets/[id]` | GET | 获取工单详情 | - | `{ ticket: Ticket }` |
| 53 | `/api/customer-tickets/[id]` | PUT | 更新工单 | `title, content, priority, status` | `{ ticket: Ticket }` |
| 54 | `/api/customer-tickets/[id]/close` | POST | 关闭工单 | `resolution: string` | `{ ticket: Ticket }` |

### 12. 数据报表模块 `/api/reports`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 55 | `/api/reports/overview` | GET | 获取报表概览 | `startDate, endDate` | `{ overview: OverviewStats }` |
| 56 | `/api/reports/usage` | GET | 使用量统计 | `startDate, endDate, granularity` | `{ usage: UsageStats[] }` |
| 57 | `/api/reports/revenue` | GET | 收入统计 | `startDate, endDate, granularity` | `{ revenue: RevenueStats[] }` |
| 58 | `/api/reports/agents` | GET | 智能体调用统计 | `startDate, endDate` | `{ agents: AgentStats[] }` |

### 13. 系统设置模块 `/api/settings`

| 序号 | API路径 | 方法 | 功能 | 请求参数 | 响应数据 |
|------|---------|------|------|----------|----------|
| 59 | `/api/settings` | GET | 获取系统设置 | - | `{ settings: Settings }` |
| 60 | `/api/settings` | PUT | 更新系统设置 | `settings: object` | `{ settings: Settings }` |
| 61 | `/api/settings/feishu` | GET | 获取飞书配置 | - | `{ feishu: FeishuConfig }` |
| 62 | `/api/settings/feishu` | PUT | 更新飞书配置 | `appId, appSecret, encryptKey, verificationToken` | `{ feishu: FeishuConfig }` |

---

## 三、数据类型定义

### User 用户
```typescript
interface User {
  id: string;
  phone: string;
  nickname: string;
  role: 'admin' | 'user';
  avatar: string;
  status: 'active' | 'inactive' | 'banned';
  packageId?: string;
  callQuota: number;
  callUsed: number;
  createdAt: string;
  updatedAt: string;
}
```

### Model 模型配置
```typescript
interface Model {
  id: string;
  name: string;
  modelId: string;
  provider: 'doubao' | 'openai' | 'deepseek' | 'custom';
  apiKey: string;
  endpoint: string;
  dailyLimit: number;
  todayUsed: number;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
}
```

### Prompt Prompt模板
```typescript
interface Prompt {
  id: string;
  name: string;
  category: string;
  content: string;
  model: string;
  agent: string;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Agent 智能体
```typescript
interface Agent {
  id: string;
  name: string;
  type: 'product-selection' | 'image-design' | 'video-generation' | 'listing-optimization' | 'advertising' | 'customer-service' | 'data-review';
  description: string;
  promptId: string;
  modelId: string;
  config: Record<string, any>;
  status: 'active' | 'inactive';
  totalCalls: number;
  createdAt: string;
  updatedAt: string;
}
```

### Task 任务
```typescript
interface Task {
  id: string;
  agentId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}
```

### FeishuUser 飞书用户
```typescript
interface FeishuUser {
  id: string;
  openId: string;
  unionId: string;
  nickname: string;
  avatar: string;
  mobile?: string;
  departmentId?: string;
  status: 'active' | 'inactive';
  packageId?: string;
  callQuota: number;
  callUsed: number;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Package 套餐
```typescript
interface Package {
  id: string;
  name: string;
  price: number;
  callQuota: number;
  duration: number; // 天数
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### TaskLog 任务日志
```typescript
interface TaskLog {
  id: string;
  taskId: string;
  agentId: string;
  userId: string;
  action: string;
  status: 'success' | 'failed';
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  duration: number; // 毫秒
  tokensUsed?: number;
  createdAt: string;
}
```

### PlatformBinding 平台绑定
```typescript
interface PlatformBinding {
  id: string;
  userId: string;
  platform: 'tiktok' | 'shopee' | 'lazada' | 'tokopedia';
  shopId: string;
  shopName: string;
  accountInfo: Record<string, any>;
  credentials: Record<string, any>; // 加密存储
  status: 'active' | 'expired' | 'error';
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Product 商品
```typescript
interface Product {
  id: string;
  userId: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
```

### Order 订单
```typescript
interface Order {
  id: string;
  orderNo: string;
  userId: string;
  platform: string;
  shopId: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  buyerInfo: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
```

### Ticket 工单
```typescript
interface Ticket {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId: string;
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Settings 系统设置
```typescript
interface Settings {
  siteName: string;
  siteLogo: string;
  contactEmail: string;
  contactPhone: string;
  trialDays: number;
  defaultCallQuota: number;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### FeishuConfig 飞书配置
```typescript
interface FeishuConfig {
  appId: string;
  appSecret: string;
  encryptKey: string;
  verificationToken: string;
  botName: string;
  welcomeMessage: string;
}
```

---

## 四、统计汇总

| 分类 | 已实现 | 待实现 | 合计 |
|------|--------|--------|------|
| 认证模块 | 1 | 3 | 4 |
| 模型路由 | 1 | 4 | 5 |
| Prompt模块 | 1 | 4 | 5 |
| 智能体模块 | 0 | 7 | 7 |
| 飞书用户 | 0 | 4 | 4 |
| 套餐管理 | 0 | 4 | 4 |
| 任务日志 | 0 | 3 | 3 |
| 平台绑定 | 0 | 4 | 4 |
| 商品库 | 0 | 6 | 6 |
| 订单中心 | 0 | 4 | 4 |
| 客服工单 | 0 | 5 | 5 |
| 数据报表 | 0 | 4 | 4 |
| 系统设置 | 0 | 4 | 4 |
| **总计** | **3** | **56** | **59** |
