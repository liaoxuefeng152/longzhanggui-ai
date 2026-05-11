# 阿峰｜跨境AI中台 - Docker 部署已完成！ 🎉

## ✅ 已添加的 Docker 配置

我已经为项目添加了完整的 Docker 配置，方便你部署到阿里云服务器。

### 📁 新增文件

| 文件 | 说明 |
|------|------|
| **Dockerfile** | 多阶段构建配置，优化镜像大小 |
| **docker-compose.yml** | Docker Compose 配置（应用 + Nginx） |
| **.dockerignore** | 构建时忽略的文件 |
| **nginx.conf** | Nginx 反向代理配置 |
| **deploy.sh** | 一键部署脚本（已添加执行权限） |
| **.env.example** | 环境变量模板 |

### 📖 新增文档

| 文档 | 说明 |
|------|------|
| **docs/aliyun-deployment.md** | 详细的阿里云部署指南 |
| **docs/quick-start.md** | 快速开始指南 |
| **docs/docker-config.md** | Docker 配置说明 |

---

## 🚀 三种部署方式

### 方式 1：Docker 直接部署（简单快速）

```bash
# 1. 构建镜像
docker build -t afeng-ai-platform:latest .

# 2. 运行容器
docker run -d \
  --name afeng-ai-platform \
  --restart unless-stopped \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  afeng-ai-platform:latest

# 3. 访问应用
# http://your-server-ip:5000
```

### 方式 2：Docker Compose 部署（推荐生产）

```bash
# 1. 启动所有服务（包含 Nginx）
docker-compose up -d

# 2. 查看日志
docker-compose logs -f

# 3. 访问应用
# http://your-server-ip (Nginx 反向代理)
# http://your-server-ip:5000 (直接访问)
```

### 方式 3：使用部署脚本（交互式）

```bash
# 运行部署脚本
./deploy.sh

# 选择对应操作：
# 1. 构建镜像
# 2. 运行容器（仅应用）
# 3. 使用 Docker Compose 启动（含 Nginx）
# 4. 查看日志
# 5. 停止服务
# 6. 清理镜像
```

---

## 🌐 阿里云部署步骤

### 1. 连接到 ECS 服务器

```bash
ssh root@your-ecs-ip
```

### 2. 安装 Docker

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl start docker
systemctl enable docker
```

### 3. 上传项目文件

```bash
# 在本地打包
tar -czf afeng-ai-platform.tar.gz --exclude='node_modules' --exclude='.next' .

# 上传到服务器
scp afeng-ai-platform.tar.gz root@your-ecs-ip:/root/

# 解压
cd /root
tar -xzf afeng-ai-platform.tar.gz
cd afeng-ai-platform
```

### 4. 启动应用

```bash
# 方式 1：使用部署脚本
chmod +x deploy.sh
./deploy.sh

# 方式 2：使用 Docker Compose
docker-compose up -d

# 方式 3：直接使用 Docker
docker build -t afeng-ai-platform:latest .
docker run -d --name afeng-ai-platform --restart unless-stopped -p 5000:5000 afeng-ai-platform:latest
```

### 5. 配置安全组

在阿里云控制台：
1. 进入「云服务器 ECS」→「实例」
2. 选择实例 →「安全组」→「配置规则」
3. 添加入方向规则：
   - 端口范围：5000/5000
   - 授权对象：0.0.0.0/0

### 6. 访问应用

```
http://your-ecs-ip:5000
```

---

## 🎯 为什么选择 Docker？

### ✅ 优势

1. **环境一致性**
   - 开发、测试、生产环境完全一致
   - 避免环境依赖问题

2. **部署简单**
   - 一条命令启动应用
   - 易于迁移和扩展

3. **资源隔离**
   - 容器级别隔离
   - 安全性更高

4. **版本管理**
   - 镜像版本化管理
   - 易于回滚

5. **阿里云集成**
   - 完美支持 ECS、ACK、ECI
   - 阿里云镜像服务（ACR）

### 📊 部署方式对比

| 部署方式 | Docker 部署 | 传统部署 |
|---------|-------------|----------|
| **环境配置** | ✅ 自动化 | ❌ 手动配置 |
| **部署时间** | ⭐⭐⭐⭐⭐ 快 | ⭐⭐ 慢 |
| **扩展性** | ⭐⭐⭐⭐⭐ 强 | ⭐⭐ 弱 |
| **一致性** | ⭐⭐⭐⭐⭐ 高 | ⭐⭐ 低 |
| **回滚** | ⭐⭐⭐⭐⭐ 易 | ⭐⭐ 难 |

---

## 📚 详细文档

1. **[阿里云部署指南](docs/aliyun-deployment.md)**
   - ECS 部署
   - ACK 容器服务部署
   - ECI 弹性容器实例部署
   - HTTPS 配置
   - 监控与日志

2. **[快速开始指南](docs/quick-start.md)**
   - 本地开发
   - Docker 部署
   - 功能测试
   - 常见问题

3. **[Docker 配置说明](docs/docker-config.md)**
   - Dockerfile 详解
   - Docker Compose 配置
   - Nginx 配置
   - 性能优化

---

## 🔧 pnpm 命令（已更新）

```bash
# Docker 相关命令
pnpm docker:build      # 构建镜像
pnpm docker:run        # 运行容器
pnpm docker:logs       # 查看日志
pnpm docker:stop       # 停止容器
pnpm docker:rm         # 删除容器
pnpm docker:compose:up # 启动 Docker Compose
pnpm docker:compose:down # 停止 Docker Compose
```

---

## 🎉 总结

现在你的项目已经完全支持 Docker 部署，可以轻松部署到：

✅ **阿里云 ECS**（传统服务器）  
✅ **阿里云 ACK**（容器服务）  
✅ **阿里云 ECI**（弹性容器实例）  
✅ **任何支持 Docker 的服务器**

### 🚀 快速开始

```bash
# 选择一种方式启动

# 方式 1：本地开发
pnpm dev

# 方式 2：Docker 部署
docker-compose up -d

# 方式 3：部署脚本
./deploy.sh
```

### 📞 需要帮助？

查看详细文档或联系技术支持！

---

**祝部署顺利！🎊**
