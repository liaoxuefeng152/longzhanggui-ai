# 龙掌柜智能运营系统 - 项目规范文档

## 项目概览

**项目名称**: 龙掌柜智能运营系统  
**项目类型**: 跨境电商AI智能体运营平台  
**核心功能**: 智能运营助理、7大AI智能体、自研轻量ERP

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
│   供应商筛选     1688采购       ────────       ────────        ────────              │
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
- **迁移说明**: 
  - 前端 API Routes 已删除，统一使用 Python 后端
  - API 调用通过 `next.config.ts` 的 rewrites 代理到 `http://localhost:8000`
  - 后端部署在端口 8000，前端在端口 5000

### 启动方式

```bash
# 1. 启动 Python 后端 (端口 8000)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. 启动 Next.js 前端 (端口 5000)
cd ..
coze dev
```

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
│   │   ├── feishu/            # 飞书相关页面
│   │   │   ├── settings/      # 飞书配置管理
│   │   │   ├── import/       # 数据导入管理
│   │   │   ├── logs/         # 推送日志
│   │   │   └── test/         # Webhook测试
│   │   └── ...                # 其他业务页面
│   ├── components/            # React组件
│   │   ├── ui/               # shadcn/ui组件
│   │   ├── layout/           # 布局组件
│   │   └── smart-cards/       # 智能分析卡片组件
│   └── lib/                   # 工具库
│       ├── api/               # API客户端
│       └── feishu/           # 飞书集成库
│           ├── config.ts     # 飞书配置
│           ├── client.ts     # 飞书API客户端
│           ├── intent.ts     # 意图识别
│           └── workflow.ts   # 工作流处理
├── backend/                   # Python后端 (可选)
├── public/                    # 静态资源
├── .coze                      # Coze CLI配置
└── package.json
```

## 智能运营助理功能

### 系统定位
- **定位**: 老板的"智能运营助理"，而非"无人值守"
- **AI角色**: AI辅助人工，最终决策权在老板手中
- **自动化范围**: 可自动的自动，必须人工的人工

### 核心功能

#### 1. 飞书机器人交互升级
- **自然语言指令接收**: 支持老板的日常问询
- **数据查询**: 运营日报、TOP商品、库存预警等
- **分析建议**: 选品建议、定价建议、竞品分析等
- **主动推送**: 定时日报、异常告警、任务状态

#### 2. 飞书配置管理
- **基础配置**: AppID、AppSecret、机器人名称、Webhook地址
- **推送规则**: 定时推送开关、异常告警开关、告警阈值
- **指令模板**: 支持的指令类型配置

#### 3. 数据导入功能
- **商品数据导入**: Excel/CSV批量导入
- **订单数据导入**: 历史订单批量导入
- **财务数据导入**: 第三方财务数据导入
- **导入历史**: 查看导入记录和状态

#### 4. 智能分析卡片
- **运营日报卡片**: 每日数据汇总
- **异常预警卡片**: 异常情况告警
- **决策建议卡片**: AI分析建议
- **数据对比卡片**: 今日vs昨日对比
- **选品建议卡片**: 选品结果展示

### 飞书指令类型

| 类型 | 示例指令 | 说明 |
|------|---------|------|
| 数据查询类 | "今天运营情况怎么样？" | 运营日报卡片 |
| 分析建议类 | "帮我分析一下这个新品要不要上？" | 选品建议卡片 |
| 文案生成类 | "帮我写一个催好评的消息" | 文本卡片 |
| 报表生成类 | "生成今日日报" | 运营日报卡片 |
| 任务执行类 | "帮我选3款宠物用品" | 选品结果卡片 |

### 主动推送规则

| 推送类型 | 触发方式 | 推送时机 |
|---------|---------|---------|
| 早间日报 | 定时 | 每天 09:00 |
| 周报 | 定时 | 每周一 09:00 |
| 库存不足 | 阈值触发 | 实时 |
| 物流异常 | 阈值触发 | 实时 |
| 差评预警 | 阈值触发 | 实时 |
| 广告ROI低 | 阈值触发 | 实时 |

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

### 图片处理API
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/v1/ai-agents/process-image` | POST | 图片翻译处理（豆包视觉模型） |
| `/api/v1/ai-agents/process-image/batch` | POST | 批量图片翻译处理 |

**图片处理功能说明**：
- **翻译模式**：使用豆包视觉模型识别图片中的文字并翻译到目标语言
- **支持语言**：中文(zh)、英文(en)、印尼语(id)、泰语(th)、越南语(vi)、马来语(ms)
- **认证要求**：需要Bearer Token认证
- **返回字段**：original_text（原文）、translated_text（译文）、text_positions（文字位置）

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

### 工作流编排功能
- **新品上架**: 选品→图片处理→Listing生成→智能定价→确认上架
- **批量处理**: 批量采集1688商品、批量图片处理（翻译/白底/AI优化）
- **批量定价**: 批量计算商品最优售价，支持利润率、竞品价格参考

### Dashboard API
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/dashboard/stats` | GET | 控制台统计数据 |

### 平台配置API
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/v1/platforms` | GET | 获取所有平台配置 |
| `/api/v1/platforms` | POST | 保存平台配置 |
| `/api/v1/platforms/[platform_id]/test` | POST | 测试平台连接 |
| `/api/v1/platforms/[platform_id]` | DELETE | 删除平台配置 |

### 飞书集成API路由
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/feishu/config` | GET/PUT | 飞书配置获取/更新 |
| `/api/feishu/push-rules` | GET/PUT | 推送规则获取/更新 |
| `/api/feishu/templates` | GET/PUT | 指令模板获取/更新 |
| `/api/feishu/webhook` | POST | 接收飞书Webhook事件 |
| `/api/feishu/test-send` | POST | 测试发送消息 |
| `/api/feishu/import-history` | GET | 导入历史查询 |
| `/api/feishu/import-file` | POST | 文件导入 |

### 智能助理API路由
| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/assistant/chat` | POST | 智能助理对话 |
| `/api/assistant/daily-report` | GET | 获取运营日报 |
| `/api/assistant/alerts` | GET | 获取异常告警列表 |
| `/api/assistant/recommendations` | GET | 获取决策建议 |

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

### 5. 图片生成API无法调用
**原因**: coze-coding-dev-sdk 在客户端被打包导致 Node.js 模块错误  
**解决**: 
- 在 `next.config.ts` 中配置 `serverExternalPackages` 包含 `coze-coding-dev-sdk`
- 使用动态导入 `import('coze-coding-dev-sdk')` 在 API routes 中
- 或通过 API 路由代理调用，不要在客户端直接使用 SDK

## 关键文件索引

### 核心页面
- 控制台: `src/app/dashboard/page.tsx`
- AI智能体中心: `src/app/ai-agents/page.tsx`
- Prompt中心: `src/app/prompts/page.tsx`
- 工作流编排: `src/app/workflows/page.tsx`
- 选品分析: `src/app/agents/product-selection/page.tsx` - **支持供应商筛选功能**
- 图片设计: `src/app/agents/image-design/page.tsx`
- **平台配置: `src/app/platform/datasources/page.tsx`** - 数据源配置和选品策略
- **店铺管理: `src/app/shops/page.tsx`** - 店铺授权管理
- **平台凭证: `src/app/shops/platforms/page.tsx`** - API密钥管理
- 飞书配置管理: `src/app/feishu/settings/page.tsx`
- 数据导入管理: `src/app/feishu/import/page.tsx`

### ERP系统页面
- **商品列表: `src/app/erp/products/page.tsx`** - 商品列表管理
- **商品详情: `src/app/erp/products/[id]/page.tsx`** - 商品详情编辑页（独立页面，6 Tab结构：基本信息/类目属性/销售属性/产品图片/产品视频/物流信息）
- **采集中心: `src/app/erp/collection/page.tsx`** - 1688商品采集、公用采集箱、认领到店铺

### 选品智能体 - 6大核心模块

#### 模块1: 需求分析
- **引导式提问**: 目标市场、类目偏好、预算范围、核心诉求
- **需求确认**: 显示当前配置的需求摘要

#### 模块2: 爆款挖掘
- **选品方向推荐**: 基于需求分析，推荐3-5个选品方向
- **候选池展示**: 展示热门商品列表，含销量、竞争度、增长趋势

#### 模块3: 可行性分析
- **利润测算**: 成本、物流、佣金、AD费、VAT等综合计算
- **合规校验**: 自动过滤禁售品类，检查平台认证要求
- **供应链匹配**: 评估货源稳定性和采购难度
- **风险提示**: 识别潜在风险点

#### 合规规则库
- **禁售品类**: 武器弹药、药品食品、医疗器械、仿真枪、濒危物种、赌博用品、色情用品、仿牌侵权等
- **平台认证要求**:
  - 美区: FDA注册、CPC证书、FCC认证
  - 欧区: UKCA认证、CE认证、英代信息
  - 印尼: BPOM注册、HALAL认证
  - 泰国: Thai FDA注册、TIS标准
  - 越南: 越南FDA注册、COA
  - 马来: MAL注册、HALAL认证
- **价格限制**: 各站点单品最高价格限额
- **合规检查函数**: `checkProductCompliance()` 自动校验商品合规性

#### 模块4: 竞品分析
- **头部竞品挖掘**: 分析平台上销量Top竞品
- **差异化建议**: 基于竞品分析给出差异化选品建议

#### 模块5: 报告生成
- **结构化报告**: 整合所有分析数据，生成Markdown报告
- **导出功能**: 支持导出本地文件

#### 模块6: 供应商筛选（新增）
- **1688供应商匹配**: 根据选品报告推荐商品，匹配合适的1688供应商
- **供应商信息展示**: 评分、响应速度、MOQ、价格区间、发货时间、认证信息
- **一键采购**: 支持加入采购清单、复制链接、打开1688商品页
- **筛选功能**: 支持按一件代发、MOQ、排序方式筛选

### 店铺管理（统一授权模式）
- 店铺管理: `src/app/shops/page.tsx` - 用户授权模式，简化添加店铺流程
- 平台配置: `src/app/shops/platforms/page.tsx` - 管理员统一配置各平台 API 凭证
- 平台配置API: `src/app/api/v1/platforms/route.ts` - 平台凭证管理
- 店铺授权API: `src/app/api/v1/shops/[id]/authorize/route.ts` - 店铺授权接口

**授权模式说明**：
- 管理员在「平台配置」页面统一配置各平台的 API Key/Secret
- 普通用户添加店铺时只需填写基本信息，无需填写敏感凭证
- 用户点击「去授权」按钮完成店铺绑定

### 飞书集成核心文件
- 飞书配置: `src/lib/feishu/config.ts`
- 飞书客户端: `src/lib/feishu/client.ts`
- 意图识别: `src/lib/feishu/intent.ts`
- 工作流处理: `src/lib/feishu/workflow.ts`
- Webhook处理: `src/app/api/feishu/webhook/route.ts`
- 飞书配置API: `src/app/api/feishu/config/route.ts`

### 智能助理相关
- 智能分析卡片组件: `src/components/smart-cards/index.tsx`
- 智能助理对话API: `src/app/api/assistant/chat/route.ts`
- 运营日报API: `src/app/api/assistant/daily-report/route.ts`
- 异常告警API: `src/app/api/assistant/alerts/route.ts`
- 决策建议API: `src/app/api/assistant/recommendations/route.ts`

### API客户端
- 配置: `src/lib/api/config.ts`
- 客户端: `src/lib/api/client.ts`
- Prompt API: `src/lib/api/prompts.ts`
- 模型 API: `src/lib/api/models.ts`
- AI智能体 API: `src/lib/api/ai-agents.ts`
- Dashboard API: `src/lib/api/dashboard.ts`

### 布局组件
- 主布局: `src/components/layout/MainLayout.tsx`
- 侧边栏: `src/components/layout/Sidebar.tsx`

## 测试策略

使用轻量级自检:
1. 构建检查: `npx tsc --noEmit`
2. 接口测试: `curl -s http://localhost:5000/api/xxx`
3. 页面访问: 浏览器检查UI渲染和交互
4. 飞书机器人测试: 测试自然语言交互
5. 数据导入测试: 测试Excel/CSV导入流程
6. 主动推送测试: 测试日报和异常告警推送

## 注意事项

1. **端口限制**: 服务必须运行在5000端口
2. **包管理器**: 仅使用 `pnpm`，禁止使用npm或yarn
3. **API路径**: 使用前端API路由 `/api/xxx`，而非 `/api/v1/xxx`
4. **热更新**: 代码修改后自动热更新，无需重启服务
5. **全局状态**: 使用 `global` 对象存储模拟数据，确保跨请求一致性
6. **飞书集成**: 使用飞书企业自建应用（AppID: cli_a954ed9674789cd3）
7. **智能助理定位**: AI辅助人工，最终决策权在老板手中
8. **高风险操作**: 涉及财务、库存等高风险操作需人工确认
9. **数据导入**: 支持Excel/CSV批量导入，注意文件大小限制（单文件≤10MB）
10. **主动推送**: 支持定时推送（日报、周报）和阈值触发推送（库存异常、物流异常）
