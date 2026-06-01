# 龙掌柜智能运营系统 - 项目目录结构说明

> 本文档详细说明项目每个文件夹和文件的作用，帮助开发者快速理解项目全貌。

---

## 根目录

| 文件/文件夹 | 说明 |
|------------|------|
| `.coze` | Coze CLI 配置文件（TOML格式），定义构建和运行命令，是项目部署的唯一依据，**禁止修改** |
| `.dockerignore` | Docker 构建时忽略的文件列表 |
| `.env.example` | 环境变量示例文件，新开发者参考此文件配置 `.env.local` |
| `.env.local` | 本地开发环境变量（含API密钥等敏感信息，已在 .gitignore 中） |
| `.gitignore` | Git 忽略规则 |
| `.npmrc` | npm/pnpm 配置（registry 镜像等） |
| `AGENTS.md` | 项目规范文档，给 AI Agent 看的项目全貌说明 |
| `API_DOCUMENTATION.md` | API 接口文档 |
| `API_TEST_CASES.md` | API 测试用例文档 |
| `API_TEST_REPORT.md` | API 测试报告 |
| `DESIGN.md` | 设计规范文件，沉淀视觉、品牌、布局、交互偏好 |
| `DOCKER_SETUP.md` | Docker 部署说明 |
| `Dockerfile` | 前端 Docker 镜像构建文件 |
| `FEISHU_DEBUG.md` | 飞书机器人调试文档 |
| `FEISHU_SETUP.md` | 飞书机器人配置文档 |
| `FUNCTIONAL_TEST_CASES.md` | 功能测试用例 |
| `README.md` | 项目说明文档 |
| `components.json` | shadcn/ui 组件配置文件 |
| `deploy.sh` | 部署脚本 |
| `docker-compose.yml` | Docker Compose 开发环境编排 |
| `docker-compose.prod.yml` | Docker Compose 生产环境编排 |
| `eslint.config.mjs` | ESLint 代码检查配置 |
| `next-env.d.ts` | Next.js TypeScript 类型声明（自动生成） |
| `next.config.ts` | Next.js 核心配置（standalone 输出、API 代理、外部包声明等） |
| `nginx.conf` | Nginx 反向代理配置 |
| `package.json` | 项目依赖和脚本定义 |
| `pnpm-lock.yaml` | pnpm 依赖锁定文件 |
| `postcss.config.mjs` | PostCSS 配置（Tailwind CSS 需要） |
| `tsconfig.json` | TypeScript 编译配置 |
| `pack_project.tar.gz` | 项目打包文件 |
| `test_api.sh` | API 测试脚本 |

---

## `assets/` — 素材资源目录

存放开发过程中使用的参考素材（图片、文档、抓包数据等），**不参与前端构建**。

| 文件 | 说明 |
|------|------|
| `阿峰跨境AI中台 v1.0 完整版原型设计文档（页面定位+视觉+交互全细则）.docx` | 产品原型设计文档（Word版） |
| `阿峰跨境AI中台 v1.0 完整版原型设计文档（页面定位+视觉+交互全细则）.md` | 产品原型设计文档（Markdown版） |
| `erp.91miaoshou.com.har` | 妙手ERP抓包数据 |
| `抓包数据.md` | 抓包数据说明 |
| `miaoshou-capture-*.json` | 妙手API抓包JSON数据 |
| `image*.png` | 开发过程中的参考截图 |
| `1e17fb6a-*.png` 等 UUID 命名的图片 | 对话中上传的截图素材 |

---

## `backend/` — Python 后端（FastAPI）

独立的后端服务，端口 8000，提供业务 API 和 AI 能力。

### `backend/` 根文件

| 文件 | 说明 |
|------|------|
| `main.py` (app/) | FastAPI 应用入口，路由注册、中间件挂载、生命周期管理 |
| `.env` | 后端环境变量 |
| `.env.example` | 后端环境变量示例 |
| `.gitignore` | 后端 Git 忽略规则 |
| `Dockerfile` | 后端 Docker 镜像构建文件 |
| `README.md` | 后端说明文档 |
| `alembic.ini` | Alembic 数据库迁移配置 |
| `requirements.txt` | Python 依赖列表 |
| `data.db` | SQLite 数据库文件（开发环境） |

### `backend/app/` — 应用核心代码

| 文件夹/文件 | 说明 |
|------------|------|
| `__init__.py` | Python 包初始化 |
| `main.py` | **FastAPI 应用入口**，注册路由、中间件、生命周期事件 |
| `constants.py` | 全局常量定义 |

#### `backend/app/api/` — API 路由层

| 文件 | 说明 |
|------|------|
| `agents.py` | AI 智能体管理接口 |
| `ai.py` | AI 通用接口（选品、定价、Listing优化等） |
| `ai_agents.py` | AI 智能体调用接口（图片处理、批量处理等） |
| `ai_agents_ex.py` | AI 智能体扩展接口 |
| `auth.py` | 认证接口（登录、注册、Token 刷新） |
| `collection.py` | 商品采集接口 |
| `dashboard.py` | 控制台统计数据接口 |
| `erp.py` | ERP 系统 CRUD 接口（商品、库存、采购、物流、财务） |
| `feishu.py` | 飞书机器人接口（配置、推送、Webhook） |
| `feishu_users.py` | 飞书用户管理接口 |
| `miaoshou.py` | 妙手ERP集成接口 |
| `models.py` | AI 模型管理接口 |
| `orders.py` | 订单管理接口 |
| `packages.py` | 套餐管理接口 |
| `platform_bindings.py` | 平台绑定接口 |
| `platforms.py` | 平台配置接口 |
| `products.py` | 商品管理接口 |
| `prompts.py` | Prompt 模板管理接口 |
| `reports.py` | 数据报表接口 |
| `settings.py` | 系统设置接口 |
| `sms.py` | 短信服务接口 |
| `task_logs.py` | 任务日志接口 |
| `tickets.py` | 客服工单接口 |
| `tiktok.py` | TikTok 平台接口 |
| `workflow.py` | 工作流引擎接口 |
| `workflow_products.py` | 工作流商品关联接口 |

#### `backend/app/agents/` — AI 智能体实现

| 文件 | 说明 |
|------|------|
| `base.py` | 智能体基类，定义通用接口和工具调用逻辑 |
| `product_selection.py` | 选品智能体 |
| `image_design.py` | 图片设计智能体 |
| `video_generation.py` | 视频生成智能体 |
| `listing_optimization.py` | Listing优化智能体 |
| `advertising.py` | 广告投放智能体 |
| `customer_service.py` | 客服智能体 |
| `data_review.py` | 数据复盘智能体 |

#### `backend/app/core/` — 核心配置

| 文件 | 说明 |
|------|------|
| `config.py` | 应用配置（数据库URL、密钥、CORS等） |
| `database.py` | 数据库连接和会话管理（SQLAlchemy 异步） |
| `logging.py` | 日志配置 |
| `security.py` | 安全相关（JWT生成/验证、密码哈希） |

#### `backend/app/models/` — 数据库模型（ORM）

| 文件 | 说明 |
|------|------|
| `user.py` | 用户模型 |
| `business.py` | 业务模型（店铺、套餐、工单等） |
| `erp.py` | ERP 模型（商品、订单、库存、采购、物流、财务） |
| `agent.py` | AI 智能体模型（模型配置、Prompt、执行记录） |

#### `backend/app/schemas/` — 请求/响应数据模型（Pydantic）

| 文件 | 说明 |
|------|------|
| `user.py` | 用户相关 Schema |
| `business.py` | 业务相关 Schema |
| `erp.py` | ERP 相关 Schema |
| `agent.py` | 智能体相关 Schema |

#### `backend/app/services/` — 业务逻辑层

| 文件 | 说明 |
|------|------|
| `agent_service.py` | 智能体调度和管理 |
| `ai_agents_service.py` | AI 智能体调用服务 |
| `alibaba_1688_service.py` | 1688 API 对接服务 |
| `cache_service.py` | 缓存服务 |
| `collection_1688_service.py` | 1688 商品采集服务 |
| `feishu_service.py` | 飞书消息推送和事件处理 |
| `image_agent_service.py` | 图片处理 AI 服务 |
| `init_service.py` | 系统初始化服务 |
| `kuajing_agent_service.py` | 跨境 AI Agent 服务 |
| `llm_service.py` | 大语言模型调用服务（豆包等） |
| `logistics_service.py` | 物流追踪服务 |
| `miaoshou_collection_service.py` | 妙手采集服务 |
| `platform_service.py` | 平台管理服务 |
| `scheduler_service.py` | 定时任务调度服务（日报推送等） |
| `task_service.py` | 异步任务管理服务 |
| `tiktok_shop_service.py` | TikTok Shop API 服务 |
| `user_service.py` | 用户管理服务 |
| `video_agent_service.py` | 视频生成 AI 服务 |
| `workflow_executors.py` | 工作流执行器 |
| `workflow_orchestrator.py` | 工作流编排引擎 |

#### `backend/app/integrations/` — 第三方集成

| 文件夹 | 说明 |
|--------|------|
| `miaoshou/` | 妙手ERP集成 |
| ↳ `api_client.py` | 妙手 API 客户端 |
| ↳ `cdp_signer.py` | CDP 签名工具 |
| ↳ `client.py` | 妙手 HTTP 客户端 |
| ↳ `page_scraper.py` | 页面数据抓取 |
| ↳ `signature_fetcher.py` | 签名获取器 |

#### `backend/app/middleware/` — 中间件

| 文件 | 说明 |
|------|------|
| `auth_middleware.py` | JWT 认证中间件 |
| `logging_middleware.py` | 请求日志中间件 |
| `rate_limit_middleware.py` | 接口限流中间件 |

#### `backend/app/exceptions/` — 异常处理

| 文件 | 说明 |
|------|------|
| `handlers.py` | 全局异常处理器 |
| `http_exceptions.py` | 自定义 HTTP 异常类 |

#### `backend/app/tools/` — AI 工具

| 文件 | 说明 |
|------|------|
| `product_scrape_tool.py` | 商品采集工具（供 AI Agent 调用） |

#### `backend/app/utils/` — 工具函数

| 文件 | 说明 |
|------|------|
| `helpers.py` | 通用辅助函数 |
| `validators.py` | 数据校验函数 |

#### `backend/app/dependencies.py` — FastAPI 依赖注入

定义数据库会话、当前用户等公共依赖。

### `backend/alembic/` — 数据库迁移

| 文件 | 说明 |
|------|------|
| `env.py` | Alembic 环境配置 |
| `script.py.mako` | 迁移脚本模板 |
| `versions/001_initial.py` | 初始数据库结构迁移 |
| `versions/002_enhance_erp_products.py` | ERP 商品表增强迁移 |

### `backend/data/` — 数据存储

| 文件 | 说明 |
|------|------|
| `lobster_ai.db` | SQLite 数据库文件 |

### `backend/logs/` — 后端日志

### `backend/scripts/` — 后端脚本

| 文件 | 说明 |
|------|------|
| `dev.sh` | 开发环境启动脚本 |
| `start.sh` | 生产环境启动脚本 |
| `init_db.sh` | 数据库初始化脚本 |
| `migrate.sh` | 数据库迁移脚本 |
| `test.sh` | 测试脚本 |

### `backend/tests/` — 后端测试

| 文件 | 说明 |
|------|------|
| `conftest.py` | pytest 配置和 fixtures |
| `test_agents.py` | 智能体测试 |
| `test_auth.py` | 认证测试 |
| `test_business.py` | 业务逻辑测试 |

---

## `data/` — 前端数据存储

| 文件 | 说明 |
|------|------|
| `lobster.db` / `-shm` / `-wal` | SQLite 数据库文件（better-sqlite3 使用） |
| `platform_configs.json` | 平台配置缓存 |

---

## `docs/` — 文档

| 文件 | 说明 |
|------|------|
| `PRD.md` | 产品需求文档 |

---

## `public/` — 静态资源（Next.js 直接访问）

| 文件 | 说明 |
|------|------|
| `company-website-index.html` | 公司官网首页（拉克力跨境，用于替换 GitHub Pages） |
| `company-website-courses.html` | 公司官网产品/服务页（用于替换 GitHub Pages） |
| `longzg-dashboard.png` | 龙掌柜运营工作台截图（官网用） |
| `longzg-landing.png` | 龙掌柜落地页截图（官网用） |
| `test-chinese-text.png` | 中文文字测试图片 |
| `favicon.ico` | 网站图标 |
| `file.svg` / `globe.svg` / `next.svg` / `vercel.svg` / `window.svg` | Next.js 默认 SVG 图标 |

---

## `scripts/` — 前端构建和部署脚本

| 文件 | 说明 |
|------|------|
| `build.sh` | **生产构建脚本**：pnpm install → next build → 复制静态资源到 standalone 目录 |
| `start.sh` | **生产启动脚本**：并行启动前端（standalone server）和后端（uvicorn） |
| `start_server.js` | **Node.js 启动器**：调用 start.sh，处理端口检测和信号转发 |
| `start_server.py` | **Python 启动器**（备用） |
| `dev.sh` | 开发环境启动脚本 |
| `dev-all.sh` | 同时启动前后端开发服务 |
| `prepare.sh` | 环境准备脚本 |
| `start-backend.sh` | 单独启动后端服务 |

---

## `src/` — 前端源码（Next.js App Router）

### `src/app/` — 页面和 API 路由

Next.js App Router 目录结构，每个 `page.tsx` 是一个页面，每个 `route.ts` 是一个 API 端点。

#### 页面文件

| 路径 | 说明 |
|------|------|
| `page.tsx` | **首页**（落地页，自动重定向到 /landing 或 /dashboard） |
| `layout.tsx` | **根布局**（HTML结构、字体、全局Provider） |
| `globals.css` | **全局样式**（CSS 变量、Tailwind 主题、颜色体系） |
| `robots.ts` | 搜索引擎爬虫规则 |
| `favicon.ico` | 网站图标 |
| `landing/page.tsx` | **落地页**（产品介绍、AI助手体验入口） |
| `login/page.tsx` | **登录页** |
| `dashboard/page.tsx` | **控制台**（管理端首页，数据概览） |
| `workflows/page.tsx` | **运营工作台**（新品上架、批量操作入口） |
| `workflows/pricing-templates/page.tsx` | 定价模板列表 |
| `workflows/pricing-templates/[id]/page.tsx` | 定价模板详情/编辑 |
| `agents/page.tsx` | **AI智能体总览**（7大智能体入口卡片） |
| `agents/config/page.tsx` | **智能体配置总览**（管理端，7大智能体参数配置） |
| `agents/product-selection/page.tsx` | **选品智能体**（6大模块：需求分析→爆款挖掘→可行性→竞品→报告→供应商） |
| `agents/product-selection/config/page.tsx` | 选品智能体配置 |
| `agents/image-design/page.tsx` | **图片设计智能体**（图片翻译、主图优化、白底图） |
| `agents/image-design/config/page.tsx` | 图片设计配置 |
| `agents/video-generation/page.tsx` | **视频生成智能体** |
| `agents/video-generation/config/page.tsx` | 视频生成配置 |
| `agents/listing-optimization/page.tsx` | **Listing优化智能体**（标题、五点描述、多语言） |
| `agents/listing-optimization/config/page.tsx` | Listing优化配置 |
| `agents/advertising/page.tsx` | **广告投放智能体** |
| `agents/advertising/config/page.tsx` | 广告投放配置 |
| `agents/customer-service/page.tsx` | **客服智能体** |
| `agents/customer-service/config/page.tsx` | 客服配置 |
| `agents/data-review/page.tsx` | **数据复盘智能体** |
| `agents/data-review/config/page.tsx` | 数据复盘配置 |
| `erp/page.tsx` | **ERP系统入口** |
| `erp/products/page.tsx` | **商品列表** |
| `erp/products/[id]/page.tsx` | **商品详情编辑**（6 Tab：基本信息/类目属性/销售属性/产品图片/产品视频/物流信息） |
| `erp/collection/page.tsx` | **采集中心**（1688商品采集、公用采集箱、认领到店铺） |
| `erp/inventory/page.tsx` | **库存管理** |
| `erp/purchase/page.tsx` | **采购管理** |
| `erp/orders/page.tsx` | **订单管理** |
| `erp/logistics/page.tsx` | **物流管理** |
| `erp/finance/page.tsx` | **财务管理** |
| `shops/page.tsx` | **店铺管理**（用户授权模式） |
| `shops/platforms/page.tsx` | **平台凭证管理**（管理员统一配置API密钥） |
| `platform/page.tsx` | **平台配置主页** |
| `platform/datasources/page.tsx` | **数据源配置**（选品策略等） |
| `platform/miaoshou/page.tsx` | **妙手ERP集成配置** |
| `feishu/page.tsx` | **飞书机器人管理**（4 Tab：基础配置/推送规则/指令模板/意图测试） |
| `feishu/import/page.tsx` | **数据导入管理** |
| `models/page.tsx` | **模型配置**（AI模型列表管理） |
| `task-logs/page.tsx` | **任务日志**（智能体执行日志） |
| `customer-tickets/page.tsx` | **客服工单** |
| `reports/page.tsx` | **数据报表** |
| `packages/page.tsx` | **订购套餐** |
| `packages/payment/page.tsx` | **套餐支付页** |
| `users/page.tsx` | **用户管理** |
| `roles/page.tsx` | **角色管理** |
| `settings/page.tsx` | **系统设置** |

#### API 路由（`src/app/api/`）

| 路径 | 方法 | 说明 |
|------|------|------|
| `auth/login/route.ts` | POST | 用户登录（前端直连） |
| `dashboard/route.ts` | GET | 控制台统计数据 |
| `feishu/config/route.ts` | GET/PUT | 飞书配置管理 |
| `ai/generate-image/route.ts` | POST | AI 图片生成 |
| `ai/process-image/route.ts` | POST | 图片处理（翻译、白底等） |
| `v1/auth/login/route.ts` | POST | V1 版本登录接口 |
| `v1/health/route.ts` | GET | 健康检查 |
| `v1/ai/chat/route.ts` | POST | AI 聊天（非流式） |
| `v1/ai/chat-stream/route.ts` | POST | AI 聊天（SSE 流式输出） |
| `v1/erp/products/route.ts` | GET/POST | 商品列表/创建 |
| `v1/erp/products/[id]/route.ts` | GET/PUT/DELETE | 商品详情/更新/删除 |
| `v1/erp/purchases/route.ts` | GET/POST | 采购单列表/创建 |
| `v1/erp/purchases/[id]/route.ts` | GET/PUT | 采购单详情/更新 |
| `v1/1688/collect/route.ts` | POST | 1688 商品采集 |
| `v1/platforms/route.ts` | GET/POST | 平台配置列表/创建 |
| `v1/platforms/[platform_id]/test/route.ts` | POST | 测试平台连接 |
| `v1/miaoshou/config/route.ts` | GET/PUT | 妙手配置 |
| `v1/miaoshou/product/route.ts` | GET | 妙手商品数据 |
| `v1/miaoshou/test/route.ts` | POST | 妙手连接测试 |
| `v1/pricing/templates/route.ts` | GET/POST | 定价模板管理 |
| `v1/feishu/webhook/route.ts` | POST | 飞书 Webhook 接收 |
| `v1/tools/selection/route.ts` | POST | 选品分析工具（流式） |
| `v1/tools/listing/route.ts` | POST | Listing 生成（流式） |
| `v1/tools/pricing/route.ts` | POST | 智能定价计算 |
| `v1/tools/customer-service/route.ts` | POST | 客服回复生成（流式） |
| `v1/tools/data-review/route.ts` | POST | 数据复盘分析 |
| `v1/tools/image/route.ts` | POST | 图片处理工具 |
| `v1/tools/video/route.ts` | POST | 视频生成工具 |
| `v1/tools/scrape/route.ts` | POST/PUT | 商品采集（单个/批量） |
| `webhook/event/route.ts` | POST | 通用 Webhook 事件接收 |

---

### `src/components/` — React 组件

| 文件夹/文件 | 说明 |
|------------|------|
| **`landing-page.tsx`** | 落地页主组件（Hero + 7大智能体 + ERP + AI助手 + 体验入口） |
| **`landing-chat-widget.tsx`** | 落地页AI助手浮窗组件（真实对话 + 流式输出 + 意图识别） |
| **`ai-assistant/index.tsx`** | 工作台右下角AI综合助手（对话 + 意图识别 + 快捷操作跳转） |
| **`auth/ProtectedRoute.tsx`** | 路由守卫组件（未登录重定向到 /login） |
| **`providers.tsx`** | 全局 Provider 组合（Theme + Auth + Toast） |
| **`smart-cards/index.tsx`** | 智能分析卡片组件（运营日报、异常预警、决策建议、选品建议等） |

#### `components/layout/` — 布局组件

| 文件 | 说明 |
|------|------|
| `MainLayout.tsx` | 主布局框架（侧边栏 + 顶部栏 + 内容区） |
| `Sidebar.tsx` | 侧边栏导航（深蓝色，根据角色动态显示菜单，视图切换） |
| `Header.tsx` | 顶部栏（面包屑、管理员信息、消息通知、退出登录） |

#### `components/ui/` — shadcn/ui 基础组件

基于 Radix UI 的 UI 组件库，每个文件是独立组件：

| 文件 | 说明 |
|------|------|
| `alert.tsx` | 警告提示框 |
| `avatar.tsx` | 头像 |
| `badge.tsx` | 徽章/标签 |
| `breadcrumb.tsx` | 面包屑导航 |
| `button.tsx` | 按钮（多种变体） |
| `card.tsx` | 卡片容器 |
| `checkbox.tsx` | 复选框 |
| `command.tsx` | 命令面板 |
| `context-menu.tsx` | 右键菜单 |
| `dialog.tsx` | 对话框/弹窗 |
| `dropdown-menu.tsx` | 下拉菜单 |
| `empty.tsx` | 空状态占位 |
| `field.tsx` | 表单字段 |
| `form.tsx` | 表单容器 |
| `input.tsx` | 输入框 |
| `item.tsx` | 列表项 |
| `label.tsx` | 表单标签 |
| `popover.tsx` | 弹出层 |
| `progress.tsx` | 进度条 |
| `radio-group.tsx` | 单选按钮组 |
| `select.tsx` | 下拉选择器 |
| `separator.tsx` | 分隔线 |
| `sheet.tsx` | 侧边抽屉 |
| `slider.tsx` | 滑块 |
| `sonner.tsx` | Toast 通知 |
| `spinner.tsx` | 加载旋转动画 |
| `switch.tsx` | 开关 |
| `table.tsx` | 数据表格 |
| `tabs.tsx` | 标签页 |
| `textarea.tsx` | 多行文本框 |
| `toggle.tsx` | 切换按钮 |
| `tooltip.tsx` | 文字提示 |

---

### `src/contexts/` — React Context 状态管理

| 文件 | 说明 |
|------|------|
| `AuthContext.tsx` | 认证上下文（登录状态、用户信息、角色判断、自动重定向） |

---

### `src/hooks/` — 自定义 Hooks

| 文件 | 说明 |
|------|------|
| `use-mobile.ts` | 移动端检测 Hook |

---

### `src/lib/` — 工具库和 API 客户端

#### `src/lib/api/` — API 客户端封装

| 文件 | 说明 |
|------|------|
| `config.ts` | API 端点配置（所有接口路径统一定义） |
| `client.ts` | HTTP 客户端封装（fetch + 认证头 + 错误处理） |
| `index.ts` | API 模块统一导出 |
| `auth.ts` | 认证 API（登录、注册、Token 刷新） |
| `ai.ts` | AI 通用 API |
| `ai-agents.ts` | AI 智能体 API |
| `agents.ts` | 智能体管理 API |
| `collection.ts` | 商品采集 API |
| `dashboard.ts` | 控制台数据 API |
| `erp.ts` | ERP 系统 API |
| `models.ts` | 模型管理 API |
| `packages.ts` | 套餐管理 API |
| `prompts.ts` | Prompt 管理 API |
| `reports.ts` | 数据报表 API |
| `settings.ts` | 系统设置 API |
| `task-logs.ts` | 任务日志 API |
| `tickets.ts` | 客服工单 API |

#### `src/lib/db/` — 数据库工具

| 文件 | 说明 |
|------|------|
| `index.ts` | better-sqlite3 数据库连接（自动检测可写目录，回退到 /tmp） |
| `dal.ts` | 数据访问层（商品、订单、库存等 CRUD 操作） |

#### `src/lib/feishu/` — 飞书集成库

| 文件 | 说明 |
|------|------|
| `config.ts` | 飞书应用配置（AppID、AppSecret、Webhook） |
| `client.ts` | 飞书 API 客户端（消息发送、卡片构建） |
| `intent.ts` | 自然语言意图识别（选品/图片/Listing等9种意图） |
| `workflow.ts` | 飞书工作流处理（根据意图执行对应操作） |

#### `src/lib/hooks/` — 业务 Hooks

| 文件 | 说明 |
|------|------|
| `useAuthFetch.ts` | 带 Token 认证的 fetch Hook |

#### 其他 `src/lib/` 文件

| 文件 | 说明 |
|------|------|
| `store.ts` | 全局内存存储（Node.js global 对象），运行时数据，重启后重置 |
| `utils.ts` | 通用工具函数（cn 类名合并、格式化等） |
| `ali1688.ts` | 1688 采集 API 封装 |

---

### `src/types/` — TypeScript 类型定义

| 文件 | 说明 |
|------|------|
| `index.ts` | 全局类型定义（用户、商品、订单、智能体等业务类型） |

---

## 数据流转示意

```
用户浏览器
    │
    ├── 访问 /landing → 落地页（产品介绍 + AI助手体验）
    ├── 访问 /login → 登录页
    │
    ▼ (登录后)
Next.js 前端 (端口 5000)
    ├── /api/v1/* → 前端 API Routes（Node.js 运行时）
    │                    │
    │                    ├── 操作 better-sqlite3 (src/lib/db/)
    │                    ├── 调用 coze-coding-dev-sdk (AI能力)
    │                    └── 代理到 Python 后端 (端口 8000)
    │
    └── /api/v1/ai/chat-stream → SSE 流式 AI 对话

Python 后端 (端口 8000)
    ├── /api/v1/* → FastAPI 路由
    │                    │
    │                    ├── SQLAlchemy ORM → PostgreSQL/SQLite
    │                    ├── 7大 AI 智能体 → 豆包大模型
    │                    ├── 1688 API → 商品采集
    │                    ├── 飞书 API → 机器人推送
    │                    └── 妙手 API → ERP 数据同步
    │
    └── Alembic → 数据库迁移
```
