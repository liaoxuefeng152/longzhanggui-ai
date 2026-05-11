# 龙虾AI跨境无人店系统 - 后端服务

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

跨境电商AI智能体运营平台后端服务，基于 FastAPI + LangGraph 构建。

## 功能特性

### 核心功能
- 🔐 用户认证与权限管理
- 🤖 7大AI智能体服务
- 📊 数据分析与报表
- 💬 智能客服系统

### AI智能体
1. **选品智能体** - 市场分析与选品推荐
2. **图片设计智能体** - 商品图片生成
3. **视频生成智能体** - 营销视频创作
4. **Listing优化智能体** - 商品信息优化
5. **广告投放智能体** - 广告策略优化
6. **AI客服智能体** - 多语言客服支持
7. **数据复盘智能体** - 数据分析与报告

## 技术栈

- **框架**: FastAPI 0.110+
- **AI框架**: LangGraph 0.0.52+, LangChain 0.1.x
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: SQLAlchemy 2.0+
- **缓存**: Redis 7.x
- **异步**: asyncio, aiosqlite

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # 应用入口
│   ├── constants.py         # 常量定义
│   ├── dependencies.py      # 依赖注入
│   ├── agents/              # AI智能体
│   │   ├── base.py          # 基础智能体类
│   │   ├── product_selection.py
│   │   ├── image_design.py
│   │   ├── video_generation.py
│   │   ├── listing_optimization.py
│   │   ├── advertising.py
│   │   ├── customer_service.py
│   │   └── data_review.py
│   ├── api/                 # API路由
│   │   ├── auth.py          # 认证API
│   │   ├── agents.py        # 智能体API
│   │   ├── ai.py            # AI调用API
│   │   └── ...              # 其他API
│   ├── core/                # 核心模块
│   │   ├── config.py        # 配置管理
│   │   ├── database.py      # 数据库连接
│   │   ├── security.py      # 安全工具
│   │   └── logging.py       # 日志配置
│   ├── exceptions/          # 异常处理
│   ├── middleware/          # 中间件
│   ├── models/              # 数据库模型
│   ├── schemas/             # Pydantic Schema
│   ├── services/            # 业务服务层
│   └── utils/               # 工具函数
├── alembic/                 # 数据库迁移
├── tests/                   # 测试用例
├── scripts/                 # 启动脚本
├── data/                    # 数据库文件
├── logs/                    # 日志文件
├── .env.example             # 环境变量示例
├── alembic.ini              # Alembic配置
├── requirements.txt         # Python依赖
└── Dockerfile               # Docker镜像
```

## 快速开始

### 环境要求

- Python 3.10+
- Redis (可选，用于缓存)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd backend
```

2. **创建虚拟环境**
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置
```

5. **启动服务**
```bash
# 开发环境
./scripts/dev.sh

# 或直接运行
uvicorn app.main:app --reload --port 8000
```

6. **访问文档**
- API文档: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API概览

### 认证模块
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/auth/login` | POST | 用户登录 |
| `/api/v1/auth/register` | POST | 用户注册 |
| `/api/v1/auth/send-sms` | POST | 发送短信验证码 |
| `/api/v1/auth/profile` | GET | 获取用户信息 |

### 智能体模块
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/agents` | GET | 智能体列表 |
| `/api/v1/agents/{id}` | GET | 智能体详情 |
| `/api/v1/ai/invoke` | POST | 调用AI |
| `/api/v1/tasks` | GET | 任务列表 |

### 业务模块
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/v1/products` | GET/POST | 商品管理 |
| `/api/v1/orders` | GET | 订单列表 |
| `/api/v1/tickets` | GET/POST | 工单管理 |
| `/api/v1/reports` | GET | 数据报表 |

## 数据库迁移

```bash
# 生成迁移文件
alembic revision --autogenerate -m "description"

# 执行迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1
```

## 测试

```bash
# 运行所有测试
pytest tests/ -v

# 运行带覆盖率
pytest tests/ -v --cov=app --cov-report=html
```

## Docker部署

```bash
# 构建镜像
docker build -t lobster-ai-backend .

# 运行容器
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  --env-file .env \
  lobster-ai-backend
```

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `APP_NAME` | 应用名称 | 龙虾AI跨境无人店系统 |
| `DEBUG` | 调试模式 | True |
| `DATABASE_URL` | 数据库URL | sqlite+aiosqlite:///./data/lobster_ai.db |
| `REDIS_URL` | Redis URL | redis://localhost:6379/0 |
| `JWT_SECRET_KEY` | JWT密钥 | (需修改) |
| `OPENAI_API_KEY` | OpenAI API Key | - |
| `DOUBAO_API_KEY` | 豆包 API Key | - |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | - |
| `ADMIN_PHONE` | 管理员手机号 | 13800138000 |
| `ADMIN_PASSWORD` | 管理员密码 | admin123 |

## 开发指南

### 代码规范
- 遵循 PEP 8 编码规范
- 使用类型注解
- 编写单元测试

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- refactor: 重构
- test: 测试相关

## License

MIT License

## 联系方式

- 项目地址: [GitHub](https://github.com/your-repo)
- 问题反馈: [Issues](https://github.com/your-repo/issues)
