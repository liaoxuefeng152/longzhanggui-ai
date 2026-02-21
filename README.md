# 阿峰｜跨境AI中台

专为TK东南亚跨境场景设计的AI能力中台，提供智能体、模型调用、Prompt管理等核心能力。

## 🎯 产品定位

跨境AI能力中台 = 阿峰的"AI发电厂"，底层对接大模型，中层封装智能体和Prompt，上层为所有前端产品提供标准化AI能力接口。

## ✨ 核心功能

### 1. 模型路由层
- 支持接入豆包API、OpenAI API
- 自动路由，根据场景选择最优模型
- 统一密钥管理
- 调用日志记录
- Token控制

### 2. Prompt中心
- Prompt分类管理（客服、营销文案、小语种翻译等）
- 版本管理和回滚
- AB测试
- 变量管理
- 搜索功能

### 3. 智能体工厂
- **客服智能体**：多语种自动客服，支持印尼语、马来语、泰语、越南语、英语
- **自推广智能体**：自动生成推广素材、追踪裂变关系、发放裂变奖励

### 4. 用户/权限/计费中心
- 用户管理（注册、登录、试用）
- 角色管理（普通用户、管理员）
- 订单套餐管理（试用版、基础版、专业版、企业版）
- 系统设置

## 🚀 技术栈

- **框架**：Next.js 16 (App Router)
- **语言**：TypeScript 5
- **UI组件**：shadcn/ui
- **样式**：Tailwind CSS 4
- **LLM集成**：coze-coding-dev-sdk (支持流式输出)
- **图表**：Recharts
- **容器化**：Docker + Docker Compose

## 📦 安装与运行

### 本地开发

```bash
# 安装依赖（必须使用 pnpm）
pnpm install

# 启动开发服务器
pnpm dev

# 访问 http://localhost:5000
```

### Docker 部署（推荐生产环境）

#### 快速启动

```bash
# 构建镜像
docker build -t afeng-ai-platform:latest .

# 运行容器
docker run -d \
  --name afeng-ai-platform \
  --restart unless-stopped \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  afeng-ai-platform:latest
```

#### 使用 Docker Compose（包含 Nginx）

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 使用部署脚本

```bash
# 给脚本添加执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 阿里云部署

详细的阿里云部署指南请参考：[docs/aliyun-deployment.md](docs/aliyun-deployment.md)

支持以下部署方式：
- ✅ Docker 直接部署（ECS）
- ✅ Docker Compose 部署（含 Nginx）
- ✅ ACK 容器服务部署
- ✅ ECI 弹性容器实例部署

## 🌐 访问地址

- **本地开发**：http://localhost:5000
- **Docker 部署**：http://your-server-ip:5000
- **生产环境**：https://your-domain.com

## 👤 默认账号

- **手机号**：任意
- **验证码**：123456
- **角色选择**：普通用户（卖家）/ 管理员（阿峰）

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── ai/           # AI相关API
│   │   ├── auth/         # 认证API
│   │   ├── models/       # 模型管理API
│   │   ├── prompts/      # Prompt管理API
│   │   └── dashboard/    # 统计数据API
│   ├── agents/           # 智能体页面
│   ├── dashboard/        # 控制台
│   ├── login/            # 登录页
│   ├── models/           # 模型路由
│   ├── orders/           # 订单套餐
│   ├── prompts/          # Prompt中心
│   ├── settings/         # 系统设置
│   ├── users/            # 用户管理
│   └── layout.tsx        # 根布局
├── components/           # 组件
│   ├── layout/          # 布局组件
│   └── ui/              # shadcn/ui组件
├── lib/                 # 工具函数
└── types/               # TypeScript类型定义

docs/
└── aliyun-deployment.md # 阿里云部署指南
```

## 🔑 核心API

### 模型调用（流式输出）
```
POST /api/ai/model/invoke
```

### 用户登录
```
POST /api/auth/login
```

### 获取模型状态
```
GET /api/models/status
```

### 获取Prompt模板
```
GET /api/prompts?category=客服
```

### 获取统计数据
```
GET /api/dashboard/stats
```

## 🎨 设计规范

- **主色**：#1677FF (科技蓝)
- **背景色**：#F5F7FA
- **卡片背景**：#FFFFFF
- **边框色**：#E8E8E8
- **成功色**：#52C41A
- **警告色**：#FAAD14
- **错误色**：#F5222D

## 📝 页面说明

### 1. 登录/注册页
- 左右分栏布局
- 手机号 + 验证码登录
- 角色选择（普通用户/管理员）
- 新用户注册获得3天免费试用

### 2. 控制台Dashboard
- 核心数据卡片
- 7日调用趋势图
- 最新用户列表

### 3. 模型路由
- 模型管理
- 调用日志查询

### 4. Prompt中心
- Prompt模板管理
- 分类筛选
- 版本控制

### 5. 智能体工厂
- 客服智能体（多语种对话测试）
- 自推广智能体（素材生成）
- 智能体列表和统计

### 6. 用户管理
- 用户列表
- 用户状态管理
- 统计数据

### 7. 订单套餐
- 套餐展示
- 订单记录
- 订单导出

### 8. 系统设置
- 通用设置
- 通知设置
- 安全设置
- 集成设置

## 🔐 安全特性

- API密钥加密存储
- 请求头追踪
- 两步验证支持
- 登录日志记录

## 📊 性能优化

- 流式输出（SSE协议）
- 模型自动路由
- 缓存机制
- Token控制

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 📞 技术支持

如有问题，请参考：
- [阿里云部署指南](docs/aliyun-deployment.md)
- [Docker 文档](https://docs.docker.com/)
- [Next.js 文档](https://nextjs.org/docs)

---

**阿峰｜跨境AI中台 v1.0** 🚀
