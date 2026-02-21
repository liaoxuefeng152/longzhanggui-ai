# 🎯 Cursor 部署提示词 - 本地 Docker 部署阿峰跨境AI中台

---

## 📋 项目背景

这是一个基于 Next.js 16 + TypeScript + Docker 的跨境电商AI中台项目，包含智能体、模型调用、Prompt管理等核心功能。

### 技术栈

- **前端框架**：Next.js 16 (App Router)
- **语言**：TypeScript 5
- **UI 组件**：shadcn/ui
- **样式**：Tailwind CSS 4
- **容器化**：Docker + Docker Compose
- **LLM 集成**：coze-coding-dev-sdk

### 项目结构

```
afeng-ai-platform/
├── Dockerfile              # Docker 镜像构建配置
├── docker-compose.yml      # Docker Compose 配置
├── .dockerignore          # Docker 构建忽略文件
├── nginx.conf             # Nginx 反向代理配置
├── deploy.sh              # 部署脚本
├── next.config.ts         # Next.js 配置
├── package.json           # 依赖配置
├── src/
│   ├── app/               # Next.js 页面
│   │   ├── api/          # API Routes
│   │   ├── dashboard/    # 控制台
│   │   ├── login/        # 登录页
│   │   ├── models/       # 模型路由
│   │   ├── prompts/      # Prompt中心
│   │   ├── agents/       # 智能体工厂
│   │   ├── users/        # 用户管理
│   │   ├── orders/       # 订单套餐
│   │   └── settings/     # 系统设置
│   ├── components/       # 组件
│   └── types/           # 类型定义
└── docs/
    ├── aliyun-deployment.md  # 阿里云部署指南
    ├── quick-start.md       # 快速开始指南
    └── docker-config.md     # Docker 配置说明
```

---

## 🚀 需要完成的任务

### 任务 1：检查 Docker 环境

请帮我检查本地 Docker 环境：

```bash
# 检查 Docker 是否安装
docker --version

# 检查 Docker 是否运行
docker ps

# 检查 Docker 版本
docker info | grep "Server Version"
```

**预期结果**：
- Docker 版本 >= 24.0
- Docker 服务正在运行

---

### 任务 2：进入项目目录

```bash
# 进入项目目录
cd afeng-ai-platform

# 确认当前目录
pwd
```

---

### 任务 3：检查项目文件

请确认以下文件是否存在：

```bash
# 检查关键文件
ls -la Dockerfile
ls -la docker-compose.yml
ls -la package.json
ls -la next.config.ts
```

**预期结果**：所有文件都应该存在。

---

### 任务 4：构建 Docker 镜像

```bash
# 构建镜像
docker build -t afeng-ai-platform:latest .
```

**注意事项**：
- ✅ 构建过程可能需要 3-5 分钟，请耐心等待
- ✅ 如果遇到网络问题，可以配置 Docker 镜像加速
- ✅ 如果构建失败，请查看错误信息并尝试重新构建

**预期输出**：
```
[+] Building 245.3s (15/15) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 2.58kB
 => [internal] load .dockerignore
 => => transferring context: 1.03kB
 ...
 => => naming to docker.io/library/afeng-ai-platform:latest
```

---

### 任务 5：运行 Docker 容器

请选择以下一种方式运行：

#### 方式 A：直接运行（推荐新手）

```bash
docker run -d \
  --name afeng-ai-platform \
  --restart unless-stopped \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  afeng-ai-platform:latest
```

#### 方式 B：使用 Docker Compose（推荐生产环境）

```bash
# 启动所有服务（应用 + Nginx）
docker-compose up -d

# 查看服务状态
docker-compose ps
```

**预期结果**：
- 容器成功启动
- 状态为 `Up` 或 `healthy`

---

### 任务 6：检查容器状态

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a
```

**预期输出**：
```
CONTAINER ID   IMAGE                           COMMAND                  CREATED         STATUS         PORTS                    NAMES
abc123def456   afeng-ai-platform:latest   "node server.js"        10 seconds ago  Up 8 seconds   0.0.0.0:5000->5000/tcp   afeng-ai-platform
```

---

### 任务 7：查看启动日志

```bash
# 方式 A：查看容器日志
docker logs -f afeng-ai-platform

# 方式 B：查看 Docker Compose 日志
docker-compose logs -f
```

**预期输出**：
```
✓ Starting HTTP service on port 5000 for dev...
✓ Ready in 3.5s
○ Local:        http://localhost:5000
```

看到 `✓ Ready` 说明启动成功！

---

### 任务 8：访问应用

打开浏览器，访问以下地址：

```
http://localhost:5000
```

**预期结果**：
- 能看到登录页面
- 页面正常加载，无错误

---

### 任务 9：登录测试

使用以下信息登录：

- **手机号**：任意（如：13812345678）
- **验证码**：123456
- **角色选择**：
  - 选择「普通用户（卖家）」或
  - 选择「管理员（阿峰）」

**预期结果**：
- 登录成功
- 自动跳转到控制台 Dashboard
- 能看到数据统计图表

---

## 🔧 常见问题处理

### 问题 1：Docker 未安装

**错误信息**：
```
bash: docker: command not found
```

**解决方案**：

1. 访问 https://docs.docker.com/get-docker/
2. 下载并安装 Docker Desktop
3. 重启终端
4. 重新运行部署命令

**安装命令（macOS）**：
```bash
# 使用 Homebrew 安装
brew install --cask docker

# 或下载安装包
# https://desktop.docker.com/mac/main/amd64/Docker.dmg
```

**安装命令（Windows）**：
```
# 下载安装包
https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
```

---

### 问题 2：端口 5000 被占用

**错误信息**：
```
Error starting userland proxy: listen tcp 0.0.0.0:5000: bind: address already in use
```

**解决方案**：

#### 步骤 1：查看占用进程

```bash
# macOS/Linux
lsof -i :5000

# Windows
netstat -ano | findstr :5000
```

#### 步骤 2：停止占用进程

```bash
# macOS/Linux
kill -9 <进程ID>

# Windows
taskkill /PID <进程ID> /F
```

#### 步骤 3：使用其他端口

```bash
# 使用端口 3000
docker run -d \
  --name afeng-ai-platform \
  -p 3000:5000 \
  afeng-ai-platform:latest

# 访问 http://localhost:3000
```

---

### 问题 3：镜像构建失败

**错误示例**：
```
ERROR [builder 3/5] RUN pnpm install --frozen-lockfile
Error: Failed to download package
```

**解决方案**：

#### 步骤 1：清理 Docker 缓存

```bash
docker system prune -a
```

#### 步骤 2：重新构建

```bash
docker build --no-cache -t afeng-ai-platform:latest .
```

#### 步骤 3：配置 Docker 镜像加速（中国大陆）

```bash
# 编辑 Docker 配置
# macOS: Docker Desktop > Settings > Docker Engine
# Windows: Docker Desktop > Settings > Docker Engine

# 添加以下配置
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.ccs.tencentyun.com"
  ]
}

# 重启 Docker
```

---

### 问题 4：容器启动失败

**错误示例**：
```
Error: Cannot start service afeng-ai-platform: OCI runtime create failed
```

**解决方案**：

#### 步骤 1：查看容器日志

```bash
docker logs afeng-ai-platform
```

#### 步骤 2：查看容器状态

```bash
docker ps -a
docker inspect afeng-ai-platform
```

#### 步骤 3：检查配置

```bash
# 检查端口是否被占用
lsof -i :5000

# 检查磁盘空间
df -h

# 检查 Docker 状态
docker info
```

#### 步骤 4：重新启动

```bash
# 停止并删除容器
docker stop afeng-ai-platform
docker rm afeng-ai-platform

# 重新运行
docker run -d \
  --name afeng-ai-platform \
  -p 5000:5000 \
  afeng-ai-platform:latest
```

---

### 问题 5：无法访问应用

**症状**：
- 浏览器访问 http://localhost:5000 失败
- 提示 "This site can't be reached" 或 "连接被拒绝"

**解决方案**：

#### 步骤 1：检查容器是否运行

```bash
docker ps
```

#### 步骤 2：检查端口映射

```bash
docker port afeng-ai-platform
```

**预期输出**：
```
5000/tcp -> 0.0.0.0:5000
```

#### 步骤 3：测试容器内部

```bash
# 进入容器
docker exec -it afeng-ai-platform sh

# 测试内部服务
curl http://localhost:5000

# 退出容器
exit
```

#### 步骤 4：检查防火墙

**macOS**：
```
系统偏好设置 → 安全性与隐私 → 防火墙 → 防火墙选项
```

**Windows**：
```
控制面板 → Windows Defender 防火墙 → 允许应用通过防火墙
```

#### 步骤 5：尝试其他浏览器

- Chrome
- Firefox
- Safari
- Edge

---

## 📊 验证部署成功

部署成功后，应该能够完成以下测试：

### ✅ 测试 1：访问应用

- 打开浏览器
- 访问 http://localhost:5000
- 能看到登录页面

### ✅ 测试 2：登录功能

- 输入手机号：13812345678
- 输入验证码：123456
- 选择角色：普通用户（卖家）
- 点击登录
- 成功跳转到控制台

### ✅ 测试 3：控制台功能

- 能看到数据卡片（今日调用、在线用户、今日订单、推广裂变）
- 能看到趋势图
- 能看到最新用户列表

### ✅ 测试 4：客服智能体

- 点击左侧菜单「智能体工厂」→「客服智能体」
- 选择语言：印尼语
- 输入用户咨询：我想了解这款产品的价格
- 点击「生成回复」
- 能看到 AI 生成的回复

### ✅ 测试 5：自推广智能体

- 点击左侧菜单「智能体工厂」→「自推广智能体」
- 选择素材类型：推广文案
- 输入场景描述：用客服智能体一天回复了1000+条询盘
- 点击「生成素材」
- 能看到生成的推广文案

### ✅ 测试 6：模型路由

- 点击左侧菜单「模型路由」
- 能看到模型列表
- 能看到调用日志

### ✅ 测试 7：查看日志

```bash
# 查看容器日志
docker logs -f afeng-ai-platform

# 确认无严重错误
# 应该看到类似 "✓ Ready" 的成功信息
```

---

## 🎯 预期结果

完成所有任务后，应该实现：

1. ✅ Docker 环境正常
2. ✅ Docker 镜像构建成功
3. ✅ Docker 容器正常运行
4. ✅ 应用可通过 http://localhost:5000 访问
5. ✅ 登录功能正常
6. ✅ 控制台数据显示正常
7. ✅ 客服智能体功能正常
8. ✅ 自推广智能体功能正常
9. ✅ 无严重错误日志
10. ✅ 所有核心页面可正常访问

---

## 📝 重要提示

### ⚠️ 注意事项

1. **必须使用 Docker 部署**
   - 不要使用 `pnpm dev`
   - 不要使用 `npm start`
   - 必须使用 Docker 容器运行

2. **端口配置**
   - 默认端口：5000
   - 确保端口 5000 未被占用
   - 如被占用，可使用其他端口（如 3000）

3. **构建时间**
   - 首次构建需要 3-5 分钟
   - 请耐心等待，不要中断
   - 构建过程需要下载依赖

4. **日志监控**
   - 启动后查看日志确认成功
   - 看到 `✓ Ready` 才算启动成功
   - 如果有错误，根据错误信息修复

5. **首次访问**
   - 可能需要等待 10-15 秒初始化
   - 如果立即访问失败，请稍等片刻
   - 容器启动需要时间

### 🔐 安全提示

- 默认使用模拟验证码：123456
- 生产环境请配置真实验证码
- 建议配置 HTTPS（详见 docs/aliyun-deployment.md）
- 建议配置环境变量（参考 .env.example）

---

## 🔄 常用命令

### Docker 基本命令

```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 查看容器日志
docker logs -f afeng-ai-platform

# 停止容器
docker stop afeng-ai-platform

# 启动容器
docker start afeng-ai-platform

# 重启容器
docker restart afeng-ai-platform

# 删除容器
docker rm afeng-ai-platform

# 删除镜像
docker rmi afeng-ai-platform:latest

# 查看容器资源占用
docker stats afeng-ai-platform

# 进入容器
docker exec -it afeng-ai-platform sh
```

### Docker Compose 命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重新构建并启动
docker-compose up -d --build
```

---

## 🎯 部署流程总结

```bash
# 完整部署流程（一键执行）

# 1. 检查 Docker
docker --version
docker ps

# 2. 进入项目目录
cd afeng-ai-platform

# 3. 构建镜像
docker build -t afeng-ai-platform:latest .

# 4. 运行容器
docker run -d \
  --name afeng-ai-platform \
  --restart unless-stopped \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  afeng-ai-platform:latest

# 5. 检查状态
docker ps

# 6. 查看日志
docker logs -f afeng-ai-platform

# 7. 访问应用
# 浏览器打开 http://localhost:5000

# 8. 登录测试
# 手机号：13812345678
# 验证码：123456
```

---

## 📞 获取帮助

如果遇到问题：

1. **查看日志**：`docker logs -f afeng-ai-platform`
2. **检查文档**：
   - [快速开始指南](docs/quick-start.md)
   - [Docker 配置说明](docs/docker-config.md)
   - [阿里云部署指南](docs/aliyun-deployment.md)
3. **检查环境**：
   ```bash
   docker info
   docker ps
   df -h
   ```

---

## 🎉 开始执行

现在请按照以上步骤，帮我完成本地 Docker 部署！

### 执行要求：

1. **逐步执行**：按照任务顺序，逐步执行每个步骤
2. **汇报结果**：每完成一个步骤，告诉我执行结果
3. **错误处理**：如果遇到错误，请：
   - 告诉我错误的具体信息
   - 尝试根据文档中的解决方案修复
   - 如果无法解决，告诉我具体情况
4. **最终确认**：完成所有步骤后，确认：
   - 容器是否正常运行
   - 应用是否可以访问
   - 功能是否正常工作

---

**准备好了吗？开始吧！** 🚀

---

**文档版本**：v1.0
**最后更新**：2026-02-20
**适用项目**：阿峰跨境AI中台 v1.0
