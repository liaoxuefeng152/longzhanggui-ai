# 📝 Docker 部署配置说明

本文档说明项目中 Docker 相关文件的用途和配置。

---

## 📁 文件说明

| 文件 | 说明 |
|------|------|
| `Dockerfile` | Docker 镜像构建配置，使用多阶段构建优化镜像大小 |
| `docker-compose.yml` | Docker Compose 配置，包含应用和 Nginx 服务 |
| `.dockerignore` | Docker 构建时忽略的文件和目录 |
| `nginx.conf` | Nginx 反向代理配置 |
| `deploy.sh` | Docker 部署自动化脚本 |

---

## 🐳 Dockerfile 详解

### 多阶段构建

项目使用 3 阶段构建：

1. **deps 阶段**：安装依赖
2. **builder 阶段**：构建 Next.js 应用
3. **runner 阶段**：运行时镜像（最小化）

### 优势

- ✅ 镜像体积小（仅包含运行时必需文件）
- ✅ 构建速度快（依赖缓存）
- ✅ 安全性高（不包含构建工具）

### 镜像大小

```bash
# 查看镜像大小
docker images | grep afeng-ai-platform
```

预期大小：**约 200-300 MB**

---

## 🌐 Docker Compose 配置

### 服务架构

```
┌─────────────┐
│   Nginx     │ ← 端口 80/443
│  (反向代理)  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Next.js    │ ← 端口 5000
│   应用      │
└─────────────┘
```

### 服务说明

| 服务 | 容器名 | 端口 | 说明 |
|------|--------|------|------|
| app | afeng-ai-platform | 5000 | Next.js 应用 |
| nginx | afeng-nginx | 80, 443 | Nginx 反向代理 |

### 网络配置

```yaml
networks:
  afeng-network:
    driver: bridge
```

服务之间通过 `afeng-network` 网络通信。

---

## 🔧 Nginx 配置

### 功能

- ✅ 反向代理
- ✅ Gzip 压缩
- ✅ 静态文件缓存
- ✅ HTTPS 支持（需配置证书）

### 配置位置

```nginx
# 反向代理到 Next.js 应用
location / {
    proxy_pass http://app:5000;
    # ... 其他配置
}
```

---

## 🚀 部署脚本使用

### 交互式菜单

```bash
./deploy.sh
```

选择对应操作：
1. 构建镜像
2. 运行容器（仅应用）
3. 使用 Docker Compose 启动（含 Nginx）
4. 查看日志
5. 停止服务
6. 清理镜像

### 快速命令

```bash
# 构建镜像
./deploy.sh  # 选择 1

# 启动服务
./deploy.sh  # 选择 2 或 3

# 查看日志
./deploy.sh  # 选择 4
```

---

## 🎯 推荐部署流程

### 开发环境

```bash
# 使用 Docker Compose（包含 Nginx）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境

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

# 3. 检查状态
docker ps

# 4. 查看日志
docker logs -f afeng-ai-platform
```

---

## 🔍 故障排查

### 镜像构建失败

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker build --no-cache -t afeng-ai-platform:latest .
```

### 容器启动失败

```bash
# 查看容器日志
docker logs afeng-ai-platform

# 检查端口占用
netstat -tuln | grep 5000

# 进入容器调试
docker exec -it afeng-ai-platform sh
```

### Nginx 无法访问应用

```bash
# 检查网络连接
docker exec -it afeng-nginx ping app

# 查看 Nginx 日志
docker logs afeng-nginx

# 测试 Nginx 配置
docker exec -it afeng-nginx nginx -t
```

---

## 📊 性能优化

### 1. 使用镜像加速

```dockerfile
# Dockerfile
FROM node:24-alpine

# 使用阿里云镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
```

### 2. 多阶段构建

项目已使用多阶段构建，无需额外配置。

### 3. 镜像压缩

```bash
# 使用 docker-slim 工具
docker-slim build --http-probe afeng-ai-platform:latest
```

---

## 🔒 安全建议

1. **使用非 root 用户**：Dockerfile 已配置
2. **扫描镜像漏洞**：
   ```bash
   docker scan afeng-ai-platform:latest
   ```
3. **限制容器权限**：
   ```bash
   docker run --read-only --tmpfs /tmp afeng-ai-platform:latest
   ```
4. **使用私有镜像仓库**：推送到阿里云 ACR

---

## 📚 参考资料

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 文档](https://nginx.org/en/docs/)
- [Next.js Docker 部署](https://nextjs.org/docs/deployment#docker-image)

---

**最后更新**：2026-02-20
