# 龙虾AI跨境无人店系统 - 项目规范文档

## 项目概览

**项目名称**: 龙虾AI跨境无人店系统  
**项目类型**: 跨境电商AI智能体运营平台  
**核心功能**: 管理后台、7大AI智能体、自研轻量ERP

### 业务架构
- **7大AI智能体**: 选品、图片设计、视频生成、Listing优化、广告投放、客服、数据复盘
- **自研ERP**: 商品库、库存管理、采购管理、订单中心、物流跟踪、财务管理
- **全链路自动化**: 从选品到售后的AI驱动闭环

### 数据流转架构

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           跨境电商全链路数据流转                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  [选品采集] ──→ [商品入库] ──→ [图片处理] ──→ [Listing优化] ──→ [智能定价]           │
│      │              │              │              │              │                  │
│      ▼              ▼              ▼              ▼              ▼                  │
│   AI分析         保存SKU        主图生成       标题/描述      价格策略              │
│   竞品分析       成本核算       背景替换       关键词挖掘      利润核算              │
│   合规校验       供应链匹配     图片翻译       五点描述        竞品对比              │
│      │              │              │              │              │                  │
│      └──────────────┴──────────────┴──────────────┴──────────────┘                  │
│                                    │                                                │
│                                    ▼                                                │
│                            [上架发布] ──→ [广告推广] ──→ [订单管理]                  │
│                                │              │              │                      │
│                                ▼              ▼              ▼                      │
│                            平台API        广告创建       订单同步                    │
│                            多店铺         预算优化       异常处理                    │
│                            多站点         ROI监控        利润核算                    │
│                                │              │              │                      │
│                                └──────────────┴──────────────┘                      │
│                                    │                                                │
│                                    ▼                                                │
│                            [物流配送] ──→ [客服售后] ──→ [数据复盘]                  │
│                                │              │              │                      │
│                                ▼              ▼              ▼                      │
│                            物流追踪       AI客服回复      数据分析                    │
│                            异常预警       纠纷处理        问题诊断                    │
│                            签收确认       工单管理        行动项生成                  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 商品生命周期状态

| 状态 | 说明 | 可执行操作 |
|------|------|-----------|
| draft | 草稿 | 编辑、删除 |
| selected | 已选品 | 开始处理、删除 |
| processing | 处理中 | 查看进度 |
| ready | 待上架 | 上架发布 |
| published | 已上架 | 查看销售数据、创建广告 |
| archived | 已归档 | 重新激活 |

## 技术栈

### 前端
- **框架**: Next.js 16 (App Router)
- **UI库**: React 19
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **组件**: shadcn/ui (基于 Radix UI)
- **状态管理**: React Hooks + SWR
- **运行端口**: 5000

### 后端 (Python FastAPI)
- **框架**: FastAPI
- **ORM**: SQLAlchemy (异步)
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **AI模型**: 豆包大模型 (通过 coze-coding-dev-sdk)
- **认证**: JWT
- **运行端口**: 8000

### 架构模式
- **前后端分离**: Next.js 做前端页面渲染，Python FastAPI 做业务API和AI大脑
- **API代理**: Next.js rewrites 将业务API请求代理到Python后端
- **认证流程**: 前端登录获取JWT token，后续请求携带token到后端

### AI能力
- **模型提供商**: 豆包大模型 (通过 coze-coding-dev-sdk)
- **模型分配策略**:
  - 选品/Listing/视频 → Lite/Agent模型
  - 广告/数据复盘 → Pro模型
  - 客服/翻译 → Mini模型
  - 图片 → Vision模型

### 数据存储层
- **全局存储**: `src/lib/store.ts`
  - 使用 Node.js global 对象存储运行时数据
  - 数据在服务重启后重置为初始状态
  - 包含完整的类型定义和初始化数据
  - 提供数据关联索引 (product_id → orders/inventory/ads)

## 目录结构

```
/workspace/projects/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (前端代理层)
│   │   │   ├── models/        # 模型管理API
│   │   │   ├── prompts/       # Prompt管理API
│   │   │   └── ai/            # AI功能API
│   │   ├── agents/            # 智能体页面
│   │   ├── prompts/           # Prompt中心
│   │   ├── workflows/         # 工作流编排
│   │   ├── dashboard/         # 控制台
│   │   └── ...                # 其他业务页面
│   ├── components/            # React组件
│   │   ├── ui/               # shadcn/ui组件
│   │   └── layout/           # 布局组件
│   └── lib/                   # 工具库
│       └── api/              # API客户端
├── backend/                   # Python后端 (可选)
├── public/                    # 静态资源
├── .coze                      # Coze CLI配置
└── package.json
```

## API路由说明

### 前端API路由 (无后端依赖)
以下API直接在前端实现，不依赖Python后端：

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/models` | GET/POST | 模型列表/创建 |
| `/api/models/[id]` | GET/PUT/DELETE | 模型详情/更新/删除 |
| `/api/models/[id]/test` | POST | 测试模型连接 |
| `/api/prompts` | GET/POST | Prompt列表/创建 |
| `/api/prompts/[id]` | GET/PUT/DELETE | Prompt详情/更新/删除 |
| `/api/ai/select-products` | POST | 选品分析 |
| `/api/ai/calculate-price` | POST | 定价计算 |
| `/api/ai/optimize-listing` | POST | Listing优化 |
| `/api/ai/process-image` | POST | 图片处理 |
| `/api/ai/model/invoke` | POST | 通用模型调用 |

### AI智能体API路由
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/ai/analyze-competition` | POST | 竞品分析 |
| `/api/ai/suggest-keywords` | POST | 关键词建议 |
| `/api/ai/create-ad` | POST | 创建广告计划 |
| `/api/ai/optimize-ad/[id]` | POST | 优化广告计划 |
| `/api/ai/customer-reply` | POST | 客服回复生成 |
| `/api/ai/handle-dispute` | POST | 纠纷处理 |
| `/api/ai/data-report` | POST | 数据报告生成 |
| `/api/ai/action-items` | POST | 行动项生成 |
| `/api/ai/generate-video` | POST | 视频生成 |
| `/api/ai/agents` | GET | 智能体列表 |

### ERP系统API路由
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/v1/erp/products` | GET/POST | 商品列表/创建 |
| `/api/v1/erp/products/[id]` | GET/PUT/DELETE | 商品详情/更新/删除 |
| `/api/v1/erp/products/[id]/process` | POST | 触发商品处理流程 |
| `/api/v1/erp/products/[id]/publish` | POST | 上架发布商品 |
| `/api/v1/erp/orders` | GET/POST | 订单列表/创建 |
| `/api/v1/erp/inventory` | GET/POST/PUT | 库存列表/创建/更新 |
| `/api/v1/erp/purchases` | GET/POST | 采购单列表/创建 |
| `/api/v1/erp/suppliers` | GET/POST | 供应商列表/创建 |
| `/api/v1/erp/logistics` | GET/POST | 物流追踪 |
| `/api/v1/erp/finance/summary` | GET | 财务汇总 |
| `/api/v1/erp/finance/records` | GET/POST | 财务记录 |
| `/api/v1/erp/ad-campaigns` | GET/POST | 广告投放列表/创建 |

### 工作流引擎API
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/v1/workflow/execute` | GET/POST | 工作流模板列表/执行工作流 |
| `/api/v1/workflow/status/[id]` | GET | 查询工作流执行状态 |
| `/api/v1/workflow/list` | GET | 工作流执行列表 |

### Dashboard API
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/dashboard/stats` | GET | 控制台统计数据 |

### API配置
所有API端点配置在 `src/lib/api/config.ts`，使用相对路径 `/api/xxx`。

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (端口5000)
coze dev

# 构建生产版本
coze build

# 启动生产环境
coze start

# 类型检查
npx tsc --noEmit
```

## 编码规范

### 前端 (Airbnb风格)
- 使用函数式组件和Hooks
- 组件命名: PascalCase
- 文件命名: kebab-case
- 优先使用命名导出
- 使用Tailwind CSS类名，避免内联样式

### 代码风格
- 使用TypeScript严格模式
- 组件放在 `src/components/` 目录
- 页面放在 `src/app/` 目录
- API函数放在 `src/lib/api/` 目录
- 使用 `sonner` 进行Toast提示

### 表单处理
- 使用受控组件模式
- 表单验证在提交时执行
- 错误提示使用 `toast.error()`

## 常见问题与修复

### 1. API调用404错误
**原因**: API路径配置错误或前端路由未创建  
**解决**: 检查 `src/lib/api/config.ts` 中的端点配置，确保与 `src/app/api/` 目录结构匹配

### 2. 按钮点击无响应
**原因**: 未绑定 `onClick` 事件处理函数  
**解决**: 为按钮添加 `onClick` 属性并实现处理逻辑

### 3. 数据不显示
**原因**: 后端不可用或数据格式不匹配  
**解决**: 在API路由中提供默认数据兜底

### 4. 模型/Prompt保存失败
**原因**: API路由未正确实现POST/PUT方法  
**解决**: 检查对应的 `route.ts` 文件是否实现了正确的HTTP方法

## 关键文件索引

### 核心页面
- 控制台: `src/app/dashboard/page.tsx`
- AI智能体中心: `src/app/ai-agents/page.tsx`
- Prompt中心: `src/app/prompts/page.tsx`
- 工作流编排: `src/app/workflows/page.tsx`
- 选品分析: `src/app/agents/product-selection/page.tsx`

### API客户端
- 配置: `src/lib/api/config.ts`
- 客户端: `src/lib/api/client.ts`
- Prompt API: `src/lib/api/prompts.ts`
- 模型 API: `src/lib/api/models.ts`
- AI智能体 API: `src/lib/api/ai-agents.ts`

### 布局组件
- 主布局: `src/components/layout/MainLayout.tsx`
- 侧边栏: `src/components/layout/Sidebar.tsx`

## 测试策略

使用轻量级自检:
1. 构建检查: `npx tsc --noEmit`
2. 接口测试: `curl -s http://localhost:5000/api/xxx`
3. 页面访问: 浏览器检查UI渲染和交互

## 注意事项

1. **端口限制**: 服务必须运行在5000端口
2. **包管理器**: 仅使用 `pnpm`，禁止使用npm或yarn
3. **API路径**: 使用前端API路由 `/api/xxx`，而非 `/api/v1/xxx`
4. **热更新**: 代码修改后自动热更新，无需重启服务
5. **全局状态**: 使用 `global` 对象存储模拟数据，确保跨请求一致性
