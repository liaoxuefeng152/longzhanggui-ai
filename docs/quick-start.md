# 🚀 快速开始指南

本指南帮助你在 5 分钟内启动阿峰跨境AI中台。

---

## 📋 前置要求

- ✅ Node.js >= 18
- ✅ pnpm >= 9
- ✅ Docker（可选，用于生产部署）

---

## 🎯 方式一：本地开发（推荐新手）

### 第 1 步：安装依赖

```bash
# 进入项目目录
cd afeng-ai-platform

# 安装依赖
pnpm install
```

### 第 2 步：启动开发服务器

```bash
# 启动开发服务器
pnpm dev
```

### 第 3 步：访问应用

打开浏览器访问：**http://localhost:5000**

### 第 4 步：登录

- **手机号**：任意（如：13812345678）
- **验证码**：123456
- **角色**：选择「普通用户（卖家）」或「管理员（阿峰）」

### 第 5 步：探索功能

登录后，你可以：
- 查看控制台 Dashboard
- 测试客服智能体对话
- 生成推广素材
- 管理用户和订单

---

## 🐳 方式二：Docker 部署（推荐生产）

### 第 1 步：构建镜像

```bash
# 构建镜像
docker build -t afeng-ai-platform:latest .
```

### 第 2 步：运行容器

```bash
# 运行容器
docker run -d \
  --name afeng-ai-platform \
  --restart unless-stopped \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  afeng-ai-platform:latest
```

### 第 3 步：访问应用

打开浏览器访问：**http://localhost:5000**

---

## 🔄 方式三：Docker Compose（完整部署）

### 第 1 步：启动服务

```bash
# 启动所有服务（包含 Nginx）
docker-compose up -d
```

### 第 2 步：访问应用

- **应用**：http://localhost:5000
- **Nginx**：http://localhost:80

### 第 3 步：查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app
docker-compose logs -f nginx
```

---

## 🛠️ 常用命令

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# TypeScript 类型检查
pnpm ts-check

# 代码检查
pnpm lint
```

### Docker

```bash
# 构建镜像
docker build -t afeng-ai-platform:latest .

# 运行容器
docker run -d -p 5000:5000 afeng-ai-platform:latest

# 查看容器状态
docker ps

# 查看日志
docker logs -f afeng-ai-platform

# 停止容器
docker stop afeng-ai-platform

# 删除容器
docker rm afeng-ai-platform

# 删除镜像
docker rmi afeng-ai-platform:latest
```

### Docker Compose

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

---

## 📱 功能测试

### 1. 测试客服智能体

1. 登录后，点击左侧菜单「智能体工厂」→「客服智能体」
2. 选择语言（如：印尼语）
3. 输入用户咨询（如：我想了解这款产品的价格）
4. 点击「生成回复」
5. 查看AI生成的回复

### 2. 测试自推广智能体

1. 点击左侧菜单「智能体工厂」→「自推广智能体」
2. 选择素材类型（如：推广文案）
3. 输入场景描述（如：用客服智能体一天回复了1000+条询盘）
4. 点击「生成素材」
5. 查看生成的推广文案

### 3. 查看模型调用日志

1. 点击左侧菜单「模型路由」
2. 查看「模型管理」和「调用日志」
3. 可以看到模型调用记录和Token消耗

---

## 🚨 常见问题

### 问题 1：端口 5000 被占用

**解决方案：**

```bash
# 修改端口
# 编辑 scripts/dev.sh
PORT=3000  # 改为其他端口

# 或使用 Docker 时修改映射端口
docker run -d -p 3000:5000 afeng-ai-platform:latest
```

### 问题 2：pnpm 命令不存在

**解决方案：**

```bash
# 安装 pnpm
npm install -g pnpm@9

# 或使用 corepack
corepack enable
corepack prepare pnpm@9 --activate
```

### 问题 3：依赖安装失败

**解决方案：**

```bash
# 清除缓存
rm -rf node_modules .pnpm-store

# 重新安装
pnpm install

# 使用镜像源（中国大陆）
pnpm config set registry https://registry.npmmirror.com
pnpm install
```

### 问题 4：Docker 构建失败

**解决方案：**

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker build --no-cache -t afeng-ai-platform:latest .
```

### 问题 5：容器启动失败

**解决方案：**

```bash
# 查看容器日志
docker logs afeng-ai-platform

# 检查端口是否被占用
netstat -tuln | grep 5000

# 停止并删除容器
docker stop afeng-ai-platform
docker rm afeng-ai-platform

# 重新启动
docker run -d -p 5000:5000 afeng-ai-platform:latest
```

---

## 📚 下一步

- 📖 查看 [阿里云部署指南](docs/aliyun-deployment.md)
- 🔧 配置 [环境变量](.env.example)
- 🎨 自定义 [主题颜色](src/app/globals.css)
- 🔌 集成 [真实数据库](https://drizzle.dev/)
- 🌐 配置 [HTTPS 证书](docs/aliyun-deployment.md#配置-https-可选)

---

## 🆘 获取帮助

遇到问题？

1. 查看 [常见问题](docs/aliyun-deployment.md#常见问题)
2. 查看 [Docker 文档](https://docs.docker.com/)
3. 查看 [Next.js 文档](https://nextjs.org/docs)
4. 提交 [Issue](https://github.com/your-repo/issues)

---

**祝使用愉快！🎉**
